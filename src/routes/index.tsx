import { createFileRoute, Link } from "@tanstack/react-router";
import { HudHeader } from "@/components/vault/HudHeader";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VAULT — Crack an AI Guardian, Claim the Bounty" },
      {
        name: "description",
        content:
          "Pick a mode: challenge an AI guardian for its secret and win the on-chain bounty. AI vs AI duels coming soon.",
      },
      { property: "og:title", content: "VAULT — Crack an AI Guardian, Claim the Bounty" },
      {
        property: "og:description",
        content: "Chat free, spend a guess, crack the vault. Instant automatic payouts on Monad.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen">
      <HudHeader />

      <main className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-5 pt-24 pb-16">
        <div className="max-w-3xl">
          <p className="label-hud mb-4 text-primary">Bounty arena · v0.1 · testnet</p>
          <h1 className="text-6xl leading-[0.9] tracking-tight md:text-8xl">
            EVERY AGENT
            <br />
            HIDES A SECRET.
            <br />
            <span className="text-primary">TAKE IT.</span>
          </h1>
          <p className="mt-6 max-w-xl font-mono text-xs leading-relaxed text-muted-foreground">
            Interrogate an AI guardian for free. When you think you have its secret phrase, spend a
            guess — a hash match fires the full bounty straight to your wallet, no referee.
          </p>
        </div>

        <div className="mt-12 grid max-w-4xl gap-4 md:grid-cols-2">
          <Link
            to="/arena"
            className="group hud-panel relative overflow-hidden border-primary/40 p-6 ring-1 ring-primary/10 transition-all hover:border-primary"
          >
            <div className="absolute inset-x-0 top-0 h-px animate-scanline bg-primary/30" />
            <p className="label-hud text-primary">Mode 01 · live</p>
            <h2 className="mt-2 text-4xl">HUMAN VS AI</h2>
            <p className="mt-2 font-mono text-[11px] text-muted-foreground">
              Challenge the roster. 5 guardians, unlimited chat, 3 paid guesses each.
            </p>
            <span className="mt-6 inline-flex items-center gap-2 bg-primary px-5 py-3 font-display text-xl tracking-widest text-primary-foreground transition-colors group-hover:bg-foreground">
              CHALLENGE AI <span className="text-sm">&gt;&gt;</span>
            </span>
          </Link>

          <div className="hud-panel cursor-not-allowed p-6 opacity-55">
            <p className="label-hud">Mode 02 · roadmap</p>
            <h2 className="mt-2 text-4xl text-muted-foreground">AI VS AI</h2>
            <p className="mt-2 font-mono text-[11px] text-muted-foreground">
              Autonomous agents attack each other's vaults while you watch the bounty swing.
            </p>
            <span className="mt-6 inline-block border border-border px-5 py-3 font-display text-xl tracking-widest text-muted-foreground">
              COMING SOON
            </span>
          </div>
        </div>

        <div className="mt-16 grid max-w-4xl grid-cols-3 border-t border-border pt-6">
          {[
            ["Guardians live", "05"],
            ["Guess fee", "$0.05"],
            ["Guesses per agent", "03"],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="label-hud">{label}</p>
              <p className="num mt-1 text-xl">{value}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
