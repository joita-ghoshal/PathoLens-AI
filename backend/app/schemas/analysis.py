from typing import Optional, List
from pydantic import BaseModel


class SymptomInput(BaseModel):
    name: str
    severity: str = "moderate"


class DemographicsInput(BaseModel):
    age: int = 30
    gender: str = "unspecified"


class VitalSignsInput(BaseModel):
    temperature: Optional[float] = None
    heart_rate: Optional[int] = None
    wbc: Optional[int] = None
    crp: Optional[float] = None


class AnalysisRequest(BaseModel):
    symptoms: List[SymptomInput]
    demographics: DemographicsInput = DemographicsInput()
    medical_history: List[str] = []
    travel_history: str = ""
    food_history: str = ""
    vital_signs: VitalSignsInput = VitalSignsInput()


class CandidateResult(BaseModel):
    rank: int
    species_id: int
    scientific_name: str
    common_name: str
    confidence_score: float
    risk_level: str
    matching_symptoms: List[str]
    matching_lab_findings: List[str]
    supporting_evidence: str
    reasoning: str


class RecommendedTest(BaseModel):
    test: str
    type: str
    specimen: str
    priority: str
    rationale: str
    turnaround: str


class RiskAssessment(BaseModel):
    overall_risk: str
    severity_score: float
    urgency: str
    differential_diagnosis: List[str]


class AnalysisResults(BaseModel):
    candidates: List[CandidateResult]
    recommended_tests: List[RecommendedTest]
    risk_assessment: RiskAssessment
    medical_disclaimer: str
    processing_time_ms: int
