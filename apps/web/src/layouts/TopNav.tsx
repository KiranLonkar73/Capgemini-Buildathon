import { Link } from "react-router-dom";
import { Brand } from "../components/common/Brand";

export function TopNav({ compact = false }: { compact?: boolean }) {
  return (
    <header className="site-nav">
      <Brand />
      {!compact && (
        <nav>
          <a href="#features">Features</a>
          <Link to="/extension">Extension</Link>
          <Link to="/dashboard">Demo</Link>
        </nav>
      )}
      <Link className="secondary-action" to="/login">
        Login
      </Link>
    </header>
  );
}
