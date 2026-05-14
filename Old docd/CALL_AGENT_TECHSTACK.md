# AI Call Agent — Tech Stack, Free/OSS Models & Deployment Guide

> Companion to CALL_AGENT_PRD.md and CALL_AGENT_ARCHITECTURE.md.
> Complete reference for every technology choice, free/open-source model, and deployment option.

---

## 1. Core Tech Stack

### Backend
| Component | Technology | Why |
|-----------|-----------|-----|
| **Runtime** | Node.js 20+ (TypeScript) | Async I/O, WebSocket native, existing team expertise |
| **Framework** | Fastify 5 | Fastest Node.js framework, plugin system, schema validation |
| **Database** | PostgreSQL 15+ (Supabase) | pgvector for RAG, RLS for multi-tenancy, Supabase Auth |
| **Vector Search** | pgvector (HNSW index) | No separate vector DB needed, integrated in Postgres |
| **Cache** | Redis (Upstash or self-hosted) | Call state, rate limiting, idempotency cache |
| **Auth** | Supabase Auth (JWT) | Email/password + social login, JWT verification |
| **File Storage** | Cloudflare R2 / Supabase Storage | Call recordings, knowledge base files |

### Frontend
| Component | Technology | Why |
|-----------|-----------|-----|
| **Framework** | React 18+ (Vite) | Component model, large ecosystem |
| **Styling** | Tailwind CSS | Utility-first, consistent design |
| **UI Components** | shadcn/ui or custom | Accessible, customizable |
| **Icons** | Lucide React | Clean, consistent icon set |
| **Animation** | Framer Motion | Smooth transitions |
| **HTTP Client** | Axios | Interceptors for auth |
| **WebRTC** | LiveKit JS SDK | Browser voice calling |

### Voice Pipeline (Python Sidecar — Optional)
| Component | Technology | Why |
|-----------|-----------|-----|
| **Framework** | Pipecat or LiveKit Agents | Pipeline orchestration for self-hosted voice |
| **Runtime** | Python 3.11+ | ML ecosystem, Pipecat/LiveKit are Python-native |
| **VAD** | Silero VAD | Lightweight, accurate, CPU-only |
| **Communication** | Internal HTTP/WebSocket to Node.js backend | Tool execution delegated to main backend |

---

## 2. Free & Open-Source AI Models

### Speech-to-Text (STT) — Ranked by Recommendation

| # | Model | License | Free Tier | Hindi Quality | Streaming | Latency | Self-Host GPU | Best For |
|---|-------|---------|-----------|---------------|-----------|---------|---------------|----------|
| 1 | **Groq Whisper API** | Proprietary | ~20 RPM, 2K RPD | Excellent (large-v3) | No (fast batch) | ~200ms | None | **MVP primary — zero cost, fast** |
| 2 | **Sarvam AI** | Proprietary | 1K min/month | Best Hinglish | Yes | ~500ms | ~8GB | **Hindi-first production** |
| 3 | **Faster-Whisper + IndicWhisper** | MIT + Apache | Unlimited (self-host) | Excellent | Chunked | ~600ms | T4 (16GB) | **Self-hosted production** |
| 4 | **Deepgram Nova-3** | Proprietary | $200 credit | Good Hindi | Yes (native) | ~300ms | None | **Lowest latency (paid)** |
| 5 | **Google STT v2 (Chirp)** | Proprietary | 60 min/month | Good | Yes | ~300ms | None | Testing only |
| 6 | **Vosk** | Apache 2.0 | Unlimited | Moderate | Yes (native) | <100ms | None (CPU) | **Edge/barge-in detection** |
| 7 | **Bhashini API** | Free (govt) | Unlimited | Good | No | ~2s | None | Free fallback (unreliable) |
| 8 | **Whisper.cpp (small)** | MIT | Unlimited | Good | Yes | ~1.5s CPU | None (CPU) | CPU-only environments |

