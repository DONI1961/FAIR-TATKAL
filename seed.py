from sqlmodel import Session, create_engine, select
from datetime import date, time, timedelta, datetime
import os
import sys

# Add backend to path to import models
sys.path.append(os.path.abspath('backend'))

from model.journey import Journey
from model.user import User
from model.publish import Publish

DATABASE_URL = "sqlite:///backend/tatkal.db"
engine = create_engine(DATABASE_URL)

# Real IRCTC train details catalog
TRAIN_CATALOG = [
    {"num": 12951, "name": "Mumbai Rajdhani", "from": "Mumbai Central", "to": "New Delhi", "dep": "17:00", "arr": "08:32", "dur": 932, "fare": [1500, 2500, 3500], "takkal": True},
    {"num": 12952, "name": "Mumbai Rajdhani", "from": "New Delhi", "to": "Mumbai Central", "dep": "16:55", "arr": "08:35", "dur": 940, "fare": [1500, 2500, 3500], "takkal": True},
    {"num": 12027, "name": "Shatabdi Express", "from": "Chennai", "to": "Bangalore", "dep": "17:30", "arr": "22:25", "dur": 295, "fare": [500, 1000, 1500], "takkal": True},
    {"num": 12028, "name": "Shatabdi Express", "from": "Bangalore", "to": "Chennai", "dep": "06:00", "arr": "11:00", "dur": 300, "fare": [500, 1000, 1500], "takkal": True},
    {"num": 22436, "name": "Vande Bharat Exp", "from": "New Delhi", "to": "Varanasi", "dep": "06:00", "arr": "14:00", "dur": 480, "fare": [700, 1300, 2200], "takkal": False},
    {"num": 22435, "name": "Vande Bharat Exp", "from": "Varanasi", "to": "New Delhi", "dep": "15:00", "arr": "23:00", "dur": 480, "fare": [700, 1300, 2200], "takkal": False},
    {"num": 12301, "name": "Howrah Rajdhani", "from": "Howrah", "to": "New Delhi", "dep": "16:50", "arr": "10:05", "dur": 1035, "fare": [1600, 2600, 3600], "takkal": True},
    {"num": 12302, "name": "Howrah Rajdhani", "from": "New Delhi", "to": "Howrah", "dep": "16:50", "arr": "09:55", "dur": 1025, "fare": [1600, 2600, 3600], "takkal": True},
    {"num": 12123, "name": "Deccan Queen", "from": "Mumbai CSMT", "to": "Pune", "dep": "17:10", "arr": "20:25", "dur": 195, "fare": [150, 450, 750], "takkal": True},
    {"num": 12124, "name": "Deccan Queen", "from": "Pune", "to": "Mumbai CSMT", "dep": "07:15", "arr": "10:25", "dur": 190, "fare": [150, 450, 750], "takkal": True},
    {"num": 12675, "name": "Kovai Express", "from": "Chennai", "to": "Coimbatore", "dep": "06:10", "arr": "14:05", "dur": 475, "fare": [200, 600, 1000], "takkal": True},
    {"num": 12676, "name": "Kovai Express", "from": "Coimbatore", "to": "Chennai", "dep": "15:15", "arr": "23:00", "dur": 465, "fare": [200, 600, 1000], "takkal": True},
    {"num": 12229, "name": "Lucknow Mail", "from": "Lucknow", "to": "New Delhi", "dep": "22:00", "arr": "06:55", "dur": 535, "fare": [350, 850, 1400], "takkal": True},
    {"num": 12230, "name": "Lucknow Mail", "from": "New Delhi", "to": "Lucknow", "dep": "22:00", "arr": "06:50", "dur": 530, "fare": [350, 850, 1400], "takkal": True},
    {"num": 12621, "name": "Tamil Nadu Exp", "from": "Chennai", "to": "New Delhi", "dep": "22:00", "arr": "06:30", "dur": 1950, "fare": [800, 1500, 2400], "takkal": True},
    {"num": 12622, "name": "Tamil Nadu Exp", "from": "New Delhi", "to": "Chennai", "dep": "21:05", "arr": "06:35", "dur": 2010, "fare": [800, 1500, 2400], "takkal": True},
]

def parse_time(time_str):
    h, m = map(int, time_str.split(':'))
    return time(h, m)

def seed():
    from sqlmodel import SQLModel
    SQLModel.metadata.create_all(engine)
    
    with Session(engine) as session:
        # Clear existing trains so that we rebuild the database cleanly
        for j in session.exec(select(Journey)).all():
            session.delete(j)
        for p in session.exec(select(Publish)).all():
            session.delete(p)
        session.commit()

        today = date.today()
        # Seed across the next 30 days
        days_to_seed = 30
        
        for day_offset in range(days_to_seed):
            target_date = today + timedelta(days=day_offset)
            
            for t_data in TRAIN_CATALOG:
                dep_time = parse_time(t_data["dep"])
                arr_time = parse_time(t_data["arr"])
                
                # Arrival carries over to next day?
                arr_date = target_date
                if int(t_data["arr"].replace(':', '')) < int(t_data["dep"].replace(':', '')):
                    arr_date = target_date + timedelta(days=1)
                if t_data["dur"] > 1440:
                    arr_date = target_date + timedelta(days=2)

                train = Journey(
                    train_number=t_data["num"],
                    train_name=t_data["name"],
                    from_station=t_data["from"],
                    to_station=t_data["to"],
                    departure_time=f"{dep_time.strftime('%I:%M %p')}",
                    departure_date=target_date,
                    arrival_time=f"{arr_time.strftime('%I:%M %p')}",
                    arrival_date=arr_date,
                    seats=[100, 250, 150],
                    fare=t_data["fare"],
                    takkal=t_data["takkal"],
                    closing_time=time(23, 59),
                    opening_date=(target_date - timedelta(days=30)) if not t_data["takkal"] else target_date,
                    opening_time=time(10, 0),
                    duration=t_data["dur"],
                    closing_date=target_date
                )
                session.add(train)
                session.flush() 
                
                publish = Publish(
                    journey_id=train.id,
                    published=0
                )
                session.add(publish)
        
        session.commit()
        
        # Ensure dev user exists
        dev_user = session.exec(select(User).where(User.email == "dev@example.com")).first()
        if not dev_user:
            dev_user = User(
                name="Dev User",
                email="dev@example.com"
            )
            session.add(dev_user)
            session.commit()
            
        print(f"Successfully seeded {len(TRAIN_CATALOG) * days_to_seed} real IRCTC train schedules across {days_to_seed} days!")

if __name__ == "__main__":
    seed()
