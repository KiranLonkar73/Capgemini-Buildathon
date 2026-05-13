import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import type { Notice } from "../../types";

export function NoticeBox({ notice, onClose }: { notice: NonNullable<Notice>; onClose: () => void }) {
  const Icon = notice.kind === "success" ? CheckCircle2 : notice.kind === "error" ? AlertTriangle : Info;

  return (
    <div className={`notice ${notice.kind}`}>
      <Icon className="notice-icon" size={16} />
      <span>{notice.text}</span>
      <button aria-label="Dismiss notice" onClick={onClose} type="button">
        <X size={14} />
      </button>
    </div>
  );
}
