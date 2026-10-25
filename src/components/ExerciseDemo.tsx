import type { ReactNode } from "react";
import type { ExercisePreset } from "@/lib/exercises";

type P = [number, number];
type J = "head" | "sh" | "hip" | "kn" | "ft" | "el" | "ha" | "kn2" | "ft2" | "el2" | "ha2";
type Pose = Record<J, P>;
type Partial2 = Partial<Pose> & Pick<Pose, "head" | "sh" | "hip" | "kn" | "ft" | "el" | "ha">;
export type Pattern =
  | "squat" | "lunge" | "hinge" | "bench" | "pushup" | "ohp" | "vpull" | "row" | "curl" | "triceps" | "core" | "cardio";
type Gear = "barbell" | "dumbbell" | "none";

const full = (p: Partial2): Pose => ({
  kn2: [p.kn[0] - 3, p.kn[1]], ft2: [p.ft[0] - 3, p.ft[1]], el2: [p.el[0] - 3, p.el[1]], ha2: [p.ha[0] - 3, p.ha[1]], ...p,
});
const stand = { head: [50, 15], sh: [50, 27], hip: [50, 55], kn: [51, 73], ft: [50, 91] } as const;
const S = (o: Partial<Pose>) => full({ ...stand, el: [52, 41], ha: [53, 55], ...o } as Partial2);

interface Scene { a: Pose; b: Pose; gear: Gear; labels: [string, string]; bench?: boolean; bar?: boolean; mat?: boolean }

const SCENES: Record<Pattern, Scene> = {
  squat: {
    gear: "barbell", labels: ["Stå upp", "Sitt ner djupt"],
    a: S({ el: [42, 32], ha: [49, 25], el2: [40, 32], ha2: [47, 25] }),
    b: full({ head: [58, 39], sh: [55, 50], hip: [35, 66], kn: [58, 70], ft: [50, 91], el: [46, 55], ha: [53, 48], el2: [44, 55], ha2: [51, 48] }),
  },
  lunge: {
    gear: "dumbbell", labels: ["Stå upp", "Kliv fram och sänk"],
    a: S({}),
    b: full({ head: [50, 30], sh: [50, 42], hip: [48, 68], kn: [64, 72], ft: [66, 91], kn2: [38, 86], ft2: [26, 91], el: [50, 56], ha: [51, 70] }),
  },
  hinge: {
    gear: "barbell", labels: ["Stången nere", "Res dig, höften fram"],
    a: full({ head: [72, 40], sh: [65, 45], hip: [42, 56], kn: [54, 72], ft: [50, 91], el: [63, 62], ha: [61, 80] }),
    b: S({ el: [51, 42], ha: [53, 58] }),
  },
  bench: {
    gear: "barbell", bench: true, labels: ["Sänk till bröstet", "Pressa upp"],
    a: full({ head: [22, 58], sh: [32, 60], hip: [60, 61], kn: [74, 66], ft: [80, 91], el: [40, 66], ha: [36, 50] }),
    b: full({ head: [22, 58], sh: [32, 60], hip: [60, 61], kn: [74, 66], ft: [80, 91], el: [36, 46], ha: [34, 30] }),
  },
  pushup: {
    gear: "none", mat: true, labels: ["Armarna raka", "Bröstet mot golvet"],
    a: full({ head: [79, 60], sh: [70, 65], hip: [45, 72], kn: [31, 78], ft: [16, 88], el: [70, 78], ha: [70, 91] }),
    b: full({ head: [80, 78], sh: [70, 81], hip: [45, 84], kn: [31, 86], ft: [16, 89], el: [58, 80], ha: [70, 91] }),
  },
  ohp: {
    gear: "dumbbell", labels: ["Vid axlarna", "Pressa rakt upp"],
    a: S({ el: [60, 34], ha: [57, 22] }),
    b: S({ el: [54, 13], ha: [52, 1] }),
  },
  vpull: {
    gear: "none", bar: true, labels: ["Häng med raka armar", "Dra bröstet mot stången"],
    a: full({ head: [50, 30], sh: [50, 40], hip: [50, 66], kn: [53, 79], ft: [49, 93], el: [52, 22], ha: [50, 7] }),
    b: full({ head: [50, 14], sh: [50, 25], hip: [50, 51], kn: [55, 64], ft: [50, 78], el: [38, 22], ha: [50, 7] }),
  },
  row: {
    gear: "barbell", labels: ["Armarna raka", "Dra mot magen"],
    a: full({ head: [72, 36], sh: [64, 41], hip: [41, 53], kn: [49, 73], ft: [47, 91], el: [64, 56], ha: [63, 70] }),
    b: full({ head: [72, 36], sh: [64, 41], hip: [41, 53], kn: [49, 73], ft: [47, 91], el: [49, 44], ha: [57, 55] }),
  },
  curl: {
    gear: "dumbbell", labels: ["Armen rak", "Böj upp, armbågen still"],
    a: S({ el: [52, 42], ha: [55, 58] }),
    b: S({ el: [52, 42], ha: [60, 29] }),
  },
  triceps: {
    gear: "dumbbell", labels: ["Armbågen böjd", "Sträck ut armen"],
    a: S({ el: [52, 42], ha: [61, 33] }),
    b: S({ el: [52, 42], ha: [55, 60] }),
  },
  core: {
    gear: "none", mat: true, labels: ["Ligg ner", "Rulla upp överkroppen"],
    a: full({ head: [17, 83], sh: [27, 85], hip: [55, 87], kn: [70, 70], ft: [84, 90], el: [30, 76], ha: [22, 74] }),
    b: full({ head: [31, 63], sh: [37, 72], hip: [55, 87], kn: [70, 70], ft: [84, 90], el: [45, 67], ha: [53, 63] }),
  },
  cardio: {
    gear: "none", labels: ["Vänster fram", "Höger fram"],
    a: S({ head: [53, 15], sh: [52, 27], kn: [62, 68], ft: [58, 85], kn2: [42, 75], ft2: [34, 88], el: [44, 38], ha: [50, 48], el2: [60, 36], ha2: [68, 28] }),
    b: S({ head: [53, 15], sh: [52, 27], kn: [42, 75], ft: [34, 88], kn2: [62, 68], ft2: [58, 85], el: [60, 36], ha: [68, 28], el2: [44, 38], ha2: [50, 48] }),
  },
};

