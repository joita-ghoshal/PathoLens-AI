from datetime import datetime

from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class BacterialSpecies(Base):
    __tablename__ = "bacterial_species"

    id = Column(Integer, primary_key=True, autoincrement=True)
    scientific_name = Column(String(255), unique=True, nullable=False, index=True)
    common_name = Column(String(255), default="")
    kingdom = Column(String(100), default="Bacteria")
    phylum = Column(String(100), default="")
    class_name = Column(String(100), default="")
    order_name = Column(String(100), default="")
    family = Column(String(100), default="")
    genus = Column(String(100), default="")
    species = Column(String(100), default="")
    gram_stain = Column(String(50), default="")
    shape = Column(String(100), default="")
    size_micrometers = Column(String(50), default="")
    arrangement = Column(String(100), default="")
    oxygen_requirement = Column(String(100), default="")
    motility = Column(String(100), default="")
    spore_formation = Column(Boolean, default=False)
    growth_temperature_optimal = Column(Float, default=37.0)
    habitat = Column(Text, default="")
    culture_media = Column(Text, default="")
    biosafety_level = Column(Integer, default=1)
    risk_level = Column(String(50), default="low")
    is_beneficial = Column(Boolean, default=False)
    is_pathogenic = Column(Boolean, default=False)
    is_opportunistic = Column(Boolean, default=False)
    description = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    virulence_factors = relationship("VirulenceFactor", back_populates="species", cascade="all, delete-orphan")
    antibiotic_resistance = relationship("AntibioticResistance", back_populates="species", cascade="all, delete-orphan")
    protein_profiles = relationship("ProteinProfile", back_populates="species", cascade="all, delete-orphan")
    toxins = relationship("Toxin", back_populates="species", cascade="all, delete-orphan")
    enzymes = relationship("Enzyme", back_populates="species", cascade="all, delete-orphan")
    lab_tests = relationship("LabTest", back_populates="species", cascade="all, delete-orphan")
    beneficial_properties = relationship("BeneficialProperty", back_populates="species", cascade="all, delete-orphan")
    immune_responses = relationship("ImmuneResponse", back_populates="species", cascade="all, delete-orphan")
    diseases = relationship("Disease", secondary="species_diseases", back_populates="species")


class SpeciesDisease(Base):
    __tablename__ = "species_diseases"

    species_id = Column(Integer, ForeignKey("bacterial_species.id"), primary_key=True)
    disease_id = Column(Integer, ForeignKey("diseases.id"), primary_key=True)
    association_type = Column(String(50), default="primary")


class Disease(Base):
    __tablename__ = "diseases"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), unique=True, nullable=False)
    icd10_code = Column(String(20), default="")
    category = Column(String(100), default="")
    severity = Column(String(50), default="moderate")
    description = Column(Text, default="")

    species = relationship("BacterialSpecies", secondary="species_diseases", back_populates="diseases")


class VirulenceFactor(Base):
    __tablename__ = "virulence_factors"

    id = Column(Integer, primary_key=True, autoincrement=True)
    species_id = Column(Integer, ForeignKey("bacterial_species.id"), nullable=False)
    name = Column(String(255), nullable=False)
    type = Column(String(100), default="")
    mechanism = Column(Text, default="")
    target_tissue = Column(String(255), default="")
    gene_name = Column(String(100), default="")

    species = relationship("BacterialSpecies", back_populates="virulence_factors")


class AntibioticResistance(Base):
    __tablename__ = "antibiotic_resistance"

    id = Column(Integer, primary_key=True, autoincrement=True)
    species_id = Column(Integer, ForeignKey("bacterial_species.id"), nullable=False)
    antibiotic_name = Column(String(255), nullable=False)
    resistance_mechanism = Column(Text, default="")
    resistance_gene = Column(String(100), default="")
    susceptibility = Column(String(50), default="sensitive")

    species = relationship("BacterialSpecies", back_populates="antibiotic_resistance")


class ProteinProfile(Base):
    __tablename__ = "protein_profiles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    species_id = Column(Integer, ForeignKey("bacterial_species.id"), nullable=False)
    protein_name = Column(String(255), nullable=False)
    uniprot_id = Column(String(50), default="")
    gene_name = Column(String(100), default="")
    molecular_weight_kda = Column(Float, default=0)
    function_description = Column(Text, default="")
    clinical_relevance = Column(Text, default="")

    species = relationship("BacterialSpecies", back_populates="protein_profiles")


class Toxin(Base):
    __tablename__ = "toxins"

    id = Column(Integer, primary_key=True, autoincrement=True)
    species_id = Column(Integer, ForeignKey("bacterial_species.id"), nullable=False)
    toxin_name = Column(String(255), nullable=False)
    toxin_type = Column(String(100), default="")
    mechanism_of_action = Column(Text, default="")
    target_cells = Column(String(255), default="")
    heat_stability = Column(String(50), default="")
    clinical_effect = Column(Text, default="")

    species = relationship("BacterialSpecies", back_populates="toxins")


class Enzyme(Base):
    __tablename__ = "enzymes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    species_id = Column(Integer, ForeignKey("bacterial_species.id"), nullable=False)
    enzyme_name = Column(String(255), nullable=False)
    ec_number = Column(String(50), default="")
    function_description = Column(Text, default="")
    substrate = Column(String(255), default="")
    industrial_use = Column(Text, default="")

    species = relationship("BacterialSpecies", back_populates="enzymes")


class LabTest(Base):
    __tablename__ = "lab_tests"

    id = Column(Integer, primary_key=True, autoincrement=True)
    species_id = Column(Integer, ForeignKey("bacterial_species.id"), nullable=False)
    test_name = Column(String(255), nullable=False)
    test_type = Column(String(100), default="")
    specimen_type = Column(String(100), default="")
    methodology = Column(Text, default="")
    expected_result = Column(Text, default="")
    sensitivity = Column(Float, default=0)
    specificity = Column(Float, default=0)
    turnaround_time = Column(String(100), default="")

    species = relationship("BacterialSpecies", back_populates="lab_tests")


class BeneficialProperty(Base):
    __tablename__ = "beneficial_properties"

    id = Column(Integer, primary_key=True, autoincrement=True)
    species_id = Column(Integer, ForeignKey("bacterial_species.id"), nullable=False)
    property_type = Column(String(100), default="")
    description = Column(Text, default="")
    health_benefit = Column(Text, default="")
    industrial_use = Column(Text, default="")
    food_application = Column(Text, default="")

    species = relationship("BacterialSpecies", back_populates="beneficial_properties")


class ImmuneResponse(Base):
    __tablename__ = "immune_responses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    species_id = Column(Integer, ForeignKey("bacterial_species.id"), nullable=False)
    immune_pathway = Column(String(255), default="")
    response_type = Column(String(100), default="")
    cytokine_profile = Column(Text, default="")
    immune_evasion_mechanism = Column(Text, default="")

    species = relationship("BacterialSpecies", back_populates="immune_responses")
