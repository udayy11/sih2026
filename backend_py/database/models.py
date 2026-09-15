import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, Text, JSON
from backend_py.database.connection import Base, engine

class UserModel(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    email = Column(String(128), unique=True, index=True, nullable=False)
    hashed_password = Column(String(256), nullable=False)
    role = Column(String(64), default="Analyst")
    organization = Column(String(128), default="Ministry of Statistics and Programme Implementation")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ProjectModel(Base):
    __tablename__ = "projects"

    id = Column(String(64), primary_key=True, index=True)
    project_code = Column(String(64), unique=True, index=True, nullable=False)
    name = Column(String(256), nullable=False, index=True)
    sector = Column(String(128), index=True)
    ministry = Column(String(128), index=True)
    state = Column(String(128), index=True)
    district = Column(String(128))
    original_cost = Column(Float, default=0.0)
    revised_cost = Column(Float, default=0.0)
    expenditure = Column(Float, default=0.0)
    physical_progress = Column(Float, default=0.0)
    financial_progress = Column(Float, default=0.0)
    original_completion_date = Column(String(64))
    expected_completion_date = Column(String(64))
    delay_months = Column(Integer, default=0)
    cost_overrun_amount = Column(Float, default=0.0)
    cost_overrun_percent = Column(Float, default=0.0)
    overall_risk_score = Column(Float, default=0.0)
    risk_level = Column(String(32), default="Low")
    raw_data_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AuditLogModel(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_email = Column(String(128), index=True)
    action = Column(String(128))
    target = Column(String(128))
    details = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

Base.metadata.create_all(bind=engine)
