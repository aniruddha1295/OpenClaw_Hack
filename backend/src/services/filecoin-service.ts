// Synapse SDK uses storage.upload() — wraps the real API
export async function uploadClaimBundle(
  synapse: any,
  bundle: unknown
): Promise<{ rootCid: string; pieceCid?: string; datasetId?: string }> {
  if (!synapse) {
    throw new Error('Filecoin Synapse client not initialized. Set AGENT_PRIVATE_KEY.');
  }

  // Serialize the bundle to JSON bytes
  const data = new TextEncoder().encode(JSON.stringify(bundle));

  // Use the real Synapse SDK storage.upload() API
  const result = await synapse.storage.upload(data);

  return {
    rootCid: result.rootCid ?? result.cid ?? result.toString(),
    pieceCid: result.pieceCid ?? undefined,
    datasetId: result.datasetId ?? undefined,
  };
}
