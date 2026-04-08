from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app import controllers, database, schemas

from .auth import get_current_user

router = APIRouter(prefix="/fee-structure", tags=["Fee Structure"])


@router.post(
    "/", response_model=schemas.FeeStructure, status_code=status.HTTP_201_CREATED
)
def create_fee_structure(
    fee_schema: schemas.FeeStructureCreate,
    db: Session = Depends(database.get_db),
    current_user: schemas.UserOut = Depends(get_current_user),
):
    return controllers.fee_structure.create_fee_structure(
        db, fee_schema, current_user.id
    )


@router.get("/", response_model=list[schemas.FeeStructureDetailed])
def get_fee_structures(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(database.get_db),
    current_user: schemas.UserOut = Depends(get_current_user),
):
    return controllers.fee_structure.get_fee_structures(db, skip, limit)


@router.put("/{fee_id}", response_model=schemas.FeeStructure)
def update_fee_structure(
    fee_id: int,
    fee_schema: schemas.FeeStructureUpdate,
    db: Session = Depends(database.get_db),
    current_user: schemas.UserOut = Depends(get_current_user),
):
    return controllers.fee_structure.update_fee_structure(
        db, fee_id, fee_schema, current_user.id
    )


@router.delete("/{fee_id}")
def delete_fee_structure(
    fee_id: int,
    db: Session = Depends(database.get_db),
    current_user: schemas.UserOut = Depends(get_current_user),
):
    return controllers.fee_structure.delete_fee_structure(db, fee_id)


@router.get("/by-class/{class_id}/{year}", response_model=schemas.FeeStructure)
def get_fee_by_class_and_year(
    class_id: int,
    year: int,
    db: Session = Depends(database.get_db),
    current_user: schemas.UserOut = Depends(get_current_user),
):
    return controllers.fee_structure.get_fee_by_class_and_year(db, class_id, year)
