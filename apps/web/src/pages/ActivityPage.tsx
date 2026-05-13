import { Activity, Bot, ShieldCheck, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { samplePolicies } from "@complylens/shared";
import { PanelTitle } from "../components/common/PanelTitle";
import { activityFeed, aiInsights, policySystems } from "../data/productData";
import { WorkspaceShell } from "../layouts/WorkspaceShell";

export function ActivityPage() {
  return (
    <WorkspaceShell>
      <section className="ops-dashboard">
        <div className="dashboard-command dashboard-command--compact">
          <div className="command-copy">
            <span className="eyebrow">AI operations</span>
            <h1>Insights, activity, and policy context in one place.</h1>
            <p>Keep operational signals away from the scanner so reviewers can focus while ops teams still have traceability.</p>
          </div>
          <div className="command-side">
            <div className="command-status">
              <span className="pulse-dot idle" />
              Audit ready
            </div>
            <div className="command-mini-grid">
              <span><Bot size={15} /> {aiInsights.length} priority insights</span>
              <span><Activity size={15} /> {activityFeed.length} recent events</span>
            </div>
          </div>
        </div>

        <div className="intelligence-grid intelligence-grid--balanced">
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
            <Link className="upload-card" to="/policies">
              <Upload size={18} />
              <span>
                <strong>Manage policies</strong>
                <small>Upload company PDF, DOCX, TXT policy docs</small>
              </span>
            </Link>
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
            <PanelTitle label="Policy systems" title="Coverage and ownership" />
            <div className="policy-system-list compact-systems">
              {policySystems.map((policy) => (
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
