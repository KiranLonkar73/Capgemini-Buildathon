import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { Link, NavLink, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Gauge,
  KeyRound,
  LockKeyhole,
  MailCheck,
  RefreshCw,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Upload,
  Wand2,
  X
} from "lucide-react";
import {
  API_BASE_URL,
  applyRewrite,
  demoDocument,
  runDemoComplianceCheck,
  samplePolicies,
  severityLabel,
  type ComplianceReport,
  type Violation
} from "@complylens/shared";
import { ComplianceLensScene } from "./components/ComplianceLensScene";
import { SlidingNumber } from "./components/animate-ui/primitives/texts/sliding-number";
import AnimatedButton from "./components/ui/animated-button";

const workspaceLinks = [
  { to: "/dashboard", label: "Dashboard", icon: Gauge },
  { to: "/policies", label: "Policies", icon: Shield },
  { to: "/extension", label: "Extension", icon: MailCheck },
  { to: "/settings", label: "Settings", icon: Settings }
];

type Notice = { kind: "info" | "error" | "success"; text: string } | null;

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/signup" element={<AuthPage mode="signup" />} />
      <Route path="/dashboard" element={<WorkspacePage />} />
      <Route path="/policies" element={<PoliciesPage />} />
      <Route path="/extension" element={<ExtensionPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
}

