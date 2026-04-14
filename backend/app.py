"""
AI Travel Planner Smart Guide — Flask Application Entry Point.

This is the main entry point for the Flask backend.
It initializes the database connection, models, services,
and registers all route blueprints.
"""

from flask import Flask
from flask_cors import CORS
from pymongo import MongoClient
from config import Config

# Models
from models.user import UserModel
from models.destination import DestinationModel
from models.review import ReviewModel
from models.itinerary import ItineraryModel
from models.analytics import AnalyticsModel

# Services
from services.gridfs_service import GridFSService

# Routes
from routes.auth import init_auth_routes
from routes.destinations import init_destination_routes
from routes.reviews import init_review_routes
from routes.itinerary import init_itinerary_routes
from routes.weather import init_weather_routes
from routes.admin import init_admin_routes
from routes.chat import chat_bp


def create_app():
    """Application factory — creates and configures the Flask app."""
    app = Flask(__name__)
    app.config.from_object(Config)

    # CORS — allow frontend
    CORS(app, resources={r"/api/*": {"origins": ["*"]}})

    # MongoDB connection
    client = MongoClient(Config.MONGO_URI)
    db = client[Config.DB_NAME]

    # Initialize models
    user_model = UserModel(db)
    destination_model = DestinationModel(db)
    review_model = ReviewModel(db)
    itinerary_model = ItineraryModel(db)
    analytics_model = AnalyticsModel(db)

    # Initialize services
    gridfs_service = GridFSService(db)

    # Register blueprints
    app.register_blueprint(
        init_auth_routes(user_model),
        url_prefix="/api/auth"
    )
    app.register_blueprint(
        init_destination_routes(destination_model, gridfs_service, analytics_model),
        url_prefix="/api/destinations"
    )
    app.register_blueprint(
        init_review_routes(review_model, gridfs_service),
        url_prefix="/api/reviews"
    )
    app.register_blueprint(
        init_itinerary_routes(itinerary_model, destination_model, analytics_model),
        url_prefix="/api/itinerary"
    )
    app.register_blueprint(
        init_weather_routes(),
        url_prefix="/api/weather"
    )
    app.register_blueprint(
        init_admin_routes(user_model, destination_model, review_model,
                         itinerary_model, analytics_model),
        url_prefix="/api/admin"
    )
    app.register_blueprint(chat_bp, url_prefix="/api/agent")

    # Health check endpoint
    @app.route("/api/health")
    def health():
        return {"status": "healthy", "service": "AI Travel Planner API"}

    # Create default admin user if not exists
    with app.app_context():
        from utils.auth_utils import hash_password
        if not user_model.find_by_email("admin@travelplanner.com"):
            user_model.create_user(
                name="Admin",
                email="admin@travelplanner.com",
                password_hash=hash_password("admin123"),
                role="admin"
            )
            print("[SUCCESS] Default admin user created: admin@travelplanner.com / admin123")

    return app


if __name__ == "__main__":
    app = create_app()
    print("[RUNNING] AI Travel Planner API running on http://localhost:5000")
    app.run(host="0.0.0.0", port=Config.PORT, debug=Config.DEBUG)
