import { ChangeEvent, useRef, useState } from "react";
import { ArrowUp, FileText, Paperclip } from "lucide-react";
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

  return (
    <WorkspaceShell>
      <section className="ops-dashboard work-dashboard">
        <div className="work-topbar">
          <div>
            <span className="eyebrow">Work</span>
            <h1>Review text like a chat.</h1>
            <p>Type, attach a file, then get a clear compliance answer with fixes.</p>
          </div>
        </div>

        {notice && <NoticeBox notice={notice} onClose={() => setNotice(null)} />}

        <div className="work-grid">
          <section className="analysis-workbench">
            <div className="codex-workspace">
              <div className="codex-chat-head">
                <div>
                  <strong>ComplyLens chat</strong>
                  <span>Ask with text or file input.</span>
                </div>
                <div className="scan-state">
                  <span className={loading ? "pulse-dot" : "pulse-dot idle"} />
                  {loading ? "Checking" : `${visibleViolations.length} issues`}
                </div>
              </div>

              <div className="codex-thread">
                <article className="thread-bubble thread-bubble--system">
                  <span className="thread-role">ComplyLens</span>
                  <p>I check your draft against policy, point to the risky text, and suggest a safer rewrite.</p>
                </article>
                <article className="thread-bubble thread-bubble--user">
                  <span className="thread-role">You</span>
                  <p>{documentName}</p>
                </article>
                <article className="thread-bubble thread-bubble--assistant">
                  <span className="thread-role">Result</span>
                  <p>
                    {activeViolation
                      ? `I found ${visibleViolations.length} issue${visibleViolations.length === 1 ? "" : "s"}. The main risk is in ${activeViolation.policySection}.`
                      : report.summary ?? "No risky language found."}
                  </p>
                  {activeViolation && (
                    <div className="thread-summary-grid">
                      <div>
                        <strong>Why</strong>
                        <span>{activeViolation.explanation}</span>
                      </div>
                      <div>
                        <strong>Suggested rewrite</strong>
                        <span>{activeViolation.rewrite}</span>
                      </div>
                    </div>
                  )}
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
                <textarea
                  aria-label="Write message or document"
                  className="composer-textarea"
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                      event.preventDefault();
                      void analyze();
                    }
                  }}
                  placeholder="Type your message here, paste a document, or attach a file."
                  value={draft}
                />
                <div className="composer-actions">
                  <button aria-label="Upload file" className="icon-action-button" onClick={() => fileRef.current?.click()} type="button">
                    <Paperclip size={16} />
                  </button>
                  <button onClick={pasteText} type="button">Use demo</button>
                  <button className="primary-work-action send-action-button" disabled={loading} onClick={() => void analyze()} type="button">
                    <ArrowUp size={16} />
                    {loading ? "Checking..." : "Run check"}
                  </button>
                </div>
              </div>
            </div>

            <div className="document-card">
              <div className="document-toolbar">
                <span>
                  Compare the original text with highlighted issues
                </span>
                <div>
                  <button aria-label="Upload file" className="icon-action-button" onClick={() => fileRef.current?.click()} type="button">
                    <Paperclip size={15} />
                  </button>
                  <button disabled={loading} onClick={() => void analyze()} type="button">{loading ? "Checking..." : "Run check"}</button>
                </div>
                <input accept=".txt,.md,.pdf,.doc,.docx,.eml,.html,.htm,.rtf" hidden onChange={uploadDocument} ref={fileRef} type="file" />
              </div>
              <HighlightedEditor draft={draft} mode="preview" onSelectViolation={setActiveId} violations={visibleViolations} />
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
