# FRONTEND_TASKS.md — Ansh (Track B) — ONE-DAY SPRINT

> The project pivoted. Compressed plan: ~6 hours of focused work today. Read this top to bottom (10 min) before touching anything.

---

## The Pivot in 60 Seconds

We dropped the "B2B insurance call-center" pitch. New product: **ClaimVault — a Consumer Claims Advocate**. Alex calls insurers ON BEHALF of the policyholder, every word/photo lands on Filecoin, **the user owns the receipt** — not the insurer. Allianz/Ping An can't ship this, it's adversarial to their business — that's the moat.

**Killer demo moment:** Aniruddha edits a Postgres row → you click "Verify Integrity" → Filecoin re-fetch fails loudly in red on stage. *"Tampering is impossible."*

For full why, skim `WINNING_STRATEGY.md`. For exact spec, see `IMPLEMENTATION_PLAN.md` §1.3, §2.2, §7.

---

## What you ship today (and what we cut)

**Ships:**
- ElevenLabs cloud config (v3 voice + audio tags + multimodal + language detection)
- `CallWidget.tsx` rewrite (ConvAI embed → `@elevenlabs/client` SDK with photo upload)
- `IntegrityCheckButton.tsx` — the kill-shot button
- `FilecoinPanel.tsx` — CID + tx + PDP status pill on ClaimDetail
- "Verified on Filecoin" badge in ClaimsList
- Photo thumbnails in TranscriptViewer
- One-paragraph DEMO_SCRIPT.md rewrite (the 90-sec arc)

