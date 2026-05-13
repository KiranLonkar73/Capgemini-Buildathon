import { BarChart3 } from "lucide-react";
import { PanelTitle } from "../components/common/PanelTitle";
import { dashboardMetrics, riskHeatmap, teamAnalytics, trendPoints } from "../data/productData";
import { WorkspaceShell } from "../layouts/WorkspaceShell";

export function AnalyticsPage() {
  return (
    <WorkspaceShell>
      <section className="ops-dashboard simple-dashboard">
        <div className="simple-page-head">
          <span className="premium-icon"><BarChart3 size={18} /></span>
          <div>
            <h1>Reports</h1>
            <p>Simple numbers about risk and team progress.</p>
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
            <PanelTitle label="Live risk monitoring" title="Risk heatmap" />
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
            <PanelTitle label="Compliance trends" title="Risk reduction over time" />
            <div className="trend-chart">
              {trendPoints.map((point, index) => <i key={`${point}-${index}`} style={{ height: `${point}%` }} />)}
            </div>
          </section>

          <section className="ops-card team-policy-card">
            <PanelTitle label="Teams and policy coverage" title="Where risk is concentrated" />
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
        </div>
      </section>
    </WorkspaceShell>
  );
}
