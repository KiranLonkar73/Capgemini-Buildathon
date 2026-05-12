import { MailCheck, Search, Wand2 } from "lucide-react";
import { PanelTitle } from "../components/common/PanelTitle";
import { WorkspaceShell } from "../layouts/WorkspaceShell";

export function ExtensionPage() {
  return (
    <WorkspaceShell>
      <section className="page-panel extension-page">
        <PanelTitle label="Gmail integration" title="Chrome extension workflow" />
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
      </section>
    </WorkspaceShell>
  );
}
