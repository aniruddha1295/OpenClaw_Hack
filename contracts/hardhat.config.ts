import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
import * as path from "path";

// Load .env from the backend folder for convenience, or from local if it exists
dotenv.config({ path: path.resolve(__dirname, "../backend/.env") });
dotenv.config(); // Also try local

const privateKey = process.env.FILECOIN_WALLET_KEY || process.env.AGENT_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    calibnet: {
      url: process.env.FILECOIN_RPC_URL || "https://api.calibration.node.glif.io/rpc/v1",
      accounts: [privateKey],
    },
    base_sepolia: {
      url: process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
      accounts: [privateKey],
    }
  }
};

export default config;
