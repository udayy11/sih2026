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

class FeedbackModel(Base):
    __tablename__ = "feedbacks"

    id = Column(String(64), primary_key=True, index=True)
    case_id = Column(String(64), unique=True, index=True, nullable=False)
    project_id = Column(String(64), index=True, nullable=False)
    citizen_id = Column(String(64), index=True, nullable=False)
    feedback_type = Column(String(64), default="Ground-Level Issue")
    category = Column(String(128), nullable=False)
    description = Column(Text, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    location = Column(String(256), nullable=False)
    priority = Column(String(32), default="Medium")
    status = Column(String(64), default="SUBMITTED")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class FeedbackEvidenceModel(Base):
    __tablename__ = "feedback_evidences"

    id = Column(String(64), primary_key=True, index=True)
    case_id = Column(String(64), index=True, nullable=False)
    url = Column(String(512), nullable=False)
    file_name = Column(String(256), nullable=False)
    file_type = Column(String(64))
    uploaded_by = Column(String(128))
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)

class FeedbackStatusHistoryModel(Base):
    __tablename__ = "feedback_status_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    case_id = Column(String(64), index=True, nullable=False)
    status = Column(String(64), nullable=False)
    title = Column(String(128))
    description = Column(Text)
    actor = Column(String(128))
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class FeedbackAssignmentModel(Base):
    __tablename__ = "feedback_assignments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    case_id = Column(String(64), index=True, nullable=False)
    tracker_id = Column(String(64), nullable=False)
    assigned_by = Column(String(128))
    notes = Column(Text)
    assigned_at = Column(DateTime, default=datetime.datetime.utcnow)

class FeedbackVerificationModel(Base):
    __tablename__ = "feedback_verifications"

    id = Column(Integer, primary_key=True, autoincrement=True)
    case_id = Column(String(64), index=True, nullable=False)
    verified = Column(String(16), default="Verified")
    verified_by = Column(String(128))
    notes = Column(Text, nullable=False)
    verified_at = Column(DateTime, default=datetime.datetime.utcnow)

class CorrectiveActionModel(Base):
    __tablename__ = "corrective_actions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    case_id = Column(String(64), index=True, nullable=False)
    action_taken = Column(String(256), nullable=False)
    action_description = Column(Text, nullable=False)
    responsible_team = Column(String(128))
    action_date = Column(String(64))
    remarks = Column(Text)
    recorded_by = Column(String(128))
    recorded_at = Column(DateTime, default=datetime.datetime.utcnow)

class CitizenResponseModel(Base):
    __tablename__ = "citizen_responses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    case_id = Column(String(64), index=True, nullable=False)
    satisfied = Column(String(16), nullable=False)
    dissatisfaction_reason = Column(String(256))
    comments = Column(Text)
    response_date = Column(DateTime, default=datetime.datetime.utcnow)

Base.metadata.create_all(bind=engine)
