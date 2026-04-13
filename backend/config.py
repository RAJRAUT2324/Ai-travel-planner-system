"""
Application configuration module.
Loads environment variables and provides centralized config access.
"""

import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Application configuration class."""

    # Flask
    SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret-key")
    DEBUG = os.getenv("DEBUG", "False").lower() == "true"

    # MongoDB
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/ai_travel_planner")
    DB_NAME = "ai_travel_planner"

    # JWT
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "fallback-jwt-secret")
    JWT_ACCESS_TOKEN_EXPIRES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES", 86400))

    # Gemini AI
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

    # NVIDIA NIM API
    NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY", "")

    # Groq API
    GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

    # Weather API
    WEATHER_API_KEY = os.getenv("WEATHER_API_KEY", "")

    # Server
    PORT = int(os.getenv("PORT", 5000))
