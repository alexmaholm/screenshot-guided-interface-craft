import { useState } from "react";
import type { Workout } from "@/lib/balans";
import { prettyDate } from "@/lib/balans";
import { strengthHistory, trackedExercises } from "@/lib/progress";

/** Line chart of heaviest weight per session for a chosen exercise, with personal best. */
export function StrengthProgress({ workouts }: { workouts: Workout[] }) {
  const names = trackedExercises(workouts);
  const [sel, setSel] = useState<string | undefined>();
  const name = sel && names.includes(sel) ? sel : names[0];

  if (!name) return (
    <section className="card-soft p-5">
      <h2 className="text-lg font-semibold">Styrkeutveckling</h2>
      <p className="mt-2 text-sm text-muted-foreground">Logga vikt i ett pass så växer din styrkegraf fram här.</p>
    </section>
  );

  const pts = strengthHistory(name, workouts);
  const max = Math.max(...pts.map((p) => p.kg));
  const min = Math.min(...pts.map((p) => p.kg));
  const range = max - min || 1;
  const W = 300, H = 120, pad = 10;
  const xy = pts.map((p, i) => [pad + (pts.length === 1 ? (W - 2 * pad) / 2 : (i * (W - 2 * pad)) / (pts.length - 1)), H - pad - ((p.kg - min) / range) * (H - 2 * pad)] as const);
  const first = pts[0]!, last = pts[pts.length - 1]!;
  const diff = Math.round((last.kg - first.kg) * 10) / 10;

  return (
    <section className="card-soft p-5">
      <h2 className="text-lg font-semibold">Styrkeutveckling</h2>
      <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1">
        {names.map((n) => <button key={n} className="chip shrink-0" aria-pressed={n === name} onClick={() => setSel(n)}>{n}</button>)}
      </div>
      <div className="mt-3 flex gap-3">
        <div className="flex-1 rounded-2xl bg-secondary p-3"><p className="text-xs text-muted-foreground">Personbästa</p><p className="text-xl font-bold">{max} kg</p></div>
        <div className="flex-1 rounded-2xl bg-muted p-3"><p className="text-xs text-muted-foreground">Sedan start</p><p className="text-xl font-bold">{diff > 0 ? `+${diff}` : diff} kg</p></div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 h-32 w-full" role="img" aria-label={`Styrkegraf för ${name}`}>
        <polyline points={xy.map((p) => p.join(",")).join(" ")} fill="none" className="stroke-primary" strokeWidth="2.5" strokeLinejoin="round" />
        {xy.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={pts[i]!.kg === max ? 5 : 3.5} className={pts[i]!.kg === max ? "fill-coral" : "fill-primary"} />)}
      </svg>
      <div className="flex justify-between text-[11px] text-muted-foreground"><span>{prettyDate(first.date)}</span><span>{prettyDate(last.date)}</span></div>
    </section>
  );
}
