import requests
import json

AW_BASE_URL = "http://localhost:5600/api/0"

def debug_aw():
    print("--- ACTIVITYWATCH DEBUG ---")
    try:
        res = requests.get(f"{AW_BASE_URL}/buckets")
        if res.status_code == 200:
            buckets = res.json()
            print(f"Found {len(buckets)} buckets:")
            for b_id, b_data in buckets.items():
                print(f" - {b_id} (Type: {b_data.get('type')})")
        else:
            print(f"Failed to fetch buckets. Status: {res.status_code}")
    except Exception as e:
        print(f"Error connecting to ActivityWatch: {e}")
        print("Is ActivityWatch running at http://localhost:5600?")

if __name__ == "__main__":
    debug_aw()
