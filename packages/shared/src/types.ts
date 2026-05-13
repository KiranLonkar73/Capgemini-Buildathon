export type Severity = "low" | "medium" | "high" | "critical";

export type PolicyOwner = "HR" | "Legal" | "Security" | "Finance" | "Compliance";

export type PolicyRule = {
  id: string;
  policy: string;
  section: string;
  rule: string;
  owner: PolicyOwner;
};

export type PolicyReference = {
  id: string;
  policy: string;
  section: string;
  owner: PolicyOwner;
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
