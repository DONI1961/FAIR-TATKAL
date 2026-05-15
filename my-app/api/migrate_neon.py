import os
from dotenv import load_dotenv
from sqlmodel import SQLModel, create_engine
import model.journey
import model.booking
import model.payment
import model.publish
import model.user

# Load environment variables
load_dotenv('.env.local')

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("Error: DATABASE_URL not found in .env.local")
    exit(1)

print(f"Connecting to: {DATABASE_URL.split('@')[-1]}")

engine = create_engine(DATABASE_URL)

def migrate():
    print("Creating tables in Neon...")
    SQLModel.metadata.create_all(engine)
    print("Tables created successfully!")

if __name__ == "__main__":
    migrate()
