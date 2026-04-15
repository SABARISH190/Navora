"""
Navigation Engine — recommends the least-crowded path
based on a zone connectivity graph, cost scoring,
and comparative utilization messaging.
"""
from app.core.state_manager import state_manager
import logging

logger = logging.getLogger(__name__)

# Zone connectivity graph — which zones can you walk to from each zone
ZONE_GRAPH = {
    "Gate A": ["Gate B", "Food Court"],
    "Gate B": ["Gate A", "Food Court"],
    "Food Court": ["Gate A", "Gate B"],
}


def get_zone_cost(zone_data: dict) -> float:
    """Lower is better. Combines utilization + normalized queue penalty."""
    utilization = zone_data.get("utilization", 0)
    queue_time = zone_data.get("queue_time", 0)
    return utilization + (queue_time / 20)


def find_best_destination(start: str, state: dict) -> str | None:
    """From a given zone, find the neighboring zone with the lowest cost."""
    neighbors = ZONE_GRAPH.get(start, [])
    if not neighbors:
        return None

    best = None
    best_score = float("inf")

    for neighbor in neighbors:
        if neighbor in state:
            score = get_zone_cost(state[neighbor])
            if score < best_score:
                best_score = score
                best = neighbor

    return best


def get_navigation(start: str) -> dict:
    """Generate a rich navigation recommendation from a starting zone."""
    state = state_manager.get_state()

    if start not in state:
        return {"error": f"Zone '{start}' not found"}

    best = find_best_destination(start, state)

    if not best:
        return {
            "from": start,
            "to": None,
            "message": "No alternative routes available",
        }

    start_data = state[start]
    dest_data = state[best]
    start_cost = get_zone_cost(start_data)
    dest_cost = get_zone_cost(dest_data)

    if dest_cost >= start_cost:
        return {
            "from": start,
            "to": start,
            "message": f"Stay at {start} — it's already the best option",
        }

    start_util = round(start_data.get("utilization", 0) * 100, 1)
    dest_util = round(dest_data.get("utilization", 0) * 100, 1)
    diff = round(start_util - dest_util, 1)

    start_queue = start_data.get("queue_time", 0)
    dest_queue = dest_data.get("queue_time", 0)
    queue_diff = start_queue - dest_queue

    parts = [f"Head to {best}"]
    if diff > 0:
        parts.append(f"{diff}% less crowded")
    if queue_diff > 0:
        parts.append(f"~{queue_diff} min faster")

    return {
        "from": start,
        "to": best,
        "message": " — ".join(parts) if len(parts) > 1 else parts[0],
    }


def get_all_navigation() -> list:
    """Generate navigation recommendations for every zone."""
    results = []
    for zone_name in state_manager.zones:
        nav = get_navigation(zone_name)
        if "error" not in nav:
            results.append(nav)
    return results
