from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import get_db
from datetime import datetime, timedelta
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/overview")
async def get_overview():
    conn = get_db()
    cursor = conn.cursor()
    
    # Machine Name as proxy for "Employee"
    cursor.execute("SELECT COUNT(DISTINCT machine_name) FROM sessions")
    active_count = cursor.fetchone()[0] or 1
    
    # Avg Active Hours (today)
    today = datetime.now().strftime('%Y-%m-%d')
    cursor.execute("SELECT SUM(duration_sec)/3600.0 FROM app_events WHERE start_time LIKE ?", (f'{today}%',))
    today_hours = cursor.fetchone()[0] or 0
    
    # Distraction Rate (Today)
    # Simple logic: (Idle Time / (Active + Idle Time)) * 100
    cursor.execute("SELECT SUM(duration_sec) FROM idle_periods WHERE start_time LIKE ?", (f'{today}%',))
    idle_sec = cursor.fetchone()[0] or 0
    cursor.execute("SELECT SUM(duration_sec) FROM app_events WHERE start_time LIKE ?", (f'{today}%',))
    active_sec = cursor.fetchone()[0] or 0
    
    total_sec = active_sec + idle_sec
    distraction = (idle_sec / total_sec * 100) if total_sec > 0 else 0
    
    conn.close()
    
    return {
        "active_employees": active_count,
        "avg_active_hours": round(today_hours, 1),
        "avg_distraction_pct": round(distraction, 1),
        "proposals_generated": 3 # Dynamic placeholder
    }

@app.get("/api/employees")
async def get_employees():
    conn = get_db()
    cursor = conn.cursor()
    
    # Get all unique machines/sessions and present them as employees
    cursor.execute('''
        SELECT machine_name, MIN(start_time) as first_seen 
        FROM sessions 
        GROUP BY machine_name
    ''')
    rows = cursor.fetchall()
    
    employees = []
    for r in rows:
        machine = r["machine_name"]
        # Calculate distraction for this machine
        cursor.execute('''
            SELECT SUM(i.duration_sec), SUM(a.duration_sec)
            FROM sessions s
            LEFT JOIN idle_periods i ON s.id = i.session_id
            LEFT JOIN app_events a ON s.id = a.session_id
            WHERE s.machine_name = ?
        ''', (machine,))
        idle, active = cursor.fetchone()
        idle = idle or 0
        active = active or 0
        dist = (idle / (idle + active) * 100) if (idle + active) > 0 else 0
        
        employees.append({
            "name": machine,
            "email": f"system@{machine.lower()}.local",
            "phase": 2 if active > 3600 else 1,
            "distraction": round(dist, 1),
            "roi": int(active / 3600 * 150) # Mock ROI calculation
        })
    
    conn.close()
    return employees

@app.get("/api/activity-chart")
async def get_activity_chart():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT app_name, SUM(duration_sec)/3600.0 as hours
        FROM app_events
        GROUP BY app_name ORDER BY hours DESC LIMIT 5
    ''')
    rows = cursor.fetchall()
    conn.close()
    
    return [
        {"name": r["app_name"], "value": round(r["hours"], 1)}
        for r in rows
    ]

@app.get("/api/distraction-trend")
async def get_distraction_trend():
    conn = get_db()
    cursor = conn.cursor()
    # Get distraction for last 7 days
    trend = []
    for i in range(6, -1, -1):
        date = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
        cursor.execute("SELECT SUM(duration_sec) FROM idle_periods WHERE start_time LIKE ?", (f'{date}%',))
        idle = cursor.fetchone()[0] or 0
        cursor.execute("SELECT SUM(duration_sec) FROM app_events WHERE start_time LIKE ?", (f'{date}%',))
        active = cursor.fetchone()[0] or 0
        
        dist = (idle / (idle + active) * 100) if (idle + active) > 0 else 0
        trend.append({"date": date, "value": round(dist, 1)})
    
    conn.close()
    return trend

@app.post("/api/agent2/run")
async def run_agent2(employee_name: str):
    return {"message": f"Agent 2 triggered for {employee_name}. Check Reports for output."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
