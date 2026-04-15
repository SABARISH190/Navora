"""
Predictive Alert Engine — detects rising/falling trends per zone
and forecasts congestion with computed time-to-capacity estimates.
"""
from app.core.state_manager import state_manager
import logging

logger = logging.getLogger(__name__)

# Cache: only recompute when state changes
_last_history_len = 0
_cached_predictions = []


def _get_zone_history(zone_name: str, limit: int = 10):
    """Extract the last N history entries for a specific zone."""
    entries = [h for h in state_manager.history if h.get("name") == zone_name]
    return entries[-limit:]


def detect_trend(zone_name: str) -> str:
    """Analyze the last 3 density readings to determine direction."""
    history = _get_zone_history(zone_name, 5)

    if len(history) < 3:
        return "stable"

    d1 = history[-3].get("crowd_density", 0)
    d2 = history[-2].get("crowd_density", 0)
    d3 = history[-1].get("crowd_density", 0)

    if d3 > d2 > d1:
        return "rising"
    if d3 < d2 < d1:
        return "falling"
    return "stable"


def _estimate_time_to_capacity(zone_name: str) -> int | None:
    """Estimate minutes until full capacity based on density growth rate."""
    history = _get_zone_history(zone_name, 5)
    if len(history) < 2:
        return None

    zone = state_manager.zones.get(zone_name)
    if not zone:
        return None

    d2 = history[-2].get("crowd_density", 0)
    d3 = history[-1].get("crowd_density", 0)
    rate = d3 - d2

    if rate <= 0:
        return None

    remaining = zone.capacity - d3
    if remaining <= 0:
        return 0

    # Each history tick ≈ 5 seconds, convert to minutes
    ticks_to_full = remaining / rate
    minutes = max(1, min(15, int((ticks_to_full * 5) / 60)))
    return minutes


def predict_congestion(zone_name: str) -> dict | None:
    """Predict whether a zone will become congested soon."""
    if zone_name not in state_manager.zones:
        return None

    zone = state_manager.zones[zone_name]
    trend = detect_trend(zone_name)
    utilization = zone.utilization
    eta = _estimate_time_to_capacity(zone_name)

    eta_str = f"~{eta} min to capacity" if eta else "trend accelerating"

    if trend == "rising" and utilization > 0.6:
        return {
            "zone": zone_name,
            "prediction": f"🔥 Congestion expected — {eta_str}",
            "severity": "high",
            "confidence": "high",
            "trend": trend,
            "utilization": round(utilization * 100, 1),
            "eta_minutes": eta,
        }

    if trend == "rising" and utilization > 0.4:
        return {
            "zone": zone_name,
            "prediction": f"⚠️ Load rising — {eta_str}",
            "severity": "medium",
            "confidence": "medium",
            "trend": trend,
            "utilization": round(utilization * 100, 1),
            "eta_minutes": eta,
        }

    return None


def run_predictions() -> list:
    """Scan all zones and return predictive alerts. Uses cache when state hasn't changed."""
    global _last_history_len, _cached_predictions

    current_len = len(state_manager.history)
    if current_len == _last_history_len and _cached_predictions:
        return _cached_predictions

    alerts = []
    for zone_name in state_manager.zones:
        result = predict_congestion(zone_name)
        if result:
            alerts.append(result)

    _last_history_len = current_len
    _cached_predictions = alerts
    return alerts
