import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'monitor.db')

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Sessions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            end_time TIMESTAMP,
            total_active_sec INTEGER DEFAULT 0,
            total_idle_sec INTEGER DEFAULT 0,
            machine_name TEXT
        )
    ''')

    # App events table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS app_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id INTEGER,
            app_name TEXT,
            window_title TEXT,
            start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            end_time TIMESTAMP,
            duration_sec INTEGER,
            FOREIGN KEY (session_id) REFERENCES sessions (id)
        )
    ''')

    # Keystrokes table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS keystrokes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id INTEGER,
            key_name TEXT,
            is_hotkey BOOLEAN,
            hotkey_combo TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            active_app TEXT,
            FOREIGN KEY (session_id) REFERENCES sessions (id)
        )
    ''')

    # Hotkey counts table (aggregated)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS hotkey_counts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id INTEGER,
            date DATE,
            combo TEXT,
            count INTEGER DEFAULT 0,
            FOREIGN KEY (session_id) REFERENCES sessions (id)
        )
    ''')

    # Mouse events table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS mouse_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id INTEGER,
            event_type TEXT,
            x_pos INTEGER,
            y_pos INTEGER,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            active_app TEXT,
            FOREIGN KEY (session_id) REFERENCES sessions (id)
        )
    ''')

    # Browser events table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS browser_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id INTEGER,
            browser TEXT,
            url TEXT,
            domain TEXT,
            page_title TEXT,
            start_time TIMESTAMP,
            end_time TIMESTAMP,
            duration_sec INTEGER,
            FOREIGN KEY (session_id) REFERENCES sessions (id)
        )
    ''')

    # Idle periods table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS idle_periods (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id INTEGER,
            start_time TIMESTAMP,
            end_time TIMESTAMP,
            duration_sec INTEGER,
            FOREIGN KEY (session_id) REFERENCES sessions (id)
        )
    ''')

    # Daily summary table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS daily_summary (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date DATE UNIQUE,
            total_keystrokes INTEGER DEFAULT 0,
            total_clicks INTEGER DEFAULT 0,
            active_time_sec INTEGER DEFAULT 0,
            top_app TEXT,
            top_domain TEXT
        )
    ''')

    conn.commit()
    conn.close()
    print(f"Database initialized at {DB_PATH}")

if __name__ == "__main__":
    # Ensure data directory exists
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    init_db()
