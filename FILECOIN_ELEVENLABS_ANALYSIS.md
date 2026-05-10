# Filecoin & ElevenLabs Integration — Root Cause Analysis

> **Date:** 2026-05-10  
> **Scope:** Full audit of Filecoin storage, Base Sepolia attestation, EAS, and ElevenLabs widget integration  
> **Status:** Blockers identified — action required before these features can be tested end-to-end

---

## Summary

The Filecoin and ElevenLabs integrations exist in the codebase but are **not functional end-to-end** due to a combination of missing environment variables, an undeployed smart contract, an incorrectly initialized SDK, missing UI pages, and a disconnected webhook pipeline. Every individual piece is partially built but none are wired together correctly.

---

## 🔴 BLOCKER 1 — `AGENT_PRIVATE_KEY` is missing from Railway

### Location
`backend/src/config/environment.ts` → `optionalEnv('AGENT_PRIVATE_KEY')`

### Impact
Every Filecoin and blockchain operation in the backend is guarded by:
```typescript
if (config.agentPrivateKey) {
  // Filecoin upload, Base Sepolia tx, EAS attestation
}
```
Since `AGENT_PRIVATE_KEY` is not present in Railway's environment variable list (confirmed from screenshot — 10 vars, key is absent), **the entire blockchain pipeline is silently skipped on every tool call**. No uploads happen, no transactions are sent, and the database columns (`filecoin_cid`, `piece_cid`, `attestation_tx_hash`, `eas_uid`) stay `null` forever.

### Fix Required
Add `AGENT_PRIVATE_KEY` to Railway service variables. This must be the private key of a funded Base Sepolia wallet (needs testnet ETH to pay for gas).

---

## 🔴 BLOCKER 2 — `ClaimRegistry.sol` Has No Deploy Script

### Location
`contracts/script/` — only contains `Counter.s.sol`, **no `ClaimRegistry.s.sol`**

### Impact
The `CLAIM_REGISTRY_ADDRESS` env var is set in Railway, but there is no evidence the contract was actually deployed using Foundry. If the address is wrong or points to a non-existent contract:
- `attestClaim()` in `ethereum-service.ts` will throw on every call
- The error is caught and silently swallowed in `processClaimEvidence()`
- `attestation_tx_hash` stays `null`

### Fix Required
1. Create `contracts/script/DeployClaimRegistry.s.sol`
2. Deploy to Base Sepolia via `forge script`
3. Update `CLAIM_REGISTRY_ADDRESS` in Railway with the real deployed address

---

## 🔴 BLOCKER 3 — Synapse SDK Initialization Uses Guesswork

### Location
`backend/src/plugins/filecoin.ts` lines 29-44

### Problem
```typescript
const synapseFactory = 
  synapseModule.createClient ||   // guessed
  synapseModule.Synapse ||        // guessed
  synapseModule.default;          // guessed
```
The `@filoz/synapse-sdk@0.38.0` package has a specific API that is not verified here. If none of the guessed export names match the real export, `synapseFactory` is `null` or `undefined` and the server **throws on startup**, causing Railway healthchecks to fail.

Additionally, the Synapse client is initialized with only a `viem` public client:
```typescript
synapseInstance = synapseFactory({ client: publicClient });
```
The real Synapse SDK likely requires authentication credentials (API key or wallet) to authorize uploads to Filecoin. Without this, uploads will be rejected.

### Fix Required
1. Check `@filoz/synapse-sdk` docs or source for the correct initialization API
2. Verify what credentials are needed for uploads (API key, private key, etc.)
3. Rewrite the `filecoinPlugin` to use the verified API

---

## 🔴 BLOCKER 4 — No Filecoin UI Exists in the App

### Location
`frontend/src/` — no `/blockchain` page, no nav entry

### Problem
- The sidebar has: Claims, Call History, Live Call, Analytics, Agent Config — **no Filecoin or Blockchain page**
- `FilecoinPanel` is only rendered inside `/claims/:id` (claim detail), buried in the sidebar column
- There is no way to see the Filecoin storage status of all claims at a glance
- There is no Filecoin badge/indicator on the claims list table
- A user has no way to know that any on-chain activity exists

### Fix Required
1. Add a `/blockchain` page showing Filecoin + attestation status across all claims
2. Add a Filecoin stored indicator column to the claims list table
3. Add "Blockchain" nav item to the sidebar

---

## 🟡 ISSUE 5 — ElevenLabs Webhook Does NOT Trigger Filecoin Pipeline

### Location
`backend/src/routes/webhooks.ts` (conversation-ended webhook)  
`backend/src/routes/webhook-tools.ts` (tool endpoints)

### Problem
The architecture has two separate flows:

**Flow A — ElevenLabs Tool Calls (where Filecoin IS triggered):**
```
ElevenLabs agent → POST /api/tools/file-claim → processClaimEvidence() → Filecoin upload
```

**Flow B — ElevenLabs Webhook (where Filecoin is NOT triggered):**
```
ElevenLabs → POST /api/webhooks/elevenlabs/conversation-ended → saves call log only
```

When a user makes a call via the **WebRTC widget** embedded in the frontend, ElevenLabs routes tool calls internally through its own cloud. It only fires the `conversation-ended` webhook after the call ends. That webhook saves the transcript and call log but **never triggers Filecoin uploads**.

For Filecoin to be triggered via the widget, ElevenLabs must be configured to call your backend tool endpoints (`/api/tools/file-claim`, etc.) as server-side tools — not execute them internally.

