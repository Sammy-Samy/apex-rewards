"use client";

import { useCallback } from "react";
import { useWalletStore } from "@/store/wallet";
import { connectWallet, getWalletPublicKey } from "@/lib/freighter";
import { getXlmBalance, getApexBalance } from "@/lib/stellar";

export function useWallet() {
  const store = useWalletStore();

  const connect = useCallback(async () => {
    const publicKey = await connectWallet();
    if (!publicKey) return;
    store.setConnected(publicKey);
    const [balance, apexBalance] = await Promise.all([
      getXlmBalance(publicKey),
      getApexBalance(publicKey),
    ]);
    store.setBalances(balance, apexBalance);
  }, [store]);

  const refresh = useCallback(async () => {
    const publicKey = await getWalletPublicKey();
    if (!publicKey) return;
    store.setConnected(publicKey);
    const [balance, apexBalance] = await Promise.all([
      getXlmBalance(publicKey),
      getApexBalance(publicKey),
    ]);
    store.setBalances(balance, apexBalance);
  }, [store]);

  return { ...store, connect, refresh };
}
