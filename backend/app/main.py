# backend/app/main.py
from .seed import run as seed_db
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .database import Base, engine, get_db, SessionLocal
from datetime import date
from fastapi import Query
from . import crud, schemas
from .models import Book
from sqlalchemy import or_
from .seed import run as seed_db


# Tabellenerzeugung beim Start
Base.metadata.create_all(bind=engine)

with SessionLocal() as s:
    seed_db(s)

app = FastAPI(title="Books API")
origins = [
    "http://localhost:8080",   # UI5-Dev-Server
    "http://127.0.0.1:8080"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/books", response_model=list[schemas.BookRead])
def list_books(
    q: str | None = Query(None),
    created_from: date | None = Query(None),
    created_to:   date | None = Query(None),
    db: Session = Depends(get_db),
):
    stm = db.query(Book)

    # Textsuche
    if q:
        like = f"%{q.lower()}%"
        stm = stm.filter(or_(
            Book.title.ilike(like),
            Book.author.ilike(like),
            Book.creator.ilike(like)
        ))

    # Datumsfilter
    if created_from:
        stm = stm.filter(Book.created >= created_from)
    if created_to:
        stm = stm.filter(Book.created <= created_to)

    return stm.all()


@app.post("/books", response_model=schemas.BookRead, status_code=status.HTTP_201_CREATED)
def add_book(book: schemas.BookCreate, db: Session = Depends(get_db)):
    return crud.create(db, book)


@app.get("/books/{book_id}", response_model=schemas.BookRead)
def read_book(book_id: int, db: Session = Depends(get_db)):
    obj = crud.get_one(db, book_id)
    if not obj:
        raise HTTPException(404, "Book not found")
    return obj


@app.patch("/books/{book_id}", response_model=schemas.BookRead)
def edit_book(book_id: int, book: schemas.BookUpdate, db: Session = Depends(get_db)):
    obj = crud.update(db, book_id, book)
    if not obj:
        raise HTTPException(404, "Book not found")
    return obj


@app.delete("/books/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_book(book_id: int, db: Session = Depends(get_db)):
    obj = crud.delete(db, book_id)
    if not obj:
        raise HTTPException(404, "Book not found")
