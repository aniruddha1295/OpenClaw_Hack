# BACKEND_TASKS.md — Aniruddha (Track A) — ONE-DAY SPRINT

> Compressed from 13 days to ~6 hours of focused backend work. Critical-path only. All scope cuts are listed at the bottom.

---

## What you're building today

- `ClaimRegistry.sol` deployed to Base Sepolia (1 contract, 30 lines)
- Synapse SDK uploads every filed claim's evidence to Filecoin Calibration
- A post-hook in `claims-service.ts:148-150` fires both writes after a claim is filed
- `POST /api/claims/:id/verify-integrity` endpoint — re-fetches from Filecoin, recomputes hash, returns `{match: bool}`
- DB column additions to `claims` table

You DO NOT do today: ERC-8004 NFT registration, EAS attestations, HMAC verification, dynamic variables, agent registrations table, evidence_bundles table, 3 new tool routes, landing page, doc rewrites.

---

## T-0 Setup (do RIGHT NOW, before anything else)

These run in the background. Don't wait — set them off and start coding.

```powershell
# 1. Install Foundry (Windows: use Git Bash or WSL)
# In bash/git-bash:
curl -L https://foundry.paradigm.xyz | bash
source ~/.bashrc
foundryup

# 2. Generate fresh testnet wallet (NOT a wallet with real funds)
cast wallet new
# → save Private key as AGENT_PRIVATE_KEY in backend/.env
# → save Address — paste into all 4 faucets below

# 3. Open these 4 faucets in browser tabs and paste your wallet address:
#    - Base Sepolia ETH:  https://www.alchemy.com/faucets/base-sepolia
#    - Base Sepolia (alt): https://portal.cdp.coinbase.com/products/faucet
#    - tFIL Calibration:  https://faucet.calibnet.chainsafe-fil.io
#    - USDFC Calibration: https://forest-explorer.chainsafe.dev/faucet/calibnet_usdfc

# 4. Etherscan V2 API key (for forge --verify):
#    https://etherscan.io/apis → save as BASESCAN_API_KEY
```

Faucets take real time. Move on while they drip.

---

## T+0 — 15-min Day 0 Sync With Ansh

