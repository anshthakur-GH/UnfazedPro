import pytest
import os
import sqlite3
from src.database import init_db, DB_PATH

def test_db_init():
    # Use a temporary test DB
    test_db = 'data/test_monitor.db'
    if os.path.exists(test_db):
        os.remove(test_db)
    
    # Mock DB_PATH for testing
    import src.database
    original_path = src.database.DB_PATH
    src.database.DB_PATH = test_db
    
    try:
        src.database.init_db()
        assert os.path.exists(test_db)
        
        conn = sqlite3.connect(test_db)
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [row[0] for row in cursor.fetchall()]
        
        assert 'sessions' in tables
        assert 'app_events' in tables
        assert 'keystrokes' in tables
        assert 'browser_events' in tables
        
        conn.close()
    finally:
        src.database.DB_PATH = original_path
        if os.path.exists(test_db):
            os.remove(test_db)
