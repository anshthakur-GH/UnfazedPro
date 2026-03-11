import requests
import sqlite3
import os
import time
import threading
from datetime import datetime, timedelta

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'monitor.db')
AW_BASE_URL = "http://localhost:5600/api/0"

class AW_Sync:
    def __init__(self, session_id):
        self.session_id = session_id
        self.running = False
        self.last_sync_time = datetime.now() - timedelta(minutes=5)
        self.search_engines = [
            'google.com/search', 'bing.com/search', 'duckduckgo.com/', 'yahoo.com/search'
        ]

    def extract_search_query(self, url):
        from urllib.parse import urlparse, parse_qs
        if any(engine in url for engine in self.search_engines):
            parsed = urlparse(url)
            qs = parse_qs(parsed.query)
            if 'q' in qs: return qs['q'][0]
            if 'p' in qs: return qs['p'][0] # Yahoo
        return None

    def fetch_browser_events(self):
        # We look for buckets starting with "aw-watcher-web"
        try:
            buckets_res = requests.get(f"{AW_BASE_URL}/buckets")
            if buckets_res.status_code != 200:
                return []
            
            buckets = buckets_res.json()
            web_buckets = [b for b in buckets if "aw-watcher-web" in b]
            
            if not web_buckets:
                # Only print once to avoid spam
                if not hasattr(self, '_extension_warned'):
                    print("TIP: For precise URL tracking, install the 'ActivityWatch Web Watcher' browser extension.")
                    self._extension_warned = True
            
            all_events = []
            for bucket_id in web_buckets:
                # Fetch events since last sync
                start_str = self.last_sync_time.isoformat()
                events_res = requests.get(f"{AW_BASE_URL}/buckets/{bucket_id}/events?start={start_str}")
                if events_res.status_code == 200:
                    all_events.extend(events_res.json())
            
            return all_events
        except Exception as e:
            print(f"AW Sync Error: {e}")
            return []

    def sync_to_db(self):
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        while self.running:
            events = self.fetch_browser_events()
            if events:
                for event in events:
                    data = event.get('data', {})
                    url = data.get('url', '')
                    title = data.get('title', '')
                    search_query = self.extract_search_query(url)
                    # Extract domain
                    domain = url.split("//")[-1].split("/")[0] if "//" in url else url.split("/")[0]
                    
                    if search_query:
                        title = f"[Search: {search_query}] {title}"
                    
                    start_time = event.get('timestamp', '').replace('Z', '')
                    duration = event.get('duration', 0)
                    end_time_dt = datetime.fromisoformat(start_time) + timedelta(seconds=duration)
                    end_time = end_time_dt.strftime('%Y-%m-%d %H:%M:%S')

                    # Check if event already exists
                    cursor.execute('''
                        INSERT INTO browser_events (session_id, browser, url, domain, page_title, start_time, end_time, duration_sec)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (self.session_id, "Web-Watcher", url, domain, title, start_time, end_time, int(duration)))
                
                conn.commit()
                self.last_sync_time = datetime.now()
            
            time.sleep(60) # Sync every minute
        
        conn.close()

    def start(self):
        self.running = True
        self.thread = threading.Thread(target=self.sync_to_db, daemon=True)
        self.thread.start()
        print("ActivityWatch sync started...")

    def stop(self):
        self.running = False
        if hasattr(self, 'thread'):
            self.thread.join()
        print("ActivityWatch sync stopped.")

if __name__ == "__main__":
    sync = AW_Sync(1)
    sync.start()
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        sync.stop()
