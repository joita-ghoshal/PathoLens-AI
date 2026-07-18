import json
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.analysis import Analysis
from app.schemas.analysis import AnalysisRequest
from app.services.analysis_engine import analyze_patient

router = APIRouter(prefix="/api/analysis", tags=["analysis"])


@router.post("/analyze")
def run_analysis(
    data: AnalysisRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not data.symptoms:
        raise HTTPException(status_code=400, detail={"code": "VALIDATION", "message": "At least one symptom is required"})

    input_data = {
        "symptoms": [s.model_dump() for s in data.symptoms],
        "age": data.demographics.age,
        "gender": data.demographics.gender,
        "travel_history": data.travel_history,
        "food_history": data.food_history,
        "medical_history": data.medical_history,
        "vital_signs": data.vital_signs.model_dump(),
    }

    results = analyze_patient(db, input_data)

    analysis_id = str(uuid.uuid4())
    candidates = results.get("candidates", [])
    top = candidates[0] if candidates else {}

    analysis = Analysis(
        id=analysis_id,
        user_id=current_user.id,
        status="completed",
        symptoms_json=json.dumps(input_data["symptoms"]),
        age=input_data["age"],
        gender=input_data["gender"],
        medical_history_json=json.dumps(data.medical_history),
        travel_history=data.travel_history,
        top_candidate=top.get("scientific_name", ""),
        confidence_score=top.get("confidence_score", 0),
        risk_level=results["risk_assessment"]["overall_risk"],
        results_json=json.dumps(results),
        processing_time_ms=results["processing_time_ms"],
    )
    db.add(analysis)
    db.commit()

    return {"analysis_id": analysis_id, "status": "completed", "results": results}


@router.get("/history")
def analysis_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    analyses = (
        db.query(Analysis)
        .filter(Analysis.user_id == current_user.id)
        .order_by(Analysis.created_at.desc())
        .limit(50)
        .all()
    )
    return [
        {
            "id": a.id,
            "status": a.status,
            "top_candidate": a.top_candidate,
            "confidence_score": a.confidence_score,
            "risk_level": a.risk_level,
            "created_at": a.created_at.isoformat() if a.created_at else None,
        }
        for a in analyses
    ]


@router.get("/{analysis_id}")
def get_analysis(
    analysis_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    a = db.query(Analysis).filter(Analysis.id == analysis_id, Analysis.user_id == current_user.id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return {
        "id": a.id,
        "status": a.status,
        "symptoms": json.loads(a.symptoms_json or "[]"),
        "age": a.age,
        "gender": a.gender,
        "medical_history": json.loads(a.medical_history_json or "[]"),
        "travel_history": a.travel_history,
        "top_candidate": a.top_candidate,
        "confidence_score": a.confidence_score,
        "risk_level": a.risk_level,
        "results": json.loads(a.results_json or "{}"),
        "processing_time_ms": a.processing_time_ms,
        "created_at": a.created_at.isoformat() if a.created_at else None,
    }


@router.delete("/{analysis_id}")
def delete_analysis(
    analysis_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    a = db.query(Analysis).filter(Analysis.id == analysis_id, Analysis.user_id == current_user.id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Analysis not found")
    db.delete(a)
    db.commit()
    return {"ok": True}
