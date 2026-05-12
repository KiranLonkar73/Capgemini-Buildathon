import { type CSSProperties, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, MailCheck, ShieldCheck, Sparkles, Wand2 } from "lucide-react";
import { Link } from "react-router-dom";
import { homepageFeatures, workflowSteps } from "../data/productData";
import { TopNav } from "../layouts/TopNav";

export function LandingPage() {
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50 });

  return (
    <main className="site-shell">
      <TopNav />
      <section
        className="hero-section"
        onMouseMove={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect();
          setSpotlight({
            x: ((event.clientX - bounds.left) / bounds.width) * 100,
            y: ((event.clientY - bounds.top) / bounds.height) * 100
          });
        }}
        style={{ "--cursor-x": `${spotlight.x}%`, "--cursor-y": `${spotlight.y}%` } as CSSProperties}
      >
        <div className="cursor-spotlight" aria-hidden="true" />
        <div className="hero-orbit" aria-hidden="true" />
        <motion.div animate={{ opacity: 1, y: 0 }} className="hero-content" initial={{ opacity: 0, y: 18 }} transition={{ duration: 0.42 }}>
          <h1>AI compliance review for every enterprise message.</h1>
          <p>
            ComplyLens scans emails and documents against company policies, explains the risk, and rewrites sensitive
            language before it leaves the business.
          </p>
          <div className="hero-actions">
            <Link className="primary-action" to="/dashboard">
              Start Scanning <ArrowRight size={16} />
            </Link>
            <Link className="secondary-action" to="/extension">
              Watch Demo <MailCheck size={16} />
            </Link>
          </div>
        </motion.div>

        <motion.div animate={{ opacity: 1, x: 0 }} className="hero-visual" initial={{ opacity: 0, x: 24 }} transition={{ delay: 0.1, duration: 0.46 }}>
          <div className="analysis-panel elevated">
            <div className="panel-kicker">
              <span className="scan-dot" />
              Live AI review
            </div>
            <h2>Vendor email draft</h2>
            <div className="document-lines">
              <span />
              <span />
              <span className="line-risk" />
              <span />
            </div>
            <div className="risk-chip critical">High risk · Customer data</div>
          </div>
          <div className="analysis-panel policy-card">
            <ShieldCheck size={18} />
            <strong>Policy match</strong>
            <p>Customer records cannot be shared outside approved systems.</p>
          </div>
          <div className="analysis-panel rewrite-card">
            <Wand2 size={18} />
            <strong>Safe rewrite</strong>
            <p>Use the approved secure transfer link after access is authorized.</p>
          </div>
          <div className="scan-beam" />
        </motion.div>
      </section>

      <section className="home-section workflow-showcase">
        <motion.div className="section-heading" initial={{ opacity: 0, y: 18 }} viewport={{ once: true }} whileInView={{ opacity: 1, y: 0 }}>
          <h2>One clear workflow from policy to rewrite.</h2>
          <p>Every scan follows a simple, traceable loop built for legal, security, HR, and finance teams.</p>
        </motion.div>
        <div className="workflow-map">
          {workflowSteps.slice(0, 4).map((step, index) => (
            <motion.article className="workflow-node" initial={{ opacity: 0, y: 18 }} key={step.title} transition={{ delay: index * 0.08 }} viewport={{ once: true }} whileInView={{ opacity: 1, y: 0 }}>
              <span className="premium-icon">
                <step.icon size={20} />
              </span>
              <strong>{step.title}</strong>
              <p>{step.copy}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="home-section feature-stage" id="features">
        <motion.div className="section-heading" initial={{ opacity: 0, y: 18 }} viewport={{ once: true }} whileInView={{ opacity: 1, y: 0 }}>
          <h2>Built for operational AI governance, not another inbox plugin.</h2>
          <p>Fewer alerts, stronger context, and a calmer interface for reviewing high-stakes communication.</p>
        </motion.div>
        <div className="feature-rail">
          {homepageFeatures.slice(0, 3).map((feature, index) => (
            <motion.article className="feature-card" initial={{ opacity: 0, y: 18 }} key={feature.title} transition={{ delay: index * 0.08 }} viewport={{ once: true }} whileInView={{ opacity: 1, y: 0 }}>
              <span className="premium-icon">
                <feature.icon size={20} />
              </span>
              <h3>{feature.title}</h3>
              <p>{feature.copy}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="home-section extension-demo-section" id="demo">
        <motion.div initial={{ opacity: 0, y: 18 }} viewport={{ once: true }} whileInView={{ opacity: 1, y: 0 }}>
          <h2>Gmail checks that feel native to the way teams already work.</h2>
          <p>
            The extension scans compose text, cites the matched policy, and inserts a compliant rewrite without moving
            users into a separate review tool.
          </p>
          <div className="hero-actions">
            <Link className="primary-action" to="/extension">
              View extension <MailCheck size={16} />
            </Link>
          </div>
        </motion.div>
        <motion.div className="gmail-mock" initial={{ opacity: 0, scale: 0.96 }} viewport={{ once: true }} whileInView={{ opacity: 1, scale: 1 }}>
          <div className="gmail-topbar">New message <span>ComplyLens active</span></div>
          <p>We can guarantee delivery by June 14 and offer a full refund if the launch slips.</p>
          <div className="gmail-warning">Legal commitment detected · 88% confidence</div>
          <button type="button">Apply compliant rewrite</button>
        </motion.div>
      </section>

      <section className="home-section final-cta-section">
        <motion.div initial={{ opacity: 0, y: 18 }} viewport={{ once: true }} whileInView={{ opacity: 1, y: 0 }}>
          <Sparkles size={30} />
          <h2>Deploy policy-aware AI where communication risk actually starts.</h2>
          <p>Start with document review, extend into Gmail, and build toward organization-specific compliance memory.</p>
          <Link className="primary-action" to="/dashboard">
            Open ComplyLens <CheckCircle2 size={16} />
          </Link>
        </motion.div>
      </section>
    </main>
  );
}
