import { createAlkahestEscrow, releaseAlkahestEscrow } from '../src/services/alkahest-service';

jest.mock('ethers', () => {
  const actualEthers = jest.requireActual('ethers');
  return {
    ...actualEthers,
    JsonRpcProvider: jest.fn().mockImplementation(() => ({})),
    Wallet: jest.fn().mockImplementation(() => ({})),
    Contract: jest.fn().mockImplementation(() => ({
      createEscrow: jest.fn().mockResolvedValue({ wait: jest.fn().mockResolvedValue({ hash: '0xmock_hash' }) }),
      releaseEscrow: jest.fn().mockResolvedValue({ wait: jest.fn().mockResolvedValue({ hash: '0xmock_hash_release' }) })
    }))
  };
});

describe('Alkahest Service', () => {
  const dummyAddress = '0x1234567890123456789012345678901234567890';
  const dummyKey = '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  const rpcUrl = 'http://localhost:8545';

  it('should create an escrow successfully', async () => {
    const result = await createAlkahestEscrow(dummyAddress, dummyKey, rpcUrl, dummyAddress, '1.0');
    expect(result).toHaveProperty('escrowId');
    expect(result).toHaveProperty('transactionHash');
  });

  it('should release an escrow successfully', async () => {
    const result = await releaseAlkahestEscrow(dummyAddress, dummyKey, rpcUrl, 'escrow_1234');
    expect(result.success).toBe(true);
    expect(result).toHaveProperty('transactionHash');
  });
});
