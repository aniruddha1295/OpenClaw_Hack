# Webhook Format Specification

> **Lock date: Day 3** — No changes after this date. Share with all 4 team members.

This document defines the webhook contract between the Fastify backend (Person 4) and the OpenClaw agent gateway (Person 2).

---

## Flow

```
ElevenLabs post-call webhook
    → POST /api/webhooks/elevenlabs/conversation-ended  (Person 4 backend)
    → stores to Supabase
    → POST http://localhost:18789/webhook/elevenlabs     (Person 2 OpenClaw)
    → OpenClaw skills analyze + parse intent
```

---

## Inbound Payload (Backend → OpenClaw)

Sent as `POST http://localhost:18789/webhook/elevenlabs` with header:
`Authorization: Bearer <WEBHOOK_TOKEN>`

```typescript
interface ElevenLabsForwardPayload {
  call_id: string;           // ElevenLabs conversation ID
  session_id: string;        // Internal session identifier
  conversation_turns: ConversationTurn[];
  analysis?: CallAnalysis;
  session_end_reason?: string;
  error?: {
    code: string;
    message: string;
  };
}

interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;         // Seconds from call start
  confidence?: number;       // 0–1, STT confidence (user turns only)
}

interface CallAnalysis {
  summary: string;           // ElevenLabs-generated summary
  sentiment: string;         // e.g. "positive", "neutral", "negative"
}
```

### Example Payload

```json
{
  "call_id": "conv_01jvxxxxxxxxxxxxxxxx",
  "session_id": "s_abc123",
  "conversation_turns": [
    { "role": "assistant", "content": "Thank you for calling ClaimFlow AI. How can I help you today?", "timestamp": 0 },
    { "role": "user", "content": "Hi, I had a car accident last Friday and need to file a claim. The damage is about $8,500.", "timestamp": 4.2, "confidence": 0.96 },
    { "role": "assistant", "content": "I'm sorry to hear that. Let me help you file that claim.", "timestamp": 7.1 }
  ],
  "analysis": {
    "summary": "Customer called to file an auto claim for collision damage of $8,500 from an incident on 2026-05-09.",
    "sentiment": "neutral"
  },
  "session_end_reason": "user_hangup"
}
```

---

## Outbound Response (OpenClaw → Backend)

OpenClaw returns this JSON after processing:

```typescript
interface AgentResponse {
  response: string;                    // Summary of what the agent decided
  actions: string[];                   // Actions taken e.g. ["file_claim", "upload_evidence"]
  tool_invocations?: ToolInvocation[];
  error?: string;                      // Set if processing failed
}

interface ToolInvocation {
  tool_name: string;
  parameters: Record<string, unknown>;
  result: unknown;
  status: 'success' | 'failed';
  latency_ms?: number;
}
```

### Example Response

```json
{
  "response": "Filed auto claim CLM-2026-001234 for $8,500 collision damage on 2026-05-09.",
  "actions": ["file_claim"],
  "tool_invocations": [
    {
      "tool_name": "file_claim",
      "parameters": {
        "policy_number": "POL-2024-001234",
        "claim_type": "auto",
        "incident_date": "2026-05-09",
        "incident_description": "Collision damage from car accident"
      },
      "result": { "claim_number": "CLM-2026-001234", "status": "pending" },
      "status": "success",
      "latency_ms": 312
    }
  ]
}
```

---

## Integration Note for Person 4

Add this after the Supabase store in `backend/src/routes/webhooks.ts`:

```typescript
// Forward to OpenClaw for skill analysis
try {
  await fetch('http://localhost:18789/webhook/elevenlabs', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.WEBHOOK_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      call_id: payload.conversation_id,
      session_id: payload.call_id,
      conversation_turns: payload.transcript?.map((t: any) => ({
        role: t.role,
        content: t.message ?? t.text ?? '',
        timestamp: t.time_in_call_secs ?? 0,
      })) ?? [],
      analysis: payload.analysis ? {
        summary: payload.analysis.transcript_summary ?? '',
        sentiment: payload.analysis.user_sentiment ?? 'neutral',
      } : undefined,
    }),
  });
} catch (err) {
  fastify.log.warn({ err }, 'OpenClaw forward failed — non-blocking');
}
```

---

## Change Log

| Date | Version | Change | Author |
|------|---------|--------|--------|
| 2026-05-14 | 1.0 | Initial spec | Person 2 |
