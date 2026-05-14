import sqlite3
conn = sqlite3.connect('tatkal.db')
cursor = conn.cursor()
cursor.execute("SELECT name, source, destination, date FROM journey")
trains = cursor.fetchall()
for t in trains:
    print(t)
conn.close()
