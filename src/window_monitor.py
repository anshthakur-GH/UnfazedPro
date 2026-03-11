import pygetwindow as gw
import time
import sqlite3
import os
import threading
import psutil
from datetime import datetime

# Windows specific
try:
    import win32gui
    import win32process
except ImportError:
    win32gui = None

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'monitor.db')

class WindowMonitor:
    def __init__(self, session_id=1):
        self.session_id = session_id
        self.running = False
        self.last_window = None
        self.last_app = None
        self.start_time = None

    def get_active_window_info(self):
        try:
            if win32gui:
                window = win32gui.GetForegroundWindow()
                title = win32gui.GetWindowText(window)
                _, pid = win32process.GetWindowThreadProcessId(window)
                app_name = psutil.Process(pid).name()
                return app_name, title
            else:
                window = gw.getActiveWindow()
                if window:
                    return "Unknown", window.title # pygetwindow is less detailed on process name
        except Exception:
            pass
        return "Unknown", "Unknown"

    def _monitor_loop(self):
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        while self.running:
            app_name, title = self.get_active_window_info()
            
            if (app_name, title) != (self.last_app, self.last_window):
                now = datetime.now()
                
                # Close previous event if exists
                if self.last_app and self.start_time:
                    duration = int((now - self.start_time).total_seconds())
                    cursor.execute('''
                        UPDATE app_events 
                        SET end_time = ?, duration_sec = ? 
                        WHERE session_id = ? AND app_name = ? AND window_title = ? AND end_time IS NULL
                    ''', (now.strftime('%Y-%m-%d %H:%M:%S'), duration, self.session_id, self.last_app, self.last_window))
                
                # Start new event
                cursor.execute('''
                    INSERT INTO app_events (session_id, app_name, window_title, start_time)
                    VALUES (?, ?, ?, ?)
                ''', (self.session_id, app_name, title, now.strftime('%Y-%m-%d %H:%M:%S')))
                
                conn.commit()
                self.last_app, self.last_window = app_name, title
                self.start_time = now
            
            time.sleep(1)
            
        conn.close()

    def start(self):
        from datetime import datetime
        self.running = True
        self.thread = threading.Thread(target=self._monitor_loop, daemon=True)
        self.thread.start()
        print("Window monitoring started...")

    def stop(self):
        self.running = False
        if hasattr(self, 'thread'):
            self.thread.join()
        print("Window monitoring stopped.")

if __name__ == "__main__":
    monitor = WindowMonitor()
    monitor.start()
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        monitor.stop()
