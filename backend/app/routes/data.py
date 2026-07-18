from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.species import BacterialSpecies, Disease, SpeciesDisease
from app.models.analysis import Analysis, Symptom

router = APIRouter(prefix="/api", tags=["data"])


@router.get("/diseases")
def list_diseases(
    search: str = "",
    category: str = "",
    severity: str = "",
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    q = db.query(Disease)
    if search:
        q = q.filter(Disease.name.ilike(f"%{search}%") | Disease.description.ilike(f"%{search}%"))
    if category:
        q = q.filter(Disease.category == category)
    if severity:
        q = q.filter(Disease.severity == severity)
    return q.order_by(Disease.name).all()


@router.get("/symptoms")
def list_symptoms(
    category: str = "",
    search: str = "",
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    q = db.query(Symptom)
    if category:
        q = q.filter(Symptom.category == category)
    if search:
        q = q.filter(Symptom.name.ilike(f"%{search}%"))
    return q.order_by(Symptom.category, Symptom.name).all()


@router.get("/dashboard/overview")
def dashboard_overview(db: Session = Depends(get_db), _=Depends(get_current_user)):
    total_species = db.query(func.count(BacterialSpecies.id)).scalar()
    pathogenic = db.query(func.count(BacterialSpecies.id)).filter(BacterialSpecies.is_pathogenic == True).scalar()
    beneficial = db.query(func.count(BacterialSpecies.id)).filter(BacterialSpecies.is_beneficial == True).scalar()
    total_analyses = db.query(func.count(Analysis.id)).scalar()

    gram_dist = (
        db.query(BacterialSpecies.gram_stain, func.count(BacterialSpecies.id).label("count"))
        .group_by(BacterialSpecies.gram_stain).all()
    )
    risk_dist = (
        db.query(BacterialSpecies.risk_level, func.count(BacterialSpecies.id).label("count"))
        .group_by(BacterialSpecies.risk_level).all()
    )
    recent = (
        db.query(Analysis)
        .order_by(Analysis.created_at.desc())
        .limit(10)
        .all()
    )

    top_diseases_raw = (
        db.query(Disease.name, Disease.severity, func.count(SpeciesDisease.species_id).label("species_count"))
        .join(SpeciesDisease, Disease.id == SpeciesDisease.disease_id, isouter=True)
        .group_by(Disease.id, Disease.name, Disease.severity)
        .order_by(func.count(SpeciesDisease.species_id).desc())
        .limit(10)
        .all()
    )

    return {
        "total_species": total_species,
        "pathogenic_count": pathogenic,
        "beneficial_count": beneficial,
        "total_analyses": total_analyses,
        "gram_distribution": [{"gram_stain": g[0] or "unknown", "count": g[1]} for g in gram_dist],
        "risk_distribution": [{"risk_level": r[0], "count": r[1]} for r in risk_dist],
        "top_diseases": [{"name": d[0], "severity": d[1], "species_count": d[2]} for d in top_diseases_raw],
        "recent_analyses": [
            {
                "id": a.id,
                "status": a.status,
                "top_candidate": a.top_candidate,
                "confidence_score": a.confidence_score,
                "risk_level": a.risk_level,
                "created_at": a.created_at.isoformat() if a.created_at else None,
            }
            for a in recent
        ],
    }


@router.get("/admin/users")
def admin_list_users(db: Session = Depends(get_db), _=Depends(get_current_user)):
    from app.models.user import User
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "username": u.username,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "institution": u.institution,
            "department": u.department,
            "role": u.role,
            "is_active": u.is_active,
            "created_at": u.created_at.isoformat() if u.created_at else None,
        }
        for u in users
    ]


@router.put("/admin/users/{user_id}/role")
def admin_update_role(
    user_id: str,
    body: dict,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    from app.models.user import User
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found")
    user.role = body.get("role", user.role)
    db.commit()
    return {"ok": True, "role": user.role}
