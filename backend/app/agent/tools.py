from typing import Dict, Any, List
from datetime import datetime, timedelta

def read_data(workspace_id: str, query: str) -> Dict[str, Any]:
    """Reads structured records from the workspace context."""
    if "invoice" in query.lower() or "overdue" in query.lower():
        return {
            "entity": "invoices",
            "count": 3,
            "overdue_invoices": [
                {"id": "inv_101", "client": "Cedar Park Facilities", "amount": 1450.00, "days_late": 18},
                {"id": "inv_102", "client": "Harbourview Real Estate", "amount": 890.00, "days_late": 15},
                {"id": "inv_103", "client": "Van 2 Logistics", "amount": 2300.00, "days_late": 22}
            ]
        }
    return {"entity": "general_records", "results": [f"Record matching query: {query}"]}

def busy_times(workspace_id: str, tech_name: str, target_date: str) -> Dict[str, Any]:
    """Scans calendar events for technician availability."""
    return {
        "technician": tech_name,
        "date": target_date,
        "free_slots": ["08:00 AM", "11:30 AM", "02:30 PM"],
        "booked_slots": ["09:30 AM - 11:00 AM (Site Visit)", "04:00 PM - 05:00 PM (Wrap-up)"],
        "recommended_slot": "08:00 AM"
    }

def propose_job(workspace_id: str, title: str, instruction: str, cron: str) -> Dict[str, Any]:
    """Prepares an autonomous background job with schedule."""
    return {
        "job_id": f"job_{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "title": title,
        "instruction": instruction,
        "cron_expression": cron,
        "requires_approval": True,
        "status": "pending_confirmation"
    }

def send_message(workspace_id: str, recipient: str, subject: str, body: str) -> Dict[str, Any]:
    """Drafts or sends an email/Slack message."""
    return {
        "status": "prepared",
        "recipient": recipient,
        "subject": subject,
        "body_preview": body,
        "requires_human_approval": True
    }

def add_to_home(workspace_id: str, widget_title: str, widget_type: str, dims: Dict[str, int]) -> Dict[str, Any]:
    """Synthesizes and mounts a dynamic card to the Home canvas."""
    return {
        "unit_id": f"unit_{widget_type}_{datetime.now().strftime('%M%S')}",
        "title": widget_title,
        "surface": "home",
        "dimensions": dims,
        "mounted": True
    }

def export_file(workspace_id: str, filename: str, format_type: str, data: Any) -> Dict[str, Any]:
    """Packages and exports data artifacts (CSV, PDF)."""
    return {
        "download_url": f"/api/exports/{filename}.{format_type}",
        "filename": f"{filename}.{format_type}",
        "format": format_type,
        "size_kb": 42
    }
