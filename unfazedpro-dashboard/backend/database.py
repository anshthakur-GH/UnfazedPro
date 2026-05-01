import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'monitor.db')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db_schema():
    conn = get_db()
    cursor = conn.cursor()
    
    # Employees table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS employees (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phase INTEGER DEFAULT 1,
            roi_monthly REAL
        )
    ''')
    
    # Daily summary table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS daily_summary (
            employee_id TEXT,
            date TEXT,
            active_sec INTEGER,
            distraction_pct REAL,
            FOREIGN KEY(employee_id) REFERENCES employees(id)
        )
    ''')
    
    # App events (simplified for dashboard)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS app_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id TEXT,
            process_name TEXT,
            duration_sec INTEGER,
            timestamp TEXT
        )
    ''')
    
    conn.commit()
    conn.close()
