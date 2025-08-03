FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Abhängigkeiten installieren
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Quellcode
COPY . .

EXPOSE 8000
# Für Entwicklung ggf. --reload per compose (siehe unten)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
