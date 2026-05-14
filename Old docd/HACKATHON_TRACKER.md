# 🏁 HACKATHON_TRACKER.md — ClaimVault Master Implementation

> **Goal:** Build the complete "Consumer Claims Advocate" product.
> **Parallelization:** Track A, Track B, and Track C can be executed simultaneously by different agents/devs.

---

## 🟢 PHASE 1: Web3 Foundation & Identity (Track A)
*Can be done immediately. Does not block anything but Phase 3.*

- [ ] Install Foundry and generate a testnet wallet (`AGENT_PRIVATE_KEY`).
- [ ] Initialize `contracts/` directory inside root. Add `contracts/src/ClaimRegistry.sol`.
- [ ] Deploy `ClaimRegistry.sol` to Base Sepolia using `forge script`. 
  - *Capture `CLAIM_REGISTRY_ADDRESS`.*
- [ ] Export ABI to `backend/src/abis/ClaimRegistry.json`.
- [ ] Pin `agent-card.json` using `filecoin-pin` CLI to acquire the root CID.
- [ ] Register the agent on the Base Sepolia ERC-8004 Identity Registry to capture the `AGENT_ID`.

**🔍 Review Checkpoint 1:**
- [ ] Verify ClaimRegistry deployment on Base Sepolia block explorer.
- [ ] Verify the ERC-8004 Agent ID via `cast call` on Identity Registry.

---

## 🟡 PHASE 2: Database & Base Backend (Track B)
*Can be done in parallel with Phase 1.*

- [ ] Execute `0002_filecoin_columns.sql` in Supabase SQL editor.
- [ ] Execute `0003_filecoin_tables.sql` in Supabase SQL editor.
- [ ] Add `0004_call_log_analysis.sql` for JSONB data collection/evaluation parsing.
- [ ] Install packages in backend: `npm i @filoz/synapse-sdk@^0.38.0 viem @ethereum-attestation-service/eas-sdk`.
- [ ] Split monolithic `.env.example` into `backend/.env.example` and `frontend/.env.example`.
- [ ] Set up `backend/.env` with `BASE_SEPOLIA_RPC_URL`, `FILECOIN_RPC_URL`, etc.
- [ ] Update `backend/src/config/environment.ts` and `backend/src/types/index.ts` to support the new integrations.

**🔍 Review Checkpoint 2:**
- [ ] Database schema natively reflects Filecoin CID, EAS UID, and Attestation Hash columns.
- [ ] Fastify server spins up locally on port 3005 without module import errors.

---

## 🟠 PHASE 3: Decentrailised Services logic (Depends on Phase 1 & 2)

- [ ] Create `plugins/filecoin.ts` & `plugins/ethereum.ts` to boot Viem clients and Synapse SDK cleanly. Register them in `server.ts`.
- [ ] Create `services/attestation-service.ts` for pure evidence bundle generation and hashing.
- [ ] Create `services/filecoin-service.ts` to wrap Synapse SDK for `uploadClaimBundle()` and `downloadBundle()`.
- [ ] Create `services/ethereum-service.ts` for `attestClaim()` on ClaimRegistry. 
- [ ] Create `services/eas-service.ts` for issuing the DeFi attestation data.

**🔍 Review Checkpoint 3:**
- [ ] Invoke `uploadClaimBundle()` in a standalone test script and retrieve a valid `pieceCid`.
- [ ] Invoke `attestClaim()` in a test script and confirm receipt on Basescan.

---

## 🔵 PHASE 4: Webhooks & Endpoints (Depends on Phase 3)
*This is the wiring connecting ElevenLabs capabilities to the Web3 execution.*

- [ ] Update `services/claims-service.ts` post-hook for `fileClaim()` to initiate the services built in Phase 3.
- [ ] Add HMAC signature validation to `backend/src/routes/webhooks.ts`. (Fetch secret from ElevenLabs dashboard).
- [ ] Create backend tool route `POST /api/tools/attach-document` to process Multimodal inputs.
- [ ] Create backend tool route `POST /api/tools/escalate-to-regulator` to emit an EAS complaint attestation.
- [ ] Create route `POST /api/claims/:id/verify-integrity` (The Demo "Kill-Shot" endpoint).
- [ ] Create routes `/api/agent-identity` and `/api/elevenlabs/conversation-init`.

**🔍 Review Checkpoint 4:**
- [ ] Send Postman POST to `/api/claims/:id/verify-integrity` on dummy data and ensure you get `{match: boolean}` payload.

---

## 🟣 PHASE 5: ElevenLabs Setup (Track C)
*Can be executed mostly in parallel at any time using the UI dashboard.*

- [ ] Cloud config: Change agent voice to **Eleven v3 Expressive Mode** and configure emotion prompts (`[concerned]`, `[reassuring]`).
- [ ] Cloud config: Enable `file_input` on Conversation Config for photos.
- [ ] Cloud config: Add dynamic variables (`customer_name`, `policy_number`).
- [ ] Cloud config: Construct Agent Workflow Graph (Intake → Triage).
- [ ] Swap all static ngrok webhook URLs pointing to Railway / definitive staging URL.

**🔍 Review Checkpoint 5:**
- [ ] Trigger an ElevenLabs web playground preview and confirm it requests dynamic variables + supports file inputs visually.

---

## 🔴 PHASE 6: Frontend Demo Integration (Depends on Phase 4)

- [ ] Migrate `frontend/src/components/CallWidget.tsx` to `@elevenlabs/client` completely so we can enable native `sendMultimodalMessage()`. Enable photo attachments via UI.
- [ ] Add `<IntegrityCheckButton/>` component in `ClaimDetail.tsx`. Wire up the Green/Red fail logic.
- [ ] Embed `<FilecoinPanel/>` next to claim records displaying raw `cid` and `attestation_tx_hash`.
- [ ] Build `<AgentIdentityCard/>` on AgentConfig page reflecting live `AGENT_ID`.
- [ ] Execute line-by-line copy changes to `landing/index.html` to reflect the "Consumer Receipts / Own the truth" framework.

**🔍 Review Checkpoint 6 (Demo Run-Through):**
- [ ] **Integration Test:** Make a call via frontend app → State incident in Mandarin → upload photo → Agent acknowledges photo and files claim → Go to Dashboard → Observe "Verified on Filecoin" badge.
- [ ] **Integrity Kill-Shot Test:** Mutate Postgres `claimed_amount` directly → Click "Verify Integrity" → Button MUST turn red. 