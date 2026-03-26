from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List, Optional

from .. import models, schemas, utils

def create_task(db: Session, task_schema: schemas.TaskCreate, current_user_id: int):
    new_task = models.Task(
        **task_schema.model_dump(),
        created_by=current_user_id,
        updated_by=current_user_id
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task

def get_tasks(db: Session, current_user_id: int, skip: int = 0, limit: int = 100, sort_by: str = "id", order: str = "asc"):
    query = db.query(models.Task).filter(models.Task.created_by == current_user_id)
    return utils.apply_pagination_sort(query, models.Task, skip, limit, sort_by, order).all()

def get_task(db: Session, task_id: int, current_user_id: int):
    task = db.query(models.Task).filter(models.Task.id == task_id, models.Task.created_by == current_user_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task

def update_task(db: Session, task_id: int, task_update: schemas.TaskUpdate, current_user_id: int):
    task_query = db.query(models.Task).filter(models.Task.id == task_id, models.Task.created_by == current_user_id)
    task = task_query.first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    
    update_data = task_update.model_dump(exclude_unset=True)
    update_data["updated_by"] = current_user_id
    
    task_query.update(update_data, synchronize_session=False)
    db.commit()
    db.refresh(task)
    return task

def delete_task(db: Session, task_id: int, current_user_id: int):
    task_query = db.query(models.Task).filter(models.Task.id == task_id, models.Task.created_by == current_user_id)
    task = task_query.first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    
    task_query.delete(synchronize_session=False)
    db.commit()
    return None
