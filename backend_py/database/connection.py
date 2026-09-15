import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from backend_py.config import settings

logger = logging.getLogger("nirmaanx.db")

Base = declarative_base()

# Attempt to connect to configured DB (PostgreSQL). If unreachable, fall back to SQLite
def get_engine():
    db_url = settings.DATABASE_URL
    try:
        if db_url.startswith("postgresql"):
            # Test connection with short timeout
            test_engine = create_engine(db_url, connect_args={"connect_timeout": 2})
            with test_engine.connect() as conn:
                logger.info("Successfully connected to PostgreSQL at %s", db_url)
                return test_engine
    except Exception as e:
        logger.warning(
            "PostgreSQL is unavailable (%s). Falling back to SQLite for local development.",
            str(e),
        )
    
    # SQLite fallback
    sqlite_url = "sqlite:///./nirmaanx_local.db"
    return create_engine(sqlite_url, connect_args={"check_same_thread": False})

engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
