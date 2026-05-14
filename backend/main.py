"""Compatibility entrypoint for local uvicorn commands.

This module intentionally re-exports the canonical FastAPI app so that both:
- `python -m uvicorn main:app --reload --port 8000` (from backend/)
- `python -m uvicorn backend.app.main:app --reload --port 8000` (from repo root)

serve the same routes.
"""

from app.main import app

__all__ = ["app"]
