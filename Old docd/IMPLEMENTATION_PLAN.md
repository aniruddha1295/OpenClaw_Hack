# IMPLEMENTATION PLAN — ClaimVault Pivot

> Translates `WINNING_STRATEGY.md` into a precise, file-by-file delta against the *current* codebase.
>
> Compiled from 13 parallel codebase-audit agents covering: backend bootstrap, webhook tools, services layer, DB schema, package deps, ElevenLabs widget, frontend pages, ElevenLabs cloud config, env vars, landing page, PRD docs, smart-contract approach, tests.
>
> Read `WINNING_STRATEGY.md` first for the *why*. This doc is the *what to do*.

---

## TL;DR — The Delta

| Category | Count | Notes |
|---|---|---|
| New files to add | **17** | 7 backend services/routes/plugins/types, 4 frontend components/pages, 6 in `contracts/` |
| Files to modify | **15** | with exact line numbers below |
| New backend packages | **3** | `@filoz/synapse-sdk`, `viem`, `@ethereum-attestation-service/eas-sdk` |
| New frontend packages | **1** | `viem` (`@elevenlabs/client@1.2.1` already installed but currently unused) |
| New env vars | **13** | 11 backend, 2 frontend |
| DB migrations | **2** | already drafted to disk: `0002_filecoin_columns.sql`, `0003_filecoin_tables.sql` |
| Smart contracts | **1** | `ClaimRegistry.sol` via Foundry in new `contracts/` directory |
| ElevenLabs cloud changes | **6** | dashboard work only, no code deploy |
| Security flags | **3** | committed JWTs, missing webhook HMAC, agent-ID inconsistency |
| Doc rewrites | **63 sections across 8 docs** | deferred — `WINNING_STRATEGY.md` already supersedes |

---

## Section 1 — Files to ADD

### 1.1 Backend (`backend/src/`)

| File | Purpose |
|---|---|
| `plugins/filecoin.ts` | `fastify-plugin` that initializes Synapse SDK once at boot, decorates `fastify.synapse`. One-time `payments.deposit({token: 'USDFC'})` + `approveOperator()` on first run. |
| `plugins/ethereum.ts` | `fastify-plugin` that initializes Viem `walletClient` + `publicClient` for Base Sepolia, decorates `fastify.viemWallet`, `fastify.viemPublic`, `fastify.claimRegistry`. |
| `services/attestation-service.ts` | Pure functions — `buildEvidenceBundle(claimRow, transcript, photoCids)`, `computeBundleHash(bundle)`, `signBundle(bundle, signer)`. No external clients. **Build first** (foundation for others). |
| `services/filecoin-service.ts` | `getSynapse()`, `uploadClaimBundle(bundle) -> {pieceCid, datasetId}`, `getDataSetStatus(datasetId)`, `downloadBundle(pieceCid) -> bytes`. Wraps Synapse SDK. |
| `services/ethereum-service.ts` | `attestClaim(claimNumberHash, cid, agentId) -> txHash`, `getAgentRegistration(agentId)`, `getClaimAttestation(claimNumberHash)`. Uses Viem clients from plugin. |
| `services/eas-service.ts` *(optional, DeFi narrative)* | `attestClaimEAS(claimNumber, schemaUid, data) -> easUid`. |
| `routes/integrity.ts` | `POST /api/claims/:id/verify-integrity` — re-fetches bundle from Filecoin, recomputes hash from current Postgres, returns `{match: bool, recomputed_hash, stored_hash}`. **The demo kill-shot endpoint.** |
| `routes/agent-identity.ts` | `GET /api/agent-identity` — reads agent_registrations + caches ERC-8004 metadata for `AgentIdentityCard`. |
| `routes/conversation-init.ts` | `GET /api/elevenlabs/conversation-init?phone_number=...` — returns `{dynamic_variables: {customer_name, policy_number, claim_history}}`. Used by ElevenLabs dynamic-variables fetch. |
| `abis/ClaimRegistry.json` | Committed ABI extracted from `forge build`. Imported by `services/ethereum-service.ts`. |

### 1.2 Backend (new tool routes)

Add to `backend/src/routes/webhook-tools.ts` (do NOT create a new file — extend existing):

