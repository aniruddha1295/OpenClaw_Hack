---
name: claim-analysis
description: Analyzes insurance call transcripts to extract structured claim data
user-invocable: false
command-dispatch: false
---

When analyzing an insurance call transcript, extract the following fields and output them as structured JSON:

- **claim_type**: One of `auto`, `home`, `health`, or `life`. Infer from context (e.g., "car accident" → auto, "roof damage" → home).
- **incident_date**: The date of the incident in ISO format (YYYY-MM-DD). If the customer says "last Tuesday" or similar, resolve to an absolute date.
- **claim_amount**: The monetary amount mentioned (e.g., "$8,500" → 8500). If a range is given, use the midpoint.
- **policy_number**: Any policy or contract number mentioned by the customer. May be null if not provided.
- **customer_intent**: A brief 1-sentence summary of what the customer wants (e.g., "File a new auto claim for collision damage").
- **confidence**: A value between 0 and 1 representing your confidence in the extracted data.

If any required field cannot be determined from the transcript, set it to `null` and note it in a `missing_fields` array.

Output format:
```json
{
  "claim_type": "auto",
  "incident_date": "2026-05-10",
  "claim_amount": 8500,
  "policy_number": null,
  "customer_intent": "File a new auto claim for collision damage worth $8,500",
  "confidence": 0.92,
  "missing_fields": ["policy_number"]
}
```
