# AI Call Agent — Architecture & Voice Pipeline

> Companion to CALL_AGENT_PRD.md. This document covers system architecture, the real-time voice pipeline, provider abstractions, and data flows.

---

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Tailwind)                      │
│                                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │ Agent    │ │ Call     │ │ Knowledge│ │ Catalog  │ │ Analytics│ │
│  │ Studio   │ │ Dashboard│ │ Base     │ │ Manager  │ │          │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
│                                                                     │
│  ┌───────────────────────┐  ┌────────────────────────────────────┐ │
│  │ WebRTC Call Component │  │ Embeddable Widget (widget.js)      │ │
│  │ (LiveKit JS SDK)      │  │ <script src="callvox.com/widget">  │ │
│  └───────────────────────┘  └────────────────────────────────────┘ │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ HTTPS / JWT
┌──────────────────────────────▼──────────────────────────────────────┐
│                     API GATEWAY (Fastify)                            │
│                                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐              │
│  │ Auth     │ │ Rate     │ │ Tenant   │ │ Webhook  │              │
│  │ Middleware│ │ Limiter  │ │ Resolver │ │ HMAC     │              │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘              │
│                                                                     │
│  Routes: /api/businesses, /api/agents, /api/calls,                  │
│          /api/webhooks/voice, /api/knowledge, /api/catalog          │
└──────────────┬─────────────────────────┬────────────────────────────┘
               │                         │
    ┌──────────▼──────────┐   ┌──────────▼──────────┐
    │  VOICE ORCHESTRATOR  │   │  BUSINESS SERVICES   │
    │                      │   │                      │
    │  VoiceService        │   │  KnowledgeService    │
    │  CallLifecycle       │   │  CatalogService      │
    │  ToolRegistry        │   │  AppointmentService  │
    │  ProviderAdapter     │   │  AnalyticsService    │
    └──────────┬───────────┘   └──────────┬───────────┘
               │                          │
    ┌──────────▼──────────────────────────▼───────────┐
    │             VOICE PROVIDER LAYER                  │
    │                                                   │
    │  ┌─────────────────────────────────────────────┐ │
    │  │  IVoiceProvider Interface                    │ │
    │  │  - startOutboundCall(config): CallHandle     │ │
    │  │  - onWebhookEvent(event): WebhookResponse    │ │
    │  │  - getAssistantConfig(business): AssistantCfg│ │
    │  │  - getCallStatus(callId): CallStatus         │ │
    │  └─────────────────────────────────────────────┘ │
    │                                                   │
    │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
    │  │ Vapi     │ │ Pipecat  │ │ LiveKit + OpenAI │ │
    │  │ Provider │ │ Provider │ │ Realtime Provider│ │
    │  └──────────┘ └──────────┘ └──────────────────┘ │
    └──────────────────┬──────────────────────────────┘
                       │
    ┌──────────────────▼──────────────────────────────┐
    │              DATA LAYER (Supabase)               │
    │                                                   │
    │  PostgreSQL + pgvector    Supabase Auth           │
    │  businesses, agents,     JWT tokens               │
    │  calls, call_actions,    RLS policies             │
    │  catalog_items,                                   │
    │  knowledge_chunks,       Supabase Storage         │
    │  appointments,           Call recordings           │
    │  webhook_events          Knowledge files          │
    └──────────────────────────────────────────────────┘
```

---

## 2. The Voice Provider Abstraction (IVoiceProvider)

This is the most critical abstraction in the system. It decouples the business logic from the telephony/AI provider.

### Interface Definition

```typescript
interface IVoiceProvider {
  readonly name: string; // 'vapi' | 'pipecat' | 'livekit-realtime'

  // Initiate an outbound phone call
  startOutboundCall(params: {
    phoneNumber: string;
    customerName?: string;
    assistantConfig: AssistantConfig;
    webhookUrl: string;
    metadata: Record<string, string>;
  }): Promise<{ providerCallId: string; status: string }>;

  // Handle incoming webhook event from the provider
  handleWebhookEvent(event: {
    headers: Record<string, string>;
    body: unknown;
  }): Promise<WebhookResponse>;

  // Build assistant configuration for a business
  buildAssistantConfig(params: {
    business: Business;
    agent: Agent;
    tools: ToolDefinition[];
    knowledgeContext?: string;
  }): AssistantConfig;

  // Verify webhook signature
  verifyWebhook(headers: Record<string, string>, body: string, secret: string): boolean;

