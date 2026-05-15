---
name: human-handoff
description: Decides when to escalate a call to a human agent and executes the handoff
user-invocable: false
command-dispatch: false
---

Escalate to a human agent immediately in any of the following situations:

**Mandatory escalation triggers:**
- Customer explicitly requests to speak with a human
- Claim amount exceeds $50,000
- Fraud indicators present (inconsistent story, multiple recent claims, suspicious timing)
- Two or more tool calls have failed in this session
- Complex multi-party liability (e.g., multiple vehicles, third-party injury)
- Customer appears distressed, confused, or unable to continue the call

**How to escalate:**
1. Acknowledge the customer: "I'm going to connect you with one of our specialists who can better assist you."
2. Call the `escalate_to_human` tool with:
   - `reason`: A brief description of why escalation is needed
   - `priority`: `urgent` (distress, fraud) or `normal` (customer request, complexity)
   - `call_log_id`: The current session/call ID if available
3. Inform the customer of the estimated wait time if provided by the tool response.
4. Do NOT attempt to continue handling the claim after escalation is initiated.
