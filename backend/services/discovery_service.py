"""
Discovery Service — uses LLM to generate destination profiles dynamically for unknown places.
"""

import json
from services.nvidia_service import _call_nvidia

def discover_destination(query: str) -> dict:
    """
    Generate a full destination profile based on a search query.
    """
    prompt = f"""You are a world-class travel expert. A user is searching for "{query}". 
If this is a valid city, town, or tourist destination, generate a comprehensive destination profile for it.

IMPORTANT: Respond ONLY with valid JSON in this exact format:
{{
  "name": "Full Name of Destination",
  "city": "City Name",
  "country": "Country Name",
  "description": "A compelling 2-3 sentence description of the place.",
  "budget_min": number,
  "budget_max": number,
  "best_season": "e.g. Summer (June-August)",
  "nearby_hotels": ["Hotel 1", "Hotel 2", "Hotel 3"],
  "nearby_attractions": ["Attraction 1", "Attraction 2", "Attraction 3"],
  "travel_tips": ["Tip 1", "Tip 2"],
  "tags": ["beach", "culture", etc.],
  "coordinates": {{ "lat": number, "lng": number }}
}}

If the query is not a valid travel destination, respond with: {{"error": "Invalid destination"}}
"""

    result = _call_nvidia(prompt)
    if not result.get("success"):
        return result

    try:
        data = json.loads(result["text"])
        if "error" in data:
            return {"success": False, "error": data["error"]}
        
        return {"success": True, "data": data}
    except json.JSONDecodeError:
        return {"success": False, "error": "Failed to parse discovery results."}
