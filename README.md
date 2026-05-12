# ComplyLens Policy Compliance Checker

Frontend-first monorepo for a policy compliance checker web app plus Gmail Chrome extension.

## Current Scope

- `apps/web`: premium React/Vite dashboard UI for policy upload, document checking, violation review, rewrites, and audit trail.
- `apps/extension`: Chrome extension popup and Gmail content-script shell that will later call the same backend API.
- `packages/shared`: shared mock data, types, and lightweight demo checker helpers used by both surfaces.

## Commands

```bash
npm install
npm run dev:web
npm run build
```

Backend, RAG, LLM, persistence, and real Gmail API integration are intentionally deferred until the frontend structure is approved.