**Recommended Tiered Architecture:**
```
Primary:   Groq Whisper API (free, fast, excellent quality)
Hindi:     Sarvam AI (best Hinglish, free 1K min/month)
Fallback:  Bhashini API (free, unlimited, higher latency)
Scale:     Faster-Whisper + IndicWhisper self-hosted on T4
```

### Text-to-Speech (TTS) — Ranked by Recommendation

| # | Model | License | Free Tier | Hindi Quality | Streaming | First-Byte | Self-Host GPU | Best For |
|---|-------|---------|-----------|---------------|-----------|-----------|---------------|----------|
| 1 | **Google Cloud TTS** | Proprietary | 4M chars/month | 7/10 | Yes | ~150ms | None | **MVP primary — generous free tier** |
| 2 | **Azure Neural TTS** | Proprietary | 500K chars/month | 8/10 (best Hindi voices) | Yes | ~120ms | None | **Best Hindi voice quality** |
| 3 | **Sarvam AI TTS** | Proprietary | Limited free | 9/10 (Hinglish) | Yes | ~250ms | None | **Best Hinglish naturalness** |
| 4 | **Edge TTS** | Unofficial | Unlimited | 8/10 (Azure voices) | Yes | ~150ms | None | **Dev/demo only (could break)** |
| 5 | **OpenAI TTS** | Proprietary | None | 7/10 | Yes | ~250ms | None | Good all-round (paid only) |
| 6 | **Kokoro TTS** | Apache 2.0 | Unlimited | 4/10 | Yes | ~100ms | Very low | **Fastest OSS, watch Hindi** |
| 7 | **Fish Speech** | Apache 2.0 | Unlimited | 5/10 | Yes | ~200ms | 4-6GB | **OSS + voice cloning** |
| 8 | **XTTS-v2 (Coqui)** | MPL-2.0 | Unlimited | 5/10 | Yes | ~300ms | 4GB+ | Voice cloning (unmaintained) |
| 9 | **Piper TTS** | MIT | Unlimited | 4/10 | Partial | ~80ms | None (CPU) | Ultra-fast, low resource |

**Recommended Tiered Architecture:**
```
Primary:   Google Cloud TTS (4M chars/month free, streaming, Hindi)
Hindi:     Azure Neural TTS or Sarvam AI TTS
Dev:       Edge TTS (free, Azure-quality, unofficial)
Scale:     Fish Speech or Kokoro self-hosted (Apache 2.0)
```

### LLM — Ranked by Recommendation

| # | Model | Access | Free Tier | Hindi | Tool Calling | TTFT | Best For |
|---|-------|--------|-----------|-------|-------------|------|----------|
| 1 | **Groq (Llama 3.1 8B)** | API | 30 RPM, 14.4K RPD | Good | Yes | ~100ms | **Fastest TTFT, free** |
| 2 | **Google Gemini 2.0 Flash** | API | 15 RPM, 1.5K RPD | Best | Yes | ~200ms | **Best Hindi, free** |
| 3 | **GitHub Models (GPT-4o-mini)** | API | 15 RPM, 150K tok/day | Good | Yes | ~300ms | **Best tool calling, free** |
| 4 | **Qwen 2.5 7B** | Self-host | Unlimited | Best OSS | Yes | ~150ms | **Self-hosted Hindi champion** |
| 5 | **Cerebras (Llama 3.1 8B)** | API | Limited free | Good | Yes | ~50ms | **Absolute fastest (if available)** |
| 6 | **SambaNova (Llama 3.1)** | API | Limited free | Good | Yes | ~100ms | Groq alternative |
| 7 | **Llama 3.2 3B** | Self-host | Unlimited | Decent | Yes | ~80ms | **Ultra-fast, small model** |

**Recommended Tiered Architecture:**
```
Primary:   Groq (Llama 3.1 8B) — fastest, free
Hindi:     Google Gemini 2.0 Flash — best Hindi, free
Fallback:  GitHub Models GPT-4o-mini — reliable, free
Scale:     Self-hosted Qwen 2.5 7B on GPU (Apache 2.0)
```

### Speech-Native LLMs (Skip STT+TTS Entirely)

