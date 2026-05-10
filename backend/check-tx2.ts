import { createPublicClient, http } from 'viem';
import { sepolia, filecoinCalibration } from 'viem/chains';

const txHash = '0x6d5eea20f75bc400cbc155eb7cba659e5815ffb5badb8e6ad84ef6b01d1e9f56';

async function checkTx() {
  const networks = [
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