| Tool | Purpose |
|---|---|
| `POST /api/tools/attach-document` | Receives `{claim_id, file_url, file_type}` from ElevenLabs multimodal flow. Pins to Filecoin via Synapse, returns `{cid, message}`. Updates `claims.documents_received`. |
| `POST /api/tools/verify-integrity` | Mid-call variant of the dashboard endpoint — agent can verify on caller's behalf. Same logic. |
| `POST /api/tools/escalate-to-regulator` | New escalation target — emits an EAS attestation summarizing the call + dispute, returns the attestation UID. |

### 1.3 Frontend (`frontend/src/`)

| File | Purpose |
|---|---|
| `components/AgentIdentityCard.tsx` | Card showing ERC-8004 agent ID, agent card CID, registry, owner, total claims attested. Used on `AgentConfig` page. |
| `components/IntegrityCheckButton.tsx` | The demo kill-shot button — calls `/api/claims/:id/verify-integrity`, animates green/red. |
| `components/FilecoinPanel.tsx` | Per-claim metadata panel — CID, dataset ID, piece CID, attestation tx hash, PDP proof status pill. |
| `pages/ClaimVault.tsx` *(optional new route — could fold into ClaimDetail)* | Per-claim "vault" view emphasizing user-owned receipt. |

### 1.4 Smart contracts (`contracts/`)

New directory at project root:

| File | Purpose |
|---|---|
| `contracts/foundry.toml` | Foundry config — Solidity 0.8.24, `[rpc_endpoints] base_sepolia`, `[etherscan]` for verify |
| `contracts/.env.example` | `PRIVATE_KEY`, `BASE_SEPOLIA_RPC_URL`, `BASESCAN_API_KEY` |
| `contracts/.gitignore` | `cache/`, `out/`, `broadcast/`, `.env` |
| `contracts/src/ClaimRegistry.sol` | The minimal contract (~30 lines) — see `WINNING_STRATEGY.md` Appendix A3 + audit recommendation. **Use `uint256 claimNumber`** (not string); backend keccak256s `CLM-2026-XXXXXX` strings before calling. |
| `contracts/script/Deploy.s.sol` | `forge script` deploy — `vm.startBroadcast` + constructor with admin address |
| `contracts/script/RegisterAgent.s.sol` | One-time call to ERC-8004 Identity Registry `register(string)` with agent token URI |
| `contracts/test/ClaimRegistry.t.sol` | Minimal smoke test — deploy, attest, assert event + revert on duplicate |
| `contracts/abi/ClaimRegistry.json` | Generated ABI committed for backend import |
| `contracts/README.md` | Quickstart: faucet → deploy → register → export ABI |

### 1.5 Docs

| File | Purpose |
|---|---|
| `WINNING_STRATEGY.md` | **Already created at project root** — the strategy doc |
| `IMPLEMENTATION_PLAN.md` | **This file** |
| `agent-card.json` *(at project root or `contracts/`)* | The ERC-8004 agent card. Pinned via FilecoinPin CLI; CID becomes `tokenURI` |

---

## Section 2 — Files to MODIFY

### 2.1 Backend

| File | Lines | Change |
|---|---|---|
| `backend/src/server.ts` | between L17 and L20 | Insert `await fastify.register(filecoinPlugin)` and `await fastify.register(ethereumPlugin)` after CORS, before route registration. Add imports at top. |
| `backend/src/server.ts` | bottom of route block | Add `await fastify.register(import('./routes/integrity.js'), {prefix: '/api'})`, agent-identity, conversation-init |
| `backend/src/config/environment.ts` | append to `config` export | Add 11 new fields (see Section 4). Hand-rolled `requireEnv()` already in place — no Zod migration needed. |
| `backend/src/services/claims-service.ts` | between L148 and L150 | Insert Filecoin upload + on-chain attestation post-hook (exact code in audit `af10` — `WINNING_STRATEGY.md` Appendix A1+A2 has the building blocks). Extend `fileClaim()` signature at L91-99 to accept `agentId`, `transcriptExcerpt`, `photoCids`. |
| `backend/src/services/claims-service.ts` | L150 return | Add `cid`, `tx_hash` to the response object so ElevenLabs can read it back to caller. |
| `backend/src/routes/webhook-tools.ts` | L65-97 (file_claim) | Widen the `as` cast at L68-73 to include `agent_id`, `transcript_excerpt`, `photo_cids`. Pass them through to `fileClaim()`. |
| `backend/src/routes/webhook-tools.ts` | end of file | Append 3 new tool routes (attach-document, verify-integrity, escalate-to-regulator). |
| `backend/src/routes/webhooks.ts` | top | Add HMAC signature verification for ElevenLabs post-call webhook using `ELEVENLABS_WEBHOOK_SECRET` env var. **Currently unsigned — security gap.** |
| `backend/src/routes/webhooks.ts` | parser | Read `analysis.data_collection_results` and `analysis.evaluation_criteria_results` from ElevenLabs webhook payload, persist into `call_logs.data_collection JSONB` + `call_logs.evaluation JSONB` (new columns — add a 4th migration). |
| `backend/src/types/index.ts` | L31-48 (Claim interface) | Add `filecoin_cid?: string`, `dataset_id?: string`, `piece_cid?: string`, `attestation_tx_hash?: string`, `eas_uid?: string`, `evidence_hash?: string`, `pdp_proof_status?: 'pending'\|'verified'\|'failed'`, `agent_id?: string`, `attested_at?: string`. Mirror exactly what `0002_filecoin_columns.sql` adds. |
| `backend/package.json` | top | Add `"engines": {"node": ">=20"}` (Synapse SDK requires Node 20+). |

