from src.report_generator import ReportGenerator
from datetime import datetime
import os

def create_master():
    print("Generating Master Reports (aggregating all history)...")
    report = ReportGenerator()
    
    # Generate 90-day reports to capture all historical data in the DB
    days = 90 
    
    # Generate PDF
    pdf_path = report.create_report(days=days)
    
    # Generate JSON
    json_path = report.export_json(days=days)
    
    # Rename to Master
    timestamp = datetime.now().strftime("%Y%m%d")
    master_pdf = os.path.join("reports", f"MASTER_REPORT_{timestamp}.pdf")
    master_json = os.path.join("reports", f"MASTER_REPORT_{timestamp}.json")
    
    # Move/Rename
    if os.path.exists(pdf_path):
        os.replace(pdf_path, master_pdf)
        print(f"Master PDF created: {master_pdf}")
    
    if os.path.exists(json_path):
        os.replace(json_path, master_json)
        print(f"Master JSON created: {master_json}")

if __name__ == "__main__":
    create_master()
