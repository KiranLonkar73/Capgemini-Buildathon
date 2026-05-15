import { useEffect, useMemo, useState } from "react";
import { Activity, Bot, CheckCircle2, Download, FileText, GitBranch, MailCheck, ShieldCheck } from "lucide-react";
import { PanelTitle } from "../components/common/PanelTitle";
import { activityFeed, aiInsights } from "../data/productData";
import { WorkspaceShell } from "../layouts/WorkspaceShell";
import { listAuditEvents, markAuditEventReviewed } from "../api/complianceApi";
import type { AuditEvent } from "@complylens/shared";

const employeeHistory = [
  { title: "Vendor NDA scan", detail: "DOCX upload checked. 2 risky clauses rewritten.", time: "Today" },
  { title: "Sales email review", detail: "Pasted text checked. Guarantee language flagged.", time: "Yesterday" },
  { title: "HR note", detail: "Email draft checked. No policy issues found.", time: "May 12" }
];

type AuditEventRow = AuditEvent & { tone?: string };

const seededAuditEvents: AuditEventRow[] = activityFeed.map((activity, index) => ({
  ...activity,
  id: `audit-${index}`,
  status: index < 2 ? "open" as const : "reviewed" as const,
  owner: index % 2 === 0 ? "Legal" : "Compliance",
  department: index % 2 === 0 ? "Legal" : "Sales",
  eventType: "scan" as const
}));
const departments = ["All", "Legal", "Sales", "HR", "Security", "Finance"];

export function ActivityPage() {
  const role = typeof window !== "undefined" && window.localStorage.getItem("complylens-role") === "admin" ? "admin" : "employee";
  const [filter, setFilter] = useState<"all" | "open" | "reviewed">("all");
  const [department, setDepartment] = useState("All");
  const [auditEvents, setAuditEvents] = useState<AuditEventRow[]>(seededAuditEvents);

  useEffect(() => {
    if (role === "admin") void refreshAuditEvents();
  }, [role, department]);

  async function refreshAuditEvents() {
    try {
      const events = await listAuditEvents(department);
      setAuditEvents(events.length ? events : seededAuditEvents);
    } catch {
      setAuditEvents(seededAuditEvents);
    }
  }

  const visibleAuditEvents = useMemo(
    () => auditEvents.filter((event) => filter === "all" || event.status === filter),
    [auditEvents, filter]
  );

  async function markReviewed(id: string) {
    try {
      const updated = await markAuditEventReviewed(id);
      setAuditEvents((events) => events.map((event) => event.id === id ? updated : event));
      return;
    } catch {
      // keep local demo behavior available when backend is offline
    }
    setAuditEvents((events) => events.map((event) => event.id === id ? { ...event, status: "reviewed" } : event));
  }

  function exportAudit() {
    const csv = [
      "title,detail,owner,status,time",
      ...visibleAuditEvents.map((event) => `"${event.title}","${event.detail}","${event.owner}","${event.status}","${event.time}"`)
    ].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "complylens-audit-trail.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <WorkspaceShell role={role}>
      <section className="ops-dashboard simple-dashboard">
        <div className="workspace-command-bar compact-command-bar">
          <div>
            <h1>{role === "admin" ? "Audit Trail" : "Session History"}</h1>
            <p>{role === "admin" ? "Filter, review, and export scans, rewrites, uploads, policy retrieval, and extension events." : "See your previous compliance checks and what happened in each one."}</p>
          </div>
          <div className="workspace-command-status">
            <span><GitBranch size={15} /> {role === "admin" ? `${visibleAuditEvents.length} events shown` : "3 saved checks"}</span>
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
          <div className="audit-workspace">
            <section className="ops-card audit-control-card">
              <PanelTitle label="Audit controls" title="Working review queue" />
              <div className="audit-filter-row">
                {(["all", "open", "reviewed"] as const).map((item) => (
                  <button className={filter === item ? "active" : ""} key={item} onClick={() => setFilter(item)} type="button">
                    {item}
                  </button>
                ))}
              </div>
              <label className="audit-department-filter">
                Department
                <select value={department} onChange={(event) => setDepartment(event.target.value)}>
                  {departments.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <button className="secondary-action-button audit-export-button" onClick={exportAudit} type="button">
                <Download size={15} />
                Export CSV
              </button>
              <div className="insight-list">
                {aiInsights.slice(0, 2).map((insight) => (
                  <div key={insight}><Bot size={16} />{insight}</div>
                ))}
              </div>
            </section>

            <section className="ops-card wide">
              <PanelTitle label="Compliance log" title="Operational history" />
              <div className="activity-feed audit-feed">
                {visibleAuditEvents.map((activity) => (
                  <article className={`activity-item tone-${activity.tone}`} key={activity.id}>
                    <Activity size={16} />
                    <div>
                      <strong>{activity.title}</strong>
                      <span>{activity.detail}</span>
                      <small>{activity.owner} · {activity.status}</small>
                    </div>
                    <div className="audit-actions">
                      <time>{activity.time}</time>
                      {activity.status === "open" && (
                        <button onClick={() => void markReviewed(activity.id)} type="button">
                          Mark reviewed
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}
      </section>
    </WorkspaceShell>
  );
}
