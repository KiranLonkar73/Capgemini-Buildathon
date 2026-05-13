import { type CSSProperties, useState } from "react";
import { ArrowRight, LogIn, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Brand } from "../components/common/Brand";

export function TopNav({ compact = false }: { compact?: boolean }) {
  const [cursor, setCursor] = useState({ x: 50, y: 50 });

  return (
    <header
      className="site-nav"
      onMouseMove={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        setCursor({
          x: ((event.clientX - bounds.left) / bounds.width) * 100,
          y: ((event.clientY - bounds.top) / bounds.height) * 100
        });
      }}
      style={{ "--nav-cursor-x": `${cursor.x}%`, "--nav-cursor-y": `${cursor.y}%` } as CSSProperties}
    >
      <span className="nav-cursor-glow" aria-hidden="true" />
      <Link className="brand-link" to="/">
        <Brand />
      </Link>
      {!compact && (
        <nav>
          <a href="#features"><Sparkles size={14} /> Features</a>
          <Link to="/extension">Extension</Link>
          <a href="#demo">Demo</a>
        </nav>
      )}
      <div className="site-nav-actions">
        <Link className="secondary-action" to="/login">
          <LogIn size={15} /> Login
        </Link>
        <Link className="primary-action nav-signup" to="/signup">
          Sign up <ArrowRight size={15} />
        </Link>
      </div>
    </header>
  );
}
