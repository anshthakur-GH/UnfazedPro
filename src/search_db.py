import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'monitor.db')

def check_missing_activities():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    keywords = ['%instagram%', '%comet%', '%test%', '%whatis%']
    print("--- SEARCHING FOR MISSING ACTIVITIES ---")
    
    for kw in keywords:
        cursor.execute("SELECT window_title, start_time FROM app_events WHERE window_title LIKE ?", (kw,))
        results = cursor.fetchall()
        print(f"Keyword '{kw}': {len(results)} matches")
        for r in results:
            print(f" - {r[0]} at {r[1]}")
            
    conn.close()

if __name__ == "__main__":
    check_missing_activities()
