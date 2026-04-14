"""
Admin routes — dashboard analytics, user management, and content moderation.
"""

from flask import Blueprint, jsonify, request
from utils.auth_utils import admin_required

admin_bp = Blueprint("admin", __name__)


def init_admin_routes(user_model, destination_model, review_model,
                      itinerary_model, analytics_model):
    """Initialize admin routes."""

    # ─── Dashboard Stats ──────────────────────────────────────
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

    # ─── Analytics ────────────────────────────────────────────
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

    @admin_bp.route("/analytics/overview", methods=["GET"])
    @admin_required
    def analytics_overview():
        """Get daily event counts for dashboard charts."""
        data = analytics_model.get_daily_counts(days=30)
        return jsonify({"daily_counts": data})

    # ─── Users ────────────────────────────────────────────────
    @admin_bp.route("/users", methods=["GET"])
    @admin_required
    def get_users():
        """Get all users."""
        users = user_model.get_all_users()
        return jsonify({"users": users})

    @admin_bp.route("/users/<user_id>", methods=["DELETE"])
    @admin_required
    def delete_user(user_id):
        """Delete a user permanently."""
        if user_model.delete_user(user_id):
            return jsonify({"message": "User deleted successfully"})
        return jsonify({"error": "User not found"}), 404

    @admin_bp.route("/users/<user_id>/ban", methods=["PUT"])
    @admin_required
    def toggle_ban(user_id):
        """Toggle ban status on a user."""
        result = user_model.toggle_ban(user_id)
        if result is None:
            return jsonify({"error": "User not found"}), 404
        return jsonify({
            "message": f"User {'banned' if result['is_banned'] else 'unbanned'} successfully",
            "is_banned": result["is_banned"]
        })

    @admin_bp.route("/users/<user_id>/role", methods=["PUT"])
    @admin_required
    def set_user_role(user_id):
        """Set the role of a user."""
        data = request.get_json()
        if not data or "role" not in data:
            return jsonify({"error": "Role is required"}), 400

        if user_model.set_role(user_id, data["role"]):
            return jsonify({"message": f"User role updated to {data['role']}"})
        return jsonify({"error": "Failed to update role"}), 400

    # ─── Itineraries ──────────────────────────────────────────
    @admin_bp.route("/itineraries", methods=["GET"])
    @admin_required
    def get_itineraries():
        """Get all itineraries across the platform."""
        data = itinerary_model.get_all()
        return jsonify({"itineraries": data})

    @admin_bp.route("/itineraries/<itinerary_id>", methods=["DELETE"])
    @admin_required
    def delete_itinerary(itinerary_id):
        """Delete an itinerary."""
        if itinerary_model.delete(itinerary_id):
            return jsonify({"message": "Itinerary deleted successfully"})
        return jsonify({"error": "Itinerary not found"}), 404

    # ─── Destinations ─────────────────────────────────────────
    @admin_bp.route("/destinations", methods=["GET"])
    @admin_required
    def get_destinations():
        """Get all destinations in the system."""
        result = destination_model.get_all(limit=200)
        return jsonify({"destinations": result.get("destinations", [])})

    @admin_bp.route("/destinations/<dest_id>", methods=["DELETE"])
    @admin_required
    def delete_destination(dest_id):
        """Delete a destination."""
        if destination_model.delete(dest_id):
            return jsonify({"message": "Destination deleted successfully"})
        return jsonify({"error": "Destination not found"}), 404

    @admin_bp.route("/destinations/<dest_id>/feature", methods=["POST"])
    @admin_required
    def toggle_featured(dest_id):
        """Toggle featured status on a destination."""
        result = destination_model.toggle_featured(dest_id)
        if result is None:
            return jsonify({"error": "Destination not found"}), 404
        return jsonify({
            "message": f"'{result['name']}' {'featured' if result['is_featured'] else 'unfeatured'} successfully",
            "is_featured": result["is_featured"]
        })

    @admin_bp.route("/featured", methods=["GET"])
    @admin_required
    def get_featured():
        """Get all featured destinations."""
        data = destination_model.get_featured()
        return jsonify({"destinations": data})

    # ─── Reviews ──────────────────────────────────────────────
    @admin_bp.route("/reviews", methods=["GET"])
    @admin_required
    def get_reviews():
        """Get all moderated reviews."""
        data = review_model.get_all()
        return jsonify({"reviews": data})

    @admin_bp.route("/reviews/<review_id>", methods=["DELETE"])
    @admin_required
    def delete_review(review_id):
        """Delete a review."""
        if review_model.delete(review_id):
            return jsonify({"message": "Review deleted successfully"})
        return jsonify({"error": "Review not found"}), 404

    return admin_bp
