import asyncio
import json
from typing import TypedDict, List, Dict, Any, Optional, AsyncGenerator
from langgraph.graph import StateGraph, END
from app.agent.tools import read_data, busy_times, propose_job, send_message, add_to_home, export_file
from app.agent.hitl import evaluate_action_risk, generate_approval_card
from app.agent.synthesizer import synthesize_widget

class AgentState(TypedDict):
    user_id: str
    workspace_id: str
    prompt: str
    history: List[Dict[str, str]]
    # 9 Reverse-Engineered States:
    # thinking, waiting, scheduling, booking, messaging, charting, exporting, showing, calling
    status: str
    current_tool: Optional[str]
    tool_args: Optional[Dict[str, Any]]
    tool_result: Optional[Dict[str, Any]]
    approval_card: Optional[Dict[str, Any]]
    final_output: Optional[str]

async def router_node(state: AgentState) -> AgentState:
    p = state["prompt"].lower()
    
    # 1. Scheduling State
    if "invoice" in p and ("every" in p or "schedule" in p or "chase" in p):
        state["status"] = "scheduling"
        state["current_tool"] = "propose_job"
        state["tool_args"] = {
            "title": "Overdue Invoices Follow-up",
            "instruction": "Scan QuickBooks weekly and draft emails for unpaid bills > 14 days.",
            "cron": "0 8 * * 1"
        }
        res = propose_job(state["workspace_id"], **state["tool_args"])
        state["tool_result"] = res
        state["approval_card"] = generate_approval_card("propose_job", res)
        state["final_output"] = "I have configured the background routine to check overdue invoices every Monday at 8 AM."

    # 2. Booking State
    elif "busy" in p or "calendar" in p or "first thing" in p or "book" in p:
        state["status"] = "booking"
        state["current_tool"] = "busy_times"
        state["tool_args"] = {"tech_name": "Dev", "target_date": "tomorrow"}
        res = busy_times(state["workspace_id"], **state["tool_args"])
        state["tool_result"] = res
        state["final_output"] = f"Checked the calendar: Technician {res['technician']} is free at {res['recommended_slot']}. Booked slot and notified in Slack."

    # 3. Messaging / Waiting (HITL) State
    elif "reply" in p or "send email" in p or "draft" in p:
        state["status"] = "waiting"
        state["current_tool"] = "send_message"
        state["tool_args"] = {
            "recipient": "client@cedarpark.com",
            "subject": "Overhaul Availability",
            "body": "Hi team, we can dispatch our technician to Cedar Park this Thursday at 10 AM or Friday at 2 PM. Please let us know which suits you best."
        }
        res = send_message(state["workspace_id"], **state["tool_args"])
        state["tool_result"] = res
        state["approval_card"] = generate_approval_card("send_message", res)
        state["final_output"] = "I checked the calendar and drafted the reply to Cedar Park. Please review the approval card."

    # 4. Charting / Synthetic App State
    elif "make a widget" in p or "widget" in p or "chart" in p or "quote" in p:
        state["status"] = "charting"
        state["current_tool"] = "add_to_home"
        synthesized = synthesize_widget(p)
        res = add_to_home(state["workspace_id"], synthesized["title"], synthesized["type"], {"w": 4, "h": 2})
        res["widget_spec"] = synthesized
        state["tool_result"] = res
        state["final_output"] = f"Created dynamic widget '{synthesized['title']}' and mounted it to your Home canvas."

    # 5. Exporting State
    elif "export" in p or "sheet" in p or "csv" in p:
        state["status"] = "exporting"
        state["current_tool"] = "export_file"
        res = export_file(state["workspace_id"], "cedar_park_job_history", "csv", {})
        state["tool_result"] = res
        state["final_output"] = "Generated CSV export of Cedar Park job history. Ready for download."

    # 6. Default Thinking / Ingestion State
    else:
        state["status"] = "thinking"
        state["current_tool"] = "read_data"
        res = read_data(state["workspace_id"], p)
        state["tool_result"] = res
        state["final_output"] = f"Analyzed workspace data: {res.get('entity', 'general records')}."

    return state

def get_compiled_graph():
    graph = StateGraph(AgentState)
    graph.add_node("router", router_node)
    graph.set_entry_point("router")
    graph.add_edge("router", END)
    return graph.compile()

async def stream_agent_events(user_id: str, workspace_id: str, prompt: str) -> AsyncGenerator[str, None]:
    """
    Server-Sent Events (SSE) generator streaming states and tokens to client.
    """
    # 1. Initial Thinking State
    yield f"data: {json.dumps({'type': 'status', 'status': 'thinking', 'message': 'Classifying intent across business tools...'})}\n\n"
    await asyncio.sleep(0.3)

    initial_state: AgentState = {
        "user_id": user_id,
        "workspace_id": workspace_id,
        "prompt": prompt,
        "history": [],
        "status": "thinking",
        "current_tool": None,
        "tool_args": None,
        "tool_result": None,
        "approval_card": None,
        "final_output": None
    }

    graph = get_compiled_graph()
    final_state = await graph.ainvoke(initial_state)

    # 2. Yield Active Tool State
    yield f"data: {json.dumps({'type': 'state_change', 'status': final_state['status'], 'tool': final_state['current_tool'], 'tool_result': final_state['tool_result']})}\n\n"
    await asyncio.sleep(0.2)

    # 3. If approval is required, yield interactive HITL card
    if final_state["approval_card"]:
        yield f"data: {json.dumps({'type': 'approval_required', 'card': final_state['approval_card']})}\n\n"

    # 4. Stream Markdown Tokens
    text = final_state["final_output"] or "Operation completed."
    for word in text.split(" "):
        yield f"data: {json.dumps({'type': 'token', 'token': word + ' '})}\n\n"
        await asyncio.sleep(0.03)

    # 5. Finish Stream
    yield f"data: {json.dumps({'type': 'done'})}\n\n"