function LandingPage() {
  const features = [
    ["Policy-grounded analysis", "Every issue includes the policy section, confidence, explanation, and rewrite."],
    ["Gmail-ready review", "The Chrome extension checks outbound drafts before they leave the company."],
    ["Company-specific memory", "Policy uploads create reusable context for document and email reviews."]
  ];

  return (
    <main className="site-shell">
      <TopNav />
      <section className="hero-section">
        <ComplianceLensScene />
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="hero-content"
          initial={{ opacity: 0, y: 18 }}
          transition={{ duration: 0.36 }}
        >
          <span className="eyebrow">Enterprise AI compliance copilot</span>
          <h1>Review emails and documents against company policy before risk escapes.</h1>
          <p>
            ComplyLens scans enterprise communication, retrieves relevant policy context, explains violations, and
            rewrites risky language into compliant alternatives.
          </p>
          <div className="hero-actions">
            <Link className="primary-action" to="/login">
              Open workspace <ArrowRight size={16} />
            </Link>
            <Link className="secondary-action" to="/extension">
              View Gmail workflow <MailCheck size={16} />
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="section-grid" id="features">
        {features.map(([title, copy], index) => (
          <motion.article
            className="feature-card"
            initial={{ opacity: 0, y: 14 }}
            key={title}
            transition={{ delay: index * 0.05 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
          >
            <span>{index + 1}</span>
            <h2>{title}</h2>
            <p>{copy}</p>
          </motion.article>
        ))}
      </section>

      <section className="workflow-section">
        <PanelTitle label="Workflow" title="From draft to explainable decision" />
        <div className="workflow-steps">
          {["Upload policy", "Scan document", "Retrieve context", "Explain risk", "Apply rewrite"].map((step) => (
            <div className="workflow-step" key={step}>
              <CheckCircle2 size={16} />
              {step}
            </div>
          ))}
        </div>
      </section>

      <section className="trust-section">
        <div>
          <span className="eyebrow">Built for legal, security, HR, and finance</span>
          <h2>Serious interface, traceable outputs, controlled automation.</h2>
        </div>
        <Link className="primary-action" to="/dashboard">
          Try demo analysis <Sparkles size={16} />
        </Link>
      </section>
    </main>
  );
}

function AuthPage({ mode }: { mode: "login" | "signup" }) {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const isSignup = mode === "signup";

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    if (!email.includes("@") || password.length < 6) {
      setError("Use a work email and a password with at least 6 characters.");
      return;
    }
    navigate("/dashboard");
  }

  return (
    <main className="auth-shell">
      <TopNav compact />
      <section className="auth-layout">
        <div className="auth-copy">
          <span className="eyebrow">Secure policy workspace</span>
          <h1>{isSignup ? "Create a company compliance workspace." : "Login to your compliance review queue."}</h1>
          <p>
            Manage policies, scan drafts, review citations, and apply safe rewrites from one enterprise workflow.
          </p>
        </div>
        <motion.section animate={{ opacity: 1, y: 0 }} className="auth-card" initial={{ opacity: 0, y: 16 }}>
          <div className="auth-card-head">
            <div className="auth-icon">{isSignup ? <KeyRound size={20} /> : <LockKeyhole size={20} />}</div>
            <div>
              <h2>{isSignup ? "Create workspace" : "Welcome back"}</h2>
              <p>{isSignup ? "Configure policy review access." : "Continue reviewing enterprise communication."}</p>
            </div>
          </div>
          <form className="auth-form" onSubmit={submit}>
            {isSignup && (
              <label>
                Company name
                <input name="company" placeholder="Acme Compliance" />
              </label>
            )}
            <label>
              Work email
              <input name="email" placeholder="you@company.com" type="email" />
            </label>
            <label>
              Password
              <input name="password" placeholder="minimum 6 characters" type="password" />
            </label>
            {error && <div className="notice error">{error}</div>}
            <button className="auth-submit" type="submit">
              {isSignup ? "Create workspace" : "Login"}
              <ArrowRight size={16} />
            </button>
          </form>
          <div className="auth-divider">
            <span />
            Demo
            <span />
          </div>
          <button className="demo-button" onClick={() => navigate("/dashboard")} type="button">
            Open seeded demo workspace
          </button>
          <p className="auth-switch">
            {isSignup ? "Already have access?" : "Need a workspace?"}{" "}
            <Link to={isSignup ? "/login" : "/signup"}>{isSignup ? "Login" : "Sign up"}</Link>
          </p>
        </motion.section>
      </section>
    </main>
  );
}

function WorkspacePage() {
  const [draft, setDraft] = useState(demoDocument);
  const [documentName, setDocumentName] = useState("Vendor_Email_Draft.txt");
  const [report, setReport] = useState<ComplianceReport>(() => runDemoComplianceCheck(demoDocument));
  const [activeId, setActiveId] = useState(report.violations[0]?.id ?? "");
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [severityFilter, setSeverityFilter] = useState("all");
  const [threshold, setThreshold] = useState(0.62);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const visibleViolations = report.violations.filter((violation) => {
    if (hiddenIds.includes(violation.id)) return false;
    if (severityFilter !== "all" && violation.severity !== severityFilter) return false;
    return violation.confidence >= threshold;
  });
  const activeViolation = visibleViolations.find((violation) => violation.id === activeId) ?? visibleViolations[0];

  async function analyze(nextDraft = draft) {
    setLoading(true);
    setNotice(null);
    try {
      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: nextDraft, documentName, threshold })
      });
      if (!response.ok) throw new Error(await response.text());
      const nextReport = (await response.json()) as ComplianceReport;
      setReport(nextReport);
      setActiveId(nextReport.violations[0]?.id ?? "");
      setHiddenIds([]);
      setNotice({ kind: "success", text: "Backend analysis completed with policy citations." });
    } catch (error) {
      const fallback = runDemoComplianceCheck(nextDraft);
      setReport(fallback);
      setActiveId(fallback.violations[0]?.id ?? "");
      setNotice({
        kind: "error",
        text: `Backend unavailable, showing seeded demo analysis. ${error instanceof Error ? error.message.slice(0, 120) : ""}`
      });
    } finally {
      setLoading(false);
    }
  }

  async function uploadDocument(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setDocumentName(file.name);
    if (file.name.toLowerCase().endsWith(".txt")) {
      const text = await file.text();
      setDraft(text);
      await analyze(text);
      return;
    }
    setLoading(true);
    const body = new FormData();
    body.append("file", file);
    body.append("threshold", String(threshold));
    try {
      const response = await fetch(`${API_BASE_URL}/analyze-upload`, { method: "POST", body });
      if (!response.ok) throw new Error(await response.text());
      const result = (await response.json()) as { text: string; report: ComplianceReport };
      setDraft(result.text);
      setReport(result.report);
      setActiveId(result.report.violations[0]?.id ?? "");
      setHiddenIds([]);
      setNotice({ kind: "success", text: `Parsed and analyzed ${file.name}.` });
    } catch (error) {
      setNotice({
        kind: "error",
        text: `Could not parse ${file.name}. Start the backend and install PDF/DOCX dependencies. ${error instanceof Error ? error.message.slice(0, 120) : ""}`
      });
    } finally {
      setLoading(false);
    }
  }

  function pasteText() {
    setDraft(demoDocument);
    setDocumentName("Pasted_Demo_Draft.txt");
    void analyze(demoDocument);
  }

  function applyViolationRewrite(violation: Violation) {
    const nextDraft = applyRewrite(draft, violation);
    setDraft(nextDraft);
    setHiddenIds((ids) => [...new Set([...ids, violation.id])]);
    setNotice({ kind: "success", text: "Rewrite applied to the document draft." });
  }

  return (
    <WorkspaceShell>
      <section className="workspace-layout">
        <aside className="policy-sidebar">
          <PanelTitle label="Policy library" title="Active rulebase" />
          <Link className="upload-card" to="/policies">
            <Upload size={18} />
            <span>
              <strong>Manage policies</strong>
              <small>Upload company PDF, DOCX, TXT policy docs</small>
            </span>
          </Link>
          <div className="policy-list">
            {samplePolicies.map((policy) => (
              <article className="policy-row" key={policy.id}>
                <span>{policy.owner}</span>
                <div>
                  <strong>{policy.policy}</strong>
                  <small>{policy.section}</small>
                </div>
              </article>
            ))}
          </div>
        </aside>

        <section className="review-canvas">
          <div className="review-header">
            <PanelTitle label="Document review" title="Outbound vendor email" />
            <div className="scan-state">
              <span className={loading ? "pulse-dot" : "pulse-dot idle"} />
              {loading ? "Scanning policies" : report.source === "backend" ? "Backend connected" : "Seeded demo mode"}
            </div>
          </div>
          {notice && <NoticeBox notice={notice} onClose={() => setNotice(null)} />}
          <div className="document-card">
            <div className="document-toolbar">
              <span>
                <FileText size={15} />
                {documentName}
              </span>
              <div>
                <button onClick={pasteText} type="button">Paste demo</button>
                <button onClick={() => fileRef.current?.click()} type="button">Upload file</button>
                <button disabled={loading} onClick={() => void analyze()} type="button">
                  {loading ? "Running..." : "Run analysis"}
                </button>
              </div>
              <input accept=".txt,.pdf,.docx" hidden onChange={uploadDocument} ref={fileRef} type="file" />
            </div>
            <HighlightedEditor
              draft={draft}
              onChange={setDraft}
              onSelectViolation={setActiveId}
              violations={visibleViolations}
            />
          </div>
        </section>

        <FindingsPanel
          activeViolation={activeViolation}
          hiddenCount={hiddenIds.length}
          loading={loading}
          onApply={applyViolationRewrite}
          onDismiss={(id) => setHiddenIds((ids) => [...new Set([...ids, id])])}
          onFilter={setSeverityFilter}
          onMarkSafe={(id) => setHiddenIds((ids) => [...new Set([...ids, id])])}
          onSelectViolation={setActiveId}
          onThreshold={setThreshold}
          report={report}
          severityFilter={severityFilter}
          threshold={threshold}
          violations={visibleViolations}
        />
      </section>
    </WorkspaceShell>
  );
}

