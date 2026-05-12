from __future__ import annotations

import logging

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from .analyzer import analyze_text
from .models import AnalyzeRequest, CompanySettings, HealthResponse, RewriteRequest, RewriteResponse
from .parser import extract_text_from_upload
from .policy_store import PolicyStore


logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("complylens")

app = FastAPI(title="ComplyLens API", version="0.1.0")
store = PolicyStore()
settings = CompanySettings()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "chrome-extension://*"],
    allow_origin_regex=r"chrome-extension://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(ok=True, service="complylens-api", policy_chunks=store.chunk_count)


@app.post("/settings/company", response_model=CompanySettings)
def update_company(payload: CompanySettings) -> CompanySettings:
    global settings
    settings = payload
    logger.info("updated company settings organization=%s threshold=%s", payload.organizationId, payload.threshold)
    return settings


@app.post("/upload-policy")
async def upload_policy(
    file: UploadFile = File(...),
    policy_name: str = Form("Uploaded Company Policy"),
    section: str = Form("Company policy"),
    owner: str = Form("Compliance"),
):
    try:
        text = await extract_text_from_upload(file)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    if not text.strip():
        raise HTTPException(status_code=400, detail="Uploaded policy did not contain extractable text.")

    references = store.add_policy_text(text=text, policy=policy_name, section=section, owner=owner)
    logger.info("uploaded policy file=%s chunks=%s total=%s", file.filename, len(references), store.chunk_count)
    return {"uploaded": True, "chunks": len(references), "references": references}


@app.post("/analyze")
def analyze(payload: AnalyzeRequest):
    if not payload.text.strip():
        raise HTTPException(status_code=400, detail="Text is required for analysis.")
    report = analyze_text(payload.text, store, payload.threshold)
    logger.info(
        "analysis document=%s score=%s violations=%s",
        payload.documentName or "untitled",
        report.score,
        report.flaggedSections,
    )
    return report


@app.post("/analyze-upload")
async def analyze_upload(file: UploadFile = File(...), threshold: float = Form(0.62)):
    try:
        text = await extract_text_from_upload(file)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    if not text.strip():
        raise HTTPException(status_code=400, detail="Uploaded document did not contain extractable text.")

    report = analyze_text(text, store, threshold)
    logger.info("upload analysis document=%s score=%s violations=%s", file.filename, report.score, report.flaggedSections)
    return {"text": text, "report": report}


@app.post("/rewrite", response_model=RewriteResponse)
def rewrite(payload: RewriteRequest) -> RewriteResponse:
    text = payload.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text is required for rewrite.")

    context = (payload.policyContext or "").strip()
    if "customer" in text.lower() or "account" in text.lower():
        rewrite_text = "Please use the approved secure transfer workflow once the recipient is authorized."
    elif "salary" in text.lower() or "compensation" in text.lower():
        rewrite_text = "Please review compensation information only in the approved HR system."
    elif "guarantee" in text.lower() or "promise" in text.lower() or "refund" in text.lower():
        rewrite_text = "Our current target remains subject to final confirmation and approved commercial terms."
    else:
        rewrite_text = f"Rewritten for compliance: {text}"

    if context:
        rewrite_text = f"{rewrite_text} Policy basis: {context[:140]}"

    return RewriteResponse(rewrite=rewrite_text)
