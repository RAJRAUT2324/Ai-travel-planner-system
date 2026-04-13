"""
Weather routes — real-time weather data for destinations.
"""

from flask import Blueprint, request, jsonify
from services.weather_service import get_weather

weather_bp = Blueprint("weather", __name__)


def init_weather_routes():
    """Initialize weather routes."""

    @weather_bp.route("/", methods=["GET"])
    def weather():
        """Get current weather for a city."""
        city = request.args.get("city")
        if not city:
            return jsonify({"error": "City parameter is required"}), 400

        result = get_weather(city)
        if result.get("success"):
            return jsonify(result)
        return jsonify({"error": result.get("error", "Weather service error")}), 500

    return weather_bp
