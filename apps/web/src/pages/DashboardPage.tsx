import { ChangeEvent, useRef, useState } from "react";
import { FileText, Upload } from "lucide-react";
import {
  applyRewrite,
  demoDocument,
  runDemoComplianceCheck,
  samplePolicies,
  type ComplianceReport,
  type Violation
} from "@complylens/shared";
import { analyzeDocument, analyzeUploadedDocument } from "../api/complianceApi";
import { NoticeBox } from "../components/common/NoticeBox";
import { PanelTitle } from "../components/common/PanelTitle";
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
      <section className="workspace-layout">
        <aside className="policy-sidebar">
          <PanelTitle label="Policy library" title="Active rulebase" />
          <a className="upload-card" href="/policies">
            <Upload size={18} />
            <span>
              <strong>Manage policies</strong>
              <small>Upload company PDF, DOCX, TXT policy docs</small>
            </span>
          </a>
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
                <button onClick={pasteText} type="button">
                  Paste demo
                </button>
                <button onClick={() => fileRef.current?.click()} type="button">
                  Upload file
                </button>
                <button disabled={loading} onClick={() => void analyze()} type="button">
                  {loading ? "Running..." : "Run analysis"}
                </button>
              </div>
              <input accept=".txt,.pdf,.docx" hidden onChange={uploadDocument} ref={fileRef} type="file" />
            </div>
            <HighlightedEditor draft={draft} onChange={setDraft} onSelectViolation={setActiveId} violations={visibleViolations} />
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
