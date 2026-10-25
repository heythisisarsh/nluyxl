from typing import Dict, Any

def synthesize_widget(prompt: str) -> Dict[str, Any]:
    """
    Translates natural language ("Say what you want to see, and the agent builds it")
    into a declarative, sandboxed UI schema.
    """
    p = prompt.lower()
    
    if "quote" in p or "photo" in p:
        return {
            "widget_id": "widget_quote_builder",
            "title": "Photo Quote Builder",
            "type": "custom_app",
            "schema": {
                "components": [
                    {"type": "image_uploader", "label": "Upload equipment photo"},
                    {"type": "button", "label": "Extract Part Serial & Price", "action": "price_photo"},
                    {"type": "table", "columns": ["Part Name", "SKU", "Est. Labor", "Price"]}
                ]
            },
            "sandbox_flags": "allow-scripts"
        }
    elif "aging" in p or "receivable" in p or "revenue" in p:
        return {
            "widget_id": "widget_receivables_aging",
            "title": "A/R Aging Analysis",
            "type": "chart",
            "schema": {
                "chart_type": "bar",
                "x_axis": ["Current", "1-30 Days", "31-60 Days", "60+ Days"],
                "y_data": [18200, 4640, 2300, 1450]
            },
            "sandbox_flags": "allow-scripts"
        }
    
    return {
        "widget_id": "widget_custom_feed",
        "title": "Custom Operational View",
        "type": "feed",
        "schema": {
            "title": "Live Status",
            "items": [f"Synthesized view for: {prompt}"]
        },
        "sandbox_flags": "allow-scripts"
    }
