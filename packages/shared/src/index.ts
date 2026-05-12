export type Severity = "low" | "medium" | "high" | "critical";

export type PolicyRule = {
  id: string;
  policy: string;
  section: string;
  rule: string;
  owner: "HR" | "Legal" | "Security" | "Finance";
};

export type PolicyReference = {
  id: string;
  policy: string;
  section: string;
  owner: PolicyRule["owner"];
  text: string;
  score?: number;
};

export type Violation = {
  id: string;
  severity: Severity;
  confidence: number;
  quote: string;
  policyName: string;
  policySection: string;
  ruleText: string;
  explanation: string;
  rewrite: string;
  citation?: PolicyReference;
  status?: "open" | "dismissed" | "safe" | "resolved";
};

export type ComplianceReport = {
  id?: string;
  score: number;
  cleanSections: number;
  flaggedSections: number;
  status: "ready" | "review" | "blocked";
  summary?: string;
  source?: "backend" | "local-demo";
  violations: Violation[];
  references?: PolicyReference[];
};

export const samplePolicies: PolicyRule[] = [
  {
    id: "hr-1",
    policy: "HR Confidentiality Handbook",
    section: "2.4 Compensation Privacy",
    rule: "Employee salary, bonus, and compensation details must never be shared in public channels or external emails.",
    owner: "HR"
  },
  {
    id: "legal-1",
    policy: "Commercial Communications Policy",
    section: "4.1 Delivery Commitments",
    rule: "Written delivery dates, service guarantees, or refund commitments require legal approval before being sent.",
    owner: "Legal"
  },
  {
    id: "security-1",
    policy: "Customer Data Handling Standard",
    section: "3.2 External Sharing",
    rule: "Customer records, credentials, account IDs, and personal data cannot be shared outside approved systems.",
    owner: "Security"
  },
  {
    id: "finance-1",
    policy: "Forward-Looking Statements Guide",
    section: "1.3 Forecast Disclaimer",
    rule: "Any written discussion of future revenue, profit, or market performance must include the approved finance disclaimer.",
    owner: "Finance"
  }
];

export const demoDocument = `Hi Jordan,

Please send the Q2 customer export to the vendor today. It includes account IDs and contact details, but they said email is fine.

Also, we can promise delivery by June 14 and guarantee a full refund if we miss it.

Internal note: Priya's new salary is 31 LPA, so do not include her in the budget reduction list.

Thanks.`;

export const demoReport: ComplianceReport = {
  id: "demo-report",
  score: 42,
  cleanSections: 2,
  flaggedSections: 3,
  status: "blocked",
  source: "local-demo",
  summary: "Seeded demo analysis against HR, Legal, Security, and Finance policy rules.",
  violations: [
    {
      id: "v-1",
      severity: "high",
      confidence: 0.93,
      quote: "It includes account IDs and contact details, but they said email is fine.",
      policyName: "Customer Data Handling Standard",
      policySection: "3.2 External Sharing",
      ruleText: samplePolicies[2].rule,
      explanation: "The email proposes sending customer identifiers and contact data through an unapproved external channel.",
      rewrite: "Please share the approved secure transfer link with the vendor once access is authorized.",
      citation: {
        id: samplePolicies[2].id,
        policy: samplePolicies[2].policy,
        section: samplePolicies[2].section,
        owner: samplePolicies[2].owner,
        text: samplePolicies[2].rule,
        score: 0.93
      }
    },
    {
      id: "v-2",
      severity: "medium",
      confidence: 0.88,
      quote: "we can promise delivery by June 14 and guarantee a full refund if we miss it.",
      policyName: "Commercial Communications Policy",
      policySection: "4.1 Delivery Commitments",
      ruleText: samplePolicies[1].rule,
      explanation: "The draft creates a written delivery commitment and refund guarantee without legal approval.",
      rewrite: "Our current target is June 14, subject to final confirmation and approved commercial terms.",
      citation: {
        id: samplePolicies[1].id,
        policy: samplePolicies[1].policy,
        section: samplePolicies[1].section,
        owner: samplePolicies[1].owner,
        text: samplePolicies[1].rule,
        score: 0.88
      }
    },
    {
      id: "v-3",
      severity: "high",
      confidence: 0.91,
      quote: "Priya's new salary is 31 LPA",
      policyName: "HR Confidentiality Handbook",
      policySection: "2.4 Compensation Privacy",
      ruleText: samplePolicies[0].rule,
      explanation: "The draft exposes an employee's compensation information in written communication.",
      rewrite: "Internal note: Please review Priya's compensation category through the approved HR system.",
      citation: {
        id: samplePolicies[0].id,
        policy: samplePolicies[0].policy,
        section: samplePolicies[0].section,
        owner: samplePolicies[0].owner,
        text: samplePolicies[0].rule,
        score: 0.91
      }
    }
  ],
  references: samplePolicies.map((policy) => ({
    id: policy.id,
    policy: policy.policy,
    section: policy.section,
    owner: policy.owner,
    text: policy.rule
  }))
};

export function severityLabel(severity: Severity) {
  return severity.charAt(0).toUpperCase() + severity.slice(1);
}

export type AnalyzeRequest = {
  text: string;
  documentName?: string;
  organizationId?: string;
  threshold?: number;
};

export type RewriteRequest = {
  text: string;
  violationId?: string;
  policyContext?: string;
};

export type CompanySettings = {
  organizationId: string;
  organizationName: string;
  threshold: number;
  activePolicySet: string;
};

export const API_BASE_URL =
  typeof globalThis !== "undefined" && "location" in globalThis
    ? "http://localhost:8000"
    : "http://localhost:8000";

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
