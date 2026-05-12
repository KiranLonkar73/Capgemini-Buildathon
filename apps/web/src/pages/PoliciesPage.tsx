import { ChangeEvent, useState } from "react";
import { Upload } from "lucide-react";
import { samplePolicies } from "@complylens/shared";
import { uploadPolicyDocument } from "../api/complianceApi";
import { NoticeBox } from "../components/common/NoticeBox";
import { PanelTitle } from "../components/common/PanelTitle";
import { WorkspaceShell } from "../layouts/WorkspaceShell";
import type { Notice } from "../types";

export function PoliciesPage() {
  const [notice, setNotice] = useState<Notice>(null);
  const [uploading, setUploading] = useState(false);
  const [policyRows, setPolicyRows] = useState(samplePolicies);

  async function uploadPolicy(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setNotice(null);
    try {
      const result = await uploadPolicyDocument(file);
      setPolicyRows((rows) => [
        {
          id: `uploaded-${file.name}`,
          policy: file.name,
          section: `${result.chunks} retrieved chunks`,
          rule: "Uploaded company policy is now available to retrieval.",
          owner: "Legal"
        },
        ...rows
      ]);
      setNotice({ kind: "success", text: `Uploaded ${file.name} and indexed ${result.chunks} policy chunks.` });
    } catch (error) {
      setNotice({
        kind: "error",
        text: `Policy upload failed. Start backend with backend/requirements.txt installed. ${error instanceof Error ? error.message.slice(0, 120) : ""}`
      });
    } finally {
      setUploading(false);
    }
  }

  return (
    <WorkspaceShell>
      <section className="page-panel">
        <PanelTitle label="Company policy memory" title="Upload and manage active policy sets" />
        {notice && <NoticeBox notice={notice} onClose={() => setNotice(null)} />}
        <label className="large-upload">
          <Upload size={22} />
          <span>
            <strong>{uploading ? "Uploading policy..." : "Upload policy document"}</strong>
            <small>PDF, DOCX, and TXT are parsed by the FastAPI backend.</small>
          </span>
          <input accept=".pdf,.docx,.txt" disabled={uploading} onChange={uploadPolicy} type="file" />
        </label>
        <div className="policy-table">
          {policyRows.map((policy) => (
            <article className="policy-row wide" key={policy.id}>
              <span>{policy.owner}</span>
              <div>
                <strong>{policy.policy}</strong>
                <small>{policy.section}</small>
                <p>{policy.rule}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </WorkspaceShell>
  );
}
