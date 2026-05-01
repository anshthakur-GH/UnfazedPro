import random
from datetime import datetime, timedelta
from database import get_db, init_db_schema

DEMO_EMPLOYEES = [
    {"id": "EMP001", "name": "Aryan Mehta",  "email": "aryan@company.com",  "phase": 2, "roi_monthly": 18400},
    {"id": "EMP002", "name": "Priya Sharma", "email": "priya@company.com",  "phase": 1, "roi_monthly": None},
    {"id": "EMP003", "name": "Rahul Verma",  "email": "rahul@company.com",  "phase": 1, "roi_monthly": None},
    {"id": "EMP004", "name": "Deepa Nair",   "email": "deepa@company.com",  "phase": 1, "roi_monthly": None},
    {"id": "EMP005", "name": "Vikram Joshi", "email": "vikram@company.com", "phase": 1, "roi_monthly": None},
]

APPS = [
    ("chrome.exe", 0.4), ("Slack.exe", 0.2), ("Excel.exe", 0.15), 
    ("VSCode.exe", 0.15), ("Zoom.exe", 0.1)
]

def seed():
    init_db_schema()
    conn = get_db()
    cursor = conn.cursor()
    
    # Clear existing
    cursor.execute('DELETE FROM employees')
    cursor.execute('DELETE FROM daily_summary')
    cursor.execute('DELETE FROM app_events')
    
    # Insert employees
    for emp in DEMO_EMPLOYEES:
        cursor.execute('''
            INSERT INTO employees (id, name, email, phase, roi_monthly)
            VALUES (?, ?, ?, ?, ?)
        ''', (emp["id"], emp["name"], emp["email"], emp["phase"], emp["roi_monthly"]))
        
        # Generate 30 days of data
        for i in range(30):
            date = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
            active_sec = random.randint(18000, 28800) # 5-8 hours
            distraction = random.uniform(10, 35)
            
            cursor.execute('''
                INSERT INTO daily_summary (employee_id, date, active_sec, distraction_pct)
                VALUES (?, ?, ?, ?)
            ''', (emp["id"], date, active_sec, distraction))
            
            # Generate app events for today
            for app, weight in APPS:
                dur = int(active_sec * weight * random.uniform(0.8, 1.2))
                cursor.execute('''
                    INSERT INTO app_events (employee_id, process_name, duration_sec, timestamp)
                    VALUES (?, ?, ?, ?)
                ''', (emp["id"], app, dur, date + " 10:00:00"))

    conn.commit()
    conn.close()
    print("Database seeded with demo data.")

if __name__ == "__main__":
    seed()
