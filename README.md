# ComplyLens Policy Compliance Checker

Enterprise AI compliance copilot for scanning documents and Gmail drafts against company policy.

## Current Scope

- `apps/web`: React/Vite routed SaaS UI with landing page, auth screens, dashboard, policies, extension, and settings.
- `apps/extension`: Manifest V3 Chrome extension popup and Gmail content script that call the backend analysis API.
- `packages/shared`: shared report types, seeded policy data, fallback checker, and rewrite utilities.
- `backend`: FastAPI service for policy upload, document parsing, retrieval-backed analysis, rewrites, settings, and health checks.

## Commands

```bash
npm install
npm run dev:web
npm run build
```

Backend:

```bash
python3 -m pip install -r backend/requirements.txt
python3 -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```

The backend currently uses deterministic local policy retrieval and rule-based analysis so the product works without an external LLM key. Provider embeddings/LLM calls can be added behind the same API contract.
