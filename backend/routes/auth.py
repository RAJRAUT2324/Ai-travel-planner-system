"""
Authentication routes — register, login, and profile endpoints.
"""

from flask import Blueprint, request, jsonify, g
from utils.auth_utils import hash_password, check_password, generate_token, login_required

auth_bp = Blueprint("auth", __name__)


def init_auth_routes(user_model):
    """Initialize auth routes with the user model."""

    @auth_bp.route("/register", methods=["POST"])
    def register():
        """Register a new user."""
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        name = data.get("name", "").strip()
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")

        if not name or not email or not password:
            return jsonify({"error": "Name, email, and password are required"}), 400

        if len(password) < 6:
            return jsonify({"error": "Password must be at least 6 characters"}), 400

        # Check if email already exists
        if user_model.find_by_email(email):
            return jsonify({"error": "Email already registered"}), 409

        password_hash = hash_password(password)
        user_id = user_model.create_user(name, email, password_hash)

        return jsonify({
            "message": "Registration successful",
            "user_id": user_id,
        }), 201

    @auth_bp.route("/login", methods=["POST"])
    def login():
        """Authenticate user and return JWT token."""
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        email = data.get("email", "").strip().lower()
        password = data.get("password", "")

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        user = user_model.find_by_email(email)
        if not user or not check_password(password, user["password"]):
            return jsonify({"error": "Invalid email or password"}), 401

        # Check if user is banned
        if user.get("is_banned", False):
            return jsonify({"error": "Your account has been suspended. Contact support."}), 403

        token = generate_token(str(user["_id"]), user.get("role", "user"))

        return jsonify({
            "message": "Login successful",
            "token": token,
            "user": {
                "id": str(user["_id"]),
                "name": user["name"],
                "email": user["email"],
                "role": user.get("role", "user"),
            },
        })

    @auth_bp.route("/profile", methods=["GET"])
    @login_required
    def profile():
        """Get current user's profile."""
        user = user_model.find_by_id(g.user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        return jsonify({
            "user": {
                "id": str(user["_id"]),
                "name": user["name"],
                "email": user["email"],
                "role": user.get("role", "user"),
                "created_at": user.get("created_at", "").isoformat() if user.get("created_at") else None,
            }
        })

    @auth_bp.route("/profile", methods=["PUT"])
    @login_required
    def update_profile():
        """Update current user's profile."""
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        update_data = {}
        if data.get("name"):
            update_data["name"] = data["name"].strip()

        if update_data:
            user_model.update_user(g.user_id, update_data)

        return jsonify({"message": "Profile updated successfully"})

    return auth_bp
