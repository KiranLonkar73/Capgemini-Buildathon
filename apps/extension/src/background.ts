/* Background service worker for extension-level fetches to avoid CORS issues from page context.
   Listens for messages from content scripts and performs safe fetches using the extension origin.
*/

import type { AnalyzeRequest, RewriteRequest } from "@complylens/shared";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    try {
      if (message?.type === "analyze") {
        const payload: AnalyzeRequest = message.payload;
        const base = (await new Promise<string>((resolve) => {
          chrome.storage?.sync?.get(["complylensApiBaseUrl"], (result) => {
            resolve(result.complylensApiBaseUrl || "http://127.0.0.1:8000");
          });
        })) as string;

        const res = await fetch(`${base}/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const text = await res.text();
        try {
          const json = JSON.parse(text);
          sendResponse({ ok: res.ok, status: res.status, json });
        } catch (err) {
          sendResponse({ ok: res.ok, status: res.status, text });
        }
        return;
      }

      if (message?.type === "rewrite") {
        const payload: RewriteRequest = message.payload;
        const base = (await new Promise<string>((resolve) => {
          chrome.storage?.sync?.get(["complylensApiBaseUrl"], (result) => {
            resolve(result.complylensApiBaseUrl || "http://127.0.0.1:8000");
          });
        })) as string;

        const res = await fetch(`${base}/rewrite`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const text = await res.text();
        try {
          const json = JSON.parse(text);
          sendResponse({ ok: res.ok, status: res.status, json });
        } catch (err) {
          sendResponse({ ok: res.ok, status: res.status, text });
        }
        return;
      }

      sendResponse({ ok: false, error: "unknown_message" });
    } catch (error) {
      sendResponse({ ok: false, error: (error as Error).message });
    }
  })();
  return true; // keep channel open for async response
});
