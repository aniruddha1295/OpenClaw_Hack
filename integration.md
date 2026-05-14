# INTEGRATION PLAN: ClaimFlow Autopilot Hackathon

## Phase‑Based Integration Strategy (7‑Day Timeline)

### 📋 Integration Overview

| Phase | Days | Focus | Success Criteria |
|-------|------|-------|-------------------|
| **Phase 1** | Day 1‑2 | Individual Development (No Integration) | Each member has a working local component |
| **Phase 2** | Day 3‑4 | API Contract Finalization | Swagger docs + webhook format locked |
| **Phase 3** | Day 5‑6 | System Integration & Testing | All 4 components communicating |
| **Phase 4** | Day 7 | Final Polish & Submission | Production‑ready demo |

---

## Phase 1: Individual Development (Days 1‑2)

**Goal:** Everyone builds independently – no integration needed.

### Team Layout

```
Person 1 (Blockchain)          Person 2 (Agent)
  └── Filecoin SDK               └── OpenClaw CLI
  └── Alkahest SDK               └── ElevenLabs API
  └── CI/CD Config               └── Skills Logic
  └── Wallet Setup               └── System Prompts

Person 3 (Frontend)            Person 4 (Backend)
  └── Next.js Dashboard          └── Fastify + Supabase
  └── Mock Data Layer            └── API Endpoints
  └── Panel Components           └── Swagger Spec
```

### Daily Stand‑ups (5 minutes)

All 4 members gather and answer:
1. What I built yesterday
2. What I'm building today
3. Any blockers or help needed

### Milestone Check (End of Day 2)

| Member | Deliverable | Acceptance Criteria |
|--------|-------------|---------------------|
| **Person 1** | Filecoin tool working locally | Can upload mock CAR file |
| **Person 2** | OpenClaw workspace created | Can invoke skills via CLI |
| **Person 3** | Dashboard UI skeleton | Can display mock panels |
| **Person 4** | Fastify API running | `/health` returns **200 OK** |

---

## Phase 2: API Contract Finalization (Day 3‑4)

### Integration Point 1 – Swagger API Specification (Person 4)
Person 4 creates the official API contract. Once published, **no changes** are allowed.

#### Swagger Spec File (Person 4 creates on Day 3)
```yaml
openapi: 3.0.0
info:
  title: ClaimFlow Autopilot API
  version: 1.0.0
paths:
  /api/claims:
    post:
      summary: Create new claim
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ClaimRequest'
      responses:
        '200':
          description: Claim created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ClaimResponse'
  /api/evidence:
    post:
      summary: Upload evidence to Filecoin
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/EvidenceRequest'
      responses:
        '200':
          description: CID returned
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/EvidenceResponse'
  /api/escrows:
    post:
      summary: Create Alkahest escrow
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/EscrowRequest'
      responses:
        '200':
          description: Escrow UID returned
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/EscrowResponse'
  /webhooks/elevenlabs:
    post:
      summary: Receive voice conversation
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ConversationPayload'
      responses:
        '200':
          description: Agent processed
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AgentResponse'
components:
  schemas:
    ClaimRequest:
      type: object
      required: [policy_number, claim_amount]
      properties:
        policy_number: { type: string }
        claim_amount: { type: number }
        notes: { type: string }
    ClaimResponse:
      type: object
      properties:
        id: { type: string }
        policy_number: { type: string }
        claim_amount: { type: number }
        status: { type: string }
    EvidenceRequest:
      type: object
      required: [conversation_id, transcript]
      properties:
        conversation_id: { type: string }
        transcript: { type: string }
        evidence_files:
          type: array
          items: { type: string, format: base64 }
        metadata: { type: object }
    EvidenceResponse:
      type: object
      properties:
        success: { type: boolean }
        cid: { type: string }
        proof_link: { type: string }
    EscrowRequest:
      type: object
      required: [policy_number, claim_amount, filecoin_cid]
      properties:
        policy_number: { type: string }
        claim_amount: { type: number }
        filecoin_cid: { type: string }
        expiration_hours: { type: number, default: 24 }
    EscrowResponse:
      type: object
      properties:
        success: { type: boolean }
        escrow_uid: { type: string }
        escrow_link: { type: string }
    ConversationPayload:
      type: object
      required: [call_id, session_id, conversation_turns]
      properties:
        call_id: { type: string }
        session_id: { type: string }
        conversation_turns:
          type: array
          items:
            type: object
            properties:
              role: { type: string, enum: [user, assistant] }
              content: { type: string }
              timestamp: { type: number }
    AgentResponse:
      type: object
      properties:
        response_text: { type: string }
        actions: { type: array, items: { type: string } }
        tool_invocations: { type: array }
```

