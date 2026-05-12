import {
  Activity,
  Bot,
  BrainCircuit,
  Building2,
  ChartNoAxesCombined,
  CheckCircle2,
  FileSearch,
  Fingerprint,
  Gauge,
  GitBranch,
  KeyRound,
  MailCheck,
  MessageSquareText,
  Network,
  Radar,
  Scale,
  ShieldCheck,
  Sparkles,
  Wand2
} from "lucide-react";

export const heroMetrics = [
  { label: "Policy sources indexed", value: "1,284", trend: "+18 this week" },
  { label: "Risky drafts intercepted", value: "4.7K", trend: "31% fewer escalations" },
  { label: "Median review latency", value: "0.9s", trend: "real-time Gmail checks" }
];

export const homepageFeatures = [
  {
    title: "Policy-grounded AI reasoning",
    copy: "ComplyLens retrieves the exact company policy context behind every flag, then explains why the language creates legal, security, HR, or finance risk.",
    icon: BrainCircuit
  },
  {
    title: "Operational communication controls",
    copy: "Review outbound emails, documents, vendor notes, and internal messages before they leave approved workflows.",
    icon: ShieldCheck
  },
  {
    title: "Safe rewrite intelligence",
    copy: "Preserve intent while removing guarantees, data leakage, compensation exposure, or forward-looking statements.",
    icon: Wand2
  },
  {
    title: "Gmail-native governance",
    copy: "Detect compose windows, scan drafts, explain policy context, and insert compliant alternatives without forcing users into another tool.",
    icon: MailCheck
  },
  {
    title: "Company-specific memory",
    copy: "Upload policies and let the system build a live compliance context layer for every organization profile.",
    icon: Network
  },
  {
    title: "False-positive control",
    copy: "Tune thresholds, dismiss low-confidence findings, mark safe cases, and keep review decisions auditable.",
    icon: Gauge
  }
];

export const workflowSteps = [
  { title: "Ingest", copy: "Policies, handbooks, legal standards, security controls", icon: FileSearch },
  { title: "Retrieve", copy: "Relevant chunks ranked against the active draft", icon: GitBranch },
  { title: "Reason", copy: "AI classifies severity, confidence, and business context", icon: BrainCircuit },
  { title: "Rewrite", copy: "Safe alternatives keep the original intent intact", icon: Wand2 },
  { title: "Audit", copy: "Every decision becomes traceable review history", icon: Fingerprint }
];

export const dashboardMetrics = [
  { label: "Compliance score", value: "87", suffix: "%", delta: "+6.4%", tone: "success" },
  { label: "Live scans today", value: "2,418", suffix: "", delta: "+312", tone: "accent" },
  { label: "High-risk blocks", value: "42", suffix: "", delta: "-14%", tone: "critical" },
  { label: "Avg. confidence", value: "91", suffix: "%", delta: "+3.1%", tone: "accent" }
];

export const trendPoints = [58, 64, 61, 72, 78, 75, 83, 87];

export const riskHeatmap = [
  ["Legal", 72, "warning"],
  ["Security", 88, "critical"],
  ["HR", 54, "success"],
  ["Finance", 63, "warning"],
  ["Vendor", 45, "success"]
];

export const activityFeed = [
  { title: "Gmail draft blocked", detail: "Refund guarantee detected in Enterprise Sales queue", time: "2m ago", tone: "critical" },
  { title: "Policy context retrieved", detail: "Customer Data Handling Standard matched 4 passages", time: "7m ago", tone: "accent" },
  { title: "Rewrite accepted", detail: "Legal-safe delivery language inserted by Maya Chen", time: "14m ago", tone: "success" },
  { title: "New policy uploaded", detail: "APAC Vendor Communications Addendum indexed", time: "31m ago", tone: "accent" }
];

export const aiInsights = [
  "External sharing violations are concentrated in vendor onboarding drafts.",
  "Legal guarantees dropped 22% after rewrite recommendations were enabled.",
  "Security policy citations are producing the highest reviewer agreement rate.",
  "Finance disclaimer misses spike near end-of-quarter revenue updates."
];

export const teamAnalytics = [
  { team: "Sales", scanned: 821, risks: 37, score: 82 },
  { team: "Support", scanned: 612, risks: 18, score: 91 },
  { team: "Finance", scanned: 244, risks: 16, score: 79 },
  { team: "People", scanned: 138, risks: 9, score: 88 }
];

export const trustItems = [
  { title: "Explainable by default", icon: Scale },
  { title: "Least-friction workflows", icon: Activity },
  { title: "Enterprise-ready controls", icon: Building2 },
  { title: "AI assist, human governed", icon: Bot }
];

export const extensionSignals = [
  { label: "Compose detected", status: "Active", icon: MessageSquareText },
  { label: "Policy retrieval", status: "4 matches", icon: Radar },
  { label: "Rewrite ready", status: "1 safe option", icon: Sparkles },
  { label: "Audit trail", status: "Recorded", icon: CheckCircle2 }
];

export const securityEvents = [
  "PII export attempt detected in vendor email",
  "Unapproved refund commitment intercepted",
  "Compensation detail removed from HR thread",
  "Forecast disclaimer requested for finance update"
];

export const policySystems = [
  { name: "Customer Data Handling", owner: "Security", coverage: 96, passages: 318 },
  { name: "Commercial Communications", owner: "Legal", coverage: 89, passages: 214 },
  { name: "HR Confidentiality", owner: "People", coverage: 92, passages: 176 },
  { name: "Forward-Looking Statements", owner: "Finance", coverage: 84, passages: 121 }
];

export const iconCardClass = "premium-icon";
