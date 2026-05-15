from __future__ import annotations

import re
import uuid

from .models import ComplianceReport, PolicyReference, Severity, Violation
from .policy_store import PolicyStore


PATTERNS = [
    {
        "id": "customer-data",
        "severity": "high",
        "keywords": ("customer", "account id", "account ids", "contact details", "email", "vendor", "export"),
        "policy_hint": "Customer Data Handling Standard",
        "explanation": "The draft appears to share customer identifiers or personal data through an unapproved external channel.",
        "rewrite": "Please share the approved secure transfer link with the vendor after access is authorized.",
    },
    {
        "id": "legal-commitment",
        "severity": "medium",
        "keywords": ("promise", "guarantee", "refund", "delivery", "commit", "sla"),
        "policy_hint": "Commercial Communications Policy",
        "explanation": "The draft creates a written commitment, guarantee, or refund position that needs legal approval.",
        "rewrite": "Our current target is subject to final confirmation and approved commercial terms.",
    },
    {
        "id": "compensation",
        "severity": "high",
        "keywords": ("salary", "bonus", "compensation", "lpa", "payroll"),
        "policy_hint": "HR Confidentiality Handbook",
        "explanation": "The draft exposes employee compensation details in written communication.",
        "rewrite": "Please review compensation information only through the approved HR system.",
    },
    {
        "id": "forecast",
        "severity": "medium",
        "keywords": ("future revenue", "profit", "market performance", "forecast", "growth target"),
        "policy_hint": "Forward-Looking Statements Guide",
        "explanation": "The draft discusses future financial performance without the approved finance disclaimer.",
        "rewrite": "Please add the approved finance disclaimer before discussing forward-looking performance.",
    },
]

POLICY_MATCH_MIN_SCORE = 0.22


def split_sentences(text: str) -> list[str]:
    candidates = re.split(r"(?<=[.!?])\s+|\n+", text)
    return [candidate.strip() for candidate in candidates if candidate.strip()]


def best_reference(references: list[PolicyReference], policy_hint: str) -> PolicyReference:
    for reference in references:
        if reference.policy == policy_hint:
            return reference
    if references:
        return references[0]
    return PolicyReference(
        id="unmatched",
        policy=policy_hint,
        section="Policy context",
        owner="Compliance",
        text="No uploaded policy chunk matched. Upload company policies for stronger citations.",
        score=0,
    )


def severity_for_reference(reference: PolicyReference) -> Severity:
    high_markers = ("confidential", "privacy", "security", "customer", "credential", "salary", "compensation")
    marker_text = f"{reference.policy} {reference.section}".lower()
    return "high" if any(marker in marker_text for marker in high_markers) else "medium"


def analyze_text(text: str, store: PolicyStore, threshold: float = 0.62) -> ComplianceReport:
    sentences = split_sentences(text)
    violations: list[Violation] = []
    references = store.retrieve(text, top_k=8)
    lowered_sentences = [(sentence, sentence.lower()) for sentence in sentences]
    flagged_sentences: set[str] = set()

    for pattern in PATTERNS:
        hits: list[str] = []
        for sentence, lowered in lowered_sentences:
            if any(keyword in lowered for keyword in pattern["keywords"]):
                hits.append(sentence)

        if not hits:
            continue

        quote = max(hits, key=len)
        reference = best_reference(references, pattern["policy_hint"])
        keyword_hits = sum(1 for keyword in pattern["keywords"] if keyword in quote.lower())
        retrieval_boost = min(reference.score, 0.22)
        confidence = min(0.98, 0.58 + keyword_hits * 0.08 + retrieval_boost)

        if confidence < threshold:
            continue

        violations.append(
            Violation(
                id=f"{pattern['id']}-{uuid.uuid4().hex[:8]}",
                severity=pattern["severity"],
                confidence=round(confidence, 2),
                quote=quote,
                policyName=reference.policy,
                policySection=reference.section,
                ruleText=reference.text,
                explanation=pattern["explanation"],
                rewrite=pattern["rewrite"],
                citation=reference,
            )
        )
        flagged_sentences.add(quote)

    # Policy chunk matching: use uploaded policies to flag semantically similar sentences
    for sentence in sentences:
        if sentence in flagged_sentences:
            continue
        sentence_refs = store.retrieve(sentence, top_k=1)
        if not sentence_refs:
            continue
        reference = sentence_refs[0]
        if reference.score < POLICY_MATCH_MIN_SCORE:
            continue

        confidence = min(0.96, 0.5 + reference.score * 1.1)
        violations.append(
            Violation(
                id=f"policy-match-{uuid.uuid4().hex[:8]}",
                severity=severity_for_reference(reference),
                confidence=round(confidence, 2),
                quote=sentence,
                policyName=reference.policy,
                policySection=reference.section,
                ruleText=reference.text,
                explanation=(
                    f"This sentence appears to overlap with policy guidance in {reference.policy} ({reference.section})."
                ),
                rewrite="Please align this statement with the policy guidance or remove sensitive details.",
                citation=reference,
            )
        )
        flagged_sentences.add(sentence)

    flagged = len(violations)
    clean = max(0, len(sentences) - flagged)
    score = max(0, min(100, 100 - flagged * 22 - sum(1 for violation in violations if violation.severity in {"high", "critical"}) * 8))
    status = "blocked" if any(violation.severity in {"high", "critical"} for violation in violations) else "review" if flagged else "ready"

    return ComplianceReport(
        id=f"report-{uuid.uuid4().hex[:10]}",
        score=score,
        cleanSections=clean,
        flaggedSections=flagged,
        status=status,
        summary=(
            f"{flagged} policy issue{'s' if flagged != 1 else ''} detected using {len(references)} retrieved policy references."
            if flagged
            else f"No policy issues detected using {len(references)} retrieved policy references."
        ),
        source="backend",
        violations=violations,
        references=references,
    )
