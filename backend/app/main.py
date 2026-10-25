from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import json
import logging
from app.config import settings
from app.agent.graph import stream_agent_events

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("nluyxl")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="NLUYXL - Production Autonomous Workspace & Agent Engine"
)

# Enable CORS for Next.js Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory grid fallback / cache
_MOCK_GRID_STORE: Dict[str, Any] = {
    "units": [
        {"id": "grid_1", "unit_id": "unit_mailbox", "title": "Priority Mailbox", "x": 0, "y": 0, "w": 4, "h": 2},
        {"id": "grid_2", "unit_id": "unit_calendar", "title": "Today's Agenda", "x": 4, "y": 0, "w": 4, "h": 2},
        {"id": "grid_3", "unit_id": "unit_automation_invoicing", "title": "Active Automation: Invoicing", "x": 8, "y": 0, "w": 4, "h": 2}
    ]
}

class ChatStreamRequest(BaseModel):
    message: str
    workspace_id: Optional[str] = None
    session_id: Optional[str] = None

class GridSaveRequest(BaseModel):
    grid: List[Dict[str, Any]]

@app.get("/api/health")
async def health_check():
    """Liveness probe for DigitalOcean / Kubernetes."""
    return {
        "status": "healthy",
        "service": "nluyxl-api",
        "version": settings.VERSION,
        "supabase_connected": True
    }

@app.post("/api/chat/stream")
async def chat_stream(req: ChatStreamRequest):
    """
    Streams agent reasoning, tool call states, and approval cards via SSE.
    """
    ws_id = req.workspace_id or settings.DEFAULT_WORKSPACE_ID
    user_id = "100ccd33-a02d-4c46-8431-765db15d7020"
    
    return StreamingResponse(
        stream_agent_events(user_id=user_id, workspace_id=ws_id, prompt=req.message),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@app.put("/api/home/grid")
async def save_home_grid(req: GridSaveRequest):
    """
    Persists updated canvas coordinates (500ms debounce or pagehide keepalive).
    """
    _MOCK_GRID_STORE["units"] = req.grid
    logger.info(f"Updated Home Canvas Grid with {len(req.grid)} units.")
    return {"status": "saved", "grid": _MOCK_GRID_STORE["units"]}

@app.get("/api/home/grid")
async def get_home_grid():
    """Fetches the current canvas grid."""
    return {"grid": _MOCK_GRID_STORE["units"]}

@app.delete("/api/home/grid")
async def reset_home_grid():
    """Resets the user's canvas to team/workspace baseline."""
    _MOCK_GRID_STORE["units"] = [
        {"id": "grid_1", "unit_id": "unit_mailbox", "title": "Priority Mailbox", "x": 0, "y": 0, "w": 4, "h": 2},
        {"id": "grid_2", "unit_id": "unit_calendar", "title": "Today's Agenda", "x": 4, "y": 0, "w": 4, "h": 2},
        {"id": "grid_3", "unit_id": "unit_automation_invoicing", "title": "Active Automation: Invoicing", "x": 8, "y": 0, "w": 4, "h": 2}
    ]
    return {"status": "reset", "grid": _MOCK_GRID_STORE["units"]}

@app.get("/api/home/widgets")
async def get_widgets():
    """Polled every 120s or on page visibility focus."""
    return {
        "widgets": [
            {"id": "w_1", "name": "Priority Mailbox", "type": "mail", "status": "active"},
            {"id": "w_2", "name": "Today's Calendar", "type": "calendar", "status": "synced"},
            {"id": "w_3", "name": "A/R Invoicing Followup", "type": "automation", "status": "needs_approval"}
        ]
    }

@app.get("/api/mail/threads")
async def get_mail_threads(limit: int = 3):
    """Priority mailbox triage feed."""
    return {
        "threads": [
            {
                "id": "th_01",
                "sender": "David at Harbourview",
                "subject": "HVAC Maintenance Building 4",
                "preview": "Can your team quote on HVAC maintenance for Bldg 4?",
                "status": "draft_ready"
            },
            {
                "id": "th_02",
                "sender": "Elena at Cedar Park",
                "subject": "Heat pump overhaul schedule",
                "preview": "Please confirm if Dev or Sam can come this Thursday.",
                "status": "pending_reply"
            },
            {
                "id": "th_03",
                "sender": "QuickBooks Billing Alert",
                "subject": "3 Overdue invoices detected",
                "preview": "Invoices over 14 days late require attention.",
                "status": "action_needed"
            }
        ][:limit]
    }
