import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'monitor.db')

def debug_db():
    print(f"Checking DB at: {os.path.abspath(DB_PATH)}")
    if not os.path.exists(DB_PATH):
        print("DB file does NOT exist!")
        return
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()
    print(f"Tables found: {tables}")
    conn.close()

if __name__ == "__main__":
    debug_db()
