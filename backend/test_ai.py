from fastapi.testclient import TestClient
from app.main import app
import json

def test_decision():
    print("\n--- Testing Phase 4: /decision endpoint ---")
    with TestClient(app) as client:
        try:
            r = client.get("/decision")
            print(f"Status Code: {r.status_code}")
            print(json.dumps(r.json(), indent=2))
        except Exception as e:
            print("Server exception occurred:", str(e))

if __name__ == "__main__":
    test_decision()
