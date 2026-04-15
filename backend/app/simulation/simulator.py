import random
from app.core.state_manager import state_manager
from app.data.schema import Zone
from app.websocket.manager import manager
import logging

logger = logging.getLogger(__name__)

async def simulate_crowd():
    for zone_name, zone in state_manager.zones.items():
        new_density = max(0, min(zone.capacity, zone.crowd_density + random.randint(-10, 15)))
        new_queue = max(0, zone.queue_time + random.randint(-2, 5))

        existing = state_manager.zones.get(zone_name)

        updated_zone = Zone(
            name=zone_name,
            capacity=zone.capacity,
            simulated_density=new_density,
            queue_time=new_queue,
            gate_count=existing.gate_count if existing else 0,
            bluetooth_count=existing.bluetooth_count if existing else 0,
            manual_adjustment=existing.manual_adjustment if existing else 0
        )

        state_manager.update_zone(updated_zone)
        logger.info(f"[SIM] Simulation updated zone: {zone_name} → density={new_density}")

    await manager.broadcast({
        "type": "state_update",
        "data": state_manager.get_state()
    })
