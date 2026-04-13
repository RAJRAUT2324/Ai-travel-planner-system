"""
Chat routes — AI Agent logic powered by Grok (Groq).
"""

from flask import Blueprint, request, jsonify
from services.nvidia_service import _call_nvidia

chat_bp = Blueprint("chat", __name__)

@chat_bp.route("/", methods=["POST"])
def chat():
    """Handle general chat queries using Grok with strict language control."""
    data = request.get_json()
    message = data.get("message")
    language = data.get("language", "english").lower() # 'english' or 'hindi'
    
    if not message:
        return jsonify({"error": "No message provided"}), 400
        
    # Hardcoded Platform Knowledge
    platform_info = """
VoyageAI Platform Details:
- Purpose: Next-generation AI travel planner.
- Tech: Powered by Llama 3.1 and Grok (Groq) architectures.
- 'Plan Trip': Allows users to generate detailed day-wise itineraries with cost estimates.
- 'Explore': A discovery engine for 500+ curated locations and AI-discovered cities.
- 'Profile': Where users see their saved trip history.
- Features: Live weather for cities, PDF itinerary downloads, curated "Staff Picks".
- Navigation: Use the Navbar to switch between Home, Explore, and Plan Trip.
"""

    system_prompt = f"""You are the 'VoyageAI Navigator', the AI assistant for the VoyageAI platform.
Your mission is to help users navigate the site and answer travel questions.

STRICT LANGUAGE RULES:
- The user has chosen: {language.upper()}.
- You MUST respond ONLY in {language.upper()}. 
- DO NOT mix languages. DO NOT use Hinglish.
- If language is HINDI, use pure Devanagari script.
- If language is ENGLISH, use professional English.

PLATFORM KNOWLEDGE:
{platform_info}

INSTRUCTIONS:
1. Be helpful and concise (max 3 sentences).
2. If asked how to use the site, reference 'Plan Trip' for itineraries or 'Explore' for searching.
3. Powered by Grok (via Groq).
"""

    full_prompt = f"{system_prompt}\n\nUser: {message}\nAssistant:"
    
    result = _call_nvidia(full_prompt)
    
    if result.get("success"):
        return jsonify({"response": result["text"]})
    else:
        # Fallback error message (Safe and generic)
        error_msg = "Technical issue detected. Please try again later." if language == "english" else "तकनीकी त्रुटि। कृपया बाद में पुनः प्रयास करें।"
        return jsonify({"error": error_msg}), 500
