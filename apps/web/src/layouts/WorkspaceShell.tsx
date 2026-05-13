import { Activity, BarChart3, FileText, Shield } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { Brand } from "../components/common/Brand";

const workspaceLinks = [
  { to: "/dashboard", label: "Work", icon: FileText },
  { to: "/analytics", label: "Reports", icon: BarChart3 },
  { to: "/activity", label: "Activity", icon: Activity },
  { to: "/policies", label: "Policies", icon: Shield }
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
        </div>
      </header>
      {children}
    </main>
  );
}
