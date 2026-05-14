---
name: status-query
description: Queries claim status from the backend and translates it into plain language for the customer
user-invocable: false
command-dispatch: false
---

When a customer asks about the status of an existing claim:

**Steps:**
1. Ask for the claim number if not already provided (format: CLM-YYYY-XXXXXX).
2. Call the `lookup_claim` tool with the `claim_id`.
3. Translate the returned status code into plain English:
   - `pending` → "Your claim has been received and is awaiting initial review."
   - `under_review` → "Your claim is currently being reviewed by our claims team."
   - `documents_required` → "We're waiting on additional documents before we can proceed."
   - `approved` → "Your claim has been approved. Payment will be processed within 3-5 business days."
   - `denied` → "Unfortunately, your claim was not approved. I can connect you with a specialist to discuss your options."
   - `closed` → "This claim has been closed. If you have questions, I can connect you with our team."
4. If the claim is not found, ask the customer to double-check their claim number. Offer to look up by phone number or policy number as alternatives.
5. For `documents_required` status, list the specific missing documents if the tool response includes them.