  // Parse provider-specific webhook into normalized event
  parseWebhookEvent(body: unknown): NormalizedCallEvent;
}

// Normalized event types (provider-agnostic)
type NormalizedCallEvent =
  | { type: 'tool-calls'; callId: string; toolCalls: ToolCall[] }
  | { type: 'status-update'; callId: string; status: string; metadata?: Record<string, string> }
  | { type: 'call-ended'; callId: string; transcript: string; summary: string; recordingUrl?: string; duration: number; endReason: string }
  | { type: 'assistant-request'; callId: string; callerNumber: string; calledNumber: string };

interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;  // JSON Schema
  handler: (args: Record<string, unknown>, context: ToolContext) => Promise<string>;
}
```

### Vapi Provider Implementation (Reference)

The Vapi provider wraps the single `POST https://api.vapi.ai/call` endpoint and the webhook handler from the existing Vyavsay code. Key mapping:

| IVoiceProvider method | Vapi implementation |
|---|---|
| `startOutboundCall` | `POST https://api.vapi.ai/call` with phoneNumberId, customer, assistant config |
| `handleWebhookEvent` | Switch on `message.type`: tool-calls, status-update, end-of-call-report, assistant-request |
| `verifyWebhook` | Compare `x-vapi-secret` header to stored secret |
| `parseWebhookEvent` | Map Vapi event types to NormalizedCallEvent |

### Pipecat Provider Implementation (Future)

Pipecat runs as a Python sidecar. The Node.js backend communicates with it via internal HTTP/WebSocket:

```
Fastify Backend ←→ [Internal API] ←→ Pipecat Python Worker
                                         │
                                    ┌────┴────┐
                                    │ Pipeline │
                                    │ VAD→STT  │
                                    │ →LLM→TTS │
                                    └────┬────┘
                                         │
                                    Twilio / LiveKit
                                    (transport layer)
```

---

## 3. Tool Registry Architecture

Tools are the AI agent's capabilities. They must be pluggable, per-business configurable, and latency-tracked.

```typescript
class ToolRegistry {
  private tools: Map<string, ToolHandler> = new Map();

  register(name: string, handler: ToolHandler): void;
  execute(name: string, args: unknown, context: ToolContext): Promise<ToolResult>;
  getEnabledTools(agent: Agent): ToolDefinition[];
}

interface ToolContext {
  businessId: string;
  callId: string;
  supabase: SupabaseClient;
}

interface ToolResult {
  text: string;       // natural language result for the AI to speak
  data?: unknown;     // structured data for logging
  success: boolean;
}

// Built-in tools registered at startup
registry.register('search_inventory', searchInventoryHandler);
registry.register('book_appointment', bookAppointmentHandler);
registry.register('search_knowledge', searchKnowledgeHandler);
registry.register('escalate_to_human', escalateHandler);
registry.register('send_followup', sendFollowupHandler);
registry.register('collect_info', collectInfoHandler);

// Custom tools (per-business webhook)
registry.register('custom_webhook', customWebhookHandler);
```

### Tool Execution Flow During a Call

```
Voice Provider sends tool-call event
  │
  ▼
Webhook Handler receives event
  │
  ▼
Parse tool name + args from provider format
  │
  ▼
Check idempotency (has this exact tool call been processed?)
  │  YES → return cached result
  │  NO  ↓
  ▼
ToolRegistry.execute(name, args, context)
  │
  ├── Start timer
  ├── Execute handler (async)
  ├── Stop timer → latency_ms
  │
  ▼
Log to call_actions table (fire-and-forget):
  { call_id, action_name, action_args, action_result, success, latency_ms }
  │
  ▼
Return result to voice provider
  (provider feeds it back to LLM → LLM speaks the result)
```

---

## 4. Real-Time Voice Pipeline (Deep Dive)

### 4.1 Full Pipeline Diagram

