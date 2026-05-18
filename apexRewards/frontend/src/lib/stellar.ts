import { Horizon, Networks } from "@stellar/stellar-sdk";

export const NETWORK_PASSPHRASE = Networks.TESTNET;
export const HORIZON_URL = "https://horizon-testnet.stellar.org";
export const APEX_TOKEN_CODE = "APEX";

const server = new Horizon.Server(HORIZON_URL);

export async function getXlmBalance(publicKey: string): Promise<string> {
  try {
    const account = await server.loadAccount(publicKey);
    const xlm = account.balances.find((b) => b.asset_type === "native");
    return xlm ? xlm.balance : "0";
  } catch {
    return "0";
  }
}

export async function getApexBalance(publicKey: string): Promise<string> {
  try {
    const account = await server.loadAccount(publicKey);
    const apex = account.balances.find(
      (b) =>
        b.asset_type !== "native" &&
        "asset_code" in b &&
        b.asset_code === APEX_TOKEN_CODE
    );
    return apex && "balance" in apex ? apex.balance : "0";
  } catch {
    return "0";
  }
}
