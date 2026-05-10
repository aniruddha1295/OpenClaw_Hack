import dotenv from 'dotenv';
dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optionalEnv(name: string): string | null {
  const value = process.env[name];
  return value || null;
}

export const config = {
  supabaseUrl: requireEnv('SUPABASE_URL'),
  supabaseAnonKey: requireEnv('SUPABASE_ANON_KEY'),
  supabaseServiceRoleKey: requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
  elevenlabsWebhookSecret: requireEnv('ELEVENLABS_WEBHOOK_SECRET'),
  baseSepoliaRpcUrl: requireEnv('BASE_SEPOLIA_RPC_URL'),
  filecoinRpcUrl: requireEnv('FILECOIN_RPC_URL'),
  claimRegistryAddress: requireEnv('CLAIM_REGISTRY_ADDRESS'),
  easContractAddress: optionalEnv('EAS_CONTRACT_ADDRESS'),
  easSchemaUid: optionalEnv('EAS_SCHEMA_UID'),
  easSchema: optionalEnv('EAS_SCHEMA'),
  agentId: optionalEnv('AGENT_ID'),
  agentPrivateKey: optionalEnv('AGENT_PRIVATE_KEY'),
  port: parseInt(process.env.PORT || '3005', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};
