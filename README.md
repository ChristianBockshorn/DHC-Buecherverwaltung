# DHC Bücherverwaltung (OpenUI5 + FastAPI + SQLite + Docker)

Full‑Stack Demo zur Verwaltung einer Bücherliste. Frontend in **OpenUI5** (Dialoge, Suche, Filter, Sortierung, CSV‑Export, Paginierung), Backend in **FastAPI** mit **SQLAlchemy** und **SQLite**. Containerisiert mit **Docker Compose**.

> **Kurzstart:** `docker compose up --build` → UI: [http://localhost:8080](http://localhost:8080) · API/Swagger: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## Features

* Bücherliste (ID, Titel, Autor, **Angelegt am**, **Angelegt von**)
* Anlegen / Bearbeiten / Löschen (Dialoge, Confirm bei Delete)
* Suche (`q` über Titel/Autor/Creator) + Datumsfilter (`created_from`, `created_to`)
* Sortieren 
* CSV‑Export
* **20 Einträge pro Seite**
* Seed‑Daten beim ersten Start
* Docker Compose: Frontend & Backend in Containern, SQLite als Datei

---

## Architektur (kurz)

* **Frontend:** OpenUI5 (DynamicPage, Responsive Table, Fragments/Dialogs)
* **Backend:** FastAPI, SQLAlchemy 2.x, Pydantic v2
* **DB:** SQLite (Datei `backend/books.db`, wird automatisch erstellt & geseedet)

---

## Schnellstart mit Docker

```bash
# 1) Repo klonen
git clone https://github.com/ChristianBockshorn/DHC-Buecherverwaltung.git
cd DHC-Buecherverwaltung

# 2) Alles bauen & starten
docker compose up --build

# 3) Aufrufen
# UI:   http://localhost:8080
# API:  http://localhost:8000/docs
```

**Stoppen:** Terminal mit `CTRL+C`, danach optional `docker compose down`.

### Ports ändern (falls belegt)

In `docker-compose.yml` **linke Seite** anpassen:

```yaml
backend:  ports: ["8010:8000"]  # Host 8010 → Container 8000
frontend: ports: ["8081:8080"]  # Host 8081 → Container 8080
```

> Wenn der Backend‑Hostport geändert wird (z. B. `8010`), im Frontend die API‑Basis einmalig auf `http://localhost:8010` setzen.

### Hot‑Reload (optional, Backend)

In `docker-compose.yml` aktivieren:

```yaml
backend:
  command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
  volumes:
    - ./backend:/app
```

---

## Ohne Docker (Fallback)

**Backend**

```bash
cd backend
python -m venv .venv
# Windows
.\.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend**

```bash
cd frontend
npm ci
npm start
```

Aufrufe: UI [http://localhost:8080](http://localhost:8080) · API [http://localhost:8000](http://localhost:8000).

---

## Nützliche Befehle

```bash
# Start (erstmalig oder nach Dockerfile/Deps‑Änderung)
docker compose up --build
# Start (ohne Rebuild)
docker compose up
# Stoppen
docker compose down
# Logs
docker compose logs -f backend
docker compose logs -f frontend
# Neu bauen einzelner Services
docker compose build backend
docker compose build frontend
```

### Datenbank zurücksetzen (Reseed)

```bash
docker compose down
# Windows PowerShell
Remove-Item -Force backend\books.db
# macOS/Linux
rm -f backend/books.db

docker compose up --build
```

---

## Troubleshooting (kurz)

* **UI lädt, API 8000 nicht erreichbar** → `docker compose logs -f backend` prüfen; Port evtl. belegt → Hostport ändern (`8010:8000`).
* **CORS‑Fehler** → Frontend muss `http://localhost:<PORT>` nutzen; Backend‑CORS erlaubt localhost/127.0.0.1.
* **Port bereits in Verwendung** → Hostport in Compose ändern und API‑Basis im Frontend anpassen.

---

## Lizenz

MIT (oder interne Firmenlizenz hier eintragen).
