import pymongo
from datetime import datetime, timezone

def seed():
    client = pymongo.MongoClient("mongodb://localhost:27017/")
    db = client["ai_travel_planner"]
    collection = db["destinations"]
    
    # Clear existing to avoid duplicates if re-run
    collection.delete_many({"is_seed": True})
    
    destinations = [
        {
            "name": "Kyoto Ancient Trails",
            "city": "Kyoto",
            "country": "Japan",
            "description": "The cultural heart of Japan, Kyoto is world-renowned for its thousands of classical Buddhist temples, Shinto shrines, and stunning Zen gardens.",
            "budget_min": 1200,
            "budget_max": 3500,
            "best_season": "Spring (March-April)",
            "nearby_hotels": ["The Ritz-Carlton Kyoto", "Ace Hotel Kyoto", "Park Hyatt"],
            "nearby_attractions": ["Fushimi Inari", "Kinkaku-ji", "Arashiyama Bamboo Grove"],
            "travel_tips": ["Rent a kimono for the day", "Use the efficient bus network", "Book shrines in advance"],
            "tags": ["culture", "history", "temples", "luxury"],
            "image_ids": [], # Will use Unsplash fallback
            "coordinates": {"lat": 35.0116, "lng": 135.7681},
            "created_at": datetime.now(timezone.utc),
            "is_seed": True
        },
        {
            "name": "Lisbon Sunsets",
            "city": "Lisbon",
            "country": "Portugal",
            "description": "Known for its hilly, sun-drenched landscape, historic trams, and stunning yellow-tiled architecture overlooking the Tagus River.",
            "budget_min": 800,
            "budget_max": 2200,
            "best_season": "Autumn (September-October)",
            "nearby_hotels": ["Bairro Alto Hotel", "The Lumiares", "Memmo Alfama"],
            "nearby_attractions": ["Belem Tower", "Alfama District", "Sintra"],
            "travel_tips": ["Wear comfortable shoes for the hills", "Try the Pasteis de Nata", "Use the 28 tram early"],
            "tags": ["city", "architecture", "foodie", "affordable"],
            "image_ids": [],
            "coordinates": {"lat": 38.7223, "lng": -9.1393},
            "created_at": datetime.now(timezone.utc),
            "is_seed": True
        },
        {
            "name": "Cusco & Machu Picchu",
            "city": "Cusco",
            "country": "Peru",
            "description": "The gateway to the Sacred Valley and Machu Picchu. A fascinating fusion of indigenous Andean culture and Spanish colonial architecture.",
            "budget_min": 1000,
            "budget_max": 4000,
            "best_season": "Dry Season (May-September)",
            "nearby_hotels": ["Belmond Hotel Monasterio", "Palacio del Inka", "JW Marriott"],
            "nearby_attractions": ["Sacsayhuaman", "Plaza de Armas", "Machu Picchu"],
            "travel_tips": ["Drink Coca tea for altitude", "Book Inca Trail 6 months out", "Visit the local markets"],
            "tags": ["adventure", "hiking", "culture", "history"],
            "image_ids": [],
            "coordinates": {"lat": -13.5319, "lng": -71.9675},
            "created_at": datetime.now(timezone.utc),
            "is_seed": True
        },
        {
            "name": "Cape Town Horizons",
            "city": "Cape Town",
            "country": "South Africa",
            "description": "A breathtaking city set between Table Mountain and the Atlantic Ocean, offering urban sophistication and rugged natural beauty.",
            "budget_min": 950,
            "budget_max": 3000,
            "best_season": "Summer (December-February)",
            "nearby_hotels": ["The Silo Hotel", "Mount Nelson", "Twelve Apostles"],
            "nearby_attractions": ["Table Mountain", "Robben Island", "Cape Winelands"],
            "travel_tips": ["Check the wind for the cable car", "Visit Boulder Beach penguins", "Drive the Chapman Peak"],
            "tags": ["nature", "wildlife", "coastal", "mountains"],
            "image_ids": [],
            "coordinates": {"lat": -33.9249, "lng": 18.4241},
            "created_at": datetime.now(timezone.utc),
            "is_seed": True
        }
    ]
    
    collection.insert_many(destinations)
    print(f"Successfully seeded {len(destinations)} destinations.")

if __name__ == "__main__":
    seed()
