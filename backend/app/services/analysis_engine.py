"""
PathoLens AI - Bacterial Analysis Engine (Python)
Multi-factor weighted scoring with Platt calibration using NumPy/SciPy.
"""
import time
from typing import Any

import numpy as np
from scipy.special import expit

from sqlalchemy.orm import Session

from app.models.species import BacterialSpecies, Disease, SpeciesDisease, LabTest

WEIGHTS = {
    "symptom_match": 0.40,
    "lab_finding_match": 0.25,
    "demographic_compatibility": 0.10,
    "geographic_prevalence": 0.10,
    "exposure_compatibility": 0.10,
    "seasonal_pattern": 0.05,
}

SYMPTOM_DISEASE_MAP: dict[str, list[str]] = {
    "fever": ["Pneumonia", "Meningitis", "Sepsis", "Tuberculosis", "Salmonellosis", "Legionnaires Disease"],
    "chills": ["Pneumonia", "Sepsis", "Meningitis", "Tuberculosis"],
    "cough": ["Pneumonia", "Tuberculosis", "Whooping Cough", "Legionnaires Disease"],
    "sore_throat": ["Strep Throat", "Diphtheria", "Whooping Cough"],
    "shortness_of_breath": ["Pneumonia", "Sepsis", "Legionnaires Disease"],
    "headache": ["Meningitis", "Tuberculosis", "Sepsis"],
    "nausea": ["Food Poisoning", "Salmonellosis", "Gastroenteritis", "Cholera"],
    "vomiting": ["Food Poisoning", "Salmonellosis", "Gastroenteritis", "Cholera"],
    "diarrhea": ["Gastroenteritis", "Salmonellosis", "Cholera", "Food Poisoning"],
    "abdominal_pain": ["Gastroenteritis", "Salmonellosis", "Food Poisoning"],
    "skin_rash": ["Cellulitis", "Strep Throat"],
    "wound_infection": ["Cellulitis", "Sepsis"],
    "confusion": ["Meningitis", "Sepsis", "Tetanus", "Botulism"],
    "neck_stiffness": ["Meningitis"],
    "urinary_pain": ["Urinary Tract Infection"],
    "frequent_urination": ["Urinary Tract Infection"],
    "bloody_stool": ["Gastroenteritis", "Salmonellosis"],
    "high_fever": ["Meningitis", "Sepsis", "Tuberculosis"],
    "abdominal_cramps": ["Gastroenteritis", "Cholera", "Food Poisoning"],
    "bloody_diarrhea": ["Gastroenteritis", "Salmonellosis", "Cholera"],
    "chest_pain": ["Pneumonia", "Legionnaires Disease"],
    "rapid_heart_rate": ["Sepsis", "Cholera"],
    "low_blood_pressure": ["Sepsis", "Cholera"],
    "seizures": ["Meningitis", "Tetanus", "Botulism"],
    "jaundice": ["Leptospirosis"],
    "difficulty_swallowing": ["Tetanus", "Botulism", "Diphtheria"],
    "swollen_lymph_nodes": ["Tuberculosis", "Strep Throat"],
    "muscle_pain": ["Leptospirosis", "Tetanus"],
    "joint_pain": ["Lyme Disease", "Leptospirosis"],
    "fatigue": ["Tuberculosis", "Leptospirosis", "Lyme Disease"],
}

ASIA_SPECIES = ["Vibrio cholerae", "Salmonella enterica", "Shigella dysenteriae"]
AFRICA_SPECIES = ["Yersinia pestis", "Vibrio cholerae"]
TROPICS_SPECIES = ["Mycobacterium tuberculosis"]
RAW_FOOD_SPECIES = ["Salmonella enterica", "Vibrio cholerae", "Listeria monocytogenes", "Campylobacter jejuni"]
STREET_FOOD_SPECIES = ["Salmonella enterica", "Shigella dysenteriae"]

RISK_BOOST = {"critical": 0.15, "high": 0.10, "medium": 0.05, "low": 0.0}

# Platt scaling parameters
PLATT_A = 4.0
PLATT_B = -1.2


