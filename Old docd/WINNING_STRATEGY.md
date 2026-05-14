# WINNING STRATEGY — Loops Hacker House Shanghai 2026

> **Single source of truth.** Compiled from 10 parallel research agents covering Filecoin Onchain Cloud, ERC-8004 spec, Synapse SDK, ElevenLabs feature surface, DeFi insurance landscape, Loops/Germina Labs hackathon context, and risk/differentiation strategy.
>
> Last updated 2026-05-08.

---

## TABLE OF CONTENTS

0. TL;DR — Ship This
1. The Strategic Pivot
2. Hackathon Context — Verified vs Unverified
3. The Architecture — "ClaimVault + ERC-8004"
4. Filecoin Tech Stack — Concrete
5. ElevenLabs Tech Stack — The 4 Must-Have Additions
6. EAS Attestation — The DeFi Bridge
7. The 90-Second Demo Arc
8. Risk Register
9. Build Plan — Day by Day
10. What We're Skipping
11. Open Questions for Organizers
12. Appendix A — Sample Code Snippets
13. Appendix B — Source Citations

---

## 0. TL;DR — Ship This

**Pivot:** Drop "B2C+B2B insurance bot." Become **Consumer Claims Advocate** — an AI agent that calls insurers ON BEHALF of the policyholder, with every recording, transcript, and photo pinned to Filecoin so **the user owns the receipt, not the insurer.**

**Differentiator:** Allianz/Ping An cannot ship this. It's adversarial to their business. That's the moat.

**Tech stack additions:**
- ElevenLabs Conversational AI (existing) + 4 new mechanics: Eleven v3 expressive audio tags, multimodal photo upload mid-call, mid-call language switch (Mandarin↔English), agent workflow graph
- Filecoin Onchain Cloud via Synapse SDK — Warm Storage + Filecoin Pin + USDFC payments
- ERC-8004 — Alex registered as a Trustless Agent NFT on Base Sepolia, agent card pinned on Filecoin
- Custom `ClaimRegistry.sol` on Base Sepolia — emits `ClaimAttested(claimId, cid, agentId)` per filed claim
- EAS attestation per claim (the DeFi narrative bridge)

**Killer demo moment:** Demo-er edits Postgres row to inflate claim amount → clicks "Verify integrity" → Filecoin re-fetch fails loudly in red on stage. *"Tampering is impossible. The user owns the truth."*

**Effort:** ~22 hours focused work, 13-day Shanghai window gives slack.

---

## 1. The Strategic Pivot

### From "B2B+B2C Insurance Bot" → "Consumer Claims Advocate"

The current PRD (`HACKATHON_PRD.md`) positions us as **two products at once**: B2C consumer help + B2B call-center replacement. **Two-sided pitches kill hackathon demos.** Pick one. The B2C consumer-advocate angle is more novel, pairs naturally with Filecoin (user-owned receipts), and has a defensible moat that incumbents can't replicate.

**What this means concretely:**

- The agent is positioned as **the policyholder's agent**, not the insurer's
- It can be invoked by a consumer (via WebRTC widget or by texting a number) to call an insurer on their behalf, hold while the insurer's hold music plays, transcribe and record everything
- All artifacts are stored on Filecoin with a CID the user owns — they get a "claim receipt" that cannot be edited or memory-holed by the insurer
- The compliance angle is brutal: China's July 15, 2026 Anthropomorphic AI Interim Measures **mandate complaint/appeal mechanisms** for AI services in finance. We aren't "compliant with a rule" — we are **the compliance layer**

### The Anti-Patterns We're Dropping

| Anti-pattern | Score | Replace with |
|---|---|---|
| "$840B China insurance TAM" | 2/5 | "12,000 angry calls every day in China — complaints up 368% YoY" (4/5) |
| "Replaces $27K-$38K agents" | 3/5 | "Augments overflow + 24/7 + after-hours" (less aging risk) |
| "Compliant with July 2026 anthropomorphic AI rule" | 4.5/5 | KEEP — this is our sharpest weapon |
| "B2C consumer + B2B replacement" two-sided pitch | 1.5/5 | **Pure B2C consumer advocate** |
| "We store mp3s on Filecoin" | 2/5 | **"Tamper-evident claim records the user owns"** |

