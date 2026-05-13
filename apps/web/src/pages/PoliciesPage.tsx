import { ChangeEvent, useState } from "react";
import { FileSearch, ShieldCheck, Upload } from "lucide-react";
import { samplePolicies } from "@complylens/shared";
import { uploadPolicyDocument } from "../api/complianceApi";
import { NoticeBox } from "../components/common/NoticeBox";
import { PanelTitle } from "../components/common/PanelTitle";
import { WorkspaceShell } from "../layouts/WorkspaceShell";
import type { Notice } from "../types";
import { policySystems } from "../data/productData";

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
      <section className="page-panel simple-dashboard">
        <div className="simple-page-head">
          <span className="premium-icon"><ShieldCheck size={18} /></span>
          <div>
            <h1>Policies</h1>
            <p>Upload the rules that power every scan and rewrite.</p>
          </div>
        </div>
        {notice && <NoticeBox notice={notice} onClose={() => setNotice(null)} />}
        <div className="policy-console">
          <div>
            <label className="large-upload">
              <Upload size={22} />
              <span>
                <strong>{uploading ? "Uploading policy..." : "Upload policy document"}</strong>
                <small>PDF, DOC, DOCX, EML, HTML, Markdown, RTF, and TXT are parsed by the backend.</small>
              </span>
              <input accept=".pdf,.doc,.docx,.eml,.html,.htm,.md,.rtf,.txt" disabled={uploading} onChange={uploadPolicy} type="file" />
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
          </div>
          <aside className="ops-card">
            <PanelTitle label="Coverage" title="Active systems" />
            <div className="policy-system-list">
              {policySystems.map((policy) => (
                <div key={policy.name}>
                  <ShieldCheck size={16} />
                  <span>{policy.name}</span>
                  <strong>{policy.coverage}%</strong>
                  <small>{policy.passages} passages · {policy.owner}</small>
                </div>
              ))}
            </div>
            <div className="policy-health">
              <FileSearch size={18} />
              <strong>Retrieval health: high</strong>
              <span>Policy chunks are returning cited context for 94% of flagged messages.</span>
            </div>
          </aside>
        </div>
      </section>
    </WorkspaceShell>
  );
}
