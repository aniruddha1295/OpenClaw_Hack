import { ethers } from "hardhat";

async function main() {
  console.log("Starting deployment...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy ClaimRegistry
  const ClaimRegistry = await ethers.getContractFactory("ClaimRegistry");
  const claimRegistry = await ClaimRegistry.deploy();
  await claimRegistry.waitForDeployment();
  const registryAddress = await claimRegistry.getAddress();
  console.log("ClaimRegistry deployed to:", registryAddress);

  // Deploy AlkahestEscrow
  const AlkahestEscrow = await ethers.getContractFactory("AlkahestEscrow");
  const alkahestEscrow = await AlkahestEscrow.deploy();
  await alkahestEscrow.waitForDeployment();
  const escrowAddress = await alkahestEscrow.getAddress();
  console.log("AlkahestEscrow deployed to:", escrowAddress);

  console.log("==========================================");
  console.log("Add the following to your backend/.env :");
  console.log(`CLAIM_REGISTRY_ADDRESS=${registryAddress}`);
  console.log(`ALKAHEST_CONTRACT_ADDRESS=${escrowAddress}`);
  console.log("==========================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
