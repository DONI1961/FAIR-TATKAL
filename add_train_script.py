import requests
from datetime import date, time

url = "http://localhost:5001/add_train"
payload = {
    "train_number": 12601,
    "train_name": "Chennai Express",
    "from_station": "Chennai",
    "to_station": "Bangalore",
    "departure_time": "10:00 AM",
    "departure_date": "2026-04-14",
    "arrival_time": "4:00 PM",
    "arrival_date": "2026-04-14",
    "seats": [10, 5, 2],
    "fare": [500, 1000, 2000],
    "takkal": True,
    "closing_time": "09:00:00",
    "opening_date": "2026-04-13",
    "opening_time": "10:00:00",
    "duration": 360,
    "closing_date": "2026-04-14"
}

response = requests.post(url, json=payload)
print(f"Status: {response.status_code}")
print(f"Response: {response.text}")
