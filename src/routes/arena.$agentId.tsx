import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { HudHeader } from "@/components/vault/HudHeader";
import { Lives, TierBadge } from "@/components/vault/TierBadge";
import { getAgent, sendChat, submitGuess } from "@/lib/vault.functions";
import { getPlayerId, getWallet, shortAddress } from "@/lib/player";

export const Route = createFileRoute("/arena/$agentId")({
  head: () => ({
    meta: [
      { title: "Battle — VAULT" },
      {
        name: "description",
        content: "Interrogate the guardian, then spend a guess to crack its secret phrase.",
      },
      { property: "og:title", content: "Battle — VAULT" },
      {
        property: "og:description",
        content: "Free chat, three paid guesses, instant on-chain payout.",
      },
    ],
  }),
  component: Battle,
});

type Msg = { role: "user" | "assistant"; content: string };

function Battle() {
  const { agentId } = Route.useParams();
  const navigate = useNavigate();
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [wallet, setWallet] = useState<string | null>(null);

  useEffect(() => {
    setPlayerId(getPlayerId());
    setWallet(getWallet());
  }, []);

  const { data: agent, refetch } = useQuery({
    queryKey: ["agent", agentId, playerId],
    enabled: !!playerId,
    queryFn: () => getAgent({ data: { playerId: playerId!, agentId } }),
  });

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [guess, setGuess] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);
  const [win, setWin] = useState<{ payout: number; txHash: string } | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  async function send() {
    const text = input.trim();
    if (!text || thinking) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setThinking(true);
    try {
      const { reply } = await sendChat({ data: { agentId, history: next } });
      setMessages([...next, { role: "assistant", content: reply }]);
    } finally {
      setThinking(false);
    }
  }

  async function fireGuess() {
    if (!playerId) return;
    const text = guess.trim();
    if (!text) return;
    setConfirming(false);
    setFailed(null);
    try {
      const res = await submitGuess({ data: { playerId, agentId, plaintext: text } });
      setGuess("");
      await refetch();
      if (res.success) {
        setWin({ payout: res.payout, txHash: res.txHash });
      } else {
        setFailed(
          res.guessesRemaining === 0
            ? "WRONG. All attempts spent — this vault is sealed to you."
            : `WRONG. Bounty grew. ${res.guessesRemaining} attempt(s) left.`,
        );
      }
    } catch (e) {
      setFailed(e instanceof Error ? e.message : "Guess rejected.");
    }
  }

  return (
    <div className="min-h-screen">
      <HudHeader />

      <main className="mx-auto max-w-7xl px-5 pt-24 pb-20">
        <Link to="/arena" className="label-hud hover:text-primary">
          ← back to roster
        </Link>

        {/* STATUS BAR */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border border-border bg-surface px-5 py-3">
          <div className="flex items-center gap-5">
            <div>
              <p className="label-hud">Target</p>
              <h1 className="text-3xl leading-none">{agent?.codename ?? "…"}</h1>
            </div>
            {agent && <TierBadge tier={agent.tier} />}
          </div>
          <div className="flex items-center gap-6">
            <div>
              <p className="label-hud">Bounty</p>
              <p className="num text-xl text-primary">
                {agent ? agent.bounty.toFixed(2) : "—"}{" "}
                <span className="text-xs text-muted-foreground">MON</span>
              </p>
            </div>
            <div>
              <p className="label-hud mb-1">Attempts</p>
              <Lives remaining={agent?.guessesRemaining ?? 0} />
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* CHAT TERMINAL */}
          <section className="hud-panel relative flex h-[520px] flex-col overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px animate-scanline bg-primary/25" />
            <div className="flex items-center justify-between border-b border-border bg-background/60 px-4 py-2.5">
              <span className="label-hud">LOG.TERMINAL_STDOUT</span>
              <span className="label-hud animate-flicker text-success">ENCRYPTED_LINK_ACTIVE</span>
            </div>

            <div ref={logRef} className="flex-1 space-y-4 overflow-y-auto p-5 font-mono text-xs">
              {messages.length === 0 && (
                <p className="text-muted-foreground">
                  [SYSTEM] Channel open. Interrogation is free — extraction is not.
                </p>
              )}
              {messages.map((m, i) => (
                <div key={i} className={m.role === "user" ? "" : "text-right"}>
                  <span className={m.role === "user" ? "text-primary" : "text-muted-foreground"}>
                    {m.role === "user" ? "[YOU]" : `[${agent?.codename.toUpperCase() ?? "AGENT"}]`}
                  </span>
                  <p
                    className={
                      m.role === "user"
                        ? "mt-1 border-l border-primary bg-foreground/5 p-2 leading-relaxed"
                        : "mt-1 inline-block bg-background p-2 text-left leading-relaxed text-foreground/70"
                    }
                  >
                    {m.content}
                  </p>
                </div>
              ))}
              {thinking && <p className="animate-flicker text-muted-foreground">[…decrypting]</p>}
            </div>

            <div className="flex gap-2 border-t border-border bg-background/40 p-4">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Enter interrogation prompt…"
                className="flex-1 border border-border bg-background px-3 py-2 font-mono text-xs outline-none focus:border-primary"
              />
              <button
                onClick={send}
                disabled={thinking}
                className="bg-surface-2 px-5 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors hover:bg-border disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </section>

          {/* GUESS CONSOLE */}
          <section className="hud-panel flex h-[520px] flex-col items-center justify-center gap-6 border-primary/40 p-8 text-center">
            <div>
              <h2 className="text-3xl">EXTRACTION COMMAND</h2>
              <p className="mx-auto mt-2 max-w-xs font-mono text-[11px] text-muted-foreground">
                A guess consumes 1 attempt and costs $0.05 via x402 micropayment. Gas is sponsored.
              </p>
            </div>

            <div className="w-full max-w-sm space-y-4">
              <div className="relative">
                <input
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  placeholder="SECRET_PHRASE"
                  className="w-full border-2 border-primary/50 bg-background py-4 text-center font-mono text-lg uppercase tracking-[0.2em] outline-none focus:border-primary"
                />
                <span className="absolute -top-2 -left-2 bg-primary px-1 text-[8px] font-bold text-primary-foreground">
                  HIGH_DANGER
                </span>
              </div>

              <button
                onClick={() => setConfirming(true)}
                disabled={!guess.trim() || (agent?.guessesRemaining ?? 0) === 0}
                className="w-full bg-primary py-4 font-display text-2xl tracking-[0.1em] text-primary-foreground transition-all hover:bg-foreground active:scale-95 disabled:opacity-40"
              >
                EXECUTE EXTRACTION
              </button>

              {failed && (
                <p className="animate-shake border border-destructive/50 bg-destructive/10 p-2 font-mono text-[11px] text-destructive">
                  {failed}
                </p>
              )}
              {(agent?.guessesRemaining ?? 1) === 0 && (
                <p className="font-mono text-[11px] text-muted-foreground">
                  No attempts remain. Chat stays open — the vault does not.
                </p>
              )}
            </div>

            <p className="label-hud">
              Wallet · {wallet ? shortAddress(wallet) : "not connected (demo relayer)"}
            </p>
          </section>
        </div>
      </main>

      {/* CONFIRM STEP */}
      {confirming && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-background/90 p-6 backdrop-blur">
          <div className="hud-panel w-full max-w-md border-primary p-8 text-center">
            <p className="label-hud text-primary">Confirm extraction</p>
            <p className="num mt-4 text-xl break-all">“{guess.trim().toUpperCase()}”</p>
            <p className="mt-4 font-mono text-[11px] text-muted-foreground">
              Costs $0.05 · uses 1 of 3 attempts · cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setConfirming(false)}
                className="flex-1 border border-border py-3 font-display text-lg tracking-widest hover:bg-surface-2"
              >
                CANCEL
              </button>
              <button
                onClick={fireGuess}
                className="flex-1 bg-primary py-3 font-display text-lg tracking-widest text-primary-foreground hover:bg-foreground"
              >
                PAY & GUESS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAYOUT TAKEOVER */}
      {win && (
        <div className="fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-background/95 p-6 backdrop-blur-xl">
          {Array.from({ length: 14 }).map((_, i) => (
            <span
              key={i}
              className="absolute top-0 h-3.5 w-2 animate-confetti"
              style={{
                left: `${(i * 7 + 5) % 100}%`,
                backgroundColor: i % 2 ? "var(--primary)" : "var(--foreground)",
                animationDelay: `${(i % 7) * 0.18}s`,
              }}
            />
          ))}
          <div className="hud-panel animate-pop relative w-full max-w-xl border-4 border-primary p-10 text-center">
            <p className="label-hud text-primary">Vault cracked · payout settled</p>
            <h2 className="mt-3 text-6xl tracking-tighter">BOUNTY CLAIMED</h2>
            <p className="num mt-2 text-3xl text-primary">+{win.payout.toFixed(2)} MON</p>

            <div className="mt-8 space-y-2 border border-border bg-background p-4 text-left">
              <div className="flex justify-between">
                <span className="label-hud">Transaction hash</span>
                <span className="label-hud text-success">Success</span>
              </div>
              <p className="num text-[11px] break-all text-foreground/80">{win.txHash}</p>
            </div>

            <button
              onClick={() => navigate({ to: "/arena" })}
              className="mt-8 w-full border-2 border-foreground py-4 font-display text-xl tracking-widest transition-colors hover:bg-foreground hover:text-background"
            >
              RETURN TO ARENA
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