### The Moat Sentence (memorize)

> "Allianz and Ping An will never build the consumer-side advocate. We're not replacing their call center — we're the agent that **calls** their call center on behalf of the policyholder, records the conversation to Filecoin with a CID the user owns, and escalates to the regulator's complaint portal automatically. An incumbent literally cannot ship this — it's adversarial to their business."

---

## 2. Hackathon Context

### Confirmed (from open web)

- **Run by Germina Labs** — NOT GAIB (that hypothesis was wrong)
- **Shanghai dates:** April 10–23, 2026 (13-day window — longer than past 5-day editions)
- **Past sponsors:** Filecoin/Protocol Labs (every prior edition), Near Foundation, OpenServ AI, Randamu, Golem DB, AKINDO
- **Filecoin sponsorship: very likely confirmed** — Filecoin Onchain Cloud product launched March 26, 2026
- **Past prize pools:** Delhi $10k+, Buenos Aires $8k+ (per-sponsor breakdowns not public)
- **Loops emphasis:** *"projects that live beyond the week"* — Impact + post-hackathon viability weighted heavily

### Unverified — Confirm with Organizers

1. Verbatim text of the 4 challenges (PDF or canonical link)
2. Per-sponsor bounty amounts (Filecoin, ElevenLabs)
3. Exact judging rubric weights
4. Submission deliverables checklist (pitch length, demo video required, GitHub public, deployed URL)
5. ElevenLabs as Shanghai sponsor (treated as confirmed in our PRD; not publicly indexed)
6. Dual-bounty stacking allowed (very likely yes; confirm in writing)

### Saturation Reality Check

- Voice agents = single most-built category in 2026 hackathons
- Expect **4-8 similar voice-agent teams** at Loops Shanghai
- "Insurance/customer-service voice bot" is a **Top-3 cliche**
- ElevenLabs already sells "Insurance AI Answering Service" as a first-party product — judges have seen the generic build
- "Two Somethin'" already won 2nd place at NYC ElevenLabs hackathon doing the inverse (consumer-side hold-killer)

**Implication:** "Plain AI insurance call agent + Filecoin tacked on" loses. The mechanic must be the differentiator. The Consumer Advocate framing + verifiable user-owned receipts + multimodal photo upload + mid-call language switch is the differentiator.

### Dual-Bounty Stacking

Web3 hackathons typically allow stacking. Filecoin's stance encourages multi-service integration. **Make Filecoin load-bearing** for the voice agent (not bolted on) — judges in agent-focused tracks reward end-to-end integration depth over breadth.

---

## 3. The Architecture — "ClaimVault + ERC-8004"

This single architecture hits **both Filecoin Challenge 01 (Agent Storage SDK)** and **Challenge 02 (Onchain Agent Registry)** simultaneously.

### Data Flow Per Call

```
Caller (browser/phone)
  ↓ ElevenLabs Conversational AI (v3 + multimodal + workflow)
  ↓
Mid-call: customer uploads damage photo  →  multimodal LLM "sees" it
  ↓
Mid-call: customer switches language → language_detection system tool fires
  ↓
"file_claim" tool webhook → Backend
  Backend:
    1. Insert claim row in Postgres (existing flow)
    2. Bundle evidence: { transcript, audio_url, photo_bytes, signed_attestation, agent_id, timestamp }
    3. Synapse SDK: synapse.storage.upload(bundleBytes) → returns piece CID
    4. Sign + emit ClaimRegistry.attestClaim(claimId, cid, agentId) on Base Sepolia
    5. (Optional) Emit EAS attestation for DeFi insurers to consume as oracle input
    6. Update Postgres claim row with cid, tx_hash, dataset_id
  ↓
Dashboard:
  - "Verified on Filecoin" badge with Filfox link
  - PDP proof status (pending → verified ~24h later)
  - "Verify Integrity" button — re-fetches from Filecoin, recomputes hash
  - If Postgres tampered: integrity check FAILS in red ← THE DEMO MOMENT
```