### 2.2 Frontend

| File | Lines | Change |
|---|---|---|
| `frontend/src/components/CallWidget.tsx` | full rewrite (~17 → ~80 lines) | **Migrate from ConvAI embed to `@elevenlabs/client` SDK.** Use `Conversation.startSession({agentId, dynamicVariables, onMessage, onConnect, onDisconnect})`. Add Start/End buttons, mic-state pill, paperclip upload `<input type="file" accept="image/*">` that calls `conversation.sendMultimodalMessage({text:'', images:[file]})`. The embed has no multimodal API — this migration is non-negotiable. |
| `frontend/index.html` | L8 | Remove `<script src="https://unpkg.com/@elevenlabs/convai-widget-embed">` (no longer needed). |
| `frontend/src/components/CallWidget.tsx` | L4 | Remove the hardcoded fallback agent ID `agent_7501kpr0wvskf9na4anrw5t9j5a3`. Force `VITE_ELEVENLABS_AGENT_ID` (which has `agent_5401...` in `frontend/.env`). |
| `frontend/src/pages/ClaimsList.tsx` | L100 | Insert "Verified on Filecoin" badge next to `<ClaimStatusBadge>` (audit `a8f1` has full TSX skeleton). |
| `frontend/src/pages/ClaimDetail.tsx` | L54 | Insert `<IntegrityCheckButton claimId={id} />` next to status badge. |
| `frontend/src/pages/ClaimDetail.tsx` | L185 | Insert `<FilecoinPanel claim={claim} />` in sidebar before "Related Calls". |
| `frontend/src/pages/AgentConfig.tsx` | L100 (top of right sidebar) | Insert `<AgentIdentityCard {...agentData} />` as first child. |
| `frontend/src/components/TranscriptViewer.tsx` | L4-8 | Extend `TranscriptEntry` with `image_url?: string`. |
| `frontend/src/components/TranscriptViewer.tsx` | L59 | Render image thumbnail above message bubble for user role with `image_url`. |
| `frontend/src/types/index.ts` | Claim interface | Mirror backend additions. |
| `frontend/src/lib/api.ts` | append | Add `verifyIntegrity(claimId)`, `getAgentIdentity()` API helpers. |
| `frontend/.env` | edit | Reconcile agent ID — pick one of `agent_5401...` / `agent_7501...` and use everywhere. **Recommend `agent_5401kpbf2fjzf3z9jcqsdm7cdx2x`** (matches `frontend/.env` and `test-agent.html`). |

### 2.3 Landing page (`landing/index.html` — 1,389 lines)

Single static HTML file — no React. Keep the newspaper aesthetic. Apply per-line copy changes from audit `a56d`:

