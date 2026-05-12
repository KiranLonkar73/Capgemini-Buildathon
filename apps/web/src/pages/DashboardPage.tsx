import { ChangeEvent, useRef, useState } from "react";
import { Activity, BarChart3, Bot, DatabaseZap, FileText, MailCheck, Network, ShieldCheck, Upload } from "lucide-react";
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
import {
  activityFeed,
  aiInsights,
  dashboardMetrics,
  policySystems,
  riskHeatmap,
  teamAnalytics,
  trendPoints
} from "../data/productData";
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
      <section className="ops-dashboard">
        <div className="dashboard-command">
          <div className="command-copy">
            <span className="eyebrow">Compliance operations command center</span>
            <h1>Live policy intelligence across enterprise communication.</h1>
            <p>Monitor active scans, policy systems, rewrite activity, and high-confidence risk signals in one operating surface.</p>
          </div>
          <div className="command-side">
            <div className="command-status">
              <span className={loading ? "pulse-dot" : "pulse-dot idle"} />
              {loading ? "AI scan running" : report.source === "backend" ? "Backend connected" : "Seeded demo mode"}
            </div>
            <div className="command-mini-grid">
              <span><DatabaseZap size={15} /> {policySystems.length} active policy sets</span>
              <span><MailCheck size={15} /> Gmail-ready workflow</span>
            </div>
          </div>
        </div>

        <div className="metric-grid">
          {dashboardMetrics.map((metric) => (
            <article className={`metric-card tone-${metric.tone}`} key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}<small>{metric.suffix}</small></strong>
              <em>{metric.delta}</em>
            </article>
          ))}
        </div>

        <div className="dashboard-focus-strip" aria-label="Operational focus areas">
          <article>
            <span className="premium-icon"><Network size={18} /></span>
            <div>
              <strong>Policy memory online</strong>
              <p>{policySystems[0].coverage}% coverage across customer data and commercial communication controls.</p>
            </div>
          </article>
          <article>
            <span className="premium-icon"><Bot size={18} /></span>
            <div>
              <strong>{visibleViolations.length || report.flaggedSections} findings in review</strong>
              <p>Threshold set to {Math.round(threshold * 100)}%; dismissed findings stay auditable.</p>
            </div>
          </article>
          <article>
            <span className="premium-icon"><BarChart3 size={18} /></span>
            <div>
              <strong>Risk trend improving</strong>
              <p>Rewrite-assisted teams are resolving high-risk language before escalation.</p>
            </div>
          </article>
        </div>

        <div className="ops-grid">
          <section className="analysis-workbench">
            <div className="review-header">
              <PanelTitle label="Document review" title="Outbound vendor email" />
              <div className="scan-state">
                <span className={loading ? "pulse-dot" : "pulse-dot idle"} />
                {loading ? "Scanning policies" : `${report.flaggedSections} findings`}
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
                  <button disabled={loading} onClick={() => void analyze()} type="button">{loading ? "Running..." : "Run analysis"}</button>
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
        </div>

        <div className="intelligence-grid">
          <section className="ops-card">
            <PanelTitle label="Live risk monitoring" title="Risk heatmap" />
            <div className="heatmap-list">
              {riskHeatmap.map(([label, value, tone]) => (
                <div className={`heatmap-row tone-${tone}`} key={label}>
                  <span>{label}</span>
                  <div><i style={{ width: `${value}%` }} /></div>
                  <strong>{value}%</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="ops-card">
            <PanelTitle label="Compliance trends" title="Risk reduction over time" />
            <div className="trend-chart">
              {trendPoints.map((point, index) => <i key={`${point}-${index}`} style={{ height: `${point}%` }} />)}
            </div>
          </section>

          <section className="ops-card">
            <PanelTitle label="AI insights feed" title="Priority observations" />
            <div className="insight-list">
              {aiInsights.map((insight) => (
                <div key={insight}><Bot size={16} />{insight}</div>
              ))}
            </div>
          </section>

          <section className="ops-card wide">
            <PanelTitle label="Enterprise communication activity" title="Audit and workflow history" />
            <div className="activity-feed">
              {activityFeed.map((activity) => (
                <article className={`activity-item tone-${activity.tone}`} key={activity.title}>
                  <Activity size={16} />
                  <div>
                    <strong>{activity.title}</strong>
                    <span>{activity.detail}</span>
                  </div>
                  <time>{activity.time}</time>
                </article>
              ))}
            </div>
          </section>

          <section className="ops-card">
            <PanelTitle label="Policy intelligence center" title="Active rulebase" />
            <a className="upload-card" href="/policies">
              <Upload size={18} />
              <span>
                <strong>Manage policies</strong>
                <small>Upload company PDF, DOCX, TXT policy docs</small>
              </span>
            </a>
            <div className="policy-list compact">
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
          </section>

          <section className="ops-card team-policy-card">
            <PanelTitle label="Teams and policy coverage" title="Where risk is concentrated" />
            <div className="team-table">
              {teamAnalytics.slice(0, 3).map((team) => (
                <div key={team.team}>
                  <span>{team.team}</span>
                  <strong>{team.score}%</strong>
                  <small>{team.scanned} scans · {team.risks} risks</small>
                </div>
              ))}
            </div>
            <div className="policy-system-list compact-systems">
              {policySystems.slice(0, 2).map((policy) => (
                <div key={policy.name}>
                  <ShieldCheck size={16} />
                  <span>{policy.name}</span>
                  <strong>{policy.coverage}%</strong>
                  <small>{policy.passages} passages · {policy.owner}</small>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </WorkspaceShell>
  );
}
