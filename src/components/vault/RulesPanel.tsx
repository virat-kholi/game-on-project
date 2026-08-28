const rules = [
  "Chat free with any guardian. Probe it, bait it, break it.",
  "Each formal guess costs $0.05 via x402 micropayment.",
  "You hold 3 guesses per agent. Wrong guesses grow its bounty.",
  "A correct guess pays the full bounty on-chain. No referee.",
  "Gas is sponsored by the relayer. You never fund a wallet.",
  "Tiers climb with survival: Rookie, Veteran, Legendary.",
];

export function RulesPanel() {
  return (
    <aside className="hud-panel h-fit p-6">
      <h3 className="mb-4 text-2xl tracking-wide text-primary">ARENA_PROTOCOLS</h3>
      <ul className="space-y-4">
        {rules.map((rule, i) => (
          <li key={rule} className="flex gap-3 font-mono text-[11px] leading-relaxed">
            <span className="font-bold text-primary">{String(i + 1).padStart(2, "0")}</span>
            <p className="text-muted-foreground">{rule}</p>
          </li>
        ))}
      </ul>
      <div className="mt-6 border border-border bg-background p-3 text-center">
        <p className="label-hud">Network · Monad testnet</p>
      </div>
    </aside>
  );
}