export function patternFor(ex: Pick<ExercisePreset, "name" | "muscle">): Pattern {
  const n = ex.name.toLowerCase();
  if (/utfall|bulgar|steg|lunge|step/.test(n)) return "lunge";
  if (/knäböj|squat|benpress|wall sit|bensträck|thruster|hack/.test(n)) return "squat";
  if (/marklyft|good morning|sving|hyperext|ryggres|höftlyft|bridge|hip|rdl/.test(n)) return "hinge";
  if (/triceps|dips|pushdown|french|skull/.test(n)) return "triceps";
  if (/curl/.test(n)) return "curl";
  if (/chins|pull-?up|latsdrag|lat pull|pulldown/.test(n)) return "vpull";
  if (/rodd|row|face|drag/.test(n)) return "row";
  if (/armhäv|push-?up/.test(n)) return "pushup";
  if (/bänk|bröstpress|flyes|pec|bench|chest/.test(n)) return "bench";
  if (/axelpress|militär|overhead|sidolyft|press|lyft/.test(n)) return "ohp";
  if (/crunch|sit-?up|planka|plank|situp|mage|bål/.test(n)) return "core";
  const m: Record<string, Pattern> = { bröst: "bench", axlar: "ohp", rygg: "row", armar: "curl", ben: "squat", rumpa: "hinge", bål: "core" };
  return m[ex.muscle] ?? "cardio";
}

const DUR = "2.6s";
const ease = { calcMode: "spline", keyTimes: "0;0.5;1", keySplines: "0.45 0 0.55 1;0.45 0 0.55 1" } as const;

