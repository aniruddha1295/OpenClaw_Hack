# Build Plan — Team of 4, 5 Days

> Start: April 16, 2026 | Judging: April 21-23, 2026
> Deploy locally Days 1-3 → Production deploy Day 4

---

## Team Roles

| Name | Role | Owns |
|------|------|------|
| **Tanmay** | Backend — Tool Endpoints | All 6 webhook endpoints that ElevenLabs calls during a live conversation. The core brain of the product. |
| **Anish** | Backend — Database + APIs | Migration SQL, seed data, dashboard read APIs (calls, claims, analytics), call logging webhook. |
| **Ansh** | Frontend | React dashboard — all 6 pages, components, Supabase real-time, ElevenLabs WebRTC widget. |
| **Aniruddha** | Deployment + Voice/AI Config + Demo Lead | Supabase project setup, ElevenLabs agent config, Twilio phone, Railway/Vercel deploy (Day 4), demo script, E2E testing. |

### Why This Split Works

```
Tanmay (Backend Tools)     → Writes the code ElevenLabs calls mid-conversation
Anish  (Backend DB + APIs) → Writes the database layer + what the dashboard reads
                             ↕ They share the /backend folder but work on different files
Ansh   (Frontend)          → Completely independent — builds UI with mock data first
Aniruddha (Deploy + Voice) → Days 1-3: ElevenLabs/Twilio config (no coding, dashboard work)
                              Day 4: Deploy everything to production
                              Day 4-5: Demo rehearsal + backup plans
```

---

## Who Works On Which Files

### Tanmay's Files (DO NOT TOUCH Anish's files)
```
backend/src/routes/webhook-tools.ts      ← ALL 6 tool endpoints
backend/src/services/claims-service.ts   ← claim lookup, filing logic
backend/src/services/policy-service.ts   ← policy lookup logic
backend/src/services/escalation-service.ts
backend/src/services/callback-service.ts
```

### Anish's Files (DO NOT TOUCH Tanmay's files)
```
backend/src/server.ts                    ← Fastify setup, plugin registration
backend/src/config/environment.ts        ← env var validation
backend/src/plugins/supabase.ts          ← Supabase client plugin
backend/src/plugins/cors.ts              ← CORS config
backend/src/routes/calls.ts              ← GET /api/calls, GET /api/calls/:id
backend/src/routes/claims.ts             ← GET /api/claims, GET /api/claims/:id
backend/src/routes/analytics.ts          ← GET /api/analytics
backend/src/routes/webhooks.ts           ← POST /api/webhooks/elevenlabs/conversation-ended
backend/src/services/call-log-service.ts ← call logging logic
backend/database/migration.sql           ← all 7 tables
backend/database/seed.sql                ← all demo data
backend/src/types/index.ts               ← shared TypeScript interfaces (BOTH use this)
backend/package.json                     ← Anish sets up, Tanmay can add deps
backend/tsconfig.json
backend/Dockerfile
```

### Ansh's Files (completely separate /frontend folder)
```
frontend/                                ← entire folder is Ansh's
frontend/src/pages/*.tsx
frontend/src/components/*.tsx
frontend/src/hooks/*.ts
frontend/src/lib/*.ts
frontend/src/types/*.ts
```

### Aniruddha's "Files" (mostly not code)
```
ElevenLabs dashboard                     ← agent config, tools, knowledge base, voice
Twilio dashboard                         ← phone number, ElevenLabs link
Supabase dashboard                       ← project setup, run SQL
Railway dashboard (Day 4)               ← deploy backend
Vercel dashboard (Day 4)                ← deploy frontend
backend/database/seed.sql               ← co-owns with Anish (reviews demo data)
DEMO_SCRIPT.md                          ← demo narration and flow
```

---

## Dependency Chain

