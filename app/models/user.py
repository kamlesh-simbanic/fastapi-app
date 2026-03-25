from sqlalchemy import Column, Integer, String, Boolean
from ..database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True)
    email = Column(String(255), unique=True, index=True)
    mobile = Column(String(20), unique=True, index=True)
    hashed_password = Column(String(255))
    is_active = Column(Boolean, default=True)
