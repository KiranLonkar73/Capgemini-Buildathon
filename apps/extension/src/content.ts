import { runDemoComplianceCheck } from "@complylens/shared";

const PANEL_ID = "complylens-gmail-panel";

function getComposeText() {
  const compose = document.querySelector<HTMLElement>('[role="textbox"][aria-label*="Message Body"]');
  return compose?.innerText ?? "";
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
    "width:320px",
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

function renderPanel() {
  const text = getComposeText();
  const report = runDemoComplianceCheck(text || "Promise delivery by June 14 and send customer account IDs by email.");
  const firstViolation = report.violations[0];
  const panel = ensurePanel();

  panel.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px">
      <strong style="font-size:15px">ComplyLens Gmail</strong>
      <span style="color:${report.flaggedSections ? "#ff7180" : "#0df2c5"};font-weight:800">${report.score}%</span>
    </div>
    ${
      firstViolation
        ? `<div style="color:#ef4444;font-weight:800;margin-bottom:8px">${firstViolation.policySection}</div>
           <div style="color:#9ca3af;line-height:1.45;margin-bottom:10px">${firstViolation.explanation}</div>
           <div style="padding:10px;border:1px solid rgba(34,197,94,.22);border-radius:8px;background:rgba(34,197,94,.08);line-height:1.45">${firstViolation.rewrite}</div>`
        : `<div style="color:#22c55e;font-weight:800">No violations detected.</div>`
    }
  `;
}

function addFloatingButton() {
  if (document.getElementById("complylens-gmail-button")) return;

  const button = document.createElement("button");
  button.id = "complylens-gmail-button";
  button.textContent = "Check Compliance";
  button.style.cssText = [
    "position:fixed",
    "right:22px",
    "bottom:378px",
    "z-index:2147483647",
    "height:38px",
    "padding:0 14px",
    "border:0",
    "border-radius:8px",
    "border:1px solid rgba(91,140,255,.45)",
    "background:linear-gradient(135deg,#5b8cff,#6d7cf8)",
    "color:#fff",
    "font:800 13px Geist,Inter,system-ui,sans-serif",
    "box-shadow:0 14px 34px rgba(91,140,255,.22)",
    "cursor:pointer"
  ].join(";");
  button.addEventListener("click", renderPanel);
  document.body.appendChild(button);
}

addFloatingButton();
setInterval(addFloatingButton, 2500);