def analyze_patient(db: Session, input_data: dict[str, Any]) -> dict[str, Any]:
    start = time.time()

    symptoms = input_data.get("symptoms", [])
    age = input_data.get("age", 30)
    gender = input_data.get("gender", "unspecified")
    travel_history = (input_data.get("travel_history") or "").lower()
    food_history = (input_data.get("food_history") or "").lower()
    vital_signs = input_data.get("vital_signs", {})

    species_list = (
        db.query(BacterialSpecies)
        .filter(BacterialSpecies.is_pathogenic == True)
        .all()
    )

    disease_links = db.query(SpeciesDisease).all()
    species_diseases: dict[int, list[str]] = {}
    for link in disease_links:
        disease = db.query(Disease).filter(Disease.id == link.disease_id).first()
        if disease:
            species_diseases.setdefault(link.species_id, []).append(disease.name)

    scores = []
    for sp in species_list:
        score = 0.0
        matched_symptoms: list[str] = []
        matched_labs: list[str] = []
        reasons: list[str] = []

        diseases = species_diseases.get(sp.id, [])
        symptom_hits = 0
        for sym in symptoms:
            sym_name = sym.get("name", sym) if isinstance(sym, dict) else sym
            associated = SYMPTOM_DISEASE_MAP.get(sym_name, [])
            overlap = [d for d in associated if d in diseases]
            if overlap:
                symptom_hits += 1
                matched_symptoms.append(sym_name)

        symptom_score = symptom_hits / len(symptoms) if symptoms else 0
        score += symptom_score * WEIGHTS["symptom_match"]
        if symptom_hits > 0:
            reasons.append(f"{symptom_hits}/{len(symptoms)} symptoms match associated diseases")

        lab_score = 0.0
        if vital_signs.get("temperature") and vital_signs["temperature"] > 38:
            lab_score += 0.3
            matched_labs.append("fever")
        if vital_signs.get("heart_rate") and vital_signs["heart_rate"] > 100:
            lab_score += 0.2
            matched_labs.append("tachycardia")
        if vital_signs.get("wbc") and vital_signs["wbc"] > 11000:
            lab_score += 0.3
            matched_labs.append("leukocytosis")
        if vital_signs.get("crp") and vital_signs["crp"] > 10:
            lab_score += 0.2
            matched_labs.append("elevated CRP")
        lab_score = min(lab_score, 1.0)
        score += lab_score * WEIGHTS["lab_finding_match"]

        demo_score = 0.5
        if sp.is_opportunistic and age > 65:
            demo_score = 0.9
            reasons.append("Age increases opportunistic risk")
        elif sp.is_opportunistic and age < 5:
            demo_score = 0.8
            reasons.append("Young age increases susceptibility")
        else:
            demo_score = 0.6
        score += demo_score * WEIGHTS["demographic_compatibility"]

        geo_score = 0.5
        if "asia" in travel_history and sp.scientific_name in ASIA_SPECIES:
            geo_score = 0.9
            reasons.append("Travel to endemic region")
        elif "africa" in travel_history and sp.scientific_name in AFRICA_SPECIES:
            geo_score = 0.9
            reasons.append("Travel to endemic region")
        elif "tropics" in travel_history and sp.scientific_name in TROPICS_SPECIES:
            geo_score = 0.8
            reasons.append("Tropical exposure risk")
        score += geo_score * WEIGHTS["geographic_prevalence"]

        exp_score = 0.5
        if "raw" in food_history and sp.scientific_name in RAW_FOOD_SPECIES:
            exp_score = 0.9
            reasons.append("Raw food exposure risk")
        elif "street" in food_history and sp.scientific_name in STREET_FOOD_SPECIES:
            exp_score = 0.8
            reasons.append("Street food exposure risk")
        score += exp_score * WEIGHTS["exposure_compatibility"]

        score += 0.5 * WEIGHTS["seasonal_pattern"]

        score += RISK_BOOST.get(sp.risk_level, 0)

        calibrated = float(expit(PLATT_A * score + PLATT_B))
        confidence = round(calibrated * 100 * 10) / 10

        risk_level = "low"
        if confidence >= 70 or sp.risk_level == "critical":
            risk_level = "critical"
        elif confidence >= 50 or sp.risk_level == "high":
            risk_level = "high"
        elif confidence >= 30 or sp.risk_level == "medium":
            risk_level = "medium"

        evidence_diseases = [
            d for d in diseases
            if any(s in matched_symptoms for s, associated in SYMPTOM_DISEASE_MAP.items() if d in associated)
        ]

        reasoning = "Score breakdown: "
        if matched_symptoms:
            reasoning += f"Symptoms match ({', '.join(matched_symptoms)}). "
        if matched_labs:
            reasoning += f"Lab findings: {', '.join(matched_labs)}. "
        if reasons:
            reasoning += ". ".join(reasons)

        scores.append({
            "species_id": sp.id,
            "scientific_name": sp.scientific_name,
            "common_name": sp.common_name,
            "confidence_score": confidence,
            "risk_level": risk_level,
            "matching_symptoms": matched_symptoms,
            "matching_lab_findings": matched_labs,
            "supporting_evidence": ", ".join(evidence_diseases),
            "reasoning": reasoning,
        })

    scores.sort(key=lambda x: x["confidence_score"], reverse=True)
    top_candidates = [s for s in scores if s["confidence_score"] >= 15][:10]
    for i, c in enumerate(top_candidates):
        c["rank"] = i + 1

    top_names = [c["scientific_name"] for c in top_candidates[:5]]
    tests = []
    if top_names:
        lab_results = (
            db.query(LabTest)
            .join(BacterialSpecies, BacterialSpecies.id == LabTest.species_id)
            .filter(BacterialSpecies.scientific_name.in_(top_names))
            .order_by(LabTest.sensitivity.desc())
            .limit(8)
            .all()
        )
        for t in lab_results:
            priority = "immediate" if t.sensitivity > 0.9 else "urgent" if t.sensitivity > 0.8 else "routine"
            tests.append({
                "test": t.test_name,
                "type": t.test_type,
                "specimen": t.specimen_type,
                "priority": priority,
                "rationale": f"Recommended for {t.species.scientific_name} detection (sensitivity: {t.sensitivity*100:.0f}%)",
                "turnaround": t.turnaround_time,
            })

    top_risk = top_candidates[0]["risk_level"] if top_candidates else "low"
    severity = min(top_candidates[0]["confidence_score"] / 10, 10) if top_candidates else 0
    processing_ms = int((time.time() - start) * 1000)

    return {
        "candidates": top_candidates,
        "recommended_tests": tests,
        "risk_assessment": {
            "overall_risk": top_risk,
            "severity_score": round(severity * 10) / 10,
            "urgency": (
                "emergency" if severity >= 8
                else "seek_medical_attention" if severity >= 6
                else "consult_healthcare_provider" if severity >= 4
                else "monitor_symptoms"
            ),
            "differential_diagnosis": [f"{c['scientific_name']} infection" for c in top_candidates[:5]],
        },
        "medical_disclaimer": "IMPORTANT: PathoLens AI provides research and decision-support information only. This analysis is NOT a diagnosis. All findings must be confirmed by qualified healthcare professionals through appropriate laboratory testing. Always consult a licensed medical professional for health-related decisions.",
        "processing_time_ms": processing_ms,
    }
