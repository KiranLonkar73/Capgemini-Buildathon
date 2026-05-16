import { demoReport } from "./demoData";
import type { ComplianceReport, Severity, Violation } from "./types";

export function severityLabel(severity: Severity) {
  return severity.charAt(0).toUpperCase() + severity.slice(1);
}

export function runDemoComplianceCheck(text: string): ComplianceReport {
  const lowered = text.toLowerCase();
  const violations = demoReport.violations.filter((violation) => {
    if (violation.id === "v-1") return /account|customer|contact|vendor|email/.test(lowered);
    if (violation.id === "v-2") return /promise|guarantee|refund|delivery/.test(lowered);
    if (violation.id === "v-3") return /salary|bonus|compensation|lpa/.test(lowered);
    return false;
  });

  const flaggedSections = violations.length;
  const cleanSections = Math.max(1, text.split(/\n\s*\n/).length - flaggedSections);
  const score = Math.max(18, Math.round((cleanSections / (cleanSections + flaggedSections)) * 100));

  return {
    id: `local-${Date.now()}`,
    score,
    cleanSections,
    flaggedSections,
    status: flaggedSections > 1 ? "blocked" : flaggedSections === 1 ? "review" : "ready",
    summary:
      flaggedSections > 0
        ? `${flaggedSections} seeded demo policy signals were detected. Run the backend for uploaded company policies.`
        : "No seeded demo policy signals were detected.",
    source: "local-demo",
    references: demoReport.references,
    violations
  };
}

export function applyRewrite(text: string, violation: Violation) {
  const quote = violation.quote.trim();
  const rewrite = violation.rewrite.trim();
  if (!quote || !rewrite) return text;

  const normalized = (value: string) => value.replace(/\s+/g, " ").trim();
  const exactIndex = text.indexOf(quote);
  if (exactIndex >= 0) {
    return text.slice(0, exactIndex) + rewrite + text.slice(exactIndex + quote.length);
  }

  const caseInsensitiveIndex = text.toLowerCase().indexOf(quote.toLowerCase());
  if (caseInsensitiveIndex >= 0) {
    return text.slice(0, caseInsensitiveIndex) + rewrite + text.slice(caseInsensitiveIndex + quote.length);
  }

  // Fuzzy lookup: match by normalized whitespace and punctuation-free tokens.
  const quoteTokens = normalized(quote)
    .toLowerCase()
    .split(/\s+/)
    .filter((token) => token.length > 1)
    .map((token) => token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

  if (!quoteTokens.length) return text;

  const quotePattern = quoteTokens.join("[^\p{L}\p{N}]+") || quoteTokens.join("\\s+");
  const regex = new RegExp(quotePattern, "iu");
  const match = regex.exec(text);
  if (!match || match.index == null) return text;

  return text.slice(0, match.index) + rewrite + text.slice(match.index + match[0].length);
}
