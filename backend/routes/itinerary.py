"""
Itinerary routes — AI generation, history, and PDF download.
"""

import io
from flask import Blueprint, request, jsonify, g, send_file
from utils.auth_utils import login_required
from services.nvidia_service import generate_itinerary, suggest_destination
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER

itinerary_bp = Blueprint("itinerary", __name__)


def init_itinerary_routes(itinerary_model, destination_model, analytics_model):
    """Initialize itinerary routes."""

    @itinerary_bp.route("/generate", methods=["POST"])
    @login_required
    def generate():
        """Generate a new AI travel itinerary."""
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Validate required fields
        budget = data.get("budget")
        travel_type = data.get("travel_type")
        duration = data.get("duration")

        if not budget or not travel_type or not duration:
            return jsonify({"error": "budget, travel_type, and duration are required"}), 400

        # Get destination info if provided
        destination_info = None
        destination_id = data.get("destination_id")
        destination_name = data.get("destination_name")
        
        if destination_id:
            destination_info = destination_model.find_by_id(destination_id)
        elif destination_name:
            # Create minimal context if manually entered or from suggestion
            destination_info = {
                "name": destination_name,
                "city": destination_name.split(",")[0].strip(),
                "country": destination_name.split(",")[-1].strip() if "," in destination_name else "Unknown",
                "description": "Custom selected destination."
            }

        # If no destination selected, ask AI to suggest
        if not destination_info and not destination_id:
            suggestion = suggest_destination(data)
            if suggestion.get("success") and suggestion.get("data", {}).get("suggestions"):
                # Use first suggestion as context
                first_suggestion = suggestion["data"]["suggestions"][0]
                destination_info = {
                    "name": first_suggestion.get("name", ""),
                    "city": first_suggestion.get("city", ""),
                    "country": first_suggestion.get("country", ""),
                    "description": first_suggestion.get("reason", ""),
                }

        # Generate itinerary with AI
        try:
            result = generate_itinerary(data, destination_info)
        except Exception as e:
            return jsonify({"error": f"AI Engine Exception: {str(e)}"}), 500
            
        if not result.get("success"):
            return jsonify({"error": result.get("error", "Intelligence failed to generate route.")}), 500

        # Save itinerary to database
        itinerary_id = itinerary_model.save(
            g.user_id, destination_id, result["itinerary"], data
        )

        # Log analytics
        analytics_model.log_event("plan_generated", {
            "budget": budget,
            "travel_type": travel_type,
            "duration": duration,
            "interests": data.get("interests", []),
            "destination_id": destination_id,
        }, g.user_id)

        return jsonify({
            "message": "Itinerary generated successfully",
            "itinerary_id": itinerary_id,
            "itinerary": result["itinerary"],
        })

    @itinerary_bp.route("/suggest", methods=["POST"])
    @login_required
    def suggest():
        """Get AI destination suggestions based on preferences."""
        data = request.get_json()
        result = suggest_destination(data or {})
        if result.get("success"):
            return jsonify(result["data"])
        return jsonify({"error": result.get("error", "Failed to get suggestions")}), 500

    @itinerary_bp.route("/history", methods=["GET"])
    @login_required
    def history():
        """Get user's itinerary history."""
        itineraries = itinerary_model.get_by_user(g.user_id)
        return jsonify({"itineraries": itineraries})

    @itinerary_bp.route("/<itinerary_id>", methods=["GET"])
    @login_required
    def get_itinerary(itinerary_id):
        """Get a specific itinerary."""
        itinerary = itinerary_model.find_by_id(itinerary_id)
        if not itinerary:
            return jsonify({"error": "Itinerary not found"}), 404
        return jsonify({"itinerary": itinerary})

    @itinerary_bp.route("/<itinerary_id>/pdf", methods=["GET"])
    @login_required
    def download_pdf(itinerary_id):
        """Download itinerary as PDF."""
        itinerary = itinerary_model.find_by_id(itinerary_id)
        if not itinerary:
            return jsonify({"error": "Itinerary not found"}), 404

        plan = itinerary.get("plan_data", {})
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.5*inch, bottomMargin=0.5*inch)
        styles = getSampleStyleSheet()

        # Custom styles
        title_style = ParagraphStyle(
            "CustomTitle", parent=styles["Title"],
            fontSize=24, textColor=colors.HexColor("#1e3a5f"),
            spaceAfter=20, alignment=TA_CENTER,
        )
        heading_style = ParagraphStyle(
            "CustomHeading", parent=styles["Heading2"],
            fontSize=16, textColor=colors.HexColor("#2563eb"),
            spaceBefore=15, spaceAfter=8,
        )
        body_style = styles["BodyText"]

        elements = []

        # Title
        dest_name = plan.get("destination_name", "Travel Itinerary")
        elements.append(Paragraph(f"✈️ {dest_name}", title_style))
        elements.append(Paragraph(
            f"{plan.get('destination_city', '')} • {plan.get('destination_country', '')}",
            ParagraphStyle("Subtitle", parent=styles["Normal"], fontSize=14,
                         alignment=TA_CENTER, textColor=colors.grey)
        ))
        elements.append(Spacer(1, 20))

        # Summary
        if plan.get("trip_summary"):
            elements.append(Paragraph(plan["trip_summary"], body_style))
            elements.append(Spacer(1, 10))

        # Budget info
        total_cost = plan.get("total_estimated_cost", 0)
        elements.append(Paragraph(
            f"<b>Total Estimated Cost:</b> ${total_cost}", body_style
        ))
        elements.append(Spacer(1, 15))

        # Days
        for day in plan.get("days", []):
            elements.append(Paragraph(
                f"Day {day.get('day', '?')}: {day.get('title', '')}",
                heading_style
            ))

            for activity in day.get("activities", []):
                elements.append(Paragraph(
                    f"• <b>{activity.get('time', '')}</b> - {activity.get('activity', '')} "
                    f"at {activity.get('location', '')} (${activity.get('estimated_cost', 0)})",
                    body_style
                ))
                if activity.get("tips"):
                    elements.append(Paragraph(
                        f"  💡 {activity['tips']}", body_style
                    ))

            # Meals
            for meal in day.get("meals", []):
                elements.append(Paragraph(
                    f"🍽️ <b>{meal.get('type', '').title()}:</b> {meal.get('suggestion', '')} "
                    f"(${meal.get('estimated_cost', 0)})",
                    body_style
                ))

            # Accommodation
            accom = day.get("accommodation", {})
            if accom:
                elements.append(Paragraph(
                    f"🏨 <b>Stay:</b> {accom.get('suggestion', '')} - "
                    f"{accom.get('type', '')} (${accom.get('estimated_cost', 0)})",
                    body_style
                ))

            elements.append(Spacer(1, 10))

        # Safety tips
        if plan.get("safety_tips"):
            elements.append(Paragraph("⚠️ Safety Tips", heading_style))
            for tip in plan["safety_tips"]:
                elements.append(Paragraph(f"• {tip}", body_style))

        doc.build(elements)
        buffer.seek(0)

        return send_file(
            buffer,
            mimetype="application/pdf",
            as_attachment=True,
            download_name=f"itinerary_{dest_name.replace(' ', '_')}.pdf",
        )

    return itinerary_bp