#### Swagger Publishing Checklist (Person 4 – Day 3)
- [ ] Generate Swagger from Fastify
- [ ] Share spec with all 4 members
- [ ] Lock API (no changes after Day 4)
- [ ] Create Postman collection from spec
- [ ] Add API docs to README

### Integration Point 2 – Webhook Format (Person 2)
Person 2 defines the ElevenLabs webhook format. Once locked, Person 1 + 3 match responses to this format.

#### Webhook Format Spec (Person 2 – Day 3)
```typescript
export interface ElevenLabsWebhookPayload {
  call_id: string;
  session_id: string;
  conversation_turns: ConversationTurn[];
  session_end_reason?: string;
  error?: {
    code: string;
    message: string;
  };
}

export interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  confidence?: number;
}

export interface AgentResponse {
  response: string;
  actions: string[]; // e.g., ["upload_evidence", "create_escrow"]
  tool_invocations?: ToolInvocation[];
}

export interface ToolInvocation {
  tool_name: string;
  parameters: Record<string, any>;
  result: any;
  status: 'success' | 'failed';
}
```

#### Webhook Lock Checklist (Person 2 – Day 3)
- [ ] Document webhook format spec
- [ ] Test with ElevenLabs simulator
- [ ] Share format with all 4 members
- [ ] Lock format (no changes after Day 4)
- [ ] Create webhook test payloads

---

## Phase 3: System Integration & Testing (Day 5‑6)

### Day 5 Integration Schedule
| Time | Activity | Member(s) |
|------|----------|----------|
| 09:00 AM | Share Swagger + webhook specs | Person 4 & Person 2 |
| 09:30 AM | Review specs – confirm no changes | All 4 members |
| 10:00 AM | Mock integration tests begin | Person 1 & 3 |
| 12:00 PM | Lunch + quick sync | All 4 members |
| 01:30 PM | Connect local components | Each member |
| 03:00 PM | End‑to‑end test run | All 4 members |
| 05:00 PM | Bug fixes + documentation | All 4 members |
| 07:00 PM | Milestone checkpoint | All 4 members |

### Integration Testing Strategy
#### Test Scenario 1 – Full Call Flow
| Step | Action | Responsible |
|------|--------|--------------|
| 1 | Call initiation (ElevenLabs) | Person 2 |
| 2 | Voice processing – user says claim | Person 2 |
| 3 | Webhook to backend (Fastify) | Person 4 |
| 4 | Store conversation in Supabase | Person 4 |
| 5 | OpenClaw skill analysis | Person 2 |
| 6 | Parse intent (claim amount) | Person 2 |
| 7 | Evidence upload (Filecoin) | Person 1 |
| 8 | Store CID in DB | Person 4 |
| 9 | Escrow creation (Alkahest) | Person 1 |
|10 | Store escrow UID | Person 4 |
|11 | Update dashboard (realtime) | Person 3 |
|12 | Simulate approval (release escrow) | Person 1 |
> **Expected result:** All 12 steps complete within 5 minutes.

#### Test Checklist
| Step | ✅ Done |
|------|---------|
| Call initiated | ⬜ |
| Voice transcribed | ⬜ |
| Webhook received | ⬜ |
| DB saved | ⬜ |
| Skill triggered | ⬜ |
| Intent parsed | ⬜ |
| Filecoin uploaded | ⬜ |
| CID stored | ⬜ |
| Escrow created | ⬜ |
| Escrow stored | ⬜ |
| Dashboard updated | ⬜ |
| Approval simulated | ⬜ |

#### Load Testing (Day 5)
| Metric | Target | Tested By |
|--------|--------|----------|
| API response time | < 500 ms | Person 4 |
| Evidence upload | < 30 s | Person 1 |
| Escrow creation | < 30 s | Person 1 |
| Dashboard update | < 1 s | Person 3 |
| Total flow | < 3 min | Person 4 & 1 |

