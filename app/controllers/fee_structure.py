from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status
from typing import List, Optional
from .. import models, schemas, utils

def create_fee_structure(db: Session, fee_schema: schemas.FeeStructureCreate, current_user_id: int):
    # Check if fee structure for this class and year already exists
    existing = db.query(models.FeeStructure).filter(
        models.FeeStructure.class_id == fee_schema.class_id,
        models.FeeStructure.year == fee_schema.year
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Fee structure for this class and year already exists")

    new_fee = models.FeeStructure(
        **fee_schema.model_dump(),
        created_by_id=current_user_id,
        updated_by_id=current_user_id
    )
    db.add(new_fee)
    db.commit()
    db.refresh(new_fee)
    return new_fee

def get_fee_structures(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.FeeStructure).options(
        joinedload(models.FeeStructure.school_class),
        joinedload(models.FeeStructure.created_by)
    ).offset(skip).limit(limit).all()

def update_fee_structure(db: Session, fee_id: int, fee_schema: schemas.FeeStructureUpdate, current_user_id: int):
    fee = db.query(models.FeeStructure).filter(models.FeeStructure.id == fee_id).first()
    if not fee:
        raise HTTPException(status_code=404, detail="Fee structure not found")
    
    update_data = fee_schema.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(fee, key, value)
    
    fee.updated_by_id = current_user_id
    db.commit()
    db.refresh(fee)
    return fee

def delete_fee_structure(db: Session, fee_id: int):
    fee = db.query(models.FeeStructure).filter(models.FeeStructure.id == fee_id).first()
    if not fee:
        raise HTTPException(status_code=404, detail="Fee structure not found")
    db.delete(fee)
    db.commit()
    return {"message": "Fee structure deleted"}

def get_fee_by_class_and_year(db: Session, class_id: int, year: int):
    fee = db.query(models.FeeStructure).filter(
        models.FeeStructure.class_id == class_id,
        models.FeeStructure.year == year
    ).first()
    if not fee:
        raise HTTPException(status_code=404, detail="Fee structure not found for this class and year")
    return fee
