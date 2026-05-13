from typing import List
from pydantic import BaseModel


class AnalyzeRequest(BaseModel):
    content: str


class Violation(BaseModel):
    flagged_text: str
    policy_reference: str
    explanation: str
    suggested_rewrite: str


class ComplianceResult(BaseModel):
    is_compliant: bool
    violations: List[Violation] = []


class IngestResponse(BaseModel):
    ingested_chunks: int
    message: str
