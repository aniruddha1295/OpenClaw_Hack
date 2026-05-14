# REVISED WORK DISTRIBUTION – Independent Architecture

## Philosophy
**Parallel Development – No Dependencies**
> Every team member works on a self‑contained component. Integration happens only at the end via well‑defined API contracts.

---

## 👥 Team Work Distribution

| Member | Primary Focus | What They Deliver (Independently) | What They Use (External) |
|--------|---------------|-----------------------------------|--------------------------|
| **Person 1** | Blockchain + CI/CD + QA | Filecoin / Alkahest tools, GitHub Actions, testing suite | Swagger API specs |
| **Person 2** | Agent Layer (OpenClaw + ElevenLabs) | Agent system, Voice API | Webhook format spec |
| **Person 3** | Dashboard UI + Realtime | Full UI with all panels | API specs, Supabase auth |
| **Person 4** | Backend API + Database | Fastify API, Supabase tables | Webhook format spec |

### Updated Architecture (Independent Components)

```
┌─────────────────────────┐      ┌─────────────────────────┐
│  Person 4: Backend API   │      │  Person 1: Blockchain   │
│  - Fastify endpoints    │◄────►│  - Filecoin SDK tools   │
│  - Supabase tables      │      │  - Alkahest SDK tools   │
│  - Mock data layer      │      │  - CI/CD pipelines      │
│  - Health checks        │      │  - QA testing           │
└───────────┬─────────────┘      └───────────┬─────────────┘
            │                                  │
            ▼                                  ▼
┌─────────────────────────┐      ┌─────────────────────────┐
│ Person 2: Agent Layer   │      │  Person 3: Dashboard UI │
│ - OpenClaw workspace    │◄────►│  - All components       │
│ - ElevenLabs tools      │      │  - Realtime subs        │
│ - Skills configuration  │      │  - Mock data integration│
└─────────────────────────┘      └─────────────────────────┘
```

Integration happens **only at the end** via API contracts – no mid‑sprint dependencies.

---

## Detailed Breakdown Per Member

### 🟦 Person 1 – Blockchain + CI/CD + QA (Enhanced Role)
**What Changed:** Handles **all** blockchain work and DevOps infrastructure.

#### Module Tasks
| Module | Tasks | Priority | Status |
|--------|-------|----------|--------|
| 💰 **Blockchain Tools** | ✅ Install Filecoin Pin SDK<br>✅ Install Alkahest SDK<br>✅ Create tool wrappers<br>✅ Implement upload logic<br>✅ Implement escrow logic | 🔴 HIGH | 🌊 |
| 🔐 **Wallet Setup** | ✅ Create Filecoin Pay wallet<br>✅ Set up Calibnet keys<br>✅ Fund wallet with testnet<br>✅ `.env` templates<br>✅ Document key security | 🔴 HIGH | 🌊 |
| 🧪 **Testing Infrastructure** | ✅ Jest test setup<br>✅ Cypress E2E<br>✅ k6 load testing<br>✅ Security scanning<br>✅ Test documentation | 🔴 HIGH | 🌊 |
| 🔧 **CI/CD Pipeline** | ✅ Create GitHub Actions<br>✅ Auto‑test on PR<br>✅ Auto‑deploy staging<br>✅ Alerts<br>✅ Coverage reporting | 🔴 HIGH | 🌊 |
| 📄 **Documentation** | ✅ Swagger/OpenAPI specs<br>✅ Postman collection<br>✅ Webhook docs<br>✅ Error code docs<br>✅ Integration guide | 🟡 MEDIUM | 🌊 |
| 🛡️ **Security Hardening** | ✅ Create `.gitignore`
✅ Validate all env vars
✅ Check for leaked keys
✅ Rate‑limiting setup
✅ CORS configuration | 🔴 HIGH | 🌊 |

**Mock Implementation (TypeScript)**
```typescript
// backend/src/routes/evidence.ts
export async function mockEvidenceUpload(request: any, reply: any) {
  const { transcript, evidence_files, conversation_id } = request.body;
  const mockCID = 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi';
  await supabase.from('claim_evidence').insert({
    conversation_id,
    filecoin_cid: mockCID,
    upload_status: 'mocked',
    upload_timestamp: new Date()
  });
  return reply.send({ success: true, cid: mockCID });
}
```

### 🟨 Person 2 – Agent Layer (OpenClaw + ElevenLabs)
**Status:** Independent; no changes required.

