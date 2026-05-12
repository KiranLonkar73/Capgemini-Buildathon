import { FileLock2, ShieldCheck } from "lucide-react";
import { samplePolicies } from "@complylens/shared";

export function PolicyPanel() {
  return (
    <aside className="policy-panel">
      <div className="panel-heading">
        <div>
          <span>Policy knowledge</span>
          <h2>Active rulebase</h2>
        </div>
        <ShieldCheck size={22} />
      </div>

      <div className="upload-zone">
        <FileLock2 size={22} />
        <div>
          <strong>Upload policy docs</strong>
          <span>PDF, DOCX, XLSX ingestion will connect in backend step.</span>
        </div>
      </div>

      <div className="policy-list">
        {samplePolicies.map((policy) => (
          <article className="policy-row" key={policy.id}>
            <span>{policy.owner}</span>
            <div>
              <strong>{policy.policy}</strong>
              <p>{policy.section}</p>
            </div>
          </article>
        ))}
      </div>
    </aside>
  );
}
