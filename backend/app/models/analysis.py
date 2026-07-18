from datetime import datetime

from sqlalchemy import Column, String, Integer, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    status = Column(String(50), default="pending")
    symptoms_json = Column(Text, default="[]")
    age = Column(Integer, default=30)
    gender = Column(String(50), default="")
    medical_history_json = Column(Text, default="[]")
    travel_history = Column(Text, default="")
    top_candidate = Column(String(255), default="")
    confidence_score = Column(Float, default=0)
    risk_level = Column(String(50), default="low")
    results_json = Column(Text, default="{}")
    processing_time_ms = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="analyses")


class Symptom(Base):
    __tablename__ = "symptoms"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), unique=True, nullable=False)
    category = Column(String(100), default="")
    description = Column(Text, default="")