| Lines | Change |
|---|---|
| L7-8 | New title + meta description (Filecoin + tamper-evident framing) |
| L233-251 | Nav: drop "For insurers" link, add "Verifiable" + "Receipt" |
| L500-508 | Hero masthead + headline → *"Your insurance claim. On the blockchain. Owned by you."* + new lede with 368%/July 2026 |
| L547-555 | Hero CTA box: "Press the button. Alex calls your insurer." |
| L611-682 | Pain section: add 368% + July 2026 paragraph; closer → *"What if Alex made the call for you — and kept the receipt?"* |
| L920-948 | **Replace** "If you have a policy" with new "How Alex works for you" — 4 numbered steps (incident → call → Filecoin → proof) |
| L988-1026 | **Replace** "If You Run a Claims Line" entirely with "Verifiable by design" spec table (Storage/Filecoin, PDP, ERC-8004, EAS, Audio, Access, Languages) |
| L1067-1228 | Architecture diagram: replace right column boxes with Filecoin/ERC-8004/EAS; update spec table |
| L1339-1374 | Footer: *"Make the call. Keep the receipt."* + powered-by line: `ElevenLabs · Filecoin Onchain Cloud · ERC-8004 · EAS` |

### 2.4 Existing PRD/strategy docs

**Defer.** `WINNING_STRATEGY.md` supersedes `HACKATHON_PRD.md` for strategy. Treat the legacy docs (`HACKATHON_PRD.md`, `CALL_AGENT_PRD.md`, `CALL_AGENT_ARCHITECTURE.md`, `CALL_AGENT_TECHSTACK.md`, `BUILD_PLAN.md`, `DEMO_SCRIPT.md`, `RECORDING_SCRIPT.md`, `README.md`) as historical reference. Total: 63 sections need rewrite — full list in audit `af5e`. Touch only what's necessary for the demo (DEMO_SCRIPT.md and RECORDING_SCRIPT.md must align with the 90-second arc).

**Minimum viable doc updates** (everything else can wait):
- `DEMO_SCRIPT.md` — full rewrite to the 90-second arc from `WINNING_STRATEGY.md` Section 7
- `RECORDING_SCRIPT.md` — add multimodal photo upload + language switch + verify-integrity tamper kill shot
- `README.md` "What We're Building" — drop B2B framing
- `BUILD_PLAN.md` — append Day-by-Day from `WINNING_STRATEGY.md` Section 9

---

## Section 3 — Packages to Install

### Backend

```bash
cd backend
npm install @filoz/synapse-sdk@^0.38.0 viem @ethereum-attestation-service/eas-sdk
```

Add to `package.json`:
```json
"engines": { "node": ">=20" }
```

### Frontend

```bash
cd frontend
npm install viem
# @elevenlabs/client@^1.2.1 is already installed (was orphaned from earlier migration — now load-bearing)
```

### Contracts (one-time)

```bash
# Install Foundry (if not already installed)
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Initialize the contracts directory
mkdir contracts && cd contracts
forge init --no-git
```

---

## Section 4 — Environment Variables

### Step 1: Split monolithic `.env.example`

**Current state:** Only `.env.example` at project root (combined backend+frontend). Frontend Vite vars (`VITE_*`) are entirely missing from any committed example.

**Action:** Create separate `backend/.env.example` and `frontend/.env.example`. Delete or repurpose root `.env.example` as a redirect.

### Step 2: `backend/.env.example` (full body)

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# ElevenLabs
ELEVENLABS_API_KEY=
ELEVENLABS_AGENT_ID=
ELEVENLABS_WEBHOOK_SECRET=  # NEW — for HMAC signature verification on post-call webhook

# Twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Server
PORT=3005
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# --- ClaimVault: Filecoin Calibration ---
# 0x-prefixed test wallet private key (tFIL + USDFC). Never commit real keys.
AGENT_PRIVATE_KEY=
FILECOIN_RPC_URL=https://api.calibration.node.glif.io/rpc/v1
USDFC_INITIAL_DEPOSIT=5000000  # 5 USDFC (6 decimals)

# --- ClaimVault: Base Sepolia ---
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASE_SEPOLIA_PRIVATE_KEY=  # optional; defaults to AGENT_PRIVATE_KEY
ERC_8004_IDENTITY_REGISTRY_ADDRESS=0x8004A818BFB912233c491871b3d84c89A494BD9e
CLAIM_REGISTRY_ADDRESS=  # populated after forge script Deploy
AGENT_ID=  # populated after register(string) on Identity Registry
AGENT_TOKEN_URI=ipfs://<CID>/agent-card.json

