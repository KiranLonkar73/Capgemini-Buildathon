import { ArrowRight, Gauge, MailCheck, Settings, Shield, ShieldCheck, Sparkles } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { Brand } from "../components/common/Brand";

const workspaceLinks = [
  { to: "/dashboard", label: "Dashboard", icon: Gauge },
  { to: "/policies", label: "Policies", icon: Shield },
  { to: "/extension", label: "Extension", icon: MailCheck },
  { to: "/settings", label: "Settings", icon: Settings }
];

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="workspace-shell">
      <header className="workspace-nav">
        <Link className="brand-link" to="/">
          <Brand />
        </Link>
        <nav aria-label="Workspace navigation">
          {workspaceLinks.map((item) => (
            <NavLink className={({ isActive }) => (isActive ? "active" : "")} key={item.to} to={item.to}>
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="workspace-actions">
          <Link className="ghost" to="/">
            Home
          </Link>
          <Link className="primary-action" to="/dashboard">
            Analyze <ArrowRight size={16} />
          </Link>
        </div>
      </header>
      {children}
      <footer className="status-bar">
        <div>
          <Sparkles size={15} /> Explainable AI outputs
        </div>
        <div>
          <ShieldCheck size={15} /> Company policy retrieval
        </div>
        <div>
          <MailCheck size={15} /> Gmail extension compatible
        </div>
      </footer>
    </main>
  );
}
