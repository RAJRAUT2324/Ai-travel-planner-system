"""
Input validation utilities for request data.
"""

import re


def validate_email(email: str) -> bool:
    """Validate email format."""
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return bool(re.match(pattern, email))


def validate_password(password: str) -> tuple:
    """Validate password strength. Returns (is_valid, message)."""
    if len(password) < 6:
        return False, "Password must be at least 6 characters long"
    return True, "Password is valid"


def validate_registration(data: dict) -> tuple:
    """Validate registration data. Returns (is_valid, message)."""
    required = ["name", "email", "password"]
    for field in required:
        if not data.get(field):
            return False, f"{field} is required"

    if not validate_email(data["email"]):
        return False, "Invalid email format"

    is_valid, msg = validate_password(data["password"])
    if not is_valid:
        return False, msg

    return True, "Valid"


def validate_destination(data: dict) -> tuple:
    """Validate destination creation data."""
    required = ["name", "city", "country", "description"]
    for field in required:
        if not data.get(field):
            return False, f"{field} is required"
    return True, "Valid"


def validate_review(data: dict) -> tuple:
    """Validate review data."""
    if not data.get("rating") or not isinstance(data["rating"], (int, float)):
        return False, "Rating is required and must be a number"
    if data["rating"] < 1 or data["rating"] > 5:
        return False, "Rating must be between 1 and 5"
    if not data.get("comment"):
        return False, "Comment is required"
    return True, "Valid"


def validate_planner(data: dict) -> tuple:
    """Validate travel planner form data."""
    required = ["budget", "travel_type", "duration"]
    for field in required:
        if not data.get(field):
            return False, f"{field} is required"

    if not isinstance(data["budget"], (int, float)) or data["budget"] <= 0:
        return False, "Budget must be a positive number"
    if not isinstance(data["duration"], int) or data["duration"] <= 0:
        return False, "Duration must be a positive integer"
    if data["travel_type"] not in ["solo", "couple", "family", "friends"]:
        return False, "Invalid travel type"

    return True, "Valid"
