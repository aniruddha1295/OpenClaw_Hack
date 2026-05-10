import { getContract, type Address, type Hash, type PublicClient, type WalletClient } from 'viem';
import ClaimRegistryAbi from '../abis/ClaimRegistry.json';

export async function attestClaim(
  publicClient: PublicClient,
  walletClient: WalletClient,
  claimRegistryAddress: Address,
  account: Address,
  filecoinCid: string
): Promise<Hash> {
  const contract = getContract({
    address: claimRegistryAddress,
    abi: ClaimRegistryAbi.abi,
    client: { public: publicClient, wallet: walletClient },
  });

  const hash = await contract.write.fileClaim([filecoinCid], { account });
  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}
