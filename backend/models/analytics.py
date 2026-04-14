"""
Analytics model — logs search/view events for dashboard analytics.
Schema: event_type, data, user_id, timestamp
"""

from datetime import datetime, timezone, timedelta
from bson import ObjectId


class AnalyticsModel:
    """Manages analytics log documents."""

    def __init__(self, db):
        self.collection = db["analytics"]
        self.collection.create_index("event_type")
        self.collection.create_index("timestamp")

    def log_event(self, event_type: str, data: dict, user_id: str = None):
        """Log an analytics event."""
        event = {
            "event_type": event_type,
            "data": data,
            "user_id": ObjectId(user_id) if (user_id and isinstance(user_id, str) and len(user_id) == 24) else None,
            "timestamp": datetime.now(timezone.utc),
        }
        self.collection.insert_one(event)

    def get_most_searched(self, limit: int = 10) -> list:
        """Get most searched destination names."""
        pipeline = [
            {"$match": {"event_type": "search"}},
            {"$group": {"_id": "$data.query", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": limit},
        ]
        return list(self.collection.aggregate(pipeline))

    def get_popular_tags(self, limit: int = 10) -> list:
        """Get most popular travel type tags."""
        pipeline = [
            {"$match": {"event_type": "plan_generated"}},
            {"$unwind": "$data.interests"},
            {"$group": {"_id": "$data.interests", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": limit},
        ]
        return list(self.collection.aggregate(pipeline))

    def get_avg_budget(self) -> float:
        """Get average user budget from planning events."""
        pipeline = [
            {"$match": {"event_type": "plan_generated"}},
            {"$group": {"_id": None, "avg_budget": {"$avg": "$data.budget"}}},
        ]
        result = list(self.collection.aggregate(pipeline))
        return round(result[0]["avg_budget"], 2) if result else 0

    def get_recent_activity(self, limit: int = 20) -> list:
        """Get recent analytics events."""
        events = list(
            self.collection.find()
            .sort("timestamp", -1)
            .limit(limit)
        )
        for e in events:
            e["_id"] = str(e["_id"])
            if e.get("user_id"):
                e["user_id"] = str(e["user_id"])
        return events

    def get_daily_counts(self, days: int = 30) -> list:
        """Get daily event counts for the last N days, grouped by event_type."""
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        pipeline = [
            {"$match": {"timestamp": {"$gte": cutoff}}},
            {"$group": {
                "_id": {
                    "date": {"$dateToString": {"format": "%Y-%m-%d", "date": "$timestamp"}},
                    "event_type": "$event_type"
                },
                "count": {"$sum": 1}
            }},
            {"$sort": {"_id.date": 1}},
        ]
        results = list(self.collection.aggregate(pipeline))
        return [{"date": r["_id"]["date"], "event_type": r["_id"]["event_type"], "count": r["count"]} for r in results]
