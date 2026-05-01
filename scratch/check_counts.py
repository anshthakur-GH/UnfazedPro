import sqlite3
import os

DB_PATH = 'data/monitor.db'
if os.path.exists(DB_PATH):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    tables = ['sessions', 'app_events', 'keystrokes', 'mouse_events', 'browser_events', 'idle_periods']
    for table in tables:
        try:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            print(f"{table}: {count}")
        except Exception as e:
            print(f"Error checking {table}: {e}")
    conn.close()
else:
    print("Database not found")
