from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


Severity = Literal["low", "medium", "high", "critical"]


class PolicyReference(BaseModel):
    id: str
    policy: str
    section: str
    owner: str
    text: str
    score: float = 0


class Violation(BaseModel):
    id: str
    severity: Severity
    confidence: float = Field(ge=0, le=1)
    quote: str
    policyName: str
    policySection: str
    ruleText: str
    explanation: str
    rewrite: str
    citation: PolicyReference
    status: Literal["open", "dismissed", "safe", "resolved"] = "open"


class ComplianceReport(BaseModel):
    id: str
    score: int = Field(ge=0, le=100)
    cleanSections: int
    flaggedSections: int
    status: Literal["ready", "review", "blocked"]
    summary: str
    source: Literal["backend"]
    violations: list[Violation]
    references: list[PolicyReference]


class AnalyzeRequest(BaseModel):
    text: str
    documentName: str | None = None
    organizationId: str = "demo-org"
    threshold: float = Field(default=0.62, ge=0, le=1)


class RewriteRequest(BaseModel):
    text: str
    violationId: str | None = None
    policyContext: str | None = None


class RewriteResponse(BaseModel):
    rewrite: str


class CompanySettings(BaseModel):
    organizationId: str = "demo-org"
    organizationName: str = "Demo Enterprise"
    threshold: float = Field(default=0.62, ge=0, le=1)
    activePolicySet: str = "seeded-enterprise-policy"


class HealthResponse(BaseModel):
    ok: bool
    service: str
    policy_chunks: int
