import { motion } from "framer-motion";
import { CheckCircle2, RefreshCw, SlidersHorizontal, Wand2 } from "lucide-react";
import { severityLabel, type ComplianceReport, type Violation } from "@complylens/shared";
import { PanelTitle } from "../../components/common/PanelTitle";
import { SlidingNumber } from "../../components/animate-ui/primitives/texts/sliding-number";
import AnimatedButton from "../../components/ui/animated-button";

export function FindingsPanel({
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
        <div className="score-ring">
          <span>
            <SlidingNumber number={report.score} />%
          </span>
        </div>
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
            <input
              max="0.95"
              min="0.2"
              onChange={(event) => onThreshold(Number(event.target.value))}
              step="0.01"
              type="range"
              value={threshold}
            />
          </label>
        </div>
        <PanelTitle label="AI findings" title={`${violations.length} visible violations`} />
        <div className="finding-list">
          {loading && (
            <div className="empty-state">
              <RefreshCw size={16} /> Analyzing draft...
            </div>
          )}
          {!loading && violations.length === 0 && (
            <div className="empty-state">
              <CheckCircle2 size={16} /> No visible violations. {hiddenCount ? `${hiddenCount} hidden.` : ""}
            </div>
          )}
          {violations.map((violation) => (
            <button
              className={`finding-row ${violation.id === activeViolation?.id ? "active" : ""}`}
              key={violation.id}
              onClick={() => onSelectViolation(violation.id)}
              type="button"
            >
              <span className={`severity-dot severity-dot--${violation.severity}`} />
              <div>
                <strong>{violation.policySection}</strong>
                <small>
                  {severityLabel(violation.severity)} · {Math.round(violation.confidence * 100)}% confidence
                </small>
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
          <div className="rewrite-box">
            <Wand2 size={16} />
            <span>{activeViolation.rewrite}</span>
          </div>
          <div className="assistant-actions">
            <AnimatedButton className="apply-button" onClick={() => onApply(activeViolation)} type="button">
              Apply rewrite
            </AnimatedButton>
            <button onClick={() => onMarkSafe(activeViolation.id)} type="button">
              Mark safe
            </button>
            <button onClick={() => onDismiss(activeViolation.id)} type="button">
              Dismiss
            </button>
          </div>
        </motion.section>
      )}
    </aside>
  );
}
