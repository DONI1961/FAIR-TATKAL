import requests

BASE_URL = "http://localhost:5001"

def test_published_trains():
    print("Testing /published_trains...")
    try:
        res = requests.get(f"{BASE_URL}/published_trains")
        print(f"Status: {res.status_code}")
        print(f"Data: {res.json()}")
        
        # Test with a date filter (even if it returns empty, we check if it works)
        res_date = requests.get(f"{BASE_URL}/published_trains?date=2024-01-01")
        print(f"Status with date filter: {res_date.status_code}")
        print(f"Data with date filter: {res_date.json()}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_published_trains()
