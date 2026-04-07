from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app import controllers, models, schemas
from app.database import get_db
from app.routers.auth import get_current_user

router = APIRouter(prefix="/classes", tags=["Classes"])


@router.post(
    "/", response_model=schemas.SchoolClass, status_code=status.HTTP_201_CREATED
)
def create_class(
    class_schema: schemas.SchoolClassCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return controllers.school_class.add_class(db, class_schema, current_user.id)


@router.get("/", response_model=schemas.SchoolClassList)
def list_classes(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    sort_by: str = "id",
    order: str = "asc",
    search: str | None = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return controllers.school_class.list_classes(
        db, skip, limit, sort_by, order, search
    )


@router.get("/{class_id}", response_model=schemas.SchoolClass)
def get_class(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return controllers.school_class.get_class(db, class_id)


@router.put("/{class_id}", response_model=schemas.SchoolClass)
def update_class(
    class_id: int,
    class_schema: schemas.SchoolClassUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return controllers.school_class.update_class(
        db, class_id, class_schema, current_user.id
    )


@router.delete("/{class_id}")
def delete_class(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return controllers.school_class.delete_class(db, class_id)
