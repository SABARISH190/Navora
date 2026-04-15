from app.core.state_manager import state_manager
from app.data.schema import Zone
from app.data.database import SessionLocal, ZoneDB
import logging

logger = logging.getLogger(__name__)

DEFAULT_ZONES = [
    {"name": "Gate A", "capacity": 100, "simulated_density": 30, "queue_time": 5},
    {"name": "Gate B", "capacity": 50, "simulated_density": 20, "queue_time": 3},
    {"name": "Food Court", "capacity": 500, "simulated_density": 50, "queue_time": 10},
]


def initialize_zones():
    """Load zones from SQLite if they exist, otherwise seed defaults."""
    db = SessionLocal()
    try:
        saved_zones = db.query(ZoneDB).all()

        if saved_zones:
            for z in saved_zones:
                zone = Zone(
                    name=z.name,
                    capacity=z.capacity,
                    simulated_density=z.simulated_density or 0,
                    gate_count=z.gate_count or 0,
                    bluetooth_count=z.bluetooth_count or 0,
                    manual_adjustment=z.manual_adjustment or 0,
                    queue_time=z.queue_time or 0,
                )
                state_manager.zones[zone.name] = zone
            logger.info(f"[DB] Loaded {len(saved_zones)} zones from database")
        else:
            _seed_defaults(db)
    except Exception as e:
        logger.error(f"[DB] Failed to load from database: {e}")
        _seed_defaults(db)
    finally:
        db.close()


def _seed_defaults(db):
    """Insert default zones into both state manager and database."""
    for z_data in DEFAULT_ZONES:
        zone = Zone(**z_data)
        state_manager.update_zone(zone)

        db_zone = ZoneDB(
            name=z_data["name"],
            capacity=z_data["capacity"],
            simulated_density=z_data.get("simulated_density", 0),
            queue_time=z_data.get("queue_time", 0),
        )
        db.merge(db_zone)

    db.commit()
    logger.info(f"[DB] Seeded {len(DEFAULT_ZONES)} default zones")
