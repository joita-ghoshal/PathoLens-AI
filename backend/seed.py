"""
PathoLens AI - Database Seed Script
Seeds PostgreSQL with comprehensive bacterial species, diseases, symptoms, and metadata.
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import uuid
from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models import *
from app.models.species import SpeciesDisease


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    existing = db.query(User).first()
    if existing:
        print("Database already seeded. Skipping.")
        db.close()
        return

    print("Seeding database...")

    # Users
    users = [
        User(id=str(uuid.uuid4()), email="admin@patholens.ai", username="admin",
             password_hash=get_password_hash("password123"), first_name="Admin", last_name="User",
             institution="PathoLens Research Lab", department="Administration", role="super_admin"),
        User(id=str(uuid.uuid4()), email="researcher@patholens.ai", username="researcher",
             password_hash=get_password_hash("password123"), first_name="Jane", last_name="Researcher",
             institution="MIT", department="Microbiology", role="researcher"),
        User(id=str(uuid.uuid4()), email="student@patholens.ai", username="student",
             password_hash=get_password_hash("password123"), first_name="John", last_name="Student",
             institution="Harvard Medical", department="Medical Sciences", role="student"),
    ]
    db.add_all(users)
    db.flush()

    # Diseases
    disease_data = [
        ("Pneumonia", "J18.9", "Respiratory", "moderate", "Infection of the lung parenchyma"),
        ("Meningitis", "G03.9", "Neurological", "severe", "Inflammation of the meninges"),
        ("Sepsis", "A41.9", "Systemic", "critical", "Life-threatening organ dysfunction from infection"),
        ("Tuberculosis", "A15.0", "Respiratory", "severe", "Chronic bacterial infection caused by M. tuberculosis"),
        ("Salmonellosis", "A02.0", "Gastrointestinal", "moderate", "Infection caused by Salmonella species"),
        ("Gastroenteritis", "A09", "Gastrointestinal", "moderate", "Inflammation of the stomach and intestines"),
        ("Cholera", "A00.9", "Gastrointestinal", "severe", "Acute diarrheal infection caused by V. cholerae"),
        ("Botulism", "A48.51", "Neurological", "critical", "Rare but serious illness from C. botulinum toxin"),
        ("Strep Throat", "J02.0", "Respiratory", "mild", "Throat infection caused by Group A Streptococcus"),
        ("Cellulitis", "L03.90", "Dermatological", "moderate", "Bacterial skin infection"),
        ("Urinary Tract Infection", "N39.0", "Urogenital", "moderate", "Infection in any part of the urinary system"),
        ("Legionnaires Disease", "J17.8", "Respiratory", "severe", "Severe pneumonia caused by Legionella"),
        ("Food Poisoning", "A05.9", "Gastrointestinal", "moderate", "Illness from consuming contaminated food"),
        ("Gas Gangrene", "A48.0", "Dermatological", "critical", "Clostridial myonecrosis"),
        ("Diphtheria", "A36.9", "Respiratory", "severe", "Bacterial infection affecting nose and throat"),
        ("Lyme Disease", "A69.20", "Systemic", "moderate", "Tick-borne illness caused by Borrelia burgdorferi"),
    ]
    diseases = []
    for name, icd, cat, sev, desc in disease_data:
        d = Disease(name=name, icd10_code=icd, category=cat, severity=sev, description=desc)
        diseases.append(d)
    db.add_all(diseases)
    db.flush()

    disease_map = {d.name: d.id for d in diseases}

    # Symptoms
    symptom_data = [
        ("fever", "Systemic", "Elevated body temperature"),
        ("chills", "Systemic", "Shivering and feeling cold"),
        ("cough", "Respiratory", "Forceful expulsion of air from lungs"),
        ("sore_throat", "Respiratory", "Pain or irritation in the throat"),
        ("shortness_of_breath", "Respiratory", "Difficulty breathing"),
        ("headache", "Neurological", "Pain in the head or upper neck"),
        ("nausea", "Gastrointestinal", "Feeling of sickness with urge to vomit"),
        ("vomiting", "Gastrointestinal", "Forceful expulsion of stomach contents"),
        ("diarrhea", "Gastrointestinal", "Loose, watery stools"),
        ("abdominal_pain", "Gastrointestinal", "Pain in the abdomen area"),
        ("abdominal_cramps", "Gastrointestinal", "Painful contractions in abdomen"),
        ("skin_rash", "Dermatological", "Abnormal changes in skin appearance"),
        ("wound_infection", "Dermatological", "Infection at a wound site"),
        ("confusion", "Neurological", "Lack of clarity in thinking"),
        ("neck_stiffness", "Neurological", "Difficulty moving neck"),
        ("urinary_pain", "Urogenital", "Pain during urination"),
        ("frequent_urination", "Urogenital", "Need to urinate more often than usual"),
        ("bloody_stool", "Gastrointestinal", "Stool containing blood"),
        ("high_fever", "Systemic", "Body temperature above 39C"),
        ("bloody_diarrhea", "Gastrointestinal", "Diarrhea containing blood"),
        ("chest_pain", "Respiratory", "Pain in the chest area"),
        ("rapid_heart_rate", "Cardiovascular", "Heart rate exceeding 100 bpm"),
        ("low_blood_pressure", "Cardiovascular", "Systolic BP below 90 mmHg"),
        ("seizures", "Neurological", "Uncontrolled electrical activity in brain"),
        ("jaundice", "Hepatic", "Yellowing of skin and eyes"),
        ("difficulty_swallowing", "Respiratory", "Trouble passing food through throat"),
        ("swollen_lymph_nodes", "Systemic", "Enlarged lymph nodes"),
        ("muscle_pain", "Musculoskeletal", "Pain in muscles"),
        ("joint_pain", "Musculoskeletal", "Pain in joints"),
        ("fatigue", "Systemic", "Extreme tiredness"),
    ]
    symptoms = []
    for name, cat, desc in symptom_data:
        s = Symptom(name=name, category=cat, description=desc)
        symptoms.append(s)
    db.add_all(symptoms)
    db.flush()

    # Species (30 species)
    species_data = [
        {"scientific_name": "Escherichia coli", "common_name": "E. coli", "gram_stain": "negative", "shape": "rod", "size_micrometers": "2.0", "arrangement": "single", "oxygen_requirement": "facultative anaerobe", "motility": "motile", "spore_formation": False, "habitat": "Large intestine", "culture_media": "MacConkey agar, EMB agar", "biosafety_level": 1, "risk_level": "medium", "is_pathogenic": True, "is_opportunistic": True, "description": "Common gut bacterium, some strains are pathogenic causing UTI and gastroenteritis", "family": "Enterobacteriaceae", "genus": "Escherichia"},
        {"scientific_name": "Staphylococcus aureus", "common_name": "Golden Staph", "gram_stain": "positive", "shape": "coccus", "size_micrometers": "0.8", "arrangement": "grape-like clusters", "oxygen_requirement": "facultative anaerobe", "motility": "non-motile", "spore_formation": False, "habitat": "Human skin and nasal passages", "culture_media": "Mannitol salt agar", "biosafety_level": 2, "risk_level": "high", "is_pathogenic": True, "description": "Major human pathogen causing skin infections, pneumonia, sepsis", "family": "Staphylococcaceae", "genus": "Staphylococcus"},
        {"scientific_name": "Streptococcus pneumoniae", "common_name": "Pneumococcus", "gram_stain": "positive", "shape": "coccus", "size_micrometers": "0.8", "arrangement": "diplococci", "oxygen_requirement": "facultative anaerobe", "motility": "non-motile", "spore_formation": False, "habitat": "Human nasopharynx", "culture_media": "Blood agar", "biosafety_level": 2, "risk_level": "high", "is_pathogenic": True, "description": "Leading cause of pneumonia, meningitis, and otitis media", "family": "Streptococcaceae", "genus": "Streptococcus"},
        {"scientific_name": "Salmonella enterica", "common_name": "Salmonella", "gram_stain": "negative", "shape": "rod", "size_micrometers": "2.0", "arrangement": "single", "oxygen_requirement": "facultative anaerobe", "motility": "motile", "spore_formation": False, "habitat": "Intestinal tract of animals", "culture_media": "XLD agar, SS agar", "biosafety_level": 2, "risk_level": "high", "is_pathogenic": True, "description": "Major cause of food poisoning and gastroenteritis worldwide", "family": "Enterobacteriaceae", "genus": "Salmonella"},
        {"scientific_name": "Mycobacterium tuberculosis", "common_name": "TB bacillus", "gram_stain": "acid-fast", "shape": "rod", "size_micrometers": "3.0", "arrangement": "single", "oxygen_requirement": "aerobe", "motility": "non-motile", "spore_formation": False, "habitat": "Human lungs", "culture_media": "Löwenstein-Jensen medium", "biosafety_level": 3, "risk_level": "critical", "is_pathogenic": True, "description": "Causative agent of tuberculosis, affecting millions worldwide", "family": "Mycobacteriaceae", "genus": "Mycobacterium"},
        {"scientific_name": "Neisseria meningitidis", "common_name": "Meningococcus", "gram_stain": "negative", "shape": "coccus", "size_micrometers": "0.6", "arrangement": "diplococci", "oxygen_requirement": "aerobe", "motility": "non-motile", "spore_formation": False, "habitat": "Human nasopharynx", "culture_media": "Chocolate agar", "biosafety_level": 3, "risk_level": "critical", "is_pathogenic": True, "description": "Causes bacterial meningitis and meningococcal septicemia", "family": "Neisseriaceae", "genus": "Neisseria"},
        {"scientific_name": "Vibrio cholerae", "common_name": "Cholera bacterium", "gram_stain": "negative", "shape": "comma-shaped", "size_micrometers": "1.5", "arrangement": "single", "oxygen_requirement": "facultative anaerobe", "motility": "motile", "spore_formation": False, "habitat": "Brackish and fresh water", "culture_media": "TCBS agar", "biosafety_level": 2, "risk_level": "critical", "is_pathogenic": True, "description": "Causative agent of cholera, a severe diarrheal disease", "family": "Vibrionaceae", "genus": "Vibrio"},
        {"scientific_name": "Clostridium botulinum", "common_name": "Botulinum", "gram_stain": "positive", "shape": "rod", "size_micrometers": "4.0", "arrangement": "single", "oxygen_requirement": "anaerobe", "motility": "motile", "spore_formation": True, "habitat": "Soil and aquatic sediments", "culture_media": "Anaerobic blood agar", "biosafety_level": 3, "risk_level": "critical", "is_pathogenic": True, "description": "Produces botulinum toxin, one of the most potent toxins known", "family": "Clostridiaceae", "genus": "Clostridium"},
        {"scientific_name": "Clostridium difficile", "common_name": "C. diff", "gram_stain": "positive", "shape": "rod", "size_micrometers": "3.0", "arrangement": "single", "oxygen_requirement": "anaerobe", "motility": "motile", "spore_formation": True, "habitat": "Human colon", "culture_media": "CCFA agar", "biosafety_level": 2, "risk_level": "high", "is_pathogenic": True, "is_opportunistic": True, "description": "Major cause of antibiotic-associated diarrhea and colitis", "family": "Clostridiaceae", "genus": "Clostridium"},
        {"scientific_name": "Klebsiella pneumoniae", "common_name": "Klebsiella", "gram_stain": "negative", "shape": "rod", "size_micrometers": "1.5", "arrangement": "single", "oxygen_requirement": "facultative anaerobe", "motility": "non-motile", "spore_formation": False, "habitat": "Human gut and respiratory tract", "culture_media": "MacConkey agar", "biosafety_level": 2, "risk_level": "high", "is_pathogenic": True, "is_opportunistic": True, "description": "Causes pneumonia, UTI, and bloodstream infections", "family": "Enterobacteriaceae", "genus": "Klebsiella"},
        {"scientific_name": "Pseudomonas aeruginosa", "common_name": "Pseudomonas", "gram_stain": "negative", "shape": "rod", "size_micrometers": "1.5", "arrangement": "single", "oxygen_requirement": "aerobe", "motility": "motile", "spore_formation": False, "habitat": "Soil, water, and hospital environments", "culture_media": "Pseudomonas agar, Cetrimide agar", "biosafety_level": 2, "risk_level": "high", "is_pathogenic": True, "is_opportunistic": True, "description": "Multi-drug resistant opportunistic pathogen", "family": "Pseudomonadaceae", "genus": "Pseudomonas"},
        {"scientific_name": "Streptococcus pyogenes", "common_name": "Group A Strep", "gram_stain": "positive", "shape": "coccus", "size_micrometers": "0.8", "arrangement": "chains", "oxygen_requirement": "facultative anaerobe", "motility": "non-motile", "spore_formation": False, "habitat": "Human throat and skin", "culture_media": "Blood agar (beta-hemolysis)", "biosafety_level": 2, "risk_level": "high", "is_pathogenic": True, "description": "Causes strep throat, cellulitis, and can lead to rheumatic fever", "family": "Streptococcaceae", "genus": "Streptococcus"},
        {"scientific_name": "Campylobacter jejuni", "common_name": "Campylobacter", "gram_stain": "negative", "shape": "spiral", "size_micrometers": "1.5", "arrangement": "single", "oxygen_requirement": "microaerophile", "motility": "motile", "spore_formation": False, "habitat": "Intestinal tract of poultry", "culture_media": "Skirrow's agar", "biosafety_level": 2, "risk_level": "medium", "is_pathogenic": True, "description": "Leading cause of bacterial gastroenteritis from contaminated food", "family": "Campylobacteraceae", "genus": "Campylobacter"},
        {"scientific_name": "Listeria monocytogenes", "common_name": "Listeria", "gram_stain": "positive", "shape": "rod", "size_micrometers": "1.0", "arrangement": "single", "oxygen_requirement": "facultative anaerobe", "motility": "motile", "spore_formation": False, "habitat": "Soil, water, food processing environments", "culture_media": "Listeria selective agar", "biosafety_level": 2, "risk_level": "high", "is_pathogenic": True, "description": "Causes listeriosis, especially dangerous for pregnant women", "family": "Listeriaceae", "genus": "Listeria"},
        {"scientific_name": "Shigella dysenteriae", "common_name": "Shigella", "gram_stain": "negative", "shape": "rod", "size_micrometers": "2.0", "arrangement": "single", "oxygen_requirement": "facultative anaerobe", "motility": "non-motile", "spore_formation": False, "habitat": "Human intestine", "culture_media": "MacConkey agar, SS agar", "biosafety_level": 2, "risk_level": "high", "is_pathogenic": True, "description": "Causes shigellosis (bacillary dysentery)", "family": "Enterobacteriaceae", "genus": "Shigella"},
        {"scientific_name": "Clostridium perfringens", "common_name": "Gas gangrene bacterium", "gram_stain": "positive", "shape": "rod", "size_micrometers": "3.0", "arrangement": "single", "oxygen_requirement": "anaerobe", "motility": "non-motile", "spore_formation": True, "habitat": "Soil and human gut", "culture_media": "Anaerobic blood agar", "biosafety_level": 2, "risk_level": "high", "is_pathogenic": True, "description": "Causes gas gangrene and food poisoning", "family": "Clostridiaceae", "genus": "Clostridium"},
        {"scientific_name": "Haemophilus influenzae", "common_name": "Hib", "gram_stain": "negative", "shape": "coccobacillus", "size_micrometers": "1.0", "arrangement": "single", "oxygen_requirement": "facultative anaerobe", "motility": "non-motile", "spore_formation": False, "habitat": "Human nasopharynx", "culture_media": "Chocolate agar (X and V factors)", "biosafety_level": 2, "risk_level": "high", "is_pathogenic": True, "is_opportunistic": True, "description": "Causes meningitis, pneumonia, and epiglottitis in children", "family": "Pasteurellaceae", "genus": "Haemophilus"},
        {"scientific_name": "Yersinia pestis", "common_name": "Plague bacterium", "gram_stain": "negative", "shape": "coccobacillus", "size_micrometers": "1.0", "arrangement": "single", "oxygen_requirement": "facultative anaerobe", "motility": "non-motile (at 37C)", "spore_formation": False, "habitat": "Fleas and rodents", "culture_media": "Blood agar, MacConkey agar", "biosafety_level": 3, "risk_level": "critical", "is_pathogenic": True, "description": "Causative agent of plague (bubonic, septicemic, pneumonic)", "family": "Yersiniaceae", "genus": "Yersinia"},
        {"scientific_name": "Enterococcus faecalis", "common_name": "Enterococcus", "gram_stain": "positive", "shape": "coccus", "size_micrometers": "0.8", "arrangement": "pairs", "oxygen_requirement": "facultative anaerobe", "motility": "non-motile", "spore_formation": False, "habitat": "Human gastrointestinal tract", "culture_media": "Bile esculin agar", "biosafety_level": 1, "risk_level": "medium", "is_pathogenic": True, "is_opportunistic": True, "description": "Common cause of UTI and hospital-acquired infections", "family": "Enterococcaceae", "genus": "Enterococcus"},
        {"scientific_name": "Bacillus subtilis", "common_name": "Hay bacillus", "gram_stain": "positive", "shape": "rod", "size_micrometers": "4.0", "arrangement": "chains", "oxygen_requirement": "aerobe", "motility": "motile", "spore_formation": True, "habitat": "Soil and gastrointestinal tract", "culture_media": "Nutrient agar", "biosafety_level": 1, "risk_level": "low", "is_beneficial": True, "description": "Model organism, probiotic potential, enzyme production", "family": "Bacillaceae", "genus": "Bacillus"},
        {"scientific_name": "Lactobacillus acidophilus", "common_name": "Acidophilus", "gram_stain": "positive", "shape": "rod", "size_micrometers": "1.5", "arrangement": "single", "oxygen_requirement": "facultative anaerobe", "motility": "non-motile", "spore_formation": False, "habitat": "Human gut and vagina", "culture_media": "MRS agar", "biosafety_level": 1, "risk_level": "low", "is_beneficial": True, "description": "Key probiotic bacterium for gut health", "family": "Lactobacillaceae", "genus": "Lactobacillus"},
        {"scientific_name": "Lactobacillus rhamnosus", "common_name": "LGG", "gram_stain": "positive", "shape": "rod", "size_micrometers": "1.5", "arrangement": "single", "oxygen_requirement": "facultative anaerobe", "motility": "non-motile", "spore_formation": False, "habitat": "Human gut", "culture_media": "MRS agar", "biosafety_level": 1, "risk_level": "low", "is_beneficial": True, "description": "Well-studied probiotic strain (LGG)", "family": "Lactobacillaceae", "genus": "Lactobacillus"},
        {"scientific_name": "Bifidobacterium longum", "common_name": "B. longum", "gram_stain": "positive", "shape": "rod", "size_micrometers": "2.0", "arrangement": "Y-shaped clusters", "oxygen_requirement": "anaerobe", "motility": "non-motile", "spore_formation": False, "habitat": "Human colon", "culture_media": "Bifidobacterium agar", "biosafety_level": 1, "risk_level": "low", "is_beneficial": True, "description": "Dominant probiotic in the human gut microbiome", "family": "Bifidobacteriaceae", "genus": "Bifidobacterium"},
        {"scientific_name": "Bifidobacterium breve", "common_name": "B. breve", "gram_stain": "positive", "shape": "rod", "size_micrometers": "1.5", "arrangement": "Y-shaped clusters", "oxygen_requirement": "anaerobe", "motility": "non-motile", "spore_formation": False, "habitat": "Human colon", "culture_media": "Bifidobacterium agar", "biosafety_level": 1, "risk_level": "low", "is_beneficial": True, "description": "Common in infant gut microbiome", "family": "Bifidobacteriaceae", "genus": "Bifidobacterium"},
        {"scientific_name": "Lactobacillus plantarum", "common_name": "L. plantarum", "gram_stain": "positive", "shape": "rod", "size_micrometers": "1.5", "arrangement": "single", "oxygen_requirement": "facultative anaerobe", "motility": "motile", "spore_formation": False, "habitat": "Fermented foods and gut", "culture_media": "MRS agar", "biosafety_level": 1, "risk_level": "low", "is_beneficial": True, "description": "Versatile probiotic found in fermented foods", "family": "Lactobacillaceae", "genus": "Lactobacillus"},
        {"scientific_name": "Streptococcus thermophilus", "common_name": "S. thermophilus", "gram_stain": "positive", "shape": "coccus", "size_micrometers": "0.8", "arrangement": "pairs and chains", "oxygen_requirement": "facultative anaerobe", "motility": "non-motile", "spore_formation": False, "habitat": "Dairy products", "culture_media": "M17 agar", "biosafety_level": 1, "risk_level": "low", "is_beneficial": True, "description": "Essential for yogurt and cheese production", "family": "Streptococcaceae", "genus": "Streptococcus"},
        {"scientific_name": "Bacillus coagulans", "common_name": "B. coagulans", "gram_stain": "positive", "shape": "rod", "size_micrometers": "3.0", "arrangement": "single", "oxygen_requirement": "facultative anaerobe", "motility": "motile", "spore_formation": True, "habitat": "Soil and fermented foods", "culture_media": "Nutrient agar", "biosafety_level": 1, "risk_level": "low", "is_beneficial": True, "description": "Spore-forming probiotic with good shelf stability", "family": "Bacillaceae", "genus": "Bacillus"},
        {"scientific_name": "Akkermansia muciniphila", "common_name": "Akkermansia", "gram_stain": "negative", "shape": "oval", "size_micrometers": "1.0", "arrangement": "single", "oxygen_requirement": "anaerobe", "motility": "non-motile", "spore_formation": False, "habitat": "Human intestinal mucus layer", "culture_media": "BHI medium with mucin", "biosafety_level": 1, "risk_level": "low", "is_beneficial": True, "description": "Next-generation probiotic, linked to metabolic health", "family": "Akkermansiaceae", "genus": "Akkermansia"},
    ]

    species_map = {}
    for sd in species_data:
        sp = BacterialSpecies(**sd)
        db.add(sp)
        db.flush()
        species_map[sp.scientific_name] = sp.id

    # Disease-species links
    disease_species_links = {
        "Pneumonia": ["Escherichia coli", "Streptococcus pneumoniae", "Klebsiella pneumoniae", "Pseudomonas aeruginosa", "Haemophilus influenzae"],
        "Meningitis": ["Streptococcus pneumoniae", "Neisseria meningitidis", "Haemophilus influenzae"],
        "Sepsis": ["Escherichia coli", "Staphylococcus aureus", "Streptococcus pneumoniae", "Klebsiella pneumoniae", "Pseudomonas aeruginosa", "Enterococcus faecalis"],
        "Tuberculosis": ["Mycobacterium tuberculosis"],
        "Salmonellosis": ["Salmonella enterica"],
        "Gastroenteritis": ["Escherichia coli", "Salmonella enterica", "Clostridium difficile", "Campylobacter jejuni", "Shigella dysenteriae", "Clostridium perfringens"],
        "Cholera": ["Vibrio cholerae"],
        "Botulism": ["Clostridium botulinum"],
        "Strep Throat": ["Streptococcus pyogenes"],
        "Cellulitis": ["Staphylococcus aureus", "Streptococcus pyogenes", "Pseudomonas aeruginosa"],
        "Urinary Tract Infection": ["Escherichia coli", "Klebsiella pneumoniae", "Enterococcus faecalis"],
        "Legionnaires Disease": ["Pseudomonas aeruginosa"],
        "Food Poisoning": ["Staphylococcus aureus", "Salmonella enterica", "Clostridium perfringens", "Listeria monocytogenes", "Campylobacter jejuni"],
        "Gas Gangrene": ["Clostridium perfringens"],
        "Diphtheria": ["Haemophilus influenzae"],
        "Lyme Disease": [],
    }

    for disease_name, sp_names in disease_species_links.items():
        did = disease_map.get(disease_name)
        if not did:
            continue
        for sn in sp_names:
            sid = species_map.get(sn)
            if sid:
                db.add(SpeciesDisease(species_id=sid, disease_id=did))

    # Virulence factors
    vf_data = [
        ("Staphylococcus aureus", "Protein A", "Surface protein", "Inhibits phagocytosis by binding IgG Fc region", "Immune system", "spa"),
        ("Staphylococcus aureus", "Panton-Valentine Leukocidin", "Cytotoxin", "Destroys white blood cells", "Immune cells", "pvl"),
        ("Escherichia coli", "Type 1 Fimbriae", "Adhesin", "Mediates attachment to uroepithelial cells", "Uroepithelium", "fimH"),
        ("Escherichia coli", "Shiga Toxin", "AB toxin", "Inhibits protein synthesis in host cells", "Intestinal epithelium", "stx"),
        ("Streptococcus pneumoniae", "Capsular Polysaccharide", "Capsule", "Prevents phagocytosis", "Immune system", "cps"),
        ("Neisseria meningitidis", "Lipooligosaccharide", "Endotoxin", "Triggers inflammatory cascade", "Endothelial cells", "lps"),
        ("Vibrio cholerae", "Cholera Toxin", "AB5 toxin", "Activates adenylate cyclase causing fluid secretion", "Intestinal epithelium", "ctxAB"),
        ("Clostridium botulinum", "Botulinum Toxin", "AB toxin", "Cleaves SNARE proteins blocking neurotransmitter release", "Neurons", "bont"),
        ("Clostridium difficile", "Toxin A", "Enterotoxin", "Disrupts cytoskeleton and tight junctions", "Intestinal epithelium", "tcdA"),
        ("Clostridium difficile", "Toxin B", "Cytotoxin", "Disrupts cytoskeleton via Rho GTPase inactivation", "Intestinal epithelium", "tcdB"),
        ("Mycobacterium tuberculosis", "Cord Factor", "Glycolipid", "Inhibits macrophage function", "Macrophages", "pks12"),
        ("Yersinia pestis", "YopE", "Effector protein", "Disrupts actin cytoskeleton of macrophages", "Macrophages", "yopE"),
        ("Pseudomonas aeruginosa", "Exotoxin A", "AB toxin", "Inhibits protein synthesis via ADP-ribosylation", "Various cells", "toxA"),
        ("Listeria monocytogenes", "Listeriolysin O", "Cytolysin", "Escapes phagosome into cytoplasm", "Macrophages", "hly"),
    ]
    for sp_name, name, vtype, mech, target, gene in vf_data:
        sid = species_map.get(sp_name)
        if sid:
            db.add(VirulenceFactor(species_id=sid, name=name, type=vtype, mechanism=mech, target_tissue=target, gene_name=gene))

    # Antibiotic resistance
    ar_data = [
        ("Staphylococcus aureus", "Methicillin", "PBP2a production", "mecA", "resistant"),
        ("Staphylococcus aureus", "Vancomycin", "Cell wall thickening", "vanA", "intermediate"),
        ("Escherichia coli", "Ampicillin", "Beta-lactamase production", "blaTEM", "resistant"),
        ("Escherichia coli", "Ciprofloxacin", "DNA gyrase mutation", "gyrA", "sensitive"),
        ("Pseudomonas aeruginosa", "Meropenem", "Carbapenemase production", "blaVIM", "resistant"),
        ("Pseudomonas aeruginosa", "Gentamicin", "Aminoglycoside modifying enzymes", "aac", "intermediate"),
        ("Klebsiella pneumoniae", "Ceftriaxone", "ESBL production", "blaCTX-M", "resistant"),
        ("Klebsiella pneumoniae", "Carbapenems", "KPC enzyme production", "blaKPC", "resistant"),
        ("Enterococcus faecalis", "Ampicillin", "PBP modification", "pbp5", "resistant"),
        ("Enterococcus faecalis", "Vancomycin", "D-Ala-D-Lac substitution", "vanA", "resistant"),
        ("Clostridium difficile", "Clindamycin", "Ribosomal methylation", "ermB", "resistant"),
        ("Mycobacterium tuberculosis", "Isoniazid", "Catalase-peroxidase mutation", "katG", "resistant"),
        ("Mycobacterium tuberculosis", "Rifampicin", "RNA polymerase mutation", "rpoB", "sensitive"),
    ]
    for sp_name, abx, mech, gene, susc in ar_data:
        sid = species_map.get(sp_name)
        if sid:
            db.add(AntibioticResistance(species_id=sid, antibiotic_name=abx, resistance_mechanism=mech, resistance_gene=gene, susceptibility=susc))

    # Protein profiles
    pp_data = [
        ("Staphylococcus aureus", "Protein A", "P02976", "spa", 45.0, "Binds IgG Fc region", "Immune evasion marker"),
        ("Escherichia coli", "Shiga toxin 2", "P04610", "stx2", 7.7, "AB5 toxin inhibiting protein synthesis", "Virulence marker"),
        ("Streptococcus pneumoniae", "Pneumolysin", "P0C5D4", "ply", 53.0, "Pore-forming cytolysin", "Vaccine candidate"),
        ("Mycobacterium tuberculosis", "Antigen 85B", "P9WQB5", "fbpB", 30.0, "Mycolyltransferase", "Vaccine candidate"),
        ("Vibrio cholerae", "Cholera Toxin B subunit", "P01555", "ctxB", 11.6, "Receptor binding subunit", "Vaccine component"),
        ("Neisseria meningitidis", "Factor H Binding Protein", "A0A0H3K1R0", "fHbp", 27.0, "Complement evasion", "Vaccine antigen"),
        ("Clostridium botulinum", "Botulinum Neurotoxin", "P10845", "bont", 150.0, "Zinc protease targeting SNARE", "Therapeutic/toxin"),
        ("Pseudomonas aeruginosa", "Elastase", "P11428", "lasB", 33.0, "Degrades elastin and collagen", "Tissue destruction"),
    ]
    for sp_name, pname, uid, gene, mw, func, clin in pp_data:
        sid = species_map.get(sp_name)
        if sid:
            db.add(ProteinProfile(species_id=sid, protein_name=pname, uniprot_id=uid, gene_name=gene, molecular_weight_kda=mw, function_description=func, clinical_relevance=clin))

    # Toxins
    toxin_data = [
        ("Clostridium botulinum", "Botulinum Toxin A", "AB toxin", "Blocks acetylcholine release at neuromuscular junction", "Motor neurons", "Heat labile", "Flaccid paralysis"),
        ("Clostridium difficile", "TcdA", "Enterotoxin", "Glucosylates Rho GTPases disrupting cytoskeleton", "Intestinal epithelial cells", "Heat labile", "Watery diarrhea, colitis"),
        ("Clostridium difficile", "TcdB", "Cytotoxin", "Glucosylates Rho GTPases causing cell death", "Intestinal epithelial cells", "Heat labile", "Pseudomembranous colitis"),
        ("Staphylococcus aureus", "Alpha-Hemolysin", "Pore-forming toxin", "Forms heptameric pores in cell membranes", "Red and white blood cells", "Heat labile", "Tissue necrosis"),
        ("Vibrio cholerae", "Cholera Toxin", "AB5 enterotoxin", "ADP-ribosylation of Gs activating cAMP", "Intestinal epithelial cells", "Heat labile", "Profuse watery diarrhea"),
        ("Escherichia coli", "Shiga Toxin 2", "AB toxin", "Cleaves 28S rRNA halting protein synthesis", "Intestinal endothelial cells", "Heat stable", "Hemorrhagic colitis, HUS"),
        ("Bacillus anthracis", "Edema Factor", "Adenylate cyclase toxin", "Elevates cAMP causing edema", "Macrophages", "Heat labile", "Tissue edema"),
        ("Yersinia pestis", "YopJ", "Acetyltransferase", "Inhibits MAPK and NF-kB pathways", "Macrophages", "Heat labile", "Immune suppression"),
    ]
    for sp_name, tname, ttype, mech, target, heat, effect in toxin_data:
        sid = species_map.get(sp_name)
        if sid:
            db.add(Toxin(species_id=sid, toxin_name=tname, toxin_type=ttype, mechanism_of_action=mech, target_cells=target, heat_stability=heat, clinical_effect=effect))

    # Enzymes
    enzyme_data = [
        ("Staphylococcus aureus", "Coagulase", "EC 3.4.24.29", "Converts fibrinogen to fibrin for clot formation", "Fibrinogen", "Diagnostic marker"),
        ("Staphylococcus aureus", "Catalase", "EC 1.11.1.6", "Breaks down hydrogen peroxide", "H2O2", "Oxidative stress resistance"),
        ("Escherichia coli", "Beta-Galactosidase", "EC 3.2.1.23", "Cleaves lactose into glucose and galactose", "Lactose", "Molecular biology tool"),
        ("Streptococcus pyogenes", "Streptokinase", "EC 3.4.99.23", "Activates plasminogen to plasmin", "Plasminogen", "Thrombolytic therapy model"),
        ("Clostridium perfringens", "Collagenase", "EC 3.4.24.3", "Degrades collagen in connective tissue", "Collagen", "Wound debridement"),
        ("Pseudomonas aeruginosa", "Elastase", "EC 3.4.24.26", "Degrades elastin in lung tissue", "Elastin", "Tissue destruction"),
        ("Bacillus subtilis", "Alpha-Amylase", "EC 3.2.1.1", "Hydrolyzes starch into sugars", "Starch", "Starch processing industry"),
        ("Lactobacillus acidophilus", "Lactase", "EC 3.2.1.108", "Hydrolyzes lactose for digestion", "Lactose", "Lactose intolerance treatment"),
    ]
    for sp_name, ename, ec, func, sub, use in enzyme_data:
        sid = species_map.get(sp_name)
        if sid:
            db.add(Enzyme(species_id=sid, enzyme_name=ename, ec_number=ec, function_description=func, substrate=sub, industrial_use=use))

    # Lab tests
    lab_data = [
        ("Escherichia coli", "Urinalysis", "Biochemical", "Urine", "Dipstick and microscopy", "Positive nitrites and leukocyte esterase", 0.85, 0.78, "24 hours"),
        ("Escherichia coli", "Stool Culture", "Microbiological", "Stool", "MacConkey agar plating", "Lactose-fermenting colonies", 0.92, 0.95, "48 hours"),
        ("Staphylococcus aureus", "Gram Stain", "Microscopy", "Wound swab", "Gram staining", "Gram-positive clusters", 0.80, 0.85, "1 hour"),
        ("Staphylococcus aureus", "Coagulase Test", "Biochemical", "Isolate", "Coagulase tube test", "Plasma clotting", 0.95, 0.98, "4 hours"),
        ("Staphylococcus aureus", "MRSA Screen", "Molecular", "Nasal swab", "PCR for mecA gene", "mecA detection", 0.98, 0.99, "2 hours"),
        ("Streptococcus pneumoniae", "Gram Stain", "Microscopy", "Sputum", "Gram staining", "Gram-positive diplococci", 0.75, 0.80, "1 hour"),
        ("Streptococcus pneumoniae", "Blood Culture", "Microbiological", "Blood", "Automated blood culture system", "Growth in bottles", 0.90, 0.95, "24-48 hours"),
        ("Mycobacterium tuberculosis", "AFB Smear", "Microscopy", "Sputum", "Ziehl-Neelsen staining", "Acid-fast bacilli", 0.60, 0.98, "24 hours"),
        ("Mycobacterium tuberculosis", "GeneXpert MTB/RIF", "Molecular", "Sputum", "Real-time PCR", "TB DNA and rifampicin resistance", 0.95, 0.98, "2 hours"),
        ("Mycobacterium tuberculosis", "Mantoux Test", "Immunological", "Skin", "Tuberculin skin test", "Induration >= 10mm", 0.85, 0.75, "48-72 hours"),
        ("Neisseria meningitidis", "CSF Culture", "Microbiological", "CSF", "Chocolate agar plating", "Oxidase-positive diplococci", 0.88, 0.95, "24-48 hours"),
        ("Neisseria meningitidis", "Latex Agglutination", "Immunological", "CSF", "Latex bead agglutination", "Serogroup-specific reaction", 0.92, 0.97, "2 hours"),
        ("Vibrio cholerae", "Stool Culture", "Microbiological", "Stool", "TCBS agar", "Yellow colonies on TCBS", 0.90, 0.95, "24 hours"),
        ("Vibrio cholerae", "Rapid Cholera Test", "Immunological", "Stool", "Lateral flow immunoassay", "O1/O139 antigen detection", 0.85, 0.90, "15 minutes"),
        ("Clostridium difficile", "GDH/Toxin EIA", "Immunoassay", "Stool", "Enzyme immunoassay", "Toxin A/B detection", 0.88, 0.95, "4 hours"),
        ("Clostridium difficile", "PCR", "Molecular", "Stool", "Real-time PCR for tcdB", "tcdB gene detection", 0.95, 0.98, "2 hours"),
        ("Pseudomonas aeruginosa", "Culture on Cetrimide", "Microbiological", "Sputum/wound", "Cetrimide agar", "Green pigment-producing colonies", 0.90, 0.92, "24 hours"),
        ("Klebsiella pneumoniae", "Gram Stain", "Microscopy", "Sputum", "Gram staining", "Gram-negative encapsulated rods", 0.82, 0.88, "1 hour"),
        ("Salmonella enterica", "Stool Culture", "Microbiological", "Stool", "XLD agar", "Red colonies with black centers", 0.92, 0.95, "24-48 hours"),
        ("Listeria monocytogenes", "Culture", "Microbiological", "Food/blood", "Half-Fraser enrichment", "Small grey colonies", 0.88, 0.93, "48-72 hours"),
        ("Haemophilus influenzae", "Chocolate Agar Culture", "Microbiological", "Throat swab", "Chocolate agar with X/V factors", "Small translucent colonies", 0.88, 0.90, "24 hours"),
        ("Campylobacter jejuni", "Microaerophilic Culture", "Microbiological", "Stool", "Skirrow's agar in microaerophilic conditions", "Grey spreading colonies", 0.85, 0.95, "48-72 hours"),
        ("Streptococcus pyogenes", "Rapid Strep Test", "Immunological", "Throat swab", "Lateral flow immunoassay", "Group A antigen", 0.90, 0.95, "5 minutes"),
        ("Enterococcus faecalis", "Bile Esculin Test", "Biochemical", "Isolate", "Bile esculin agar", "Black precipitate", 0.92, 0.95, "24 hours"),
        ("Clostridium botulinum", "Mouse Bioassay", "Biological", "Food/serum", "Intraperitoneal injection in mice", "Mouse death/paralysis", 0.99, 0.99, "4 days"),
        ("Yersinia pestis", "F1 Antigen Test", "Immunological", "Aspirate/blood", "Lateral flow immunoassay", "F1 capsular antigen", 0.95, 0.98, "15 minutes"),
        ("Shigella dysenteriae", "Stool Culture", "Microbiological", "Stool", "SS agar", "Non-lactose-fermenting colonies", 0.90, 0.92, "24 hours"),
    ]
    for sp_name, tname, ttype, spec, meth, exp, sens, spec_val, tat in lab_data:
        sid = species_map.get(sp_name)
        if sid:
            db.add(LabTest(species_id=sid, test_name=tname, test_type=ttype, specimen_type=spec, methodology=meth, expected_result=exp, sensitivity=sens, specificity=spec_val, turnaround_time=tat))

    # Beneficial properties
    bp_data = [
        ("Bacillus subtilis", "Probiotic", "Produces antimicrobial compounds and supports gut health", "Competitive exclusion of pathogens", "Enzyme production (amylase, protease)", "Fermented soybeans (natto)"),
        ("Lactobacillus acidophilus", "Probiotic", "Maintains healthy gut microbiome balance", "Lactic acid production inhibiting pathogens", "Dairy fermentation", "Yogurt, kefir"),
        ("Lactobacillus rhamnosus", "Probiotic", "Reduces duration and severity of diarrhea", "Immune modulation", "Gut barrier enhancement", "Probiotic supplements"),
        ("Bifidobacterium longum", "Probiotic", "Supports immune function and gut barrier", "Short-chain fatty acid production", "Vitamin synthesis", "Fermented dairy"),
        ("Bifidobacterium breve", "Probiotic", "Beneficial for infant gut colonization", "Colonization resistance", "Breast milk adaptation", "Infant formula supplements"),
        ("Lactobacillus plantarum", "Probiotic", "Enhances gut barrier integrity", "Bacteriocin production", "Antioxidant activity", "Sauerkraut, kimchi, olives"),
        ("Streptococcus thermophilus", "Industrial", "Essential for dairy fermentation", "Lactose digestion aid", "Acid production in yogurt", "Yogurt, mozzarella cheese"),
        ("Bacillus coagulans", "Probiotic", "Spore-forming probiotic with shelf stability", "Spore survives stomach acid", "Immune modulation", "Probiotic supplements"),
        ("Akkermansia muciniphila", "Probiotic", "Associated with healthy metabolism and reduced obesity", "Mucin degradation for gut barrier", "Metabolic health improvement", "Next-generation probiotic"),
    ]
    for sp_name, ptype, desc, health, industrial, food in bp_data:
        sid = species_map.get(sp_name)
        if sid:
            db.add(BeneficialProperty(species_id=sid, property_type=ptype, description=desc, health_benefit=health, industrial_use=industrial, food_application=food))

    # Immune responses
    ir_data = [
        ("Mycobacterium tuberculosis", "TLR2/NF-kB", "Pro-inflammatory", "TNF-alpha, IL-12, IFN-gamma", "Inhibition of phagosome-lysosome fusion"),
        ("Staphylococcus aureus", "TLR2/NOD2", "Pro-inflammatory", "IL-6, TNF-alpha, IL-1beta", "Protein A binding inhibits opsonization"),
        ("Escherichia coli", "TLR4/NF-kB", "Pro-inflammatory", "TNF-alpha, IL-6, IL-8", "LPS-mediated immune activation"),
        ("Streptococcus pneumoniae", "TLR2/MyD88", "Pro-inflammatory", "IL-1beta, TNF-alpha, IL-6", "Capsule inhibits complement deposition"),
        ("Neisseria meningitidis", "TLR4/TLR2", "Pro-inflammatory", "TNF-alpha, IL-10, IL-1beta", "Phase variation of surface antigens"),
        ("Listeria monocytogenes", "cGAS-STING", "Type I IFN response", "IFN-beta, IL-18, TNF-alpha", "ActA-mediated actin-based motility"),
        ("Pseudomonas aeruginosa", "TLR4/NF-kB", "Pro-inflammatory", "IL-8, TNF-alpha, IL-6", "ExoS suppresses NF-kB signaling"),
        ("Bacillus subtilis", "NOD2", "Immunomodulatory", "IL-10, TGF-beta", "Promotes regulatory T cell differentiation"),
        ("Lactobacillus acidophilus", "TLR2/DC-SIGN", "Anti-inflammatory", "IL-10, TGF-beta", "Enhances mucosal immune tolerance"),
    ]
    for sp_name, pathway, rtype, cytokines, evasion in ir_data:
        sid = species_map.get(sp_name)
        if sid:
            db.add(ImmuneResponse(species_id=sid, immune_pathway=pathway, response_type=rtype, cytokine_profile=cytokines, immune_evasion_mechanism=evasion))

    db.commit()
    species_count = db.query(BacterialSpecies).count()
    disease_count = db.query(Disease).count()
    symptom_count = db.query(Symptom).count()
    print(f"Seeding complete: {species_count} species, {disease_count} diseases, {symptom_count} symptoms")
    db.close()


if __name__ == "__main__":
    seed()