### Fix Required
1. In the ElevenLabs agent dashboard, configure all tools as **server-side tools** pointing to `https://loopshackerhouse-production.up.railway.app/api/tools/{tool_name}`
2. Or: trigger `processClaimEvidence()` from within the `conversation-ended` webhook handler after parsing which claim was filed from the transcript/data collection results

---

## 🟡 ISSUE 6 — ElevenLabs Widget Script Was Missing

### Location
`frontend/index.html`

### Problem
`CallWidget.tsx` renders `<elevenlabs-convai agent-id="...">` which is a custom web component. The script that registers this element (`@elevenlabs/convai-widget-embed`) was **not included** in `index.html`. The browser had no idea what `<elevenlabs-convai>` was, so it rendered nothing — the call button was invisible.

### Status: ✅ FIXED
Added to `index.html`:
```html
<script src="https://unpkg.com/@elevenlabs/convai-widget-embed" async type="text/javascript"></script>
```

---

## Architecture — How It Should Work End-to-End

```
┌─────────────────────────────────────────────────────────────────┐
│                     Customer Browser                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  ElevenLabs Widget (WebRTC voice call)                   │   │
│  │  → agent-id from VITE_ELEVENLABS_AGENT_ID                │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │ 1. WebRTC audio stream
                             ▼
┌────────────────────────────────────────────────────────────────┐
│                   ElevenLabs Cloud                              │
│  AI Agent (Alex) processes call                                 │
│  → Calls backend tools as HTTP POST (if configured as server)  │
│  → Fires conversation-ended webhook after call                 │
└────────────────────────┬───────────────────┬────────────────────┘
                         │ 2. Tool calls      │ 3. Webhook
                         ▼                   ▼
┌────────────────────────────────────────────────────────────────┐
│              Railway Backend (Node.js + Fastify)               │
│                                                                 │
│  /api/tools/file-claim                                          │
│    → fileClaim() in Supabase                                    │
│    → processClaimEvidence()                                     │
│        → uploadClaimBundle() → Filecoin Calibration (Synapse)  │
│        → attestClaim() → Base Sepolia ClaimRegistry contract   │
│        → issueAttestation() → EAS on Base Sepolia              │
│        → Update claims table with CIDs + tx hashes             │
│                                                                 │
│  /api/webhooks/elevenlabs/conversation-ended                    │
│    → Save call log, transcript, tool executions to Supabase    │
│    → Broadcast via Supabase Realtime                           │
└────────────────────┬───────────────────────────────────────────┘
                     │ 4. Realtime updates
                     ▼
┌────────────────────────────────────────────────────────────────┐
│                     Supabase                                    │
│  Tables: claims, call_logs, evidence_bundles,                  │
│           filecoin_uploads, call_tool_executions               │
│  Realtime: Supabase broadcast channel 'call-updates'           │
└────────────────────────────────────────────────────────────────┘
                     │ 5. Frontend reads data
                     ▼
┌────────────────────────────────────────────────────────────────┐
│                  Vercel Frontend (React + Vite)                 │
│  /claims/:id → FilecoinPanel shows CIDs + tx hashes            │
│  /live       → useRealtimeCalls hook shows live tool events    │
└────────────────────────────────────────────────────────────────┘
```

---

## Environment Variables Checklist

### Railway (Backend)
| Variable | Status | Notes |
|---|---|---|
| `SUPABASE_URL` | ✅ Set | |
| `SUPABASE_ANON_KEY` | ✅ Set | |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Set | |
| `ELEVENLABS_WEBHOOK_SECRET` | ✅ Set | |
| `BASE_SEPOLIA_RPC_URL` | ✅ Set | |
| `FILECOIN_RPC_URL` | ✅ Set | |
| `CLAIM_REGISTRY_ADDRESS` | ⚠️ Set but unverified | Contract may not be deployed |
| `FRONTEND_URL` | ✅ Set | |
| `NODE_ENV` | ✅ Set | |
| `PORT` | ✅ Set | |
| `AGENT_PRIVATE_KEY` | ❌ **MISSING** | **Critical blocker** |
| `EAS_CONTRACT_ADDRESS` | ❓ Unknown | Optional but needed for EAS |
| `EAS_SCHEMA_UID` | ❓ Unknown | Optional but needed for EAS |
| `EAS_SCHEMA` | ❓ Unknown | Optional but needed for EAS |
| `AGENT_ID` | ❓ Unknown | Optional |

### Vercel (Frontend)
| Variable | Status | Notes |
|---|---|---|
| `VITE_SUPABASE_URL` | ✅ Set | |
| `VITE_SUPABASE_ANON_KEY` | ✅ Set | |
| `VITE_API_URL` | ✅ Set | Must include `https://` prefix |
| `VITE_ELEVENLABS_AGENT_ID` | ✅ Set | |

---

## Priority Fix Order

| Priority | Fix | Effort |
|---|---|---|
| 🔴 P0 | Add `AGENT_PRIVATE_KEY` to Railway | 2 min — just add env var |
| 🔴 P0 | Verify `CLAIM_REGISTRY_ADDRESS` is a real deployed contract | 15 min |
| 🔴 P1 | Fix Synapse SDK initialization in `filecoin.ts` | 30 min |
| 🔴 P1 | Configure ElevenLabs tools as server-side tools in dashboard | 15 min |
| 🟡 P2 | Add `/blockchain` page to frontend | 2 hours |
| 🟡 P2 | Wire `conversation-ended` webhook to trigger Filecoin pipeline | 1 hour |
| 🟢 P3 | Add Filecoin badge to claims list | 30 min |
| 🟢 P3 | Write `DeployClaimRegistry.s.sol` Foundry script | 30 min |
