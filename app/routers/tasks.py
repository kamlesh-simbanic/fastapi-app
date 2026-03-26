from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from .. import models, schemas, utils, controllers
from ..database import get_db
from .auth import get_current_user

router = APIRouter(
    prefix="/tasks",
    tags=["tasks"]
)

@router.post("/", response_model=schemas.TaskOut, status_code=status.HTTP_201_CREATED)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return controllers.tasks.create_task(db, task, current_user.id)

@router.get("/", response_model=List[schemas.TaskOut])
def get_tasks(
    skip: int = 0,
    limit: int = 100,
    sort_by: str = "id",
    order: str = "asc",
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    return controllers.tasks.get_tasks(db, current_user.id, skip, limit, sort_by, order)

@router.get("/{task_id}", response_model=schemas.TaskOut)
def get_task(task_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return controllers.tasks.get_task(db, task_id, current_user.id)

@router.put("/{task_id}", response_model=schemas.TaskOut)
def update_task(task_id: int, task_update: schemas.TaskUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return controllers.tasks.update_task(db, task_id, task_update, current_user.id)

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return controllers.tasks.delete_task(db, task_id, current_user.id)
