import { FormEvent, useState } from "react";
import { Bell, Building2, Gauge, KeyRound, ShieldCheck } from "lucide-react";
import { saveCompanySettings } from "../api/complianceApi";
import { NoticeBox } from "../components/common/NoticeBox";
import { PanelTitle } from "../components/common/PanelTitle";
import { WorkspaceShell } from "../layouts/WorkspaceShell";
import type { Notice } from "../types";

const settingsControls = [
  { title: "SSO readiness", copy: "SAML and SCIM hooks prepared for enterprise identity.", icon: Building2 },
  { title: "API access", copy: "Backend endpoints ready for web and extension clients.", icon: KeyRound },
  { title: "Review alerts", copy: "High-risk findings route to compliance owners.", icon: Bell },
  { title: "Human governance", copy: "Dismiss and mark-safe actions remain auditable.", icon: ShieldCheck }
];

export function SettingsPage() {
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
      setNotice({ kind: "success", text: "Company settings saved to backend." });
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
    <WorkspaceShell>
      <section className="page-panel settings-page">
        <div className="workspace-command-bar">
          <div>
            <h1>Workspace Settings</h1>
            <p>Configure organization identity, confidence thresholds, active policy memory, and review behavior.</p>
          </div>
          <div className="workspace-command-status">
            <span><Gauge size={15} /> Default threshold 0.62</span>
            <span><ShieldCheck size={15} /> Human review active</span>
          </div>
        </div>
        {notice && <NoticeBox notice={notice} onClose={() => setNotice(null)} />}
        <div className="settings-grid">
          <form className="settings-form" onSubmit={save}>
            <PanelTitle label="Organization" title="Company profile" />
            <label>
              Organization name
              <input defaultValue="Demo Enterprise" name="organizationName" />
            </label>
            <label>
              Active policy set
              <input defaultValue="seeded-enterprise-policy" name="activePolicySet" />
            </label>
            <label>
              Confidence threshold
              <input defaultValue="0.62" max="0.95" min="0.2" name="threshold" step="0.01" type="number" />
            </label>
            <button className="primary-action" disabled={saving} type="submit">
              {saving ? "Saving..." : "Save settings"}
            </button>
          </form>
          <aside className="settings-side">
            {settingsControls.map(({ title, copy, icon: Icon }) => (
              <article key={title}>
                <Icon size={18} />
                <div>
                  <strong>{title}</strong>
                  <span>{copy}</span>
                </div>
              </article>
            ))}
          </aside>
        </div>
      </section>
    </WorkspaceShell>
  );
}
