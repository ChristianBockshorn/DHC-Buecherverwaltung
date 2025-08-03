# backend/app/seed.py
from datetime import date
from sqlalchemy.orm import Session
from .models import Book

SAMPLE: list[dict] = [
    
    {"title": "Clean Code",                      "author": "Robert C. Martin",
        "created": date(2008, 8, 1),   "creator": "Seeder"},
    {"title": "The Pragmatic Programmer",        "author": "Andrew Hunt, David Thomas",
        "created": date(1999, 10, 30),   "creator": "Seeder"},
    {"title": "Refactoring",                     "author": "Martin Fowler",
        "created": date(1999, 7, 8),   "creator": "Seeder"},
    {"title": "Design Patterns",                 "author": "Erich Gamma et al.",
        "created": date(1994, 10, 21),   "creator": "Seeder"},
    {"title": "Domain-Driven Design",            "author": "Eric Evans",
        "created": date(2003, 8, 30),   "creator": "Seeder"},
    {"title": "Working Effectively with Legacy Code", "author": "Michael C. Feathers",
        "created": date(2004, 9, 22),   "creator": "Seeder"},
    {"title": "Continuous Delivery",             "author": "Jez Humble, David Farley",
        "created": date(2010, 7, 27),   "creator": "Seeder"},
    {"title": "The Mythical Man-Month",          "author": "Frederick P. Brooks Jr.",
        "created": date(1975, 1, 1),   "creator": "Seeder"},
    {"title": "Peopleware",                      "author": "Tom DeMarco, Tim Lister",
        "created": date(1987, 6, 1),   "creator": "Seeder"},
    {"title": "Introduction to Algorithms",      "author": "Cormen et al.",
        "created": date(1990, 9, 15),   "creator": "Seeder"},
    {"title": "Structure and Interpretation of Computer Programs",
        "author": "Abelson, Sussman", "created": date(1985, 1, 15), "creator": "Seeder"},
    {"title": "Code Complete",                   "author": "Steve McConnell",
        "created": date(1993, 6, 9),   "creator": "Seeder"},
    {"title": "Head First Design Patterns",      "author": "Eric Freeman et al.",
        "created": date(2004, 10, 25),   "creator": "Seeder"},
    {"title": "Patterns of Enterprise Application Architecture",
        "author": "Martin Fowler", "created": date(2002, 11, 15),  "creator": "Seeder"},
    {"title": "Effective Java",                  "author": "Joshua Bloch",
        "created": date(2001, 5, 8),   "creator": "Seeder"},
    {"title": "You Don't Know JS (Yet)",         "author": "Kyle Simpson",
     "created": date(2020, 1, 1),   "creator": "Seeder"},
    {"title": "Grokking Algorithms",             "author": "Aditya Bhargava",
        "created": date(2016, 5, 30),   "creator": "Seeder"},
    {"title": "Clean Architecture",              "author": "Robert C. Martin",
        "created": date(2017, 9, 20),   "creator": "Seeder"},
    {"title": "Clean Coder",                     "author": "Robert C. Martin",
        "created": date(2011, 5, 13),   "creator": "Seeder"},
    {"title": "Software Engineering at Google",  "author": "Titus Winters et al.",
        "created": date(2020, 3, 23),   "creator": "Seeder"},
    {"title": "Accelerate",                      "author": "Forsgren, Humble, Kim",
        "created": date(2018, 3, 27),   "creator": "Seeder"},
    {"title": "Site Reliability Engineering",    "author": "Beyer et al.",
        "created": date(2016, 3, 23),   "creator": "Seeder"},
    {"title": "Release It!",                     "author": "Michael T. Nygard",
        "created": date(2007, 1, 30),   "creator": "Seeder"},
    {"title": "Designing Data-Intensive Applications", "author": "Martin Kleppmann",
        "created": date(2017, 4, 2),   "creator": "Seeder"},
    {"title": "Kubernetes in Action",            "author": "Marko Luksa",
        "created": date(2017, 12, 5),   "creator": "Seeder"},
    {"title": "Python Crash Course",             "author": "Eric Matthes",
        "created": date(2015, 11, 1),   "creator": "Seeder"},
    {"title": "Automate the Boring Stuff with Python", "author": "Al Sweigart",
        "created": date(2015, 4, 1),   "creator": "Seeder"},
    {"title": "Introduction to Machine Learning with Python",
        "author": "Müller, Guido", "created": date(2016, 10, 1),   "creator": "Seeder"},
    {"title": "Hands-On Machine Learning with Scikit-Learn, Keras & TensorFlow",
        "author": "Aurélien Géron", "created": date(2017, 3, 13), "creator": "Seeder"},
    {"title": "Deep Learning",                   "author": "Goodfellow, Bengio, Courville",
        "created": date(2016, 11, 18), "creator": "Seeder"},
]


def run(db: Session):
    """Nur einfügen, wenn noch keine Bücher vorhanden sind."""
    if db.query(Book).count() == 0:
        db.bulk_insert_mappings(Book, SAMPLE)
        db.commit()
