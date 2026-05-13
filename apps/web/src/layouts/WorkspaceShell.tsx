import { Activity, Building2, FileText, Settings, Shield } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { Brand } from "../components/common/Brand";

type WorkspaceRole = "admin" | "employee";

function getStoredRole(): WorkspaceRole {
  if (typeof window === "undefined") {
    return "employee";
  }

  return window.localStorage.getItem("complylens-role") === "admin" ? "admin" : "employee";
}

function getWorkspaceLinks(role: WorkspaceRole) {
  if (role === "admin") {
    return [
      { to: "/dashboard", label: "Workspace", icon: FileText },
      { to: "/policies", label: "Policies", icon: Shield },
      { to: "/audit", label: "Audit Trail", icon: Activity },
      { to: "/settings", label: "Admin", icon: Settings }
    ];
  }

  return [
    { to: "/dashboard", label: "Workspace", icon: FileText },
    { to: "/audit", label: "History", icon: Activity },
    { to: "/settings", label: "Settings", icon: Settings }
  ];
}

export function WorkspaceShell({ children, role = getStoredRole() }: { children: React.ReactNode; role?: WorkspaceRole }) {
  const workspaceLinks = getWorkspaceLinks(role);

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
            <span>{role === "admin" ? "Admin workspace" : "Employee workspace"}</span>
          </div>
        </div>
      </aside>
      <section className="workspace-main">{children}</section>
    </main>
  );
}
