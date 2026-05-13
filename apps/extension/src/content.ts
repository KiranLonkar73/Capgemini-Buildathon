import { API_BASE_URL, applyRewrite, runDemoComplianceCheck, type ComplianceReport, type Violation } from "@complylens/shared";

const FAB_ID = "complylens-gmail-fab";
const TOOLTIP_ID = "complylens-gmail-tooltip";

type TooltipState = "loading" | "ready" | "error";

let latestReport: ComplianceReport | null = null;
let latestText = "";
let liveScanTimer = 0;

function getCompose() {
  return document.querySelector<HTMLElement>('[role="textbox"][aria-label*="Message Body"]');
}

function getComposeText() {
  return getCompose()?.innerText ?? "";
}

function getComposeAnchor() {
  const compose = getCompose();
  if (!compose) return null;
  return compose.closest<HTMLElement>('div[role="dialog"]') ?? compose;
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
  options: { text?: string; id?: string; styles?: Partial<CSSStyleDeclaration> } = {}
) {
  const element = document.createElement(tag);
  if (options.id) element.id = options.id;
  if (options.text) element.textContent = options.text;
  if (options.styles) setStyles(element, options.styles);
  return element;
}

function ensureFab() {
  let fab = document.getElementById(FAB_ID) as HTMLButtonElement | null;
  if (fab) return fab;

  fab = createElement("button", { id: FAB_ID }) as HTMLButtonElement;
  fab.setAttribute("aria-label", "Scan this Gmail draft with ComplyLens");
  fab.textContent = "CL";
  setStyles(fab, {
    position: "fixed",
    zIndex: "2147483647",
    width: "46px",
    height: "46px",
    border: "0",
    borderRadius: "999px",
    background: "linear-gradient(135deg,#4f46e5,#7c3aed 55%,#f59e0b)",
    color: "#fff",
    font: "800 12px Inter,system-ui,sans-serif",
    letterSpacing: "0.06em",
    boxShadow: "0 18px 40px rgba(79,70,229,.28)",
    cursor: "pointer",
    display: "none"
  });
  fab.addEventListener("click", () => void scanDraft());
  document.body.appendChild(fab);
  return fab;
}

function ensureTooltip() {
  let tooltip = document.getElementById(TOOLTIP_ID);
  if (tooltip) return tooltip;

  tooltip = createElement("section", { id: TOOLTIP_ID });
  setStyles(tooltip, {
    position: "fixed",
    zIndex: "2147483647",
    width: "320px",
    padding: "14px",
    border: "1px solid rgba(148,163,184,.2)",
    borderRadius: "18px",
    background: "rgba(255,255,255,.96)",
    color: "#0f172a",
    font: "13px Inter,system-ui,sans-serif",
    boxShadow: "0 18px 42px rgba(15,23,42,.18)",
    backdropFilter: "blur(14px)",
    display: "none"
  });
  document.body.appendChild(tooltip);
  return tooltip;
}

function hideTooltip() {
  const tooltip = ensureTooltip();
  tooltip.style.display = "none";
}

function findQuoteRect(quote: string) {
  const compose = getCompose();
  if (!compose || !quote.trim()) return null;

  const walker = document.createTreeWalker(compose, NodeFilter.SHOW_TEXT);
  let node: Node | null = walker.nextNode();
  while (node) {
    const text = node.textContent ?? "";
    const start = text.indexOf(quote);
    if (start >= 0) {
      const range = document.createRange();
      range.setStart(node, start);
      range.setEnd(node, start + quote.length);
      const rect = range.getBoundingClientRect();
      if (rect.width > 0 || rect.height > 0) {
        return rect;
      }
    }
    node = walker.nextNode();
  }
  return null;
}

function positionFab() {
  const fab = ensureFab();
  const anchor = getComposeAnchor();
  if (!anchor) {
    fab.style.display = "none";
    hideTooltip();
    return;
  }

  const rect = anchor.getBoundingClientRect();
  fab.style.display = "grid";
  fab.style.placeItems = "center";
  fab.style.left = `${Math.max(16, rect.right - 56)}px`;
  fab.style.top = `${Math.max(16, rect.bottom - 56)}px`;
}

function positionTooltip(quote?: string) {
  const tooltip = ensureTooltip();
  const anchor = getComposeAnchor();
  if (!anchor) return;

  const quoteRect = quote ? findQuoteRect(quote) : null;
  const anchorRect = quoteRect ?? anchor.getBoundingClientRect();
  const top = Math.max(16, anchorRect.top - 12);
  const left = Math.min(window.innerWidth - 336, anchorRect.right + 12);

  tooltip.style.top = `${top}px`;
  tooltip.style.left = `${Math.max(16, left)}px`;
}

function actionButton(label: string, accent = false) {
  const button = createElement("button", { text: label }) as HTMLButtonElement;
  setStyles(button, {
    minHeight: "34px",
    padding: "0 12px",
    border: accent ? "0" : "1px solid rgba(148,163,184,.24)",
    borderRadius: "999px",
    background: accent ? "linear-gradient(135deg,#4f46e5,#6d5dfc)" : "rgba(248,250,252,.94)",
    color: accent ? "#fff" : "#0f172a",
    fontWeight: "800",
    cursor: "pointer"
  });
  return button;
}

