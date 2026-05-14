import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv('backend/.env')
DATABASE_URL = os.environ.get("DATABASE_URL")

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)

try:
    with engine.connect() as conn:
        result = conn.execute(text("SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_name = 'journey'"))
        for row in result:
            print(row)
except Exception as e:
    print(f"Error: {e}")
