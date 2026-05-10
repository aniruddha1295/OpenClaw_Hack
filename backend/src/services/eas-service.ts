import { JsonRpcProvider, Wallet } from 'ethers';
import { type Address, type Hash } from 'viem';

export interface EasAttestationInput {
  recipient: Address;
  schema: string;
  schemaUid: Hash;
  data: Array<{ name: string; type: string; value: unknown }>;
}

type EasSdk = {
  EAS: new (address: string) => any;
  SchemaEncoder: new (schema: string) => {
    encodeData: (items: Array<{ name: string; type: string; value: unknown }>) => string;
  };
};

let cachedSdk: EasSdk | null = null;

export async function loadEasSdk(): Promise<EasSdk | null> {
  if (cachedSdk) return cachedSdk;
  try {
    const mod: any = await import('@ethereum-attestation-service/eas-sdk');
    const EAS = mod.EAS || mod.default?.EAS;
    const SchemaEncoder = mod.SchemaEncoder || mod.default?.SchemaEncoder;
    if (!EAS || !SchemaEncoder) return null;
    cachedSdk = { EAS, SchemaEncoder };
    return cachedSdk;
  } catch {
    return null;
  }
}

export function isEasSdkAvailable(): boolean {
  return cachedSdk !== null;
}

export async function createEasClient(contractAddress: Address): Promise<any> {
  const sdk = await loadEasSdk();
  if (!sdk) {
    throw new Error('EAS SDK not available');
  }
  return new sdk.EAS(contractAddress);
}

export function createEasSigner(privateKey: string, rpcUrl: string) {
  const provider = new JsonRpcProvider(rpcUrl);
  return new Wallet(privateKey, provider);
}

export async function issueAttestation(
  eas: any,
  signer: any,
  input: EasAttestationInput
): Promise<Hash> {
  const sdk = await loadEasSdk();
  if (!sdk) {
    throw new Error('EAS SDK not available');
  }

  eas.connect(signer);

  const encoder = new sdk.SchemaEncoder(input.schema);
  const encodedData = encoder.encodeData(input.data);

  const tx = await eas.attest({
    schema: input.schemaUid,
    data: {
      recipient: input.recipient,
      expirationTime: 0n,
      revocable: true,
      data: encodedData,
    },
  });

  return tx.wait();
}