| Model | Pricing | Hindi | Tool Calling | Latency | Status |
|-------|---------|-------|-------------|---------|--------|
| **OpenAI GPT-4o Realtime** | ~$0.30/min | Good | Yes | ~300ms | Production (expensive) |
| **Google Gemini Live API** | Free tier? | Excellent | Yes | ~250ms | **Monitor closely — may be free** |
| **Ultravox** | Self-host (MIT) | Depends on base | Yes | ~200ms | Experimental, promising |
| **Moshi** | Self-host (Apache) | No | No | ~200ms | No tool calling = unusable |

### Embeddings (For RAG / Knowledge Base)

| Model | Access | Cost | Dimensions | Hindi | Recommendation |
|-------|--------|------|------------|-------|---------------|
| **OpenAI text-embedding-3-small** | API | $0.02/1M tokens | 1536 | Good | **Use this — cost is negligible** |
| **BGE-M3 (BAAI)** | Self-host | Free | 1024 | Best OSS | Best free multilingual |
| **Nomic Embed v1.5** | Self-host/API | Free | 768 | Decent | Good all-round free option |
| **Jina v2** | API | Free 1M tok/mo | 8192 ctx | Good | Long-chunk embedding |

---

## 3. Voice Agent Frameworks

### Framework Comparison

| | Pipecat | LiveKit Agents | Bolna |
|---|---|---|---|
| **License** | MIT | Apache 2.0 | MIT |
| **Language** | Python | Python + Go (server) | Python |
| **Architecture** | Frame-based pipeline | Plugin-based + SFU | Config-driven |
| **Telephony** | Twilio, SmallWebRTC | SIP bridge (any trunk) | Twilio, Plivo, Exotel |
| **Hindi/Hinglish** | Manual config | Manual config | First-class support |
| **Tool calling** | Native LLM function tools | FunctionContext decorator | Config-based tasks |
| **Interruption handling** | Excellent (frame-level) | Excellent (turn detection) | Good |
| **Latency** | 800-1200ms | 900-1400ms | 1000-1800ms |
| **WebRTC** | Via Daily/SmallWebRTC | Native (self-hosted SFU) | No |
| **OpenAI Realtime** | Supported | First-class plugin | Not yet |
| **Community** | ~7K stars, active | ~5K stars, corporate-backed | ~2K stars, India-focused |
| **Best for** | Maximum flexibility | Scaling + infrastructure | India market reference |

**Recommendation:** Start with **Pipecat** for pipeline flexibility. Use **LiveKit** infrastructure for WebRTC transport. Study **Bolna** for Hindi/Hinglish patterns.

---

## 4. Telephony Providers

### For Indian Market

| Provider | Number Cost | Per-Min (Outbound India) | Real-time Audio Stream | DLT Compliance | Best For |
|----------|-----------|------------------------|----------------------|----------------|----------|
| **Twilio** | ₹84/mo | ₹2.30/min | Media Streams (WebSocket) | Partial | Quick MVP, best API |
| **Exotel** | Included in ₹4,999/mo plan | ₹0.50-1.50/min | No (need SIP bridge) | Yes (native) | **Cheapest India calls** |
| **Plivo** | ₹67/mo | ₹2.70/min | Audio Streaming (WebSocket) | Manual | Twilio alternative |
| **Telnyx** | ₹84/mo | ₹1.70/min | Telnyx RT | Limited India | Cost-effective cloud |
| **FreeSWITCH + SIP trunk** | ₹1,500/mo (VPS) | ₹0.30-0.50/min | mod_audio_fork | Self-managed | **Lowest cost at scale** |
| **WebRTC (free)** | ₹0 | ₹0 | Native | N/A | **Development + website widget** |

**Recommended Path:**
```
Development:  WebRTC (free, no phone number needed)
MVP:          Twilio Media Streams ($15 trial credit)
Production:   Exotel / FreeSWITCH + Indian SIP trunk
Widget:       LiveKit (self-hosted, free forever)
```

### How PSTN Audio Reaches Your AI Server