# --- EAS (Base Sepolia) ---
# Verify canonical Base Sepolia address at https://docs.attest.org
EAS_REGISTRY_ADDRESS=
EAS_SCHEMA_UID=
```

### Step 3: `frontend/.env.example`

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_API_URL=http://localhost:3005

# ElevenLabs
VITE_ELEVENLABS_AGENT_ID=agent_5401kpbf2fjzf3z9jcqsdm7cdx2x

# --- ClaimVault explorers + identity (display only) ---
VITE_FILFOX_BASE_URL=https://calibration.filfox.info/en
VITE_BASESCAN_BASE_URL=https://sepolia.basescan.org
VITE_AGENT_ID=
VITE_CLAIM_REGISTRY_ADDRESS=
```

### Step 4: Extend `backend/src/config/environment.ts`

Append to the `config` export:

```ts
// Filecoin / Calibration
agentPrivateKey: requireEnv('AGENT_PRIVATE_KEY'),
filecoinRpcUrl: process.env.FILECOIN_RPC_URL || 'https://api.calibration.node.glif.io/rpc/v1',
usdfcInitialDeposit: process.env.USDFC_INITIAL_DEPOSIT || '5000000',

// Base Sepolia / ERC-8004 / EAS
baseSepoliaRpcUrl: process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org',
baseSepoliaPrivateKey: process.env.BASE_SEPOLIA_PRIVATE_KEY || requireEnv('AGENT_PRIVATE_KEY'),
erc8004IdentityRegistryAddress: process.env.ERC_8004_IDENTITY_REGISTRY_ADDRESS
  || '0x8004A818BFB912233c491871b3d84c89A494BD9e',
claimRegistryAddress: requireEnv('CLAIM_REGISTRY_ADDRESS'),
agentId: requireEnv('AGENT_ID'),
agentTokenUri: requireEnv('AGENT_TOKEN_URI'),
easRegistryAddress: requireEnv('EAS_REGISTRY_ADDRESS'),
easSchemaUid: requireEnv('EAS_SCHEMA_UID'),

// ElevenLabs webhook
elevenlabsWebhookSecret: requireEnv('ELEVENLABS_WEBHOOK_SECRET'),
```

---

## Section 5 — Database Migrations

The audit agent already wrote two migration files:

- `P:/Shangai/Loops_hackerhouse/backend/database/0002_filecoin_columns.sql` — ALTER TABLE on `claims` adding 9 columns (filecoin_cid, piece_cid, dataset_id, attestation_tx_hash, eas_uid, evidence_hash, pdp_proof_status, agent_id, attested_at)
- `P:/Shangai/Loops_hackerhouse/backend/database/0003_filecoin_tables.sql` — three new tables (`agent_registrations`, `filecoin_uploads`, `evidence_bundles`)

**Action:**
1. Open both files; review columns + types match `WINNING_STRATEGY.md` Section 3 ("What Goes Where")
2. Run them in Supabase SQL Editor in order
3. Add a third migration `0004_call_log_analysis.sql` for `call_logs.data_collection JSONB` + `call_logs.evaluation JSONB` (for ElevenLabs structured post-call data)

---

## Section 6 — Smart Contract Bootstrap (Foundry)

### Step 1: Install + scaffold

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup

cd P:/Shangai/Loops_hackerhouse
mkdir contracts && cd contracts
forge init --no-git --no-commit
```

### Step 2: Author `src/ClaimRegistry.sol`

Use the source from `WINNING_STRATEGY.md` Appendix A3 — adjusted for `uint256 claimNumber`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ClaimRegistry {
    event ClaimAttested(
        uint256 indexed claimNumber,
        string  cid,
        uint256 indexed agentId,
        uint256 timestamp,
        address indexed attester
    );

    address public immutable admin;
    mapping(uint256 => uint256) public attestedAt;

    error NotAdmin();
    error AlreadyAttested();

    constructor(address _admin) { admin = _admin == address(0) ? msg.sender : _admin; }

    function attestClaim(uint256 claimNumber, string calldata cid, uint256 agentId) external {
        if (msg.sender != admin) revert NotAdmin();
        if (attestedAt[claimNumber] != 0) revert AlreadyAttested();
        attestedAt[claimNumber] = block.timestamp;
        emit ClaimAttested(claimNumber, cid, agentId, block.timestamp, msg.sender);
    }
}
```

