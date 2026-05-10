import { keccak256, toBytes } from 'viem';

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export interface EvidenceBundle {
  claimId?: string;
  claim_id?: string;
  claimNumber?: string;
  claim_number?: string;
  policyNumber?: string;
  policy_number?: string;
  customerId?: string;
  customer_id?: string;
  incidentDate?: string;
  incident_date?: string;
  incidentDescription?: string;
  incident_description?: string;
  documents?: string[];
  photoCids?: string[];
  filed_at?: string;
  claim_type?: string;
  call_log_id?: string;
  timestamp?: string;
  metadata?: Record<string, JsonValue>;
}

function canonicalize(value: JsonValue): JsonValue {
  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }
  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .reduce((acc, key) => {
        acc[key] = canonicalize((value as Record<string, JsonValue>)[key]);
        return acc;
      }, {} as Record<string, JsonValue>);
  }
  return value;
}

export function computeEvidenceHash(input: JsonValue): string {
  const canonical = canonicalize(input);
  const serialized = JSON.stringify(canonical);
  return keccak256(toBytes(serialized));
}

export function buildEvidenceBundle(input: EvidenceBundle): { bundle: EvidenceBundle; hash: string } {
  const hash = computeEvidenceHash(input as unknown as JsonValue);
  return { bundle: input, hash };
}
