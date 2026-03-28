import os
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from . import models
from .database import engine, get_db
from .routers import auth, tasks, students, fees, staff, attendance, dashboard, school_class, class_student

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
app.include_router(auth.router, prefix="/api")
app.include_router(tasks.router, prefix="/api")
app.include_router(students.router, prefix="/api")
app.include_router(fees.router, prefix="/api")
app.include_router(staff.router, prefix="/api")
app.include_router(attendance.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(school_class.router, prefix="/api")
app.include_router(class_student.router, prefix="/api")

# Root redirect to frontend
# API health and test endpoints
@app.get("/api/health")
async def health_check():
    return {"status": "healthy Status"}

@app.get("/api/db-test")
async def db_test(db: Session = Depends(get_db)):
    try:
        from sqlalchemy import text
        db.execute(text("SELECT 1"))
        return {"status": "connected", "database": "MySQL"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")

# Serve the frontend
@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    base_dir = "frontend/out"
    
    # 1. Handle root path
    if not full_path or full_path == "/":
        return FileResponse(os.path.join(base_dir, "index.html"))
    
    # 2. Try serving the exact file (exists for _next/ assets, favicons, etc.)
    file_path = os.path.join(base_dir, full_path)
    if os.path.isfile(file_path):
        return FileResponse(file_path)
    
    # 3. Try serving the path with .html (Next.js static export structure)
    html_file = file_path + ".html"
    if os.path.isfile(html_file):
        return FileResponse(html_file)
    
    # 4. Fallback to index.html for client-side routing (SPA support)
    index_file = os.path.join(base_dir, "index.html")
    if os.path.isfile(index_file):
        return FileResponse(index_file)
        
    raise HTTPException(status_code=404, detail="Not Found")
