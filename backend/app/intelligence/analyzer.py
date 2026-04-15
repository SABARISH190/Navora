"""
Intelligence Analyzer — combines predictions and navigation
into a single intelligence report for the frontend.
"""
from app.intelligence.predictor import run_predictions
from app.intelligence.navigator import get_all_navigation


def run_intelligence() -> dict:
    """Generate a full intelligence report combining predictions and navigation."""
    return {
        "predictions": run_predictions(),
        "navigation": get_all_navigation(),
    }
