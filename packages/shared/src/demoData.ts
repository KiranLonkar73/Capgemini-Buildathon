import type { ComplianceReport, PolicyReference, PolicyRule } from "./types";

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

export const demoReferences: PolicyReference[] = samplePolicies.map((policy) => ({
  id: policy.id,
  policy: policy.policy,
  section: policy.section,
  owner: policy.owner,
  text: policy.rule
}));

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
      citation: { ...demoReferences[2], score: 0.93 }
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
      citation: { ...demoReferences[1], score: 0.88 }
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
      citation: { ...demoReferences[0], score: 0.91 }
    }
  ],
  references: demoReferences
};