```
Customer dials ──► PSTN network ──► SIP Trunk Provider (Twilio/Exotel)
                                        │
                                   SIP INVITE (signaling)
                                   RTP (audio: G.711, 20ms frames)
                                        │
                               ┌────────▼────────┐
                               │ Option A: Cloud  │ Twilio Media Streams
                               │ Provider bridges │ → WebSocket to your server
                               │ RTP to WebSocket │ (base64 mulaw audio bytes)
                               └─────────────────┘
                                       OR
                               ┌────────▼────────┐
                               │ Option B: Self-  │ FreeSWITCH / Asterisk
                               │ hosted media     │ receives RTP directly
                               │ server           │ mod_audio_fork → WebSocket
                               └─────────────────┘
```

---

## 5. Deployment Guide

### Tier 1: The $0/month Development Stack

```
┌───────────────────────────────────────────────────────┐
│ Frontend: Vercel Free (React SPA)                      │
│ Backend: Oracle Cloud ARM VM (4 OCPU, 24GB RAM, FREE) │
│   ├── Fastify API server                               │
│   ├── PostgreSQL + pgvector (installed on VM)          │
│   ├── Redis (KeyDB, installed on VM)                   │
│   └── Nginx reverse proxy + SSL (Let's Encrypt)       │
│ Voice: WebRTC only (LiveKit server on same VM)         │
│ Storage: Cloudflare R2 (10GB free)                     │
│ AI APIs: Groq + Gemini + GitHub Models (all free)      │
│ Domain: Cloudflare DNS (free)                          │
│                                                        │
│ Total: $0/month + domain cost (~$10/year)              │
└───────────────────────────────────────────────────────┘
```

**Oracle Cloud Always-Free Instance:**
- 4 Ampere A1 OCPUs, 24 GB RAM, 200 GB storage
- Enough to run entire stack including LiveKit and local Whisper inference
- ARM (aarch64) — all Node.js/Python packages work, some native bindings need ARM builds
- Provisioning tip: Use a retry script, capacity is often limited

### Tier 2: The $15-25/month Production-Lite Stack

| Component | Service | Cost |
|-----------|---------|------|
| Frontend | Vercel Free | $0 |
| Backend API | Railway Hobby | $5 |
| Database | Supabase Free (500MB, pgvector) | $0 |
| Redis | Upstash Free → pay-as-you-go | $0-3 |
| ML Worker | Modal ($30/month free credits) | $0 |
| Telephony | Twilio (1 number + minutes) | $5-10 |
| Recording Storage | Cloudflare R2 Free | $0 |
| LiveKit | Self-hosted on Fly.io Free | $0 |
| **Total** | | **$10-18/month** |

### Tier 3: The $40-60/month Startup Stack

| Component | Service | Cost |
|-----------|---------|------|
| Frontend | Vercel Free | $0 |
| Backend | Hetzner CX22 (2 vCPU/4GB) | €4.50 |
| Database | Supabase Pro (8GB, backups) | $25 |
| Redis | Self-hosted on Hetzner | $0 |
| ML Worker | Modal (beyond free credits) | $10-15 |
| Telephony | Exotel (Indian number + minutes) | $5-10 |
| Recording Storage | Cloudflare R2 | $0 |
| LiveKit | Self-hosted on Hetzner | $0 |
| **Total** | | **$45-55/month** |

### Production Deployment Architecture

```
                    ┌──────────────┐
                    │ Cloudflare   │
                    │ DNS + CDN    │
                    │ (free tier)  │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
    ┌─────────▼──┐  ┌─────▼─────┐  ┌──▼──────────┐
    │ Vercel     │  │ Backend   │  │ LiveKit     │
    │ (Frontend) │  │ API       │  │ Server      │
    │            │  │ (Fastify) │  │ (WebRTC)    │
    └────────────┘  └─────┬─────┘  └──┬──────────┘
                          │           │
                    ┌─────▼─────┐  ┌──▼──────────┐
                    │ Supabase  │  │ AI Agent    │
                    │ (Postgres │  │ Workers     │
                    │ + Auth    │  │ (Pipecat)   │
                    │ + Storage)│  └─────────────┘
                    └───────────┘
```

