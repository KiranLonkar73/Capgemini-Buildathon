import { API_BASE_URL, type ComplianceReport } from "@complylens/shared";

export async function analyzeDocument(input: {
  text: string;
  documentName: string;
  threshold: number;
}) {
  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
  if (!response.ok) throw new Error(await response.text());
  return (await response.json()) as ComplianceReport;
}

export async function analyzeUploadedDocument(file: File, threshold: number) {
  const body = new FormData();
  body.append("file", file);
  body.append("threshold", String(threshold));
  const response = await fetch(`${API_BASE_URL}/analyze-upload`, { method: "POST", body });
  if (!response.ok) throw new Error(await response.text());
  return (await response.json()) as { text: string; report: ComplianceReport };
}

export async function uploadPolicyDocument(file: File) {
  const body = new FormData();
  body.append("file", file);
  body.append("policy_name", file.name.replace(/\.(pdf|docx|txt)$/i, ""));
  const response = await fetch(`${API_BASE_URL}/upload-policy`, { method: "POST", body });
  if (!response.ok) throw new Error(await response.text());
  return (await response.json()) as { uploaded: boolean; chunks: number };
}

export async function saveCompanySettings(payload: {
  organizationId: string;
  organizationName: string;
  threshold: number;
  activePolicySet: string;
}) {
  const response = await fetch(`${API_BASE_URL}/settings/company`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}
