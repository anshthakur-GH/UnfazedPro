import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'monitor.db')

def check_data():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    print("--- DATA CHECK ---")
    
    # Check sessions
    cursor.execute("SELECT COUNT(*) FROM sessions")
    print(f"Sessions: {cursor.fetchone()[0]}")
    
    # Check mouse events
    cursor.execute("SELECT event_type, COUNT(*) FROM mouse_events GROUP BY event_type")
    print("Mouse Events:", cursor.fetchall())
    
    # Check keystrokes
    cursor.execute("SELECT COUNT(*) FROM keystrokes")
    print(f"Keystrokes: {cursor.fetchone()[0]}")
    
    # Check app events
    cursor.execute("SELECT COUNT(*) FROM app_events")
    print(f"App Events: {cursor.fetchone()[0]}")
    
    # Check browser events
    cursor.execute("SELECT COUNT(*) FROM browser_events")
    print(f"Browser Events: {cursor.fetchone()[0]}")
    
    conn.close()

if __name__ == "__main__":
    check_data()
