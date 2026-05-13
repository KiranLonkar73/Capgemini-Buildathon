import { AlertTriangle, CheckCircle2, MailCheck, MessageSquareText, ShieldCheck } from "lucide-react";
import { WorkspaceShell } from "../layouts/WorkspaceShell";

const inboxItems = [
  {
    title: "Refund guarantee in sales email",
    channel: "Gmail",
    owner: "Sales",
    severity: "High",
    action: "Rewrite before send"
  },
  {
    title: "Customer data in vendor note",
    channel: "Document upload",
    owner: "Security",
    severity: "Critical",
    action: "Block external sharing"
  },
  {
    title: "Compensation language in HR draft",
    channel: "Workspace",
    owner: "People",
    severity: "Medium",
    action: "Review policy citation"
  }
];

export function InboxPage() {
  return (
    <WorkspaceShell>
      <section className="ops-dashboard workflow-page">
        <div className="workspace-command-bar">
          <div>
            <h1>Risk Inbox</h1>
            <p>Open communications that need compliance attention before they move forward.</p>
          </div>
          <div className="workspace-command-status">
            <span><AlertTriangle size={15} /> 2 urgent</span>
            <span><CheckCircle2 size={15} /> 18 resolved today</span>
          </div>
        </div>

        <div className="workflow-grid">
          <section className="workflow-list">
            {inboxItems.map((item) => (
              <article className={`workflow-row severity-${item.severity.toLowerCase()}`} key={item.title}>
                <span className="workflow-icon">
                  {item.channel === "Gmail" ? <MailCheck size={16} /> : <MessageSquareText size={16} />}
                </span>
                <div>
                  <strong>{item.title}</strong>
                  <small>{item.channel} · {item.owner} · {item.severity} risk</small>
                </div>
                <em>{item.action}</em>
              </article>
            ))}
          </section>

          <aside className="ops-card intelligence-panel">
            <ShieldCheck size={18} />
            <strong>Operating rule</strong>
            <p>High and critical findings should not leave review until a rewrite is accepted or a compliance owner marks the item safe.</p>
          </aside>
        </div>
      </section>
    </WorkspaceShell>
  );
}
