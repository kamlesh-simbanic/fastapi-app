from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from datetime import timedelta
from jose import jwt, JWTError

from .. import models, schemas, utils
from ..database import get_db

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
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
    def dependency(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
        # Check if user is staff and has allowed department
        staff = db.query(models.Staff).filter(models.Staff.user_id == current_user.id).first()
        
        # If user is admin (department 'admin'), they might have access to more areas
        # But we will follow the allowed_departments list strictly
        if not staff or staff.department not in allowed_departments:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this resource"
            )
        return current_user
    return dependency

@router.post("/register", response_model=schemas.AuthResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check for duplicate email
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check for duplicate mobile
    db_user_mobile = db.query(models.User).filter(models.User.mobile == user.mobile).first()
    if db_user_mobile:
        raise HTTPException(status_code=400, detail="Mobile already registered")

    # Hash password
    hashed_password = utils.get_password_hash(user.password)
    
    # Create user
    new_user = models.User(
        name=user.name,
        email=user.email,
        mobile=user.mobile,
        hashed_password=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create access token
    # Check if this user is a staff member (unlikely on registration, but for consistency)
    staff = db.query(models.Staff).filter(models.Staff.user_id == new_user.id).first()
    token_data = {"sub": new_user.email}
    if staff:
        token_data["department"] = staff.department.value

    access_token = utils.create_access_token(data=token_data)
    
    return {
        "user": new_user,
        "token": {"access_token": access_token, "token_type": "bearer"}
    }

@router.get("/me", response_model=schemas.UserOut)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@router.post("/login", response_model=schemas.AuthResponse)
def login(user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == user_credentials.email).first()
    
    if not user or not utils.verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=utils.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Check if user is staff to include department in token
    staff = db.query(models.Staff).filter(models.Staff.user_id == user.id).first()
    token_data = {"sub": user.email, "user_id": user.id}
    if staff:
        token_data["department"] = staff.department.value

    access_token = utils.create_access_token(
        data=token_data, expires_delta=access_token_expires
    )
    
    return {
        "user": user,
        "token": { "access_token": access_token, "token_type": "bearer" }
    }
