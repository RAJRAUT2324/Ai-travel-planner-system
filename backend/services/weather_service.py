"""
Weather Service — fetches real-time weather data from OpenWeatherMap API.
"""

import requests
from config import Config


def get_weather(city: str) -> dict:
    """
    Fetch current weather for a city using OpenWeatherMap API.

    Args:
        city: City name (e.g., "Paris", "Tokyo")

    Returns:
        Weather data dict with temperature, condition, and travel advice
    """
    if not Config.WEATHER_API_KEY:
        return {"success": False, "error": "Weather API key not configured"}

    try:
        url = "https://api.openweathermap.org/data/2.5/weather"
        params = {
            "q": city,
            "appid": Config.WEATHER_API_KEY,
            "units": "metric",
        }
        response = requests.get(url, params=params, timeout=10)
        data = response.json()

        if response.status_code != 200:
            return {"success": False, "error": data.get("message", "Weather API error")}

        temp = data["main"]["temp"]
        condition = data["weather"][0]["main"]
        description = data["weather"][0]["description"]
        humidity = data["main"]["humidity"]
        wind_speed = data["wind"]["speed"]
        icon = data["weather"][0]["icon"]

        # Generate smart travel advice
        advice = _generate_advice(temp, condition, humidity)

        return {
            "success": True,
            "weather": {
                "temperature": temp,
                "feels_like": data["main"]["feels_like"],
                "condition": condition,
                "description": description.title(),
                "humidity": humidity,
                "wind_speed": wind_speed,
                "icon": f"https://openweathermap.org/img/wn/{icon}@2x.png",
                "travel_advice": advice,
            },
        }

    except requests.exceptions.Timeout:
        return {"success": False, "error": "Weather service timeout"}
    except Exception as e:
        return {"success": False, "error": str(e)}


def _generate_advice(temp: float, condition: str, humidity: float) -> str:
    """Generate smart travel advice based on weather conditions."""
    advices = []

    # Temperature advice
    if temp > 35:
        advices.append("🔥 Extreme heat! Stay hydrated, wear sunscreen, and avoid outdoor activities during peak hours (12-3 PM).")
    elif temp > 28:
        advices.append("☀️ Warm weather. Light clothing recommended. Carry water and sun protection.")
    elif temp > 18:
        advices.append("🌤️ Pleasant weather! Great for outdoor activities and sightseeing.")
    elif temp > 8:
        advices.append("🧥 Cool weather. Bring a jacket or sweater for outdoor activities.")
    else:
        advices.append("❄️ Cold weather! Pack warm layers, gloves, and a hat.")

    # Condition advice
    if condition in ["Rain", "Drizzle"]:
        advices.append("🌧️ Rain expected. Carry an umbrella and waterproof shoes.")
    elif condition == "Thunderstorm":
        advices.append("⛈️ Thunderstorm alert! Consider indoor activities and check local advisories.")
    elif condition == "Snow":
        advices.append("🌨️ Snowfall expected. Dress warmly and be cautious on roads.")
    elif condition in ["Fog", "Mist", "Haze"]:
        advices.append("🌫️ Low visibility. Drive carefully and plan for potential travel delays.")

    # Humidity advice
    if humidity > 80:
        advices.append("💧 High humidity. Wear breathable fabrics and stay cool.")

    return " ".join(advices)
