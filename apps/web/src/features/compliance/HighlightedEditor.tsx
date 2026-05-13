import type { Violation } from "@complylens/shared";

export function HighlightedEditor({
  draft,
  onChange,
  onSelectViolation,
  violations
}: {
  draft: string;
  onChange: (draft: string) => void;
  onSelectViolation: (id: string) => void;
  violations: Violation[];
}) {
  return (
    <div className="document-content">
      <label className="editor-pane">
        <span>Write here</span>
        <textarea
          aria-label="Document draft"
          className="document-textarea"
          onChange={(event) => onChange(event.target.value)}
          value={draft}
        />
      </label>
      <div className="editor-pane">
        <span>Problems show here</span>
        <div className="highlight-preview">
          {draft.split(/\n\s*\n/).map((paragraph, index) => {
            const match = violations.find((violation) => paragraph.includes(violation.quote));
            if (!match) return <p key={`${index}-${paragraph}`}>{paragraph}</p>;
            const [before, after] = paragraph.split(match.quote);
            return (
              <p key={`${index}-${paragraph}`}>
                {before}
                <button
                  className={`inline-flag inline-flag--${match.severity}`}
                  onClick={() => onSelectViolation(match.id)}
                  type="button"
                >
                  {match.quote}
                </button>
                {after}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
}
