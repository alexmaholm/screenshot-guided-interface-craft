import type { MacroTargets } from "@/lib/balans";

const ROWS: { key: keyof MacroTargets; label: string; unit: string; color: string }[] = [
  { key: "kcal", label: "Energi", unit: "kcal", color: "bg-coral" },
  { key: "protein", label: "Protein", unit: "g", color: "bg-primary" },
  { key: "carbs", label: "Kolhydrater", unit: "g", color: "bg-mint" },
  { key: "fat", label: "Fett", unit: "g", color: "bg-secondary-foreground/60" },
];

export function MacroSummary({ eaten, target, showKcal }: { eaten: MacroTargets; target: MacroTargets; showKcal: boolean }) {
  return (
    <div className="space-y-3">
      {ROWS.filter((r) => showKcal || r.key !== "kcal").map((r) => {
        const pct = Math.min(100, Math.round((eaten[r.key] / Math.max(1, target[r.key])) * 100));
        const left = target[r.key] - eaten[r.key];
        return (
          <div key={r.key}>
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-medium">{r.label}</span>
              <span className="text-muted-foreground">
                {eaten[r.key]} / {target[r.key]} {r.unit}
                {left > 0 ? ` · ${left} kvar` : " · målet nått"}
              </span>
            </div>
            <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label={r.label} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
              <div className={`h-full rounded-full ${r.color} transition-all`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