### What Goes Where

| Layer | Data | How |
|---|---|---|
| **Postgres (existing)** | Operational claim state, customer info, working dataset | Unchanged |
| **Filecoin Calibration** | Per-claim evidence bundle (JSON + audio + photos), agent card JSON | Synapse SDK upload + FilecoinPin |
| **Base Sepolia ERC-8004 Identity Registry** | Alex registered as Trustless Agent NFT, `tokenURI` = `ipfs://<CID>/agent-card.json` | One-time `cast send register(string)` |
| **Base Sepolia (custom contract)** | `ClaimRegistry.sol` emits `ClaimAttested(claimId, cid, agentId, timestamp)` per claim | Per-claim `attestClaim` tx |
| **Base Sepolia EAS** | Per-claim attestation: claimant wallet sig + agent sig + transcript hash + Filecoin CID | EAS SDK `attest()` call |
| **PDP proofs (daily)** | SP cryptographically proves it still holds the bytes | Automatic via FOC; visible in PDP Scan explorer |

### Why This Hits All 5 Judging Criteria

| Criterion | How we score |
|---|---|
| **Innovation** | Nobody's combined Consumer-Advocate framing + ERC-8004 + Filecoin verifiable claim records + multimodal voice. Genuine white space. |
| **Technical Implementation** | Chains 3+ FOC services (Warm Storage + Pay + Pin) + ERC-8004 + custom Solidity + ElevenLabs multimodal + Twilio + EAS. Not a toy. |
| **Impact** | China July 2026 rule mandates this. 368% complaint growth = real demand. |
| **AI×Blockchain Integration** | Filecoin is necessary (insurance evidence has 7-year retention + chain-of-custody requirements; CIDs make tampering provably impossible). Agent identity is on-chain via ERC-8004. Not bolted on. |
| **Presentation** | The 90-second arc (cold-open angry call → moat → live demo → tamper attempt fails) is visceral. |

---

## 4. Filecoin Tech Stack — Concrete

### Packages

```bash
npm install @filoz/synapse-sdk viem
npm install -g filecoin-pin   # CLI for one-time agent card pin
```

Latest `@filoz/synapse-sdk` is 0.38.x. Migrated off ethers — uses `viem`.

### Network Reference

| Resource | Value |
|---|---|
| Calibration RPC (HTTPS) | `https://api.calibration.node.glif.io/rpc/v1` |
| Calibration RPC (WSS) | `wss://wss.calibration.node.glif.io/apigw/lotus/rpc/v1` |
| Calibration chain ID | 314159 |
| Calibration block explorer | https://calibration.filfox.info/en, https://beryx.zondax.ch |
| tFIL faucet | https://faucet.calibnet.chainsafe-fil.io |
| USDFC faucet (Calibration) | https://forest-explorer.chainsafe.dev/faucet/calibnet_usdfc |
| Base Sepolia RPC | https://sepolia.base.org |
| Base Sepolia explorer | https://sepolia.basescan.org |
| Base Sepolia ETH faucet | https://www.alchemy.com/faucets/base-sepolia |
| ERC-8004 Identity Registry (Base Sepolia) | `0x8004A818BFB912233c491871b3d84c89A494BD9e` |
| ERC-8004 Reputation Registry (Base Sepolia) | `0x8004B663056A597Dffe9eCcC1965A193B7388713` |
| PDP Scan (cite in demo) | https://pdp.vxb.ai/mainnet |

### Sample Synapse SDK Init (backend)

