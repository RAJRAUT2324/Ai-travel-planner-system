import sys
import os
import json

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from services.nvidia_service import generate_itinerary

def test_itinerary():
    print("Testing Itinerary Generation...")
    form_data = {
        "budget": 2000,
        "travel_type": "solo",
        "duration": 3,
        "interests": ["culture", "adventure"],
        "transport": "any",
        "stay": "hotel",
        "food": "any"
    }
    
    # Destination info for 'Amravati' (which we know discovery works for)
    dest_info = {
        "name": "Amravati",
        "city": "Amravati",
        "country": "India",
        "description": "Historical city in Maharashtra"
    }
    
    print("Triggering AI generation...")
    result = generate_itinerary(form_data, dest_info)
    
    print(f"Success: {result.get('success')}")
    if result.get('success'):
        print(" Itinerary generated!")
        # print(json.dumps(result.get('itinerary'), indent=2))
    else:
        print(f"Error: {result.get('error')}")
        if 'text' in result:
             print("Raw response text preview:")
             print(result['text'][:500])

if __name__ == "__main__":
    test_itinerary()
