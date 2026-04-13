import sys
import os

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from services.discovery_service import discover_destination
from config import Config

def test():
    print(f"Testing Discovery for 'amravati'...")
    print(f"NVIDIA API KEY length: {len(Config.NVIDIA_API_KEY) if Config.NVIDIA_API_KEY else 0}")
    print(f"GROQ API KEY length: {len(Config.GROQ_API_KEY) if Config.GROQ_API_KEY else 0}")
    
    result = discover_destination("amravati")
    print(f"Result Success: {result.get('success')}")
    if result.get('success'):
        print("Data found!")
        print(result.get('data'))
    else:
        print(f"Error: {result.get('error')}")
        if 'text' in result:
            print("Raw Text Returned:")
            print(result['text'])

if __name__ == "__main__":
    test()
