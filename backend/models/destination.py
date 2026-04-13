"""
Destination model — handles destination documents in MongoDB.
Schema: name, city, country, description, budget_min, budget_max,
        best_season, nearby_hotels, nearby_attractions, travel_tips,
        tags, image_ids, coordinates, created_at
"""

from datetime import datetime, timezone
from bson import ObjectId


class DestinationModel:
    """Manages destination documents in the 'destinations' collection."""

    def __init__(self, db):
        self.collection = db["destinations"]
        # Create text index for search
        self.collection.create_index([("name", "text"), ("city", "text"),
                                       ("country", "text"), ("tags", "text")])

    def create(self, data: dict) -> str:
        """Insert a new destination."""
        destination = {
            "name": data.get("name"),
            "city": data.get("city"),
            "country": data.get("country"),
            "description": data.get("description", ""),
            "budget_min": data.get("budget_min", 0),
            "budget_max": data.get("budget_max", 0),
            "best_season": data.get("best_season", ""),
            "nearby_hotels": data.get("nearby_hotels", []),
            "nearby_attractions": data.get("nearby_attractions", []),
            "travel_tips": data.get("travel_tips", []),
            "tags": data.get("tags", []),
            "image_ids": data.get("image_ids", []),
            "coordinates": data.get("coordinates", {"lat": 0, "lng": 0}),
            "created_at": datetime.now(timezone.utc),
        }
        result = self.collection.insert_one(destination)
        return str(result.inserted_id)

    def find_by_id(self, dest_id: str) -> dict:
        """Find a destination by ID."""
        if not dest_id or not isinstance(dest_id, str) or len(dest_id) != 24:
            return None
            
        try:
            doc = self.collection.find_one({"_id": ObjectId(dest_id)})
            if doc:
                doc["_id"] = str(doc["_id"])
            return doc
        except:
            return None

    def get_all(self, page: int = 1, limit: int = 12, search: str = None,
                tags: list = None, budget_max: float = None) -> dict:
        """Get paginated destinations with optional filters."""
        query = {}

        if search:
            query["$text"] = {"$search": search}

        if tags:
            query["tags"] = {"$in": tags}

        if budget_max:
            query["budget_min"] = {"$lte": budget_max}

        total = self.collection.count_documents(query)
        skip = (page - 1) * limit
        destinations = list(
            self.collection.find(query)
            .sort("created_at", -1)
            .skip(skip)
            .limit(limit)
        )

        for d in destinations:
            d["_id"] = str(d["_id"])

        return {
            "destinations": destinations,
            "total": total,
            "page": page,
            "pages": (total + limit - 1) // limit,
        }

    def update(self, dest_id: str, data: dict) -> bool:
        """Update a destination."""
        if not dest_id or not isinstance(dest_id, str) or len(dest_id) != 24:
            return False
            
        try:
            result = self.collection.update_one(
                {"_id": ObjectId(dest_id)}, {"$set": data}
            )
            return result.modified_count > 0
        except:
            return False

    def delete(self, dest_id: str) -> bool:
        """Delete a destination."""
        if not dest_id or not isinstance(dest_id, str) or len(dest_id) != 24:
            return False
            
        try:
            result = self.collection.delete_one({"_id": ObjectId(dest_id)})
            return result.deleted_count > 0
        except:
            return False

    def get_similar(self, dest_id: str, limit: int = 5) -> list:
        """Find similar destinations by tags and budget range."""
        dest = self.find_by_id(dest_id)
        if not dest:
            return []

        query = {
            "_id": {"$ne": ObjectId(dest_id)},
            "$or": [
                {"tags": {"$in": dest.get("tags", [])}},
                {
                    "budget_min": {"$lte": dest.get("budget_max", 999999)},
                    "budget_max": {"$gte": dest.get("budget_min", 0)},
                },
            ],
        }
        results = list(self.collection.find(query).limit(limit))
        for r in results:
            r["_id"] = str(r["_id"])
        return results

    def count(self) -> int:
        """Return total destination count."""
        return self.collection.count_documents({})

    def get_all_simple(self) -> list:
        """Get all destinations with minimal fields for dropdowns."""
        destinations = self.collection.find(
            {}, {"name": 1, "city": 1, "country": 1, "tags": 1}
        )
        return [{**d, "_id": str(d["_id"])} for d in destinations]
