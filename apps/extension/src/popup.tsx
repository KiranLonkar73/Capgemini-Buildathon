import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, KeyRound, MailCheck, RefreshCw, Shield, Wand2 } from "lucide-react";
import { applyRewrite, demoDocument, runDemoComplianceCheck, type ComplianceReport } from "@complylens/shared";
import "./popup.css";

function Popup() {
  const [draft, setDraft] = useState(demoDocument.split("\n\n").slice(0, 3).join("\n\n"));
  const [report, setReport] = useState<ComplianceReport>(() => runDemoComplianceCheck(draft));
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [apiBaseUrl, setApiBaseUrl] = useState("http://127.0.0.1:8000");
  const [connected, setConnected] = useState(false);
  useEffect(() => {
    setReport(runDemoComplianceCheck(draft));
  }, [draft]);
  useEffect(() => {
    chrome.storage?.sync?.get(["complylensApiBaseUrl"], (result) => {
      if (result.complylensApiBaseUrl) setApiBaseUrl(result.complylensApiBaseUrl);
    });
  }, []);
  const firstViolation = report.violations[0];

  function saveApiBaseUrl(nextUrl = apiBaseUrl) {
    chrome.storage?.sync?.set({ complylensApiBaseUrl: nextUrl });
    setNotice("Extension backend URL saved.");
  }

  async function testConnection() {
    setLoading(true);
    setNotice("");
    try {
      const response = await fetch(`${apiBaseUrl}/health`);
      if (!response.ok) throw new Error(await response.text());
      setConnected(true);
      saveApiBaseUrl(apiBaseUrl);
      setNotice("Connected to ComplyLens backend.");
    } catch (error) {
      setConnected(false);
      setNotice(`Could not connect to backend. ${error instanceof Error ? error.message.slice(0, 80) : ""}`);
    } finally {
      setLoading(false);
    }
  }

  async function scanDraft() {
    setLoading(true);
    setNotice("");
    try {
      const response = await fetch(`${apiBaseUrl}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: draft, documentName: "extension-popup-draft", threshold: 0.62 })
      });
      if (!response.ok) throw new Error(await response.text());
      setReport((await response.json()) as ComplianceReport);
      setNotice("Backend analysis complete.");
    } catch (error) {
      setReport(runDemoComplianceCheck(draft));
      setNotice(`Backend unavailable. Showing seeded analysis.`);
    } finally {
      setLoading(false);
    }
  }

  async function applyBackendRewrite() {
    if (!firstViolation) return;
    setLoading(true);
    setNotice("");
    try {
      setDraft(applyRewrite(draft, firstViolation));
      setNotice("Suggested rewrite applied.");
    } catch (error) {
      setNotice(`Could not fetch backend rewrite. ${error instanceof Error ? error.message.slice(0, 80) : ""}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="popup-shell">
      <header>
        <div className="mark">
          <Shield size={18} />
        </div>
        <div>
          <h1>ComplyLens</h1>
          <p>Gmail compliance check</p>
        </div>
      </header>

      <section className="risk-meter">
        <div className="risk-score">
          <span>{report.score}%</span>
        </div>
        <div>
          <span>Risk Score</span>
          <strong>{report.status === "blocked" ? "Medium-high" : "Ready"}</strong>
          <p>{report.flaggedSections} policy risks detected.</p>
        </div>
      </section>

      <section className="extension-config">
        <label>
          <span><KeyRound size={14} /> Backend URL</span>
          <input value={apiBaseUrl} onChange={(event) => setApiBaseUrl(event.target.value)} />
        </label>
        <button className={connected ? "config-button connected" : "config-button"} disabled={loading} onClick={() => void testConnection()} type="button">
          {connected ? "Connected" : "Test"}
        </button>
      </section>

      <textarea value={draft} onChange={(event) => setDraft(event.target.value)} spellCheck={false} />

      <button className="scan-button" disabled={loading} onClick={() => void scanDraft()} type="button">
        {loading ? <RefreshCw size={15} /> : <MailCheck size={15} />}
        {loading ? "Scanning..." : "Scan with backend"}
      </button>
      {notice && <div className="popup-notice">{notice}</div>}

      {firstViolation ? (
        <motion.section animate={{ opacity: 1, y: 0 }} className="flag" initial={{ opacity: 0, y: 6 }}>
          <div className="flag-title">
            <AlertTriangle size={16} />
            <strong>{firstViolation.policySection}</strong>
          </div>
          <p>{firstViolation.explanation}</p>
          <div className="rewrite">
            <Wand2 size={15} />
            <span>{firstViolation.rewrite}</span>
          </div>
          <button onClick={() => void applyBackendRewrite()} type="button">Apply rewrite</button>
        </motion.section>
      ) : (
        <section className="clean">
          <CheckCircle2 size={18} />
          <span>No violations found in this draft.</span>
        </section>
      )}

      <footer>
        <MailCheck size={15} />
        Same API as the web app
      </footer>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
