import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, MailCheck, Shield, Wand2 } from "lucide-react";
import { demoDocument, runDemoComplianceCheck } from "@complylens/shared";
import "./popup.css";

function Popup() {
  const [draft, setDraft] = useState(demoDocument.split("\n\n").slice(0, 3).join("\n\n"));
  const report = useMemo(() => runDemoComplianceCheck(draft), [draft]);
  const firstViolation = report.violations[0];

  return (
    <main className="popup-shell">
      <header>
        <div className="mark">
          <Shield size={18} />
        </div>
        <div>
          <h1>PolicyGuard AI</h1>
          <p>Gmail compliance check</p>
        </div>
      </header>

      <section className="risk-meter">
        <div className="risk-score">
          <span>{report.score}%</span>
        </div>
        <div>
          <span>Risk Score</span>
          <strong>{report.status === "blocked" ? "Medium-high" : "Ready"}</strong>
          <p>{report.flaggedSections} policy risks detected.</p>
        </div>
      </section>

      <textarea value={draft} onChange={(event) => setDraft(event.target.value)} spellCheck={false} />

      {firstViolation ? (
        <motion.section animate={{ opacity: 1, y: 0 }} className="flag" initial={{ opacity: 0, y: 6 }}>
          <div className="flag-title">
            <AlertTriangle size={16} />
            <strong>{firstViolation.policySection}</strong>
          </div>
          <p>{firstViolation.explanation}</p>
          <div className="rewrite">
            <Wand2 size={15} />
            <span>{firstViolation.rewrite}</span>
          </div>
          <button>Apply rewrite</button>
        </motion.section>
      ) : (
        <section className="clean">
          <CheckCircle2 size={18} />
          <span>No violations found in this draft.</span>
        </section>
      )}

      <footer>
        <MailCheck size={15} />
        Same API as the web app
      </footer>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
