import { BarChart3, CheckCircle2, MessageSquareWarning, TrendingDown } from "lucide-react";
import { PanelTitle } from "../components/common/PanelTitle";
import { dashboardMetrics, policyViolationShare, riskHeatmap, teamAnalytics, trendPoints } from "../data/productData";
import { WorkspaceShell } from "../layouts/WorkspaceShell";

export function AnalyticsPage() {
  return (
    <WorkspaceShell>
      <section className="ops-dashboard simple-dashboard">
        <div className="workspace-command-bar">
          <div>
            <h1>Risk Intelligence</h1>
            <p>Operational signals for blocked risk, rewrite adoption, reviewer agreement, and policy drift.</p>
          </div>
          <div className="workspace-command-status">
            <span><TrendingDown size={15} /> Risk down 22%</span>
            <span><CheckCircle2 size={15} /> 81% rewrites accepted</span>
          </div>
        </div>

        <div className="metric-grid">
          {dashboardMetrics.map((metric) => (
            <article className={`metric-card tone-${metric.tone}`} key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}<small>{metric.suffix}</small></strong>
              <em>{metric.delta}</em>
            </article>
          ))}
        </div>

        <div className="intelligence-grid">
          <section className="ops-card">
            <PanelTitle label="Risk concentration" title="Departments with spikes" />
            <div className="heatmap-list">
              {riskHeatmap.map(([label, value, tone]) => (
                <div className={`heatmap-row tone-${tone}`} key={label}>
                  <span>{label}</span>
                  <div><i style={{ width: `${value}%` }} /></div>
                  <strong>{value}%</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="ops-card">
            <PanelTitle label="Compliance timeline" title="Weekly risk prevented" />
            <div className="trend-chart">
              {trendPoints.map((point, index) => <i key={`${point}-${index}`} style={{ height: `${point}%` }} />)}
            </div>
          </section>

          <section className="ops-card">
            <PanelTitle label="Policy intelligence" title="Most violated rules" />
            <div className="heatmap-list">
              {policyViolationShare.map(([label, value, tone]) => (
                <div className={`heatmap-row tone-${tone}`} key={label}>
                  <span>{label}</span>
                  <div><i style={{ width: `${value}%` }} /></div>
                  <strong>{value}%</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="ops-card team-policy-card">
            <PanelTitle label="AI accuracy" title="Reviewer agreement by team" />
            <div className="team-table">
              {teamAnalytics.map((team) => (
                <div key={team.team}>
                  <span>{team.team}</span>
                  <strong>{team.score}%</strong>
                  <small>{team.scanned} scans · {team.risks} risks</small>
                </div>
              ))}
            </div>
          </section>
          <section className="ops-card">
            <PanelTitle label="Unsafe phrase patterns" title="Repeated communication risk" />
            <div className="insight-list">
              <div><MessageSquareWarning size={16} /> Guaranteed refund language in sales outreach</div>
              <div><MessageSquareWarning size={16} /> Customer records shared outside approved systems</div>
              <div><MessageSquareWarning size={16} /> Forward-looking claims without finance disclaimer</div>
            </div>
          </section>
        </div>
      </section>
    </WorkspaceShell>
  );
}
