import { createAlkahestEscrow } from '../src/services/alkahest-service.js';
import { config } from '../config/environment.js';

async function testEscrow() {
  console.log('Testing Alkahest Escrow Creation (CLI)...');
  
  if (!config.alkahestContractAddress || !config.agentPrivateKey || !config.baseSepoliaRpcUrl) {
    console.warn('Missing environment variables for Alkahest! Falling back to mock response.');
    console.log({ success: true, escrow_id: `mock_escrow_${Date.now()}` });
    return;
  }

  try {
    const result = await createAlkahestEscrow(
      config.alkahestContractAddress,
      config.agentPrivateKey,
      config.baseSepoliaRpcUrl,
      '0x1234567890123456789012345678901234567890', // mock payee
      '10000000000000000' // 0.01 tFIL or ETH
    );
    console.log('Success!', result);
  } catch (error) {
    console.error('Escrow test failed:', error);
  }
}

testEscrow();
