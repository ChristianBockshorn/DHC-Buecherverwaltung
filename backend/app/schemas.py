# backend/app/schemas.py
from datetime import date
from pydantic import BaseModel

class BookBase(BaseModel):
    title:  str
    author: str
    created: date | None = None
    creator: str | None = None

class BookCreate(BookBase):
    pass                     # alles Pflicht außer created/creator

class BookUpdate(BookBase):
    title:  str | None = None
    author: str | None = None

class BookRead(BookBase):
    id: int

    class Config:
        orm_mode = True      # erlaubt Rückgabe von SQLAlchemy-Objekten
