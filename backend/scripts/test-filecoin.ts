import { uploadClaimBundle } from '../src/services/filecoin-service.js';

async function testFilecoinUpload() {
  console.log('Testing Filecoin Synapse SDK Upload (CLI)...');

  const claimId = 'claim_' + Date.now();
  const mockEvidence = [
    { name: 'photo.jpg', type: 'image/jpeg', size: 1024, base64Data: 'mock_base64' }
  ];
  
  try {
    const result = await uploadClaimBundle(claimId, 'This is a mock transcript', mockEvidence);
    console.log('Upload Result:', result);
  } catch (error) {
    console.error('Filecoin upload failed:', error);
  }
}

testFilecoinUpload();
