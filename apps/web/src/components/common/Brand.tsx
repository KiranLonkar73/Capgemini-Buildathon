import { Shield } from "lucide-react";

export function Brand() {
  return (
    <div className="brand">
      <span className="brand-icon">
        <Shield size={18} />
      </span>
      <div>
        <strong>ComplyLens</strong>
        <span>Policy Compliance Checker</span>
      </div>
    </div>
  );
}
