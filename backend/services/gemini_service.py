"""
Gemini AI Service — builds structured prompts and generates travel itineraries.
Uses direct HTTP requests to Gemini REST API (no SDK dependency).
"""

import json
import requests
from config import Config

# Gemini API endpoint
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"


def _call_gemini(prompt: str) -> dict:
    """Make a direct HTTP request to Gemini API."""
    if not Config.GEMINI_API_KEY:
        return {"success": False, "error": "Gemini API key not configured. Add GEMINI_API_KEY to .env"}

    headers = {"Content-Type": "application/json"}
    params = {"key": Config.GEMINI_API_KEY}
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.7,
            "topP": 0.95,
            "maxOutputTokens": 8192,
        }
    }

    try:
        response = requests.post(GEMINI_API_URL, headers=headers, params=params, json=payload, timeout=60)

        if response.status_code == 429:
            return {"success": False, "error": "Gemini API quota exceeded. Please wait a minute and try again, or upgrade your API plan."}

        if response.status_code != 200:
            error_msg = response.json().get("error", {}).get("message", f"API error {response.status_code}")
            return {"success": False, "error": f"Gemini API error: {error_msg}"}

        data = response.json()
        text = data["candidates"][0]["content"]["parts"][0]["text"].strip()

        # Clean markdown code fences if present
        if text.startswith("```"):
            lines = text.split("\n")
            text = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])

        return {"success": True, "text": text}

    except requests.exceptions.Timeout:
        return {"success": False, "error": "Gemini API timeout. Please try again."}
    except Exception as e:
        return {"success": False, "error": f"AI service error: {str(e)}"}


def generate_itinerary(form_data: dict, destination_info: dict = None) -> dict:
    """
    Generate a day-wise travel itinerary using Gemini AI.

    Args:
        form_data: User's travel preferences (budget, type, duration, etc.)
        destination_info: Optional destination details from MongoDB

    Returns:
        Structured JSON itinerary
    """
    # Build the destination context
    dest_context = ""
    if destination_info:
        dest_context = f"""
Destination Details:
- Name: {destination_info.get('name', 'Unknown')}
- City: {destination_info.get('city', '')}
- Country: {destination_info.get('country', '')}
- Description: {destination_info.get('description', '')}
- Budget Range: ₹{destination_info.get('budget_min', 0)} - ₹{destination_info.get('budget_max', 0)}
- Best Season: {destination_info.get('best_season', '')}
- Nearby Hotels: {', '.join(destination_info.get('nearby_hotels', []))}
- Nearby Attractions: {', '.join(destination_info.get('nearby_attractions', []))}
- Travel Tips: {'; '.join(destination_info.get('travel_tips', []))}
- Tags: {', '.join(destination_info.get('tags', []))}
"""

    # Build family context
    family_info = ""
    if form_data.get("travel_type") == "family":
        family_info = f"""
Family Details:
- Total Members: {form_data.get('members', 2)}
- Children: {form_data.get('children', 0)}
"""

    prompt = f"""You are an expert travel planner AI. Generate a detailed day-wise travel itinerary based on the following preferences.

Travel Preferences:
- Budget: ₹{form_data.get('budget', 50000)} (total for the trip in INR)
- Travel Type: {form_data.get('travel_type', 'solo')}
{family_info}
- Duration: {form_data.get('duration', 3)} days
- Interests: {', '.join(form_data.get('interests', ['general']))}
- Transport Preference: {form_data.get('transport', 'any')}
- Stay Preference: {form_data.get('stay', 'hotel')}
- Food Preference: {form_data.get('food', 'any')}
{dest_context}

IMPORTANT: You MUST respond with ONLY valid JSON in exactly this format:
{{
  "destination_name": "string - the destination name",
  "destination_city": "string - the city",
  "destination_country": "string - the country",
  "trip_summary": "string - brief 2-3 sentence overview of the trip",
  "total_estimated_cost": number,
  "currency": "INR",
  "budget_status": "within_budget | slightly_over | over_budget",
  "budget_warning": "string - warning message if over budget, empty otherwise",
  "seasonal_alert": "string - any seasonal warning (monsoon, heatwave, etc.) or empty",
  "days": [
    {{
      "day": 1,
      "title": "string - day theme title",
      "activities": [
        {{
          "time": "9:00 AM",
          "activity": "string - what to do",
          "description": "string - brief description",
          "location": "string - specific place name",
          "estimated_cost": number,
          "tips": "string - helpful tip"
        }}
      ],
      "meals": [
        {{
          "type": "breakfast | lunch | dinner",
          "suggestion": "string - restaurant or food type",
          "estimated_cost": number
        }}
      ],
      "accommodation": {{
        "type": "string - hotel type",
        "suggestion": "string - name or area",
        "estimated_cost": number
      }},
      "transport": {{
        "mode": "string - transport mode",
        "details": "string - route details",
        "estimated_cost": number
      }},
      "daily_total": number
    }}
  ],
  "must_visit_places": ["string - top places to visit"],
  "food_suggestions": ["string - local foods to try"],
  "safety_tips": ["string - safety advice"],
  "packing_suggestions": ["string - what to pack"],
  "best_time_to_visit": "string"
}}

{"If no destination was specified, suggest the best destination based on the user's preferences and budget." if not destination_info else "Use the provided destination information."}

Generate a detailed, realistic, and practical itinerary. Ensure costs are realistic and within the user's budget when possible. Include local experiences and hidden gems."""

    result = _call_gemini(prompt)
    if not result.get("success"):
        return result

    try:
        itinerary = json.loads(result["text"])
        return {"success": True, "itinerary": itinerary}
    except json.JSONDecodeError as e:
        return {"success": False, "error": f"Failed to parse AI response: {str(e)}"}


def suggest_destination(form_data: dict) -> dict:
    """
    Ask Gemini to suggest a destination based on user preferences.
    Used when user skips destination selection.
    """
    prompt = f"""Based on these travel preferences, suggest the TOP 3 best destinations:
- Budget: ₹{form_data.get('budget', 50000)}
- Travel Type: {form_data.get('travel_type', 'solo')}
- Duration: {form_data.get('duration', 3)} days
- Interests: {', '.join(form_data.get('interests', ['general']))}

Respond with ONLY valid JSON:
{{
  "suggestions": [
    {{
      "name": "string",
      "city": "string",
      "country": "string",
      "reason": "string - why this is a great match",
      "estimated_budget": number
    }}
  ]
}}"""

    result = _call_gemini(prompt)
    if not result.get("success"):
        return result

    try:
        return {"success": True, "data": json.loads(result["text"])}
    except json.JSONDecodeError:
        return {"success": False, "error": "Failed to parse AI suggestion"}
