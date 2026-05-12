import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, MailCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { PanelTitle } from "../components/common/PanelTitle";
import { ComplianceLensScene } from "../components/ComplianceLensScene";
import { TopNav } from "../layouts/TopNav";

export function LandingPage() {
  const features = [
    ["Policy-grounded analysis", "Every issue includes the policy section, confidence, explanation, and rewrite."],
    ["Gmail-ready review", "The Chrome extension checks outbound drafts before they leave the company."],
    ["Company-specific memory", "Policy uploads create reusable context for document and email reviews."]
  ];

  return (
    <main className="site-shell">
      <TopNav />
      <section className="hero-section">
        <ComplianceLensScene />
        <motion.div animate={{ opacity: 1, y: 0 }} className="hero-content" initial={{ opacity: 0, y: 18 }} transition={{ duration: 0.36 }}>
          <span className="eyebrow">Enterprise AI compliance copilot</span>
          <h1>Review emails and documents against company policy before risk escapes.</h1>
          <p>
            ComplyLens scans enterprise communication, retrieves relevant policy context, explains violations, and
            rewrites risky language into compliant alternatives.
          </p>
          <div className="hero-actions">
            <Link className="primary-action" to="/login">
              Open workspace <ArrowRight size={16} />
            </Link>
            <Link className="secondary-action" to="/extension">
              View Gmail workflow <MailCheck size={16} />
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="section-grid" id="features">
        {features.map(([title, copy], index) => (
          <motion.article
            className="feature-card"
            initial={{ opacity: 0, y: 14 }}
            key={title}
            transition={{ delay: index * 0.05 }}
            viewport={{ once: true, margin: "-80px" }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <span>{index + 1}</span>
            <h2>{title}</h2>
            <p>{copy}</p>
          </motion.article>
        ))}
      </section>

      <section className="workflow-section">
        <PanelTitle label="Workflow" title="From draft to explainable decision" />
        <div className="workflow-steps">
          {["Upload policy", "Scan document", "Retrieve context", "Explain risk", "Apply rewrite"].map((step) => (
            <div className="workflow-step" key={step}>
              <CheckCircle2 size={16} />
              {step}
            </div>
          ))}
        </div>
      </section>

      <section className="trust-section">
        <div>
          <span className="eyebrow">Built for legal, security, HR, and finance</span>
          <h2>Serious interface, traceable outputs, controlled automation.</h2>
        </div>
        <Link className="primary-action" to="/dashboard">
          Try demo analysis <Sparkles size={16} />
        </Link>
      </section>
    </main>
  );
}
