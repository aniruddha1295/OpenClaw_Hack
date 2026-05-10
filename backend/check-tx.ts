import { createPublicClient, http } from 'viem';
import { baseSepolia, base, mainnet, sepolia, filecoinCalibration } from 'viem/chains';

const txHash = '0x6d5eea20f75bc400cbc155eb7cba659e5815ffb5badb8e6ad84ef6b01d1e9f56';

async function checkTx() {
  const networks = [
    { name: 'Base Sepolia', client: createPublicClient({ chain: baseSepolia, transport: http() }) },
    { name: 'Base Mainnet', client: createPublicClient({ chain: base, transport: http() }) },
    { name: 'Ethereum Mainnet', client: createPublicClient({ chain: mainnet, transport: http() }) },
    { name: 'Ethereum Sepolia', client: createPublicClient({ chain: sepolia, transport: http() }) },
    { name: 'Filecoin Calibration', client: createPublicClient({ chain: filecoinCalibration, transport: http() }) }
  ];

  for (const net of networks) {
    try {
      console.log(`Checking ${net.name}...`);
      const tx = await net.client.getTransaction({ hash: txHash as `0x${string}` });
      if (tx) {
        console.log(`\nFOUND ON: ${net.name}`);
        console.log(`From: ${tx.from}`);
        console.log(`To: ${tx.to}`);
        console.log(`Value: ${tx.value.toString()} wei`);
        return;
      }
    } catch (e) {
      console.log(`Not found on ${net.name}`);
    }
  }
}

checkTx();
