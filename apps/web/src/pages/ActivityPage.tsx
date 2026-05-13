import { Activity, Bot, CheckCircle2, FileText, GitBranch, MailCheck, ShieldCheck } from "lucide-react";
import { PanelTitle } from "../components/common/PanelTitle";
import { activityFeed, aiInsights } from "../data/productData";
import { WorkspaceShell } from "../layouts/WorkspaceShell";

const employeeHistory = [
  { title: "Vendor NDA scan", detail: "DOCX upload checked. 2 risky clauses rewritten.", time: "Today" },
  { title: "Sales email review", detail: "Pasted text checked. Guarantee language flagged.", time: "Yesterday" },
  { title: "HR note", detail: "Email draft checked. No policy issues found.", time: "May 12" }
];

export function ActivityPage() {
  const role = typeof window !== "undefined" && window.localStorage.getItem("complylens-role") === "admin" ? "admin" : "employee";

  return (
    <WorkspaceShell role={role}>
      <section className="ops-dashboard simple-dashboard">
        <div className="workspace-command-bar compact-command-bar">
          <div>
            <h1>{role === "admin" ? "Audit Trail" : "Session History"}</h1>
            <p>{role === "admin" ? "Trace scans, rewrites, uploads, policy retrieval, and reviewer decisions." : "See your previous compliance checks and what happened in each one."}</p>
          </div>
          <div className="workspace-command-status">
            <span><GitBranch size={15} /> {role === "admin" ? "4 policy retrievals" : "3 saved checks"}</span>
            <span><MailCheck size={15} /> Gmail ready</span>
          </div>
        </div>

        {role === "employee" ? (
          <div className="intelligence-grid intelligence-grid--balanced">
            <section className="ops-card wide">
              <PanelTitle label="Your checks" title="Recent compliance history" />
              <div className="activity-feed">
                {employeeHistory.map((activity) => (
                  <article className="activity-item tone-good" key={activity.title}>
                    <FileText size={16} />
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
              <PanelTitle label="Status" title="Simple summary" />
              <div className="insight-list">
                <div><CheckCircle2 size={16} /> 1 clean document</div>
                <div><ShieldCheck size={16} /> 3 safe rewrites used</div>
                <div><Activity size={16} /> No admin action needed</div>
              </div>
            </section>
          </div>
        ) : (
          <div className="intelligence-grid intelligence-grid--balanced">
            <section className="ops-card">
              <PanelTitle label="AI review queue" title="Priority observations" />
              <div className="insight-list">
                {aiInsights.map((insight) => (
                  <div key={insight}><Bot size={16} />{insight}</div>
                ))}
              </div>
            </section>

            <section className="ops-card wide">
              <PanelTitle label="Compliance log" title="Operational history" />
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
              <PanelTitle label="Reviewer actions" title="Decision states" />
              <div className="insight-list">
                <div><CheckCircle2 size={16} /> 14 rewrites accepted by owners</div>
                <div><ShieldCheck size={16} /> 6 items marked safe after review</div>
                <div><Activity size={16} /> 3 high-risk findings still open</div>
              </div>
            </section>
          </div>
        )}
      </section>
    </WorkspaceShell>
  );
}