```
FULLY PARALLEL FROM HOUR 1 (no dependencies):
  ┌─ [Ansh]       Frontend layout + pages with mock data
  ├─ [Aniruddha]  ElevenLabs agent config + knowledge base PDFs
  └─ [Anish]      Write migration.sql + scaffold Fastify server

SEQUENTIAL CHAIN 1 — Database:
  [Anish] Write migration.sql
    → [Aniruddha] Run migration in Supabase (5 min task)
      → [Anish] Write + run seed.sql
        → [Tanmay] Can test tool endpoints against real data
          → [Ansh] Connect frontend to real data (Day 2)

SEQUENTIAL CHAIN 2 — Tool Endpoints:
  [Anish] Supabase plugin + server setup ready
    → [Tanmay] Build tool endpoints (uses Anish's Supabase plugin)
      → [Aniruddha] Point ElevenLabs webhooks at Tanmay's endpoints (via ngrok)
        → [Aniruddha] Test phone call end-to-end

SEQUENTIAL CHAIN 3 — WebRTC Widget:
  [Aniruddha] ElevenLabs agent fully working
    → [Ansh] Integrate @11labs/react SDK into CallWidget (Day 3)

SEQUENTIAL CHAIN 4 — Production Deploy:
  [Everyone] Code complete (Day 3 EOD)
    → [Aniruddha] Deploy backend to Railway (Day 4)
      → [Aniruddha] Deploy frontend to Vercel (Day 4)
        → [Aniruddha] Swap ElevenLabs webhook URLs to Railway
          → [Everyone] Test on production + rehearse demo
```

### Critical Path (If This Is Late, Everything Slips)
1. **Aniruddha**: Supabase project + keys shared → first 30 minutes
2. **Anish**: migration.sql run in Supabase → first 2 hours
3. **Anish**: server.ts + Supabase plugin ready → first 3 hours (Tanmay needs this)
4. **Tanmay**: At least `lookup_claim` + `check_policy` working → Day 1 EOD
5. **Aniruddha**: ElevenLabs agent with tools pointing at ngrok → Day 2 morning
6. **Aniruddha**: First real phone call working → Day 2 noon

---

## Day 1 (April 16) — Foundation

### First 30 Minutes — Everyone Together
```
1. Clone repo: git clone https://github.com/aniruddha1295/Loops_hackerhouse.git
2. Aniruddha: Create Supabase project → share URL + anon key + service role key
3. Anish: mkdir backend && cd backend && npm init -y (scaffold Fastify + TS)
4. Ansh:  npm create vite@latest frontend -- --template react-ts (scaffold React)
5. Aniruddha: Create ElevenLabs account
6. Everyone: Read HACKATHON_PRD.md — focus on YOUR section
```

---

### Tanmay — Day 1

| # | Task | Blocked By | Output |
|---|------|-----------|--------|
| 1 | Read `HACKATHON_PRD.md` section 5 (tool endpoint specs) | — | Understands all 6 endpoints |
| 2 | Wait for Anish to set up `server.ts` + Supabase plugin | Anish task 1-3 | — |
| 3 | Implement `POST /api/tools/lookup-claim` | Supabase plugin + tables | Working endpoint |
| 4 | Implement `POST /api/tools/check-policy` | Same | Working endpoint |
| 5 | Implement `POST /api/tools/check-documents` | Same | Working endpoint |
| 6 | Test all 3 with curl against seed data | Seed data exists | Verified |

**Tanmay starts coding ~2-3 hours into Day 1** (after Anish has the server scaffold + DB ready). Use the waiting time to read the PRD and plan the service layer code.

---

### Anish — Day 1

| # | Task | Blocked By | Output |
|---|------|-----------|--------|
| 1 | Scaffold Fastify project: `server.ts`, `tsconfig.json`, `package.json` | — | Project runs |
| 2 | Build Supabase plugin (`plugins/supabase.ts`) | Aniruddha shares keys | Plugin ready |
| 3 | Build CORS plugin (`plugins/cors.ts`) | — | Plugin ready |
| 4 | Write `migration.sql` (all 7 tables + indexes from PRD section 4) | — | SQL file ready |
| 5 | **HAND OFF** migration.sql to Aniruddha to run in Supabase | — | — |
| 6 | Write `seed.sql` (8 customers, 10 policies, 12 claims, 15 call logs) | Tables exist | SQL file ready |
| 7 | **HAND OFF** seed.sql to Aniruddha to run | — | — |
| 8 | Write shared types in `types/index.ts` | — | Types ready |
| 9 | Implement `GET /api/claims` (list claims with filters) | Tables + seed | Working endpoint |

**Anish is the Day 1 workhorse.** Everything depends on the DB being up fast.

---

### Ansh — Day 1

