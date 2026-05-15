# Plan: OpenClaw Agent Layer (Person 2)

## Context
ClaimFlow Autopilot is an AI insurance claims platform. Person 2 builds the **OpenClaw agent layer** in a new `agent/` directory. The flow (from integration.md steps 1-12) is:

```
ElevenLabs voice call (Person 2 configures)
    ↓ during call: tool calls
Backend /api/tools/* endpoints (Person 4 — already exists)
    ↓ call ends: post-call webhook
Backend /api/webhooks/elevenlabs/conversation-ended (Person 4 — stores to Supabase)
    ↓ backend forwards payload
OpenClaw gateway :18789/webhook/elevenlabs  ← Person 2 owns this
    ↓ skills analyze transcript + parse intent
OpenClaw calls backend → triggers Filecoin upload (Person 1) + escrow (Person 1)
```

**Model:** `openai/gpt-4o` (explicitly stated in Implementation.md Person 2 section)  
**Platform:** Windows — PowerShell or Git Bash  
**Note for integration:** `backend/src/routes/webhooks.ts` needs ~5 lines added to forward payload to OpenClaw after storing (coordinate with Person 4 on Day 3 when webhook format is locked)

---

## Directory Structure to Create

```
agent/
├── openclaw.json                  # OpenClaw workspace config
├── .env.example                   # Required env vars
├── system-prompt.md               # ElevenLabs agent system prompt (upload to ElevenLabs dashboard)
├── webhook-format.md              # Webhook contract spec — lock Day 3, share with all 4
├── skills/
│   ├── claim-analysis.md          # Skill 1: extract claim type, amount, incident details
│   ├── evidence-collection.md     # Skill 2: identify documents from transcript
│   ├── escrow-creation.md         # Skill 3: determine escrow amount + release conditions
│   ├── human-handoff.md           # Skill 4: escalation decision logic
│   └── status-query.md            # Skill 5: query and interpret claim status
└── plugins/
    └── claimflow-tools/
        ├── package.json
        ├── openclaw.plugin.json
        └── index.ts               # 6 tool wrappers → backend API at BACKEND_URL
```

---

## Tasks (in order)

### Task 1 — Install OpenClaw (Windows)
```powershell
iwr -useb https://openclaw.ai/install.ps1 | iex
openclaw onboard --install-daemon
openclaw doctor
```

### Task 2 — Create `agent/openclaw.json`
```json5
{
  agents: {
    defaults: {
      model: { primary: "openai/gpt-4o" }
    }
  },
  providers: {
    openai: { apiKey: "${OPENAI_API_KEY}" }
  },
  hooks: {
    endpoints: [{
      path: "/webhook/elevenlabs",
      token: "${WEBHOOK_TOKEN}",
      agent: "main"
    }]
  },
  skills: {
    enabled: true,
    directories: ["./skills"]
  },
  plugins: {
    enabled: true,
    entries: {
      "claimflow-tools": { enabled: true }
    }
  },
  gateway: {
    port: 18789,
    bind: "loopback",
    auth: "token"
  }
}
```

### Task 3 — Create 5 SKILL.md Files
Skills are natural-language instruction files — no code. Each uses YAML frontmatter:

```yaml
---
name: <skill-name>
description: <one-line description>
user-invocable: false
command-dispatch: false
---
<agent instructions here>
```

| File | Instructions to include |
|---|---|
| `claim-analysis.md` | Extract: claim_type (auto/home/health/life), incident_date, claim_amount, policy_number, customer_intent from transcript. Output structured JSON. |
| `evidence-collection.md` | List documents mentioned by customer. Compare against required docs per claim_type. Flag missing. Call `check_documents` tool to confirm. |
| `escrow-creation.md` | Determine escrow amount (= claim_amount). Set release conditions: all required docs received AND adjuster approval. Call `file_claim` to initiate. |
| `human-handoff.md` | Escalate when: fraud indicators present, claim > $50k, 2+ tool failures, customer explicitly requests human, complex multi-party liability. Call `escalate_to_human`. |
| `status-query.md` | Call `lookup_claim` tool. Translate status codes to plain English. If claim not found, ask customer to verify claim number. |

### Task 4 — Create ClaimFlow Tools Plugin

**`agent/plugins/claimflow-tools/openclaw.plugin.json`:**
```json
{
  "id": "claimflow-tools",
  "name": "ClaimFlow Backend Tools",
  "contracts": {
    "tools": [
      "lookup_claim",
      "check_policy",
      "check_documents",
      "file_claim",
      "escalate_to_human",
      "schedule_callback"
    ]
  },
  "activation": { "onStartup": true }
}
```

