import sqlite3
from datetime import datetime

conn = sqlite3.connect('/Users/doni/.gemini/antigravity/scratch/design-thinking/tatkal.db')
cursor = conn.cursor()

# Clear existing bookings
cursor.execute("DELETE FROM booking")

# Insert a selected booking
cursor.execute("""
    INSERT INTO booking (user_email, journey_id, seat_class, paid, status, selected_at, submission_duration_ms, is_bot_flag)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
""", ('momson1961@gmail.com', 177, 'Business', False, 'selected', datetime.now().isoformat(), 3500, False))

conn.commit()
conn.close()
print("Inserted booking as 'selected' and not paid.")
