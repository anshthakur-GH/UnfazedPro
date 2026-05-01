from fpdf import FPDF
import sqlite3
import os
import json
from datetime import datetime, timedelta

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'monitor.db')
REPORTS_DIR = os.path.join(os.path.dirname(__file__), '..', 'reports')

class ReportGenerator(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 15)
        self.cell(0, 10, 'UnfazedPro Activity Report', 0, 1, 'C')
        self.set_font('Arial', '', 10)
        self.cell(0, 10, f'Generated on: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}', 0, 1, 'C')
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}/{{nb}}', 0, 0, 'C')

    def _safe_str(self, s):
        if s is None: return ""
        # FPDF default fonts only support Latin-1. Sanitise other chars.
        return str(s).encode('latin-1', 'replace').decode('latin-1')

    def generate_summary(self, start_date, end_date):
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Total Active Time
        cursor.execute('''
            SELECT SUM(duration_sec) FROM app_events 
            WHERE start_time >= ? AND start_time <= ?
        ''', (start_date, end_date))
        total_sec = cursor.fetchone()[0] or 0
        total_hours = total_sec / 3600
        
        # Total Keystrokes
        cursor.execute('''
            SELECT COUNT(*) FROM keystrokes 
            WHERE timestamp >= ? AND timestamp <= ?
        ''', (start_date, end_date))
        total_keys = cursor.fetchone()[0] or 0
        
        # System Uptime (Current)
        import psutil
        import time
        uptime_sec = time.time() - psutil.boot_time()
        uptime_hours = uptime_sec / 3600
        
        # Top App
        cursor.execute('''
            SELECT app_name, COALESCE(SUM(duration_sec), 0) as total_dur FROM app_events
            WHERE start_time >= ? AND start_time <= ?
            GROUP BY app_name ORDER BY total_dur DESC LIMIT 1
        ''', (start_date, end_date))
        top_app = cursor.fetchone()
        
        # Top Website
        cursor.execute('''
            SELECT domain, COALESCE(SUM(duration_sec), 0) as total_dur FROM browser_events
            WHERE start_time >= ? AND start_time <= ?
            GROUP BY domain ORDER BY total_dur DESC LIMIT 1
        ''', (start_date, end_date))
        top_site = cursor.fetchone()
        
        conn.close()
        
        self.add_page()
        self.set_font('Arial', 'B', 12)
        self.cell(0, 10, f'Period: {start_date} to {end_date}', 0, 1)
        self.ln(5)
        
        self.set_font('Arial', '', 11)
        self.cell(0, 10, f'Total Time Monitored: {total_hours:.2f} hours', 0, 1)
        self.cell(0, 10, f'Total Keystrokes: {total_keys}', 0, 1)
        self.cell(0, 10, f'Current System Uptime: {uptime_hours:.2f} hours', 0, 1)
        if top_app and top_app[1] is not None:
            self.cell(0, 10, self._safe_str(f'Top Application: {top_app[0]} ({top_app[1]/60:.1f} mins)'), 0, 1)
        if top_site and top_site[1] is not None:
            self.cell(0, 10, self._safe_str(f'Top Website: {top_site[0]} ({top_site[1]/60:.1f} mins)'), 0, 1)
        
        self.ln(10)

    def generate_app_breakdown(self, start_date, end_date):
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute('''
            SELECT app_name, COALESCE(SUM(duration_sec), 0) as total_dur FROM app_events
            WHERE start_time >= ? AND start_time <= ?
            GROUP BY app_name ORDER BY total_dur DESC
        ''', (start_date, end_date))
        apps = cursor.fetchall()
        conn.close()
        
        self.set_font('Arial', 'B', 12)
        self.cell(0, 10, 'Application Usage Breakdown', 0, 1)
        self.set_font('Arial', 'B', 10)
        self.cell(100, 10, 'Application', 1)
        self.cell(40, 10, 'Duration (mins)', 1)
        self.ln()
        
        self.set_font('Arial', '', 10)
        for app in apps:
            self.cell(100, 10, self._safe_str(app[0]), 1)
            self.cell(40, 10, f'{app[1]/60:.1f}', 1)
            self.ln()
        
        self.ln(10)

    def generate_browser_details(self, start_date, end_date):
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute('''
            SELECT domain, url, COALESCE(SUM(duration_sec), 0) as total_dur FROM browser_events
            WHERE start_time >= ? AND start_time <= ?
            GROUP BY url ORDER BY total_dur DESC LIMIT 10
        ''', (start_date, end_date))
        urls = cursor.fetchall()
        # Fallback to app_events if browser_events is empty
        if not urls:
            cursor.execute('''
                SELECT DISTINCT window_title, COALESCE(SUM(duration_sec), 0) 
                FROM app_events
                WHERE (app_name LIKE '%comet%' OR app_name LIKE '%chrome%' OR app_name LIKE '%firefox%')
                  AND start_time >= ? AND start_time <= ?
                GROUP BY window_title ORDER BY SUM(duration_sec) DESC LIMIT 10
            ''', (start_date, end_date))
            urls = [(title.split('-')[-1].strip() if '-' in title else title, title, dur) for title, dur in cursor.fetchall()]

        conn.close()
        
        self.set_font('Arial', 'B', 12)
        self.cell(0, 10, 'Top 10 Websites Visited', 0, 1)
        self.set_font('Arial', 'B', 10)
        self.cell(140, 10, 'URL / Domain', 1)
        self.cell(40, 10, 'Duration (mins)', 1)
        self.ln()
        
        self.set_font('Arial', '', 9)
        for url in urls:
            domain_url = f"{url[0]} - {url[1][:50]}..." if len(url[1]) > 50 else f"{url[0]} - {url[1]}"
            self.cell(140, 10, self._safe_str(domain_url), 1)
            self.cell(40, 10, f'{url[2]/60:.1f}', 1)
            self.ln()
        
        self.ln(10)

    def generate_mouse_stats(self, start_date, end_date):
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute('''
            SELECT event_type, COUNT(*) FROM mouse_events
            WHERE timestamp >= ? AND timestamp <= ?
            GROUP BY event_type
        ''', (start_date, end_date))
        events = cursor.fetchall()
        conn.close()
        
        self.set_font('Arial', 'B', 12)
        self.cell(0, 10, 'Mouse Activity Summary', 0, 1)
        self.set_font('Arial', 'B', 10)
        self.cell(60, 10, 'Event Type', 1)
        self.cell(40, 10, 'Count', 1)
        self.ln()
        
        self.set_font('Arial', '', 10)
        for event in events:
            self.cell(60, 10, str(event[0]), 1)
            self.cell(40, 10, str(event[1]), 1)
            self.ln()
        
        self.ln(10)

    def generate_session_log(self, start_date, end_date):
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute('''
            SELECT start_time, end_time, machine_name FROM sessions
            WHERE start_time >= ? AND start_time <= ?
            ORDER BY start_time DESC
        ''', (start_date, end_date))
        sessions = cursor.fetchall()
        conn.close()
        
        self.set_font('Arial', 'B', 12)
        self.cell(0, 10, 'Daily Session Log', 0, 1)
        self.set_font('Arial', 'B', 9)
        self.cell(50, 10, 'Session Start', 1)
        self.cell(50, 10, 'Session End', 1)
        self.cell(40, 10, 'Machine', 1)
        self.ln()
        
        self.set_font('Arial', '', 8)
        for session in sessions:
            self.cell(50, 10, str(session[0]), 1)
            self.cell(50, 10, str(session[1]) if session[1] else "Running...", 1)
            self.cell(40, 10, str(session[2]), 1)
            self.ln()
        
        self.ln(10)

    def generate_daily_summaries(self, start_date, end_date):
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute('''
            SELECT date(start_time) as d, app_name, COALESCE(SUM(duration_sec), 0) as total_dur 
            FROM app_events
            WHERE start_time >= ? AND start_time <= ?
            GROUP BY d, app_name
            ORDER BY d DESC, total_dur DESC
        ''', (start_date, end_date))
        data = cursor.fetchall()
        conn.close()

        if not data: return

        self.set_font('Arial', 'B', 12)
        self.cell(0, 10, 'Top Applications by Day', 0, 1)
        
        current_day = None
        for row in data:
            day, app, dur = row
            if day != current_day:
                if current_day: self.ln(2)
                self.set_font('Arial', 'B', 10)
                self.cell(0, 8, f"Date: {day}", 0, 1)
                current_day = day
            
            self.set_font('Arial', '', 9)
            self.cell(80, 8, self._safe_str(f"  - {app}"), 0)
            self.cell(40, 8, f"{dur/60:.1f} mins", 0, 1)

        self.ln(10)

    def generate_activity_timeline(self, start_date, end_date):
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Pull app events
        cursor.execute('''
            SELECT start_time, 'App' as type, app_name as source, window_title as detail 
            FROM app_events 
            WHERE start_time >= ? AND start_time <= ?
        ''', (start_date, end_date))
        app_data = cursor.fetchall()
        
        # Pull browser events
        cursor.execute('''
            SELECT start_time, 'Web' as type, domain as source, page_title as detail 
            FROM browser_events 
            WHERE start_time >= ? AND start_time <= ?
        ''', (start_date, end_date))
        web_data = cursor.fetchall()
        
        # Merge and sort
        combined = sorted(app_data + web_data, key=lambda x: x[0], reverse=True)[:30] # Last 30 events
        conn.close()
        
        if not combined: return
        
        self.add_page()
        self.set_font('Arial', 'B', 14)
        self.cell(0, 10, 'Activity Timeline (Sequence of Events)', 0, 1)
        self.set_font('Arial', 'I', 9)
        self.cell(0, 8, 'Showing the chronological flow of your work:', 0, 1)
        self.ln(2)
        
        # Table Header
        self.set_font('Arial', 'B', 10)
        self.cell(40, 10, 'Time', 1)
        self.cell(15, 10, 'Type', 1)
        self.cell(40, 10, 'Source', 1)
        self.cell(90, 10, 'Activity Detail', 1)
        self.ln()
        
        self.set_font('Arial', '', 8)
        for event in reversed(combined): # Show oldest to newest for flow
            self.cell(40, 8, str(event[0]), 1)
            self.cell(15, 8, str(event[1]), 1)
            self.cell(40, 8, self._safe_str(event[2])[:20], 1)
            detail = str(event[3]).replace('[Search: ', '').split(']')[0][:50]
            self.cell(90, 8, self._safe_str(detail), 1)
            self.ln()
            
        self.ln(10)

    def generate_transitions(self, start_date, end_date):
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Get chronological sequence of sources
        cursor.execute('''
            SELECT source FROM (
                SELECT start_time, app_name as source FROM app_events WHERE start_time >= ? AND start_time <= ?
                UNION ALL
                SELECT start_time, domain as source FROM browser_events WHERE start_time >= ? AND start_time <= ?
            ) ORDER BY start_time ASC
        ''', (start_date, end_date, start_date, end_date))
        
        sequence = [r[0] for r in cursor.fetchall()]
        conn.close()
        
        if len(sequence) < 2: return
        
        transitions = {}
        for i in range(len(sequence) - 1):
            pair = f"{sequence[i]} -> {sequence[i+1]}"
            if sequence[i] != sequence[i+1]: # Only track switches
                transitions[pair] = transitions.get(pair, 0) + 1
        
        # Sort and get top 5
        top_transitions = sorted(transitions.items(), key=lambda x: x[1], reverse=True)[:5]
        
        if not top_transitions: return
        
        self.set_font('Arial', 'B', 12)
        self.cell(0, 10, 'Top Activity Transitions (Workflow Flow)', 0, 1)
        self.set_font('Arial', '', 10)
        for trans, count in top_transitions:
            self.cell(0, 8, self._safe_str(f"  - {trans} ({count} switches)"), 0, 1)
        
        self.ln(10)

    def generate_idle_analysis(self, start_date, end_date):
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute('''
            SELECT SUM(duration_sec) FROM idle_periods
            WHERE start_time >= ? AND start_time <= ?
        ''', (start_date, end_date))
        total_idle = cursor.fetchone()[0] or 0
        
        cursor.execute('''
            SELECT AVG(duration_sec) FROM idle_periods
            WHERE start_time >= ? AND start_time <= ?
        ''', (start_date, end_date))
        avg_idle = cursor.fetchone()[0] or 0
        
        conn.close()
        
        self.set_font('Arial', 'B', 12)
        self.cell(0, 10, 'Idle vs Active Analysis', 0, 1)
        self.set_font('Arial', '', 11)
        self.cell(0, 8, f"Total Idle Time: {total_idle/60:.1f} minutes", 0, 1)
        self.cell(0, 8, f"Average Idle Duration: {avg_idle:.1f} seconds", 0, 1)
        self.ln(10)

    def generate_search_queries(self, start_date, end_date):
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute('''
            SELECT page_title, start_time FROM browser_events
            WHERE start_time >= ? AND start_time <= ? AND page_title LIKE '[Search:%'
            ORDER BY start_time DESC
        ''', (start_date, end_date))
        searches = cursor.fetchall()

        # Fallback to app_events for searches
        if not searches:
            cursor.execute('''
                SELECT window_title, start_time FROM app_events
                WHERE (window_title LIKE '%Google Search%' OR window_title LIKE '% - Comet%' OR window_title LIKE '%Bing%' OR window_title LIKE '%Instagram%')
                  AND start_time >= ? AND start_time <= ?
                ORDER BY start_time DESC LIMIT 10
            ''', (start_date, end_date))
            fallback_searches = cursor.fetchall()
            for row in fallback_searches:
                title, time_str = row
                term = title.split(' - ')[0].replace('Google Search', '').strip()
                if term and term != title:
                    searches.append((f"[Fallback] {term}", time_str))

        conn.close()
        
        if not searches: return
        
        self.set_font('Arial', 'B', 12)
        self.cell(0, 10, 'Recent Search Queries', 0, 1)
        self.set_font('Arial', 'B', 10)
        self.cell(140, 10, 'Search Term', 1)
        self.cell(40, 10, 'Timestamp', 1)
        self.ln()
        
        self.set_font('Arial', '', 9)
        for s in searches:
            query = s[0].replace("[Search: ", "").split("]")[0]
            self.cell(140, 10, self._safe_str(query), 1)
            self.cell(40, 10, str(s[1]), 1)
            self.ln()
        
        self.ln(10)

    def generate_hotkey_stats(self, start_date, end_date):
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute('''
            SELECT hotkey_combo, COUNT(*) FROM keystrokes
            WHERE timestamp >= ? AND timestamp <= ? AND is_hotkey = 1
            GROUP BY hotkey_combo ORDER BY COUNT(*) DESC
        ''', (start_date, end_date))
        hotkeys = cursor.fetchall()
        conn.close()
        
        self.set_font('Arial', 'B', 12)
        self.cell(0, 10, 'Hotkey Usage Statistics', 0, 1)
        self.set_font('Arial', 'B', 10)
        self.cell(60, 10, 'Hotkey', 1)
        self.cell(40, 10, 'Usage Count', 1)
        self.ln()
        
        self.set_font('Arial', '', 10)
        for hk in hotkeys:
            self.cell(60, 10, str(hk[0]), 1)
            self.cell(40, 10, str(hk[1]), 1)
            self.ln()
        
        self.ln(10)

    def create_report(self, days=7):
        end_date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        start_date = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d %H:%M:%S')
        
        self.alias_nb_pages()
        self.generate_summary(start_date, end_date)
        self.generate_session_log(start_date, end_date)
        self.generate_daily_summaries(start_date, end_date)
        self.generate_idle_analysis(start_date, end_date)
        self.generate_app_breakdown(start_date, end_date)
        self.generate_browser_details(start_date, end_date)
        self.generate_search_queries(start_date, end_date)
        self.generate_activity_timeline(start_date, end_date)
        self.generate_transitions(start_date, end_date)
        self.generate_mouse_stats(start_date, end_date)
        self.generate_hotkey_stats(start_date, end_date)
        
        filename = f'report_{datetime.now().strftime("%Y%m%d_%H%M%S")}.pdf'
        file_path = os.path.join(REPORTS_DIR, filename)
        os.makedirs(REPORTS_DIR, exist_ok=True)
        self.output(file_path)
        print(f"Report generated: {file_path}")
        return file_path

    def export_json(self, days=7):
        end_date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        start_date = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d %H:%M:%S')
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        data = {
            "metadata": {
                "generated_at": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                "period": {"start": start_date, "end": end_date}
            },
            "summary": {},
            "sessions": [],
            "daily_apps": [],
            "app_breakdown": [],
            "browser_details": [],
            "search_queries": [],
            "idle_analysis": {},
            "transitions": [],
            "mouse_stats": [],
            "hotkey_stats": []
        }
        
        # 1. Summary
        cursor.execute("SELECT SUM(duration_sec) FROM app_events WHERE start_time >= ? AND start_time <= ?", (start_date, end_date))
        data["summary"]["total_monitored_hours"] = (cursor.fetchone()[0] or 0) / 3600
        cursor.execute("SELECT COUNT(*) FROM keystrokes WHERE timestamp >= ? AND timestamp <= ?", (start_date, end_date))
        data["summary"]["total_keystrokes"] = cursor.fetchone()[0] or 0
        
        # 2. Sessions
        cursor.execute("SELECT start_time, end_time, machine_name FROM sessions WHERE start_time >= ? AND start_time <= ?", (start_date, end_date))
        data["sessions"] = [{"start": r[0], "end": r[1], "machine": r[2]} for r in cursor.fetchall()]
        
        # 3. App Breakdown
        cursor.execute("SELECT app_name, COALESCE(SUM(duration_sec), 0) FROM app_events WHERE start_time >= ? AND start_time <= ? GROUP BY app_name ORDER BY SUM(duration_sec) DESC", (start_date, end_date))
        data["app_breakdown"] = [{"app": r[0], "duration_min": (r[1] or 0)/60} for r in cursor.fetchall()]
        
        # 3b. Daily Summaries (Top Apps by Day)
        cursor.execute('''
            SELECT date(start_time) as d, app_name, COALESCE(SUM(duration_sec), 0) as total_dur 
            FROM app_events WHERE start_time >= ? AND start_time <= ?
            GROUP BY d, app_name ORDER BY d DESC, total_dur DESC
        ''', (start_date, end_date))
        data["daily_apps"] = [{"date": r[0], "app": r[1], "duration_min": (r[2] or 0)/60} for r in cursor.fetchall()]
        
        # 4. Browser Details (including fallback)
        cursor.execute("SELECT domain, url, SUM(duration_sec) FROM browser_events WHERE start_time >= ? AND start_time <= ? GROUP BY url ORDER BY SUM(duration_sec) DESC", (start_date, end_date))
        browser_data = cursor.fetchall()
        if not browser_data:
             cursor.execute("SELECT window_title, SUM(duration_sec) FROM app_events WHERE (app_name LIKE '%comet%' OR app_name LIKE '%chrome%' OR app_name LIKE '%firefox%') AND start_time >= ? AND start_time <= ? GROUP BY window_title ORDER BY SUM(duration_sec) DESC", (start_date, end_date))
             data["browser_details"] = [{"type": "fallback", "title": r[0], "duration_min": r[1]/60} for r in cursor.fetchall()]
        else:
             data["browser_details"] = [{"type": "direct", "domain": r[0], "url": r[1], "duration_min": r[2]/60} for r in browser_data]
             
        # 5. Search Queries
        cursor.execute("SELECT page_title, start_time FROM browser_events WHERE start_time >= ? AND start_time <= ? AND page_title LIKE '[Search:%'", (start_date, end_date))
        data["search_queries"] = [{"query": r[0], "time": r[1]} for r in cursor.fetchall()]
        
        # 6. Idle Analysis
        cursor.execute("SELECT SUM(duration_sec), AVG(duration_sec) FROM idle_periods WHERE start_time >= ? AND start_time <= ?", (start_date, end_date))
        r = cursor.fetchone()
        data["idle_analysis"] = {"total_idle_min": (r[0] or 0)/60, "avg_idle_sec": r[1] or 0}
        
        # 6b. Activity Timeline
        cursor.execute('''
            SELECT start_time, 'App' as type, app_name as source, window_title as detail 
            FROM app_events WHERE start_time >= ? AND start_time <= ?
            UNION ALL
            SELECT start_time, 'Web' as type, domain as source, page_title as detail 
            FROM browser_events WHERE start_time >= ? AND start_time <= ?
            ORDER BY start_time DESC LIMIT 50
        ''', (start_date, end_date, start_date, end_date))
        data["activity_timeline"] = [{"time": r[0], "type": r[1], "source": r[2], "detail": r[3]} for r in cursor.fetchall()]
        
        # 6c. Transitions
        cursor.execute('''
            SELECT source FROM (
                SELECT start_time, app_name as source FROM app_events WHERE start_time >= ? AND start_time <= ?
                UNION ALL
                SELECT start_time, domain as source FROM browser_events WHERE start_time >= ? AND start_time <= ?
            ) ORDER BY start_time ASC
        ''', (start_date, end_date, start_date, end_date))
        sequence = [r[0] for r in cursor.fetchall()]
        transitions = {}
        for i in range(len(sequence) - 1):
            pair = f"{sequence[i]} -> {sequence[i+1]}"
            if sequence[i] != sequence[i+1]:
                transitions[pair] = transitions.get(pair, 0) + 1
        data["transitions"] = [{"path": k, "count": v} for k, v in sorted(transitions.items(), key=lambda x: x[1], reverse=True)[:10]]
        
        # 7. Mouse and Hotkeys
        cursor.execute("SELECT event_type, COUNT(*) FROM mouse_events WHERE timestamp >= ? AND timestamp <= ? GROUP BY event_type", (start_date, end_date))
        data["mouse_stats"] = [{"event": r[0], "count": r[1]} for r in cursor.fetchall()]
        cursor.execute("SELECT hotkey_combo, COUNT(*) FROM keystrokes WHERE timestamp >= ? AND timestamp <= ? AND is_hotkey = 1 GROUP BY hotkey_combo", (start_date, end_date))
        data["hotkey_stats"] = [{"hotkey": r[0], "count": r[1]} for r in cursor.fetchall()]
        
        conn.close()
        
        filename = f'report_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
        file_path = os.path.join(REPORTS_DIR, filename)
        os.makedirs(REPORTS_DIR, exist_ok=True)
        with open(file_path, 'w') as f:
            json.dump(data, f, indent=4)
        print(f"JSON Report exported: {file_path}")
        return file_path

if __name__ == "__main__":
    report = ReportGenerator()
    import sys
    if '--json' in sys.argv:
        report.export_json(days=30)
    else:
        report.create_report(days=30)
