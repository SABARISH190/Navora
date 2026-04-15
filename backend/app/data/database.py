from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

engine = create_engine(settings.database_url, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class ZoneDB(Base):
    __tablename__ = "zones"

    name = Column(String, primary_key=True)
    capacity = Column(Integer, nullable=False)
    simulated_density = Column(Integer, default=0)
    gate_count = Column(Integer, default=0)
    bluetooth_count = Column(Integer, default=0)
    manual_adjustment = Column(Integer, default=0)
    queue_time = Column(Integer, default=0)


class DecisionLog(Base):
    __tablename__ = "decisions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(Float, nullable=False)
    user_action = Column(String)
    organizer_action = Column(String)
    reason = Column(String)
    confidence = Column(String)
    mode = Column(String)


def create_tables():
    Base.metadata.create_all(bind=engine)
