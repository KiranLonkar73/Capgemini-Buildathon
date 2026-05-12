import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  History,
  Layers3,
  MailCheck,
  Scale,
  Shield,
  Sparkles,
  Upload,
  Wand2
} from "lucide-react";
import { demoDocument, runDemoComplianceCheck, samplePolicies, severityLabel, type Violation } from "@complylens/shared";

const navItems = [
  { label: "Review", icon: FileText },
  { label: "Policies", icon: Shield },
  { label: "Risk Levels", icon: Scale },
  { label: "History", icon: History }
];

export function App() {
  const [draft] = useState(demoDocument);
  const [activeViolationId, setActiveViolationId] = useState("v-1");
  const report = useMemo(() => runDemoComplianceCheck(draft), [draft]);
  const activeViolation: Violation | undefined =
    report.violations.find((violation) => violation.id === activeViolationId) ?? report.violations[0];

  return (
    <main className="app-shell">
      <header className="top-nav">
        <div className="brand">
          <span className="brand-icon">
            <Shield size={18} />
          </span>
          <div>
            <strong>ComplyLens</strong>
            <span>Enterprise AI compliance review</span>
          </div>
        </div>

        <nav aria-label="Workspace navigation">
          {navItems.map((item, index) => (
            <a className={index === 0 ? "active" : ""} href="#review" key={item.label}>
              <item.icon size={16} />
              {item.label}
            </a>
          ))}
        </nav>

        <button className="primary-action">
          Run analysis
          <ArrowRight size={16} />
        </button>
      </header>

      <section className="product-grid">
        <aside className="left-panel">
          <div className="panel-title">
            <span>Policy Control</span>
            <h2>Rulebase</h2>
          </div>

          <button className="upload-card">
            <Upload size={18} />
            <span>
              <strong>Upload policies</strong>
              <small>PDF, DOCX, XLSX</small>
            </span>
          </button>

          <div className="policy-stack">
            {samplePolicies.map((policy) => (
              <article className="policy-chip" key={policy.id}>
                <span>{policy.owner}</span>
                <div>
                  <strong>{policy.policy}</strong>
                  <small>{policy.section}</small>
                </div>
              </article>
            ))}
          </div>

          <div className="control-metrics">
            <div>
              <strong>4</strong>
              <span>Policy sets</span>
            </div>
            <div>
              <strong>0.70</strong>
              <span>Flag threshold</span>
            </div>
          </div>
        </aside>

        <section className="main-canvas" id="review">
          <div className="canvas-header">
            <div>
              <span>Document Canvas</span>
              <h1>Draft under review</h1>
            </div>
            <div className="scan-state">
              <span className="pulse-dot" />
              Scanning policies
            </div>
          </div>

          <div className="document-shell">
            <div className="document-toolbar">
              <span>
                <FileText size={15} />
                Vendor_Email_Draft.txt
              </span>
              <button>Upload file</button>
            </div>
            <HighlightedDocument
              draft={draft}
              onSelectViolation={setActiveViolationId}
              violations={report.violations}
            />
          </div>
        </section>

        <aside className="right-panel">
          <motion.section
            animate={{ opacity: 1, y: 0 }}
            className="risk-card"
            initial={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.22 }}
          >
            <div className="risk-ring" aria-label={`Compliance score ${report.score}%`}>
              <span>{report.score}%</span>
            </div>
            <div>
              <span>Risk Score</span>
              <h2>{report.status === "blocked" ? "High attention" : "Review ready"}</h2>
              <p>{report.flaggedSections} policy findings need validation.</p>
            </div>
          </motion.section>

          <section className="findings-panel">
            <div className="panel-title">
              <span>AI Findings</span>
              <h2>Violations</h2>
            </div>
            <div className="finding-list">
              {report.violations.map((violation) => (
                <button
                  className={`finding-row ${violation.id === activeViolation?.id ? "active" : ""}`}
                  key={violation.id}
                  onClick={() => setActiveViolationId(violation.id)}
                >
                  <span className={`severity-dot severity-dot--${violation.severity}`} />
                  <div>
                    <strong>{violation.policySection}</strong>
                    <small>{severityLabel(violation.severity)} risk · {Math.round(violation.confidence * 100)}%</small>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {activeViolation && (
            <motion.section
              animate={{ opacity: 1, y: 0 }}
              className="assistant-panel"
              initial={{ opacity: 0, y: 8 }}
              key={activeViolation.id}
              transition={{ duration: 0.2 }}
            >
              <div className="panel-title">
                <span>Explanation</span>
                <h2>{activeViolation.policyName}</h2>
              </div>
              <p>{activeViolation.explanation}</p>
              <blockquote>{activeViolation.quote}</blockquote>
              <div className="rewrite-box">
                <Wand2 size={16} />
                <span>{activeViolation.rewrite}</span>
              </div>
              <button className="secondary-action">Apply rewrite</button>
            </motion.section>
          )}
        </aside>
      </section>

      <footer className="ai-status-bar">
        <div>
          <Sparkles size={15} />
          AI review engine ready
        </div>
        <div>
          <AlertTriangle size={15} />
          {report.flaggedSections} violations
        </div>
        <div>
          <CheckCircle2 size={15} />
          {report.cleanSections} clean sections
        </div>
        <div>
          <Clock3 size={15} />
          Last checked just now
        </div>
        <div>
          <MailCheck size={15} />
          Gmail extension shares this workflow
        </div>
        <div>
          <Layers3 size={15} />
          Backend RAG pending
        </div>
      </footer>
    </main>
  );
}

function HighlightedDocument({
  draft,
  onSelectViolation,
  violations
}: {
  draft: string;
  onSelectViolation: (id: string) => void;
  violations: Violation[];
}) {
  const violationByQuote = new Map(violations.map((violation) => [violation.quote, violation]));

  return (
    <div className="document-content">
      {draft.split(/\n\s*\n/).map((paragraph, paragraphIndex) => {
        const match = violations.find((violation) => paragraph.includes(violation.quote));

        if (!match) {
          return <p key={`${paragraph}-${paragraphIndex}`}>{paragraph}</p>;
        }

        const [before, after] = paragraph.split(match.quote);
        const violation = violationByQuote.get(match.quote);

        return (
          <p key={`${paragraph}-${paragraphIndex}`}>
            {before}
            <button
              className={`inline-flag inline-flag--${violation?.severity ?? "medium"}`}
              onClick={() => onSelectViolation(match.id)}
              type="button"
            >
              {match.quote}
            </button>
            {after}
          </p>
        );
      })}
    </div>
  );
}
