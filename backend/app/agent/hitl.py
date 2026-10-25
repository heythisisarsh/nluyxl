from typing import Dict, Any, Tuple

HIGH_RISK_TOOLS = {"send_message", "post_in_chat", "create_invoice", "charge_card", "delete_record"}
MEDIUM_RISK_TOOLS = {"propose_job", "start_job", "export_file", "write_app"}
LOW_RISK_TOOLS = {"read_data", "read_history", "busy_times", "add_to_home", "show_in_app"}

def evaluate_action_risk(tool_name: str, args: Dict[str, Any]) -> Tuple[str, bool]:
    """
    Evaluates whether an action requires human approval.
    Returns (risk_level, requires_approval).
    """
    if tool_name in HIGH_RISK_TOOLS:
        return ("high", True)
    elif tool_name in MEDIUM_RISK_TOOLS:
        return ("medium", False)
    return ("low", False)

def generate_approval_card(tool_name: str, args: Dict[str, Any]) -> Dict[str, Any]:
    """
    Constructs the interactive approval card for the UI.
    """
    if tool_name == "send_message":
        return {
            "title": "Confirm Email Dispatch",
            "description": f"Ready to email {args.get('recipient')} with subject '{args.get('subject')}'.",
            "diff_preview": args.get("body_preview", ""),
            "action_id": f"act_{hash(str(args)) & 0xffffff}",
            "risk": "high"
        }
    elif tool_name == "propose_job":
        return {
            "title": "Confirm Automated Background Routine",
            "description": f"Schedule recurring job '{args.get('title')}' with schedule '{args.get('cron_expression')}'.",
            "diff_preview": args.get("instruction", ""),
            "action_id": f"act_{hash(str(args)) & 0xffffff}",
            "risk": "medium"
        }
    return {
        "title": "Approval Required",
        "description": f"Confirm execution of tool: {tool_name}",
        "diff_preview": str(args),
        "action_id": f"act_{hash(str(args)) & 0xffffff}",
        "risk": "high"
    }