Lock these 2 JSON shapes (they're tiny because we cut conversation-init + agent-identity):

```ts
// POST /api/claims/:id/verify-integrity
{
  match: boolean,
  recomputed_hash: string,    // 0x...
  stored_hash: string,         // 0x...
  filecoin_cid: string,
  retrieved_at: string         // ISO
}

// Claim type additions (mirror in frontend/src/types)
{
  filecoin_cid?: string,
  attestation_tx_hash?: string,
  pdp_proof_status?: 'pending' | 'verified' | 'failed'
}
```

Ansh mocks against this. You implement to it. Don't change field names mid-day.

---

## Hour 1 — Contract + Pin

```bash
cd P:/Shangai/Loops_hackerhouse
mkdir contracts && cd contracts
forge init . --no-git --no-commit
```

Author `contracts/src/ClaimRegistry.sol` (paste this verbatim):

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ClaimRegistry {
    event ClaimAttested(
        uint256 indexed claimNumber,
        string  cid,
        uint256 indexed agentId,
        uint256 timestamp,
        address indexed attester
    );

    address public immutable admin;
    mapping(uint256 => uint256) public attestedAt;

    error NotAdmin();
    error AlreadyAttested();

    constructor(address _admin) { admin = _admin == address(0) ? msg.sender : _admin; }

    function attestClaim(uint256 claimNumber, string calldata cid, uint256 agentId) external {
        if (msg.sender != admin) revert NotAdmin();
        if (attestedAt[claimNumber] != 0) revert AlreadyAttested();
        attestedAt[claimNumber] = block.timestamp;
        emit ClaimAttested(claimNumber, cid, agentId, block.timestamp, msg.sender);
    }
}
```

Author `contracts/foundry.toml`:
```toml
[profile.default]
src = "src"
out = "out"
solc_version = "0.8.24"

[rpc_endpoints]
base_sepolia = "${BASE_SEPOLIA_RPC_URL}"

[etherscan]
base_sepolia = { key = "${BASESCAN_API_KEY}", url = "https://api-sepolia.basescan.org/api", chain = 84532 }
```

Author `contracts/script/Deploy.s.sol`:
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {Script, console2} from "forge-std/Script.sol";
import {ClaimRegistry} from "../src/ClaimRegistry.sol";

contract Deploy is Script {
    function run() external returns (ClaimRegistry r) {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(pk);
        r = new ClaimRegistry(vm.addr(pk));
        vm.stopBroadcast();
        console2.log("ClaimRegistry:", address(r));
    }
}
```

Set `contracts/.env`:
```
PRIVATE_KEY=0xYOUR_TESTNET_PRIVATE_KEY
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASESCAN_API_KEY=YOUR_ETHERSCAN_V2_KEY
```

While faucets drip, do the agent card pin:
```bash
cd P:/Shangai/Loops_hackerhouse
npm install -g filecoin-pin
# Author agent-card.json (use template from WINNING_STRATEGY.md Appendix A4)
filecoin-pin payments setup --auto
filecoin-pin add --auto-fund agent-card.json
# → CAPTURE root CID. Set AGENT_TOKEN_URI=ipfs://<CID>/agent-card.json
```

If `filecoin-pin` fails (faucet not yet dripped), do this LAST in the day. It's not on the critical demo path — you can hardcode the CID in the dashboard.

---

## Hour 2 — Deploy + Send to Ansh

```bash
cd contracts
source .env  # or load env vars
forge script script/Deploy.s.sol:Deploy \
  --rpc-url base_sepolia --broadcast --verify -vvvv

# Output ends with: ClaimRegistry: 0x...
# CAPTURE THIS as CLAIM_REGISTRY_ADDRESS
```

Export ABI:
```bash
forge build
mkdir -p ../backend/src/abis
jq '.abi' out/ClaimRegistry.sol/ClaimRegistry.json > ../backend/src/abis/ClaimRegistry.json
```

🔔 **HANDOFF #1 to Ansh in Slack:**
```
Backend Hour 2 ✅ — env values for your Filecoin panel:

CLAIM_REGISTRY_ADDRESS=0x...
AGENT_TOKEN_URI=ipfs://.../agent-card.json   (or hardcode if pin failed)
ERC_8004_IDENTITY_REGISTRY_ADDRESS=0x8004A818BFB912233c491871b3d84c89A494BD9e

Add to frontend/.env:
VITE_CLAIM_REGISTRY_ADDRESS=0x...
VITE_BASESCAN_BASE_URL=https://sepolia.basescan.org
VITE_FILFOX_BASE_URL=https://calibration.filfox.info/en
```

---

## Hour 3 — Backend Wiring

```bash
cd backend
npm install @filoz/synapse-sdk@^0.38.0 viem
```

Add to `backend/package.json`:
```json
"engines": { "node": ">=20" }
```

Add to `backend/.env`:
```
AGENT_PRIVATE_KEY=0x...
FILECOIN_RPC_URL=https://api.calibration.node.glif.io/rpc/v1
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
CLAIM_REGISTRY_ADDRESS=0x...   # from Hour 2
AGENT_ID=1                      # hardcoded, we skip ERC-8004 register
```

Apply DB migration in Supabase SQL Editor:
```sql
ALTER TABLE claims
  ADD COLUMN filecoin_cid TEXT,
  ADD COLUMN piece_cid TEXT,
  ADD COLUMN dataset_id TEXT,
  ADD COLUMN attestation_tx_hash TEXT,
  ADD COLUMN evidence_hash TEXT,
  ADD COLUMN pdp_proof_status TEXT,
  ADD COLUMN attested_at TIMESTAMPTZ;
```

(Skip the new tables — `agent_registrations`, `filecoin_uploads`, `evidence_bundles` are not needed for today.)

Extend `backend/src/config/environment.ts` — append to the `config` export:
```ts
agentPrivateKey: requireEnv('AGENT_PRIVATE_KEY'),
filecoinRpcUrl: process.env.FILECOIN_RPC_URL || 'https://api.calibration.node.glif.io/rpc/v1',
baseSepoliaRpcUrl: process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org',
claimRegistryAddress: requireEnv('CLAIM_REGISTRY_ADDRESS'),
agentId: process.env.AGENT_ID || '1',
```

Update `backend/src/types/index.ts` — extend `Claim` interface with the 7 new optional fields.

---

## Hour 4 — The Two Services

Create `backend/src/services/filecoin-service.ts`:
```ts
import { Synapse, RPC_URLS } from '@filoz/synapse-sdk';
import { config } from '../config/environment.js';

let synapse: Awaited<ReturnType<typeof Synapse.create>>;

async function getSynapse() {
  if (!synapse) {
    synapse = await Synapse.create({
      privateKey: config.agentPrivateKey,
      rpcURL: RPC_URLS.calibration.websocket,
    });
    // Skip the deposit() call if you've manually deposited via the Synapse Portal
  }
  return synapse;
}

export async function uploadClaimBundle(bundle: object): Promise<{
  pieceCid: string;
  datasetId: string;
}> {
  const s = await getSynapse();
  const bytes = new TextEncoder().encode(JSON.stringify(bundle));
  const result = await s.storage.upload(bytes);
  if (!result.complete) throw new Error('Upload incomplete');
  return {
    pieceCid: result.copies[0].pieceCid,
    datasetId: result.copies[0].dataSetId,
  };
}

export async function downloadBundle(pieceCid: string): Promise<object> {
  const s = await getSynapse();
  const bytes = await s.storage.download({ pieceCid });
  return JSON.parse(new TextDecoder().decode(bytes));
}

export function computeBundleHash(bundle: object): string {
  // Canonical: sort keys, stringify, keccak256
  const canonical = JSON.stringify(bundle, Object.keys(bundle).sort());
  // Use viem's keccak256 — import inline to avoid coupling
  const { keccak256, toBytes } = require('viem');
  return keccak256(toBytes(canonical));
}
```

Create `backend/src/services/ethereum-service.ts`:
```ts
import { createWalletClient, http, keccak256, toBytes } from 'viem';
import { baseSepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { config } from '../config/environment.js';
import claimRegistryAbi from '../abis/ClaimRegistry.json' assert { type: 'json' };

const account = privateKeyToAccount(config.agentPrivateKey as `0x${string}`);
const wallet = createWalletClient({
  account, chain: baseSepolia, transport: http(config.baseSepoliaRpcUrl),
});

export async function attestClaim(claimNumber: string, cid: string): Promise<`0x${string}`> {
  const claimNumberHash = BigInt(keccak256(toBytes(claimNumber)));
  return wallet.writeContract({
    address: config.claimRegistryAddress as `0x${string}`,
    abi: claimRegistryAbi,
    functionName: 'attestClaim',
    args: [claimNumberHash, cid, BigInt(config.agentId)],
  });
}
```

---

## Hour 5 — The Hook + Verify Endpoint

In `backend/src/services/claims-service.ts`, between L148 and L150 (after `if (error)` guard, before final `return`):

```ts
// --- Filecoin + on-chain attestation post-hook ---
let cid: string | undefined;
let txHash: string | undefined;
try {
  const { uploadClaimBundle, computeBundleHash } = await import('./filecoin-service.js');
  const { attestClaim } = await import('./ethereum-service.js');

  const bundle = {
    claim_number: claim.claim_number,
    incident_description: claim.incident_description,
    claim_type: claim.claim_type,
    claimed_amount: claim.claimed_amount,
    customer_id: claim.customer_id,
    policy_number: data.policy_number,
    timestamp: claim.filed_at ?? new Date().toISOString(),
  };
  const evidenceHash = computeBundleHash(bundle);

  const upload = await uploadClaimBundle(bundle);
  cid = upload.pieceCid;
  txHash = await attestClaim(claim.claim_number, cid);

  await supabase.from('claims').update({
    filecoin_cid: cid,
    piece_cid: cid,
    dataset_id: upload.datasetId,
    attestation_tx_hash: txHash,
    evidence_hash: evidenceHash,
    pdp_proof_status: 'pending',
    attested_at: new Date().toISOString(),
  }).eq('id', claim.id);
} catch (err) {
  console.error('Filecoin/attestation hook failed (non-fatal):', err);
}
// --- end hook ---
```

The try/catch is critical — never let a Filecoin hiccup break the response to ElevenLabs.

Create `backend/src/routes/integrity.ts`:
```ts
import { FastifyPluginAsync } from 'fastify';
import { downloadBundle, computeBundleHash } from '../services/filecoin-service.js';

const integrityRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post<{Params: {id: string}}>('/claims/:id/verify-integrity', async (req, reply) => {
    const { data: claim } = await fastify.supabase.from('claims').select('*').eq('id', req.params.id).single();
    if (!claim?.filecoin_cid) return { match: false, error: 'no_cid' };

    const filecoinBundle = await downloadBundle(claim.filecoin_cid);
    const filecoinHash = computeBundleHash(filecoinBundle);
    const postgresHash = computeBundleHash({
      claim_number: claim.claim_number,
      incident_description: claim.incident_description,
      claim_type: claim.claim_type,
      claimed_amount: claim.claimed_amount,
      customer_id: claim.customer_id,
      policy_number: claim.policy_number,
      timestamp: claim.filed_at,
    });

    return {
      match: filecoinHash === postgresHash,
      recomputed_hash: postgresHash,
      stored_hash: filecoinHash,
      filecoin_cid: claim.filecoin_cid,
      retrieved_at: new Date().toISOString(),
    };
  });
};

export default integrityRoutes;
```

Register in `backend/src/server.ts`:
```ts
await fastify.register(import('./routes/integrity.js'), { prefix: '/api' });
```

🔔 **HANDOFF #2 to Ansh:**
```
Backend Hour 5 ✅ — verify-integrity is live.
Test: curl -X POST http://localhost:3005/api/claims/<id>/verify-integrity
Swap your mock now.
```

---

## Hour 6 — Test + Pre-Pin Demo Data

- [ ] Run a test claim through ElevenLabs preview: file a claim, watch logs for CID + tx_hash, see in dashboard
- [ ] Verify on Filfox: `https://calibration.filfox.info/en/<cid>` should resolve
- [ ] Verify on Basescan: `https://sepolia.basescan.org/tx/<hash>` should show ClaimAttested event
- [ ] Test integrity endpoint: should return `{match: true}`
- [ ] Manually edit the claim's `claimed_amount` in Supabase → integrity should return `{match: false}` ← **THE KILL SHOT**
- [ ] Pre-pin demo claims: file 2-3 claims through ElevenLabs so dashboard has good demo data

---

## Hours 7-8 — Buffer + Demo Rehearsal

- [ ] Demo dry-run with Ansh, full 90-second arc
- [ ] If your backend is stable, deploy to Railway. If not, keep on ngrok and lock the URL.
- [ ] Make sure ngrok is on a static domain (`ngrok http 3005 --domain=...`) so Ansh's URL doesn't change

---

## When Things Break

| Problem | Fix |
|---|---|
| Faucet hasn't dripped tFIL | Check Filecoin Discord #faucet-help; or ask in Loops Slack — someone usually has spare |
| `synapse.storage.upload` hangs | Calibration RPC is sometimes flaky; fallback: `https://filecoin-calibration.chainup.net/rpc/v1` |
| Pre-deposit needed for Synapse | Use Synapse Portal (https://portal.synapse.filecoin.io) to deposit USDFC manually one-shot |
| `forge verify-contract` fails | Skip --verify; verify manually on Basescan after demo |
| Hook makes file_claim slow | Already wrapped in try/catch — non-fatal. ElevenLabs response always returns. |
| Synapse SDK init throws on Windows | Run backend in WSL or with Node 20+ globally |
| `agent_id` missing | We hardcoded it to `1` — that's intentional. ERC-8004 register is cut. |

---

## Cuts (so you know what NOT to do)

- ❌ ERC-8004 NFT registration (we use `agent_id = 1` constant)
- ❌ EAS attestations
- ❌ HMAC webhook verification
- ❌ Dynamic variables endpoint
- ❌ Conversation-init endpoint
- ❌ 3 new tool routes (attach-document, fraud-signals, escalate-to-regulator)
- ❌ `agent_registrations` and `evidence_bundles` tables
- ❌ Plugins (filecoin.ts, ethereum.ts) — services import config directly
- ❌ Landing page rewrite
- ❌ All doc rewrites except DEMO_SCRIPT.md (Ansh handles)

If you finish early, do them in this order: pre-pin a 4th demo claim → ERC-8004 register → HMAC webhook → AgentIdentityCard data endpoint.
