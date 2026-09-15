from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr

# Auth Schemas
class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: Optional[str] = "Analyst"
    organization: Optional[str] = "MoSPI"

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class LoginRequest(BaseModel):
    email: str
    password: str

# Project & Prediction Schemas
class ProjectPredictInput(BaseModel):
    project_code: Optional[str] = "PRJ-GEN-001"
    name: Optional[str] = "Infrastructure Project"
    sector: Optional[str] = "Road Transport & Highways"
    ministry: Optional[str] = "Ministry of Road Transport and Highways"
    state: Optional[str] = "National"
    original_cost: float = 1000.0
    revised_cost: Optional[float] = 1000.0
    physical_progress: float = 50.0
    financial_progress: float = 50.0
    planned_physical_progress: Optional[float] = 80.0
    delay_months: Optional[int] = 0
    land_acquired_percent: Optional[float] = 90.0
    forest_clearance: Optional[str] = "Approved"
    original_completion_date: Optional[str] = "2026-12-31"

class CostPredictionOutput(BaseModel):
    probability: float
    expected_overrun_percent: float
    expected_cost_overrun_amount: float
    expected_revised_cost: float
    confidence_interval_low: float
    confidence_interval_high: float
    model_type: str
    drivers: List[str]

class DelayPredictionOutput(BaseModel):
    delay_probability: float
    expected_delay_months: int
    expected_completion_date: str
    model_type: str
    drivers: List[str]

# Scenario Simulation Schemas
class ScenarioInputSchema(BaseModel):
    monthly_expenditure_delta_percent: float = 0.0
    physical_progress_pace_delta_percent: float = 0.0
    resource_availability_percent: float = 100.0
    fast_track_clearance: bool = False
    contractor_reallocation: bool = False
    completion_extension_months: int = 0

class ScenarioOutputSchema(BaseModel):
    simulated_cost_risk: float
    simulated_delay_risk: float
    simulated_overall_risk: float
    simulated_revised_cost: float
    simulated_completion_date: str
    simulated_delay_months: int
    cost_delta_amount: float
    time_delta_months: int
    risk_reduction_summary: str

# Benchmarking Schemas
class BenchmarkComparisonSchema(BaseModel):
    metric: str
    project_value: str
    benchmark_average: str
    unit: str
    status: str
    difference_text: str

class BenchmarkRequestSchema(BaseModel):
    project: Dict[str, Any]
    cohort: Optional[List[Dict[str, Any]]] = None

# RAG & Assistant Schemas
class QueryRequest(BaseModel):
    query: str
    project_id: Optional[str] = None
    chat_history: Optional[List[Dict[str, str]]] = None

class QueryResponse(BaseModel):
    reply: str
    retrieved_contexts: Optional[List[str]] = []
    source: str
    model_used: str