```
  ┌──────────────────────────────────────────────────────────────────────┐
  │ CALLER'S PHONE                                                       │
  │ Speaks: "Mujhe Fortuner ka price batao"                             │
  └───────────────┬──────────────────────────────────────────────────────┘
                  │ G.711 u-law audio (8kHz, 20ms frames)
                  │ via PSTN → SIP Trunk
                  ▼
  ┌──────────────────────────────────────────────────────────────────────┐
  │ TELEPHONY LAYER                                                      │
  │ (Twilio Media Streams / Exotel SIP / FreeSWITCH mod_audio_fork)     │
  │                                                                      │
  │ Converts RTP → WebSocket audio stream                                │
  │ Bidirectional: can receive TTS audio back                            │
  └───────────────┬──────────────────────────────────────────────────────┘
                  │ Raw audio bytes (base64 mulaw or PCM)
                  │ over WebSocket
                  ▼
  ┌──────────────────────────────────────────────────────────────────────┐
  │ VOICE ACTIVITY DETECTION (VAD)                     Latency: ~10ms   │
  │                                                                      │
  │ Silero VAD (1MB neural network, runs on CPU)                        │
  │ Processes each 30ms audio frame                                      │
  │ Outputs: speech probability 0.0 → 1.0                               │
  │                                                                      │
  │ Speech threshold: 0.5                                                │
  │ End-of-speech padding: 400ms (configurable per agent)               │
  │ Pre-speech buffer: 300ms (keep audio before VAD triggers)           │
  │                                                                      │
  │ CRITICAL TUNING: This padding is the single biggest latency lever.  │
  │ Car dealer (pauses to think): 600ms. Fast booking: 300ms.           │
  └───────────────┬──────────────────────────────────────────────────────┘
                  │ Speech segments (start/end timestamps)
                  ▼
  ┌──────────────────────────────────────────────────────────────────────┐
  │ SPEECH-TO-TEXT (STT) — Streaming              Latency: 200-500ms    │
  │                                                                      │
  │ How streaming STT works:                                             │
  │ 1. Audio chunks sent continuously over WebSocket to STT engine      │
  │ 2. Engine extracts mel spectrograms (25ms windows, 10ms hop)        │
  │ 3. Encoder (Conformer/Transformer) processes features               │
  │ 4. Decoder runs beam search, emits partial transcripts              │
  │                                                                      │
  │ Two result types:                                                    │
  │ - Partial: "mujhe fort..." (unstable, updates as audio arrives)     │
  │ - Final: "mujhe fortuner ka price batao" (stable, sent to LLM)     │
  │                                                                      │
  │ Provider priority (free → paid):                                     │
  │ 1. Groq Whisper API (free, ~200ms, no streaming but fast batch)    │
  │ 2. Sarvam AI (best Hinglish, free 1K min/mo, streaming)            │
  │ 3. Faster-Whisper + IndicWhisper (self-hosted, T4 GPU, ~600ms)     │
  │ 4. Deepgram Nova (streaming, $0.0043/min, best latency)            │
  │                                                                      │
  │ For Groq (no streaming): use VAD to detect speech end,              │
  │ then send complete chunk. Adds ~200ms but quality is excellent.      │
  └───────────────┬──────────────────────────────────────────────────────┘
                  │ Final transcript text
                  ▼
  ┌──────────────────────────────────────────────────────────────────────┐
  │ LLM INFERENCE — Streaming tokens             TTFT: 100-400ms        │
  │                                                                      │
  │ Conversation history maintained as chat messages array:              │
  │ [system_prompt, user_msg_1, assistant_msg_1, user_msg_2, ...]      │
  │                                                                      │
  │ System prompt includes:                                              │
  │ - Agent persona and business context                                 │
  │ - Pre-loaded knowledge base context (top business info chunks)      │
  │ - Voice rules (keep responses under 3 sentences, natural speech)    │
  │ - Tool usage instructions                                            │
  │                                                                      │
  │ Provider priority (free → paid):                                     │
  │ 1. Groq (Llama 3.1 8B/70B, ~100ms TTFT, 30 RPM free)             │
  │ 2. Google Gemini 2.0 Flash (15 RPM free, best Hindi)               │
  │ 3. GitHub Models GPT-4o-mini (15 RPM free, good all-round)         │
  │ 4. Self-hosted Qwen 2.5 7B (best OSS Hindi, ~150ms TTFT on GPU)   │
  │                                                                      │
  │ TOOL CALL HANDLING:                                                  │
  │ If LLM emits a tool call instead of text:                           │
  │ 1. Parse function name + arguments                                   │
  │ 2. Send filler phrase to TTS: "Ek second, main check karta hoon"   │
  │ 3. Execute tool asynchronously                                       │
  │ 4. Feed result back to LLM as tool response message                 │
  │ 5. LLM generates spoken response with data                          │
  │ 6. Resume TTS pipeline                                              │
  │                                                                      │
  │ LONG CONVERSATIONS:                                                  │
  │ After 20 turns, summarize older turns into a condensed paragraph.   │
  │ Keep: system prompt + summary + last 10 turns.                      │
  └───────────────┬──────────────────────────────────────────────────────┘
                  │ Token stream ("The" "Fortuner" "is" "priced" ...)
                  ▼
  ┌──────────────────────────────────────────────────────────────────────┐
  │ SENTENCE BOUNDARY DETECTION                    Latency: 50-150ms    │
  │                                                                      │
  │ Buffer tokens until a sentence boundary is detected:                │
  │ - Period (.), question mark (?), exclamation (!)                    │
  │ - Or: 200ms gap in token stream                                     │
  │                                                                      │
  │ First sentence sent to TTS IMMEDIATELY while LLM generates more.   │
  │ This is the #1 latency optimization technique.                      │
  │                                                                      │
  │ Example:                                                             │
  │ LLM output: "Fortuner ka price 28 lakh hai." | "Kya aap test..."   │
  │             ↓ sent to TTS now                  ↓ sent when ready     │
  └───────────────┬──────────────────────────────────────────────────────┘
                  │ Sentence-sized text chunks
                  ▼
  ┌──────────────────────────────────────────────────────────────────────┐
  │ TEXT-TO-SPEECH (TTS) — Streaming              First-byte: 100-300ms │
  │                                                                      │
  │ How streaming TTS works:                                             │
  │ 1. Text sentence received                                           │
  │ 2. Model generates mel spectrogram (autoregressive or diffusion)    │
  │ 3. Vocoder converts spectrogram to PCM audio waveform              │
  │ 4. Audio chunks streamed back before full synthesis completes       │
  │                                                                      │
  │ Provider priority (free → paid):                                     │
  │ 1. Google Cloud TTS (4M chars/month free, streaming, Hindi 7/10)   │
  │ 2. Edge TTS (free, Azure-quality, unofficial — dev only)           │
  │ 3. Azure Neural TTS (500K chars/month free, best Hindi voices)     │
  │ 4. Sarvam AI TTS (best Hinglish, limited free tier)                │
  │ 5. Fish Speech / Kokoro (self-hosted, Apache 2.0, streaming)       │
  │                                                                      │
  │ VOICE SELECTION:                                                     │
  │ Configurable per agent. Store voice_provider + voice_id in agents   │
  │ table. Allow business owners to preview and select voices.           │
  └───────────────┬──────────────────────────────────────────────────────┘
                  │ PCM audio chunks (24kHz/16kHz)
                  ▼
  ┌──────────────────────────────────────────────────────────────────────┐
  │ AUDIO ENCODING & RETURN                        Latency: ~1ms        │
  │                                                                      │
  │ For PSTN: Downsample to 8kHz → G.711 u-law → RTP packets           │
  │ For WebRTC: Encode to Opus (browser-native) → SRTP                  │
  │                                                                      │
  │ G.711 encode/decode: single lookup table per sample (sub-ms)        │
  │ Opus: use native bindings (libopus), not ffmpeg                     │
  └───────────────┬──────────────────────────────────────────────────────┘
                  │ Audio frames
                  ▼
  ┌──────────────────────────────────────────────────────────────────────┐
  │ CALLER HEARS AI RESPONSE                                            │
  │ "Fortuner ka price 28 lakh rupees hai. Kya aap test drive ke liye  │
  │  appointment book karna chahenge?"                                   │
  └──────────────────────────────────────────────────────────────────────┘
```

