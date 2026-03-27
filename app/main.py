import os
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from . import models
from .database import engine, get_db
from .routers import auth, tasks, students, fees, staff, attendance, dashboard

load_dotenv()

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title=os.getenv("PROJECT_NAME", "FastAPI App Starter"))

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(students.router)
app.include_router(fees.router)
app.include_router(staff.router)
app.include_router(attendance.router)
app.include_router(dashboard.router)

@app.get("/")
async def root():
    return {"message": "Welcome to your FastAPI application!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy Status"}

@app.get("/db-test")
async def db_test(db: Session = Depends(get_db)):
    try:
        # Simple query to test connection
        from sqlalchemy import text
        db.execute(text("SELECT 1"))
        return {"status": "connected", "database": "MySQL"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")
