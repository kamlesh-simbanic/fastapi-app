from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import timedelta

from .. import models, schemas, utils

def register_user(db: Session, user_schema: schemas.UserCreate):
    # Check for duplicate email
    db_user = db.query(models.User).filter(models.User.email == user_schema.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check for duplicate mobile
    db_user_mobile = db.query(models.User).filter(models.User.mobile == user_schema.mobile).first()
    if db_user_mobile:
        raise HTTPException(status_code=400, detail="Mobile already registered")

    # Hash password
    hashed_password = utils.get_password_hash(user_schema.password)
    
    # Create user
    new_user = models.User(
        name=user_schema.name,
        email=user_schema.email,
        mobile=user_schema.mobile,
        hashed_password=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create access token
    staff = db.query(models.Staff).filter(models.Staff.user_id == new_user.id).first()
    token_data = {"sub": new_user.email}
    if staff:
        token_data["department"] = staff.department.value

    access_token = utils.create_access_token(data=token_data)
    
    return {
        "user": new_user,
        "token": {"access_token": access_token, "token_type": "bearer"}
    }

def login_user(db: Session, user_credentials: schemas.UserLogin):
    user = db.query(models.User).filter(models.User.email == user_credentials.email).first()
    print(user)
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
