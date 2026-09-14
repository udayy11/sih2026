import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend_py.config import settings
from backend_py.database.connection import engine, Base, SessionLocal
from backend_py.database.models import UserModel
from backend_py.auth.security import get_password_hash
from backend_py.auth.router import router as auth_router
from backend_py.ml.router import router as ml_router
from backend_py.rag.router import router as rag_router
from backend_py.storage.router import router as storage_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("nirmaanx.api")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database schemas verified and initialized successfully.")
        
        # Seed default admin analyst user if not exists
        db = SessionLocal()
        try:
            admin_user = db.query(UserModel).filter(UserModel.email == "analyst@mospi.gov.in").first()
            if not admin_user:
                seed_user = UserModel(
                    id="usr_mospi_admin",
                    name="MoSPI Senior Analyst",
                    email="analyst@mospi.gov.in",
                    hashed_password=get_password_hash("nirmaanx2026"),
                    role="Senior Analyst",
                    organization="MoSPI Infrastructure Monitoring Division"
                )
                db.add(seed_user)
                db.commit()
                logger.info("Default MoSPI analyst account seeded into database.")
        finally:
            db.close()
    except Exception as err:
        logger.warning("Database schema init warning: %s", err)

    yield
    logger.info("FastAPI service shutting down.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="2.0.0",
    description="Python/FastAPI Decision Support Engine for MoSPI Infrastructure Monitoring with Scikit-learn, XGBoost, and RAG",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers under /api
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(ml_router, prefix=settings.API_V1_STR)
app.include_router(rag_router, prefix=settings.API_V1_STR)
app.include_router(storage_router, prefix=settings.API_V1_STR)

@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "system": settings.PROJECT_NAME,
        "engine": "Python FastAPI + Scikit-learn + XGBoost + RAG",
        "version": "2.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend_py.main:app", host="0.0.0.0", port=8000, reload=True)
