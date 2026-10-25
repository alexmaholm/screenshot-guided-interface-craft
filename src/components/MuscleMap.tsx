import { useState } from "react";
import type { Workout } from "@/lib/balans";
import { MUSCLES, muscleRecovery, recoveryStatus, type Muscle } from "@/lib/exercises";

type Region = { m: Muscle; d: string };
// Simplified silhouette, viewBox 0 0 100 200
const FRONT: Region[] = [
  { m: "axlar", d: "M28 42 q-8 2 -9 12 l9 2 z M72 42 q8 2 9 12 l-9 2 z" },
  { m: "bröst", d: "M30 44 h40 v16 q-20 6 -40 0 z" },
  { m: "armar", d: "M19 56 l9 2 l-2 30 l-8 -1 z M81 56 l-9 2 l2 30 l8 -1 z" },
  { m: "bål", d: "M32 62 q18 5 36 0 l-2 34 h-32 z" },
  { m: "ben", d: "M34 100 h14 l-2 70 h-10 z M52 100 h14 l-2 70 h-10 z" },
];
const BACK: Region[] = [
  { m: "axlar", d: "M28 42 q-8 2 -9 12 l9 2 z M72 42 q8 2 9 12 l-9 2 z" },
  { m: "rygg", d: "M30 44 h40 l-3 40 h-34 z" },
  { m: "armar", d: "M19 56 l9 2 l-2 30 l-8 -1 z M81 56 l-9 2 l2 30 l8 -1 z" },
  { m: "rumpa", d: "M33 86 h34 l1 18 h-36 z" },
  { m: "ben", d: "M34 106 h14 l-2 64 h-10 z M52 106 h14 l-2 64 h-10 z" },
];

const FILL = { redo: "fill-secondary", snart: "fill-amber", vila: "fill-coral" } as const;

/** Front/back body map coloured by days since each muscle group was trained. */
export function MuscleMap({ workouts, today }: { workouts: Workout[]; today: string }) {
  const [side, setSide] = useState<"fram" | "bak">("fram");
  const rec = muscleRecovery(workouts, today);
  const days = (m: Muscle) => {
    const vals = [rec[m], rec.helkropp].filter((v): v is number => v !== undefined);
    return vals.length ? Math.min(...vals) : undefined;
  };
  const regions = side === "fram" ? FRONT : BACK;
  const shown = [...new Set(regions.map((r) => r.m))];

  return (
    <section className="card-soft p-4" aria-label="Muskelkarta">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Muskelkarta</h2>
        <div className="flex gap-1">
          <button className="chip" aria-pressed={side === "fram"} onClick={() => setSide("fram")}>Fram</button>
          <button className="chip" aria-pressed={side === "bak"} onClick={() => setSide("bak")}>Bak</button>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-4">
        <svg viewBox="0 0 100 200" className="h-56 w-28 shrink-0" role="img" aria-label={`Muskelkarta ${side}sida`}>
          <circle cx="50" cy="22" r="12" className="fill-muted" />
          <rect x="45" y="33" width="10" height="9" className="fill-muted" />
          {regions.map((r) => (
            <path key={r.m} d={r.d} className={`${FILL[recoveryStatus(days(r.m)).tone]} stroke-background`} strokeWidth="1.5" />
          ))}
        </svg>
        <ul className="flex-1 space-y-1.5 text-xs">
          {shown.map((m) => {
            const st = recoveryStatus(days(m));
            return (
              <li key={m} className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${FILL[st.tone].replace("fill-", "bg-")}`} />
                <span className="font-medium">{MUSCLES.find((x) => x.value === m)?.label}</span>
                <span className="ml-auto text-muted-foreground">{st.label}</span>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="mt-3 flex gap-3 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-secondary" />Redo</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber" />Återhämtar</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-coral" />Vila</span>
      </div>
    </section>
  );
}
