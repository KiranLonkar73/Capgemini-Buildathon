import { Braces, CheckCircle2, KeyRound, MailCheck, MessageSquareText, Search, ShieldCheck, Sparkles, Webhook, Wand2 } from "lucide-react";
import { PanelTitle } from "../components/common/PanelTitle";
import { extensionSignals } from "../data/productData";
import { WorkspaceShell } from "../layouts/WorkspaceShell";

export function ExtensionPage() {
  return (
    <WorkspaceShell>
      <section className="page-panel extension-page">
        <div className="workspace-command-bar">
          <div>
            <h1>Integrations</h1>
            <p>Deploy compliance intelligence into Gmail, API workflows, webhooks, and internal tools.</p>
          </div>
          <div className="workspace-command-status">
            <span><MailCheck size={15} /> Chrome extension ready</span>
            <span><KeyRound size={15} /> API enabled</span>
          </div>
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
                <Sparkles size={16} /> Show FAB
              </div>
              <div className="workflow-step">
                <Search size={16} /> Scan draft
              </div>
              <div className="workflow-step">
                <MessageSquareText size={16} /> Show tooltip
              </div>
              <div className="workflow-step">
                <Wand2 size={16} /> Insert rewrite
              </div>
            </div>
          </div>
          <div className="extension-preview">
            <strong>ComplyLens Gmail</strong>
            <span className="risk-pill">Small FAB in compose</span>
            <p>Tooltip next to flagged text</p>
            <small>Policy reference, why it matters, and rewrite stay in one compact overlay.</small>
            <button type="button">Apply rewrite</button>
          </div>
        </div>
        <section className="ops-card extension-install-card">
          <PanelTitle label="How to apply the extension" title="Load it in Chrome in 4 steps" />
          <div className="extension-install-steps">
            <div><strong>1</strong><span>Run `npm run build:extension`.</span></div>
            <div><strong>2</strong><span>Open Chrome and go to `chrome://extensions`.</span></div>
            <div><strong>3</strong><span>Turn on Developer mode, then click Load unpacked.</span></div>
            <div><strong>4</strong><span>Select `/Users/lol/Docs/antigravity/capgmeini/dist/extension` and open Gmail compose.</span></div>
          </div>
          <p className="extension-install-note">
            Keep the backend running so the extension can call `/analyze`. Then click the small ComplyLens button inside Gmail compose.
          </p>
        </section>
        <div className="integration-grid">
          <article className="signal-card"><KeyRound size={18} /><span>API Keys</span><strong>Ready for backend clients</strong></article>
          <article className="signal-card"><Webhook size={18} /><span>Webhooks</span><strong>Send scan events to review tools</strong></article>
          <article className="signal-card"><Braces size={18} /><span>SDK</span><strong>POST /analyze and /rewrite</strong></article>
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
