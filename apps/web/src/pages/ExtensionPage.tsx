import { CheckCircle2, MailCheck, MessageSquareText, Search, ShieldCheck, Wand2 } from "lucide-react";
import { PanelTitle } from "../components/common/PanelTitle";
import { extensionSignals } from "../data/productData";
import { WorkspaceShell } from "../layouts/WorkspaceShell";

export function ExtensionPage() {
  return (
    <WorkspaceShell>
      <section className="page-panel extension-page">
        <div className="page-hero">
          <div>
            <span className="eyebrow">Gmail extension</span>
            <h1>Policy intelligence directly inside enterprise email.</h1>
            <p>Detect compose windows, scan drafts, cite policies, and insert safe rewrites without changing user behavior.</p>
          </div>
          <div className="page-hero-metric"><MailCheck size={18} /><strong>0.9s</strong><span>median scan latency</span></div>
        </div>
        <div className="extension-showcase">
          <div>
            <h3>How Gmail uses ComplyLens</h3>
            <p>
              The content script detects compose windows, sends draft text to the same `/analyze` backend, displays
              inline risk context, and can insert an approved rewrite into the compose body.
            </p>
            <div className="workflow-steps compact">
              <div className="workflow-step">
                <MailCheck size={16} /> Detect compose
              </div>
              <div className="workflow-step">
                <Search size={16} /> Scan draft
              </div>
              <div className="workflow-step">
                <Wand2 size={16} /> Insert rewrite
              </div>
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
        <div className="extension-ops-grid">
          {extensionSignals.map((signal) => (
            <article className="signal-card" key={signal.label}>
              <signal.icon size={18} />
              <span>{signal.label}</span>
              <strong>{signal.status}</strong>
            </article>
          ))}
        </div>
        <div className="gmail-flow">
          <div><MessageSquareText size={18} /> Draft captured</div>
          <div><Search size={18} /> Policy context retrieved</div>
          <div><ShieldCheck size={18} /> Risk explained</div>
          <div><Wand2 size={18} /> Rewrite inserted</div>
          <div><CheckCircle2 size={18} /> Audit logged</div>
        </div>
      </section>
    </WorkspaceShell>
  );
}