| # | Task | Blocked By | Output |
|---|------|-----------|--------|
| 1 | Set up Tailwind CSS + react-router-dom | — | Styled app |
| 2 | Build `Layout.tsx` + `Sidebar.tsx` (navigation shell) | — | App shell |
| 3 | Build `ClaimStatusBadge.tsx` component | — | Component |
| 4 | Build `StatsCard.tsx` component | — | Component |
| 5 | Build `ClaimsList.tsx` page with **hardcoded mock data** | — | Page renders |
| 6 | Build `CallHistory.tsx` page with **hardcoded mock data** | — | Page renders |
| 7 | Set up Supabase client in `lib/supabase.ts` | Keys from Aniruddha | Client ready |

**Ansh is fully independent Day 1.** Use mock data. Don't wait for anyone.

Mock data example for ClaimsList:
```typescript
const mockClaims = [
  { claim_number: 'CLM-2026-000456', customer_name: 'James Wilson', status: 'under_review', claim_type: 'collision', claimed_amount: 8500 },
  { claim_number: 'CLM-2026-000321', customer_name: 'Maria Garcia', status: 'approved', claim_type: 'water_damage', claimed_amount: 12000 },
  // ... more
];
```

---

### Aniruddha — Day 1

| # | Task | Blocked By | Output |
|---|------|-----------|--------|
| 1 | Create Supabase project → share URL + keys with everyone | — | Keys shared |
| 2 | Run Anish's `migration.sql` in Supabase SQL editor | Anish delivers SQL | Tables created |
| 3 | Run Anish's `seed.sql` in Supabase SQL editor | Anish delivers SQL | Data populated |
| 4 | Create ElevenLabs account, explore Conversational AI dashboard | — | Account ready |
| 5 | Create agent "ClaimsBot" with system prompt (from PRD section 6) | — | Agent created |
| 6 | Pick voice — test 3-4 professional voices | — | Voice chosen |
| 7 | Define all 6 tools in ElevenLabs with parameter schemas | — | Tools configured |
| 8 | Point tool webhook URLs at `https://localhost` (placeholder) | — | — |
| 9 | Write 3 knowledge base PDFs (FAQ, policies, claims process) | — | PDFs ready |
| 10 | Upload PDFs to ElevenLabs agent | Agent created | KB active |
| 11 | Set up ngrok: `ngrok http 3005` → share URL with team | — | Tunnel ready |
| 12 | Test agent in ElevenLabs playground (text first, then voice) | Tools configured | Agent talks |

---

### Day 1 Checkpoint ✓
- [ ] Supabase: tables created, seed data loaded
- [x] Tanmay: 3 tool endpoints working locally (lookup_claim, check_policy, check_documents)
- [ ] Anish: Server scaffold done, migration + seed done, claims list API working
- [ ] Ansh: App shell + ClaimsList + CallHistory rendering with mock data
- [ ] Aniruddha: ElevenLabs agent configured with prompt, voice, tools, knowledge base

---

## Day 2 (April 17) — Core Features + First Phone Call

### Tanmay — Day 2

| # | Task | Blocked By | Output |
|---|------|-----------|--------|
| 1 | Implement `POST /api/tools/file-claim` | — | Creates claims in DB |
| 2 | Implement `POST /api/tools/escalate-to-human` | — | Creates escalation |
| 3 | Implement `POST /api/tools/schedule-callback` | — | Creates callback |
| 4 | Test all 6 endpoints with curl | Seed data | All verified |
| 5 | Help Aniruddha test: ElevenLabs → ngrok → local backend → Supabase | Aniruddha points webhooks at ngrok | **First real AI call!** |

---

### Anish — Day 2

| # | Task | Blocked By | Output |
|---|------|-----------|--------|
| 1 | Implement `GET /api/calls` (list call logs) | — | Endpoint |
| 2 | Implement `GET /api/calls/:id` (single call + tool executions) | — | Endpoint |
| 3 | Implement `GET /api/analytics` (aggregated stats query) | — | Endpoint |
| 4 | Implement `POST /api/webhooks/elevenlabs/conversation-ended` | — | Call logging |
| 5 | Implement `GET /api/escalations` | — | Endpoint |
| 6 | Test all dashboard endpoints with curl | Seed data | Verified |

---

### Ansh — Day 2

| # | Task | Blocked By | Output |
|---|------|-----------|--------|
| 1 | Build `Analytics.tsx` (StatsCards + Recharts CallChart) | — | Analytics page |
| 2 | Build `LiveCallView.tsx` layout (transcript left, tools right) | — | Demo page |
| 3 | Build `TranscriptViewer.tsx` (scrolling message bubbles) | — | Component |
| 4 | Build `ToolExecutionCard.tsx` (tool name, args, result, latency) | — | Component |
| 5 | Build `ClaimDetail.tsx` (single claim + associated calls) | — | Detail page |
| 6 | Connect `ClaimsList.tsx` to Supabase (replace mock data) | Supabase has data | Real data |
| 7 | Set up Supabase real-time subscription on `claims` table | — | Live updates |

