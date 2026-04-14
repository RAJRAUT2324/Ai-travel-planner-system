"""
NVIDIA NIM AI Service — builds structured prompts and generates travel itineraries.
Enhanced with Multi-Provider Fallback (Groq, NVIDIA, Gemini).
"""

import json
import requests
import re
import logging
from config import Config

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Providers Endpoints
NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions"
NVIDIA_MODEL = "meta/llama-3.1-70b-instruct"

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.1-8b-instant"

GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

def _repair_json(text: str) -> str:
    """Attempt to fix common JSON errors from LLMs (trailing commas, markdown fences, etc)."""
    text = text.strip()
    # Remove markdown code fences
    if text.startswith("```"):
        lines = text.split("\n")
        if lines[0].strip().startswith("```") and lines[-1].strip() == "```":
            text = "\n".join(lines[1:-1]).strip()
        elif lines[0].strip().startswith("```"):
            text = "\n".join(lines[1:]).strip()
    
    # Remove common extra characters
    text = re.sub(r',\s*([\]}])', r'\1', text)
    
    # Locate JSON object
    start = text.find('{')
    end = text.rfind('}')
    if start != -1 and end != -1:
        return text[start:end+1]
    return text

def _call_groq(prompt: str) -> dict:
    """Make a direct HTTP request to Groq API."""
    if not Config.GROQ_API_KEY:
        return {"success": False, "error": "Groq key missing."}

    logger.info("Attempting AI generation with Groq...")
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {Config.GROQ_API_KEY}"
    }
    
    payload = {
        "model": GROQ_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.1,
        "max_tokens": 4096,
    }

    try:
        response = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=60)
        if response.status_code == 429:
            logger.warning("Groq Rate Limit (429) hit.")
            return {"success": False, "error": "Rate limit", "is_retryable": True}
        
        if response.status_code != 200:
            return {"success": False, "error": f"Groq error: {response.status_code}"}

        data = response.json()
        return {"success": True, "text": data["choices"][0]["message"]["content"].strip()}
    except Exception as e:
        return {"success": False, "error": f"Groq Service Exception: {str(e)}"}

def _call_nvidia(prompt: str) -> dict:
    """Make a direct HTTP request to NVIDIA NIM API."""
    if not Config.NVIDIA_API_KEY:
        return {"success": False, "error": "NVIDIA key missing."}

    logger.info("Attempting AI generation with NVIDIA NIM...")
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {Config.NVIDIA_API_KEY}"
    }
    
    payload = {
        "model": NVIDIA_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.2,
        "max_tokens": 4096,
    }

    try:
        response = requests.post(NVIDIA_API_URL, headers=headers, json=payload, timeout=120)
        if response.status_code == 429:
            logger.warning("NVIDIA Rate Limit (429) hit.")
            return {"success": False, "error": "Rate limit", "is_retryable": True}

        if response.status_code != 200:
            return {"success": False, "error": f"NVIDIA error {response.status_code}"}

        data = response.json()
        return {"success": True, "text": data["choices"][0]["message"]["content"].strip()}
    except Exception as e:
        return {"success": False, "error": f"NVIDIA Service Exception: {str(e)}"}

def _call_gemini(prompt: str) -> dict:
    """Make a direct HTTP request to Google Gemini API."""
    if not Config.GEMINI_API_KEY:
        return {"success": False, "error": "Gemini key missing."}

    logger.info("Attempting AI generation with Google Gemini...")
    url = f"{GEMINI_API_URL}?key={Config.GEMINI_API_KEY}"
    headers = {"Content-Type": "application/json"}
    
    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 4096,
        }
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=60)
        if response.status_code != 200:
            return {"success": False, "error": f"Gemini error {response.status_code}"}

        data = response.json()
        text = data['candidates'][0]['content']['parts'][0]['text']
        return {"success": True, "text": text}
    except Exception as e:
        return {"success": False, "error": f"Gemini Service Exception: {str(e)}"}

def generate_itinerary(form_data: dict, destination_info: dict = None) -> dict:
    """
    Generate a day-wise travel itinerary using available AI providers.
    Waterfall: Groq -> NVIDIA -> Gemini.
    """
    # Build context
    dest_context = ""
    if destination_info:
        dest_context = f"""
Destination: {destination_info.get('name', 'Unknown')} ({destination_info.get('city', '')}, {destination_info.get('country', '')})
Description: {destination_info.get('description', '')}
Best Season: {destination_info.get('best_season', '')}
Top Attractions: {', '.join(destination_info.get('nearby_attractions', []))}
"""

    prompt = f"""You are an expert travel planner. Create a JSON itinerary for:
- Budget: ${form_data.get('budget', 1000)}
- Type: {form_data.get('travel_type', 'solo')}
- Duration: {form_data.get('duration', 3)} days
- Interests: {', '.join(form_data.get('interests', ['general']))}
{dest_context}

Respond ONLY with valid JSON in this format:
{{
  "destination_name": "string",
  "destination_city": "string",
  "destination_country": "string",
  "trip_summary": "string",
  "total_estimated_cost": number,
  "budget_status": "within_budget",
  "days": [
    {{
      "day": 1,
      "title": "string",
      "activities": [
        {{ "time": "9:00 AM", "activity": "string", "description": "string", "location": "string", "estimated_cost": number }}
      ],
      "meals": [{{ "type": "lunch", "suggestion": "string", "estimated_cost": number }}],
      "accommodation": {{ "suggestion": "string", "estimated_cost": number }},
      "daily_total": number
    }}
  ]
}}"""

    # Waterfall logic
    providers = [_call_init for _call_init in [_call_groq, _call_nvidia, _call_gemini]]
    last_error = "All providers failed."

    for call_fn in providers:
        result = call_fn(prompt)
        if result.get("success"):
            try:
                raw_text = result["text"]
                repaired_text = _repair_json(raw_text)
                itinerary = json.loads(repaired_text)
                logger.info(f"Successfully generated itinerary with {call_fn.__name__}")
                return {"success": True, "itinerary": itinerary}
            except Exception as parse_err:
                logger.error(f"Failed to parse JSON from {call_fn.__name__}: {str(parse_err)}")
                last_error = f"JSON Parse Error from {call_fn.__name__}"
                continue
        else:
            last_error = result.get("error", "Unknown provider error")
            logger.warning(f"Provider {call_fn.__name__} failed: {last_error}")

    return {"success": False, "error": f"Intelligence Exhausted: {last_error}"}

def suggest_destination(form_data: dict) -> dict:
    """Suggest 3 destinations using waterfall AI providers."""
    prompt = f"""Suggest TOP 3 travel destinations for:
- Budget: ${form_data.get('budget', 1000)}
- Interests: {', '.join(form_data.get('interests', ['general']))}
- Duration: {form_data.get('duration', 3)} days

Respond ONLY with valid JSON:
{{
  "suggestions": [
    {{ "name": "string", "city": "string", "country": "string", "reason": "string", "estimated_budget": number }}
  ]
}}"""

    providers = [_call_groq, _call_nvidia, _call_gemini]
    for call_fn in providers:
        result = call_fn(prompt)
        if result.get("success"):
            try:
                raw_text = result["text"]
                repaired_text = _repair_json(raw_text)
                data = json.loads(repaired_text)
                logger.info(f"Successfully got suggestions with {call_fn.__name__}")
                return {"success": True, "data": data}
            except: continue
    
    return {"success": False, "error": "Could not get AI suggestions."}
