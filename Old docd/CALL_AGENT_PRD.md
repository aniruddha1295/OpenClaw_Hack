# AI Call Agent — Product Requirements Document (PRD)

> This document is the single source of truth for building the AI Call Agent product from scratch.
> A fresh Claude Code session should be able to build the entire product using only this PRD + the companion ARCHITECTURE and TECHSTACK docs.

---

## 1. Product Vision

**One-liner:** Voice AI for Indian SMBs — in your language, on your number, under Rs 5/minute.

**What it is:** A standalone SaaS platform that lets small businesses (car dealers, dentists, salons, real estate agents, coaching centers) deploy an AI voice agent that can make and receive phone calls, answer questions from a knowledge base, book appointments, search inventory, and escalate to humans — all in natural Hindi, Hinglish, or English.

**Why it matters:** Indian SMBs currently pay Rs 12,000–18,000/month for a tele-caller who works 8 hours/day. This product replaces or augments that with AI that works 24/7 at Rs 3,000–8,000/month.

**Lineage:** Extracted from the Vyavsay WhatsApp SaaS calling module (Vapi integration). The existing module validates the concept but is hardcoded to a single used-car dealer and tightly coupled to WhatsApp infrastructure.

---

## 2. Target Users

### Primary: Indian SMB Owners
- **Used car dealers** (Vyavsay's existing customer — proof case)
- **Dental clinics / healthcare** — appointment booking, patient follow-up
- **Salons & spas** — service booking, reminders
- **Real estate agents** — property inquiry handling, site visit scheduling
- **Coaching centers / education** — enrollment inquiries
- **Home services** — plumber, electrician, AC repair scheduling

### Secondary: Agencies / Resellers
- Digital marketing agencies managing multiple SMB clients
- BPO/call center operators looking to augment with AI

### User Personas

**Rajesh (SMB Owner):** Runs a used car dealership in Jaipur. Gets 30-50 calls/day. Misses calls during test drives. Wants AI to handle basic inquiries and book appointments. Speaks Hinglish.

**Priya (Clinic Receptionist):** Manages a dental clinic in Pune. Handles appointment bookings, rescheduling, and patient questions. Needs AI to handle after-hours calls and overflow during busy periods.

**Agency Admin:** Manages 20 SMB clients. Needs white-label calling, per-client configuration, and unified billing.

---

## 3. Core Features (MVP — Phase 1)

### F1: Agent Studio (Configure AI Voice Agent)
- **Persona settings:** Agent name, greeting message, voice selection, language preference (Hindi/English/Hinglish/auto-detect)
- **System prompt editor:** Rich text editor for the agent's personality and instructions
- **Tool picker:** Enable/disable built-in tools per agent (search inventory, book appointment, search knowledge, escalate, collect info)
- **Knowledge base upload:** Upload Excel, CSV, PDF, or paste text. Auto-chunks and embeds for RAG.
- **Business profile:** Business name, industry vertical, address, Google Maps link, working hours, services list
- **Test call button:** Initiate a browser-based WebRTC call to test the agent without using a phone number

### F2: Outbound Calling
- **Single call:** Enter phone number + optional customer name → AI calls the customer
- **Campaign mode (Phase 2):** Upload CSV → schedule calls → AI dials each number with personalized context
- **Call initiation API:** `POST /api/calls/outbound` for programmatic triggering

### F3: Inbound Calling
- **Phone number assignment:** Each business gets an Indian virtual number (via Exotel/Twilio)
- **Auto-answer:** AI picks up, greets caller, handles conversation
- **Dynamic assistant config:** System prompt populated with business context on each inbound call
- **Business hours awareness:** Different behavior during vs. after hours

### F4: Built-in Tools (Agent Capabilities)

#### T1: Search Inventory / Products
- **Input:** Query text, optional price range, optional category
- **Behavior:** Hybrid search (structured SQL + semantic vector search) over business's product catalog
- **Output:** Top 3 results with name, price, availability. Voice-friendly formatting.
- **Vertical-agnostic:** Works for cars, dental services, salon treatments, real estate listings

#### T2: Book Appointment
- **Input:** Customer name (required), service type (required), date (optional), time (optional), customer phone (optional)
- **Behavior:** Check slot availability against business's working hours. If slot taken, suggest 3 alternatives.
- **Output:** Confirmation message with details, or alternative time suggestions
- **Side effect:** Creates a task/appointment record in database

#### T3: Search Knowledge Base
- **Input:** Natural language query
- **Behavior:** Vector similarity search over business's uploaded knowledge (FAQs, policies, pricing info)
- **Output:** Relevant context chunks injected into LLM conversation
- **Use case:** "What's your return policy?", "Do you offer financing?", "Where are you located?"

#### T4: Send Follow-up Message
- **Input:** Customer phone, message text
- **Behavior:** Send a WhatsApp or SMS message to the customer with details (location, appointment confirmation, catalog link)
- **Output:** Confirmation that message was sent
- **Channels:** WhatsApp Business API (primary for India), SMS (fallback)

#### T5: Escalate to Human
- **Input:** Reason (optional)
- **Behavior:** Log escalation, optionally transfer call to a human number
- **Output:** "Let me connect you with our team" message
- **Side effect:** Creates escalation record with reason for follow-up

#### T6: Collect Information
- **Input:** Field definitions (name, phone, email, etc.)
- **Behavior:** AI asks for and extracts structured data from conversation
- **Output:** Structured JSON with collected fields
- **Use case:** Lead qualification, feedback collection, survey

### F5: Call Dashboard
- **Call inbox:** List all calls with status, duration, outcome, customer info
- **Filters:** By status (in-progress, completed, missed), outcome (resolved, appointment booked, escalated, dropped), date range
- **Search:** Full-text search over transcripts
- **Call detail view:** Full transcript, AI-generated summary, recording playback, actions executed with latency
- **Analytics:** Total calls, average duration, booking rate, escalation rate, cost per call

### F6: WebRTC Browser Calling (Free Channel)
- **Embeddable widget:** `<script>` tag that adds a "Talk to AI" button on any website
- **Browser-to-AI calls:** Zero telephony cost, uses WebRTC via LiveKit
- **Dashboard test calls:** One-click test call from the agent configuration page
- **Widget customization:** Color, position, greeting text

### F7: Vertical Packs (Configuration Templates)
Pre-built agent configurations for specific industries:
- **Used Cars:** Inventory search, test drive booking, financing FAQs, trade-in inquiry handling
- **Dental:** Appointment booking, treatment inquiries, insurance questions, emergency triage
- **Salon:** Service booking, pricing inquiries, stylist availability
- **Real Estate:** Property listing search, site visit scheduling, pricing/EMI calculator
- **Generic:** Basic appointment + FAQ handling for any business

Each pack includes: system prompt template, tool configuration, example knowledge base, working hours defaults, and industry-specific intent taxonomy.

---

## 4. Non-Functional Requirements

### Performance
- **Voice latency (end-to-end):** < 1.5 seconds from end of human speech to start of AI audio
- **STT latency:** < 500ms
- **LLM time-to-first-token:** < 400ms
- **TTS first-byte:** < 300ms
- **Tool execution:** < 500ms (database queries), < 2s (external APIs)
- **Concurrent calls per tenant:** At least 5 simultaneous calls

### Reliability
- **Uptime target:** 99.5% (phone must always be answered)
- **Graceful degradation:** If TTS fails, fall back to secondary provider. If LLM fails, play recorded apology + collect callback number.
- **Webhook idempotency:** Duplicate events must not cause duplicate actions (double booking, etc.)

### Security
- **Webhook signature verification:** HMAC-SHA256, fail-closed (reject if secret missing)
- **Multi-tenant isolation:** Row-Level Security on all tables, tenant_id in every query
- **API authentication:** JWT (Supabase Auth)
- **Call recording consent:** Audio announcement at call start per TRAI guidelines
- **PII handling:** No PII in logs, encrypted at rest, retention policies per DPDP Act

### Compliance (India)
- **TRAI DLT registration:** Required for outbound calling. Platform should guide users through registration.
- **NCPR/DND scrubbing:** Check phone numbers against DNC registry before promotional calls
- **Calling hours:** Promotional calls only 10 AM – 9 PM IST. Transactional calls exempt.
- **CLI display:** Must show registered caller ID. No spoofing.
- **DPDP Act:** Explicit consent for recording, data retention limits, deletion on request

---

## 5. Data Model

### Core Tables

```sql
-- Multi-tenant: businesses
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  industry TEXT,
  address TEXT,
  google_maps_link TEXT,
  phone_number TEXT,
  services TEXT[],
  working_hours JSONB DEFAULT '{"mon":{"start":"10:00","end":"19:00"},"tue":{"start":"10:00","end":"19:00"},"wed":{"start":"10:00","end":"19:00"},"thu":{"start":"10:00","end":"19:00"},"fri":{"start":"10:00","end":"19:00"},"sat":{"start":"10:00","end":"19:00"},"sun":null}',
  slot_duration_minutes INT DEFAULT 30,
  timezone TEXT DEFAULT 'Asia/Kolkata',
  currency TEXT DEFAULT 'INR',
  language TEXT DEFAULT 'hi-en',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Voice agent configuration per business
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'AI Assistant',
  system_prompt TEXT,
  first_message TEXT,
  voice_provider TEXT DEFAULT 'openai',
  voice_id TEXT DEFAULT 'alloy',
  model_provider TEXT DEFAULT 'openai',
  model_name TEXT DEFAULT 'gpt-4o-mini',
  tools_enabled TEXT[] DEFAULT ARRAY['search_knowledge', 'book_appointment', 'escalate_to_human'],
  vertical_pack TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Call records
CREATE TABLE calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id),
  agent_id UUID REFERENCES agents(id),
  provider TEXT NOT NULL DEFAULT 'vapi',
  provider_call_id TEXT UNIQUE,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  channel TEXT NOT NULL DEFAULT 'pstn' CHECK (channel IN ('pstn', 'webrtc')),
  from_number TEXT,
  to_number TEXT,
  customer_phone TEXT,
  customer_name TEXT,
  status TEXT DEFAULT 'ringing' CHECK (status IN ('ringing', 'in-progress', 'ended', 'completed')),
  outcome TEXT CHECK (outcome IN ('resolved', 'appointment_booked', 'escalated', 'dropped', 'voicemail', 'no_answer')),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_sec INT,
  transcript TEXT,
  summary TEXT,
  recording_url TEXT,
  recording_archived_url TEXT,
  sentiment TEXT,
  cost_cents INT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tool execution audit log
CREATE TABLE call_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  action_name TEXT NOT NULL,
  action_args JSONB,
  action_result JSONB,
  success BOOLEAN DEFAULT true,
  latency_ms INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Product/service catalog per business
CREATE TABLE catalog_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  price NUMERIC,
  quantity INT DEFAULT 0,
  attributes JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Knowledge base chunks per business
CREATE TABLE knowledge_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  source_file TEXT,
  chunk_type TEXT DEFAULT 'general',
  content TEXT NOT NULL,
  content_hash TEXT,
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Appointments / tasks
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  call_id UUID REFERENCES calls(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  service TEXT NOT NULL,
  date DATE,
  time TIME,
  datetime_ist TIMESTAMPTZ,
  status TEXT DEFAULT 'booked' CHECK (status IN ('booked', 'confirmed', 'cancelled', 'completed', 'no_show')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Webhook idempotency
CREATE TABLE webhook_events (
  event_key TEXT PRIMARY KEY,
  processed_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_calls_business ON calls(business_id, created_at DESC);
CREATE INDEX idx_calls_provider ON calls(provider_call_id);
CREATE INDEX idx_call_actions_call ON call_actions(call_id, created_at ASC);
CREATE INDEX idx_catalog_business ON catalog_items(business_id) WHERE is_active = true;
CREATE INDEX idx_knowledge_business ON knowledge_chunks(business_id);
CREATE INDEX idx_catalog_embedding ON catalog_items USING hnsw (embedding vector_cosine_ops);
CREATE INDEX idx_knowledge_embedding ON knowledge_chunks USING hnsw (embedding vector_cosine_ops);

-- Row-Level Security
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
```

---

## 6. API Endpoints

### Auth
- `POST /api/auth/signup` — Register new user
- `POST /api/auth/login` — Login, returns JWT
- `POST /api/auth/logout` — Logout

### Businesses
- `POST /api/businesses` — Create business
- `GET /api/businesses` — List user's businesses
- `PUT /api/businesses/:id` — Update business profile
- `DELETE /api/businesses/:id` — Delete business

### Agents
- `POST /api/businesses/:bid/agents` — Create agent
- `GET /api/businesses/:bid/agents` — List agents
- `PUT /api/agents/:id` — Update agent config
- `DELETE /api/agents/:id` — Delete agent
- `POST /api/agents/:id/test-call` — Initiate browser test call

### Calls
- `POST /api/calls/outbound` — Initiate outbound call `{ businessId, agentId, phoneNumber, customerName? }`
- `GET /api/calls?businessId=X&status=Y&limit=50` — List calls
- `GET /api/calls/:id` — Get call detail
- `GET /api/calls/:id/actions` — Get call actions
- `GET /api/calls/search?q=text&businessId=X` — Full-text search transcripts

### Webhooks
- `POST /api/webhooks/voice` — Voice provider webhook (Vapi/LiveKit/Pipecat)

### Knowledge Base
- `POST /api/businesses/:bid/knowledge` — Upload knowledge (file or text)
- `GET /api/businesses/:bid/knowledge` — List knowledge sources
- `DELETE /api/knowledge/:id` — Delete knowledge source

### Catalog
- `POST /api/businesses/:bid/catalog` — Add catalog item
- `GET /api/businesses/:bid/catalog` — List catalog
- `POST /api/businesses/:bid/catalog/import` — Bulk import from Excel
- `PUT /api/catalog/:id` — Update item
- `DELETE /api/catalog/:id` — Delete item

### Analytics
- `GET /api/businesses/:bid/analytics?from=date&to=date` — Call analytics summary

---

## 7. User Flows

### Flow 1: New Business Onboarding
1. User signs up / logs in
2. Creates a business profile (name, industry, address, hours)
3. Selects a vertical pack (or starts from scratch)
4. Configures agent: persona, voice, language
5. Uploads knowledge base (FAQs, pricing, policies)
6. Uploads product catalog (if applicable)
7. Tests agent via browser WebRTC call
8. Connects a phone number (Exotel/Twilio)
9. Goes live — AI answers inbound calls

### Flow 2: Outbound Call
1. User opens Call Dashboard
2. Clicks "New Call"
3. Enters phone number + optional customer name
4. Clicks "Start AI Call"
5. Backend calls voice provider API → provider dials customer
6. AI conversation happens (tools execute as needed)
7. Call ends → transcript, summary, recording saved
8. User reviews call in dashboard

### Flow 3: Inbound Call
1. Customer calls the business's AI number
2. Voice provider routes call to webhook
3. Backend generates dynamic assistant config (prompt + tools + voice)
4. AI greets customer, handles conversation
5. Tools execute (inventory search, appointment booking, etc.)
6. Call ends → data saved → dashboard updated

### Flow 4: Website Widget Call (WebRTC)
1. Business embeds `<script>` tag on their website
2. Visitor clicks "Talk to AI" floating button
3. Browser captures microphone via WebRTC
4. Audio streams to LiveKit server → AI agent processes
5. AI responds in real-time via WebRTC audio
6. Zero telephony cost — entirely browser-based

---

## 8. Voice Pipeline (How It Works)

### The Classic Pipeline (STT → LLM → TTS)

```
Customer speaks (phone/browser)
  │
  ▼
[Voice Activity Detection — Silero VAD]
  Detects speech start/end. End-of-speech after 300-600ms silence.
  │
  ▼
[Speech-to-Text — Streaming]
  Primary: Groq Whisper API (free tier) or Faster-Whisper (self-hosted)
  Fallback: Sarvam AI (best Hinglish), IndicWhisper
  Streams partial transcripts. Final transcript on speech end.
  Latency: 200-500ms
  │
  ▼
[LLM — Streaming tokens]
  Primary: Groq (Llama 3.1 8B, free tier) or Google Gemini Flash (free tier)
  Fallback: GitHub Models (GPT-4o-mini, free tier)
  Self-hosted: Qwen 2.5 7B (best Hindi, Apache 2.0)
  Generates response token by token. Tool calls detected mid-stream.
  TTFT: 100-400ms
  │
  ├── [If tool call detected]
  │     Execute tool (DB query, API call)
  │     Inject filler phrase: "Let me check that for you..."
  │     Feed result back to LLM
  │     LLM continues generating
  │
  ▼
[Sentence Boundary Detection]
  Buffer tokens until sentence ends (. ? !)
  Send first sentence to TTS immediately
  │
  ▼
[Text-to-Speech — Streaming]
  Primary: Google Cloud TTS (4M chars/month free) or Azure Neural TTS (500K chars/month free)
  Hindi: Sarvam AI TTS (best quality) or Edge TTS (free, unofficial)
  Self-hosted: Fish Speech or Kokoro (Apache 2.0)
  Streams audio chunks as they're generated.
  First-byte: 100-300ms
  │
  ▼
Customer hears AI response
```

### Interruption Handling (Barge-In)
- VAD runs continuously on inbound audio, even during AI playback
- When human speaks during AI speech: immediately stop TTS, flush audio buffer, start processing new input
- Track what was actually played to caller (for accurate conversation history)

### Latency Budget (Target < 1.5 seconds)
| Stage | Target | Notes |
|-------|--------|-------|
| VAD end-of-speech | 300-500ms | Tunable per use case |
| STT | 200-400ms | Groq Whisper is fastest |
| LLM TTFT | 100-300ms | Groq/Cerebras fastest |
| Sentence buffer | 50-150ms | Wait for first sentence end |
| TTS first-byte | 100-200ms | Cartesia/Google fastest |
| Network/encoding | 50-100ms | Same-region deployment |
| **Total** | **800-1650ms** | |

---

## 9. Phased Roadmap

### Phase 1: Foundation (Weeks 1-4)
- [ ] Project scaffolding (Fastify + React + Supabase)
- [ ] Database schema migration
- [ ] Auth (Supabase Auth + JWT)
- [ ] Business CRUD + Agent CRUD
- [ ] Voice provider abstraction layer (IVoiceProvider interface)
- [ ] Vapi provider implementation (extract from Vyavsay)
- [ ] Webhook handler with HMAC verification + idempotency
- [ ] Tool execution framework (registry pattern)
- [ ] Search inventory tool
- [ ] Book appointment tool
- [ ] Search knowledge tool
- [ ] Escalate to human tool
- [ ] Call dashboard (list, detail, transcript, actions)
- [ ] Agent Studio UI (basic: prompt editor, tool picker)

### Phase 2: Intelligence (Weeks 5-7)
- [ ] Knowledge base upload (Excel, PDF, text)
- [ ] RAG pipeline (chunk → embed → pgvector)
- [ ] Catalog import (Excel/CSV)
- [ ] Hybrid search (structured + semantic)
- [ ] Post-call analysis (summary, sentiment, outcome classification)
- [ ] Recording archival (download to S3/R2)
- [ ] Transcript full-text search

### Phase 3: WebRTC + Widget (Weeks 8-9)
- [ ] LiveKit server setup
- [ ] LiveKit agent worker (Python, Pipecat pipeline)
- [ ] Browser calling page
- [ ] Embeddable widget (`<script>` tag)
- [ ] Test call from Agent Studio

### Phase 4: Multi-Provider + Hindi (Weeks 10-11)
- [ ] IVoiceProvider: Pipecat/LiveKit implementation
- [ ] Sarvam AI STT integration (Hindi/Hinglish)
- [ ] Hindi TTS voice selection
- [ ] Auto language detection
- [ ] Provider fallback chain

### Phase 5: Campaigns + Compliance (Weeks 12-14)
- [ ] Campaign upload (CSV with column mapping)
- [ ] Dialing scheduler (pacing, retry, time-window)
- [ ] DNC list management
- [ ] DLT registration flow guidance
- [ ] Consent audio injection
- [ ] DPDP compliance (retention, deletion)

### Phase 6: Vertical Packs + Launch (Weeks 15-16)
- [ ] Used Cars pack
- [ ] Dental Clinic pack
- [ ] Real Estate pack
- [ ] Generic SMB pack
- [ ] Pricing + billing (Stripe/Razorpay)
- [ ] Onboarding wizard
- [ ] Public launch

---

## 10. Pricing Model (Planned)

| Plan | Monthly Price | Minutes | Agents | Features |
|------|--------------|---------|--------|----------|
| **Starter** | Rs 2,999 | 500 | 1 | 1 phone number, basic dashboard, 1 vertical pack |
| **Growth** | Rs 7,999 | 2,500 | 5 | All packs, CRM sync, campaign mode, analytics |
| **Scale** | Rs 24,999 | 10,000 | Unlimited | White-label, API access, dedicated support |
| **Agency** | Custom | Custom | Custom | Multi-client management, reseller billing |

---

## 11. Success Metrics

- **Activation:** % of businesses that complete onboarding and make first test call
- **Engagement:** Average calls handled per business per week
- **Quality:** Average call sentiment score, % resolved without escalation
- **Revenue:** ARPU, churn rate, cost per call minute
- **Voice Quality:** Average end-to-end latency, % of calls with barge-in handled correctly

---

## 12. Reference: Existing Vyavsay Implementation

The following files in the Vyavsay codebase contain the original calling module that this product extracts from. Use these as reference, NOT as code to copy directly (they are tightly coupled to the car-dealer vertical and WhatsApp infrastructure):

| File | What to extract | What to change |
|------|----------------|----------------|
| `backend/src/routes/vapi-routes.ts` | Endpoint patterns, webhook handler structure | Multi-tenant, provider-agnostic |
| `backend/src/services/voice-service.ts` | Tool routing, call lifecycle, action logging | Remove car-dealer hardcoding, make tools pluggable |
| `backend/src/services/catalog-service.ts` | Hybrid search pattern | Genericize for any vertical |
| `backend/src/services/rag-service.ts` | Embedding + pgvector RAG | Keep mostly as-is |
| `backend/src/services/appointment-service.ts` | Slot availability logic | Remove IST hardcoding, use per-business timezone |
| `frontend/src/pages/VoiceCalls.tsx` | Dashboard UI patterns | Rebrand, add business selector |
| `docs/superpowers/specs/2026-04-11-voice-calling-design.md` | Design decisions | Expand for multi-tenant |

### Critical Bugs to Fix (from Vyavsay)
1. **Single-tenant fallback:** `getUserIdFromCall()` returns first user in DB if metadata missing. MUST require `metadata.businessId`.
2. **Permissive webhook secret:** Returns true if `VAPI_WEBHOOK_SECRET` env var is empty. MUST fail-closed.
3. **No idempotency:** Duplicate webhooks cause duplicate tool executions. MUST deduplicate.
4. **No RLS:** Tables have no Row-Level Security. MUST enable.
5. **Missing migration:** `wb_calls` and `wb_call_actions` tables are used in code but don't exist in migration files.
6. **Hardcoded persona:** "Priya" name, Pune location, "test drive" language, lakh rupee formatting.
