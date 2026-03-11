import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'monitor.db')

def check_apps():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT app_name, window_title FROM app_events WHERE window_title LIKE "%instagram%" OR window_title LIKE "%comet%"')
    print(cursor.fetchall())
    conn.close()

if __name__ == "__main__":
    check_apps()