```javascript
// k6 load test script (Day 5)
import http from 'k6/http';
import { check, sleep } from 'k6';
export const options = { stages: [{ duration: '30s', target: 10 }, { duration: '2m', target: 10 }, { duration: '30s', target: 0 }], };
export default function () {
  const params = { headers: { 'Content-Type': 'application/json' } };
  const claimRes = http.post('https://railway-backend.app/api/claims', { policy_number: 'POL-123', claim_amount: 500 }, params);
  check(claimRes, { 'claim created': r => r.status === 200 });
  const evidenceRes = http.post('https://railway-backend.app/api/evidence', { conversation_id: 'SESSION-123', transcript: 'test transcript' }, params);
  check(evidenceRes, { 'evidence uploaded': r => r.status === 200 });
  const escrowRes = http.post('https://railway-backend.app/api/escrows', { policy_number: 'POL-123', claim_amount: 500, filecoin_cid: 'bafybeig...' }, params);
  check(escrowRes, { 'escrow created': r => r.status === 200 });
  sleep(2);
}
```

#### Security Testing (Day 5)
- Check for leaked env vars – **⬜**
- API rate limiting – **⬜**
- CORS configuration – **⬜**
- HTTPS enforcement – **⬜**
- Sensitive data encryption – **⬜**
- Input validation – **⬜**
- OWASP ZAP scan – **⬜**

### Day 6 Integration Schedule
| Time | Activity | Member(s) |
|------|----------|----------|
| 09:00 AM | Fix critical bugs from Day 5 | All 4 members |
| 11:00 AM | Second end‑to‑end test run | All 4 members |
| 01:00 PM | Record backup demo video | Person 1 + 4 |
| 03:00 PM | Final documentation | Person 1 + 4 |
| 05:00 PM | Production deployment (backend, UI, tools) | Person 1 + 3 + 4 |
| 07:00 PM | Live demo test | All 4 members |
| 09:00 PM | Final bug sweep | All 4 members |

---

## Phase 4: Production Deployment (Day 6‑7)

### Deployment Sequence (Person 4 leads, Person 1 + 3 assist)
| Step | Action | Owner | Expected Result |
|------|--------|-------|-----------------|
| 1 | Pre‑deployment check – run full test suite | All members | All tests pass |
| 2 | Backend deployment to Railway | Person 4 | `/health` returns **200 OK** |
| 3 | Dashboard deployment to Vercel | Person 3 | Dashboard loads at Vercel URL |
| 4 | Blockchain tools deployment | Person 1 | Tools respond via API |
| 5 | OpenClaw workspace deployment (if needed) | Person 2 | Agent can be invoked |
| 6 | Environment setup – configure all env vars | Person 4 + 1 | No missing secrets |
| 7 | Health check – verify `/health` endpoint | Person 4 | All services responding |
| 8 | API test – call all endpoints from Postman | Person 4 + 1 | Correct data returned |
| 9 | Dashboard test – load UI + realtime updates | Person 3 + 4 | Real‑time updates working |
|10 | Final E2E test run | All members | Full flow works |
|11 | Record live demo | Person 4 + 2 | Video saved as backup |
|12 | Final submission on Loops.house | Person 4 | Submission complete |

---

## Troubleshooting Guide (Integration Issues)
| Issue | Cause | Fix |
|-------|-------|-----|
| API endpoint returns **404** | Swagger contract mismatch | Regenerate Swagger from code; share updated spec |
| Filecoin upload fails | Wallet keys mismatch | Verify `FILECOIN_WALLET_KEY` env var |
| Alkahest escrow returns **500** | Wrong contract address / network | Check `ALKAHEST_CONTRACT_ADDRESS` and Calibnet network |
| Dashboard shows empty data | Supabase realtime subscription broken | Verify Supabase client config; check table permissions |
| OpenClaw agent doesn't process | Skills not registered | Verify skills in OpenClaw config; ensure webhook receives response |
| CORS error on dashboard | Fastify CORS too restrictive | Add Vercel URL to allowed origins |
| Load test fails (> 500 ms) | Inefficient queries | Add DB indexes; optimise endpoint code |
| Security scan finds vulnerabilities | Outdated deps or exposed env vars | Run `npm audit fix`; ensure `.gitignore` includes secrets |

---

## Integration Checklist (Person 4 leads)
| Task | Status | Owner |
|------|--------|-------|
| Swagger spec locked | ⬜ | Person 4 |
| Webhook format locked | ⬜ | Person 2 |
| Mock data layer ready | ⬜ | Person 3 |
| All tools documented | ⬜ | Person 1 |
| First E2E test | ⬜ | All 4 |
| Load test passed | ⬜ | Person 4 |
| Security scan passed | ⬜ | Person 4 |
| Second E2E test | ⬜ | All 4 |
| Backup video recorded | ⬜ | Person 4 |
| Production deployment complete | ⬜ | All 4 |
| Final demo run | ⬜ | All 4 |
| Submission complete | ⬜ | Person 4 |

