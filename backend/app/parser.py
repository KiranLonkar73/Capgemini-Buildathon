from __future__ import annotations

from io import BytesIO

from fastapi import UploadFile


async def extract_text_from_upload(file: UploadFile) -> str:
    data = await file.read()
    filename = (file.filename or "").lower()

    if filename.endswith(".txt"):
        return data.decode("utf-8", errors="replace")

    if filename.endswith(".pdf"):
        try:
            from pypdf import PdfReader
        except ImportError as exc:  # pragma: no cover - dependency guard
            raise RuntimeError("PDF parsing requires pypdf. Install backend/requirements.txt.") from exc

        reader = PdfReader(BytesIO(data))
        return "\n\n".join(page.extract_text() or "" for page in reader.pages).strip()

    if filename.endswith(".docx"):
        try:
            from docx import Document
        except ImportError as exc:  # pragma: no cover - dependency guard
            raise RuntimeError("DOCX parsing requires python-docx. Install backend/requirements.txt.") from exc

        document = Document(BytesIO(data))
        return "\n".join(paragraph.text for paragraph in document.paragraphs).strip()

    raise ValueError("Unsupported file type. Upload PDF, DOCX, or TXT.")
