"""
Itinerary model — stores AI-generated travel itineraries per user.
Schema: user_id, destination_id, plan_data, form_input, created_at
"""

from datetime import datetime, timezone
from bson import ObjectId


class ItineraryModel:
    """Manages itinerary documents in the 'itineraries' collection."""

    def __init__(self, db):
        self.collection = db["itineraries"]
        self.collection.create_index("user_id")

    def save(self, user_id: str, destination_id: str, plan_data: dict,
             form_input: dict) -> str:
        """Save a generated itinerary."""
        itinerary = {
            "user_id": ObjectId(user_id) if isinstance(user_id, str) and len(user_id) == 24 else user_id,
            "destination_id": ObjectId(destination_id) if (destination_id and isinstance(destination_id, str) and len(destination_id) == 24) else None,
            "plan_data": plan_data,
            "form_input": form_input,
            "created_at": datetime.now(timezone.utc),
        }
        result = self.collection.insert_one(itinerary)
        return str(result.inserted_id)

    def get_by_user(self, user_id: str) -> list:
        """Get all itineraries for a user."""
        pipeline = [
            {"$match": {"user_id": ObjectId(user_id)}},
            {"$lookup": {
                "from": "destinations",
                "localField": "destination_id",
                "foreignField": "_id",
                "as": "destination",
            }},
            {"$unwind": {"path": "$destination", "preserveNullAndEmptyArrays": True}},
            {"$project": {
                "_id": {"$toString": "$_id"},
                "plan_data": 1,
                "form_input": 1,
                "created_at": 1,
                "destination_name": "$destination.name",
                "destination_city": "$destination.city",
            }},
            {"$sort": {"created_at": -1}},
        ]
        return list(self.collection.aggregate(pipeline))

    def find_by_id(self, itinerary_id: str) -> dict:
        """Find an itinerary by ID."""
        if not itinerary_id or not isinstance(itinerary_id, str) or len(itinerary_id) != 24:
            return None
        doc = self.collection.find_one({"_id": ObjectId(itinerary_id)})
        if doc:
            doc["_id"] = str(doc["_id"])
            if doc.get("user_id"):
                doc["user_id"] = str(doc["user_id"])
            if doc.get("destination_id"):
                doc["destination_id"] = str(doc["destination_id"])
        return doc

    def delete(self, itinerary_id: str) -> bool:
        """Delete an itinerary by ID."""
        if not itinerary_id or not isinstance(itinerary_id, str) or len(itinerary_id) != 24:
            return False
        try:
            result = self.collection.delete_one({"_id": ObjectId(itinerary_id)})
            return result.deleted_count > 0
        except:
            return False

    def count(self) -> int:
        """Return total itinerary count."""
        return self.collection.count_documents({})

    def get_all(self, limit: int = 50) -> list:
        """Get all itineraries with user and destination info."""
        pipeline = [
            {"$lookup": {
                "from": "users",
                "localField": "user_id",
                "foreignField": "_id",
                "as": "user",
            }},
            {"$unwind": {"path": "$user", "preserveNullAndEmptyArrays": True}},
            {"$lookup": {
                "from": "destinations",
                "localField": "destination_id",
                "foreignField": "_id",
                "as": "destination",
            }},
            {"$unwind": {"path": "$destination", "preserveNullAndEmptyArrays": True}},
            {"$project": {
                "_id": {"$toString": "$_id"},
                "created_at": 1,
                "user_name": "$user.name",
                "destination_name": { "$ifNull": ["$destination.name", "$plan_data.destination_name"] },
                "total_cost": "$plan_data.total_estimated_cost",
                "duration": "$form_input.duration",
            }},
            {"$sort": {"created_at": -1}},
            {"$limit": limit}
        ]
        return list(self.collection.aggregate(pipeline))
