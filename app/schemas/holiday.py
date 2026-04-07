import datetime

from pydantic import BaseModel


class HolidayBase(BaseModel):
    name: str
    date: datetime.date
    number_of_days: int = 1


class HolidayCreate(HolidayBase):
    pass


class HolidayUpdate(BaseModel):
    name: str | None = None
    date: datetime.date | None = None
    number_of_days: int | None = None


class HolidayOut(HolidayBase):
    id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime
    created_by_id: int | None = None
    updated_by_id: int | None = None

    class Config:
        from_attributes = True
