from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional

class HolidayBase(BaseModel):
    name: str
    date: date
    number_of_days: int = 1

class HolidayCreate(HolidayBase):
    pass

class HolidayUpdate(BaseModel):
    name: Optional[str] = None
    date: Optional[date] = None
    number_of_days: Optional[int] = None

class HolidayOut(HolidayBase):
    id: int
    created_at: datetime
    updated_at: datetime
    created_by_id: Optional[int] = None
    updated_by_id: Optional[int] = None

    class Config:
        from_attributes = True
