from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.species import BacterialSpecies, Disease, SpeciesDisease
from app.models.analysis import Analysis, Symptom
from app.models.user import User
from app.core.security import get_password_hash

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
def admin_list_users(
    current_user: User = Depends(require_role("super_admin", "admin")),
    db: Session = Depends(get_db),
):
    users = db.query(User).order_by(User.created_at.desc()).all()
    is_super = current_user.role == "super_admin"
    result = []
    for u in users:
        entry = {
            "id": u.id,
            "username": u.username,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "institution": u.institution,
            "department": u.department,
            "role": u.role,
            "is_active": u.is_active,
            "created_at": u.created_at.isoformat() if u.created_at else None,
        }
        if is_super:
            entry["email"] = u.email
        result.append(entry)
    return result


@router.get("/admin/users/{user_id}")
def admin_get_user(
    user_id: str,
    current_user: User = Depends(require_role("super_admin")),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "institution": user.institution,
        "department": user.department,
        "role": user.role,
        "is_active": user.is_active,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }


@router.put("/admin/users/{user_id}/role")
def admin_update_role(
    user_id: str,
    body: dict,
    _=Depends(require_role("super_admin")),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    new_role = body.get("role", user.role)
    if user.role == "super_admin" and new_role != "super_admin":
        super_admin_count = db.query(User).filter(User.role == "super_admin").count()
        if super_admin_count <= 1:
            raise HTTPException(status_code=400, detail="Cannot demote the only Super Admin")
    user.role = new_role
    db.commit()
    return {"ok": True, "role": user.role}


@router.put("/admin/users/{user_id}")
def admin_update_user(
    user_id: str,
    body: dict,
    _=Depends(require_role("super_admin")),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if "first_name" in body:
        user.first_name = body["first_name"]
    if "last_name" in body:
        user.last_name = body["last_name"]
    if "institution" in body:
        user.institution = body["institution"]
    if "department" in body:
        user.department = body["department"]
    db.commit()
    return {"ok": True}


@router.delete("/admin/users/{user_id}")
def admin_delete_user(
    user_id: str,
    current_user: User = Depends(require_role("super_admin")),
    db: Session = Depends(get_db),
):
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role == "super_admin":
        raise HTTPException(status_code=400, detail="Cannot delete a Super Admin")
    db.delete(user)
    db.commit()
    return {"ok": True}


@router.put("/admin/users/{user_id}/activate")
def admin_toggle_activate(
    user_id: str,
    body: dict,
    current_user: User = Depends(require_role("super_admin")),
    db: Session = Depends(get_db),
):
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="Cannot deactivate yourself")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = body.get("is_active", user.is_active)
    db.commit()
    return {"ok": True, "is_active": user.is_active}


@router.put("/admin/users/{user_id}/password")
def admin_change_password(
    user_id: str,
    body: dict,
    _=Depends(require_role("super_admin")),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    new_password = body.get("password", "")
    if len(new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    user.password_hash = get_password_hash(new_password)
    db.commit()
    return {"ok": True}


@router.post("/admin/users")
def admin_create_user(
    body: dict,
    _=Depends(require_role("super_admin")),
    db: Session = Depends(get_db),
):
    import uuid
    email = body.get("email", "")
    username = body.get("username", "")
    password = body.get("password", "")
    role = body.get("role", "researcher")
    allowed_roles = {"student", "researcher", "clinician", "admin"}
    if role not in allowed_roles:
        raise HTTPException(status_code=400, detail="Invalid role")
    if not email or not username or not password:
        raise HTTPException(status_code=400, detail="Email, username, and password are required")
    if len(password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(User).filter(User.username == username).first():
        raise HTTPException(status_code=400, detail="Username already taken")
    user = User(
        id=str(uuid.uuid4()),
        email=email,
        username=username,
        password_hash=get_password_hash(password),
        role=role,
        first_name=body.get("first_name", ""),
        last_name=body.get("last_name", ""),
        institution=body.get("institution", ""),
        department=body.get("department", ""),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"ok": True, "id": user.id, "role": user.role}
