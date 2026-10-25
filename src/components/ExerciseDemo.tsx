import type { ExercisePreset } from "@/lib/exercises";

type P = [number, number];
interface Pose { head: P; neck: P; hip: P; knee: P; foot: P; elbow: P; hand: P }
export type Pattern = "squat" | "hinge" | "press" | "pull" | "curl" | "core" | "cardio";

const stand = { head: [50, 18], neck: [50, 28], hip: [50, 58], knee: [50, 75], foot: [50, 92] } as const;
const POSES: Record<Pattern, [Pose, Pose]> = {
  squat: [
    { ...stand, elbow: [60, 34], hand: [70, 32] } as Pose,
    { head: [44, 38], neck: [46, 48], hip: [34, 68], knee: [58, 72], foot: [50, 92], elbow: [58, 50], hand: [70, 48] },
  ],
  hinge: [
    { ...stand, elbow: [52, 43], hand: [52, 57] } as Pose,
    { head: [72, 40], neck: [64, 44], hip: [44, 58], knee: [48, 75], foot: [48, 92], elbow: [64, 58], hand: [64, 72] },
  ],
  press: [
    { ...stand, elbow: [62, 36], hand: [60, 24] } as Pose,
    { ...stand, elbow: [55, 17], hand: [53, 5] } as Pose,
  ],
  pull: [
    { ...stand, elbow: [64, 34], hand: [80, 36] } as Pose,
    { ...stand, elbow: [40, 38], hand: [56, 34] } as Pose,
  ],
  curl: [
    { ...stand, elbow: [52, 44], hand: [55, 60] } as Pose,
    { ...stand, elbow: [52, 44], hand: [60, 30] } as Pose,
  ],
  core: [
    { head: [18, 82], neck: [27, 84], hip: [55, 86], knee: [70, 70], foot: [84, 90], elbow: [30, 76], hand: [24, 72] },
    { head: [30, 64], neck: [36, 72], hip: [55, 86], knee: [70, 70], foot: [84, 90], elbow: [44, 68], hand: [52, 64] },
  ],
  cardio: [
    { ...stand, knee: [42, 75], foot: [38, 92], elbow: [42, 36], hand: [36, 44] } as Pose,
    { ...stand, knee: [62, 68], foot: [58, 86], elbow: [60, 22], hand: [66, 14] } as Pose,
  ],
};

export function patternFor(ex: Pick<ExercisePreset, "name" | "muscle">): Pattern {
  const n = ex.name.toLowerCase();
  if (/knäböj|squat|utfall|benpress|bulgar|wall sit|steg|bensträck|thruster/.test(n)) return "squat";
  if (/marklyft|good morning|sving|hyperext|ryggres|höftlyft|bridge|hip/.test(n)) return "hinge";
  if (/curl/.test(n)) return "curl";
  if (/rodd|drag|chins|pull|face|row/.test(n)) return "pull";
  if (/press|armhäv|dips|flyes|lyft|pec|push/.test(n)) return "press";
  const m: Record<string, Pattern> = { bröst: "press", axlar: "press", rygg: "pull", armar: "curl", ben: "squat", rumpa: "hinge", bål: "core" };
  return m[ex.muscle] ?? "cardio";
}

const SEGS: [keyof Pose, keyof Pose][] = [["neck", "hip"], ["hip", "knee"], ["knee", "foot"], ["neck", "elbow"], ["elbow", "hand"]];

/** Loopande rörelsedemonstration (start → vändläge → start). */
export function ExerciseDemo({ ex, className = "" }: { ex: Pick<ExercisePreset, "name" | "muscle" | "track">; className?: string }) {
  const [a, b] = POSES[patternFor(ex)];
  const dur = "2.4s";
  const v = (p: keyof Pose, i: 0 | 1) => `${a[p][i]};${b[p][i]};${a[p][i]}`;
  const anim = (attr: string, values: string) => (
    <animate attributeName={attr} values={values} dur={dur} repeatCount="indefinite" calcMode="spline" keyTimes="0;0.5;1" keySplines="0.45 0 0.55 1;0.45 0 0.55 1" />
  );
  return (
    <svg viewBox="0 0 100 100" role="img" aria-label={`Rörelsedemonstration: ${ex.name}`} className={`rounded-2xl bg-secondary ${className}`}>
      <line x1="10" y1="93" x2="90" y2="93" className="stroke-border" strokeWidth="2" strokeLinecap="round" />
      <g className="stroke-primary" strokeWidth="5" strokeLinecap="round" fill="none">
        {SEGS.map(([p, q]) => (
          <line key={p + q} x1={a[p][0]} y1={a[p][1]} x2={a[q][0]} y2={a[q][1]}>
            {anim("x1", v(p, 0))}{anim("y1", v(p, 1))}{anim("x2", v(q, 0))}{anim("y2", v(q, 1))}
          </line>
        ))}
      </g>
      <circle r="6" cx={a.head[0]} cy={a.head[1]} className="fill-primary">{anim("cx", v("head", 0))}{anim("cy", v("head", 1))}</circle>
      {ex.track === "vikt" && (
        <circle r="4" cx={a.hand[0]} cy={a.hand[1]} className="fill-coral">{anim("cx", v("hand", 0))}{anim("cy", v("hand", 1))}</circle>
      )}
    </svg>
  );
}
