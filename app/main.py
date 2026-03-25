import os
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from . import models
from .database import engine, get_db

load_dotenv()

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title=os.getenv("PROJECT_NAME", "FastAPI App Starter"))

@app.get("/")
async def root():
    return {"message": "Welcome to your FastAPI application!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/db-test")
async def db_test(db: Session = Depends(get_db)):
    try:
        # Simple query to test connection
        from sqlalchemy import text
        db.execute(text("SELECT 1"))
        return {"status": "connected", "database": "MySQL"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")