---

## Sign‑Off Checklist (Pre‑Submission)
| Check | Status | Verified By |
|-------|--------|-------------|
| Frontend loads without errors | ⬜ | Person 3 |
| Backend responds to all endpoints | ⬜ | Person 4 |
| Blockchain tools respond correctly | ⬜ | Person 1 |
| OpenClaw agent processes calls | ⬜ | Person 2 |
| Real‑time updates < 1 s | ⬜ | Person 3 |
| All tests passing | ⬜ | Person 4 |
| No security vulnerabilities | ⬜ | Person 4 |
| Backup video recorded | ⬜ | Person 4 |
| Loops.house submission ready | ⬜ | Person 4 |
| Demo script tested 3 times | ⬜ | Person 4 |

---

## Communication & Coordination

- **Stand‑ups:** 5 min daily, same channel (Slack/WhatsApp).
- **Documentation:** Keep specs, checklists, and demo scripts in the repo’s `docs/` folder.
- **Issue Tracking:** Use GitHub Issues with labels `integration`, `bug`, `enhancement`.

---

## What Do You Need Next?
- 📋 Detailed hourly task checklist per member
- 🗓️ Hour‑by‑hour schedule for Days 1‑7
- 📖 Git workflow guide (branch strategy + PR process)
- 🏗️ Codebase starter templates (directory structure, sample files)
- 📄 Full Swagger API spec template (ready to edit)

Feel free to request any of the above artefacts or further refinements.

---

## 🛠️ Peripheral Integration Specs

### Wallet & Environment Setup
The ClaimFlow Autopilot requires a Filecoin wallet to interact with the Filecoin network (Calibnet testnet) and Alkahest smart contracts.
1. **Create a Filecoin Wallet:** Use a wallet like FoxWallet, MetaMask (with Filecoin snap), or Glif.
2. **Export Private Key:** Extract the private key (do NOT share this key publicly or commit it to Git).
3. **Set Environment Variables:** Update `backend/.env` with your private key:
   ```env
   FILECOIN_WALLET_KEY=your_private_key_here
   AGENT_PRIVATE_KEY=your_private_key_here
   FILECOIN_NETWORK=calibration
   ```
4. **Funding:** Visit the Filecoin Calibnet Faucet and request testnet FIL (tFIL).
5. **Alkahest Contract:** Ensure the `ALKAHEST_CONTRACT_ADDRESS` is also set in your `.env` with the deployed Calibnet contract address for Arkhai's Alkahest Escrow.

### Webhooks & Tools (Quick Reference)
This project exposes REST endpoints that act as "tools" for the Agent Layer (OpenClaw). The agent calls these endpoints during voice conversations to trigger real-world actions.
- **POST `/api/tools/create-escrow`**: Creates a trustless Alkahest escrow. Payload: `{ claim_id, payee_address, amount }`
- **POST `/api/tools/attach-document`**: Uploads to Filecoin via Synapse SDK. Payload: `{ claim_id, document_type, cid }`

### System Error Codes
| Code | Type | Description | Resolution |
|------|------|-------------|------------|
| `ERR_INSUFFICIENT_FUNDS` | Blockchain | The configured Filecoin wallet does not have enough tFIL to pay for gas. | Use the Calibnet faucet to fund the wallet. |
| `ERR_ESCROW_CREATION_FAILED` | Blockchain | Alkahest smart contract reverted the transaction. | Check ABI, contract address, and payload parameters. |
| `ERR_RATE_LIMIT` | HTTP 429 | The client has exceeded 100 requests per minute. | Wait 1 minute before retrying. |
| `ERR_UNAUTHORIZED` | HTTP 401 | Missing or invalid API key. | Ensure the `Authorization` header is present. |

### Testing Workflows
- **Unit Testing**: Run `npm test` or `npm run test:coverage` (Jest). Mocked blockchain tools are used.
- **E2E Testing**: Run `cd e2e && npx cypress open` (Cypress). Covers the Dashboard UI.
- **Load Testing**: Run `npm run test:load` (k6). Simulates 10 concurrent virtual users.