```ts
import { Synapse, RPC_URLS } from '@filoz/synapse-sdk';

const synapse = await Synapse.create({
  privateKey: process.env.AGENT_PRIVATE_KEY!,
  rpcURL: RPC_URLS.calibration.websocket,
});

// One-time: deposit USDFC into the storage payment rail
await synapse.payments.deposit({ amount: 5_000_000n, token: 'USDFC' });
await synapse.payments.approveOperator(synapse.warmStorage.address);

// Per-claim upload
const bundleBytes = new TextEncoder().encode(JSON.stringify(claimBundle));
const result = await synapse.storage.upload(bundleBytes);
const pieceCid = result.copies[0].pieceCid;
const dataSetId = result.copies[0].dataSetId;

// PDP proof status (async, ~24h)
const ds = await synapse.warmStorage.getDataSet(dataSetId);
```

### Critical Gotchas

- **PDP proofs take ~24h** to first appear → label as "pending verification" in UI, not a bug
- **Calibration data has ~1 week retention** → don't expect demo uploads to survive past hackathon; pre-pin demo CIDs the night before judging
- **All Synapse SDK amounts are bigint wei** — bare numbers throw
- **Two-copy replication is default** — `result.copies` is an array, not a single object
- **`result.failedAttempts` non-empty ≠ failure** — only `result.complete` matters
- **Filecoin cookbook uses Base Sepolia for the registry**, not Filecoin Calibration EVM. Calibration is *only* the storage payment rail
- **Submission rules:** Filecoin explicitly disallows "just pulled a CID from the IPFS HTTP gateway" — must use Synapse SDK / FilecoinPin directly

### Reference Implementations to Steal From

- **`FilOzone/FilecoinPin-for-ERC8004`** — the blessed quickstart; has `scripts/0-prerequisites.sh` through `scripts/4-query-agent.sh` + sample `agent-card.json`
- **`ChaosChain/trustless-agents-erc-ri`** — canonical contracts (Solidity 0.8.19, audited)
- **`FIL-Builders/foc-storage-mcp`** — MCP server exposing 10 tools over Synapse SDK; direct prior art for "framework-agnostic SDK"
- **`FilOzone/synapse-sdk` AGENTS.md** — load this into agent context: https://raw.githubusercontent.com/FilOzone/synapse-sdk/main/AGENTS.md

---

## 5. ElevenLabs Tech Stack — The 4 Must-Have Additions

You already have: STT/LLM/TTS, KB-RAG, 6 webhook tools, WebRTC widget. To win the bounty add these four:

### Tier S (must have)

| # | Feature | Effort | Wow | Action |
|---|---|---|---|---|
| 1 | **Eleven v3 + Audio Tags** `[concerned]`, `[reassuring]`, `[sigh]`, `[whispers]` | S (~2h) | 5 | Switch agent voice to v3, add delivery guide section to system prompt instructing LLM to emit tags around emotional pivots |
| 2 | **Multimodal photo upload** mid-call (claimant texts damage photo, agent "sees" it) | M (~5h) | 5 | Enable `file_input` on ConversationConfig; use `sendMultimodalMessage` from `@elevenlabs/client`. **THE killer feature for insurance.** |
| 3 | **Agent Workflows graph** + `transfer_to_agent` system tool | M (~4h) | 5 | Replace monolith prompt with: Intake Subagent → Triage LLM-condition → (Auto-claim path \| Fraud-check subagent \| Human-needed path) |
| 4 | **Mid-call language switch** (Mandarin ↔ English via `language_detection` system tool) | S (~2h) | 5 | Built-in system tool. Shanghai venue makes this an obvious win — judges will literally hear it. |

### Tier A (do at least 1)

- **Dynamic variables** + `conversation_initiation_client_data` — pre-load `{{customer_name}}`, `{{policy_number}}`, `{{claim_history}}`. First message becomes "Hi Priya, I see your Comprehensive policy ending 4471 — what happened?"
- **Post-call webhook with structured data extraction** — configure Data Collection fields (claim_type, severity, fraud_signals, customer_sentiment) + Evaluation Criteria. Webhook POSTs full transcript + extracted JSON. Show dashboard populating live as demo call ends.

