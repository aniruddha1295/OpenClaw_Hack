---
name: escrow-creation
description: Determines escrow parameters for a claim and initiates filing
user-invocable: false
command-dispatch: false
---

When a claim is ready to be filed, determine the escrow parameters and initiate the claim filing process.

**Escrow amount:** Set equal to the `claim_amount` extracted from the transcript. If the customer mentioned a deductible, subtract it (e.g., $8,500 claim - $500 deductible = $8,000 escrow).

**Release conditions (both must be met before payout):**
1. All required documents received and verified
2. Adjuster approval obtained

**Steps:**
1. Confirm the claim amount and deductible with the customer before proceeding.
2. Summarize what will happen: "We'll hold $X in escrow pending document verification and adjuster review."
3. Call the `file_claim` tool with: customer_name, claim_type, incident_date, amount, and a brief description.
4. Confirm the claim number returned to the customer.
5. Tell the customer the next steps: upload documents via the portal, typical review timeline (3-5 business days).

Never file a claim without explicit customer confirmation of the amount and incident details.
