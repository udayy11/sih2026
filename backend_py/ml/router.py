from fastapi import APIRouter
from typing import Dict, Any, List
from backend_py.database.schemas import (
    ProjectPredictInput,
    CostPredictionOutput,
    DelayPredictionOutput,
    ScenarioInputSchema,
    ScenarioOutputSchema,
    BenchmarkComparisonSchema,
    BenchmarkRequestSchema
)
from backend_py.ml.models import ml_engine

router = APIRouter(prefix="/ml", tags=["Machine Learning & Analytics"])

@router.post("/predict-cost", response_model=CostPredictionOutput)
def predict_cost(project: ProjectPredictInput):
    """
    Predicts project cost overrun probability, percentage, amount, and SHAP drivers using Gradient Boosting.
    """
    result = ml_engine.predict_cost_overrun(project.model_dump())
    return result

@router.post("/predict-delay", response_model=DelayPredictionOutput)
def predict_delay(project: ProjectPredictInput):
    """
    Predicts schedule delay probability, expected delay months, and revised completion date.
    """
    result = ml_engine.predict_delay_overrun(project.model_dump())
    return result

@router.post("/predict-all")
def predict_all(project: ProjectPredictInput):
    """
    Combined endpoint returning both cost and schedule delay predictions along with risk drivers.
    """
    p_dict = project.model_dump()
    cost_res = ml_engine.predict_cost_overrun(p_dict)
    delay_res = ml_engine.predict_delay_overrun(p_dict)
    return {
        "project_code": project.project_code,
        "cost": cost_res,
        "delay": delay_res,
        "overall_risk_score": int(min(100, max(10, (cost_res["probability"] * 0.5) + (delay_res["delay_probability"] * 0.5))))
    }

@router.post("/scenario-simulation", response_model=ScenarioOutputSchema)
def simulate_scenario(payload: Dict[str, Any]):
    """
    Simulates What-If policy interventions: resource reallocation, fast-track clearances, time extension.
    """
    project = payload.get("project", {})
    scenario = payload.get("scenario", {})
    result = ml_engine.run_scenario_simulation(project, scenario)
    return result

@router.post("/benchmark", response_model=List[BenchmarkComparisonSchema])
def benchmark_project(payload: BenchmarkRequestSchema):
    """
    Benchmarks a project against its historical sector cohort using Pandas analytics.
    """
    result = ml_engine.benchmark_project(payload.project, payload.cohort or [])
    return result

@router.get("/metrics")
def get_model_metrics():
    """
    Returns conventional baselines comparison matrix, feature ablation lift, and PDP curves.
    """
    return ml_engine.get_evaluation_metrics()
