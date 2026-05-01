import time
import os
import signal
import sys
from datetime import datetime
import socket

from src.database import init_db, DB_PATH
from src.input_tracker import InputTracker
from src.window_monitor import WindowMonitor
from src.aw_sync import AW_Sync

import sqlite3
try:
    import win32api
    import win32con
except ImportError:
    win32api = None

from src.report_generator import ReportGenerator

def create_session():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    machine_name = socket.gethostname()
    cursor.execute('''
        INSERT INTO sessions (start_time, machine_name)
        VALUES (?, ?)
    ''', (datetime.now().strftime('%Y-%m-%d %H:%M:%S'), machine_name))
    session_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return session_id

def end_session(session_id):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE sessions 
        SET end_time = ? 
        WHERE id = ?
    ''', (datetime.now().strftime('%Y-%m-%d %H:%M:%S'), session_id))
    conn.commit()
    conn.close()

def main():
    print("--- LOCAL ACTIVITY MONITORING SYSTEM ---")
    
    # Initialize DB
    if not os.path.exists(DB_PATH):
        init_db()
        
    session_id = create_session()
    print(f"Starting Session ID: {session_id}")
    
    # Import tracker modules (handling potential filename issues)
    from src.input_tracker import InputTracker
    from src.window_monitor import WindowMonitor
    
    tracker = InputTracker(session_id)
    monitor = WindowMonitor(session_id)
    aw_sync = AW_Sync(session_id)
    
    tracker.start()
    monitor.start()
    aw_sync.start()
    
    # Idle Monitoring Logic
    is_idle = False
    idle_start = None
    IDLE_THRESHOLD = 60 # 60 seconds as per requirement
    
    def idle_monitor():
        nonlocal is_idle, idle_start
        while True:
            time.sleep(5)
            idle_duration = time.time() - tracker.last_activity
            
            if idle_duration > IDLE_THRESHOLD and not is_idle:
                is_idle = True
                idle_start = datetime.now()
                print(f"User is now IDLE (no input for {IDLE_THRESHOLD}s)")
            elif idle_duration <= IDLE_THRESHOLD and is_idle:
                is_idle = False
                idle_end = datetime.now()
                duration = int((idle_end - idle_start).total_seconds())
                print(f"User is back. Idle duration: {duration}s")
                
                # Log to DB
                try:
                    conn = sqlite3.connect(DB_PATH)
                    cursor = conn.cursor()
                    cursor.execute('''
                        INSERT INTO idle_periods (session_id, start_time, end_time, duration_sec)
                        VALUES (?, ?, ?, ?)
                    ''', (session_id, idle_start.strftime('%Y-%m-%d %H:%M:%S'), 
                          idle_end.strftime('%Y-%m-%d %H:%M:%S'), duration))
                    conn.commit()
                    conn.close()
                except Exception as e:
                    print(f"Error logging idle period: {e}")
                
    import threading
    idle_thread = threading.Thread(target=idle_monitor, daemon=True)
    idle_thread.start()
    
    def cleanup_and_report():
        print("\nShutting down monitors and generating session report...")
        tracker.stop()
        monitor.stop()
        aw_sync.stop()
        end_session(session_id)
        
        try:
            print("Generating final report...")
            report = ReportGenerator()
            report.create_report(days=1)
            report.export_json(days=1)
        except Exception as e:
            print(f"Error generating final report: {e}")

    def signal_handler(sig, frame):
        cleanup_and_report()
        sys.exit(0)
        
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    if win32api:
        def console_ctrl_handler(ctrl_type):
            if ctrl_type in (win32con.CTRL_SHUTDOWN_EVENT, win32con.CTRL_LOGOFF_EVENT, win32con.CTRL_CLOSE_EVENT):
                cleanup_and_report()
                return True
            return False
        win32api.SetConsoleCtrlHandler(console_ctrl_handler, True)
    
    print("System active. Press Ctrl+C to stop.")
    
    try:
        while True:
            time.sleep(10)
    except KeyboardInterrupt:
        cleanup_and_report()

if __name__ == "__main__":
    main()
