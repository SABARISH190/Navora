SYSTEM_PROMPT = """
You are Navora, an AI crowd intelligence system.

Your job:
- Analyze crowd data
- Predict congestion
- Recommend optimal actions

Rules:
- Always respond in strictly valid JSON format
- Do NOT output anything outside the JSON object
- Do NOT include markdown tags like ```json
- Do NOT explain outside fields
- Your response must adhere to the provided schema
"""

def build_decision_prompt(state_data: str, mode: str = "simulation", predictions: list = None, navigation: list = None) -> str:
    prediction_ctx = ""
    if predictions:
        lines = [f"  - {p['zone']}: {p['prediction']} (severity: {p['severity']}, {p['utilization']}%)" for p in predictions]
        prediction_ctx = "\n\nPredictive Alerts (trend-based forecasting):\n" + "\n".join(lines)

    nav_ctx = ""
    if navigation:
        lines = [f"  - From {n['from']}: {n['message']}" for n in navigation]
        nav_ctx = "\n\nNavigation Suggestions:\n" + "\n".join(lines)

    return f"""
Given the following crowd state data (includes capacity, crowd_density, utilization %, and queue_time):
Note: The system is operating in '{mode.upper()}' mode. Each zone includes:
- Gate Count (Raw physical entries)
- Bluetooth Count (Wireless devices detected)
- Manual Adjustments (Organizer corrections)
- Utilization % (Computed weighted density vs capacity)

{state_data}
{prediction_ctx}
{nav_ctx}

Decision Quality Rules:
- CRITICAL: NEVER recommend a user head to a zone if its utilization is > 80%. Prioritize physical capacity and low utilization FIRST to prevent dangerous overcrowding!
- CRITICAL: If a zone is near 100% capacity, it is unsafe. Strictly forbid routing users towards it, regardless of its queue time.
- Consider queue_time only as a secondary tie-breaker between safe zones.
- Use numerical comparisons explicitly (e.g., 30% vs 80%) when reasoning.
- Factor in predictive alerts when making decisions — if a zone is trending upward, avoid routing users there even if current utilization is moderate.
- If all zones are violently congested, recommend organizers block pathways and deploy staff.

Provide:
1. Best action for users
2. Best action for organizers
3. Reason
4. Confidence level

Return JSON format strictly:
{{
  "user_action": "...",
  "organizer_action": "...",
  "reason": "...",
  "confidence": "high | medium | low"
}}
"""
