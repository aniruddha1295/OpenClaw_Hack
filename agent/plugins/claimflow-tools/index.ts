import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import { Type } from "@sinclair/typebox";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3005";

async function callBackend(endpoint: string, params: Record<string, unknown>) {
  const res = await fetch(`${BACKEND_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    throw new Error(`Backend error ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

export default definePluginEntry({
  id: "claimflow-tools",
  register(api) {
    api.registerTool({
      name: "lookup_claim",
      description: "Look up an existing insurance claim by claim ID to get its current status and details.",
      parameters: Type.Object({
        claim_id: Type.String({ description: "The claim ID (e.g. CLM-2026-000123)" }),
      }),
      async execute(_id, params) {
        const result = await callBackend("/api/tools/lookup-claim", params);
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
      },
    });

    api.registerTool({
      name: "check_policy",
      description: "Check whether a policy covers a specific claim type and retrieve coverage details.",
      parameters: Type.Object({
        policy_number: Type.String({ description: "The customer's policy number" }),
        claim_type: Type.String({ description: "Type of claim: auto, home, health, or life" }),
      }),
      async execute(_id, params) {
        const result = await callBackend("/api/tools/check-policy", params);
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
      },
    });

    api.registerTool({
      name: "check_documents",
      description: "Check which documents have been received for a claim and which are still missing.",
      parameters: Type.Object({
        claim_number: Type.String({ description: "The claim number to check documents for" }),
      }),
      async execute(_id, params) {
        const result = await callBackend("/api/tools/check-documents", params);
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
      },
    });

    api.registerTool({
      name: "file_claim",
      description: "File a new insurance claim on behalf of the customer.",
      parameters: Type.Object({
        policy_number: Type.String({ description: "The customer's policy number" }),
        claim_type: Type.String({ description: "Type of claim: auto, home, health, or life" }),
        incident_date: Type.String({ description: "Date of the incident in ISO format (YYYY-MM-DD)" }),
        incident_description: Type.String({ description: "Brief description of the incident and damages" }),
      }),
      async execute(_id, params) {
        const result = await callBackend("/api/tools/file-claim", params);
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
      },
    });

    api.registerTool({
      name: "escalate_to_human",
      description: "Escalate the current call to a human agent.",
      parameters: Type.Object({
        reason: Type.String({ description: "Reason for escalation" }),
        priority: Type.Union([Type.Literal("urgent"), Type.Literal("normal")], {
          description: "Priority level: urgent or normal",
        }),
        call_log_id: Type.Optional(Type.String({ description: "Current call log ID if available" })),
      }),
      async execute(_id, params) {
        const result = await callBackend("/api/tools/escalate-to-human", params);
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
      },
    });

    api.registerTool({
      name: "schedule_callback",
      description: "Schedule a callback for the customer at a preferred time.",
      parameters: Type.Object({
        phone_number: Type.String({ description: "Customer phone number to call back" }),
        preferred_time: Type.String({ description: "Preferred callback time — accepts natural language (e.g. 'tomorrow at 2pm', 'next Monday morning') or ISO format" }),
        reason: Type.Optional(Type.String({ description: "Reason for the callback" })),
      }),
      async execute(_id, params) {
        const result = await callBackend("/api/tools/schedule-callback", params);
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
      },
    });
  },
});
