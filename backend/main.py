import os
import shutil
import tempfile
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from engine import ingest_document, analyze_text
from schemas import AnalyzeRequest, IngestResponse, ComplianceResult

load_dotenv()

app = FastAPI(title="ComplyLens Backend")

# CORS: allow Gmail and common localhost dev ports
origins = [
    "https://mail.google.com",
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/healthz")
async def healthz():
    return {"status": "ok"}


@app.post("/ingest", response_model=IngestResponse)
async def ingest(file: UploadFile = File(...)):
    # save temporarily
    suffix = os.path.splitext(file.filename)[1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        contents = await file.read()
        tmp.write(contents)
        tmp.flush()
        tmp_path = tmp.name

    try:
        count = ingest_document(tmp_path, file.filename)
        message = f"Ingested {count} chunks from {file.filename}"
        return IngestResponse(ingested_chunks=count, message=message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        try:
            os.unlink(tmp_path)
        except Exception:
            pass


@app.post("/analyze", response_model=ComplianceResult)
async def analyze(req: AnalyzeRequest):
    content = req.content or ""
    if not content.strip():
        # empty content -> immediately compliant
        return ComplianceResult(is_compliant=True, violations=[])

    try:
        result = analyze_text(content)
        return result
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": "LLM failure or internal error"})
