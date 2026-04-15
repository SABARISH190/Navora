import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    groq_api_key: str = os.getenv("GROQ_API_KEY")
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./navora.db")
    MODE: str = "simulation"
    GATE_WEIGHT: float = 0.6
    BT_WEIGHT: float = 0.3
    MANUAL_WEIGHT: float = 0.1

settings = Settings()
