import sys
import os
import random
from pymongo import MongoClient
from datetime import datetime, timezone, timedelta

# Add the current directory to sys.path to import local modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config import Config
from utils.auth_utils import hash_password

def seed_database():
    print(f"--- Seeding Database to Atlas Cluster ---")
    
    client = MongoClient(Config.MONGO_URI)
    db = client[Config.DB_NAME]
    
    # 1. Clear existing data
    print("Clearing existing collections...")
    db.users.delete_many({})
    db.destinations.delete_many({})
    db.itineraries.delete_many({})
    db.reviews.delete_many({})

    # 2. Create Admin User
    print("Creating admin user...")
    admin_user = {
        "name": "Admin",
        "email": "admin@travelplanner.com",
        "password": hash_password("admin123"),
        "role": "admin",
        "created_at": datetime.now(timezone.utc)
    }
    db.users.insert_one(admin_user)
    
    # Create Dummy Regular Users
    print("Creating dummy users...")
    dummy_users = [
        {"name": "Shreyas Dakhole", "email": "shreyas@example.com", "password": hash_password("password123"), "role": "user", "created_at": datetime.now(timezone.utc)},
        {"name": "Alice Wonderland", "email": "alice@example.com", "password": hash_password("password123"), "role": "user", "created_at": datetime.now(timezone.utc)},
        {"name": "John Doe", "email": "john@example.com", "password": hash_password("password123"), "role": "user", "created_at": datetime.now(timezone.utc)}
    ]
    user_ids = db.users.insert_many(dummy_users).inserted_ids

    # 3. Dummy Destinations
    print("Seeding dummy destinations...")
    destinations_data = [
        {"name": "Kyoto Sanctuary", "city": "Kyoto", "country": "Japan", "description": "Zen temples and cherry blossoms.", "tags": ["culture", "zen"], "coordinates": {"lat": 35.0116, "lng": 135.7681}},
        {"name": "Parisian Lights", "city": "Paris", "country": "France", "description": "The city of love and art.", "tags": ["romantic", "art"], "coordinates": {"lat": 48.8584, "lng": 2.2945}},
        {"name": "Bali Tropical", "city": "Ubud", "country": "Indonesia", "description": "Lush jungles and terraces.", "tags": ["nature", "tropical"], "coordinates": {"lat": -8.5069, "lng": 115.2625}}
    ]
    for d in destinations_data:
        d["created_at"] = datetime.now(timezone.utc)
    
    dest_ids = db.destinations.insert_many(destinations_data).inserted_ids

    # 4. Dummy Itineraries
    print("Seeding dummy itineraries...")
    itineraries = []
    for uid in user_ids:
        for _ in range(2):
            dest = random.choice(destinations_data)
            itineraries.append({
                "user_id": uid,
                "destination_name": dest["name"],
                "duration": random.randint(3, 10),
                "budget": random.randint(1000, 5000),
                "total_cost": random.randint(800, 4500),
                "created_at": datetime.now(timezone.utc) - timedelta(days=random.randint(1, 30))
            })
    db.itineraries.insert_many(itineraries)

    # 5. Dummy Reviews
    print("Seeding dummy reviews...")
    reviews = []
    for uid, name in zip(user_ids, ["Shreyas Dakhole", "Alice Wonderland", "John Doe"]):
        dest = random.choice(destinations_data)
        reviews.append({
            "user_id": uid,
            "user_name": name,
            "destination_name": dest["name"],
            "rating": random.randint(4, 5),
            "comment": "Absolutely incredible experience! The AI planned everything perfectly.",
            "created_at": datetime.now(timezone.utc)
        })
    db.reviews.insert_many(reviews)

    print(f"[SUCCESS] Database seeded with {len(user_ids)+1} users, {len(dest_ids)} destinations, {len(itineraries)} itineraries, and {len(reviews)} reviews.")

if __name__ == "__main__":
    seed_database()
