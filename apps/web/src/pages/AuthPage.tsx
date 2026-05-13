import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, KeyRound, LockKeyhole } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { TopNav } from "../layouts/TopNav";

export function AuthPage({ mode }: { mode: "login" | "signup" }) {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const isSignup = mode === "signup";

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    if (!email.includes("@") || password.length < 6) {
      setError("Use a work email and a password with at least 6 characters.");
      return;
    }
    navigate("/dashboard");
  }

  return (
    <main className="auth-shell">
      <TopNav compact />
      <section className="auth-layout">
        <div className="auth-copy">
          <span className="eyebrow">Secure policy workspace</span>
          <h1>{isSignup ? "Create a company compliance workspace." : "Login to your compliance review queue."}</h1>
          <p>Manage policies, scan drafts, review citations, and apply safe rewrites from one enterprise workflow.</p>
        </div>
        <motion.section animate={{ opacity: 1, y: 0 }} className="auth-card" initial={{ opacity: 0, y: 16 }}>
          <div className="auth-card-head">
            <div className="auth-icon">{isSignup ? <KeyRound size={20} /> : <LockKeyhole size={20} />}</div>
            <div>
              <h2>{isSignup ? "Create workspace" : "Welcome back"}</h2>
              <p>{isSignup ? "Configure policy review access." : "Continue reviewing enterprise communication."}</p>
            </div>
          </div>
          <form className="auth-form" onSubmit={submit}>
            {isSignup && (
              <label>
                Company name
                <input name="company" placeholder="Acme Compliance" />
              </label>
            )}
            <label>
              Work email
              <input name="email" placeholder="you@company.com" type="email" />
            </label>
            <label>
              Password
              <input name="password" placeholder="minimum 6 characters" type="password" />
            </label>
            {error && <div className="notice error">{error}</div>}
            <button className="auth-submit" type="submit">
              {isSignup ? "Create workspace" : "Login"}
              <ArrowRight size={16} />
            </button>
          </form>
          <div className="auth-divider">
            <span />
            Demo
            <span />
          </div>
          <button className="demo-button" onClick={() => navigate("/dashboard")} type="button">
            Open seeded demo workspace
          </button>
          <p className="auth-switch">
            {isSignup ? "Already have access?" : "Need a workspace?"}{" "}
            <Link to={isSignup ? "/login" : "/signup"}>{isSignup ? "Login" : "Sign up"}</Link>
          </p>
        </motion.section>
      </section>
    </main>
  );
}
