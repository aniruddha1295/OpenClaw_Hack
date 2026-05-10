export interface SynapseClient {
  uploadClaimBundle: (bundle: unknown) => Promise<{ rootCid: string; pieceCid?: string; datasetId?: string }>;
  downloadBundle: (rootCid: string) => Promise<unknown>;
}

export async function uploadClaimBundle(
  synapse: SynapseClient,
  bundle: unknown
): Promise<{ rootCid: string; pieceCid?: string; datasetId?: string }> {
  return synapse.uploadClaimBundle(bundle);
}

export async function downloadBundle(
  synapse: SynapseClient,
  rootCid: string
): Promise<unknown> {
  return synapse.downloadBundle(rootCid);
}
