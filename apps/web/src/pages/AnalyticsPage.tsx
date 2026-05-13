import { BarChart3, Bot, Network } from "lucide-react";
import { PanelTitle } from "../components/common/PanelTitle";
import { dashboardMetrics, policySystems, riskHeatmap, teamAnalytics, trendPoints } from "../data/productData";
import { WorkspaceShell } from "../layouts/WorkspaceShell";

export function AnalyticsPage() {
  return (
    <WorkspaceShell>
      <section className="ops-dashboard">
        <div className="dashboard-command dashboard-command--compact">
          <div className="command-copy">
            <span className="eyebrow">Analytics</span>
            <h1>Risk signals, score movement, and team coverage.</h1>
            <p>Use this page for reporting and operational review. The document scanner stays separate in Review.</p>
          </div>
          <div className="command-side">
            <div className="command-status">
              <span className="pulse-dot idle" />
              Reporting view
            </div>
            <div className="command-mini-grid">
              <span><Network size={15} /> {policySystems.length} policy systems</span>
              <span><BarChart3 size={15} /> {teamAnalytics.length} team segments</span>
            </div>
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

        <div className="dashboard-focus-strip" aria-label="Analytics focus areas">
          <article>
            <span className="premium-icon"><Network size={18} /></span>
            <div>
              <strong>Policy memory online</strong>
              <p>{policySystems[0].coverage}% coverage across customer data and commercial communication controls.</p>
            </div>
          </article>
          <article>
            <span className="premium-icon"><Bot size={18} /></span>
            <div>
              <strong>Risk pattern detection</strong>
              <p>Review trends without leaving the analytics surface.</p>
            </div>
          </article>
          <article>
            <span className="premium-icon"><BarChart3 size={18} /></span>
            <div>
              <strong>Team performance</strong>
              <p>Compare scan volume, residual risk, and score by team.</p>
            </div>
          </article>
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
