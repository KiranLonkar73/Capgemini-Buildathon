import { API_BASE_URL, applyRewrite, runDemoComplianceCheck, type ComplianceReport } from "@complylens/shared";

const PANEL_ID = "complylens-gmail-panel";
const BUTTON_ID = "complylens-gmail-button";
let latestReport: ComplianceReport | null = null;
let latestText = "";
let scanTimer = 0;

function getCompose() {
  return document.querySelector<HTMLElement>('[role="textbox"][aria-label*="Message Body"]');
}

function getComposeText() {
  return getCompose()?.innerText ?? "";
}

function setComposeText(text: string) {
  const compose = getCompose();
  if (!compose) return false;
  compose.focus();
  compose.innerText = text;
  compose.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: text }));
  return true;
}

function ensurePanel() {
  let panel = document.getElementById(PANEL_ID);
  if (panel) return panel;

  panel = document.createElement("aside");
  panel.id = PANEL_ID;
  panel.style.cssText = [
    "position:fixed",
    "right:22px",
    "bottom:22px",
    "z-index:2147483647",
    "width:340px",
    "padding:14px",
    "border:1px solid rgba(148,163,184,.22)",
    "border-radius:8px",
    "background:#121a2f",
    "color:#e5e7eb",
    "font:14px Geist,Inter,system-ui,sans-serif",
    "box-shadow:0 20px 60px rgba(0,0,0,.32)"
  ].join(";");
  document.body.appendChild(panel);
  return panel;
}

function renderPanel(state: "idle" | "loading" | "ready" | "error", message = "") {
  const panel = ensurePanel();
  const report = latestReport;
  const firstViolation = report?.violations[0];
  panel.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px">
      <strong style="font-size:15px">ComplyLens Gmail</strong>
      <span style="color:${report?.flaggedSections ? "#f59e0b" : "#22c55e"};font-weight:800">${report ? `${report.score}%` : "Ready"}</span>
    </div>
    ${
      state === "loading"
        ? `<div style="color:#94a3b8;line-height:1.45">Scanning current Gmail draft against company policy...</div>`
        : state === "error"
          ? `<div style="color:#fecaca;line-height:1.45">${message}</div>`
          : firstViolation
            ? `<div style="color:#f59e0b;font-weight:800;margin-bottom:8px">${firstViolation.policySection}</div>
               <div style="color:#94a3b8;line-height:1.45;margin-bottom:10px">${firstViolation.explanation}</div>
               <div style="padding:10px;border:1px solid rgba(34,197,94,.22);border-radius:8px;background:rgba(34,197,94,.08);line-height:1.45">${firstViolation.rewrite}</div>
               <button id="complylens-apply-rewrite" style="width:100%;height:38px;margin-top:10px;border:1px solid rgba(91,140,255,.45);border-radius:8px;background:#5b8cff;color:white;font-weight:800;cursor:pointer">Apply rewrite</button>`
            : `<div style="color:#22c55e;font-weight:800">No violations detected.</div>
               <div style="color:#94a3b8;margin-top:6px;line-height:1.45">${report?.summary ?? "Draft is ready for review."}</div>`
    }
    <button id="complylens-rescan" style="width:100%;height:34px;margin-top:10px;border:1px solid rgba(148,163,184,.24);border-radius:8px;background:rgba(255,255,255,.04);color:#e5e7eb;font-weight:750;cursor:pointer">Rescan draft</button>
  `;

  panel.querySelector("#complylens-rescan")?.addEventListener("click", () => void scanDraft());
  panel.querySelector("#complylens-apply-rewrite")?.addEventListener("click", () => {
    const violation = latestReport?.violations[0];
    if (!violation) return;
    const nextText = applyRewrite(latestText, violation);
    if (setComposeText(nextText)) {
      latestText = nextText;
      latestReport = runDemoComplianceCheck(nextText);
      renderPanel("ready", "Rewrite inserted into Gmail compose.");
    } else {
      renderPanel("error", "Could not find the active Gmail compose body.");
    }
  });
}

async function scanDraft() {
  const text = getComposeText();
  latestText = text;
  if (!text.trim()) {
    latestReport = null;
    renderPanel("error", "Open a Gmail compose window and enter draft text first.");
    return;
  }

  renderPanel("loading");
  try {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, documentName: "gmail-draft", threshold: 0.62 })
    });
    if (!response.ok) throw new Error(await response.text());
    latestReport = (await response.json()) as ComplianceReport;
    renderPanel("ready");
  } catch (error) {
    latestReport = runDemoComplianceCheck(text);
    renderPanel(
      "error",
      `Backend unavailable, showing seeded local analysis. ${error instanceof Error ? error.message.slice(0, 120) : ""}`
    );
  }
}

function addFloatingButton() {
  if (document.getElementById(BUTTON_ID)) return;

  const button = document.createElement("button");
  button.id = BUTTON_ID;
  button.textContent = "Check Compliance";
  button.style.cssText = [
    "position:fixed",
    "right:22px",
    "bottom:378px",
    "z-index:2147483647",
    "height:38px",
    "padding:0 14px",
    "border:1px solid rgba(91,140,255,.45)",
    "border-radius:8px",
    "background:linear-gradient(135deg,#5b8cff,#6d7cf8)",
    "color:#fff",
    "font:800 13px Geist,Inter,system-ui,sans-serif",
    "box-shadow:0 14px 34px rgba(91,140,255,.22)",
    "cursor:pointer"
  ].join(";");
  button.addEventListener("click", () => void scanDraft());
  document.body.appendChild(button);
}

function scheduleLiveScan() {
  window.clearTimeout(scanTimer);
  scanTimer = window.setTimeout(() => {
    if (document.getElementById(PANEL_ID) && getComposeText() !== latestText) {
      void scanDraft();
    }
  }, 900);
}

addFloatingButton();
setInterval(addFloatingButton, 2500);
document.addEventListener("input", scheduleLiveScan, true);
