"""
Review model — handles review documents in MongoDB.
Schema: user_id, destination_id, rating, comment, image_id, created_at
"""

from datetime import datetime, timezone
from bson import ObjectId


class ReviewModel:
    """Manages review documents in the 'reviews' collection."""

    def __init__(self, db):
        self.collection = db["reviews"]
        self.collection.create_index("destination_id")
        self.collection.create_index("user_id")

    def create(self, user_id: str, destination_id: str, rating: int,
               comment: str, image_id: str = None) -> str:
        """Create a new review."""
        review = {
            "user_id": ObjectId(user_id),
            "destination_id": ObjectId(destination_id),
            "rating": rating,
            "comment": comment,
            "image_id": image_id,
            "created_at": datetime.now(timezone.utc),
        }
        result = self.collection.insert_one(review)
        return str(result.inserted_id)

    def get_by_destination(self, destination_id: str) -> list:
        """Get all reviews for a destination."""
        pipeline = [
            {"$match": {"destination_id": ObjectId(destination_id)}},
            {"$lookup": {
                "from": "users",
                "localField": "user_id",
                "foreignField": "_id",
                "as": "user",
            }},
            {"$unwind": {"path": "$user", "preserveNullAndEmptyArrays": True}},
            {"$project": {
                "_id": {"$toString": "$_id"},
                "rating": 1,
                "comment": 1,
                "image_id": 1,
                "created_at": 1,
                "user_name": "$user.name",
                "user_id": {"$toString": "$user_id"},
            }},
            {"$sort": {"created_at": -1}},
        ]
        return list(self.collection.aggregate(pipeline))

    def get_all(self) -> list:
        """Get all reviews (admin use) with user and destination info."""
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
                "rating": 1,
                "comment": 1,
                "created_at": 1,
                "user_name": "$user.name",
                "destination_name": "$destination.name",
            }},
            {"$sort": {"created_at": -1}},
        ]
        return list(self.collection.aggregate(pipeline))

    def delete(self, review_id: str) -> bool:
        """Delete a review."""
        result = self.collection.delete_one({"_id": ObjectId(review_id)})
        return result.deleted_count > 0

    def get_avg_rating(self, destination_id: str) -> float:
        """Get average rating for a destination."""
        pipeline = [
            {"$match": {"destination_id": ObjectId(destination_id)}},
            {"$group": {"_id": None, "avg": {"$avg": "$rating"}}},
        ]
        result = list(self.collection.aggregate(pipeline))
        return round(result[0]["avg"], 1) if result else 0

    def count(self) -> int:
        """Return total review count."""
        return self.collection.count_documents({})
