import sqlite3
from datetime import datetime, timedelta

conn = sqlite3.connect('/Users/doni/.gemini/antigravity/scratch/design-thinking/tatkal.db')
cursor = conn.cursor()
now = datetime.now()
start = now - timedelta(minutes=10)
end = now + timedelta(minutes=30)
cursor.execute("UPDATE journey SET opening_date = ?, opening_time = ?, closing_date = ?, closing_time = ?", (start.strftime('%Y-%m-%d'), start.strftime('%H:%M:%S'), end.strftime('%Y-%m-%d'), end.strftime('%H:%M:%S')))
conn.commit()
conn.close()
print("Updated tatkal windows to be open now.")