### 4.2 Interruption Handling (Barge-In)

```
Timeline:
  AI speaking:    [──────────TTS audio playing──────────]
  Human speaks:              [──"ruko ruko"──]
                              ▲
                              │ VAD detects speech on INPUT channel
                              │ while OUTPUT channel is active

  System response (all within ~50ms):
  1. Send STOP signal to TTS (cancel in-flight synthesis)
  2. Flush outbound audio buffer (stop sending RTP/WebRTC frames)
  3. Record how much AI audio was actually played
  4. Update conversation history with truncated assistant message
  5. Capture new human utterance → STT → LLM → new response

  Echo cancellation:
  - Problem: AI's voice leaks into caller's microphone
  - Solution: Subtract known outbound audio from inbound signal
  - Libraries: WebRTC AEC3 (built into browser), Speex AEC (server-side)
  - Fallback: Raise VAD threshold during AI playback (0.5 → 0.85)
```

### 4.3 Three Architecture Patterns

| | Classic Pipeline (STT→LLM→TTS) | Speech-to-Speech (Audio→Model→Audio) | Hybrid |
|---|---|---|---|
| **Latency** | 800-1500ms | 300-500ms | 400-800ms |
| **Tool calling** | Excellent | Limited | Good |
| **Flexibility** | Highest (swap any component) | Lowest (locked to model) | Medium |
| **Hindi quality** | Best (choose specialized STT/TTS) | Depends on model | Mix |
| **Cost** | 3 services | 1 service (but expensive) | 2 services |
| **Debugging** | Easy (inspect text at each stage) | Hard (audio-in/audio-out) | Medium |
| **Recommendation** | **Start here** | Monitor GPT-4o Realtime + Gemini Live | Future optimization |

