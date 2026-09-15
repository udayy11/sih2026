import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from backend_py.main import app

def run_tests():
    client = TestClient(app)
    print("========================================")
    print("Testing NirmaanX Python/FastAPI Backend")
    print("========================================")

    # 1. Health
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("1. [PASS] Health check:", res.json())

    # 2. Auth Seed / Login
    res = client.post("/api/auth/login", json={"email": "analyst@mospi.gov.in", "password": "nirmaanx2026"})
    assert res.status_code == 200, f"Auth login failed: {res.text}"
    token = res.json()["access_token"]
    print("2. [PASS] JWT Authentication login successful. Token received.")

    # 3. Predict Cost Overrun (Scikit-learn Gradient Boosting)
    cost_payload = {
        "project_code": "PRJ-TEST-001",
        "name": "Delhi-Varanasi High Speed Rail Corridor",
        "sector": "Railways",
        "original_cost": 2500.0,
        "physical_progress": 35.0,
        "financial_progress": 60.0,
        "delay_months": 16
    }
    res = client.post("/api/ml/predict-cost", json=cost_payload)
    assert res.status_code == 200, f"Predict cost failed: {res.text}"
    cost_data = res.json()
    assert cost_data["probability"] > 0
    assert len(cost_data["drivers"]) > 0
    print(f"3. [PASS] Scikit-Learn Cost Overrun Prediction: {cost_data['expected_overrun_percent']}% (Cost Risk: {cost_data['probability']}%)")

    # 4. Predict Delay Overrun (Random Forest + Survival Pipeline)
    delay_payload = {
        "project_code": "PRJ-TEST-001",
        "physical_progress": 35.0,
        "planned_physical_progress": 70.0,
        "land_acquired_percent": 60.0,
        "forest_clearance": "Pending Stage-1",
        "original_completion_date": "2026-12-31"
    }
    res = client.post("/api/ml/predict-delay", json=delay_payload)
    assert res.status_code == 200, f"Predict delay failed: {res.text}"
    delay_data = res.json()
    print(f"4. [PASS] Schedule Delay Prediction: +{delay_data['expected_delay_months']} months, Projected Date: {delay_data['expected_completion_date']}")

    # 5. Combined Predict All
    res = client.post("/api/ml/predict-all", json={**cost_payload, **delay_payload})
    assert res.status_code == 200, f"Predict all failed: {res.text}"
    print(f"5. [PASS] Combined Multi-target Inference: Overall Risk Score {res.json()['overall_risk_score']}/100")

    # 6. What-If Scenario Simulation (NumPy Vectorized Simulation)
    scenario_payload = {
        "project": {
            "original_cost": 2500,
            "revised_cost": 2850,
            "cost_overrun_probability": 70,
            "delay_probability": 65,
            "overall_risk_score": 72,
            "delay_months": 16,
            "original_completion_date": "2026-12-31"
        },
        "scenario": {
            "monthly_expenditure_delta_percent": 10,
            "physical_progress_pace_delta_percent": 30,
            "resource_availability_percent": 120,
            "fast_track_clearance": True,
            "contractor_reallocation": True,
            "completion_extension_months": 3
        }
    }
    res = client.post("/api/ml/scenario-simulation", json=scenario_payload)
    assert res.status_code == 200, f"Scenario simulation failed: {res.text}"
    sim_data = res.json()
    print(f"6. [PASS] What-If Scenario Simulation: {sim_data['risk_reduction_summary']}")

    # 7. Sector Cohort Benchmarking (Pandas)
    bench_payload = {
        "project": {
            "id": "PRJ-001",
            "name": "Project Alpha",
            "sector": "Railways",
            "cost_overrun_percent": 18.5,
            "delay_months": 12,
            "overall_risk_score": 64,
            "physical_progress": 45
        },
        "cohort": [
            {"id": "P2", "sector": "Railways", "cost_overrun_percent": 24.0, "delay_months": 18, "overall_risk_score": 75, "physical_progress": 40},
            {"id": "P3", "sector": "Railways", "cost_overrun_percent": 12.0, "delay_months": 6, "overall_risk_score": 45, "physical_progress": 70}
        ]
    }
    res = client.post("/api/ml/benchmark", json=bench_payload)
    assert res.status_code == 200, f"Benchmark failed: {res.text}"
    print(f"7. [PASS] Pandas Cohort Benchmarking: {len(res.json())} comparative metrics evaluated")

    # 8. Model Evaluation Metrics
    res = client.get("/api/ml/metrics")
    assert res.status_code == 200
    metrics_data = res.json()
    print(f"8. [PASS] Model Comparison Matrix: {len(metrics_data['baselines'])} models (Champion: LightGBM / XGBoost)")

    # 9. Storage Status (MinIO / Local fallback)
    res = client.get("/api/storage/status")
    assert res.status_code == 200
    print(f"9. [PASS] Object Storage Service Status: {res.json()['status']}")

    # 10. RAG Intelligence Assistant
    res = client.post("/api/ai/assistant", json={"query": "Why is the high speed rail project delayed?"})
    assert res.status_code == 200
    rag_data = res.json()
    print(f"10. [PASS] RAG Assistant Response synthesized via: {rag_data['model_used']}")

    print("========================================")
    print("ALL 10 VERIFICATION TESTS PASSED SUCCESSFULLY!")
    print("========================================")

if __name__ == "__main__":
    run_tests()
