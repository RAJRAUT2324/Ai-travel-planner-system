"""
Admin routes — dashboard analytics, user management, and content moderation.
"""

from flask import Blueprint, jsonify
from utils.auth_utils import admin_required

admin_bp = Blueprint("admin", __name__)


def init_admin_routes(user_model, destination_model, review_model,
                      itinerary_model, analytics_model):
    """Initialize admin routes."""

    @admin_bp.route("/stats", methods=["GET"])
    @admin_required
    def dashboard_stats():
        """Get dashboard statistics."""
        return jsonify({
            "total_users": user_model.count_users(),
            "total_destinations": destination_model.count(),
            "total_reviews": review_model.count(),
            "total_itineraries": itinerary_model.count(),
            "avg_budget": analytics_model.get_avg_budget(),
        })

    @admin_bp.route("/analytics/searches", methods=["GET"])
    @admin_required
    def most_searched():
        """Get most searched destinations."""
        data = analytics_model.get_most_searched()
        return jsonify({"searches": data})

    @admin_bp.route("/analytics/tags", methods=["GET"])
    @admin_required
    def popular_tags():
        """Get popular travel type tags."""
        data = analytics_model.get_popular_tags()
        return jsonify({"tags": data})

    @admin_bp.route("/analytics/activity", methods=["GET"])
    @admin_required
    def recent_activity():
        """Get recent analytics activity."""
        data = analytics_model.get_recent_activity()
        return jsonify({"activity": data})

    @admin_bp.route("/users", methods=["GET"])
    @admin_required
    def get_users():
        """Get all users."""
        users = user_model.get_all_users()
        return jsonify({"users": users})

    @admin_bp.route("/itineraries", methods=["GET"])
    @admin_required
    def get_itineraries():
        """Get all itineraries across the platform."""
        data = itinerary_model.get_all() # Assume this exists or add to model
        return jsonify({"itineraries": data})

    @admin_bp.route("/destinations", methods=["GET"])
    @admin_required
    def get_destinations():
        """Get all destinations in the system."""
        # Use existing page=1, limit=100 from model's get_all
        result = destination_model.get_all(limit=100)
        return jsonify({"destinations": result.get("destinations", [])})

    @admin_bp.route("/reviews", methods=["GET"])
    @admin_required
    def get_reviews():
        """Get all moderated reviews."""
        data = review_model.get_all()
        return jsonify({"reviews": data})

    return admin_bp