**`agent/plugins/claimflow-tools/package.json`:**
```json
{
  "name": "@claimflow/openclaw-tools",
  "version": "1.0.0",
  "type": "module",
  "openclaw": {
    "extensions": ["./index.ts"],
    "compat": { "pluginApi": ">=2026.3.24-beta.2" }
  }
}
```

**`agent/plugins/claimflow-tools/index.ts`** — registers 6 tools using `definePluginEntry` + `Type` from `@sinclair/typebox`:

| Tool | Endpoint | Parameters |
|---|---|---|
| `lookup_claim` | `POST /api/tools/lookup-claim` | `claim_id: string` |
| `check_policy` | `POST /api/tools/check-policy` | `policy_number: string`, `claim_type: string` |
| `check_documents` | `POST /api/tools/check-documents` | `claim_number: string` |
| `file_claim` | `POST /api/tools/file-claim` | `customer_name`, `claim_type`, `incident_date`, `amount`, `description` |
| `escalate_to_human` | `POST /api/tools/escalate-to-human` | `reason: string`, `priority: string`, `call_log_id?: string` |
| `schedule_callback` | `POST /api/tools/schedule-callback` | `phone_number: string`, `scheduled_time: string`, `reason: string` |

Each tool uses `fetch(BACKEND_URL + endpoint, { method: 'POST', body: JSON.stringify(params) })`.

### Task 5 — Create `agent/system-prompt.md`
This is the ElevenLabs agent's system prompt — copy-paste into ElevenLabs dashboard when configuring the agent. Defines:
- Persona: "ClaimFlow AI, an insurance claims intake assistant"
- Tone: professional, empathetic, concise
- Tool usage rules: when to call each tool, what to say while waiting for response
- Constraints: never quote policy limits not confirmed by `check_policy`; always confirm details before calling `file_claim`
- Escalation rule: call `escalate_to_human` if tool fails twice or customer requests human

### Task 6 — Create `agent/webhook-format.md` (lock Day 3)
Documents the contract. Backend sends this to OpenClaw; share with all 4 members Day 3, no changes after.

**Payload (backend → OpenClaw `/webhook/elevenlabs`):**
```typescript
{
  call_id: string
  session_id: string
  conversation_turns: Array<{
    role: 'user' | 'assistant'
    content: string
    timestamp: number
    confidence?: number
  }>
  analysis?: {
    summary: string
    sentiment: string
  }
  session_end_reason?: string
}
```

**Response (OpenClaw → backend after processing):**
```typescript
{
  response: string
  actions: string[]   // e.g. ["file_claim", "upload_evidence"]
  tool_invocations?: Array<{
    tool_name: string
    parameters: Record<string, any>
    result: any
    status: 'success' | 'failed'
  }>
}
```

### Task 7 — Create `agent/.env.example`
```
OPENAI_API_KEY=
ELEVENLABS_API_KEY=
ELEVENLABS_AGENT_ID=
BACKEND_URL=http://localhost:3005
WEBHOOK_TOKEN=
```

---

## Integration Note for Person 4 (coordinate Day 3)
After `backend/src/routes/webhooks.ts` stores the conversation, add a forward call to OpenClaw:
```typescript
// After storing to Supabase — forward to OpenClaw for skill analysis
await fetch('http://localhost:18789/webhook/elevenlabs', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${process.env.WEBHOOK_TOKEN}`, 'Content-Type': 'application/json' },
  body: JSON.stringify(forwardPayload)
});
```

---

## Key Files NOT to Modify (Person 4's — already exist)
| File | Purpose |
|---|---|
| `backend/src/routes/webhook-tools.ts` | All 6 tool endpoints the plugin calls |
| `backend/src/routes/webhooks.ts` | ElevenLabs post-call handler (add forward call only) |
| `backend/src/config/environment.ts` | Env loading pattern |

---

## Verification Steps
1. `openclaw doctor` — no errors
2. `openclaw gateway --port 18789 --verbose` — gateway starts
3. `openclaw skills list` — all 5 skills appear
4. `openclaw plugins list` — claimflow-tools appears enabled
5. `openclaw agent --message "I had a car accident on May 10th, need to file a claim for $8,500"` — claim-analysis skill extracts data
6. Simulate post-call webhook:
   ```bash
   curl -X POST http://localhost:18789/webhook/elevenlabs \
     -H "Authorization: Bearer $WEBHOOK_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"call_id":"test-001","session_id":"s1","conversation_turns":[{"role":"user","content":"I had a car accident, the damage is around 8500 dollars","timestamp":0}]}'
   ```
7. Confirm plugin called `POST http://localhost:3005/api/tools/file-claim` via OpenClaw logs
