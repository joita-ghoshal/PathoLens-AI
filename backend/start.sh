#!/bin/bash
set -e

echo "Running database migrations..."
python -c "from app.core.database import engine, Base; Base.metadata.create_all(bind=engine)"

echo "Seeding database (expanded)..."
python seed_expanded.py || python seed.py

echo "Starting server..."
exec uvicorn main:app --host 0.0.0.0 --port $PORT
