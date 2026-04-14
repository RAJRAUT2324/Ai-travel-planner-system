"""
Budget route — handles POST /api/budget/generate
Calls Groq AI via gemini_service to produce a structured budget plan.
"""

import traceback
from flask import Blueprint, request, jsonify
from services.gemini_service import generate_budget_plan

budget_bp = Blueprint("budget", __name__)


@budget_bp.route("/generate", methods=["POST"])
def generate():
    """Generate an AI-powered budget breakdown for a trip."""
    try:
        data = request.get_json(force=True)

        # --- Validate required fields ---
        missing = []
        if not data.get("destination"):
            missing.append("destination")
        if not data.get("total_budget"):
            missing.append("total_budget")
        if not data.get("duration"):
            missing.append("duration")

        if missing:
            return jsonify({
                "success": False,
                "error": f"Missing required fields: {', '.join(missing)}"
            }), 400

        # --- Extract & sanitise inputs ---
        source = str(data.get("source", "")).strip()
        destination = str(data["destination"]).strip()
        total_budget = float(data["total_budget"])
        currency = str(data.get("currency", "INR")).strip().upper()
        duration = max(1, min(30, int(data["duration"])))
        persons = max(1, int(data.get("persons", 1)))
        travel_party = str(data.get("travel_party", "Solo")).strip()
        accommodation = str(data.get("accommodation", "Budget Hotel")).strip()
        dietary_preference = str(data.get("dietary_preference", "No preference")).strip()

        # --- Call AI service ---
        result = generate_budget_plan(
            source=source,
            destination=destination,
            total_budget=total_budget,
            currency=currency,
            duration=duration,
            persons=persons,
            travel_party=travel_party,
            accommodation=accommodation,
            dietary_preference=dietary_preference,
        )

        if not result.get("success"):
            return jsonify(result), 500

        return jsonify(result), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({"success": False, "error": f"Server error: {str(e)}"}), 500