**Cut for today** (Aniruddha's BACKEND_TASKS also cuts these — stay aligned):
- ❌ Agent Workflow graph (keep monolith prompt)
- ❌ Dynamic variables (no `{{customer_name}}` interpolation)
- ❌ AgentIdentityCard (skip — Aniruddha hardcodes agent_id=1)
- ❌ Landing page rewrite (1389 lines — too much for today)
- ❌ RECORDING_SCRIPT.md rewrite (we go live, not pre-recorded)
- ❌ Post-call structured data display

---

## T+0 — 15-min Day 0 Sync With Aniruddha

Lock these JSON shapes and don't deviate:

```ts
// POST /api/claims/:id/verify-integrity
{
  match: boolean,
  recomputed_hash: string,    // 0x...
  stored_hash: string,         // 0x...
  filecoin_cid: string,
  retrieved_at: string         // ISO
}

// Claim type — add to frontend/src/types/index.ts
{
  filecoin_cid?: string,
  attestation_tx_hash?: string,
  pdp_proof_status?: 'pending' | 'verified' | 'failed'
}
```

Confirm Aniruddha invited you to the **ElevenLabs workspace** (you can't do Hour 1 without it).

---

## Hour 1 — ElevenLabs Cloud Config (no code, all dashboard)

Open elevenlabs.io → ClaimsBot agent. In order:

- [ ] **Voice tab:** swap to **Eleven v3** Rachel Conversational
- [ ] **System Prompt:** confirm name is "Alex" (not "Ansh" — there's drift in old docs). Append:
  > "Use [concerned] for empathy, [reassuring] for next steps, [serious] for compliance language, [sigh] for bad news transitions."
- [ ] **Conversation Config tab:** toggle `file_input` **ON** (this enables multimodal photo upload)
- [ ] **Tools → System Tools:** enable `language_detection`, `transfer_to_agent`, `end_call` (last one already on)
- [ ] **Click Publish**

Skip: Agent Workflow graph, Dynamic Variables, post-call analysis fields. We're cutting those.

---

## Hour 2 — Start CallWidget Rewrite

The ConvAI embed has no multimodal API. We migrate to `@elevenlabs/client` SDK (already installed at `frontend/package.json:13`, currently unused).

Read first: `frontend/src/components/CallWidget.tsx` (~17 lines today) and `frontend/index.html:8` (has the script tag you'll remove).

Replace `frontend/src/components/CallWidget.tsx` with:

```tsx
import { useRef, useState } from 'react';
import { Conversation } from '@elevenlabs/client';
import { Mic, Paperclip, Phone, PhoneOff } from 'lucide-react';

export default function CallWidget() {
  const conversationRef = useRef<Awaited<ReturnType<typeof Conversation.startSession>> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected'>('idle');

  const start = async () => {
    setStatus('connecting');
    try {
      const conv = await Conversation.startSession({
        agentId: import.meta.env.VITE_ELEVENLABS_AGENT_ID,
        onConnect: () => setStatus('connected'),
        onDisconnect: () => setStatus('idle'),
        onMessage: (m) => console.log('msg:', m),
        onError: (e) => console.error('elevenlabs error', e),
      });
      conversationRef.current = conv;
    } catch (e) {
      console.error(e);
      setStatus('idle');
    }
  };

  const end = async () => {
    await conversationRef.current?.endSession();
    setStatus('idle');
  };

  const upload = async (file: File) => {
    const conv = conversationRef.current;
    if (!conv) return;
    // sendMultimodalMessage on @elevenlabs/client v1.2+
    await (conv as any).sendMultimodalMessage?.({
      text: 'Here is a photo of the damage.',
      images: [file],
    });
  };

  return (
    <div className="fixed bottom-6 right-6 flex items-center gap-2 bg-white rounded-full shadow-lg border border-gray-200 px-4 py-3">
      {status === 'idle' && (
        <button onClick={start} className="flex items-center gap-2 text-sm font-medium text-indigo-700 hover:text-indigo-900">
          <Phone className="w-4 h-4" /> Talk to Alex
        </button>
      )}
      {status === 'connecting' && <span className="text-sm text-gray-500">Connecting…</span>}
      {status === 'connected' && (
        <>
          <span className="flex items-center gap-1 text-sm text-emerald-700"><Mic className="w-4 h-4 animate-pulse" /> Live</span>
          <button onClick={() => fileInputRef.current?.click()} className="text-gray-600 hover:text-indigo-700" title="Upload photo">
            <Paperclip className="w-4 h-4" />
          </button>
          <button onClick={end} className="text-red-600 hover:text-red-800"><PhoneOff className="w-4 h-4" /></button>
          <input
            ref={fileInputRef} type="file" accept="image/*" hidden
            onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
          />
        </>
      )}
    </div>
  );
}
```

- [ ] Remove `<script src="https://unpkg.com/@elevenlabs/convai-widget-embed">` from `frontend/index.html:8`
- [ ] Confirm `frontend/.env` has `VITE_ELEVENLABS_AGENT_ID=agent_5401kpbf2fjzf3z9jcqsdm7cdx2x` (or whatever the real one is); remove the hardcoded fallback `agent_7501...` if it's still in CallWidget
- [ ] `npm run dev`, click "Talk to Alex", have a real conversation, upload a photo from your phone. Watch DevTools console for the message. **The agent should acknowledge the photo.**

If multimodal doesn't work, check that step 3 of Hour 1 (`file_input` ON) was published.

---

## Hour 3 — Components (Build Against Mocks)

Aniruddha's endpoint is still being built. Mock it now.

Add to `frontend/src/lib/api.ts`:
```ts
// MOCK — delete when Aniruddha hands off ~Hour 5
export async function verifyIntegrity(claimId: string) {
  await new Promise(r => setTimeout(r, 1500));
  // Toggle TAMPERED with a query param while building:
  const tampered = new URLSearchParams(location.search).has('tamper');
  return {
    match: !tampered,
    recomputed_hash: '0xabc123...',
    stored_hash: tampered ? '0xdef456...' : '0xabc123...',
    filecoin_cid: 'bafybeih7zsabc...',
    retrieved_at: new Date().toISOString(),
  };
}
```

Create `frontend/src/components/IntegrityCheckButton.tsx`:
```tsx
import { useState } from 'react';
import { Loader2, ShieldCheck, ShieldAlert } from 'lucide-react';
import { verifyIntegrity } from '../lib/api';

export function IntegrityCheckButton({ claimId }: { claimId: string }) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<'verified' | 'tampered' | null>(null);

  const onClick = async () => {
    setBusy(true); setResult(null);
    try {
      const r = await verifyIntegrity(claimId);
      setResult(r.match ? 'verified' : 'tampered');
    } catch { setResult('tampered'); }
    finally { setBusy(false); }
  };

  return (
    <div className="flex items-center gap-3">
      <button onClick={onClick} disabled={busy}
        className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
        {busy ? 'Re-fetching from Filecoin…' : 'Verify Integrity'}
      </button>
      {result === 'verified' && (
        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold animate-pulse">✓ VERIFIED</span>
      )}
      {result === 'tampered' && (
        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-bold animate-pulse flex items-center gap-1">
          <ShieldAlert className="w-4 h-4" /> TAMPERED
        </span>
      )}
    </div>
  );
}
```

Create `frontend/src/components/FilecoinPanel.tsx`:
```tsx
import { Database } from 'lucide-react';
import type { Claim } from '../types';

export function FilecoinPanel({ claim }: { claim: Claim }) {
  if (!claim.filecoin_cid) return null;
  const filfox = `${import.meta.env.VITE_FILFOX_BASE_URL}/${claim.filecoin_cid}`;
  const basescan = `${import.meta.env.VITE_BASESCAN_BASE_URL}/tx/${claim.attestation_tx_hash}`;
  const pdpClass = claim.pdp_proof_status === 'verified' ? 'bg-green-100 text-green-700'
                 : claim.pdp_proof_status === 'failed' ? 'bg-red-100 text-red-700'
                 : 'bg-yellow-100 text-yellow-700';
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Database className="w-5 h-5 text-indigo-500" /> Filecoin Attestation
      </h2>
      <dl className="space-y-2 text-sm">
        <div>
          <dt className="text-xs text-gray-500">CID</dt>
          <dd className="font-mono text-xs break-all">
            <a href={filfox} target="_blank" rel="noopener" className="text-blue-600 hover:underline">{claim.filecoin_cid}</a>
          </dd>
        </div>
        {claim.attestation_tx_hash && (
          <div>
            <dt className="text-xs text-gray-500">On-chain attestation</dt>
            <dd>
              <a href={basescan} target="_blank" rel="noopener" className="text-blue-600 hover:underline font-mono text-xs">
                {claim.attestation_tx_hash.slice(0, 10)}…
              </a>
            </dd>
          </div>
        )}
        <div>
          <dt className="text-xs text-gray-500">PDP Proof</dt>
          <dd><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${pdpClass}`}>
            {claim.pdp_proof_status || 'pending'}
          </span></dd>
        </div>
      </dl>
    </div>
  );
}
```

---

## Hour 4 — Insertions Into Existing Pages

Update `frontend/src/types/index.ts` — add to `Claim`:
```ts
filecoin_cid?: string;
attestation_tx_hash?: string;
pdp_proof_status?: 'pending' | 'verified' | 'failed';
```

`frontend/src/pages/ClaimsList.tsx` line ~100 — beside `<ClaimStatusBadge>`:
```tsx
{claim.filecoin_cid && (
  <a href={`${import.meta.env.VITE_FILFOX_BASE_URL}/${claim.filecoin_cid}`}
     target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
     className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
    <ShieldCheck className="w-3 h-3" /> Verified on Filecoin
  </a>
)}
```
Import `ShieldCheck` from `lucide-react`.

`frontend/src/pages/ClaimDetail.tsx`:
- Line ~54 (next to status badge): add `<IntegrityCheckButton claimId={id!} />`
- Line ~185 (sidebar, before Related Calls): add `<FilecoinPanel claim={claim} />`
- Imports at top: `import { IntegrityCheckButton } from '../components/IntegrityCheckButton';` and `import { FilecoinPanel } from '../components/FilecoinPanel';`

`frontend/src/components/TranscriptViewer.tsx`:
- Extend `TranscriptEntry` type (lines 4-8) with `image_url?: string;`
- Around line 59, before the message bubble, render:
```tsx
{entry.image_url && !isAgent && (
  <img src={entry.image_url} alt="caller upload"
    className="mb-1 rounded-lg max-w-[200px] max-h-[200px] object-cover border border-gray-200 shadow-sm" />
)}
```
- In `LiveCallView.tsx` `mockTranscript`, give one user message an `image_url` from a placeholder (Unsplash or Picsum) so the demo has a thumbnail visible.

---

## Hour 5 — Swap Mocks for Real

🔔 **Wait for Aniruddha's Slack:** "verify-integrity is live."

Then in `frontend/src/lib/api.ts`, replace the mock:
```ts
import axios from 'axios';
export async function verifyIntegrity(claimId: string) {
  const r = await axios.post(`${import.meta.env.VITE_API_URL}/api/claims/${claimId}/verify-integrity`);
  return r.data;
}
```

Add to `frontend/.env` (Aniruddha sends these in Slack):
```
VITE_CLAIM_REGISTRY_ADDRESS=0x...
VITE_FILFOX_BASE_URL=https://calibration.filfox.info/en
VITE_BASESCAN_BASE_URL=https://sepolia.basescan.org
```

Test:
- File a real claim through ElevenLabs
- Watch ClaimsList — "Verified on Filecoin" badge should appear within ~5s
- Click into ClaimDetail — FilecoinPanel shows real CID + tx hash
- Click "Verify Integrity" — should be ✓ VERIFIED
- Aniruddha edits the Postgres row in Supabase Studio
- Click again — ✗ TAMPERED in red ← **THE KILL SHOT**

If TAMPERED doesn't fire when it should, sync with Aniruddha — usually the canonical bundle field order between his hash function and the integrity endpoint differs.

---

## Hour 6 — Demo Script + Rehearse

Rewrite `DEMO_SCRIPT.md` (just the 90-second arc, full table from `WINNING_STRATEGY.md` §7):

```markdown
# DEMO_SCRIPT.md

## 90-Second Arc

| Time | Beat |
|---|---|
| 0–10s | Cold open — 5s of an angry policyholder recording. *"This call happened 12,000 times in China yesterday."* |
| 10–25s | "Insurers control the recording, transcript, decision. The policyholder has no receipt. Complaints up 368%." |
| 25–40s | "On July 15, China's Anthropomorphic AI rule requires complaint channels for financial AI. We built the consumer side." |
| 40–70s | LIVE: Caller speaks Mandarin → agent auto-switches → texts damage photo → agent says with [sympathetic] tag "I can see the rear bumper..." → files claim → dashboard shows CID landing → Filfox link opens → PDP "pending" badge |
| 70–85s | Demo-er edits Postgres claim amount → clicks "Verify integrity" → integrity FAILS in red. *"Tampering is impossible. The user owns the truth."* |
| 85–90s | Ask. |

## The Moat Sentence
"Allianz can't build the consumer-side advocate. We're not replacing their call center — we're the agent that calls them on the user's behalf, records to Filecoin with a CID the user owns, and escalates to the regulator automatically. An incumbent literally cannot ship this — it's adversarial to their business."
```

Then **rehearse the 90 seconds with a stopwatch — at least 5 times.** Time gets longer than you think.

---

## Hours 7-8 — Demo Polish

- [ ] Record a 60-second flawless run as MP4. Cue it in a second browser tab on the demo laptop.
- [ ] Test on a second network (mobile hotspot) so you have a backup if venue WiFi dies.
- [ ] Pre-fill 2-3 demo claims with Aniruddha so dashboard isn't empty on stage.
- [ ] If anything breaks during the 90s, cut to the recorded video without apologizing.

---

## When Things Break

| Problem | Fix |
|---|---|
| `Conversation.startSession` errors | `VITE_ELEVENLABS_AGENT_ID` not set, OR agent isn't published in dashboard, OR @elevenlabs/client version too old (need v1.2+) |
| Multimodal photo not received | `file_input` not toggled ON in Conversation Config — most common gotcha |
| Verify returns "tampered" when it shouldn't | Ping Aniruddha — bundle field order differs |
| ConvAI orb still appearing | You forgot to remove the `<script>` from `index.html:8` |
| ElevenLabs cloud changes don't apply | Forgot to click Publish |
| Tailwind classes not rendering on new components | Restart `npm run dev` (Vite HMR sometimes misses) |
| `sendMultimodalMessage is not a function` | The `@elevenlabs/client` v1.2.1 might not expose it; bump to latest: `npm install @elevenlabs/client@latest` |

---

## What you do NOT touch today

- `backend/`, `contracts/`, smart contracts, Solidity, Filecoin SDK
- `landing/index.html` (1389 lines — too much for today)
- ERC-8004 NFT registration / agent identity
- Dynamic variables / conversation-init endpoint
- Agent Workflow graph in ElevenLabs
- AgentIdentityCard component
- RECORDING_SCRIPT.md
- All other PRD/strategy docs

If you finish all this with time to spare, ping Aniruddha and ask what's the next-highest-value thing — usually it'll be: pre-fill more demo data, or polish landing page hero only (not full rewrite), or rehearse one more time.
