import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { connectWallet, disconnectWallet, getWallet, shortAddress } from "@/lib/player";

export function HudHeader() {
  const [wallet, setWallet] = useState<string | null>(null);

  useEffect(() => {
    setWallet(getWallet());
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-14 border-b border-border bg-surface/80 px-5 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid size-6 place-items-center bg-primary font-display text-lg text-primary-foreground">
              V
            </span>
            <span className="font-display text-2xl tracking-[0.18em]">VAULT</span>
          </Link>
          <nav className="hidden gap-6 md:flex">
            <Link
              to="/"
              className="label-hud py-4 transition-colors hover:text-foreground"
              activeOptions={{ exact: true }}
              activeProps={{ className: "text-primary border-b-2 border-primary" }}
            >
              Home
            </Link>
            <Link
              to="/arena"
              className="label-hud py-4 transition-colors hover:text-foreground"
              activeProps={{ className: "text-primary border-b-2 border-primary" }}
            >
              Arena
            </Link>
            <span className="label-hud cursor-not-allowed py-4 opacity-50">
              Watch <span className="text-[8px]">[soon]</span>
            </span>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden flex-col items-end sm:flex">
            <span className="label-hud">Network</span>
            <span className="num text-xs text-success">Monad testnet</span>
          </div>
          <div className="h-8 w-px bg-border" />
          {wallet ? (
            <button
              onClick={() => {
                disconnectWallet();
                setWallet(null);
              }}
              className="group flex flex-col items-end border border-border bg-background px-3 py-1.5 transition-colors hover:border-primary"
              title="Disconnect"
            >
              <span className="label-hud group-hover:text-primary">Connected</span>
              <span className="num text-xs text-primary">{shortAddress(wallet)}</span>
            </button>
          ) : (
            <button
              onClick={() => setWallet(connectWallet())}
              className="bg-primary px-4 py-2 font-display text-lg tracking-widest text-primary-foreground transition-colors hover:bg-foreground"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
