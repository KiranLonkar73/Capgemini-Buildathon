import { API_BASE_URL, applyRewrite, runDemoComplianceCheck, type ComplianceReport } from "@complylens/shared";

const PANEL_ID = "complylens-gmail-panel";
const BUTTON_ID = "complylens-gmail-button";

type PanelState = "loading" | "ready" | "error";

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

async function analyzeDraft(text: string) {
  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, documentName: "gmail-draft", threshold: 0.62 })
  });
  if (!response.ok) throw new Error(await response.text());
  return (await response.json()) as ComplianceReport;
}

function setStyles(element: HTMLElement, styles: Partial<CSSStyleDeclaration>) {
  Object.assign(element.style, styles);
}

function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  options: { text?: string; id?: string; styles?: Partial<CSSStyleDeclaration>; className?: string } = {}
) {
  const element = document.createElement(tag);
  if (options.id) element.id = options.id;
  if (options.className) element.className = options.className;
  if (options.text) element.textContent = options.text;
  if (options.styles) setStyles(element, options.styles);
  return element;
}

function ensurePanel() {
  let panel = document.getElementById(PANEL_ID);
  if (panel) return panel;

  panel = createElement("aside", { id: PANEL_ID });
  setStyles(panel, {
    position: "fixed",
    right: "22px",
    bottom: "22px",
    zIndex: "2147483647",
    width: "340px",
    padding: "14px",
    border: "1px solid rgba(148,163,184,.22)",
    borderRadius: "8px",
    background: "#121a2f",
    color: "#e5e7eb",
    font: "14px Geist,Inter,system-ui,sans-serif",
    boxShadow: "0 20px 60px rgba(0,0,0,.32)"
  });
  document.body.appendChild(panel);
  return panel;
}

function appendHeader(panel: HTMLElement) {
  const header = createElement("div");
  setStyles(header, {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "12px"
  });

  const title = createElement("strong", { text: "ComplyLens Gmail", styles: { fontSize: "15px" } });
  const score = createElement("span", {
    text: latestReport ? `${latestReport.score}%` : "Ready",
    styles: {
      color: latestReport?.flaggedSections ? "#f59e0b" : "#22c55e",
      fontWeight: "800"
    }
  });

  header.append(title, score);
  panel.append(header);
}

function appendMessage(panel: HTMLElement, text: string, color = "#94a3b8") {
  panel.append(createElement("div", { text, styles: { color, lineHeight: "1.45" } }));
}

function appendViolation(panel: HTMLElement, report: ComplianceReport) {
  const firstViolation = report.violations[0];
  if (!firstViolation) {
    appendMessage(panel, "No violations detected.", "#22c55e");
    appendMessage(panel, report.summary ?? "Draft is ready for review.");
    return;
  }

  panel.append(
    createElement("div", {
      text: firstViolation.policySection,
      styles: { color: "#f59e0b", fontWeight: "800", marginBottom: "8px" }
    }),
    createElement("div", {
      text: firstViolation.explanation,
      styles: { color: "#94a3b8", lineHeight: "1.45", marginBottom: "10px" }
    }),
    createElement("div", {
      text: firstViolation.rewrite,
      styles: {
        padding: "10px",
        border: "1px solid rgba(34,197,94,.22)",
        borderRadius: "8px",
        background: "rgba(34,197,94,.08)",
        lineHeight: "1.45"
      }
    })
  );

  const applyButton = createPanelButton("Apply rewrite", "#5b8cff");
  applyButton.addEventListener("click", () => applyFirstRewrite());
  panel.append(applyButton);
}

function createPanelButton(label: string, background = "rgba(255,255,255,.04)") {
  const button = createElement("button", { text: label });
  setStyles(button, {
    width: "100%",
    height: "36px",
    marginTop: "10px",
    border: "1px solid rgba(91,140,255,.45)",
    borderRadius: "8px",
    background,
    color: "#e5e7eb",
    fontWeight: "800",
    cursor: "pointer"
  });
  return button;
}

function renderPanel(state: PanelState, message = "") {
  const panel = ensurePanel();
  panel.replaceChildren();
  appendHeader(panel);

  if (state === "loading") {
    appendMessage(panel, "Scanning current Gmail draft against company policy...");
  } else if (state === "error") {
    appendMessage(panel, message, "#fecaca");
    if (latestReport) appendViolation(panel, latestReport);
  } else if (latestReport) {
    appendViolation(panel, latestReport);
  }

  const rescanButton = createPanelButton("Rescan draft");
  rescanButton.addEventListener("click", () => void scanDraft());
  panel.append(rescanButton);
}

function applyFirstRewrite() {
  const violation = latestReport?.violations[0];
  if (!violation) return;
  const nextText = applyRewrite(latestText, violation);
  if (setComposeText(nextText)) {
    latestText = nextText;
    latestReport = runDemoComplianceCheck(nextText);
    renderPanel("ready");
  } else {
    renderPanel("error", "Could not find the active Gmail compose body.");
  }
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
    latestReport = await analyzeDraft(text);
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

  const button = createElement("button", { id: BUTTON_ID, text: "Check Compliance" });
  setStyles(button, {
    position: "fixed",
    right: "22px",
    bottom: "378px",
    zIndex: "2147483647",
    height: "38px",
    padding: "0 14px",
    border: "1px solid rgba(91,140,255,.45)",
    borderRadius: "8px",
    background: "linear-gradient(135deg,#5b8cff,#6d7cf8)",
    color: "#fff",
    font: "800 13px Geist,Inter,system-ui,sans-serif",
    boxShadow: "0 14px 34px rgba(91,140,255,.22)",
    cursor: "pointer"
  });
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