### Environment Variables (.env.example)

```bash
# Server
NODE_ENV=production
PORT=3005
FRONTEND_URL=https://your-domain.com

# Database (Supabase)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Redis
REDIS_URL=redis://localhost:6379

# Voice Provider: Vapi (MVP)
VAPI_API_KEY=your_vapi_api_key
VAPI_PHONE_NUMBER_ID=your_phone_number_id
VAPI_WEBHOOK_SECRET=your_strong_random_secret_here

# Voice Provider: Twilio (if using Pipecat/LiveKit with PSTN)
TWILIO_ACCOUNT_SID=ACxxxx
TWILIO_AUTH_TOKEN=xxxx
TWILIO_PHONE_NUMBER=+91xxxx

# LiveKit (WebRTC)
LIVEKIT_URL=ws://localhost:7880
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=devsecret

# STT
GROQ_API_KEY=gsk_xxxx

# LLM
GROQ_API_KEY=gsk_xxxx                    # Groq (primary)
GOOGLE_GEMINI_API_KEY=AIza...            # Gemini (Hindi primary)
GITHUB_PAT=github_pat_xxxx               # GitHub Models GPT-4o-mini

# TTS
GOOGLE_TTS_API_KEY=AIza...               # Google Cloud TTS
AZURE_SPEECH_KEY=xxxx                     # Azure Neural TTS (optional)
AZURE_SPEECH_REGION=centralindia

# Embeddings
OPENAI_API_KEY=sk-xxxx                    # text-embedding-3-small

# Storage
R2_ACCOUNT_ID=xxxx
R2_ACCESS_KEY_ID=xxxx
R2_SECRET_ACCESS_KEY=xxxx
R2_BUCKET_NAME=call-recordings

# India Compliance
NCPR_API_KEY=xxxx                         # DNC registry check
```

### Docker Compose (Development)

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports: ["3005:3005"]
    env_file: .env
    depends_on: [postgres, redis]

  frontend:
    build: ./frontend
    ports: ["3004:3004"]

  postgres:
    image: pgvector/pgvector:pg16
    ports: ["5432:5432"]
    environment:
      POSTGRES_DB: callvox
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes: ["pgdata:/var/lib/postgresql/data"]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  livekit:
    image: livekit/livekit-server:latest
    ports: ["7880:7880", "7881:7881", "7882:7882/udp"]
    command: --dev --bind 0.0.0.0

  agent-worker:
    build: ./agent-worker
    env_file: .env
    depends_on: [livekit, backend]

volumes:
  pgdata:
```

---

## 6. India-Specific Compliance Checklist

### Before Launch

- [ ] **DLT Registration:** Register as Principal Entity on Jio/Airtel/Vi DLT portal (7-15 days)
- [ ] **Telemarketer Registration:** Register with DoT if making promotional outbound calls
- [ ] **NCPR/DND Integration:** Integrate API to check numbers against DNC registry before calling
- [ ] **Calling Hours:** Enforce 10 AM - 9 PM IST for promotional calls (configurable per business)
- [ ] **CLI Display:** Ensure registered caller ID is shown on all outbound calls
- [ ] **Consent Recording:** Play "This call may be recorded" announcement at call start
- [ ] **DPDP Compliance:** Implement data retention policy, deletion API, consent tracking
- [ ] **Data Localization:** Store all call data in Indian cloud region (AWS Mumbai / Azure Central India)

### Per Business Onboarding

- [ ] Collect business PAN and GST for DLT registration
- [ ] Register business-specific caller ID / header
- [ ] Upload DNC scrub list (federal + business-specific)
- [ ] Configure promotional vs. transactional call classification
- [ ] Set business-specific retention period (default: 90 days)

---

## 7. Project Structure (Recommended)

```
call-agent/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── environment.ts          # Env var validation
│   │   ├── plugins/
│   │   │   ├── auth-plugin.ts          # Supabase JWT auth
│   │   │   ├── supabase-plugin.ts      # DB client
│   │   │   └── redis-plugin.ts         # Cache client
│   │   ├── routes/
│   │   │   ├── business-routes.ts      # Business CRUD
│   │   │   ├── agent-routes.ts         # Agent config CRUD
│   │   │   ├── call-routes.ts          # Call management
│   │   │   ├── webhook-routes.ts       # Voice provider webhooks
│   │   │   ├── knowledge-routes.ts     # Knowledge base upload
│   │   │   └── catalog-routes.ts       # Product catalog
│   │   ├── services/
│   │   │   ├── voice-service.ts        # Call lifecycle orchestration
│   │   │   ├── tool-registry.ts        # Tool registration + execution
│   │   │   ├── knowledge-service.ts    # RAG: chunk, embed, search
│   │   │   ├── catalog-service.ts      # Hybrid product search
│   │   │   ├── appointment-service.ts  # Slot availability + booking
│   │   │   ├── analytics-service.ts    # Call analytics + cost
│   │   │   └── recording-service.ts    # Archive recordings to R2
│   │   ├── providers/
│   │   │   ├── voice-provider.ts       # IVoiceProvider interface
│   │   │   ├── vapi-provider.ts        # Vapi implementation
│   │   │   └── pipecat-provider.ts     # Pipecat implementation
│   │   ├── tools/
│   │   │   ├── search-inventory.ts     # T1: Product search
│   │   │   ├── book-appointment.ts     # T2: Appointment booking
│   │   │   ├── search-knowledge.ts     # T3: RAG search
│   │   │   ├── send-followup.ts        # T4: WhatsApp/SMS
│   │   │   ├── escalate.ts             # T5: Human escalation
│   │   │   └── collect-info.ts         # T6: Data collection
│   │   ├── vertical-packs/
│   │   │   ├── base.ts                 # Generic intents + prompt
│   │   │   ├── used-cars.ts            # Car dealer pack
│   │   │   ├── dental.ts               # Dental clinic pack
│   │   │   └── real-estate.ts          # Real estate pack
│   │   └── server.ts                   # Fastify server entry
│   ├── database/
│   │   └── migrations/
│   │       └── 001-schema.sql          # Full schema from PRD
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx           # Home / overview
│   │   │   ├── AgentStudio.tsx         # Agent configuration
│   │   │   ├── CallDashboard.tsx       # Call list + detail
│   │   │   ├── KnowledgeBase.tsx       # Upload + manage KB
│   │   │   ├── Catalog.tsx             # Product management
│   │   │   ├── Analytics.tsx           # Call analytics
│   │   │   ├── Settings.tsx            # Business settings
│   │   │   └── VoiceCall.tsx           # WebRTC call page
│   │   ├── components/
│   │   │   ├── ui/                     # Reusable UI components
│   │   │   └── widget/                 # Embeddable widget code
│   │   ├── api/
│   │   │   └── client.ts              # Axios + JWT interceptor
│   │   └── App.tsx
│   ├── public/
│   │   └── widget.js                   # Embeddable widget script
│   └── package.json
│
├── agent-worker/                       # Python voice agent (Phase 3+)
│   ├── agent.py                        # Pipecat/LiveKit agent
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker-compose.yml
├── CALL_AGENT_PRD.md                   # This PRD
├── CALL_AGENT_ARCHITECTURE.md          # Architecture doc
└── CALL_AGENT_TECHSTACK.md             # This file
```

---

## 8. NPM Dependencies (Backend)

```json
{
  "dependencies": {
    "fastify": "^5.3.0",
    "fastify-plugin": "^5.0.0",
    "@fastify/cors": "^10.0.0",
    "@fastify/helmet": "^12.0.0",
    "@fastify/rate-limit": "^10.0.0",
    "@supabase/supabase-js": "^2.49.0",
    "openai": "^6.31.0",
    "dotenv": "^16.5.0",
    "pino": "^9.6.0",
    "pino-pretty": "^13.0.0",
    "ioredis": "^5.4.0",
    "exceljs": "^4.4.0",
    "pdf-parse": "^1.1.1",
    "@aws-sdk/client-s3": "^3.600.0"
  },
  "devDependencies": {
    "typescript": "^5.8.0",
    "@types/node": "^22.0.0",
    "tsx": "^4.19.0"
  }
}
```

---

## 9. Free Tier Limits Summary (Budget Planning)

### At Zero Cost — What You Get

| Service | Free Tier | Monthly Capacity | Enough For |
|---------|-----------|-----------------|------------|
| **Groq STT** | ~2K requests/day | ~60K transcriptions | ~2K calls (30s avg speech) |
| **Groq LLM** | 30 RPM / 14.4K RPD | ~14K LLM calls | ~700 calls (20 LLM calls/call) |
| **Gemini Flash** | 15 RPM / 1.5K RPD | ~45K LLM calls | ~2.2K calls |
| **GitHub GPT-4o-mini** | 15 RPM / 150K tok/day | ~4.5M tok/month | ~750 calls |
| **Google TTS** | 4M chars/month | ~66 hours of audio | ~1.3K calls (3 min avg) |
| **Azure TTS** | 500K chars/month | ~8 hours of audio | ~160 calls |
| **Supabase DB** | 500 MB | Storage for ~500K calls | Years of SMB usage |
| **Cloudflare R2** | 10 GB | ~500 call recordings | ~500 calls with recording |
| **Oracle VM** | 4 OCPU / 24 GB RAM | Always-on server | Full backend + LiveKit |

**Combined free tier capacity: ~500-1000 calls/month** — enough for 1-3 SMB beta customers.

### At $50/month — What You Get

| Budget Item | Service | Gets You |
|-------------|---------|----------|
| $5 | Railway backend | Always-on API |
| $25 | Supabase Pro | 8 GB DB, daily backups |
| $5-10 | Exotel / Twilio | Indian number + ~500-1000 minutes |
| $10 | Modal (GPU overflow) | ~50 hours of Whisper inference |
| **$50** | **Total** | **~3,000-5,000 calls/month** |

---

## 10. Getting Started (First 30 Minutes)

```bash
# 1. Create project
mkdir call-agent && cd call-agent