### 4.4 Audio Formats Quick Reference

| Format | Sample Rate | Bit Depth | Use Case |
|--------|-----------|-----------|----------|
| G.711 u-law (PCMU) | 8kHz | 8-bit companded | PSTN phone calls |
| G.711 A-law (PCMA) | 8kHz | 8-bit companded | European PSTN |
| Linear PCM | 16kHz | 16-bit | STT input (Whisper, Deepgram) |
| Opus | 8-48kHz | Variable | WebRTC, modern codecs |
| WAV | Varies | 16-bit | Recording storage |

**Conversion chain:**
```
Inbound: G.711 8kHz → decompress (lookup table) → upsample to 16kHz → PCM16 → STT
Outbound: TTS output PCM 24kHz → downsample to 8kHz → compress to G.711 → RTP
```

---

## 5. WebRTC Architecture (Browser Calling — Free Channel)

```
┌───────────────────────────────────────────────────────┐
│ Customer's Browser                                     │
│                                                       │
│ widget.js injects iframe → iframe loads call page     │
│ getUserMedia({ audio: true }) → MediaStream           │
│ LiveKit JS SDK connects to LiveKit server             │
│ Publishes audio track → receives AI audio track       │
└──────────────────┬────────────────────────────────────┘
                   │ WebRTC (Opus, UDP, DTLS-SRTP)
                   │
┌──────────────────▼────────────────────────────────────┐
│ LiveKit Server (self-hosted Docker, open-source)       │
│                                                       │
│ - Selective Forwarding Unit (SFU)                     │
│ - Manages "rooms" with participants                   │
│ - Routes audio tracks between participants            │
│ - Dispatches agent workers on room creation           │
└──────────────────┬────────────────────────────────────┘
                   │ Audio frames (PCM)
                   │
┌──────────────────▼────────────────────────────────────┐
│ AI Agent Worker (Python, LiveKit Agents / Pipecat)     │
│                                                       │
│ Subscribes to caller's audio track                    │
│ → VAD (Silero) → STT → LLM + Tools → TTS             │
│ Publishes response audio track back to room           │
│                                                       │
│ Agent loads business config from DB via internal API   │
└───────────────────────────────────────────────────────┘
```

### Widget Embed Code (For Business Websites)
```html
<script
  src="https://your-domain.com/widget.js"
  data-agent-id="agent_abc123"
  data-theme="light"
  data-position="bottom-right"
  data-greeting="Talk to our AI assistant">
</script>
```

The widget creates a floating button. On click, opens an iframe that:
1. Requests microphone permission
2. Connects to LiveKit room via WebRTC
3. Spawns an AI agent for this business
4. Full voice conversation happens in-browser
5. Zero telephony cost

---

## 6. Webhook Flow (PSTN Calls)

### Outbound Call Sequence

```
Frontend                    Backend API              Voice Provider        Customer Phone
   │                            │                        │                      │
   │ POST /calls/outbound       │                        │                      │
   │ {businessId, agentId,      │                        │                      │
   │  phoneNumber, name}        │                        │                      │
   │──────────────────────────►│                        │                      │
   │                            │                        │                      │
   │                            │ Build assistant config  │                      │
   │                            │ (prompt, tools, voice) │                      │
   │                            │                        │                      │
   │                            │ provider.startOutbound()│                      │
   │                            │───────────────────────►│                      │
   │                            │                        │ DIAL ──────────────►│
   │                            │                        │                      │ RING
   │                            │                        │◄──── ANSWER ────────│
   │                            │                        │                      │
   │                            │  Webhook: status=      │                      │
   │                            │  in-progress           │                      │
   │                            │◄───────────────────────│                      │
   │                            │ Upsert call record     │                      │
   │                            │                        │                      │
   │                            │                    [AI CONVERSATION]           │
   │                            │                        │                      │
   │                            │  Webhook: tool-calls   │                      │
   │                            │  {name: search_inventory│                     │
   │                            │   args: {query: "SUV"}}│                      │
   │                            │◄───────────────────────│                      │
   │                            │                        │                      │
   │                            │ Execute tool           │                      │
   │                            │ Log to call_actions    │                      │
   │                            │                        │                      │
   │                            │ Return: {results: [...]}│                     │
   │                            │───────────────────────►│                      │
   │                            │                    [AI speaks result]          │
   │                            │                        │                      │
   │                            │  Webhook: call-ended   │                      │
   │                            │  {transcript, summary, │                      │
   │                            │   recording_url,       │                      │
   │                            │   duration}            │                      │
   │                            │◄───────────────────────│                      │
   │                            │                        │                      │
   │                            │ Update call record     │                      │
   │                            │ Archive recording      │                      │
   │                            │ Run post-call analysis │                      │
   │ { callId, status }         │                        │                      │
   │◄──────────────────────────│                        │                      │
```

