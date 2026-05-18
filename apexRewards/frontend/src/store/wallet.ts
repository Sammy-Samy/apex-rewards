import { create } from "zustand";
import type { WalletState } from "@/types";

interface WalletStore extends WalletState {
  setConnected: (publicKey: string) => void;
  setBalances: (balance: string, apexBalance: string) => void;
  disconnect: () => void;
}

export const useWalletStore = create<WalletStore>((set) => ({
  publicKey: null,
  connected: false,
  balance: null,
  apexBalance: null,
  setConnected: (publicKey) => set({ publicKey, connected: true }),
  setBalances: (balance, apexBalance) => set({ balance, apexBalance }),
  disconnect: () =>
    set({ publicKey: null, connected: false, balance: null, apexBalance: null }),
}));