---

### Aniruddha — Day 2

| # | Task | Blocked By | Output |
|---|------|-----------|--------|
| 1 | Point all 6 ElevenLabs tool webhooks at ngrok URL | ngrok running + Tanmay's endpoints | URLs set |
| 2 | **TEST: Full conversation in ElevenLabs playground** | Webhooks pointed | Tools fire correctly |
| 3 | Tune system prompt based on testing | Testing | Better responses |
| 4 | Set up Twilio account, get US phone number | — | Number ready |
| 5 | Import Twilio number into ElevenLabs dashboard | Agent working | Phone linked |
| 6 | **TEST: First real phone call end-to-end** | All above | **THE MILESTONE** |
| 7 | Share ElevenLabs agent ID with Ansh (for WebRTC widget) | Agent working | ID shared |
| 8 | Start writing demo script (exact claim numbers, exact words) | — | Draft script |

### Day 2 Checkpoint ✓
- [x] All 6 tool endpoints working (Tanmay)
- [ ] All dashboard APIs working (Anish)
- [ ] Analytics + LiveCallView + ClaimDetail built (Ansh)
- [ ] **Real phone call works end-to-end** (Aniruddha)
- [ ] Frontend connected to real Supabase data (Ansh)

---

## Day 3 (April 18) — WebRTC + Polish

### Tanmay — Day 3

| # | Task | Output |
|---|------|--------|
| 1 | Harden error handling — no 500s, graceful error messages | Robust API |
| 2 | Add request logging (Pino) for debugging | Logs visible |
| 3 | Edge case: what if claim_id doesn't exist? Policy not found? | Handled |
| 4 | Help Aniruddha test conversation edge cases | — |
| 5 | Write `Dockerfile` for Railway deployment | Ready for Day 4 |

---

### Anish — Day 3

| # | Task | Output |
|---|------|--------|
| 1 | Parse ElevenLabs conversation-ended webhook fully (transcript, duration, tools) | Complete call logs |
| 2 | Add real-time support: when tool endpoint fires, also write to `call_tool_executions` | Live tool tracking |
| 3 | Add Supabase real-time broadcast on new call_logs / tool_executions | Frontend can subscribe |
| 4 | Write `reseed.sh` script (drops + recreates seed data for demo reset) | One-command reset |
| 5 | Review all API responses — ensure frontend gets what it needs | No mismatches |

---

### Ansh — Day 3

| # | Task | Blocked By | Output |
|---|------|-----------|--------|
| 1 | Build `CallWidget.tsx` using `@11labs/react` SDK | Agent ID from Aniruddha | WebRTC calling |
| 2 | Build `AgentConfig.tsx` (display prompt, voice, tools) | — | Config page |
| 3 | Connect `LiveCallView.tsx` to Supabase real-time | Anish adds real-time | Live transcript |
| 4 | Connect `Analytics.tsx` to real API data | Anish's analytics endpoint | Real charts |
| 5 | Connect `CallHistory.tsx` to real API data | Anish's calls endpoint | Real history |
| 6 | Polish: loading states, empty states, error states | — | Polished UI |
| 7 | Make it look good on projector (bigger fonts, high contrast) | — | Demo-ready |

---

### Aniruddha — Day 3

| # | Task | Output |
|---|------|--------|
| 1 | Test WebRTC calling via Ansh's CallWidget | Browser calling verified |
| 2 | Test 10+ conversation scenarios, note issues for prompt tuning | Issue list |
| 3 | Tune prompt: fix edge cases, improve natural flow | Better agent |
| 4 | Test escalation flow (transfer_to_number) | Escalation works |
| 5 | Finalize demo script with exact claim numbers matching seed data | Script locked |
| 6 | Do 2-3 full demo rehearsals (phone call + dashboard) | Rehearsed |
| 7 | Record backup video of successful demo | Safety net |

