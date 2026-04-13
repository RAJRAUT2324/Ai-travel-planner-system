"""
User model — handles user document operations in MongoDB.
Schema: name, email, password_hash, role, created_at
"""

from datetime import datetime, timezone
from bson import ObjectId


class UserModel:
    """Manages user documents in the 'users' collection."""

    def __init__(self, db):
        self.collection = db["users"]
        # Create unique index on email
        self.collection.create_index("email", unique=True)

    def create_user(self, name: str, email: str, password_hash: str, role: str = "user") -> str:
        """Insert a new user and return the inserted ID."""
        user = {
            "name": name,
            "email": email,
            "password": password_hash,
            "role": role,
            "created_at": datetime.now(timezone.utc),
        }
        result = self.collection.insert_one(user)
        return str(result.inserted_id)

    def find_by_email(self, email: str) -> dict:
        """Find a user by email."""
        return self.collection.find_one({"email": email})

    def find_by_id(self, user_id: str) -> dict:
        """Find a user by ObjectId."""
        return self.collection.find_one({"_id": ObjectId(user_id)})

    def get_all_users(self) -> list:
        """Return all users (admin use)."""
        users = self.collection.find({}, {"password": 0})
        return [{**u, "_id": str(u["_id"])} for u in users]

    def update_user(self, user_id: str, data: dict) -> bool:
        """Update user fields."""
        result = self.collection.update_one(
            {"_id": ObjectId(user_id)}, {"$set": data}
        )
        return result.modified_count > 0

    def count_users(self) -> int:
        """Return total user count."""
        return self.collection.count_documents({})
