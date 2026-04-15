from typing import Dict, Any, List
import time
import logging
from app.data.schema import Zone

logger = logging.getLogger(__name__)


class StateManager:
    def __init__(self):
        self.zones: Dict[str, Zone] = {}
        self.history: List[Dict[str, Any]] = []

    def _persist(self, zone: Zone):
        """Persist zone state to SQLite."""
        try:
            from app.data.database import SessionLocal, ZoneDB
            db = SessionLocal()
            db_zone = ZoneDB(
                name=zone.name,
                capacity=zone.capacity,
                simulated_density=zone.simulated_density,
                gate_count=zone.gate_count,
                bluetooth_count=zone.bluetooth_count,
                manual_adjustment=zone.manual_adjustment,
                queue_time=zone.queue_time,
            )
            db.merge(db_zone)
            db.commit()
            db.close()
        except Exception as e:
            logger.error(f"[DB] Persist failed for {zone.name}: {e}")

    def update_zone(self, zone: Zone):
        if zone.simulated_density > zone.capacity:
            zone.simulated_density = zone.capacity
        data = zone.model_dump()
        data["utilization"] = zone.utilization
        data["timestamp"] = time.time()
        self.zones[zone.name] = zone
        self.history.append(data)
        self._persist(zone)

    def _log_history(self, zone_name: str):
        zone = self.zones[zone_name]
        data = zone.model_dump()
        data["utilization"] = zone.utilization
        data["timestamp"] = time.time()
        self.history.append(data)
        self._persist(zone)

    def update_gate_count(self, zone_name: str, count: int):
        if zone_name in self.zones:
            zone = self.zones[zone_name]
            zone.gate_count = max(0, zone.gate_count + count)
            self._log_history(zone_name)

    def update_bluetooth(self, zone_name: str, count: int):
        if zone_name in self.zones:
            zone = self.zones[zone_name]
            zone.bluetooth_count = min(count, zone.capacity)
            self._log_history(zone_name)

    def update_manual(self, zone_name: str, count: int):
        if zone_name in self.zones:
            zone = self.zones[zone_name]
            zone.manual_adjustment = max(-zone.capacity, zone.manual_adjustment + count)
            self._log_history(zone_name)

    def get_state(self):
        # Normalize zone output to dictionaries for clean FastAPI serialization
        return {k: v.model_dump() for k, v in self.zones.items()}


state_manager = StateManager()
