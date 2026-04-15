from fastapi.testclient import TestClient
from app.main import app
from app.core.state_manager import state_manager
import json

def run_tests():
    print("\n--- Step 1: Start Server ---")
    print("TestClient initializing (equivalent to uvicorn app.main:app)")
    
    with TestClient(app) as client:
        print("\n--- Step 2: Base Endpoint Test ---")
        try:
            r = client.get("/")
            print(json.dumps(r.json(), indent=2))
        except Exception as e:
            print("Error:", e)
            
        print("\n--- Step 3: State Initialization Test ---")
        try:
            r = client.get("/state")
            state_before = r.json()
            print(json.dumps(state_before, indent=2))
        except Exception as e:
            print("Error:", e)

        print("\n--- Step 4: Simulation Test ---")
        try:
            client.post("/simulate")
            r_after = client.get("/state")
            state_after = r_after.json()
            print("[BEFORE STATE]:")
            print(json.dumps(state_before["data"], indent=2))
            print("[AFTER STATE]:")
            print(json.dumps(state_after["data"], indent=2))
        except Exception as e:
            print("Error:", e)

        print("\n--- Step 5: Event Trigger Test ---")
        try:
            client.post("/event/Gate A")
            r_event = client.get("/state")
            print("[GATE A AFTER SPIKE]:")
            print(json.dumps(r_event.json()["data"]["Gate A"], indent=2))
        except Exception as e:
            print("Error:", e)

        print("\n--- Step 6: Invalid Event Test ---")
        try:
            r_inv = client.post("/event/InvalidZone")
            print(f"Status Code: {r_inv.status_code}")
            print(json.dumps(r_inv.json(), indent=2))
        except Exception as e:
            print("Error:", e)

        print("\n--- Step 7: History Validation Test ---")
        try:
            history = state_manager.history
            print(f"Total History Entries: {len(history)}")
            print("Last 3 History Entries:")
            for h in history[-3:]:
                print(json.dumps(h, indent=2))
        except Exception as e:
            print("Error:", e)

        print("\n--- Step 8: Consistency Check ---")
        print("Done - See response structures above.")

if __name__ == "__main__":
    run_tests()