# 2. Init backend
mkdir -p backend/src/{config,plugins,routes,services,providers,tools}
cd backend && npm init -y
npm install fastify fastify-plugin @fastify/cors @supabase/supabase-js openai dotenv pino
npm install -D typescript @types/node tsx

# 3. Init frontend
cd .. && npm create vite@latest frontend -- --template react-ts
cd frontend && npm install axios lucide-react framer-motion
npm install -D tailwindcss @tailwindcss/vite

# 4. Setup Supabase
# Go to supabase.com → New Project → Get URL + keys
# Run migration 001-schema.sql in SQL Editor

# 5. Get free API keys
# Groq: console.groq.com → API Keys
# Google AI: aistudio.google.com → API Keys
# GitHub Models: github.com/marketplace/models → Get key

# 6. Create .env from .env.example above

# 7. Start building — use the PRD + Architecture docs as your guide
```

---

## 11. Key Design Principles

1. **Provider-agnostic from day 1.** Build `IVoiceProvider` before writing any provider-specific code.
2. **Multi-tenant from day 1.** Every table has `business_id`. Every query filters by it. RLS enforces it.
3. **Tools are pluggable.** ToolRegistry pattern. Never hardcode tool definitions in route handlers.
4. **Vertical packs are config, not code.** JSON/TS files that export prompts + tool selections + defaults. Adding a new vertical should not require code changes.
5. **Free tier first.** Every AI service call should have a fallback chain. Never depend on a single paid provider.
6. **India-first.** Hindi/Hinglish quality, IST timezone handling, INR formatting, DLT compliance — bake these in, don't bolt them on.
7. **Latency is king.** Measure time-to-first-audio-byte. Pipeline everything. Never wait for a full response before starting the next stage.
8. **Fail gracefully.** If TTS breaks, use backup voice. If LLM breaks, play recorded message + collect callback number. The phone must always be answered.
