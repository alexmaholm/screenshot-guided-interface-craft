import type { MacroTargets } from "@/lib/balans";

const ROWS: { key: keyof MacroTargets; label: string; unit: string; color: string }[] = [
  { key: "kcal", label: "Energi", unit: "kcal", color: "bg-primary" },
  { key: "protein", label: "Protein", unit: "g", color: "bg-primary" },
  { key: "carbs", label: "Kolhydrater", unit: "g", color: "bg-foreground/70" },
  { key: "fat", label: "Fett", unit: "g", color: "bg-foreground/40" },
];

export function MacroSummary({ eaten, target, showKcal }: { eaten: MacroTargets; target: MacroTargets; showKcal: boolean }) {
  return (
    <div className="space-y-4">
      {ROWS.filter((r) => showKcal || r.key !== "kcal").map((r) => {
        const pct = Math.min(100, Math.round((eaten[r.key] / Math.max(1, target[r.key])) * 100));
        const left = target[r.key] - eaten[r.key];
        return (
          <div key={r.key}>
            <div className="flex items-baseline justify-between text-sm">
              <span className="label-xs text-muted-foreground">{r.label}</span>
              <span className="telemetry text-xs">
                {eaten[r.key]}<span className="text-muted-foreground"> / {target[r.key]} {r.unit}{left > 0 ? ` · ${left} kvar` : " · nått"}</span>
              </span>
            </div>
            <div className="mt-2 h-[2px] overflow-hidden bg-border" role="progressbar" aria-label={r.label} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
              <div className={`h-full ${r.color} transition-all duration-500`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
