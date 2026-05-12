export function PanelTitle({ label, title }: { label: string; title: string }) {
  return (
    <div className="panel-title">
      <span>{label}</span>
      <h2>{title}</h2>
    </div>
  );
}
