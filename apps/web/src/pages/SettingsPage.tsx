import { FormEvent, useState } from "react";
import { saveCompanySettings } from "../api/complianceApi";
import { NoticeBox } from "../components/common/NoticeBox";
import { PanelTitle } from "../components/common/PanelTitle";
import { WorkspaceShell } from "../layouts/WorkspaceShell";
import type { Notice } from "../types";

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
        <PanelTitle label="Controls" title="Company profile and thresholds" />
        {notice && <NoticeBox notice={notice} onClose={() => setNotice(null)} />}
        <form className="settings-form" onSubmit={save}>
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
      </section>
    </WorkspaceShell>
  );
}
