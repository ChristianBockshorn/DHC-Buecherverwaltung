# backend/app/crud.py
from sqlalchemy.orm import Session
from . import models, schemas

def get_all(db: Session):
    # SELECT * FROM books
    return db.query(models.Book).all()

def get_one(db: Session, book_id: int):
    # SQLAlchemy 2.0: primär über Session.get()
    return db.get(models.Book, book_id)

def create(db: Session, data: schemas.BookCreate):
    obj = models.Book(**data.model_dump())  # Pydantic v2
    db.add(obj)
    db.commit()      # flush + commit
    db.refresh(obj)  # z.B. id aus DB holen
    return obj

def update(db: Session, book_id: int, data: schemas.BookUpdate):
    obj = db.get(models.Book, book_id)
    if not obj:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(obj, field, value)
    db.commit()
    db.refresh(obj)
    return obj

def delete(db: Session, book_id: int):
    obj = db.get(models.Book, book_id)
    if not obj:
        return None
    db.delete(obj)
    db.commit()
    return obj