/** Loopande rörelsedemonstration anpassad efter övningstyp (start → vändläge → start). */
export function ExerciseDemo({ ex, className = "" }: { ex: Pick<ExercisePreset, "name" | "muscle" | "track">; className?: string }) {
  const sc = SCENES[patternFor(ex)];
  const { a, b } = sc;
  const v = (p: J, i: 0 | 1, dx = 0) => `${a[p][i] + dx};${b[p][i] + dx};${a[p][i] + dx}`;
  const an = (attr: string, values: string) => <animate attributeName={attr} values={values} dur={DUR} repeatCount="indefinite" {...ease} />;
  const seg = (p: J, q: J, w: number, cls: string) => (
    <line x1={a[p][0]} y1={a[p][1]} x2={a[q][0]} y2={a[q][1]} strokeWidth={w} strokeLinecap="round" className={cls}>
      {an("x1", v(p, 0))}{an("y1", v(p, 1))}{an("x2", v(q, 0))}{an("y2", v(q, 1))}
    </line>
  );
  const at = (p: J, child: (x: number, y: number) => ReactNode) => (
    <g>
      <animateTransform attributeName="transform" type="translate" dur={DUR} repeatCount="indefinite" {...ease}
        values={`${a[p][0]} ${a[p][1]};${b[p][0]} ${b[p][1]};${a[p][0]} ${a[p][1]}`} />
      {child(0, 0)}
    </g>
  );
  const fade = (from: number) => (
    <animate attributeName="opacity" values={`${from};${1 - from};${from}`} keyTimes="0;0.5;1" dur={DUR} repeatCount="indefinite" calcMode="discrete" />
  );
  const back = "stroke-primary/40";
  const front = "stroke-primary";

  return (
    <svg viewBox="0 0 100 112" role="img" aria-label={`Rörelsedemonstration: ${ex.name}`} className={`rounded-2xl bg-secondary ${className}`}>
      <line x1="6" y1="93" x2="94" y2="93" className="stroke-border" strokeWidth="2" strokeLinecap="round" />
      {sc.mat && <rect x="8" y="91" width="84" height="3" rx="1.5" className="fill-accent" />}
      {sc.bar && <g className="stroke-muted-foreground" strokeWidth="2.5" strokeLinecap="round"><line x1="28" y1="7" x2="72" y2="7" /><line x1="30" y1="7" x2="30" y2="2" /><line x1="70" y1="7" x2="70" y2="2" /></g>}
      {sc.bench && (
        <g className="fill-muted-foreground/60">
          <rect x="14" y="63" width="58" height="5" rx="2.5" />
          <rect x="20" y="68" width="3" height="25" /><rect x="64" y="68" width="3" height="25" />
        </g>
      )}
      {/* bortre arm och ben */}
      {seg("hip", "kn2", 8, back)}{seg("kn2", "ft2", 7, back)}
      {seg("sh", "el2", 6.5, back)}{seg("el2", "ha2", 5.5, back)}
      {/* bål */}
      {seg("sh", "hip", 13, front)}
      {seg("hip", "kn", 9, front)}{seg("kn", "ft", 7.5, front)}
      {seg("sh", "el", 7, front)}{seg("el", "ha", 6, front)}
      <circle r="6.5" cx={a.head[0]} cy={a.head[1]} className="fill-primary">{an("cx", v("head", 0))}{an("cy", v("head", 1))}</circle>
      {sc.gear === "barbell" && at("ha", () => (
        <g><circle r="8" className="fill-coral" /><circle r="2.2" className="fill-secondary" /></g>
      ))}
      {sc.gear === "dumbbell" && at("ha", () => (
        <g className="fill-coral"><rect x="-6" y="-2" width="12" height="4" rx="1" /><rect x="-7" y="-4.5" width="4" height="9" rx="1.5" /><rect x="3" y="-4.5" width="4" height="9" rx="1.5" /></g>
      ))}
      <g className="fill-foreground" fontSize="7" fontWeight="600" textAnchor="middle">
        <text x="50" y="106" opacity="1">{fade(1)}1 · {sc.labels[0]}</text>
        <text x="50" y="106" opacity="0">{fade(0)}2 · {sc.labels[1]}</text>
      </g>
    </svg>
  );
}
