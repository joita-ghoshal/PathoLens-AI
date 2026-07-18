from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.species import BacterialSpecies

router = APIRouter(prefix="/api/species", tags=["species"])


@router.get("")
def list_species(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: str = "",
    gram_stain: str = "",
    risk_level: str = "",
    is_pathogenic: bool | None = None,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    q = db.query(BacterialSpecies)
    if search:
        q = q.filter(
            BacterialSpecies.scientific_name.ilike(f"%{search}%")
            | BacterialSpecies.common_name.ilike(f"%{search}%")
        )
    if gram_stain:
        q = q.filter(BacterialSpecies.gram_stain == gram_stain)
    if risk_level:
        q = q.filter(BacterialSpecies.risk_level == risk_level)
    if is_pathogenic is not None:
        q = q.filter(BacterialSpecies.is_pathogenic == is_pathogenic)

    total = q.count()
    total_pages = (total + per_page - 1) // per_page
    items = q.order_by(BacterialSpecies.scientific_name).offset((page - 1) * per_page).limit(per_page).all()

    return {
        "data": [
            {
                "id": s.id,
                "scientific_name": s.scientific_name,
                "common_name": s.common_name,
                "gram_stain": s.gram_stain,
                "shape": s.shape,
                "risk_level": s.risk_level,
                "is_pathogenic": s.is_pathogenic,
                "is_beneficial": s.is_beneficial,
                "is_opportunistic": s.is_opportunistic,
            }
            for s in items
        ],
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": total,
            "total_pages": total_pages,
        },
    }


@router.get("/{species_id}")
def get_species(species_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    sp = (
        db.query(BacterialSpecies)
        .options(
            joinedload(BacterialSpecies.virulence_factors),
            joinedload(BacterialSpecies.antibiotic_resistance),
            joinedload(BacterialSpecies.protein_profiles),
            joinedload(BacterialSpecies.toxins),
            joinedload(BacterialSpecies.enzymes),
            joinedload(BacterialSpecies.lab_tests),
            joinedload(BacterialSpecies.beneficial_properties),
            joinedload(BacterialSpecies.immune_responses),
            joinedload(BacterialSpecies.diseases),
        )
        .filter(BacterialSpecies.id == species_id)
        .first()
    )
    if not sp:
        raise HTTPException(status_code=404, detail="Species not found")

    return {
        "id": sp.id,
        "scientific_name": sp.scientific_name,
        "common_name": sp.common_name,
        "kingdom": sp.kingdom,
        "phylum": sp.phylum,
        "class_name": sp.class_name,
        "order_name": sp.order_name,
        "family": sp.family,
        "genus": sp.genus,
        "species": sp.species,
        "gram_stain": sp.gram_stain,
        "shape": sp.shape,
        "size_micrometers": sp.size_micrometers,
        "arrangement": sp.arrangement,
        "oxygen_requirement": sp.oxygen_requirement,
        "motility": sp.motility,
        "spore_formation": sp.spore_formation,
        "growth_temperature_optimal": sp.growth_temperature_optimal,
        "habitat": sp.habitat,
        "culture_media": sp.culture_media,
        "biosafety_level": sp.biosafety_level,
        "risk_level": sp.risk_level,
        "is_beneficial": sp.is_beneficial,
        "is_pathogenic": sp.is_pathogenic,
        "is_opportunistic": sp.is_opportunistic,
        "description": sp.description,
        "virulence_factors": [
            {"name": vf.name, "type": vf.type, "mechanism": vf.mechanism, "target_tissue": vf.target_tissue, "gene_name": vf.gene_name}
            for vf in sp.virulence_factors
        ],
        "antibiotic_resistance": [
            {"antibiotic_name": ar.antibiotic_name, "resistance_mechanism": ar.resistance_mechanism, "resistance_gene": ar.resistance_gene, "susceptibility": ar.susceptibility}
            for ar in sp.antibiotic_resistance
        ],
        "protein_profiles": [
            {"protein_name": pp.protein_name, "uniprot_id": pp.uniprot_id, "gene_name": pp.gene_name, "molecular_weight_kda": pp.molecular_weight_kda, "function_description": pp.function_description, "clinical_relevance": pp.clinical_relevance}
            for pp in sp.protein_profiles
        ],
        "toxins": [
            {"toxin_name": t.toxin_name, "toxin_type": t.toxin_type, "mechanism_of_action": t.mechanism_of_action, "target_cells": t.target_cells, "heat_stability": t.heat_stability, "clinical_effect": t.clinical_effect}
            for t in sp.toxins
        ],
        "enzymes": [
            {"enzyme_name": e.enzyme_name, "ec_number": e.ec_number, "function_description": e.function_description, "substrate": e.substrate, "industrial_use": e.industrial_use}
            for e in sp.enzymes
        ],
        "lab_tests": [
            {"test_name": lt.test_name, "test_type": lt.test_type, "specimen_type": lt.specimen_type, "methodology": lt.methodology, "expected_result": lt.expected_result, "sensitivity": lt.sensitivity, "specificity": lt.specificity, "turnaround_time": lt.turnaround_time, "species": {"id": sp.id, "scientific_name": sp.scientific_name}}
            for lt in sp.lab_tests
        ],
        "beneficial_properties": [
            {"property_type": bp.property_type, "description": bp.description, "health_benefit": bp.health_benefit, "industrial_use": bp.industrial_use, "food_application": bp.food_application}
            for bp in sp.beneficial_properties
        ],
        "immune_responses": [
            {"immune_pathway": ir.immune_pathway, "response_type": ir.response_type, "cytokine_profile": ir.cytokine_profile, "immune_evasion_mechanism": ir.immune_evasion_mechanism}
            for ir in sp.immune_responses
        ],
        "diseases": [
            {"id": d.id, "name": d.name, "icd10_code": d.icd10_code, "category": d.category, "severity": d.severity, "description": d.description, "association_type": getattr(d, "association_type", "primary")}
            for d in sp.diseases
        ],
    }