### What ElevenLabs Leadership Signals

Mati Staniszewski (CEO, $500M ARR May 2026) repeatedly emphasizes: human-level voice (→ v3 + audio tags), AI customer agents (→ our exact use case), voice as core interface (→ phone-number demo). Dec 2025 33-city hackathon winners all built **emotionally-aware, real-time, real-world** agents — not clever chatbots. Our demo must mirror that energy: real photo upload, real empathy from v3 tags, real escalation, real CID landing on chain.

---

## 6. EAS Attestation — The DeFi Bridge

The judging rubric explicitly mentions **"potential impact on the DeFi ecosystem."** Here's the credible bridge:

> **"We are the verifiable claims-intake layer for on-chain insurance."**

Each filed claim emits an **Ethereum Attestation Service (EAS) attestation** with: claimant wallet sig + agent sig + transcript hash + Filecoin CID. Schema is "any DeFi insurer (Nexus Mutual, Etherisc, future RWA insurers) can consume this attestation as an oracle input."

This positions us not as a DeFi protocol ourselves but as the **input layer** for DeFi insurance. It maps directly to the unsolved problem identified in academic literature: indemnity claims (vs parametric) currently have no decentralized intake UX.

### Package

```bash
npm install @ethereum-attestation-service/eas-sdk
```

### Credibility Order of Pitch Hooks (use #1)