function renderTooltip(state: TooltipState, message = "") {
  const tooltip = ensureTooltip();
  tooltip.replaceChildren();

  const header = createElement("div");
  setStyles(header, {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
    marginBottom: "10px"
  });

  const title = createElement("strong", { text: "ComplyLens" });
  setStyles(title, { fontSize: "14px" });
  header.append(title);

  if (latestReport) {
    const score = createElement("span", { text: `${latestReport.score}%` });
    setStyles(score, {
      padding: "4px 8px",
      borderRadius: "999px",
      background: latestReport.flaggedSections ? "rgba(251,191,36,.18)" : "rgba(16,185,129,.16)",
      color: latestReport.flaggedSections ? "#92400e" : "#047857",
      fontWeight: "800"
    });
    header.append(score);
  }
  tooltip.append(header);

  if (state === "loading") {
    tooltip.append(createElement("p", { text: "Scanning this draft..." }));
    setStyles(tooltip.lastElementChild as HTMLElement, { margin: "0", color: "#64748b", lineHeight: "1.5" });
    tooltip.style.display = "block";
    positionTooltip();
    return;
  }

  if (state === "error") {
    const error = createElement("p", { text: message });
    setStyles(error, { margin: "0", color: "#991b1b", lineHeight: "1.5" });
    tooltip.append(error);
    tooltip.style.display = "block";
    positionTooltip();
    return;
  }

  const violation = latestReport?.violations[0];
  if (!violation) {
    const ok = createElement("p", { text: latestReport?.summary ?? "No policy issues found." });
    setStyles(ok, { margin: "0", color: "#047857", lineHeight: "1.5" });
    tooltip.append(ok);
    tooltip.style.display = "block";
    positionTooltip();
    return;
  }

  tooltip.append(violationCard(violation));
  tooltip.style.display = "block";
  positionTooltip(violation.quote);
}

function violationCard(violation: Violation) {
  const wrap = createElement("div");
  setStyles(wrap, { display: "grid", gap: "10px" });

  const policyRef = createElement("div");
  setStyles(policyRef, {
    padding: "10px",
    borderRadius: "14px",
    background: "rgba(251,191,36,.14)",
    color: "#92400e"
  });
  const policyTitle = createElement("strong", { text: "Policy reference" });
  setStyles(policyTitle, { display: "block", marginBottom: "4px" });
  const policyText = createElement("span", { text: violation.policySection });
  policyRef.append(policyTitle, policyText);

  const why = createElement("div");
  setStyles(why, {
    padding: "10px",
    borderRadius: "14px",
    background: "rgba(248,250,252,.96)"
  });
  const whyTitle = createElement("strong", { text: "Why this matters" });
  setStyles(whyTitle, { display: "block", marginBottom: "4px" });
  const whyText = createElement("span", { text: violation.explanation });
  setStyles(whyText, { color: "#475569", lineHeight: "1.5" });
  why.append(whyTitle, whyText);

  const rewrite = createElement("div");
  setStyles(rewrite, {
    padding: "10px",
    borderRadius: "14px",
    background: "rgba(236,253,245,.9)",
    color: "#047857"
  });
  const rewriteTitle = createElement("strong", { text: "Suggested rewrite" });
  setStyles(rewriteTitle, { display: "block", marginBottom: "4px" });
  const rewriteText = createElement("span", { text: violation.rewrite });
  setStyles(rewriteText, { lineHeight: "1.5" });
  rewrite.append(rewriteTitle, rewriteText);

  const actions = createElement("div");
  setStyles(actions, { display: "flex", gap: "8px", flexWrap: "wrap" });

  const apply = actionButton("Apply rewrite", true);
  apply.addEventListener("click", () => applyFirstRewrite());

  const rescan = actionButton("Rescan");
  rescan.addEventListener("click", () => void scanDraft());

  const dismiss = actionButton("Hide");
  dismiss.addEventListener("click", () => hideTooltip());

  actions.append(apply, rescan, dismiss);
  wrap.append(policyRef, why, rewrite, actions);
  return wrap;
}

function applyFirstRewrite() {
  const violation = latestReport?.violations[0];
  if (!violation) return;
  const nextText = applyRewrite(latestText, violation);
  if (!setComposeText(nextText)) {
    renderTooltip("error", "Could not update the current Gmail compose box.");
    return;
  }
  latestText = nextText;
  latestReport = runDemoComplianceCheck(nextText);
  renderTooltip("ready");
}

async function scanDraft() {
  const text = getComposeText();
  latestText = text;
  if (!text.trim()) {
    latestReport = null;
    renderTooltip("error", "Open a Gmail compose window and enter draft text first.");
    return;
  }

  renderTooltip("loading");
  try {
    latestReport = await analyzeDraft(text);
    renderTooltip("ready");
  } catch (error) {
    latestReport = runDemoComplianceCheck(text);
    renderTooltip(
      "ready",
      `Backend unavailable, showing local analysis. ${error instanceof Error ? error.message.slice(0, 120) : ""}`
    );
  }
}

function scheduleLiveScan() {
  window.clearTimeout(liveScanTimer);
  liveScanTimer = window.setTimeout(() => {
    if (ensureTooltip().style.display !== "none" && getComposeText() !== latestText) {
      void scanDraft();
    }
  }, 900);
}

function bootstrap() {
  ensureFab();
  ensureTooltip();
  positionFab();
}

bootstrap();
setInterval(positionFab, 1200);
window.addEventListener("resize", positionFab);
window.addEventListener("scroll", positionFab, true);
document.addEventListener("input", scheduleLiveScan, true);
