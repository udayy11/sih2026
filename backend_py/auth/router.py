import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from backend_py.database.connection import get_db
from backend_py.database.models import UserModel
from backend_py.database.schemas import UserCreate, UserResponse, Token, LoginRequest
from backend_py.auth.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    oauth2_scheme,
    decode_access_token
)

router = APIRouter(prefix="/auth", tags=["Authentication & Security"])

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> UserModel:
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    email: str = payload.get("sub")
    user = db.query(UserModel).filter(UserModel.email == email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user

@router.post("/register", response_model=Token)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(UserModel).filter(UserModel.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already registered")

    new_user = UserModel(
        id=f"usr_{uuid.uuid4().hex[:8]}",
        name=user_in.name,
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        role=user_in.role or "Analyst",
        organization=user_in.organization or "Ministry of Statistics and Programme Implementation"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(data={"sub": new_user.email, "role": new_user.role})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse.model_validate(new_user)
    }

@router.post("/login", response_model=Token)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(UserModel).filter(UserModel.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        # Demo fallback for default seeded user if DB is fresh
        if login_data.email == "analyst@mospi.gov.in" and login_data.password == "nirmaanx2026":
            token = create_access_token(data={"sub": login_data.email, "role": "Senior Analyst"})
            return {
                "access_token": token,
                "token_type": "bearer",
                "user": {
                    "id": "usr_mospi_admin",
                    "name": "MoSPI Senior Analyst",
                    "email": "analyst@mospi.gov.in",
                    "role": "Senior Analyst",
                    "organization": "MoSPI Infrastructure Monitoring Division"
                }
            }
        raise HTTPException(status_code=400, detail="Invalid email or password")

    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse.model_validate(user)
    }

@router.post("/oauth/token", response_model=Token)
def oauth_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Standard OAuth2 password flow endpoint compliant with OpenAPI/OAuth2 standards.
    """
    user = db.query(UserModel).filter(UserModel.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect username or password"
        )
    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse.model_validate(user)
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: UserModel = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)
