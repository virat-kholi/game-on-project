import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  Rookie: "border-rookie/40 bg-rookie/10 text-rookie",
  Veteran: "border-veteran/40 bg-veteran/10 text-veteran",
  Legendary: "border-legendary/50 bg-legendary/15 text-legendary",
};

export function TierBadge({ tier, className }: { tier: string; className?: string }) {
  return (
    <span
      className={cn(
        "border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em]",
        styles[tier] ?? styles.Rookie,
        className,
      )}
    >
      {tier}
    </span>
  );
}

export function Lives({ remaining, total = 3 }: { remaining: number; total?: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "size-3 rotate-45 border",
            i < remaining ? "border-primary bg-primary" : "border-border bg-surface-2",
          )}
        />
      ))}
    </div>
  );
}
