import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, MailCheck, ShieldCheck, Sparkles, Wand2 } from "lucide-react";
import { Link } from "react-router-dom";
import {
  extensionSignals,
  homepageFeatures,
  heroMetrics,
  trustItems,
  workflowSteps
} from "../data/productData";
import { TopNav } from "../layouts/TopNav";

export function LandingPage() {
  return (
    <main className="site-shell">
      <TopNav />
      <section className="hero-section">
        <div className="hero-orbit" aria-hidden="true" />
        <motion.div animate={{ opacity: 1, y: 0 }} className="hero-content" initial={{ opacity: 0, y: 18 }} transition={{ duration: 0.36 }}>
          <span className="eyebrow">AI compliance intelligence for enterprise communication</span>
          <h1>Govern every outbound message with policy-grounded AI.</h1>
          <p>
            ComplyLens scans emails and documents, retrieves company policy context, explains risk, and rewrites
            sensitive language before it leaves the business.
          </p>
          <div className="hero-actions">
            <Link className="primary-action" to="/dashboard">
              Start Scanning <ArrowRight size={16} />
            </Link>
            <Link className="secondary-action" to="/extension">
              Watch Demo <MailCheck size={16} />
            </Link>
          </div>
          <div className="hero-metrics">
            {heroMetrics.map((metric) => (
              <div key={metric.label}>
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
                <small>{metric.trend}</small>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div animate={{ opacity: 1, x: 0 }} className="hero-visual" initial={{ opacity: 0, x: 24 }} transition={{ delay: 0.1, duration: 0.42 }}>
          <div className="analysis-panel elevated">
            <div className="panel-kicker">
              <span className="scan-dot" />
              Live AI review
            </div>
            <h2>Vendor_Email_Draft.txt</h2>
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
            <p>Customer records and account IDs cannot be shared outside approved systems.</p>
          </div>
          <div className="analysis-panel rewrite-card">
            <Wand2 size={18} />
            <strong>Safe rewrite</strong>
            <p>Please share the approved secure transfer link after access is authorized.</p>
          </div>
          <div className="scan-beam" />
        </motion.div>
      </section>

      <section className="workflow-showcase">
        <div className="section-heading">
          <span className="eyebrow">AI workflow visualization</span>
          <h2>From policy memory to governed communication in one loop.</h2>
        </div>
        <div className="workflow-map">
          {workflowSteps.map((step, index) => (
            <motion.article className="workflow-node" initial={{ opacity: 0, y: 12 }} key={step.title} transition={{ delay: index * 0.04 }} viewport={{ once: true }} whileInView={{ opacity: 1, y: 0 }}>
              <span className="premium-icon">
                <step.icon size={20} />
              </span>
              <strong>{step.title}</strong>
              <p>{step.copy}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="section-grid" id="features">
        {homepageFeatures.map((feature, index) => (
          <motion.article className="feature-card" initial={{ opacity: 0, y: 14 }} key={feature.title} transition={{ delay: index * 0.035 }} viewport={{ once: true, margin: "-80px" }} whileInView={{ opacity: 1, y: 0 }}>
            <span className="premium-icon">
              <feature.icon size={20} />
            </span>
            <h2>{feature.title}</h2>
            <p>{feature.copy}</p>
          </motion.article>
        ))}
      </section>

      <section className="intelligence-showcase">
        <div className="section-heading">
          <span className="eyebrow">Compliance intelligence showcase</span>
          <h2>Explainable AI outputs that legal and security teams can trust.</h2>
        </div>
        <div className="showcase-grid">
          <article className="glass-card large">
            <div className="panel-kicker"><span className="scan-dot" />Policy reasoning</div>
            <h3>Why this was flagged</h3>
            <p>The draft creates a written delivery guarantee and refund commitment without legal approval.</p>
            <div className="policy-citation">Commercial Communications Policy · 4.1 Delivery Commitments</div>
          </article>
          <article className="glass-card">
            <h3>Risk heat</h3>
            <div className="mini-bars">
              {[82, 64, 48, 76, 58].map((value) => <span key={value} style={{ height: `${value}%` }} />)}
            </div>
          </article>
          <article className="glass-card rewrite-preview-card">
            <Sparkles size={18} />
            <h3>AI rewrite</h3>
            <p>Our current target remains subject to final confirmation and approved commercial terms.</p>
          </article>
        </div>
      </section>

      <section className="extension-demo-section">
        <div>
          <span className="eyebrow">Gmail extension demo</span>
          <h2>Govern risky drafts without leaving compose.</h2>
          <p>
            The extension detects active Gmail compose windows, scans draft text against company policy, and inserts
            approved rewrites with one click.
          </p>
          <div className="extension-signal-grid">
            {extensionSignals.map((signal) => (
              <div className="signal-card" key={signal.label}>
                <signal.icon size={17} />
                <span>{signal.label}</span>
                <strong>{signal.status}</strong>
              </div>
            ))}
          </div>
        </div>
        <div className="gmail-mock">
          <div className="gmail-topbar">New message <span>ComplyLens active</span></div>
          <p>We can guarantee delivery by June 14 and offer a full refund if the launch slips.</p>
          <div className="gmail-warning">Legal commitment detected · 88% confidence</div>
          <button type="button">Apply compliant rewrite</button>
        </div>
      </section>

      <section className="analytics-section">
        <div className="section-heading">
          <span className="eyebrow">Analytics + policy personalization</span>
          <h2>Measure risk patterns, reviewer agreement, and policy coverage.</h2>
        </div>
        <div className="analytics-grid">
          <div className="analytics-card">
            <strong>Policy coverage</strong>
            <div className="coverage-ring">92%</div>
            <span>Active controls mapped to company policy memory</span>
          </div>
          <div className="analytics-card wide">
            <strong>Communication risk trend</strong>
            <div className="trend-line">
              {[34, 42, 38, 51, 47, 59, 55, 63, 71, 67].map((value) => <i key={value} style={{ height: `${value}%` }} />)}
            </div>
          </div>
          <div className="analytics-card">
            <strong>Reviewer agreement</strong>
            <div className="coverage-ring calm">96%</div>
            <span>High-confidence findings accepted by reviewers</span>
          </div>
        </div>
      </section>

      <section className="trust-section">
        <div>
          <span className="eyebrow">Enterprise trust layer</span>
          <h2>Serious infrastructure for teams that cannot afford ambiguous AI.</h2>
        </div>
        <div className="trust-list">
          {trustItems.map((item) => (
            <div key={item.title}>
              <item.icon size={18} />
              {item.title}
            </div>
          ))}
        </div>
      </section>

      <footer className="cta-footer">
        <div>
          <span className="eyebrow">Deployable compliance intelligence</span>
          <h2>Start governing enterprise communication with policy-aware AI.</h2>
        </div>
        <Link className="primary-action" to="/dashboard">
          Open ComplyLens <CheckCircle2 size={16} />
        </Link>
      </footer>
    </main>
  );
}
