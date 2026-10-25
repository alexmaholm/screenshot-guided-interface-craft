import { useState } from "react";
import type { Workout } from "@/lib/balans";
import { MUSCLES, muscleRecovery, recoveryStatus, type Muscle } from "@/lib/exercises";

type Region = { m: Muscle; d: string };
// Athletic, gender-neutral mannequin, viewBox 0 0 100 200 (symmetric around x=50)
const BODY =
  "M50 8 C57 8 61 13 61 20 C61 27 57 32 54 33 L54 37 C62 38 70 40 75 44 C80 47 82 53 82 60 L84 82 C85 90 84 98 82 104 L78 104 C77 96 76 88 75 82 L72 64 C71 72 69 80 68 88 C69 94 69 100 68 106 L66 140 C66 152 65 166 63 186 L55 186 C54 168 53 150 52 132 L50 110 L48 132 C47 150 46 168 45 186 L37 186 C35 166 34 152 34 140 L32 106 C31 100 31 94 32 88 C31 80 29 72 28 64 L25 82 C24 88 23 96 22 104 L18 104 C16 98 15 90 16 82 L18 60 C18 53 20 47 25 44 C30 40 38 38 46 37 L46 33 C43 32 39 27 39 20 C39 13 43 8 50 8 Z";
const SHOULDERS = "M25 45 C20 48 18 54 19 62 C22 58 26 54 30 52 C31 48 29 45 25 45 Z M75 45 C80 48 82 54 81 62 C78 58 74 54 70 52 C69 48 71 45 75 45 Z";
const ARMS = "M19 64 C21 60 25 56 29 55 L28 66 C26 74 24 80 23 84 L17 83 C16 76 17 69 19 64 Z M81 64 C79 60 75 56 71 55 L72 66 C74 74 76 80 77 84 L83 83 C84 76 83 69 81 64 Z";
const FRONT: Region[] = [
  { m: "axlar", d: SHOULDERS },
  { m: "bröst", d: "M32 47 C38 44 46 45 49 47 L49 60 C43 63 36 62 32 58 C31 54 31 50 32 47 Z M68 47 C62 44 54 45 51 47 L51 60 C57 63 64 62 68 58 C69 54 69 50 68 47 Z" },
  { m: "armar", d: ARMS },
  { m: "bål", d: "M35 63 C40 65 46 65 49 64 L49 96 C44 97 38 95 34 91 C34 82 34 72 35 63 Z M65 63 C60 65 54 65 51 64 L51 96 C56 97 62 95 66 91 C66 82 66 72 65 63 Z" },
  { m: "ben", d: "M34 104 C38 101 44 101 49 104 L47 134 C45 140 40 141 37 138 C35 128 34 116 34 104 Z M66 104 C62 101 56 101 51 104 L53 134 C55 140 60 141 63 138 C65 128 66 116 66 104 Z M37 146 C40 144 44 144 46 146 L45 176 L39 176 C37 166 36 156 37 146 Z M63 146 C60 144 56 144 54 146 L55 176 L61 176 C63 166 64 156 63 146 Z" },
];
const BACK: Region[] = [
  { m: "axlar", d: SHOULDERS },
  { m: "rygg", d: "M42 38 C46 40 54 40 58 38 C64 40 69 43 70 50 C69 62 64 76 52 88 L48 88 C36 76 31 62 30 50 C31 43 36 40 42 38 Z" },
  { m: "armar", d: ARMS },
  { m: "rumpa", d: "M33 92 C38 90 45 91 49 94 L49 110 C43 113 36 112 33 107 C32 102 32 97 33 92 Z M67 92 C62 90 55 91 51 94 L51 110 C57 113 64 112 67 107 C68 102 68 97 67 92 Z" },
  { m: "ben", d: "M34 114 C38 116 44 116 48 114 L47 136 C44 140 39 140 36 137 C35 130 34 122 34 114 Z M66 114 C62 116 56 116 52 114 L53 136 C56 140 61 140 64 137 C65 130 66 122 66 114 Z M37 145 C40 143 44 143 46 145 L45 176 L39 176 C36 166 36 155 37 145 Z M63 145 C60 143 56 143 54 145 L55 176 L61 176 C64 166 64 155 63 145 Z" },
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
          <path d={BODY} className="fill-muted" />
          {regions.map((r) => (
            <path key={r.m} d={r.d} className={`${FILL[recoveryStatus(days(r.m)).tone]} stroke-muted`} strokeWidth="1" strokeLinejoin="round" opacity="0.92" />
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
