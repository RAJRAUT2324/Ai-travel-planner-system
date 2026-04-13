"""
Verification script for NVIDIA NIM AI Service.
"""

import sys
import os

# Add the current directory to sys.path to import local modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.nvidia_service import generate_itinerary, suggest_destination
from config import Config

def test_nvidia():
    print("--- Testing NVIDIA NIM API Integration ---")
    
    # Test suggest_destination
    print("\n1. Testing suggest_destination...")
    form_data = {
        "budget": 2000,
        "travel_type": "family",
        "duration": 5,
        "interests": ["beaches", "adventure"]
    }
    
    result = suggest_destination(form_data)
    if result.get("success"):
        print("[SUCCESS] suggest_destination success!")
        # print(json.dumps(result.get("data"), indent=2))
        suggestions = result.get("data", {}).get("suggestions", [])
        if suggestions:
            print(f"   Found {len(suggestions)} suggestions.")
            for i, s in enumerate(suggestions):
                print(f"   - {s.get('name')} ({s.get('country')})")
        else:
            print("   [ERROR] No suggestions found in response.")
    else:
        print(f"   [ERROR] suggest_destination failed: {result.get('error')}")

    # Test generate_itinerary
    print("\n2. Testing generate_itinerary...")
    itinerary_result = generate_itinerary(form_data)
    if itinerary_result.get("success"):
        print("[SUCCESS] generate_itinerary success!")
        itinerary = itinerary_result.get("itinerary", {})
        print(f"   Destination: {itinerary.get('destination_name')}")
        print(f"   Summary: {itinerary.get('trip_summary')[:100]}...")
        print(f"   Days generated: {len(itinerary.get('days', []))}")
    else:
        print(f"   [ERROR] generate_itinerary failed: {itinerary_result.get('error')}")

if __name__ == "__main__":
    test_nvidia()
