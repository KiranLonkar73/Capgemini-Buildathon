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
    borderRadius: "18px",
    background: "rgba(255,255,255,.92)",
    color: "#0f172a",
    font: "14px Geist,Inter,system-ui,sans-serif",
    boxShadow: "0 20px 60px rgba(15,23,42,.16)",
    backdropFilter: "blur(18px)"
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
      color: latestReport?.flaggedSections ? "#f59e0b" : "#10b981",
      fontWeight: "800"
    }
  });

  header.append(title, score);
  panel.append(header);
}

function appendMessage(panel: HTMLElement, text: string, color = "#64748b") {
  panel.append(createElement("div", { text, styles: { color, lineHeight: "1.45" } }));
}

function appendViolation(panel: HTMLElement, report: ComplianceReport) {
  const firstViolation = report.violations[0];
  if (!firstViolation) {
    appendMessage(panel, "No violations detected.", "#10b981");
    appendMessage(panel, report.summary ?? "Draft is ready for review.");
    return;
  }

  panel.append(
    createElement("div", {
      text: firstViolation.policySection,
      styles: { color: "#92400e", fontWeight: "800", marginBottom: "8px" }
    }),
    createElement("div", {
      text: firstViolation.explanation,
      styles: { color: "#64748b", lineHeight: "1.45", marginBottom: "10px" }
    }),
    createElement("div", {
      text: firstViolation.rewrite,
      styles: {
        padding: "10px",
        border: "1px solid rgba(16,185,129,.22)",
        borderRadius: "14px",
        background: "rgba(236,253,245,.86)",
        lineHeight: "1.45"
      }
    })
  );

  const applyButton = createPanelButton("Apply rewrite", "#4f46e5");
  applyButton.addEventListener("click", () => applyFirstRewrite());
  panel.append(applyButton);
}

function createPanelButton(label: string, background = "rgba(248,250,252,.86)") {
  const button = createElement("button", { text: label });
  setStyles(button, {
    width: "100%",
    height: "36px",
    marginTop: "10px",
    border: "1px solid rgba(148,163,184,.22)",
    borderRadius: "999px",
    background,
    color: background === "#4f46e5" ? "#fff" : "#0f172a",
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
    appendMessage(panel, message, "#991b1b");
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
    border: "1px solid rgba(79,70,229,.28)",
    borderRadius: "999px",
    background: "linear-gradient(135deg,#4f46e5,#6d5dfc)",
    color: "#fff",
    font: "800 13px Geist,Inter,system-ui,sans-serif",
    boxShadow: "0 14px 34px rgba(79,70,229,.22)",
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