### Day 3 Checkpoint ✓
- [ ] WebRTC calling works from dashboard (Ansh + Aniruddha)
- [ ] All pages connected to real data with loading/error states (Ansh)
- [x] Backend handles edge cases gracefully (Tanmay)
- [ ] Call logging + real-time updates working (Anish)
- [ ] Agent handles 10+ scenarios smoothly (Aniruddha)
- [ ] Demo rehearsed 2-3 times (Aniruddha)
- [ ] Backup video recorded (Aniruddha)

---

## Day 4 (April 19) — DEPLOYMENT + Demo Prep

### Aniruddha — Day 4 (DEPLOYMENT DAY)

**Morning — Deploy Everything (2-3 hours):**

| # | Step | Time |
|---|------|------|
| 1 | Create Railway project → connect GitHub → select `/backend` | 10 min |
| 2 | Add env vars to Railway (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, PORT) | 5 min |
| 3 | Trigger deploy → wait → verify endpoints respond | 15 min |
| 4 | Note Railway production URL: `https://<app>.railway.app` | — |
| 5 | Create Vercel project → connect GitHub → select `/frontend` | 10 min |
| 6 | Add env vars to Vercel (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL) | 5 min |
| 7 | Trigger deploy → wait → verify pages load | 10 min |
| 8 | **Swap all 6 ElevenLabs tool webhook URLs** from ngrok → Railway URL | 10 min |
| 9 | **TEST: Phone call on production** → tools hit Railway → DB updates → Vercel dashboard shows it | 15 min |
| 10 | **TEST: WebRTC from Vercel dashboard** → same flow | 10 min |

**Afternoon — Demo Prep:**

| # | Task |
|---|------|
| 1 | Run `reseed.sh` to reset demo data to clean state |
| 2 | Full dress rehearsal on production (timed, 5-7 min) |
| 3 | Second dress rehearsal |
| 4 | Prepare judge Q&A sheet (market size, business model, competitors, compliance) |
| 5 | Create 1-page architecture diagram for judges |

---

### Tanmay — Day 4

| # | Task |
|---|------|
| 1 | Performance check: all tool responses under 500ms on Railway |
| 2 | Fix any issues Aniruddha finds during production testing |
| 3 | Support deployment debugging if needed |
| 4 | Participate in demo rehearsal |

---

### Anish — Day 4

| # | Task |
|---|------|
| 1 | Reseed database with clean demo data |
| 2 | Verify all dashboard APIs return correct data on production |
| 3 | Fix any data format issues between production backend and frontend |
| 4 | Participate in demo rehearsal |

---

### Ansh — Day 4

| # | Task |
|---|------|
| 1 | Final visual polish: consistent spacing, colors, fonts |
| 2 | Add "SafeGuard Insurance" branding (logo in header, company name) |
| 3 | Ensure dashboard looks great on projector/big screen |
| 4 | Test on Chrome + Safari |
| 5 | Participate in demo rehearsal |

### Day 4 Checkpoint ✓
- [ ] Backend live on Railway
- [ ] Frontend live on Vercel
- [ ] ElevenLabs webhooks pointing at Railway
- [ ] Phone call works on production
- [ ] WebRTC works on production
- [ ] Demo rehearsed 2+ times on production
- [ ] Database can reset in 30 seconds
- [ ] Backup video uploaded

---

## Day 5 (April 20) — Final Check + Rest

### Everyone — Morning
| Task |
|------|
| One final full rehearsal on production |
| Reset seed data to pristine state |
| Verify ALL services: Railway + Vercel + Supabase + ElevenLabs + Twilio |
| Charge all devices |
| Prepare: phone for calling, laptop for dashboard, backup laptop |

### Pitch Structure (7 min total)
| Part | Duration | Who |
|------|----------|-----|
| The Problem | 1 min | Aniruddha |
| Live Phone Call Demo | 3 min | Aniruddha (narrates) + one person calls |
| Dashboard Walkthrough | 1.5 min | Ansh (shows UI) |
| Market + Business Model | 1 min | Aniruddha |
| Q&A | 1-2 min | Everyone |

### **REST.** Be sharp for judging April 21.

---

## Demo Script (5-7 Minutes)

### Before Going On Stage
- Reset seed data (Anish runs `reseed.sh`)
- Open dashboard on laptop: ClaimsList page
- Open second tab: LiveCallView page
- Phone charged, speaker on, Twilio number ready
- Backup: YouTube link to recorded demo

