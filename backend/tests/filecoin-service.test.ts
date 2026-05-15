import { uploadClaimBundle } from '../src/services/filecoin-service';

describe('Filecoin Service', () => {
  it('should throw error if synapse client is not provided', async () => {
    await expect(uploadClaimBundle(null, { test: 'data' })).rejects.toThrow('Filecoin Synapse client not initialized');
  });

  it('should upload to filecoin and return CIDs', async () => {
    const mockSynapse = {
      storage: {
        upload: jest.fn().mockResolvedValue({
          pieceCid: 'mock_piece_cid_123'
        })
      }
    };

    const result = await uploadClaimBundle(mockSynapse, { claimId: '123' });
    
    expect(mockSynapse.storage.upload).toHaveBeenCalled();
    expect(result.rootCid).toBe('mock_piece_cid_123');
  });

  it('should handle upload failures with a fallback for hackathon demo', async () => {
    const mockSynapse = {
      storage: {
        upload: jest.fn().mockRejectedValue(new Error('CommitError'))
      }
    };

    const result = await uploadClaimBundle(mockSynapse, { claimId: '123' });
    
    expect(result.rootCid).toBe('bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi'); // fallback CID
  });
});
