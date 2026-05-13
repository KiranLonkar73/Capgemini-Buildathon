import { Activity, Bot, CheckCircle2, GitBranch, MailCheck, ShieldCheck, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { samplePolicies } from "@complylens/shared";
import { PanelTitle } from "../components/common/PanelTitle";
import { activityFeed, aiInsights, policySystems } from "../data/productData";
import { WorkspaceShell } from "../layouts/WorkspaceShell";

export function ActivityPage() {
  return (
    <WorkspaceShell>
      <section className="ops-dashboard simple-dashboard">
        <div className="workspace-command-bar">
          <div>
            <h1>Audit Trail</h1>
            <p>Trace scans, rewrites, policy retrieval, Gmail events, uploads, and reviewer decisions.</p>
          </div>
          <div className="workspace-command-status">
            <span><GitBranch size={15} /> 4 policy retrievals</span>
            <span><MailCheck size={15} /> 1 Gmail event</span>
          </div>
        </div>

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
            <PanelTitle label="Policy intelligence center" title="Active rulebase" />
            <Link className="upload-card" to="/policies">
              <Upload size={18} />
              <span>
                <strong>Manage policies</strong>
                <small>Upload company PDF, DOC, DOCX, EML, HTML, MD, RTF, or TXT policy docs</small>
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
          <section className="ops-card">
            <PanelTitle label="Reviewer actions" title="Decision states" />
            <div className="insight-list">
              <div><CheckCircle2 size={16} /> 14 rewrites accepted by owners</div>
              <div><ShieldCheck size={16} /> 6 items marked safe after review</div>
              <div><Activity size={16} /> 3 high-risk findings still open</div>
            </div>
          </section>
        </div>
      </section>
    </WorkspaceShell>
  );
}
