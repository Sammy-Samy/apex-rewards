// ApexRewards — Stellar / Soroban integration service
import {
  Keypair,
  Networks,
  SorobanRpc,
  TransactionBuilder,
  Contract,
  nativeToScVal,
  Address,
  BASE_FEE,
  xdr,
} from '@stellar/stellar-sdk';
import { logger } from '../config/logger';

const NETWORK = (process.env.STELLAR_NETWORK ?? 'testnet') as 'testnet' | 'mainnet';
const RPC_URL =
  process.env.STELLAR_RPC_URL ??
  (NETWORK === 'mainnet'
    ? 'https://mainnet.sorobanrpc.com'
    : 'https://soroban-testnet.stellar.org');
const NETWORK_PASSPHRASE =
  NETWORK === 'mainnet' ? Networks.PUBLIC : Networks.TESTNET;

const TOKEN_CONTRACT_ID = process.env.APEX_TOKEN_CONTRACT_ID ?? '';
const CAMPAIGN_CONTRACT_ID = process.env.APEX_CAMPAIGN_CONTRACT_ID ?? '';
const ADMIN_SECRET = process.env.STELLAR_ADMIN_SECRET ?? '';

function getServer(): SorobanRpc.Server {
  return new SorobanRpc.Server(RPC_URL, { allowHttp: RPC_URL.startsWith('http://') });
}

async function submitTx(
  server: SorobanRpc.Server,
  adminKeypair: Keypair,
  contractId: string,
  method: string,
  args: xdr.ScVal[]
): Promise<string> {
  const account = await server.getAccount(adminKeypair.publicKey());
  const contract = new Contract(contractId);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const prepared = await server.prepareTransaction(tx);
  prepared.sign(adminKeypair);

  const result = await server.sendTransaction(prepared);
  if (result.status === 'ERROR') {
    throw new Error(`ApexRewards Stellar tx error: ${JSON.stringify(result.errorResult)}`);
  }

  // Poll for confirmation
  let getResult = await server.getTransaction(result.hash);
  let attempts = 0;
  while (getResult.status === SorobanRpc.Api.GetTransactionStatus.NOT_FOUND && attempts < 20) {
    await new Promise((r) => setTimeout(r, 1500));
    getResult = await server.getTransaction(result.hash);
    attempts++;
  }

  if (getResult.status !== SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
    throw new Error(`ApexRewards tx failed: ${getResult.status}`);
  }

  logger.info('ApexRewards Stellar tx confirmed', { hash: result.hash, method });
  return result.hash;
}

export const stellarService = {
  /** Mint APEX tokens to a recipient address */
  async mintApex(recipientPublicKey: string, amount: bigint): Promise<string> {
    const server = getServer();
    const adminKeypair = Keypair.fromSecret(ADMIN_SECRET);
    return submitTx(server, adminKeypair, TOKEN_CONTRACT_ID, 'mint', [
      new Address(recipientPublicKey).toScVal(),
      nativeToScVal(amount, { type: 'i128' }),
    ]);
  },

  /** Burn APEX tokens from a holder (redemption) */
  async burnApex(holderPublicKey: string, amount: bigint): Promise<string> {
    const server = getServer();
    const adminKeypair = Keypair.fromSecret(ADMIN_SECRET);
    return submitTx(server, adminKeypair, TOKEN_CONTRACT_ID, 'burn', [
      new Address(holderPublicKey).toScVal(),
      nativeToScVal(amount, { type: 'i128' }),
    ]);
  },

  /** Query on-chain APEX balance */
  async getBalance(publicKey: string): Promise<bigint> {
    const server = getServer();
    const contract = new Contract(TOKEN_CONTRACT_ID);
    const account = await server.getAccount(publicKey).catch(() => null);
    if (!account) return 0n;

    const adminKeypair = Keypair.fromSecret(ADMIN_SECRET);
    const tx = new TransactionBuilder(
      await server.getAccount(adminKeypair.publicKey()),
      { fee: BASE_FEE, networkPassphrase: NETWORK_PASSPHRASE }
    )
      .addOperation(contract.call('balance', new Address(publicKey).toScVal()))
      .setTimeout(30)
      .build();

    const sim = await server.simulateTransaction(tx);
    if (!SorobanRpc.Api.isSimulationSuccess(sim)) return 0n;
    const val = sim.result?.retval;
    if (!val) return 0n;
    return BigInt(val.i128().toString());
  },

  /** Issue reward via campaign contract */
  async issueRewardOnChain(
    campaignContractId: number,
    customerPublicKey: string,
    points: bigint
  ): Promise<string> {
    const server = getServer();
    const adminKeypair = Keypair.fromSecret(ADMIN_SECRET);
    return submitTx(server, adminKeypair, CAMPAIGN_CONTRACT_ID, 'issue_reward', [
      nativeToScVal(campaignContractId, { type: 'u32' }),
      new Address(customerPublicKey).toScVal(),
      nativeToScVal(points, { type: 'i128' }),
    ]);
  },
};
