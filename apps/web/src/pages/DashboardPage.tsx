import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { AlertTriangle, ArrowUp, CheckCircle2, FileText, History, Paperclip, RefreshCw, UploadCloud } from "lucide-react";
import {
  applyRewrite,
  runDemoComplianceCheck,
  type ComplianceReport,
  type Violation
} from "@complylens/shared";
import { analyzeDocument, analyzeUploadedDocument } from "../api/complianceApi";
import { NoticeBox } from "../components/common/NoticeBox";
import { HighlightedEditor } from "../features/compliance/HighlightedEditor";
import { WorkspaceShell } from "../layouts/WorkspaceShell";
import type { Notice } from "../types";

type SessionHistoryItem = {
  id: string;
  title: string;
  source: string;
  risk: string;
  time: string;
};

const emptyReport = runDemoComplianceCheck("");

export function DashboardPage() {
  const [draft, setDraft] = useState("");
  const [documentName, setDocumentName] = useState("No file selected");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [report, setReport] = useState<ComplianceReport>(emptyReport);
  const [hasRun, setHasRun] = useState(false);
  const [activeId, setActiveId] = useState("");
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [history, setHistory] = useState<SessionHistoryItem[]>([
    { id: "hist-1", title: "Sales email draft", source: "Email text", risk: "2 issues fixed", time: "Today" },
    { id: "hist-2", title: "Vendor NDA", source: "DOCX upload", risk: "Reviewed", time: "Yesterday" },
    { id: "hist-3", title: "HR announcement", source: "Pasted text", risk: "No issues", time: "May 12" }
  ]);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const visibleViolations = report.violations.filter((violation) => !hiddenIds.includes(violation.id));
  const activeViolation = visibleViolations.find((violation) => violation.id === activeId) ?? visibleViolations[0];
  const canAnalyze = Boolean(selectedFile || draft.trim());

  function recordHistory(nextReport: ComplianceReport, source: string) {
    const risk = nextReport.violations.length
      ? `${nextReport.violations.length} issue${nextReport.violations.length === 1 ? "" : "s"} found`
      : "No issues";

    setHistory((items) => [
      {
        id: crypto.randomUUID(),
        title: documentName === "No file selected" ? "Typed compliance check" : documentName,
        source,
        risk,
        time: "Just now"
      },
      ...items.slice(0, 5)
    ]);
  }

  async function runAnalysis() {
    if (!canAnalyze) {
      setNotice({ kind: "error", text: "Upload a file or type text before running analysis." });
      return;
    }

    setLoading(true);
    setNotice(null);
    try {
      if (selectedFile) {
        const result = await analyzeUploadedDocument(selectedFile, 0.62);
        setDraft(result.text);
        setReport(result.report);
        setHasRun(true);
        setActiveId(result.report.violations[0]?.id ?? "");
        setHiddenIds([]);
        recordHistory(result.report, selectedFile.name.split(".").pop()?.toUpperCase() ?? "Upload");
        setNotice({ kind: "success", text: `Analysis completed for ${selectedFile.name}.` });
        return;
      }

      const nextReport = await analyzeDocument({ text: draft, documentName, threshold: 0.62 });
      setReport(nextReport);
      setHasRun(true);
      setActiveId(nextReport.violations[0]?.id ?? "");
      setHiddenIds([]);
      recordHistory(nextReport, "Typed text");
      setNotice({ kind: "success", text: "Analysis completed with policy citations." });
    } catch (error) {
      const fallback = runDemoComplianceCheck(draft);
      setReport(fallback);
      setHasRun(true);
      setActiveId(fallback.violations[0]?.id ?? "");
      setHiddenIds([]);
      recordHistory(fallback, selectedFile ? "Upload fallback" : "Text fallback");
      setNotice({
        kind: "error",
        text: `Backend unavailable, showing local analysis. ${error instanceof Error ? error.message.slice(0, 120) : ""}`
      });
    } finally {
      setLoading(false);
    }
  }

  async function selectFile(file: File) {
    setSelectedFile(file);
    setDocumentName(file.name);
    setHasRun(false);
    setReport(emptyReport);
    setActiveId("");
    setHiddenIds([]);
    setNotice({ kind: "success", text: `${file.name} is ready. Click Run Analysis to scan it.` });

    if (/\.(txt|md|html|htm|eml|rtf)$/i.test(file.name)) {
      setDraft(await file.text());
    } else {
      setDraft("");
    }
  }

  function uploadDocument(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      void selectFile(file);
    }
  }

  function dropDocument(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      void selectFile(file);
    }
  }

  function startNextUpload() {
    setDraft("");
    setDocumentName("No file selected");
    setSelectedFile(null);
    setReport(emptyReport);
    setHasRun(false);
    setActiveId("");
    setHiddenIds([]);
    setNotice(null);
    fileRef.current?.click();
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
        <div className="workspace-command-bar compact-command-bar">
          <div>
            <h1>Compliance Workspace</h1>
            <p>Upload a file or write text, run one analysis, then review the full result in a focused workspace.</p>
          </div>
          <button className="secondary-action-button" onClick={startNextUpload} type="button">
            <RefreshCw size={15} />
            Upload next
          </button>
        </div>

        <div className="employee-workspace-grid">
          <section className={`employee-analysis-panel ${hasRun ? "has-results" : ""}`}>
            <div className="workspace-input-stage">
              <div
                className={`upload-dropzone-large ${selectedFile ? "is-ready" : ""}`}
                onClick={() => fileRef.current?.click()}
                onDragOver={(event) => event.preventDefault()}
                onDrop={dropDocument}
                role="button"
                tabIndex={0}
              >
                <div className="upload-icon-ring">
                  <UploadCloud size={34} />
                </div>
                <strong>{selectedFile ? selectedFile.name : "Drop a document here"}</strong>
                <span>PDF, DOCX, DOC, EML, HTML, RTF, TXT, or pasted text</span>
                <small>{selectedFile ? "File ready for analysis" : "Click the box to choose a file"}</small>
              </div>

              <div className="workspace-text-entry">
                <div className="composer-meta">
                  <span>
                    <FileText size={16} />
                    {documentName}
                  </span>
                  <span>{draft.trim().split(/\s+/).filter(Boolean).length} words</span>
                </div>
                <textarea
                  aria-label="Write or paste text for compliance analysis"
                  className="composer-textarea"
                  onChange={(event) => {
                    setDraft(event.target.value);
                    setSelectedFile(null);
                    setDocumentName("Typed compliance check");
                    setHasRun(false);
                  }}
                  placeholder="Write or paste text here if you do not want to upload a file."
                  value={draft}
                />
              </div>

              <input accept=".txt,.md,.pdf,.doc,.docx,.eml,.html,.htm,.rtf" hidden onChange={uploadDocument} ref={fileRef} type="file" />

              <div className="analysis-action-row">
                <button className="secondary-action-button" onClick={() => fileRef.current?.click()} type="button">
                  <Paperclip size={16} />
                  Choose file
                </button>
                <button className="primary-work-action run-analysis-button" disabled={loading || !canAnalyze} onClick={() => void runAnalysis()} type="button">
                  <ArrowUp size={16} />
                  {loading ? "Running analysis..." : "Run Analysis"}
                </button>
              </div>
            </div>

            {hasRun && (
              <section className="analysis-results">
                <div className="analysis-results-head">
                  <div>
                    <span className="eyebrow">Analysis result</span>
                    <h2>{visibleViolations.length ? `${visibleViolations.length} policy issue${visibleViolations.length === 1 ? "" : "s"} found` : "No risky language found"}</h2>
                  </div>
                  <button className="secondary-action-button" onClick={startNextUpload} type="button">
                    <UploadCloud size={15} />
                    Upload another
                  </button>
                </div>

                <div className="result-workspace">
                  <div className="result-document-pane">
                    <div className="result-pane-title">
                      <FileText size={16} />
                      Original document with highlighted risks
                    </div>
                    <HighlightedEditor draft={draft} mode="preview" onSelectViolation={setActiveId} violations={visibleViolations} />
                  </div>

                  <div className="result-cards-pane">
                    {(visibleViolations.length ? visibleViolations : [activeViolation]).filter(Boolean).map((violation) => (
                      <article className={violation?.id === activeViolation?.id ? "result-finding-card active" : "result-finding-card"} key={violation!.id}>
                        <div className="finding-card-top">
                          <span><AlertTriangle size={14} /> {violation!.severity}</span>
                          <small>{Math.round(violation!.confidence * 100)}% confidence</small>
                        </div>
                        <h3>{violation!.policySection}</h3>
                        <p>{violation!.explanation}</p>
                        <div className="rewrite-box">
                          <strong>Suggested rewrite</strong>
                          <span>{violation!.rewrite}</span>
                        </div>
                        <button onClick={() => applyViolationRewrite(violation!)} type="button">
                          <CheckCircle2 size={15} />
                          Apply safe rewrite
                        </button>
                      </article>
                    ))}
                    {!visibleViolations.length && (
                      <article className="result-finding-card">
                        <div className="finding-card-top">
                          <span><CheckCircle2 size={14} /> Clear</span>
                          <small>Ready to send</small>
                        </div>
                        <h3>No active violations</h3>
                        <p>This draft does not contain the seeded risky language checks.</p>
                      </article>
                    )}
                  </div>
                </div>
              </section>
            )}
          </section>

          <aside className="employee-history-panel">
            {notice && (
              <div className="history-notice" role="status">
                <NoticeBox notice={notice} onClose={() => setNotice(null)} />
              </div>
            )}
            <div className="rail-header">
              <strong><History size={16} /> Session history</strong>
              <span>{history.length} checks</span>
            </div>
            <div className="history-list">
              {history.map((item) => (
                <button key={item.id} type="button">
                  <strong>{item.title}</strong>
                  <span>{item.source}</span>
                  <small>{item.risk} · {item.time}</small>
                </button>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </WorkspaceShell>
  );
}
