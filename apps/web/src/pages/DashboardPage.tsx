import { ChangeEvent, useRef, useState } from "react";
import { CheckCircle2, FileText, Play, ShieldCheck, Sparkles, Upload, Wand2 } from "lucide-react";
import {
  applyRewrite,
  demoDocument,
  runDemoComplianceCheck,
  type ComplianceReport,
  type Violation
} from "@complylens/shared";
import { analyzeDocument, analyzeUploadedDocument } from "../api/complianceApi";
import { NoticeBox } from "../components/common/NoticeBox";
import { FindingsPanel } from "../features/compliance/FindingsPanel";
import { HighlightedEditor } from "../features/compliance/HighlightedEditor";
import { WorkspaceShell } from "../layouts/WorkspaceShell";
import type { Notice } from "../types";

export function DashboardPage() {
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
      const nextReport = await analyzeDocument({ text: nextDraft, documentName, threshold });
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
    try {
      const result = await analyzeUploadedDocument(file, threshold);
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

  const valuePoints = [
    { icon: ShieldCheck, title: "See the risk", copy: "Find the exact line that can cause trouble." },
    { icon: Sparkles, title: "Understand why", copy: "Read the rule and why it matters in simple words." },
    { icon: Wand2, title: "Fix it fast", copy: "Use the rewrite instead of editing from scratch." }
  ];

  return (
    <WorkspaceShell>
      <section className="ops-dashboard work-dashboard">
        <div className="work-topbar">
          <div>
            <span className="eyebrow">Work</span>
            <h1>Your compliance workspace.</h1>
            <p>Paste a draft or upload a file. ComplyLens finds risky lines and gives you a safer version.</p>
          </div>
          <div className="work-actions">
            <button onClick={pasteText} type="button">
              <FileText size={16} />
              Try demo
            </button>
            <button onClick={() => fileRef.current?.click()} type="button">
              <Upload size={16} />
              Upload
            </button>
            <button className="primary-work-action" disabled={loading} onClick={() => void analyze()} type="button">
              <Play size={16} />
              {loading ? "Checking..." : "Check"}
            </button>
          </div>
        </div>

        <div className="work-steps" aria-label="How to use">
          {[
            ["1", "Add your draft"],
            ["2", "Read the result"],
            ["3", "Use the safe rewrite"]
          ].map(([number, label]) => (
            <div key={number}>
              <strong>{number}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>

        {notice && <NoticeBox notice={notice} onClose={() => setNotice(null)} />}

        <div className="work-value-strip" aria-label="Why this helps">
          {valuePoints.map((item) => (
            <article key={item.title}>
              <span className="premium-icon">
                <item.icon size={16} />
              </span>
              <div>
                <strong>{item.title}</strong>
                <p>{item.copy}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="work-grid">
          <section className="analysis-workbench">
            <div className="codex-workspace">
              <div className="codex-chat-head">
                <div>
                  <strong>ComplyLens chat</strong>
                  <span>One place to write, upload, and review.</span>
                </div>
                <div className="scan-state">
                  <span className={loading ? "pulse-dot" : "pulse-dot idle"} />
                  {loading ? "Checking" : `${visibleViolations.length} issues`}
                </div>
              </div>

              <div className="codex-thread">
                <article className="thread-bubble thread-bubble--system">
                  <span className="thread-role">ComplyLens</span>
                  <p>I compare your draft against company policy, show risky text, and suggest safer wording.</p>
                </article>
                <article className="thread-bubble thread-bubble--user">
                  <span className="thread-role">You</span>
                  <p>{documentName}</p>
                </article>
              </div>

              <div className="codex-composer">
                <div className="composer-meta">
                  <span>
                    <FileText size={16} />
                    {documentName}
                  </span>
                  <span>{draft.trim().split(/\s+/).filter(Boolean).length} words</span>
                </div>
                <div className="composer-actions">
                  <button onClick={pasteText} type="button">Demo draft</button>
                  <button onClick={() => fileRef.current?.click()} type="button">Upload file</button>
                  <button className="primary-work-action" disabled={loading} onClick={() => void analyze()} type="button">
                    <Play size={16} />
                    {loading ? "Checking..." : "Check draft"}
                  </button>
                </div>
              </div>
            </div>

            <div className="document-card">
              <div className="document-toolbar">
                <span>
                  Paste text or upload PDF, DOC, DOCX, EML, HTML, MD, RTF, or TXT
                </span>
                <div>
                  <button onClick={pasteText} type="button">Demo</button>
                  <button onClick={() => fileRef.current?.click()} type="button">Upload</button>
                  <button disabled={loading} onClick={() => void analyze()} type="button">{loading ? "Checking..." : "Check"}</button>
                </div>
                <input accept=".txt,.md,.pdf,.doc,.docx,.eml,.html,.htm,.rtf" hidden onChange={uploadDocument} ref={fileRef} type="file" />
              </div>
              <HighlightedEditor draft={draft} onChange={setDraft} onSelectViolation={setActiveId} violations={visibleViolations} />
            </div>

            <div className="work-outcome-strip">
              <div>
                <CheckCircle2 size={16} />
                <span>{report.score}% score</span>
              </div>
              <div>
                <ShieldCheck size={16} />
                <span>{report.flaggedSections} risky sections found</span>
              </div>
              <div>
                <Wand2 size={16} />
                <span>{visibleViolations.length ? "Ready with rewrites" : "No rewrite needed"}</span>
              </div>
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
        </div>
      </section>
    </WorkspaceShell>
  );
}
