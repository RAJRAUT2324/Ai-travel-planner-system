"""
Review routes — CRUD operations for reviews with admin moderation.
"""

from flask import Blueprint, request, jsonify, g
from utils.auth_utils import login_required, admin_required

reviews_bp = Blueprint("reviews", __name__)


def init_review_routes(review_model, gridfs_service):
    """Initialize review routes."""

    @reviews_bp.route("/destination/<dest_id>", methods=["GET"])
    def get_reviews(dest_id):
        """Get all reviews for a destination."""
        reviews = review_model.get_by_destination(dest_id)
        avg_rating = review_model.get_avg_rating(dest_id)
        return jsonify({
            "reviews": reviews,
            "average_rating": avg_rating,
            "total": len(reviews),
        })

    @reviews_bp.route("/", methods=["POST"])
    @login_required
    def create_review():
        """Create a new review."""
        # Support multipart for optional image
        if request.content_type and "multipart/form-data" in request.content_type:
            destination_id = request.form.get("destination_id")
            rating = request.form.get("rating", type=int)
            comment = request.form.get("comment", "")

            image_id = None
            file = request.files.get("image")
            if file and file.filename:
                image_id = gridfs_service.upload_image(
                    file.read(), file.filename, file.content_type
                )
        else:
            data = request.get_json()
            if not data:
                return jsonify({"error": "No data provided"}), 400
            destination_id = data.get("destination_id")
            rating = data.get("rating")
            comment = data.get("comment", "")
            image_id = None

        if not destination_id or not rating:
            return jsonify({"error": "destination_id and rating are required"}), 400

        if not isinstance(rating, int) or rating < 1 or rating > 5:
            return jsonify({"error": "Rating must be between 1 and 5"}), 400

        review_id = review_model.create(
            g.user_id, destination_id, rating, comment, image_id
        )
        return jsonify({"message": "Review submitted", "id": review_id}), 201

    @reviews_bp.route("/all", methods=["GET"])
    @admin_required
    def get_all_reviews():
        """Get all reviews (admin only)."""
        reviews = review_model.get_all()
        return jsonify({"reviews": reviews})

    @reviews_bp.route("/<review_id>", methods=["DELETE"])
    @admin_required
    def delete_review(review_id):
        """Delete a review (admin only)."""
        success = review_model.delete(review_id)
        if not success:
            return jsonify({"error": "Review not found"}), 404
        return jsonify({"message": "Review deleted"})

    return reviews_bp
