from fastapi import APIRouter, HTTPException
from app.simulation.simulator import simulate_crowd
from app.simulation.events import crowd_spike
from app.core.state_manager import state_manager
from app.ai.pipeline import ai_pipeline
from app.core.config import settings
from app.websocket.manager import manager
from pydantic import BaseModel
import logging
import time

logger = logging.getLogger(__name__)
last_called = 0

router = APIRouter()

@router.get("/state")
def get_state():
    logger.info("GET /state called")
    return {
        "status": "success",
        "data": state_manager.get_state()
    }


class ModePayload(BaseModel):
    mode: str

@router.post("/mode")
async def switch_mode(payload: ModePayload):
    mode = payload.mode
    if mode not in ["simulation", "realtime"]:
        raise HTTPException(status_code=400, detail="Invalid mode")
    
    settings.MODE = mode
    logger.info(f"System mode switched to: {mode.upper()}")
    
    if mode == "realtime":
        for zone in state_manager.zones.values():
            zone.simulated_density = 0
    
    # Broadcast to frontend instantly
    await manager.broadcast({
        "type": "mode_update",
        "mode": settings.MODE
    })

    return {
        "status": "success",
        "data": {"mode": settings.MODE}
    }

@router.post("/simulate")
async def run_simulation():
    if settings.MODE != "simulation":
        return {"status": "error", "data": {"message": "Simulation disabled in realtime mode"}}
    
    global last_called
    if time.time() - last_called < 1:
        return {
            "status": "error",
            "data": {"message": "Too many requests"}
        }
    last_called = time.time()

    logger.info("POST /simulate triggered")
    await simulate_crowd()
    return {
        "status": "success",
        "data": {"message": "Simulation updated"}
    }

@router.post("/event/{zone_name}")
def trigger_event(zone_name: str):
    result = crowd_spike(zone_name)
    if result and "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
        
    return {
        "status": "success",
        "data": {"message": f"Spike triggered at {zone_name}"}
    }

@router.get("/decision")
async def get_decision():
    try:
        result = await ai_pipeline.run()
    except Exception as e:
        logger.error(f"Decision failed: {str(e)}")
        raise HTTPException(status_code=500, detail="AI processing failed")
        
    return {
        "status": "success",
        "data": result
    }

# --- REAL-TIME PLACEHOLDERS ---

class ZonePayload(BaseModel):
    zone: str
    count: int = 1

@router.post("/gate-entry")
async def gate_entry(payload: ZonePayload):
    if settings.MODE != "realtime":
        return {"status": "error", "data": {"message": "Realtime disabled"}}
    
    state_manager.update_gate_count(payload.zone, payload.count)
    logger.info(f"[REAL] {payload.zone} → gate +{payload.count}")
    
    await manager.broadcast({
        "type": "state_update",
        "data": state_manager.get_state()
    })
    return {"status": "success"}

@router.post("/bluetooth-update")
async def bluetooth_update(payload: ZonePayload):
    if settings.MODE != "realtime":
        return {"status": "error", "data": {"message": "Realtime disabled"}}
    
    state_manager.update_bluetooth(payload.zone, payload.count)
    logger.info(f"[BT] {payload.zone} → {payload.count} devices")
    
    await manager.broadcast({
        "type": "state_update",
        "data": state_manager.get_state()
    })
    return {"status": "success"}

@router.post("/zone-adjust")
async def zone_adjust(payload: ZonePayload):
    if settings.MODE != "realtime":
        return {"status": "error", "data": {"message": "Realtime disabled"}}
    
    state_manager.update_manual(payload.zone, payload.count)
    logger.info(f"[MANUAL] {payload.zone} → manual {payload.count}")
    
    await manager.broadcast({
        "type": "state_update",
        "data": state_manager.get_state()
    })
    return {"status": "success"}

# --- ADMIN CONTROLS ---

class ResetPayload(BaseModel):
    zone: str

@router.post("/zone/reset")
async def reset_zone(payload: ResetPayload):
    zone_name = payload.zone
    if zone_name not in state_manager.zones:
        raise HTTPException(status_code=404, detail="Zone not found")
    
    zone = state_manager.zones[zone_name]
    zone.gate_count = 0
    zone.bluetooth_count = 0
    zone.manual_adjustment = 0
    zone.simulated_density = 0
    zone.queue_time = 0
    state_manager._persist(zone)
    state_manager._log_history(zone_name)
    
    logger.info(f"[ADMIN] Zone reset: {zone_name}")
    
    await manager.broadcast({
        "type": "state_update",
        "data": state_manager.get_state()
    })
    return {"status": "success", "data": {"message": f"{zone_name} reset"}}

# --- INTELLIGENCE LAYER ---

@router.get("/predict")
def get_predictions():
    from app.intelligence.predictor import run_predictions
    predictions = run_predictions()
    return {
        "status": "success",
        "data": predictions
    }

@router.get("/navigate/{zone_name}")
def navigate(zone_name: str):
    from app.intelligence.navigator import get_navigation
    result = get_navigation(zone_name)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return {
        "status": "success",
        "data": result
    }

@router.get("/intelligence")
def get_intelligence():
    from app.intelligence.analyzer import run_intelligence
    result = run_intelligence()
    return {
        "status": "success",
        "data": result
    }