**Backend conversion:** in `services/ethereum-service.ts`, convert `"CLM-2026-000456"` to `uint256` via:
```ts
import { keccak256, toBytes } from 'viem';
const claimNumberHash = BigInt(keccak256(toBytes(claim.claim_number)));
```

### Step 3: Fund + deploy

```bash
# Get Base Sepolia ETH
# https://www.alchemy.com/faucets/base-sepolia or https://portal.cdp.coinbase.com/products/faucet

# Get tFIL on Calibration (same wallet)
# https://faucet.calibnet.chainsafe-fil.io

# Get USDFC on Calibration (same wallet)
# https://forest-explorer.chainsafe.dev/faucet/calibnet_usdfc

cd contracts
forge script script/Deploy.s.sol:Deploy \
  --rpc-url base_sepolia --broadcast --verify -vvvv
# → prints CLAIM_REGISTRY_ADDRESS — copy to backend/.env
```

### Step 4: Pin agent card to Filecoin + register on ERC-8004

```bash
# Author agent-card.json (from WINNING_STRATEGY.md Appendix A4)
npm install -g filecoin-pin
filecoin-pin payments setup --auto
filecoin-pin add --auto-fund agent-card.json
# → returns ROOT_CID

# Set env: AGENT_TOKEN_URI=ipfs://<ROOT_CID>/agent-card.json

cast send 0x8004A818BFB912233c491871b3d84c89A494BD9e \
  "register(string)(uint256)" "$AGENT_TOKEN_URI" \
  --rpc-url https://sepolia.base.org --private-key $PK --json
# → parse logs for ERC-721 Transfer event topic[3] = AGENT_ID
```

### Step 5: Export ABI

```bash
cd contracts
forge build
jq '.abi' out/ClaimRegistry.sol/ClaimRegistry.json > abi/ClaimRegistry.json
cp abi/ClaimRegistry.json ../backend/src/abis/ClaimRegistry.json
```

### Step 6: Smoke test

```bash
cast send $CLAIM_REGISTRY_ADDRESS \
  "attestClaim(uint256,string,uint256)" 42 "bafybeih..." 7 \
  --rpc-url base_sepolia --private-key $PK
# Then read the event in Basescan
```

---

## Section 7 — ElevenLabs Cloud Config Changes (no code deploy)

All in elevenlabs.io dashboard for the ClaimsBot agent. Order matters — do top to bottom.

| # | Path in dashboard | Change | Backend wire-up |
|---|---|---|---|
| 1 | Agent → Voice tab | Replace voice with **Eleven v3** Rachel Conversational. Append to system prompt: *"Use [concerned] for empathy, [reassuring] for next steps, [serious] for compliance language, [sigh] for bad news transitions."* | None |
| 2 | Agent → System Prompt | **Reconcile agent name** — system prompt says "Alex", demo+recording scripts say "Ansh". Pick "Alex" everywhere. Update prompt to consumer-advocate framing (see `WINNING_STRATEGY.md`). | Update DEMO_SCRIPT.md, RECORDING_SCRIPT.md, landing/index.html |
| 3 | Agent → Conversation Config | Toggle **`file_input` ON** (multimodal photo upload) | `POST /api/tools/attach-document` route (Section 1.2) |
| 4 | Agent → Tools → System Tools | Toggle ON: `language_detection`, `transfer_to_agent`, `end_call` (already on) | Decide whether `transfer_to_agent` replaces `escalate_to_human` webhook — recommend keep both (system tool for live transfer, webhook for DB audit row) |
| 5 | Agent → Workflow tab | Switch to graph mode. Nodes: `Intake → Triage (LLM-condition) → {Auto-claim \| Fraud-check subagent \| Human-needed (transfer_to_agent)}` | Optional: `POST /api/tools/fraud-signals` for the fraud-check subagent |
| 6 | Agent → System tab | Add Dynamic Variables: `customer_name`, `policy_number`, `claim_history`. Reference in System Prompt + First Message. | `GET /api/elevenlabs/conversation-init` (Section 1.1). Configure URL in Agent → Security → Fetch dynamic variables |
| 7 | Agent → Webhooks | URL: `https://<railway>/api/webhooks/elevenlabs/conversation-ended`. **Add HMAC signature secret** → copy to `ELEVENLABS_WEBHOOK_SECRET` env. Configure Data Collection fields (claim_type, severity, fraud_signals, customer_sentiment) + Evaluation Criteria (collected_policy_number, was_empathetic, escalation_triggered) | Add HMAC verify middleware to `routes/webhooks.ts`. Add `data_collection JSONB`, `evaluation JSONB` columns to `call_logs` (migration 0004) |
| 8 | Agent → Tool webhooks | **Swap ngrok URLs to Railway URLs** — currently still pointing at `dyslexic-coeditor-marital.ngrok-free.dev` per the README's documented state | None (cloud config only) |

