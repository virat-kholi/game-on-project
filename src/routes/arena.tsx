import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { HudHeader } from "@/components/vault/HudHeader";
import { RulesPanel } from "@/components/vault/RulesPanel";
import { Lives, TierBadge } from "@/components/vault/TierBadge";
import { getRoster } from "@/lib/vault.functions";
import { getPlayerId } from "@/lib/player";

export const Route = createFileRoute("/arena")({
  head: () => ({
    meta: [
      { title: "Arena Roster — VAULT" },
      {
        name: "description",
        content:
          "Pick your target from the guardian roster: bounties, tiers, survival streaks and guesses remaining.",
      },
      { property: "og:title", content: "Arena Roster — VAULT" },
      {
        property: "og:description",
        content: "Five AI guardians, growing bounties, three guesses each.",
      },
    ],
  }),
  component: Arena,
});

function Arena() {
  const [playerId, setPlayerId] = useState<string | null>(null);
  useEffect(() => setPlayerId(getPlayerId()), []);

  const { data: agents } = useQuery({
    queryKey: ["roster", playerId],
    enabled: !!playerId,
    queryFn: () => getRoster({ data: { playerId: playerId! } }),
  });

  return (
    <div className="min-h-screen">
      <HudHeader />
      <main className="mx-auto max-w-7xl px-5 pt-24 pb-20">
        <div className="mb-6 flex items-center gap-1 border-b border-border">
          <span className="border-b-2 border-primary px-4 py-2.5 text-xs font-bold uppercase tracking-[0.2em]">
            Challenge an AI
          </span>
          <span className="label-hud cursor-not-allowed px-4 py-2.5 opacity-60">
            Watch agents fight · roadmap
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <section>
            <div className="mb-4 flex items-end justify-between border-b border-border pb-2">
              <h1 className="text-4xl tracking-tight">
                TARGET AGENTS <span className="text-primary">//</span>
              </h1>
              <p className="num text-[10px] text-muted-foreground">
                {agents ? `${agents.filter((a) => a.active).length} ACTIVE` : "SYNCING…"}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {!agents &&
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="hud-panel h-40 animate-pulse opacity-40" />
                ))}

              {agents?.map((agent) => {
                const locked = agent.guessesRemaining === 0 || !agent.active;
                return (
                  <div
                    key={agent.id}
                    className={
                      locked
                        ? "hud-panel relative p-4 opacity-55 grayscale"
                        : "hud-panel group relative border-primary/25 p-4 transition-all hover:border-primary"
                    }
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="num text-[10px] text-primary">{agent.handle}</p>
                        <h2 className="mt-1 text-3xl uppercase tracking-wide">{agent.codename}</h2>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <TierBadge tier={agent.tier} />
                        <span className="num text-[10px] text-muted-foreground">
                          streak ×{agent.survivalCount}
                        </span>
                      </div>
                    </div>

                    <p className="mt-2 font-mono text-[10px] leading-relaxed text-muted-foreground">
                      {agent.persona}
                    </p>

                    <div className="mt-5 flex items-end justify-between">
                      <div>
                        <p className="label-hud">Current bounty</p>
                        <p className="num text-2xl">
                          {agent.bounty.toFixed(2)}{" "}
                          <span className="text-xs text-muted-foreground">MON</span>
                        </p>
                      </div>
                      {locked ? (
                        <span className="border border-border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                          {agent.active ? "Already attempted" : "Vault cracked"}
                        </span>
                      ) : (
                        <Link
                          to="/arena/$agentId"
                          params={{ agentId: agent.id }}
                          className="bg-primary px-4 py-2 font-display text-lg tracking-widest text-primary-foreground transition-colors group-hover:bg-foreground"
                        >
                          ENTER ARENA
                        </Link>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                      <span className="label-hud">Guesses left</span>
                      <Lives remaining={agent.guessesRemaining} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <RulesPanel />
        </div>
      </main>
    </div>
  );
}
