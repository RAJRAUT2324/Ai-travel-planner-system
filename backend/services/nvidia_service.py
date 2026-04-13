"""
NVIDIA NIM AI Service — builds structured prompts and generates travel itineraries.
Uses direct HTTP requests to NVIDIA NIM API (standard OpenAI-compatible endpoint).
"""

import json
import requests
import re
from config import Config

# NVIDIA NIM API endpoint
NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions"
# Model to use
MODEL_NAME = "meta/llama-3.1-70b-instruct"

# Groq API endpoint
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.1-8b-instant"

def _call_groq(prompt: str) -> dict:
    """Make a direct HTTP request to Groq API (Fallback)."""
    if not Config.GROQ_API_KEY:
        return {"success": False, "error": "Groq key missing."}

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {Config.GROQ_API_KEY}"
    }
    
    payload = {
        "model": GROQ_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.2,
        "max_tokens": 4096,
    }

    try:
        response = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=120)
        if response.status_code != 200:
            return {"success": False, "error": f"Groq API error: {response.status_code}"}

        data = response.json()
        text = data["choices"][0]["message"]["content"].strip()
        return {"success": True, "text": text}
    except Exception as e:
        return {"success": False, "error": f"Groq service error: {str(e)}"}

def _repair_json(text: str) -> str:
    """Attempt to fix common JSON errors from LLMs (trailing commas, etc)."""
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        if lines[0].strip().startswith("```") and lines[-1].strip() == "```":
            text = "\n".join(lines[1:-1]).strip()
        elif lines[0].strip().startswith("```"):
            text = "\n".join(lines[1:]).strip()
    text = re.sub(r',\s*([\]}])', r'\1', text)
    start = text.find('{')
    end = text.rfind('}')
    if start != -1 and end != -1:
        return text[start:end+1]
    return text

def _call_nvidia(prompt: str) -> dict:
    """Make a direct HTTP request to NVIDIA NIM API."""
    if not Config.NVIDIA_API_KEY:
        return {"success": False, "error": "NVIDIA API key not configured. Add NVIDIA_API_KEY to .env"}

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {Config.NVIDIA_API_KEY}"
    }
    
    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.2,
        "top_p": 0.7,
        "max_tokens": 4096,
    }

    try:
        response = requests.post(NVIDIA_API_URL, headers=headers, json=payload, timeout=180)

        if response.status_code == 429:
            return {"success": False, "error": "NVIDIA API quota exceeded. Please wait a minute and try again."}

        if response.status_code != 200:
            try:
                error_data = response.json()
                error_msg = error_data.get("error", {}).get("message", f"API error {response.status_code}")
            except:
                error_msg = f"API error {response.status_code}"
            return {"success": False, "error": f"NVIDIA API error: {error_msg}"}

        data = response.json()
        text = data["choices"][0]["message"]["content"].strip()

        # Clean markdown code fences if present
        if text.startswith("```"):
            lines = text.split("\n")
            # Remove first and last line if they are code fences
            if lines[0].strip().startswith("```") and lines[-1].strip() == "```":
                text = "\n".join(lines[1:-1])
            elif lines[0].strip().startswith("```"):
                text = "\n".join(lines[1:])

        return {"success": True, "text": text}

    except requests.exceptions.Timeout:
        return {"success": False, "error": "NVIDIA API timeout. Please try again."}
    except Exception as e:
        return {"success": False, "error": f"AI service error: {str(e)}"}


def generate_itinerary(form_data: dict, destination_info: dict = None) -> dict:
    """
    Generate a day-wise travel itinerary using NVIDIA NIM AI.
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
- Budget Range: ${destination_info.get('budget_min', 0)} - ${destination_info.get('budget_max', 0)}
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
- Budget: ${form_data.get('budget', 1000)} (total for the trip)
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
  "destination_name": "string",
  "destination_city": "string",
  "destination_country": "string",
  "trip_summary": "string",
  "total_estimated_cost": number,
  "currency": "USD",
  "budget_status": "within_budget | slightly_over | over_budget",
  "budget_warning": "string",
  "seasonal_alert": "string",
  "days": [
    {{
      "day": 1,
      "title": "string",
      "activities": [
        {{
          "time": "9:00 AM",
          "activity": "string",
          "description": "string",
          "location": "string",
          "estimated_cost": number,
          "tips": "string"
        }}
      ],
      "meals": [
        {{
          "type": "breakfast | lunch | dinner",
          "suggestion": "string",
          "estimated_cost": number
        }}
      ],
      "accommodation": {{
        "type": "string",
        "suggestion": "string",
        "estimated_cost": number
      }},
      "transport": {{
        "mode": "string",
        "details": "string",
        "estimated_cost": number
      }},
      "daily_total": number
    }}
  ],
  "must_visit_places": ["string"],
  "food_suggestions": ["string"],
  "safety_tips": ["string"],
  "packing_suggestions": ["string"],
  "best_time_to_visit": "string"
}}

{"If no destination was specified, suggest the best destination based on the user's preferences and budget." if not destination_info else "Use the provided destination information."}

Generate a detailed, realistic, and practical itinerary. Ensure costs are realistic and within the user's budget when possible. Include local experiences and hidden gems."""

    result = _call_groq(prompt)
    if not result.get("success"):
        return result

    try:
        raw_text = result["text"]
        repaired_text = _repair_json(raw_text)
        itinerary = json.loads(repaired_text)
        return {"success": True, "itinerary": itinerary}
    except json.JSONDecodeError as e:
        return {"success": False, "error": f"Failed to parse AI response: {str(e)}"}


def suggest_destination(form_data: dict) -> dict:
    """
    Ask AI to suggest a destination based on user preferences.
    """
    prompt = f"""Based on these travel preferences, suggest the TOP 3 best destinations:
- Budget: ${form_data.get('budget', 1000)}
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
      "reason": "string",
      "estimated_budget": number
    }}
  ]
}}"""

    result = _call_groq(prompt)
    if not result.get("success"):
        return result

    try:
        raw_text = result["text"]
        repaired_text = _repair_json(raw_text)
        return {"success": True, "data": json.loads(repaired_text)}
    except json.JSONDecodeError:
        return {"success": False, "error": "Failed to parse AI suggestion"}
