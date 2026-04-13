"""
Destination routes — CRUD operations, search, and image handling.
"""

import base64
from flask import Blueprint, request, jsonify, g, send_file
from io import BytesIO
from utils.auth_utils import login_required, admin_required
from services.discovery_service import discover_destination

destinations_bp = Blueprint("destinations", __name__)


def init_destination_routes(destination_model, gridfs_service, analytics_model):
    """Initialize destination routes with required models."""

    @destinations_bp.route("/", methods=["GET"])
    def get_destinations():
        """Get paginated destinations with optional search/filter."""
        page = request.args.get("page", 1, type=int)
        limit = request.args.get("limit", 12, type=int)
        search = request.args.get("search", None)
        tags = request.args.getlist("tags")
        budget_max = request.args.get("budget_max", None, type=float)

        # Log search analytics
        if search:
            analytics_model.log_event("search", {"query": search})

        result = destination_model.get_all(page, limit, search, tags or None, budget_max)
        
        # [NEW] AI Discovery Fallback
        # If no results found in DB and it's a specific search query, try to discover it
        if result["total"] == 0 and search and len(search) > 2:
            discovery = discover_destination(search)
            if discovery.get("success"):
                # Save discovered destination to DB for future use
                dest_data = discovery["data"]
                # Add default placeholder image or search for one later
                dest_data["image_ids"] = [] 
                dest_id = destination_model.create(dest_data)
                
                # Fetch again to return in standard format
                new_dest = destination_model.find_by_id(dest_id)
                result = {
                    "destinations": [new_dest],
                    "total": 1,
                    "page": 1,
                    "pages": 1,
                    "is_discovered": True
                }

        return jsonify(result)

    @destinations_bp.route("/all", methods=["GET"])
    def get_all_simple():
        """Get all destinations with minimal fields (for dropdowns)."""
        destinations = destination_model.get_all_simple()
        return jsonify({"destinations": destinations})

    @destinations_bp.route("/<dest_id>", methods=["GET"])
    def get_destination(dest_id):
        """Get a single destination by ID."""
        dest = destination_model.find_by_id(dest_id)
        if not dest:
            return jsonify({"error": "Destination not found"}), 404

        # Log view analytics
        analytics_model.log_event("view_destination", {
            "destination_id": dest_id,
            "name": dest.get("name"),
        })

        return jsonify({"destination": dest})

    @destinations_bp.route("/", methods=["POST"])
    @admin_required
    def create_destination():
        """Create a new destination (admin only)."""
        # Handle multipart form data for image uploads
        if request.content_type and "multipart/form-data" in request.content_type:
            data = request.form.to_dict()
            # Parse JSON fields
            import json
            for field in ["nearby_hotels", "nearby_attractions", "travel_tips", "tags", "coordinates"]:
                if field in data and isinstance(data[field], str):
                    try:
                        data[field] = json.loads(data[field])
                    except json.JSONDecodeError:
                        if field != "coordinates":
                            data[field] = [x.strip() for x in data[field].split(",") if x.strip()]

            # Parse numeric fields
            for field in ["budget_min", "budget_max"]:
                if field in data:
                    try:
                        data[field] = float(data[field])
                    except (ValueError, TypeError):
                        data[field] = 0

            # Handle image uploads
            image_ids = []
            files = request.files.getlist("images")
            for file in files:
                if file and file.filename:
                    file_id = gridfs_service.upload_image(
                        file.read(), file.filename, file.content_type
                    )
                    image_ids.append(file_id)
            data["image_ids"] = image_ids
        else:
            data = request.get_json()
            if not data:
                return jsonify({"error": "No data provided"}), 400

        dest_id = destination_model.create(data)
        return jsonify({"message": "Destination created", "id": dest_id}), 201

    @destinations_bp.route("/<dest_id>", methods=["PUT"])
    @admin_required
    def update_destination(dest_id):
        """Update a destination (admin only)."""
        if request.content_type and "multipart/form-data" in request.content_type:
            data = request.form.to_dict()
            import json
            for field in ["nearby_hotels", "nearby_attractions", "travel_tips", "tags", "coordinates"]:
                if field in data and isinstance(data[field], str):
                    try:
                        data[field] = json.loads(data[field])
                    except json.JSONDecodeError:
                        if field != "coordinates":
                            data[field] = [x.strip() for x in data[field].split(",") if x.strip()]
            for field in ["budget_min", "budget_max"]:
                if field in data:
                    try:
                        data[field] = float(data[field])
                    except (ValueError, TypeError):
                        data[field] = 0

            # Handle new image uploads
            files = request.files.getlist("images")
            if files and files[0].filename:
                image_ids = []
                for file in files:
                    if file and file.filename:
                        file_id = gridfs_service.upload_image(
                            file.read(), file.filename, file.content_type
                        )
                        image_ids.append(file_id)
                data["image_ids"] = image_ids
        else:
            data = request.get_json()
            if not data:
                return jsonify({"error": "No data provided"}), 400

        success = destination_model.update(dest_id, data)
        if not success:
            return jsonify({"error": "Destination not found"}), 404
        return jsonify({"message": "Destination updated"})

    @destinations_bp.route("/<dest_id>", methods=["DELETE"])
    @admin_required
    def delete_destination(dest_id):
        """Delete a destination (admin only)."""
        dest = destination_model.find_by_id(dest_id)
        if dest:
            # Delete associated images
            for img_id in dest.get("image_ids", []):
                gridfs_service.delete_image(img_id)

        success = destination_model.delete(dest_id)
        if not success:
            return jsonify({"error": "Destination not found"}), 404
        return jsonify({"message": "Destination deleted"})

    @destinations_bp.route("/<dest_id>/similar", methods=["GET"])
    def get_similar(dest_id):
        """Get similar destinations for recommendations."""
        similar = destination_model.get_similar(dest_id)
        return jsonify({"recommendations": similar})

    @destinations_bp.route("/image/<image_id>", methods=["GET"])
    def get_image(image_id):
        """Retrieve an image from GridFS."""
        image_data, content_type = gridfs_service.get_image(image_id)
        if not image_data:
            return jsonify({"error": "Image not found"}), 404
        return send_file(
            BytesIO(image_data),
            mimetype=content_type or "image/jpeg",
        )

    return destinations_bp
