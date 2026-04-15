from app.core.state_manager import state_manager
import logging

logger = logging.getLogger(__name__)

def crowd_spike(zone_name: str):
    if zone_name not in state_manager.zones:
        return {"error": "Zone not found"}
        
    zone = state_manager.zones.get(zone_name)
    if zone:
        zone.simulated_density = min(zone.capacity, zone.simulated_density + 30)
        zone.queue_time += 10
        state_manager.update_zone(zone)
        logger.info(f"[EVENT] Crowd spike triggered at {zone_name}")
        return {"status": "success", "message": f"Spike triggered at {zone_name}"}
