from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import get_db
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
    
    # Active Employees (last 30 days)
    cursor.execute("SELECT COUNT(DISTINCT id) FROM employees")
    active_count = cursor.fetchone()[0]
    
    # Avg Active Hours
    cursor.execute("SELECT AVG(active_sec)/3600 FROM daily_summary")
    avg_hours = cursor.fetchone()[0] or 0
    
    # Avg Distraction Rate
    cursor.execute("SELECT AVG(distraction_pct) FROM daily_summary")
    avg_distraction = cursor.fetchone()[0] or 0
    
    conn.close()
    
    return {
        "active_employees": active_count,
        "avg_active_hours": round(avg_hours, 1),
        "avg_distraction_pct": round(avg_distraction, 1),
        "proposals_generated": 7 # Hardcoded for demo
    }

@app.get("/api/employees")
async def get_employees():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT e.name, e.email, e.phase, AVG(d.distraction_pct) as dist, e.roi_monthly
        FROM employees e
        LEFT JOIN daily_summary d ON e.id = d.employee_id
        GROUP BY e.id
    ''')
    rows = cursor.fetchall()
    conn.close()
    
    return [
        {
            "name": r["name"],
            "email": r["email"],
            "phase": r["phase"],
            "distraction": round(r["dist"], 1),
            "roi": r["roi_monthly"]
        } for r in rows
    ]

@app.get("/api/activity-chart")
async def get_activity_chart():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT process_name, SUM(duration_sec)/3600.0 as hours
        FROM app_events
        GROUP BY process_name ORDER BY hours DESC LIMIT 5
    ''')
    rows = cursor.fetchall()
    conn.close()
    
    return [
        {"name": r["process_name"], "value": round(r["hours"], 1)}
        for r in rows
    ]

@app.get("/api/distraction-trend")
async def get_distraction_trend():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT date, AVG(distraction_pct) as dist
        FROM daily_summary
        GROUP BY date ORDER BY date ASC LIMIT 30
    ''')
    rows = cursor.fetchall()
    conn.close()
    
    return [{"date": r["date"], "value": round(r["dist"], 1)} for r in rows]

@app.post("/api/agent2/run")
async def run_agent2(employee_name: str):
    return {"message": f"Agent 2 triggered for {employee_name}. Check Reports for output."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
