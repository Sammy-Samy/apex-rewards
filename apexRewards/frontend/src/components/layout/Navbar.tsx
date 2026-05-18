"use client";

import Link from "next/link";
import { useWallet } from "@/hooks/useWallet";
import { Button } from "@/components/ui/Button";
import { truncateAddress, formatApex } from "@/lib/utils";

export function Navbar() {
  const { connected, publicKey, apexBalance, connect, disconnect } = useWallet();

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-purple-700">⬡ ApexRewards</span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link href="/campaigns" className="hover:text-purple-700 transition-colors">Campaigns</Link>
          <Link href="/dashboard" className="hover:text-purple-700 transition-colors">Dashboard</Link>
          <Link href="/redeem" className="hover:text-purple-700 transition-colors">Redeem</Link>
        </div>

        <div className="flex items-center gap-3">
          {connected && publicKey ? (
            <>
              {apexBalance && (
                <span className="hidden sm:block text-sm font-medium text-purple-700">
                  {formatApex(apexBalance)}
                </span>
              )}
              <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                {truncateAddress(publicKey)}
              </span>
              <Button variant="outline" size="sm" onClick={disconnect}>
                Disconnect
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={connect}>
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