---

## Section 8 — Security Flags Surfaced by Audit

Address these in parallel — they aren't part of the pivot but the audits found them:

1. **Real Supabase JWTs committed to `backend/.env`** in the working tree. Rotate keys, move to `.env` (gitignored), add to git history scrub if not yet pushed. Confirm `backend/.env` is in `.gitignore`.
2. **No HMAC verification on existing post-call webhook** (`routes/webhooks.ts`). Required per Section 7 #7 above.
3. **Agent ID inconsistency**: `frontend/.env` uses `agent_5401kpbf2fjzf3z9jcqsdm7cdx2x`, `CallWidget.tsx:4` hardcoded fallback uses `agent_7501kpr0wvskf9na4anrw5t9j5a3`. Pick one (recommend `agent_5401...`), purge the other from code + docs.

---

## Section 9 — Execution Order (13 days)

Building on `WINNING_STRATEGY.md` Section 9 with concrete file references from this plan:

### Days 1-2 — Filecoin + Smart Contract Foundation (~6h, 1 dev)

| Step | Action | Refs |
|---|---|---|
| 1 | Install Foundry; init `contracts/` directory | §6 step 1 |
| 2 | Get tFIL + USDFC from Calibration faucets; get Base Sepolia ETH | §6 step 3 |
| 3 | Author `agent-card.json`; `filecoin-pin add` → capture root CID | §6 step 4 |
| 4 | Register agent on ERC-8004 via `cast send` → capture `AGENT_ID` | §6 step 4 |
| 5 | Author `ClaimRegistry.sol`; `forge script Deploy` → capture address | §6 steps 2-3 |
| 6 | Export ABI to `backend/src/abis/ClaimRegistry.json` | §6 step 5 |
| 7 | Add 11 new env vars to `backend/.env` and update `environment.ts` | §4 |

### Days 3-4 — Backend Integration (~6h)

| Step | Action | Refs |
|---|---|---|
| 8 | `npm install @filoz/synapse-sdk viem @ethereum-attestation-service/eas-sdk` | §3 |
| 9 | Create `plugins/filecoin.ts` and `plugins/ethereum.ts`; register in `server.ts:18-19` | §1.1, §2.1 |
| 10 | Create `services/attestation-service.ts` (foundation) | §1.1 |
| 11 | Create `services/filecoin-service.ts` and `services/ethereum-service.ts` | §1.1 |
| 12 | Apply migrations `0002_filecoin_columns.sql` + `0003_filecoin_tables.sql` in Supabase SQL Editor | §5 |
| 13 | Inject post-hook in `claims-service.ts:148-150`; widen `fileClaim()` signature | §2.1 |
| 14 | Extend `Claim` type at `types/index.ts:31-48` | §2.1 |
| 15 | Add 3 new tool routes (attach-document, verify-integrity, escalate-to-regulator) to `webhook-tools.ts` | §1.2 |
| 16 | Create `routes/integrity.ts` (the demo kill-shot endpoint) | §1.1 |
| 17 | Create `routes/agent-identity.ts` and `routes/conversation-init.ts` | §1.1 |
| 18 | Add HMAC verify middleware to `routes/webhooks.ts`; persist Data Collection fields | §2.1, §7 #7 |

### Days 5-6 — ElevenLabs Cloud Config + CallWidget Migration (~9h)

