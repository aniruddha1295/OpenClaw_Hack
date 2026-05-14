# ClaimsAgent — Recording Script

> **Total runtime:** ~3.5 minutes
> **Format:** Screen recording with voice-over + live AI conversation
> **Goal:** Show all 6 AI tools firing in one natural phone call

---

## 🎬 SHOT 1 — OPENING (20 seconds)

**[Screen: show ClaimsList page with Arjun Mehta at the top]**

> **NARRATOR (you, voice-over):**
>
> *"This is ClaimsAgent. An AI voice agent for insurance claims."*
>
> *"Meet Arjun Mehta. Rear-ended at a red light eleven days ago. His claim is stuck — he hasn't sent the paperwork in yet. And last night? A pipe burst in his bathroom. Water everywhere."*
>
> *"One phone call. Watch what happens."*

---

## 🎬 SHOT 2 — START THE CALL (5 seconds)

**[Click the phone button → Allow microphone → Widget says "Connecting"]**

> **NARRATOR:** *"Arjun picks up the phone."*

---

## 🎬 SHOT 3 — THE CONVERSATION (2 minutes 30 seconds)

> **💡 SPEAK NATURALLY. The important thing is the bolded trigger phrases.**

---

### Part 1 — Check existing claim [~30 seconds]

**AI (Ansh):** *"Hi, this is Ansh from SafeGuard Insurance claims. How can I help you today?"*

**YOU (as Arjun):**
> *"Hi Ansh, this is Arjun Mehta. I want to check on my auto claim."*

**AI:** *"Of course, Mr. Mehta. Could you give me the claim number?"*

**YOU:**
> ***"CLM-2026-000456"***

**[🔥 Tool fires on dashboard: `lookup_claim`]**
**[Narrator soft voice-over:]** *"Tool one — lookup_claim. Pulls his entire claim history in real time."*

**AI:** *"Got it — your collision claim from April 10th is under review with Neha Agarwal. We're still waiting on a few documents from you..."*

---

### Part 2 — Check missing documents [~20 seconds]

**YOU:**
> *"Yeah, what am I still missing?"*

**[🔥 Tool fires: `check_documents`]**
**[Narrator:]** *"Tool two — check_documents. Instantly identifies exactly what's blocking the claim."*

**AI:** *"We still need your repair estimate and photos of the damage. Once those come in, Neha can move the claim forward."*

---

### Part 3 — Emotional pivot to new problem [~15 seconds]

**YOU (slightly stressed tone):**
> *"Alright, I'll get those this week. Actually, Ansh, there's another problem. Last night a pipe burst in my bathroom. Water damage everywhere — the ceiling, the hardwood floors. I don't know what to do."*

**AI:** *"I'm really sorry to hear that — that sounds stressful. Let me check your home policy. What's the policy number?"*

---

### Part 4 — Check home policy coverage [~20 seconds]

**YOU:**
> ***"POL-2024-005678"***

**[🔥 Tool fires: `check_policy`]**
**[Narrator:]** *"Tool three — check_policy. Verifies coverage, deductible, and limits before filing anything."*

**AI:** *"Good news — water damage is covered. You have $450,000 in dwelling coverage with a $2,500 deductible. Let me file this claim for you right now."*

---

### Part 5 — File a brand new claim [~40 seconds]

**AI:** *"Can you describe what happened?"*

**YOU:**
> *"A pipe burst in the upstairs bathroom around 11 PM. Water came through the ceiling into my living room. The hardwood floors are warped. An emergency plumber stopped the leak."*

**[🔥 Tool fires: `file_claim`]**
**[Narrator, excited:]** *"Tool four — file_claim. And watch this — on the dashboard, a brand new claim just appeared. In real-time. No forms. No email. No waiting."*

**[POINT AT DASHBOARD — show the new claim at the top of the list]**

**AI:** *"Alright, I've filed your claim. Your new claim number is CLM-2026-XXXXXX. An adjuster will be assigned within 24 to 48 hours."*

---

### Part 6 — Escalate to human [~20 seconds]

**YOU:**
> *"Ansh, this is a lot. Two claims at once, and I'm overwhelmed. Can I talk to someone senior who can look at everything together?"*

**[🔥 Tool fires: `escalate_to_human`]**
**[Narrator:]** *"Tool five — escalate_to_human. Seamless handoff when the AI knows it's out of its depth."*

**AI:** *"Absolutely. I'm escalating this with high priority — a senior specialist will contact you within 2 hours."*

---

### Part 7 — Schedule a callback [~20 seconds]

**YOU:**
> *"Actually, tomorrow morning would be better. Can someone call me at 10 AM?"*

**AI:** *"Of course. What number should they call?"*

**YOU:**
> *"+1 415-555-0101"*

**[🔥 Tool fires: `schedule_callback`]**
**[Narrator:]** *"Tool six — schedule_callback. Books the follow-up directly into the system."*

**AI:** *"Done. Callback scheduled for tomorrow at 10 AM. Is there anything else, Mr. Mehta?"*

**YOU:**
> *"No, that's everything. Thanks Ansh."*

**AI:** *"You're welcome. Take care."*

**[End call]**

---

## 🎬 SHOT 4 — THE CLOSE (30 seconds)

**[Switch to Analytics tab — show the stats]**

> **NARRATOR:**
>
> *"In one phone call, Arjun checked a claim, found out what documents were missing, verified his home coverage, filed a brand new claim, escalated to a human, and scheduled a callback."*
>
> *"Three minutes. Six automated actions. Zero hold music."*

**[Switch to Claims tab — point at new claim]**

> *"Every call is logged. Every tool is tracked. Every decision is transparent."*

**[Pause 2 seconds]**

> *"China's insurance call center industry costs $78 billion every year. Ping An already cut 118,000 jobs with AI."*
>
> *"We go further — not just replacing agents, but giving customers an AI that actually fights for them."*

**[Logo / product name on screen]**

> *"This is ClaimsAgent. Built on ElevenLabs. Ready to deploy."*

**[End]**

---

## 📋 Quick Reference — Trigger Phrases

| Tool | Phrase you must say |
|------|---------------------|
| lookup_claim | *"my auto claim... CLM-2026-000456"* |
| check_documents | *"what am I missing?"* |
| check_policy | *"POL-2024-005678"* |
| file_claim | *"pipe burst... upstairs bathroom... water damage"* |
| escalate_to_human | *"talk to someone senior"* |
| schedule_callback | *"call me tomorrow at 10 AM... 415-555-0101"* |

---

## 🎙️ Delivery Notes

- **Speak slowly during the call** — AI needs clear audio to process
- **Leave 1-second pauses** between the AI's response and your next line
- **Sound a little stressed** during the pipe burst part — it's emotional
- **For narration** — more energetic, confident, pitchy
- **For the call** — casual, like a real customer. Not formal.

---

## 🎥 Alternative Super-Short Version (90 seconds)

If you need a punchier cut for social media:

1. Skip Part 2 (check_documents) — cut straight from lookup to pivot
2. Skip Part 7 (schedule_callback) — end after escalation
3. Shorter narration — just "Watch Arjun solve two insurance problems in one call"
4. Shows 4 tools instead of 6, but hits harder on the value prop

Use this for Twitter/LinkedIn. Keep the 3.5-min version for judges.