1. **"The verifiable claims-intake layer for on-chain insurance"** ← strongest, technically grounded
2. "Onchain proof of claim, off-chain UX — closing DeFi insurance's last mile" ← marketing dressing
3. (Mention but don't lean on:) "AI agents as verifiable services in the GAIB sense" — only if asked

---

## 7. The 90-Second Demo Arc

| Time | Beat | What happens |
|---|---|---|
| 0–10s | **Cold open — pain in a voice** | 5s of an angry policyholder recording. *"This call happened 12,000 times in China yesterday."* |
| 10–25s | **The trap** | "Insurers control the recording, transcript, decision. The policyholder has no receipt. Complaints up 368%." |
| 25–40s | **The shift** | "On July 15, China's Anthropomorphic AI rule requires complaint channels for financial AI. We built the consumer side." |
| 40–70s | **Live demo — ONE crisp interaction** | Caller speaks Mandarin → agent auto-switches → texts damage photo → agent sees it, says with `[sympathetic]` tag "I can see the rear bumper..." → files claim → dashboard shows CID landing → Filfox link opens → PDP proof "pending" badge |
| 70–85s | **The kill shot** | Demo-er edits Postgres row to inflate the claim amount → clicks "Verify integrity" → integrity check **FAILS in red on stage**. *"Tampering is impossible. The user owns the truth."* |
| 85–90s | **Ask** | One sentence on what you want from sponsors. |

**No dashboard tour. No architecture diagram unless asked. Time it. Rehearse 15+ times.**

---

## 8. Risk Register

| Risk | Severity | Mitigation |
|---|---|---|
| Twilio numbers blocked/unreliable in mainland China | **High** | Demo via WebRTC widget on laptop; do NOT bet demo on live PSTN |
| Filecoin Calibration testnet flaky | Med | Pre-pin demo CIDs night before; print CID on backup slide; local IPFS pin as fallback |
| PDP proofs take 24h to first appear | Low | Label "pending verification" in UI; use pre-uploaded asset that already has proofs |
| ElevenLabs latency spike on stage | Med | Cache 3 demo responses as static audio; record 60s flawless run as MP4; cut to video without apologizing if stutter > 8s |
| Webhook timeout cascade | Med | Set Railway timeout to 3s; graceful fallback message |
| Venue WiFi failure | Med | Two devices, two networks (WiFi + mobile hotspot on different carriers) |
| **Flat live demo** (THE #1 reason solid voice projects lose) | **Highest** | Rehearse 90 seconds 15+ times with timer; fallback video queued in second tab. Voice demos punish stutters harder than UI demos because silence is excruciating. |

**Non-negotiable:** record the 60s fallback video.

---

## 9. Build Plan — Day by Day

The 13-day Shanghai window gives slack. Estimated ~22h focused work across the team.

### Days 1-2 — Filecoin Foundation (~6h, one backend dev)

1. Install Synapse SDK; create agent wallet; fund tFIL + USDFC from faucets (1h)
2. Author `agent-card.json` for Alex; pin via FilecoinPin CLI; capture root CID (1h)
3. Register Alex on Base Sepolia ERC-8004 Identity Registry; capture `agentId` (1h)
4. Deploy `ClaimRegistry.sol` on Base Sepolia (2h)
5. Smoke test `synapse.storage.upload(bytes)` and verify in PDP Scan (1h)

### Days 3-4 — Integrate into Call Flow (~6h)

6. Add post-hook to `file_claim` webhook tool: bundle evidence, upload via Synapse, get CID (3h)
7. Anchor CID on-chain via `attestClaim()` call to ClaimRegistry (1h)
8. Persist `cid`, `tx_hash`, `dataset_id` on the `claims` table — write migration (1h)
9. Optional: emit EAS attestation alongside (1h)

### Days 5-6 — ElevenLabs Killer Features (~9h, voice/AI dev)

10. Switch agent voice to **v3** + add audio-tag delivery guide to system prompt (1h)
11. Add **multimodal photo upload** — biggest single demo lift (4h)
12. Enable **language_detection** + **transfer_to_agent** system tools (1h)
13. Convert system prompt to **Agent Workflow** graph (Intake → Triage → routes) (2h)
14. Wire post-call webhook to populate dashboard with structured claim JSON live (1h)

### Days 7-8 — Frontend (~5h, frontend dev)

15. "Verified on Filecoin" badge on each claim row + Filfox link (1h)
16. **"Verify Integrity" button** that re-fetches from Filecoin, recomputes hash, shows pass/fail with green/red animation — *the demo kill shot* (3h)
17. Dashboard panel showing live ERC-8004 agent registration card (1h)

### Day 9 — Demo Polish (~4h, whole team)

18. Record 60s fallback video (1h)
19. Write 90s pitch script (0.5h)
20. Rehearse 15+ times with stopwatch (2h)
21. Pre-pin demo CIDs and print on backup slide (0.5h)

### Days 10-13 — Buffer

Sponsor mingling, last-minute polish, video edits, Q&A prep.

---

## 10. What We're Skipping

The research surfaced tempting rabbit holes — skip these:

- **Candidate B (Agent Reputation Network)** — weak demo without a counterparty insurer
- **Candidate C (Agent Memory Layer)** — PII-on-public-storage is a legal landmine + latency-in-hot-path is risky
- **GibberLink-style acoustic agent-to-agent handoff** — viral but a 6h tangent that doesn't tie to Filecoin
- **Voice cloning, voice library, MCP server, custom LLM** — add complexity without serving the core narrative
- **B2B/B2C dual-pitch** — kill it, pick consumer advocate
- **TAM theater slides** — drop the $840B opener
- **Twilio PSTN demo** — too risky in China; WebRTC widget instead
- **Voice Design / Sound Effects / Studio** — off-mission for a claims bot

---

## 11. Open Questions for Organizers

Send Germina Labs / your organizer Slack:

1. Verbatim text of the 4 challenges (PDF or canonical link)
2. Per-sponsor bounty amounts (Filecoin, ElevenLabs)
3. Exact judging rubric weights
4. Submission deliverables checklist (pitch length, demo video required, GitHub public, deployed URL)
5. Confirm ElevenLabs is a Shanghai sponsor + their judges' names
6. Confirm dual-bounty submissions are allowed in writing

---

## 12. Appendix A — Sample Code Snippets

### A1. Backend `services/filecoin-service.ts` (skeleton)

```ts
import { Synapse, RPC_URLS } from '@filoz/synapse-sdk';

let synapseClient: Awaited<ReturnType<typeof Synapse.create>>;

export async function getSynapse() {
  if (!synapseClient) {
    synapseClient = await Synapse.create({
      privateKey: process.env.AGENT_PRIVATE_KEY!,
      rpcURL: RPC_URLS.calibration.websocket,
    });
  }
  return synapseClient;
}

export async function uploadClaimBundle(bundle: object): Promise<{
  pieceCid: string;
  dataSetId: string;
}> {
  const synapse = await getSynapse();
  const bytes = new TextEncoder().encode(JSON.stringify(bundle));
  const result = await synapse.storage.upload(bytes);
  if (!result.complete) {
    throw new Error('Upload not complete: ' + JSON.stringify(result.failedAttempts));
  }
  return {
    pieceCid: result.copies[0].pieceCid,
    dataSetId: result.copies[0].dataSetId,
  };
}
```

### A2. Backend `services/ethereum-service.ts` (skeleton)

```ts
import { createWalletClient, createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import claimRegistryAbi from './abis/ClaimRegistry.json';

const account = privateKeyToAccount(process.env.BASE_SEPOLIA_PRIVATE_KEY! as `0x${string}`);

export const walletClient = createWalletClient({
  account,
  chain: baseSepolia,
  transport: http(),
});

export const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

export async function attestClaim(
  claimNumber: string,
  cid: string,
  agentId: bigint
): Promise<`0x${string}`> {
  return walletClient.writeContract({
    address: process.env.CLAIM_REGISTRY_ADDRESS as `0x${string}`,
    abi: claimRegistryAbi,
    functionName: 'attestClaim',
    args: [claimNumber, cid, agentId, BigInt(Math.floor(Date.now() / 1000))],
  });
}
```

### A3. `ClaimRegistry.sol` (minimal)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ClaimRegistry {
    event ClaimAttested(
        string indexed claimNumber,
        string cid,
        uint256 indexed agentId,
        uint256 timestamp,
        address indexed attester
    );

    mapping(string => bool) public attested;

    function attestClaim(
        string calldata claimNumber,
        string calldata cid,
        uint256 agentId,
        uint256 timestamp
    ) external {
        require(!attested[claimNumber], "Already attested");
        attested[claimNumber] = true;
        emit ClaimAttested(claimNumber, cid, agentId, timestamp, msg.sender);
    }
}
```

### A4. Sample `agent-card.json` for Alex

```json
{
  "type": "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
  "name": "Alex — Consumer Claims Advocate",
  "description": "AI voice agent that calls insurers on behalf of policyholders, records the conversation to Filecoin, and emits tamper-evident attestations of every claim.",
  "image": "ipfs://<CID>/alex-avatar.png",
  "endpoints": [
    {
      "name": "MCP",
      "endpoint": "https://api.claimvault.xyz/mcp/",
      "version": "1.0.0",
      "capabilities": {
        "tools": [
          { "name": "file_claim", "description": "File a new insurance claim with Filecoin-anchored evidence" },
          { "name": "lookup_claim", "description": "Look up an existing claim by number" },
          { "name": "verify_integrity", "description": "Verify a claim's evidence has not been tampered" }
        ]
      }
    }
  ],
  "x402Support": false,
  "active": true,
  "registrations": [],
  "supportedTrust": ["reputation", "crypto-economic"]
}
```

### A5. Frontend "Verify Integrity" component (sketch)

```tsx
async function verifyIntegrity(claim: Claim) {
  setStatus('verifying');
  const synapse = await Synapse.create({ provider });
  const bytes = await synapse.storage.download({ pieceCid: claim.filecoin_cid });
  const filecoinBundle = JSON.parse(new TextDecoder().decode(bytes));
  const postgresHash = computeBundleHash({
    transcript: claim.transcript,
    incident_description: claim.incident_description,
    claimed_amount: claim.claimed_amount,
  });
  const filecoinHash = computeBundleHash(filecoinBundle);
  setStatus(postgresHash === filecoinHash ? 'verified' : 'tampered');
}
```

---

## 13. Appendix B — Source Citations

### Filecoin
- [Filecoin Onchain Cloud](https://filecoin.cloud) | [Docs](https://docs.filecoin.cloud/)
- [Synapse SDK GitHub](https://github.com/FilOzone/synapse-sdk) | [npm](https://www.npmjs.com/package/@filoz/synapse-sdk)
- [FilecoinPin docs](https://docs.filecoin.io/builder-cookbook/filecoin-pin)
- [FilecoinPin-for-ERC8004 quickstart](https://github.com/FilOzone/FilecoinPin-for-ERC8004)
- [Calibration tFIL faucet](https://faucet.calibnet.chainsafe-fil.io)
- [Calibration USDFC faucet](https://forest-explorer.chainsafe.dev/faucet/calibnet_usdfc)
- [PDP overview](https://fil.org/blog/introducing-proof-of-data-possession-pdp-verifiable-hot-storage-on-filecoin)
- [PDP Scan explorer](https://pdp.vxb.ai/mainnet)
- [Agents RFS](https://filecoin.cloud/agents)
- [FOC Alpha Cohort](https://medium.com/@filbuilders/building-on-the-sovereign-cloud-meet-the-filecoin-onchain-cloud-alpha-cohort-e6090bc90b66)

### ERC-8004
- [EIP-8004 spec](https://eips.ethereum.org/EIPS/eip-8004)
- [ERC-8004 reference contracts](https://github.com/erc-8004/erc-8004-contracts)
- [ChaosChain reference impl](https://github.com/ChaosChain/trustless-agents-erc-ri)
- [Filecoin cookbook walkthrough](https://docs.filecoin.io/builder-cookbook/filecoin-pin/erc-8004-agent-registration)

### ElevenLabs
- [Eleven v3 / Expressive Mode](https://elevenlabs.io/v3)
- [Agent Workflows](https://elevenlabs.io/docs/eleven-agents/customization/agent-workflows)
- [System Tools](https://elevenlabs.io/docs/eleven-agents/customization/tools/system-tools)
- [Multimodal blog](https://elevenlabs.io/blog/introducing-multimodal-conversational-ai)
- [Multimodal upload API](https://elevenlabs.io/docs/eleven-agents/api-reference/conversations/upload-file)
- [Dynamic variables](https://elevenlabs.io/docs/agents-platform/customization/personalization/dynamic-variables)
- [Post-call webhooks](https://elevenlabs.io/docs/eleven-agents/workflows/post-call-webhooks)
- [GibberLink showcase](https://showcase.elevenlabs.io/projects/p/gibberlink)
- [Insurance Answering Service product](https://elevenlabs.io/ai-answering-service/insurance)

### DeFi insurance landscape
- [Nexus Mutual claims explainer](https://university.mitosis.org/defi-insurance-protocols-how-nexus-mutual-and-insurace-mitigate-risks-in-decentralized-finance/)
- [Etherisc parametric](https://medium.com/@etherisc/etherisc-launches-decentralized-flight-insurance-product-using-chainlink-data-feeds-a5e9ac5e0476)
- [EAS docs](https://docs.attest.org/)

### Hackathon context
- [Loops House](https://www.loops.house/) | [Shanghai page](https://www.loops.house/shanghai)
- [Germina Labs](https://germinalabs.xyz/)
- [Filecoin News 115 (Loops Delhi)](https://filecoin.io/blog/posts/filecoin-news-115/)

### Regulatory context
- [China Anthropomorphic AI Interim Measures (Lexology)](https://www.lexology.com/library/detail.aspx?g=d30367dd-5199-43fd-b297-5a4ba8a9c8d9)

---

> **End of WINNING_STRATEGY.md.** Read top-to-bottom before any code change. When in doubt, check the moat sentence.
