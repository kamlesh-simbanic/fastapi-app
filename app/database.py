import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

load_dotenv()

# MySQL connection string format: mysql+pymysql://user:password@host:port/dbname
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL", "mysql+pymysql://root@localhost:3306/fastapi_db"
)

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# Dependency for database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
