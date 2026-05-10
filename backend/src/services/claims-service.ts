import { SupabaseClient } from '@supabase/supabase-js';

export async function lookupClaim(
  supabase: SupabaseClient,
  claimNumber: string
) {
  claimNumber = claimNumber.trim();

  const { data: claim, error } = await supabase
    .from('claims')
    .select('*, customers!inner(full_name)')
    .eq('claim_number', claimNumber)
    .single();

  if (error || !claim) {
    return { found: false };
  }

  const customer_name = (claim.customers as any)?.full_name || 'Unknown';

  return {
    found: true,
    claim: {
      claim_number: claim.claim_number,
      status: claim.status,
      claim_type: claim.claim_type,
      incident_date: claim.incident_date,
      incident_description: claim.incident_description,
      claimed_amount: claim.claimed_amount,
      assigned_adjuster: claim.assigned_adjuster,
      documents_required: claim.documents_required,
      documents_received: claim.documents_received,
      customer_name,
    },
  };
}

export async function checkDocuments(
  supabase: SupabaseClient,
  claimNumber: string
) {
  claimNumber = claimNumber.trim();

  const { data: claim, error } = await supabase
    .from('claims')
    .select('claim_number, documents_required, documents_received')
    .eq('claim_number', claimNumber)
    .single();

  if (error || !claim) {
    return { found: false, message: "I couldn't find a claim with that number." };
  }

  const required: string[] = claim.documents_required || [];
  const received: string[] = claim.documents_received || [];
  const missing = required.filter((d: string) => !received.includes(d));

  const humanize = (doc: string) => doc.replace(/_/g, ' ');

  let message: string;
  if (missing.length === 0) {
    message = `All required documents have been received for claim ${claim.claim_number}.`;
  } else {
    const humanizedList = missing.map(humanize).join(' and ');
    message = `You still need to submit the following for claim ${claim.claim_number}: ${humanizedList}.`;
  }

  return {
    found: true,
    claim_number: claim.claim_number,
    documents_required: required,
    documents_received: received,
    documents_missing: missing,
    message,
  };
}

function getDefaultDocuments(claimType: string): string[] {
  const defaults: Record<string, string[]> = {
    collision: ['police_report', 'repair_estimate', 'photos', 'other_driver_info'],
    windshield: ['photos', 'repair_estimate'],
    theft: ['police_report', 'proof_of_purchase', 'photos'],
    water_damage: ['plumber_invoice', 'damage_photos', 'contractor_estimate'],
    fire_damage: ['fire_dept_report', 'contractor_estimates', 'photos'],
    medical: ['medical_records', 'itemized_bill', 'referral_letter'],
    comprehensive: ['photos', 'repair_estimate', 'incident_report'],
  };
  return defaults[claimType] || ['photos', 'incident_report'];
}

export async function fileClaim(
  supabase: SupabaseClient,
  data: {
    policy_number: string;
    claim_type: string;
    incident_date: string;
    incident_description: string;
  }
) {
  // Default claim_type to 'general' if empty/missing
  const claimType = data.claim_type?.trim() || 'general';

  // Default incident_date to today if empty/missing
  const incidentDate = data.incident_date?.trim() || new Date().toISOString().split('T')[0];

  // Trim incident_description to avoid whitespace-only strings
  const incidentDescription = (data.incident_description || '').trim();

  const { data: policy, error: policyError } = await supabase
    .from('policies')
    .select('id, customer_id, status')
    .eq('policy_number', data.policy_number)
    .single();

  if (!policy || policyError) {
    return { success: false, message: 'I could not find a policy with that number.' };
  }

  if (policy.status !== 'active') {
    return {
      success: false,
      message: 'That policy is not currently active, so a new claim cannot be filed.',
    };
  }

  const year = new Date().getFullYear();
  const seq = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
  const claimNumber = `CLM-${year}-${seq}`;

  const { data: claim, error } = await supabase
    .from('claims')
    .insert({
      claim_number: claimNumber,
      policy_id: policy.id,
      customer_id: policy.customer_id,
      claim_type: claimType,
      status: 'submitted',
      incident_date: incidentDate,
      incident_description: incidentDescription,
      documents_required: getDefaultDocuments(claimType),
      documents_received: [],
    })
    .select()
    .single();

  if (error) {
    return { success: false, message: 'There was an issue filing your claim. Please try again.' };
  }

  return {
    success: true,
    claim_id: claim.id,
    claim_number: claimNumber,
    status: 'submitted',
    message: `Your claim has been filed successfully. Your claim number is ${claimNumber}. An adjuster will be assigned within 24 to 48 hours.`,
    next_steps: [
      'Upload photos of the damage',
      'Get a repair or cost estimate',
      'Keep all related receipts and documents',
    ],
  };
}
