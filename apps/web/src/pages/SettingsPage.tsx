import { FormEvent, useState } from "react";
import { BarChart3, Bell, Building2, Gauge, KeyRound, Puzzle, ShieldCheck, UserPlus, UsersRound } from "lucide-react";
import { saveCompanySettings } from "../api/complianceApi";
import { NoticeBox } from "../components/common/NoticeBox";
import { PanelTitle } from "../components/common/PanelTitle";
import { WorkspaceShell } from "../layouts/WorkspaceShell";
import type { Notice } from "../types";

const adminReports = [
  { label: "Risk stopped", value: "38", note: "messages blocked this month" },
  { label: "Top policy", value: "Privacy", note: "most common violation" },
  { label: "Rewrite use", value: "74%", note: "accepted safe rewrites" }
];

const employeePreferences = [
  { title: "File checks", copy: "PDF, DOCX, email, and typed text scans stay available from Workspace.", icon: ShieldCheck },
  { title: "History", copy: "Your previous checks are listed in the History tab and beside the workspace.", icon: Bell },
  { title: "Assigned by admin", copy: "Admins manage policy uploads, access, and company rules.", icon: UsersRound }
];

export function SettingsPage() {
  const role = typeof window !== "undefined" && window.localStorage.getItem("complylens-role") === "admin" ? "admin" : "employee";
  const [notice, setNotice] = useState<Notice>(null);
  const [saving, setSaving] = useState(false);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    try {
      await saveCompanySettings({
        organizationId: "demo-org",
        organizationName: String(form.get("organizationName") ?? "Demo Enterprise"),
        threshold: Number(form.get("threshold") ?? 0.62),
        activePolicySet: String(form.get("activePolicySet") ?? "seeded-enterprise-policy")
      });
      setNotice({ kind: "success", text: "Workspace settings saved." });
    } catch (error) {
      setNotice({
        kind: "error",
        text: `Could not save settings. ${error instanceof Error ? error.message.slice(0, 140) : ""}`
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <WorkspaceShell role={role}>
      <section className="page-panel settings-page">
        <div className="workspace-command-bar compact-command-bar">
          <div>
            <h1>{role === "admin" ? "Admin & Profile" : "Settings & Profile"}</h1>
            <p>{role === "admin" ? "Manage people, policies, extension setup, company profile, and simple risk reports." : "Manage your employee profile and review how compliance checks work."}</p>
          </div>
          <div className="workspace-command-status">
            <span><Gauge size={15} /> Threshold 0.62</span>
            <span><ShieldCheck size={15} /> Human review active</span>
          </div>
        </div>
        {notice && <NoticeBox notice={notice} onClose={() => setNotice(null)} />}

        <div className="settings-grid settings-grid--wide">
          <form className="settings-form" onSubmit={save}>
            <PanelTitle label={role === "admin" ? "Organization" : "Profile"} title={role === "admin" ? "Company profile" : "Employee account"} />
            <label>
              {role === "admin" ? "Organization name" : "Name"}
              <input defaultValue={role === "admin" ? "Demo Enterprise" : "Employee User"} name="organizationName" />
            </label>
            <label>
              Work email
              <input defaultValue={role === "admin" ? "admin@demo-enterprise.com" : "employee@demo-enterprise.com"} name="email" />
            </label>
            {role === "admin" && (
              <>
                <label>
                  Active policy set
                  <input defaultValue="seeded-enterprise-policy" name="activePolicySet" />
                </label>
                <label>
                  Confidence threshold
                  <input defaultValue="0.62" max="0.95" min="0.2" name="threshold" step="0.01" type="number" />
                </label>
              </>
            )}
            <button className="primary-action" disabled={saving} type="submit">
              {saving ? "Saving..." : "Save"}
            </button>
          </form>

          {role === "admin" ? (
            <div className="admin-control-stack">
              <section className="ops-card">
                <PanelTitle label="Team access" title="Assign employee login" />
                <div className="employee-invite-row">
                  <UserPlus size={18} />
                  <div>
                    <strong>Invite employee</strong>
                    <span>employee@company.com · Workspace checks only</span>
                  </div>
                  <button type="button">Send</button>
                </div>
              </section>

              <section className="ops-card">
                <PanelTitle label="Simple reports" title="Admin risk view" />
                <div className="admin-report-grid">
                  {adminReports.map((report) => (
                    <div key={report.label}>
                      <BarChart3 size={17} />
                      <span>{report.label}</span>
                      <strong>{report.value}</strong>
                      <small>{report.note}</small>
                    </div>
                  ))}
                </div>
              </section>

              <section className="ops-card">
                <PanelTitle label="Extension" title="Gmail deployment" />
                <div className="integration-setup-card">
                  <Puzzle size={18} />
                  <div>
                    <strong>Chrome extension package ready</strong>
                    <span>Load `apps/extension/dist` in Chrome after running `npm run build:extension`.</span>
                  </div>
                </div>
                <div className="integration-setup-card">
                  <KeyRound size={18} />
                  <div>
                    <strong>API endpoint</strong>
                    <span>Connect extension calls to the backend analysis route before production use.</span>
                  </div>
                </div>
              </section>
            </div>
          ) : (
            <aside className="settings-side">
              {employeePreferences.map(({ title, copy, icon: Icon }) => (
                <article key={title}>
                  <Icon size={18} />
                  <div>
                    <strong>{title}</strong>
                    <span>{copy}</span>
                  </div>
                </article>
              ))}
            </aside>
          )}
        </div>
      </section>
    </WorkspaceShell>
  );
}
