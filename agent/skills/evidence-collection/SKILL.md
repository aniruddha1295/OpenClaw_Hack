---
name: evidence-collection
description: Identifies evidence documents mentioned in a call transcript and flags missing required documents
user-invocable: false
command-dispatch: false
---

When reviewing a call transcript, identify all evidence documents the customer has mentioned or offered to provide.

**Required documents by claim type:**
- **auto**: Police report, photos of damage, repair estimate, driver's license copy
- **home**: Photos of damage, contractor estimate, proof of ownership, weather report (if applicable)
- **health**: Medical records, doctor's note, itemized bill, insurance EOB
- **life**: Death certificate, policy document, beneficiary ID

**Steps:**
1. List all documents the customer mentioned having (e.g., "I have photos", "I filed a police report").
2. Compare against the required documents for the identified claim type.
3. Flag any required documents that were NOT mentioned as `missing`.
4. Call the `check_documents` tool with the claim number to verify what the system already has on file.
5. Report the final list: documents confirmed, documents missing, and recommended next steps.

Be specific — if a customer says "I have pictures", record that as "photos of damage (customer confirmed)".
