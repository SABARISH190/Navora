from pydantic import BaseModel, Field, computed_field

class Zone(BaseModel):
    name: str
    capacity: int = Field(gt=0)
    simulated_density: int = 0
    gate_count: int = 0
    bluetooth_count: int = 0
    manual_adjustment: int = 0
    queue_time: int = Field(ge=0)    # minutes

    @computed_field
    @property
    def crowd_density(self) -> int:
        from app.core.config import settings
        if settings.MODE == "simulation":
            return min(self.capacity, self.simulated_density)
            
        computed = int(
            self.gate_count * settings.GATE_WEIGHT +
            self.bluetooth_count * settings.BT_WEIGHT +
            self.manual_adjustment * settings.MANUAL_WEIGHT
        )
        return min(self.capacity, computed)

    @computed_field
    @property
    def utilization(self) -> float:
        return self.crowd_density / self.capacity if self.capacity > 0 else 0.0
