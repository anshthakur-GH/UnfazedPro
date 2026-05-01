import sqlite3
import os
from datetime import datetime

DB_PATH = os.path.join('data', 'monitor.db')

def check_latest():
    if not os.path.exists(DB_PATH):
        print(f"Error: Database file not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    print("--- Database Health Check ---")
    
    # Check Latest Session
    cursor.execute("SELECT * FROM sessions ORDER BY start_time DESC LIMIT 1")
    session = cursor.fetchone()
    if session:
        print(f"Latest Session: ID {session['id']} started at {session['start_time']} on {session['machine_name']}")
    else:
        print("No sessions found.")

    # Check Latest App Event
    cursor.execute("SELECT * FROM app_events ORDER BY start_time DESC LIMIT 1")
    event = cursor.fetchone()
    if event:
        print(f"Latest App Event: '{event['app_name']}' - '{event['window_title']}' at {event['start_time']}")
    else:
        print("No app events found.")

    # Check Latest Keystroke
    cursor.execute("SELECT timestamp FROM keystrokes ORDER BY timestamp DESC LIMIT 1")
    ks = cursor.fetchone()
    if ks:
        print(f"Latest Keystroke recorded at: {ks[0]}")
    else:
        print("No keystrokes found.")

    conn.close()

if __name__ == "__main__":
    check_latest()
