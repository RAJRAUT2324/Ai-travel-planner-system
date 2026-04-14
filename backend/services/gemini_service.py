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


# ─── Budget Plan Generation (uses Groq, never Gemini) ────────────────────

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"


def _call_groq_budget(prompt: str) -> dict:
    """Make a direct HTTP request to Groq API for budget generation.
    Uses BUDGET_API_KEY with fallback to GROQ_API_KEY."""

    key = Config.BUDGET_API_KEY or Config.GROQ_API_KEY
    if not key:
        return {
            "success": False,
            "error": "No Groq API key found. Set BUDGET_API_KEY or GROQ_API_KEY in your .env file."
        }

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {key}"
    }

    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.3,
        "max_tokens": 3500,
        "response_format": {"type": "json_object"}
    }

    try:
        response = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=30)

        if response.status_code == 429:
            return {"success": False, "error": "Groq API rate limit hit. Please wait a moment and try again."}

        if response.status_code != 200:
            error_msg = response.json().get("error", {}).get("message", f"API error {response.status_code}")
            return {"success": False, "error": f"Groq API error: {error_msg}"}

        data = response.json()
        text = data["choices"][0]["message"]["content"].strip()
        return {"success": True, "text": text}

    except requests.exceptions.Timeout:
        return {"success": False, "error": "Groq API timeout. Please try again."}
    except Exception as e:
        return {"success": False, "error": f"Budget AI service error: {str(e)}"}


def generate_budget_plan(source: str, destination: str, total_budget: float,
                         currency: str, duration: int, persons: int,
                         travel_party: str, accommodation: str,
                         dietary_preference: str) -> dict:
    """Generate a structured, per-person, day-by-day budget breakdown using Groq AI."""

    currency_symbols = {
        "INR": "₹", "USD": "$", "EUR": "€", "GBP": "£",
        "JPY": "¥", "AED": "د.إ", "SGD": "S$", "THB": "฿"
    }
    sym = currency_symbols.get(currency, currency)

    origin_note = f"from {source} to {destination}" if source else f"at {destination}"

    prompt = f"""You are a travel budget expert. Create a detailed budget plan for a trip {origin_note}.
Total budget: {sym}{total_budget} {currency} for {persons} person(s), {duration} day(s).
Party type: {travel_party}. Accommodation: {accommodation}. Diet: {dietary_preference}.

Respond with ONLY valid JSON in this EXACT structure:
{{
  "trip_tier": "budget|mid-range|premium",
  "destination": "{destination}",
  "source": "{source or 'N/A'}",
  "currency": "{currency}",
  "currency_symbol": "{sym}",
  "total_budget": {total_budget},
  "persons": {persons},
  "duration": {duration},
  "per_day_per_person": <number>,
  "budget_warning": "<string or empty>",
  "suggested_min_budget": <number or null>,
  "allocation": [
    {{"category":"Accommodation","amount":<number>,"percentage":<number>}},
    {{"category":"Food & Dining","amount":<number>,"percentage":<number>}},
    {{"category":"Transport","amount":<number>,"percentage":<number>}},
    {{"category":"Activities","amount":<number>,"percentage":<number>}},
    {{"category":"Shopping","amount":<number>,"percentage":<number>}},
    {{"category":"Emergency Buffer","amount":<number>,"percentage":<number>}},
    {{"category":"Miscellaneous","amount":<number>,"percentage":<number>}}
  ],
  "daily_plan": [
    {{
      "day": 1,
      "focus": "<day theme>",
      "daily_total": <number>,
      "items": [
        {{"description":"<string>","category":"<string>","cost":<number>}}
      ]
    }}
  ],
  "saving_tips": ["<string>","<string>","<string>","<string>"],
  "best_value_experiences": [
    {{"activity":"<string>","cost":<number>,"description":"<string>"}}
  ],
  "travel_mode_costs": [
    {{"mode":"Car/Cab","emoji":"🚗","cost_one_way":<number>,"duration_hrs":"<string>","note":"<string>"}},
    {{"mode":"Bus","emoji":"🚌","cost_one_way":<number>,"duration_hrs":"<string>","note":"<string>"}},
    {{"mode":"Train","emoji":"🚂","cost_one_way":<number>,"duration_hrs":"<string>","note":"<string>"}},
    {{"mode":"Flight","emoji":"✈️","cost_one_way":<number>,"duration_hrs":"<string>","note":"<string>"}}
  ],
  "fx_note": "<exchange rate context if currency is INR and destination is international, else empty string>"
}}
Rules: Emergency Buffer must be at least 8% of total. All amounts in {currency}. Scale costs for {persons} person(s). travel_mode_costs should show realistic one-way per-person prices from {source or destination} to {destination}. If source is empty, show local transport options at {destination}. Keep response compact."""

    result = _call_groq_budget(prompt)
    if not result.get("success"):
        return result

    try:
        budget_data = json.loads(result["text"])
        return {"success": True, "budget": budget_data}
    except json.JSONDecodeError as e:
        return {"success": False, "error": f"Failed to parse AI response: {str(e)}"}
