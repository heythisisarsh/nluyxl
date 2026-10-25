import pytest
import asyncio
from app.security.vault import encrypt_token, decrypt_token
from app.agent.hitl import evaluate_action_risk, generate_approval_card
from app.agent.tools import read_data, busy_times, propose_job, send_message
from app.agent.graph import get_compiled_graph, AgentState

def test_aes_encryption_roundtrip():
    secret = "gho_test_oauth_access_token_12345"
    enc = encrypt_token(secret)
    assert "ciphertext" in enc
    assert "iv" in enc
    dec = decrypt_token(enc)
    assert dec == secret

def test_hitl_risk_evaluation():
    risk, req_appr = evaluate_action_risk("send_message", {})
    assert risk == "high"
    assert req_appr is True

    risk, req_appr = evaluate_action_risk("read_data", {})
    assert risk == "low"
    assert req_appr is False

def test_approval_card_generation():
    card = generate_approval_card("send_message", {"recipient": "client@example.com", "subject": "Invoice Reminder"})
    assert card["risk"] == "high"
    assert "client@example.com" in card["description"]

@pytest.mark.asyncio
async def test_agent_graph_scheduling_intent():
    graph = get_compiled_graph()
    initial_state: AgentState = {
        "user_id": "test_user",
        "workspace_id": "test_ws",
        "prompt": "Every Monday at 8 chase overdue invoices",
        "history": [],
        "status": "thinking",
        "current_tool": None,
        "tool_args": None,
        "tool_result": None,
        "approval_card": None,
        "final_output": None
    }
    result = await graph.ainvoke(initial_state)
    assert result["status"] == "scheduling"
    assert result["current_tool"] == "propose_job"
    assert result["approval_card"] is not None
