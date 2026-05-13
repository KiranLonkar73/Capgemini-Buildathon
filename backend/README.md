# ComplyLens Backend

This folder contains a FastAPI backend for the ComplyLens project.

Quick start (from this directory):

1. Create a virtualenv and install requirements:

```bash
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
```

2. Set environment variables (example in `.env`):

```
GROQ_API_KEY=your_groq_api_key_here
```

3. Run the app:

```bash
uvicorn main:app --reload --port 8000
```
