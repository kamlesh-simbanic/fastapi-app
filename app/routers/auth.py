from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app import controllers, models, schemas, utils
from app.database import get_db

router = APIRouter(prefix="/auth", tags=["auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, utils.SECRET_KEY, algorithms=[utils.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    return user


def check_access(allowed_departments: list[models.Department]):
    def dependency(
        current_user: models.User = Depends(get_current_user),
        db: Session = Depends(get_db),
    ):
        # Check if user is staff and has allowed department
        staff = (
            db.query(models.Staff)
            .filter(models.Staff.user_id == current_user.id)
            .first()
        )
        print(staff)
        if staff is None:
            return current_user
        # If user is admin (department 'admin'), they might have access to more areas
        # But we will follow the allowed_departments list strictly
        if not staff or staff.department not in allowed_departments:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this resource",
            )
        return current_user

    return dependency


@router.post("/register", response_model=schemas.AuthResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    return controllers.auth.register_user(db, user)


@router.get("/me", response_model=schemas.UserOut)
def get_me(
    current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)
):
    staff = (
        db.query(models.Staff).filter(models.Staff.user_id == current_user.id).first()
    )
    if staff:
        current_user.department = staff.department.value
    return current_user


@router.post("/login", response_model=schemas.AuthResponse)
def login(user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    return controllers.auth.login_user(db, user_credentials)
