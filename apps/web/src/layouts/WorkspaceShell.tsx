import { Activity, BarChart3, Building2, Cable, FileText, Inbox, Settings, Shield, UserCircle } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { Brand } from "../components/common/Brand";

const workspaceLinks = [
  { to: "/dashboard", label: "Workspace", icon: FileText },
  { to: "/inbox", label: "Inbox", icon: Inbox },
  { to: "/policies", label: "Policies", icon: Shield },
  { to: "/integrations", label: "Integrations", icon: Cable },
  { to: "/analytics", label: "Reports", icon: BarChart3 },
  { to: "/audit", label: "Audit Trail", icon: Activity },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/profile", label: "Profile", icon: UserCircle }
];

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="workspace-shell">
      <aside className="workspace-sidebar">
        <Link className="brand-link" to="/">
          <Brand />
        </Link>
        <nav aria-label="Workspace navigation" className="workspace-sidebar-nav">
          {workspaceLinks.map((item) => (
            <NavLink className={({ isActive }) => (isActive ? "active" : "")} key={item.to} to={item.to}>
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="workspace-org-card">
          <Building2 size={16} />
          <div>
            <strong>Demo Enterprise</strong>
            <span>Seeded policy model</span>
          </div>
        </div>
      </aside>
      <section className="workspace-main">{children}</section>
    </main>
  );
}