| Step | Action | Refs |
|---|---|---|
| 19 | Switch agent voice to v3; add audio-tag delivery rules to system prompt | §7 #1-2 |
| 20 | Reconcile agent name to "Alex" across all docs + cloud config | §7 #2 |
| 21 | Enable `file_input` multimodal | §7 #3 |
| 22 | Toggle system tools: `language_detection`, `transfer_to_agent` | §7 #4 |
| 23 | Convert system prompt to Agent Workflow graph (Intake → Triage → routes) | §7 #5 |
| 24 | Add Dynamic Variables; configure conversation-init URL | §7 #6 |
| 25 | Configure post-call webhook with HMAC secret + Data Collection | §7 #7 |
| 26 | **Rewrite `frontend/src/components/CallWidget.tsx`** — migrate from ConvAI embed to `@elevenlabs/client` SDK with multimodal support | §2.2 |
| 27 | Remove `<script>` tag for ConvAI embed in `frontend/index.html:8` | §2.2 |
| 28 | Swap ngrok URLs in ElevenLabs tool webhook config to Railway URLs | §7 #8 |

### Days 7-8 — Frontend (~5h)

| Step | Action | Refs |
|---|---|---|
| 29 | Add `verifyIntegrity()` + `getAgentIdentity()` helpers to `lib/api.ts` | §2.2 |
| 30 | Create `components/IntegrityCheckButton.tsx` (the demo kill-shot button) | §1.3 |
| 31 | Create `components/FilecoinPanel.tsx` and `components/AgentIdentityCard.tsx` | §1.3 |
| 32 | Insert "Verified on Filecoin" badge in `pages/ClaimsList.tsx:100` | §2.2 |
| 33 | Insert IntegrityCheckButton + FilecoinPanel in `pages/ClaimDetail.tsx` (L54, L185) | §2.2 |
| 34 | Insert AgentIdentityCard in `pages/AgentConfig.tsx:100` | §2.2 |
| 35 | Extend `TranscriptViewer.tsx` to render image thumbnails | §2.2 |

### Day 9 — Demo Polish (~4h)

| Step | Action | Refs |
|---|---|---|
| 36 | Update `landing/index.html` per Section 2.3 line-by-line | §2.3 |
| 37 | Rewrite `DEMO_SCRIPT.md` to the 90-second arc | `WINNING_STRATEGY.md` §7 |
| 38 | Update `RECORDING_SCRIPT.md` for multimodal + language switch + tamper kill shot | `WINNING_STRATEGY.md` §7 |
| 39 | Pre-pin demo claim CID night before (Calibration retention is ~1 week) | `WINNING_STRATEGY.md` Risk Register |
| 40 | Record 60s fallback video | `WINNING_STRATEGY.md` Risk Register |
| 41 | Rehearse 90s pitch 15+ times with stopwatch | `WINNING_STRATEGY.md` §8 |

### Days 10-13 — Buffer

Sponsor mingling, last-minute polish, video edits, organizer Q&A, address open questions.

---

## Section 10 — Open Questions (Block on Organizer Answers)

From `WINNING_STRATEGY.md` Section 11 — these gate decisions:

1. Verbatim text of the 4 challenges (PDF or canonical link)
2. Per-sponsor bounty amounts (Filecoin, ElevenLabs)
3. Exact judging rubric weights
4. Submission deliverables checklist (pitch length, demo video required, GitHub public, deployed URL)
5. Confirm ElevenLabs is a Shanghai sponsor + judges' names
6. Confirm dual-bounty submissions allowed in writing

If #5 returns negative — pivot back to single-bounty (Filecoin) and de-emphasize ElevenLabs in the pitch (still keep the v3 + multimodal wow moments).

---

## Verification Checklist (pre-demo)

- [ ] `forge test` passes for ClaimRegistry
- [ ] `cast call` returns expected `attestedAt` for a known claim
- [ ] `synapse.storage.upload(bytes)` returns a CID; `synapse.storage.download({pieceCid})` returns the same bytes
- [ ] Verify-integrity endpoint returns `{match: true}` for an untampered claim, `{match: false}` after a Postgres edit
- [ ] ElevenLabs preview: caller in Mandarin → agent responds in Mandarin → caller uploads photo → agent references the photo → file_claim → CID lands → tx_hash on Basescan
- [ ] Dashboard shows "Verified on Filecoin" badge + Filfox link + tx_hash + Basescan link
- [ ] AgentIdentityCard shows real ERC-8004 agent ID, real card CID
- [ ] Fallback video records cleanly under 60s
- [ ] 90-second pitch lands under 90 seconds three times in a row

---

> **End of IMPLEMENTATION_PLAN.md.** Cross-reference with `WINNING_STRATEGY.md` (the why) when in doubt.
