import { X } from "lucide-react";
import type { Notice } from "../../types";

export function NoticeBox({ notice, onClose }: { notice: NonNullable<Notice>; onClose: () => void }) {
  return (
    <div className={`notice ${notice.kind}`}>
      <span>{notice.text}</span>
      <button aria-label="Dismiss notice" onClick={onClose} type="button">
        <X size={14} />
      </button>
    </div>
  );
}
