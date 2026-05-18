import {
  getPublicKey,
  isConnected,
  signTransaction,
  requestAccess,
} from "@stellar/freighter-api";

export async function checkFreighterInstalled(): Promise<boolean> {
  try {
    const connected = await isConnected();
    return connected;
  } catch {
    return false;
  }
}

export async function connectWallet(): Promise<string | null> {
  try {
    await requestAccess();
    const publicKey = await getPublicKey();
    return publicKey || null;
  } catch {
    return null;
  }
}

export async function getWalletPublicKey(): Promise<string | null> {
  try {
    const publicKey = await getPublicKey();
    return publicKey || null;
  } catch {
    return null;
  }
}

export async function signTx(
  xdr: string,
  networkPassphrase: string
): Promise<string | null> {
  try {
    const signed = await signTransaction(xdr, { networkPassphrase });
    return signed || null;
  } catch {
    return null;
  }
}