#### Module Tasks
| Module | Tasks | Priority | Status |
|--------|-------|----------|--------|
| 🤖 **OpenClaw Setup** | ✅ Install OpenClaw CLI/SDK<br>✅ Create workspace<br>✅ Configure gateway<br>✅ Setup agent config<br>✅ Install model (GPT‑4o) | 🔴 HIGH | 🌊 |
| 📞 **ElevenLabs Integration** | ✅ Wrap transcription API<br>✅ Wrap TTS API<br>✅ Create voice config<br>✅ Create tool wrapper<br>✅ Test API calls | 🔴 HIGH | 🌊 |
| ⚙️ **Skills Development** | ✅ Claim Analysis Skill<br>✅ Evidence Collection Skill<br>✅ Escrow Creation Skill<br>✅ Human Handoff Skill<br>✅ Status Query Skill | 🔴 HIGH | 🌊 |
| 📝 **System Prompt** | ✅ Define agent persona<br>✅ Configure tools list<br>✅ Add behavior rules<br>✅ Define response format<br>✅ Add fallback logic | 🟡 MEDIUM | 🌊 |
| 🧪 **Agent Testing** | ✅ Test via CLI<br>✅ Test via API<br>✅ Error handling tests<br>✅ Verify logs<br>✅ Document flow | 🔴 HIGH | 🌊 |

**Key Independence:** Uses mock webhooks from Person 4 and generates mock tool responses – no real blockchain calls.

### 🟩 Person 3 – Dashboard UI + Realtime
**Status:** Independent; no changes required.

#### Module Tasks
| Module | Tasks | Priority | Status |
|--------|-------|----------|--------|
| 🎨 **Next.js Setup** | ✅ Create Vercel Next.js project<br>✅ Install Supabase client<br>✅ Project structure<br>✅ Theme + colors<br>✅ Responsive layout | 🔴 HIGH | 🌊 |
| 📊 **Evidence Panel** | ✅ Display Filecoin CID<br>✅ Show proof link<br>✅ Show upload status<br>✅ Handle mock data<br>✅ Loading states | 🔴 HIGH | 🌊 |
| 💰 **Escrow Panel** | ✅ Display escrow UID<br>✅ Show amount + status<br>✅ Confirmation link<br>✅ Simulate release<br>✅ Loading states | 🔴 HIGH | 🌊 |
| 📋 **Logs Panel** | ✅ Stream tool logs<br>✅ Show invocation info<br>✅ Filter/search logs<br>✅ Auto‑scroll<br>✅ Real‑time updates | 🔴 HIGH | 🌊 |
| ⚙️ **Configs** | ✅ Supabase client<br>✅ API client<br>✅ Theme provider<br>✅ Error boundary<br>✅ Loading screens | 🟡 MEDIUM | 🌊 |

**Key Independence:** Consumes Swagger spec from Person 4; works with mock data before backend is fully ready.

### 🟥 Person 4 – Backend API + Database (Relieved Load)
**What Changed:** Focuses **solely** on Fastify API and Supabase; blockchain work moved to Person 1.

#### Module Tasks
| Module | Tasks | Priority | Status |
|--------|-------|----------|--------|
| 📦 **Fastify API Setup** | ✅ Install Fastify + dependencies<br>✅ Create project structure<br>✅ Configure CORS + HTTPS<br>✅ Create `/health` endpoint<br>✅ Setup middleware stack (helmet, cors, rate‑limit) | 🔴 HIGH | 🌊 |
| 🗄️ **Supabase Schema** | ✅ Create database tables<br>✅ Create migrations<br>✅ Setup Supabase client<br>✅ Helper functions<br>✅ Add test data seeders | 🔴 HIGH | 🌊 |
| 📎 **API Endpoints** | ✅ `POST /claims`<br>✅ `GET /claims/:id`<br>✅ `POST /evidence` (mock)<br>✅ `POST /escrows` (mock)<br>✅ `POST /logs` (mock) | 🔴 HIGH | 🌊 |
| 🧪 **API Testing** | ✅ Unit tests for all endpoints<br>✅ Integration tests<br>✅ Load testing (100 req/s)<br>✅ Error handling tests<br>✅ Coverage report | 🔴 HIGH | 🌊 |
| 📄 **API Documentation** | ✅ Swagger/OpenAPI specs<br>✅ Postman collection<br>✅ Endpoint specs<br>✅ Error code docs | 🟡 MEDIUM | 🌊 |

**Key Independence:** Provides mock endpoints for blockchain features; Person 1 uses these specs to build real tools.

---

## Week‑by‑Week Schedule (100 % Independent)

### Day 1 – Project Setup
| Person | Tasks |
|--------|-------|
| **Person 1** | Install Filecoin & Alkahest, create wallet, scaffold CI/CD, start project structure |
| **Person 2** | Setup OpenClaw workspace, define webhook format |
| **Person 3** | Create Next.js dashboard, Vercel account, Supabase client |
| **Person 4** | Install Fastify & Supabase, create project structure, draft Swagger spec |

### Day 2 – Core Development
| Person | Tasks |
|--------|-------|
| **Person 1** | Implement Filecoin upload, Alkahest escrow, CI/CD config |
| **Person 2** | Build ElevenLabs wrappers, define skill schemas, test tool formats |
| **Person 3** | Develop UI panels, integrate mock data |
| **Person 4** | Implement API endpoints, write unit tests, create mock data |

### Day 3 – Integration Prep
| Person | Tasks |
|--------|-------|
| **Person 1** | Wrap blockchain tools, create CLI scripts, document API usage |
| **Person 2** | Implement OpenClaw skills, document agent flow |
| **Person 3** | Connect UI to mocked APIs, build realtime logic |
| **Person 4** | Finalize Swagger, write integration tests, generate Postman collection |