function PoliciesPage() {
  const [notice, setNotice] = useState<Notice>(null);
  const [uploading, setUploading] = useState(false);
  const [policyRows, setPolicyRows] = useState(samplePolicies);

  async function uploadPolicy(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setNotice(null);
    const body = new FormData();
    body.append("file", file);
    body.append("policy_name", file.name.replace(/\.(pdf|docx|txt)$/i, ""));
    try {
      const response = await fetch(`${API_BASE_URL}/upload-policy`, { method: "POST", body });
      if (!response.ok) throw new Error(await response.text());
      const result = await response.json();
      setPolicyRows((rows) => [
        {
          id: `uploaded-${file.name}`,
          policy: file.name,
          section: `${result.chunks} retrieved chunks`,
          rule: "Uploaded company policy is now available to retrieval.",
          owner: "Legal"
        },
        ...rows
      ]);
      setNotice({ kind: "success", text: `Uploaded ${file.name} and indexed ${result.chunks} policy chunks.` });
    } catch (error) {
      setNotice({
        kind: "error",
        text: `Policy upload failed. Start backend with backend/requirements.txt installed. ${error instanceof Error ? error.message.slice(0, 120) : ""}`
      });
    } finally {
      setUploading(false);
    }
  }

  return (
    <WorkspaceShell>
      <section className="page-panel">
        <PanelTitle label="Company policy memory" title="Upload and manage active policy sets" />
        {notice && <NoticeBox notice={notice} onClose={() => setNotice(null)} />}
        <label className="large-upload">
          <Upload size={22} />
          <span>
            <strong>{uploading ? "Uploading policy..." : "Upload policy document"}</strong>
            <small>PDF, DOCX, and TXT are parsed by the FastAPI backend.</small>
          </span>
          <input accept=".pdf,.docx,.txt" disabled={uploading} onChange={uploadPolicy} type="file" />
        </label>
        <div className="policy-table">
          {policyRows.map((policy) => (
            <article className="policy-row wide" key={policy.id}>
              <span>{policy.owner}</span>
              <div>
                <strong>{policy.policy}</strong>
                <small>{policy.section}</small>
                <p>{policy.rule}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </WorkspaceShell>
  );
}

function ExtensionPage() {
  return (
    <WorkspaceShell>
      <section className="page-panel extension-page">
        <PanelTitle label="Gmail integration" title="Chrome extension workflow" />
        <div className="extension-showcase">
          <div>
            <h3>How Gmail uses ComplyLens</h3>
            <p>
              The content script detects compose windows, sends draft text to the same `/analyze` backend, displays
              inline risk context, and can insert an approved rewrite into the compose body.
            </p>
            <div className="workflow-steps compact">
              <div className="workflow-step"><MailCheck size={16} /> Detect compose</div>
              <div className="workflow-step"><Search size={16} /> Scan draft</div>
              <div className="workflow-step"><Wand2 size={16} /> Insert rewrite</div>
            </div>
          </div>
          <div className="extension-preview">
            <strong>ComplyLens Gmail</strong>
            <span className="risk-pill">Medium risk</span>
            <p>Commercial Communications Policy</p>
            <small>Written guarantees require legal approval.</small>
            <button type="button">Apply rewrite</button>
          </div>
        </div>
      </section>
    </WorkspaceShell>
  );
}

function SettingsPage() {
  const [notice, setNotice] = useState<Notice>(null);
  const [saving, setSaving] = useState(false);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    try {
      const payload = {
        organizationId: "demo-org",
        organizationName: String(form.get("organizationName") ?? "Demo Enterprise"),
        threshold: Number(form.get("threshold") ?? 0.62),
        activePolicySet: String(form.get("activePolicySet") ?? "seeded-enterprise-policy")
      };
      const response = await fetch(`${API_BASE_URL}/settings/company`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(await response.text());
      setNotice({ kind: "success", text: "Company settings saved to backend." });
    } catch (error) {
      setNotice({
        kind: "error",
        text: `Could not save settings. ${error instanceof Error ? error.message.slice(0, 140) : ""}`
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <WorkspaceShell>
      <section className="page-panel settings-page">
        <PanelTitle label="Controls" title="Company profile and thresholds" />
        {notice && <NoticeBox notice={notice} onClose={() => setNotice(null)} />}
        <form className="settings-form" onSubmit={save}>
          <label>
            Organization name
            <input defaultValue="Demo Enterprise" name="organizationName" />
          </label>
          <label>
            Active policy set
            <input defaultValue="seeded-enterprise-policy" name="activePolicySet" />
          </label>
          <label>
            Confidence threshold
            <input defaultValue="0.62" max="0.95" min="0.2" name="threshold" step="0.01" type="number" />
          </label>
          <button className="primary-action" disabled={saving} type="submit">
            {saving ? "Saving..." : "Save settings"}
          </button>
        </form>
      </section>
    </WorkspaceShell>
  );
}

function TopNav({ compact = false }: { compact?: boolean }) {
  return (
    <header className="site-nav">
      <Brand />
      {!compact && (
        <nav>
          <a href="#features">Features</a>
          <Link to="/extension">Extension</Link>
          <Link to="/dashboard">Demo</Link>
        </nav>
      )}
      <Link className="secondary-action" to="/login">Login</Link>
    </header>
  );
}

function WorkspaceShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="workspace-shell">
      <header className="workspace-nav">
        <Link className="brand-link" to="/">
          <Brand />
        </Link>
        <nav aria-label="Workspace navigation">
          {workspaceLinks.map((item) => (
            <NavLink className={({ isActive }) => (isActive ? "active" : "")} key={item.to} to={item.to}>
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="workspace-actions">
          <Link className="ghost" to="/">Home</Link>
          <Link className="primary-action" to="/dashboard">
            Analyze <ArrowRight size={16} />
          </Link>
        </div>
      </header>
      {children}
      <footer className="status-bar">
        <div><Sparkles size={15} /> Explainable AI outputs</div>
        <div><ShieldCheck size={15} /> Company policy retrieval</div>
        <div><MailCheck size={15} /> Gmail extension compatible</div>
      </footer>
    </main>
  );
}

function FindingsPanel({
  activeViolation,
  hiddenCount,
  loading,
  onApply,
  onDismiss,
  onFilter,
  onMarkSafe,
  onSelectViolation,
  onThreshold,
  report,
  severityFilter,
  threshold,
  violations
}: {
  activeViolation?: Violation;
  hiddenCount: number;
  loading: boolean;
  onApply: (violation: Violation) => void;
  onDismiss: (id: string) => void;
  onFilter: (value: string) => void;
  onMarkSafe: (id: string) => void;
  onSelectViolation: (id: string) => void;
  onThreshold: (value: number) => void;
  report: ComplianceReport;
  severityFilter: string;
  threshold: number;
  violations: Violation[];
}) {
  return (
    <aside className="findings-sidebar">
      <section className="score-card">
        <div className="score-ring"><span><SlidingNumber number={report.score} />%</span></div>
        <div>
          <span>Compliance score</span>
          <h2>{report.status === "blocked" ? "Needs review" : report.status === "review" ? "Review advised" : "Ready"}</h2>
          <p>{report.summary ?? `${report.flaggedSections} findings require action.`}</p>
        </div>
      </section>
      <section className="findings-card">
        <div className="filter-row">
          <select value={severityFilter} onChange={(event) => onFilter(event.target.value)}>
            <option value="all">All severity</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <label>
            <SlidersHorizontal size={14} />
            <input max="0.95" min="0.2" onChange={(event) => onThreshold(Number(event.target.value))} step="0.01" type="range" value={threshold} />
          </label>
        </div>
        <PanelTitle label="AI findings" title={`${violations.length} visible violations`} />
        <div className="finding-list">
          {loading && <div className="empty-state"><RefreshCw size={16} /> Analyzing draft...</div>}
          {!loading && violations.length === 0 && <div className="empty-state"><CheckCircle2 size={16} /> No visible violations. {hiddenCount ? `${hiddenCount} hidden.` : ""}</div>}
          {violations.map((violation) => (
            <button className={`finding-row ${violation.id === activeViolation?.id ? "active" : ""}`} key={violation.id} onClick={() => onSelectViolation(violation.id)}>
              <span className={`severity-dot severity-dot--${violation.severity}`} />
              <div>
                <strong>{violation.policySection}</strong>
                <small>{severityLabel(violation.severity)} · {Math.round(violation.confidence * 100)}% confidence</small>
              </div>
            </button>
          ))}
        </div>
      </section>
      {activeViolation && (
        <motion.section animate={{ opacity: 1, y: 0 }} className="assistant-card" initial={{ opacity: 0, y: 8 }} key={activeViolation.id}>
          <PanelTitle label="Why this was flagged" title={activeViolation.policyName} />
          <p>{activeViolation.explanation}</p>
          <blockquote>{activeViolation.quote}</blockquote>
          <div className="citation-box">
            <strong>{activeViolation.policySection}</strong>
            <span>{activeViolation.ruleText}</span>
          </div>
          <div className="rewrite-box"><Wand2 size={16} /><span>{activeViolation.rewrite}</span></div>
          <div className="assistant-actions">
            <AnimatedButton className="apply-button" onClick={() => onApply(activeViolation)} type="button">Apply rewrite</AnimatedButton>
            <button onClick={() => onMarkSafe(activeViolation.id)} type="button">Mark safe</button>
            <button onClick={() => onDismiss(activeViolation.id)} type="button">Dismiss</button>
          </div>
        </motion.section>
      )}
    </aside>
  );
}

function HighlightedEditor({
  draft,
  onChange,
  onSelectViolation,
  violations
}: {
  draft: string;
  onChange: (draft: string) => void;
  onSelectViolation: (id: string) => void;
  violations: Violation[];
}) {
  return (
    <div className="document-content">
      <textarea aria-label="Document draft" className="document-textarea" onChange={(event) => onChange(event.target.value)} value={draft} />
      <div className="highlight-preview">
        {draft.split(/\n\s*\n/).map((paragraph, index) => {
          const match = violations.find((violation) => paragraph.includes(violation.quote));
          if (!match) return <p key={`${index}-${paragraph}`}>{paragraph}</p>;
          const [before, after] = paragraph.split(match.quote);
          return (
            <p key={`${index}-${paragraph}`}>
              {before}
              <button className={`inline-flag inline-flag--${match.severity}`} onClick={() => onSelectViolation(match.id)} type="button">{match.quote}</button>
              {after}
            </p>
          );
        })}
      </div>
    </div>
  );
}

function NoticeBox({ notice, onClose }: { notice: NonNullable<Notice>; onClose: () => void }) {
  return (
    <div className={`notice ${notice.kind}`}>
      <span>{notice.text}</span>
      <button aria-label="Dismiss notice" onClick={onClose} type="button"><X size={14} /></button>
    </div>
  );
}

function PanelTitle({ label, title }: { label: string; title: string }) {
  return (
    <div className="panel-title">
      <span>{label}</span>
      <h2>{title}</h2>
    </div>
  );
}

function Brand() {
  return (
    <div className="brand">
      <span className="brand-icon"><Shield size={18} /></span>
      <div>
        <strong>ComplyLens</strong>
        <span>Policy Compliance Checker</span>
      </div>
    </div>
  );
}
