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
  if (!violation.quote || !text.includes(violation.quote)) return text;
  return text.replace(violation.quote, violation.rewrite);
}