### Day 4 – Testing & Documentation
| Person | Tasks |
|--------|-------|
| **Person 1** | Run security scan, fix tool bugs, finalize docs |
| **Person 2** | Skill tests, agent bug fixes, update docs |
| **Person 3** | UI bug fixes, layout finalisation |
| **Person 4** | Load tests, Swagger polishing, API bug fixes |

### Day 5 – Integration Preparation
| Person | Tasks |
|--------|-------|
| **Person 1** | Verify tools work with Swagger UI, prepare deployment env |
| **Person 2** | Verify skills via CLI, document prompts |
| **Person 3** | Verify panels & realtime updates |
| **Person 4** | Verify APIs, run full test suite |

### Day 6 – Integration Day (All Members)
1. **Person 4** deploys Fastify backend to Railway (staging)
2. **Person 3** deploys Next.js dashboard to Vercel
3. **Person 1** deploys blockchain tools
4. Connect all components
5. End‑to‑end testing
6. Record backup demo video

### Day 7 – Final Prep & Demo
| Person | Tasks |
|--------|-------|
| **Person 1** | Fix any tool issues |
| **Person 2** | Fix any agent issues |
| **Person 3** | Fix any UI issues |
| **Person 4** | Coordinate submission, run final demo, submit on Loops.house |

---

## Integration Points (Only 2)
1. **API Contracts (Swagger)** – Person 4 creates Swagger docs; Person 1 builds tools, Person 3 builds UI.
2. **Webhook Format** – Person 2 defines webhook spec; Person 4 implements Fastify endpoint, Person 1 uses mock responses.

```yaml
# Swagger snippet for evidence upload
components:
  schemas:
    EvidenceUpload:
      type: object
      properties:
        conversation_id: { type: string }
        transcript: { type: string }
        evidence_files:
          type: array
          items: { type: string, format: base64 }
      required: [conversation_id, transcript]
  responses:
    EvidenceResponse:
      description: CID returned
      content:
        application/json:
          schema:
            type: object
            properties:
              success: { type: boolean }
              cid: { type: string }
              proof_link: { type: string }
```

```typescript
// Webhook format spec (Person 2)
interface ElevenLabsWebhook {
  call_id: string;
  session_id: string;
  conversation_turns: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
  }>;
}

// Fastify endpoint (Person 4)
fastify.post('/webhooks/elevenlabs', async (request: Request) => {
  const payload = request.body as ElevenLabsWebhook;
  // Store + forward to agent
});
```

---

## Final Deliverables (All Independent)
| Deliverable | Owner | Status |
|------------|-------|--------|
| Filecoin Tool | Person 1 | ⬜ |
| Alkahest Tool | Person 1 | ⬜ |
| CI/CD Pipeline | Person 1 | ⬜ |
| QA Testing | Person 1 | ⬜ |
| Wallet Setup | Person 1 | ⬜ |
| OpenClaw Workspace | Person 2 | ⬜ |
| ElevenLabs Tools | Person 2 | ⬜ |
| All 5 Skills | Person 2 | ⬜ |
| Dashboard UI | Person 3 | ⬜ |
| Real‑time Updates | Person 3 | ⬜ |
| Fastify API | Person 4 | ⬜ |
| Supabase Tables | Person 4 | ⬜ |
| API Documentation | Person 4 | ⬜ |
| Demo Video | All team | ⬜ |
| Loops Submission | Person 4 | ⬜ |

---

## Success Metrics (Individual)
| Member | Success Metric | Target |
|--------|----------------|--------|
| Person 1 | All tools + tests + CI/CD | 100 % coverage, all passing |
| Person 2 | All skills working | 5/5 skills tested |
| Person 3 | All panels rendering | 4/4 panels working |
| Person 4 | All APIs returning data | 5/5 endpoints tested |

---

## Risk Mitigation
| Risk | Mitigation |
|------|------------|
| Blockchain tools fail | Person 1 provides mock fallbacks in CLI |
| API format changes mid‑hackathon | Swagger locked Day 2, no changes after |
| Person 1 overwhelmed | Blockchain work isolated, no backend code |
| Person 4 overwhelmed | No blockchain integration required |
| Integration fails Day 6 | Mock data ensures demos work |
| Demo fails live | Person 1 + 4 record backup video by Day 6 |

---

## Final Recommendation
- **No dependencies** – parallel work eliminates blockers.
- **Mock‑first approach** ensures the demo works even if integration issues arise.
- **Clear API contracts** (Swagger) and webhook spec provide deterministic integration points.
- **Independent ownership** spreads risk and accelerates delivery.

---

## What Do You Need Next?
- 📋 Detailed hourly task checklist per member.
- 🗓️ Hour‑by‑hour schedule for Days 1‑7.
- 📖 Git workflow guide (branch strategy + PR process).
- 🏗️ Starter templates for each component.
- 📄 Full Swagger API spec template.

Feel free to ask for any of these artefacts or further refinements.