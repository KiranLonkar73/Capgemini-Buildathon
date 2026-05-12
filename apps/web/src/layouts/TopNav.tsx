import { Link } from "react-router-dom";
import { Brand } from "../components/common/Brand";

export function TopNav({ compact = false }: { compact?: boolean }) {
  return (
    <header className="site-nav">
      <Link className="brand-link" to="/">
        <Brand />
      </Link>
      {!compact && (
        <nav>
          <a href="#features">Features</a>
          <Link to="/extension">Extension</Link>
          <a href="#demo">Demo</a>
        </nav>
      )}
      <div className="site-nav-actions">
        <Link className="secondary-action" to="/login">
          Login
        </Link>
        <Link className="primary-action nav-signup" to="/signup">
          Sign up
        </Link>
      </div>
    </header>
  );
}
