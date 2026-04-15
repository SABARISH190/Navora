from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.logger import setup_logger

setup_logger()
from app.core.init_data import initialize_zones
from app.api.routes import router
from app.websocket.routes import router as ws_router
from app.simulation.simulator import simulate_crowd
from app.core.config import settings
from app.data.database import create_tables
import asyncio

async def auto_simulation():
    while True:
        if settings.MODE == "simulation":
            await simulate_crowd()
        
        # Broadcast predictions every tick (both modes)
        try:
            from app.intelligence.predictor import run_predictions
            predictions = run_predictions()
            if predictions:
                await manager.broadcast({
                    "type": "prediction",
                    "data": predictions
                })
        except Exception:
            pass
        
        await asyncio.sleep(5)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    create_tables()
    initialize_zones()
    task = asyncio.create_task(auto_simulation())
    yield
    # Shutdown logic (if any)
    task.cancel()

app = FastAPI(title="Navora API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "status": "success",
        "data": {"message": "Navora Backend Running"}
    }

app.include_router(router)
app.include_router(ws_router)