### Act 1: The Problem (1 min — Aniruddha)
> "Insurance claims are broken. You call, wait on hold for 45 minutes, explain your situation to three different people, get bounced between departments, and still don't know when you'll get paid.
>
> In China alone, insurance complaints grew 368% last year. Customer satisfaction with insurers is just 28% — lower than fast food restaurants.
>
> We built an AI agent that fixes both sides: consumers get instant help, insurers replace their call centers."

### Act 2: Live Phone Call (3 min)
> "Let me show you. I'm going to call our AI agent right now."

**Dial the Twilio number on speaker. Dashboard on screen.**

1. AI: *"Hello, thank you for calling SafeGuard Insurance claims. My name is Alex..."*
2. Caller: *"I filed a claim last month for a car accident, I want to check the status."*
3. AI asks for claim number → Caller: *"CLM-2026-000456"*
4. **Dashboard: `lookup_claim` fires in LiveCallView** ← point at screen
5. AI: *"Your claim is under review. Adjuster Sarah Chen is assigned. But you're missing some documents..."*
6. Caller: *"What do I need?"*
7. **Dashboard: `check_documents` fires** ← point at screen
8. AI: *"You still need a repair estimate and photos."*
9. Caller: *"I also had another incident — tree fell on my car. Can I file a new claim?"*
10. **Dashboard: `file_claim` fires → new claim appears in ClaimsList in REAL-TIME** ← point at screen
11. AI: *"Filed. Claim number CLM-2026-000789. Can I schedule a follow-up call?"*
12. Caller: *"Yes, tomorrow afternoon."*
13. **Dashboard: `schedule_callback` fires**
14. End call.

### Act 3: Dashboard (1.5 min — Ansh)
> Show ClaimsList: "Notice the new claim appeared live during the call."
> Show Analytics: "Every call is tracked — resolution rate, duration, escalations."
> Show AgentConfig: "Insurance companies customize the voice, personality, and tools."
> Click WebRTC widget: "Customers can also call from the website — zero phone cost."

### Act 4: Market + Business Model (1 min — Aniruddha)
> "China's insurance market is $840 billion. Call centers cost $78 billion. Ping An already cut 118,000 jobs with AI — proving the model.
>
> We charge insurers per call handled. Consumers get a free tier. Built on ElevenLabs Conversational AI.
>
> We handle both sides: the consumer gets instant service, the insurer gets structured data from every call."

---

## Risk Mitigation

| Risk | Mitigation | Who Fixes |
|------|-----------|-----------|
| ElevenLabs webhook format unexpected | Aniruddha tests Day 1, documents format for Tanmay | Aniruddha + Tanmay |
| Twilio credit runs out | WebRTC backup — same AI, no phone needed | Aniruddha |
| Railway deploy fails | Aniruddha debugs; worst case, use ngrok on a laptop as backend | Aniruddha |
| Supabase real-time slow | Ansh adds polling fallback (every 2 sec) | Ansh |
| Live demo fails on stage | Pre-recorded backup video on YouTube | Aniruddha |
| Agent gives wrong answer | Aniruddha tunes prompt Days 2-4 | Aniruddha |
| ngrok URL changes | Aniruddha gets free ngrok account for stable URL | Aniruddha |
| Git merge conflicts | Tanmay and Anish work on DIFFERENT files (see file ownership above) | Everyone |

---

## Environment Variables

### Shared `.env` (Aniruddha creates and shares Day 1)
```bash
# Supabase (Aniruddha creates project)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# ElevenLabs (Aniruddha creates agent)
ELEVENLABS_API_KEY=sk_...
ELEVENLABS_AGENT_ID=agent_...

# Twilio (Aniruddha sets up Day 2)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...

# Server
PORT=3005
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend `.env` (Ansh uses these)
```bash
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_API_URL=http://localhost:3005    # Day 1-3: local, Day 4: Railway URL
VITE_ELEVENLABS_AGENT_ID=agent_...    # From Aniruddha, Day 2
```

---

## Quick Reference: Who To Ask For What

| If You Need... | Ask... |
|----------------|--------|
| Supabase URL/keys | Aniruddha |
| ElevenLabs agent ID | Aniruddha |
| Twilio phone number | Aniruddha |
| ngrok URL | Aniruddha |
| Database schema question | Anish |
| API response format | Tanmay (tool endpoints) or Anish (dashboard endpoints) |
| Frontend component question | Ansh |
| "Does this work end-to-end?" | Aniruddha tests it |
| "What claim number do I use for testing?" | Check seed.sql (Anish wrote it) |
