from __future__ import annotations

import json
import re
import uuid
import os
from typing import Optional

from pydantic import BaseModel, Field

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

# Words that always trigger a high-severity flag when present (sensitive identifiers, secrets)
SENSITIVE_WORDS = (
    "ssn",
    "social security",
    "credit card",
    "card number",
    "password",
    "api key",
    "secret",
)


def rewrite_text_for_compliance(text: str, policy_context: str | None = None) -> str:
    lowered = text.lower().strip()
    context = (policy_context or "").strip()

    if not lowered:
        return ""

    if any(token in lowered for token in SENSITIVE_WORDS):
        return "Please remove the sensitive information and share it only through an approved secure channel."

    if any(term in lowered for term in ("customer", "account", "contact details", "email", "vendor", "export")):
        return "Please use the approved secure transfer workflow once the recipient is authorized."

    if any(term in lowered for term in ("salary", "bonus", "compensation", "lpa", "payroll")):
        return "Please review compensation information only through the approved HR system."

    if any(term in lowered for term in ("promise", "guarantee", "refund", "delivery", "commit", "sla")):
        return "Our current target is subject to final confirmation and approved commercial terms."

    if any(term in lowered for term in ("future revenue", "profit", "market performance", "forecast", "growth target")):
        return "Please add the approved finance disclaimer before discussing forward-looking performance."

    if context:
        # Prefer producing a concrete, grammatical rewrite rather than echoing policy text.
        # If the original text contains identifiable sensitive fragments, redact them.
        def _redact_sensitive(s: str) -> str:
            # redact emails
            s = re.sub(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", "[redacted]", s)
            # redact long digit sequences (ids, cards, phone numbers)
            s = re.sub(r"\b\d{4,}\b", "[redacted]", s)
            # redact common tokens like ssn, card numbers already handled above but keep safety
            s = re.sub(r"\b(ssn|social security|credit card|card number|api key|secret)\b", "[redacted]", s, flags=re.IGNORECASE)
            # redact urls
            s = re.sub(r"https?://\S+", "[redacted]", s)
            return s

        def _soften_commitments(s: str) -> str:
            # simple hedging replacements to avoid hard promises while keeping grammar
            s = re.sub(r"\bwe will\b", "we expect to", s, flags=re.IGNORECASE)
            s = re.sub(r"\bI will\b", "I plan to", s, flags=re.IGNORECASE)
            s = re.sub(r"\bwill\b", "may", s, flags=re.IGNORECASE)
            s = re.sub(r"\bguarantee(s|d)?\b", "expect", s, flags=re.IGNORECASE)
            return s

        sanitized = _redact_sensitive(text)
        hedged = _soften_commitments(sanitized)
        # If hedged changed the text or redaction applied, return that as the rewrite (preserves sentence grammar)
        if hedged.strip() and hedged.strip() != text.strip():
            return hedged.strip()

        # As a last resort, provide a short, actionable rewrite that preserves grammar
        return f"Please rephrase this sentence to comply with the referenced policy ({context[:80]})."

    return f"Rewritten for compliance: {text.strip()}"


class LLMViolation(BaseModel):
    model_config = {"extra": "ignore"}

    flagged_text: str = ""
    policy_reference: str = "Policy context"
    explanation: str = ""
    suggested_rewrite: str = ""


class LLMComplianceResult(BaseModel):
    model_config = {"extra": "ignore"}

    is_compliant: bool = False
    violations: list[LLMViolation] = Field(default_factory=list)


def _extract_json(payload: str) -> str | None:
    start = payload.find("{")
    end = payload.rfind("}")
    if start == -1 or end == -1 or end <= start:
        return None
    return payload[start : end + 1]


def _analyze_with_llm(text: str, store: PolicyStore, threshold: float = 0.62) -> Optional[ComplianceReport]:
    """Optional LLM-based analysis using Groq when API key is available.
    
    Integrated from legacy backend for enhanced compliance detection.
    Falls back to None if LLM is unavailable, triggering rule-based analysis.
    """
    try:
        from langchain_groq import ChatGroq
        from langchain_core.output_parsers import PydanticOutputParser
    except ImportError:
        return None
    
    llm_api_key = os.getenv("GROQ_API_KEY")
    if not llm_api_key:
        return None
    
    references = store.retrieve(text, top_k=3)
    contexts = []
    for ref in references:
        md = ref.model_dump(exclude={"score"}) if hasattr(ref, "model_dump") else ref
        ctx = f"Policy: {md.get('policy', 'unknown')} | Section: {md.get('section', 'unknown')}\n{md.get('text', '')}"
        contexts.append(ctx)
    
    try:
        parser = PydanticOutputParser(pydantic_object=LLMComplianceResult)
        format_instructions = parser.get_format_instructions()
        
        policy_context = "\n\n---\n\n".join(contexts) if contexts else "(no policy context available)"
        system_prompt = (
            "You are a strict, zero-tolerance Compliance Officer for a regulated enterprise. "
            "Your job is to identify any language that could expose sensitive data, create legal or financial commitments, "
            "or otherwise violate company policy. Treat single sensitive tokens as violations even if embedded in long text. "
            "Do NOT hallucinate policy text; only flag violations that are clearly supported by the user input or provided policy context. "
            "When in doubt, prefer flagging and provide a concise rationale and suggested rewrite that removes or neutralizes the risky content. "
            "Return strictly valid JSON in the format requested and never include additional prose outside the JSON."
        )
        user_prompt = (
            f"Analyze for compliance violations:\n{text}\n\n"
            f"Policy Context:\n{policy_context}\n\n"
            f"{format_instructions}"
        )
        
        llm = ChatGroq(
            groq_api_key=llm_api_key,
            model_name=os.getenv("GROQ_MODEL_NAME", "llama-3.1-8b-instant"),
            temperature=float(os.getenv("GROQ_TEMPERATURE", "0.1")),
            max_tokens=int(os.getenv("GROQ_MAX_TOKENS", "1024")),
        )
        
        response = llm.invoke(system_prompt + "\n\n" + user_prompt)
        raw_text = response.content if hasattr(response, "content") else str(response)

        try:
            parsed = parser.parse(raw_text)
        except Exception:
            json_text = _extract_json(raw_text)
            if not json_text:
                raise
            parsed = LLMComplianceResult.model_validate_json(json_text)
        
        # Convert ComplianceResult to ComplianceReport
        violations: list[Violation] = []
        if parsed.violations:
            for v in parsed.violations:
                ref = best_reference(references, v.policy_reference)
                violations.append(
                    Violation(
                        id=f"llm-{uuid.uuid4().hex[:8]}",
                        severity="high" if not parsed.is_compliant else "medium",
                        confidence=0.85,
                        quote=v.flagged_text,
                        policyName=ref.policy,
                        policySection=ref.section,
                        ruleText=ref.text,
                        explanation=v.explanation,
                        rewrite=v.suggested_rewrite,
                        citation=ref,
                    )
                )
        
        score = 100 if parsed.is_compliant else max(0, 100 - len(violations) * 30)
        status = "ready" if parsed.is_compliant else "blocked" if len(violations) > 0 else "review"
        
        return ComplianceReport(
            id=f"report-llm-{uuid.uuid4().hex[:10]}",
            score=score,
            cleanSections=1 if parsed.is_compliant else 0,
            flaggedSections=len(violations),
            status=status,
            summary=f"LLM analysis: {len(violations)} issues found." if violations else "LLM analysis: No issues found.",
            source="backend",
            violations=violations,
            references=references,
        )
    except Exception:
        return None


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
    lowered_text = text.lower()

    # Detect high-sensitivity tokens across entire text and immediately flag.
    for token in SENSITIVE_WORDS:
        if re.search(rf"\b{re.escape(token)}\b", lowered_text):
            # find a sentence containing the token for the quote
            quote = next((s for s in sentences if token in s.lower()), token)
            reference = best_reference(references, "Customer Data Handling Standard")
            violations.append(
                Violation(
                    id=f"sensitive-{uuid.uuid4().hex[:8]}",
                    severity="high",
                    confidence=0.99,
                    quote=quote,
                    policyName=reference.policy,
                    policySection=reference.section,
                    ruleText=reference.text,
                    explanation=f"Sensitive data or secret token detected: '{token}'. Do not share secrets in messages.",
                    rewrite="Remove the sensitive token and use secure channels for secret exchange.",
                    citation=reference,
                )
            )
            # Immediately return a blocked report when sensitive data is found
            return ComplianceReport(
                id=f"report-{uuid.uuid4().hex[:10]}",
                score=0,
                cleanSections=0,
                flaggedSections=len(violations),
                status="blocked",
                summary=f"Sensitive token '{token}' detected. Redacted for security.",
                source="backend",
                violations=violations,
                references=references,
            )
    lowered_sentences = [(sentence, sentence.lower()) for sentence in sentences]
    flagged_sentences: set[str] = set()
    
    # Try LLM analysis first if available and not explicitly disabled.
    llm_disabled = os.getenv("ENABLE_LLM_ANALYSIS", "true").lower() in ("false", "0", "no")
    if not llm_disabled:
        llm_report = _analyze_with_llm(text, store, threshold)
        if llm_report:
            return llm_report

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
