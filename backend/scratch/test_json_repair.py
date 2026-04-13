import sys
import os
import json

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from services.nvidia_service import _repair_json

def test_repair():
    print("Testing JSON Repair Logic...")
    
    # Case 1: Trailing comma in object
    case1 = '{"name": "test", "tags": ["a", "b",], }'
    repaired1 = _repair_json(case1)
    print(f"Case 1 Repaired: {repaired1}")
    try:
        json.loads(repaired1)
        print("PASSED Case 1")
    except:
        print("FAILED Case 1")
        
    # Case 2: Trailing comma in array
    case2 = '{"items": [1, 2, 3, ]}'
    repaired2 = _repair_json(case2)
    print(f"Case 2 Repaired: {repaired2}")
    try:
        json.loads(repaired2)
        print("PASSED Case 2")
    except:
        print("FAILED Case 2")

    # Case 3: Mixed markdown chatter
    case3 = 'Here is your json: {"val": 1} Hope you like it!'
    repaired3 = _repair_json(case3)
    print(f"Case 3 Repaired: {repaired3}")
    try:
        json.loads(repaired3)
        print("PASSED Case 3")
    except:
        print("FAILED Case 3")

if __name__ == "__main__":
    test_repair()