### Webhook Security
1. **HMAC-SHA256 verification:** Provider signs webhook body. Backend recomputes signature. Reject if mismatch.
2. **Fail-closed:** If webhook secret is not configured, reject ALL webhooks (never default to accepting).
3. **Idempotency:** Hash `(provider_call_id + event_type + event_sequence)` → check `webhook_events` table → skip if exists.
4. **Tenant resolution:** Extract `businessId` from call metadata (set during call initiation). NEVER fall back to "first business in DB."

---

## 7. Post-Call Processing Pipeline

```
Call Ends → Webhook received
  │
  ├── Save transcript + recording URL to calls table
  │
  ├── Archive recording (async background job):
  │     Download from provider URL → upload to Cloudflare R2 / S3
  │     Update calls.recording_archived_url
  │
  ├── Generate summary (async):
  │     LLM call with transcript → 2-3 sentence summary
  │     Update calls.summary
  │
  ├── Classify sentiment (async):
  │     LLM call → positive / neutral / negative
  │     Update calls.sentiment
  │
  ├── Determine outcome:
  │     Check call_actions for: appointment_booked? escalated?
  │     Duration < 15s → dropped
  │     Otherwise → resolved
  │     Update calls.outcome
  │
  ├── Calculate cost:
  │     STT minutes × rate + LLM tokens × rate + TTS chars × rate + telephony × rate
  │     Update calls.cost_cents
  │
  └── Index transcript for search:
        Update full-text search index on calls.transcript
```

---

## 8. Conversation State Machine (Hybrid Pattern)

Instead of a single system prompt governing the entire call, the agent operates in phases:

```
┌─────────────┐     ┌──────────────┐     ┌───────────────┐
│  GREETING    │────►│ QUALIFICATION│────►│  ACTION       │
│              │     │              │     │               │
│ "Hello, I'm │     │ Understand   │     │ search_inventory│
│  from X..."  │     │ what they    │     │ book_appointment│
│              │     │ need         │     │ search_knowledge│
└──────────────┘     └──────┬───────┘     └───────┬───────┘
                            │                     │
                            │                     ▼
                            │              ┌──────────────┐
                            │              │ CONFIRMATION │
                            │              │              │
                            │              │ Verify details│
                            │              │ before action │
                            │              └──────┬───────┘
                            │                     │
                            ▼                     ▼
                     ┌──────────────┐     ┌──────────────┐
                     │ ESCALATION   │     │  CLOSING     │
                     │              │     │              │
                     │ "Let me      │     │ "Is there    │
                     │  connect..." │     │  anything    │
                     │              │     │  else?"      │
                     └──────────────┘     └──────────────┘
```

Each phase has its own focused prompt and available tools. Phase transitions are triggered by tool results or intent detection. This is more predictable than a single monolithic prompt.

---

## 9. Scaling Architecture

### Per-Call Resource Requirements
- **Webhook handler:** ~0.5 vCPU, 128MB RAM per concurrent call
- **Pipecat/LiveKit agent:** ~0.5 vCPU, 256MB RAM per concurrent call
- **External API calls:** STT, LLM, TTS are I/O-bound (no local compute)

### Scaling Strategy
```
1-10 concurrent calls:    Single VPS (4 vCPU / 8GB RAM)
10-50 concurrent calls:   2-3 VPS + load balancer
50-200 concurrent calls:  Kubernetes with HPA (auto-scaling)
200+ concurrent calls:    Multi-region with geo-routing
```

### Connection Pooling
- Supabase: PgBouncer (built-in), pool_mode=transaction
- STT WebSocket: Persistent connection per call, reuse across utterances
- LLM: HTTP/2 connection pooling, keep-alive
- TTS: Persistent WebSocket where supported
