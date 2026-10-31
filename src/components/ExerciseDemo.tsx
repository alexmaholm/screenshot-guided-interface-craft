import { useEffect, useState, type ReactNode } from "react";
import type { ExercisePreset } from "@/lib/exercises";

type P = [number, number];
type J = "head" | "sh" | "hip" | "kn" | "ft" | "el" | "ha" | "kn2" | "ft2" | "el2" | "ha2";
type Pose = Record<J, P>;
type Base = Partial<Pose> & Pick<Pose, "head" | "sh" | "hip" | "kn" | "ft" | "el" | "ha">;
export type Pattern =
  | "squat" | "lunge" | "hinge" | "bench" | "fly" | "pushup" | "ohp" | "lateral" | "front" | "shrug"
  | "vpull" | "row" | "curl" | "triceps" | "kickback" | "dips" | "core" | "plank" | "rollout"
  | "legraise" | "hang" | "climber" | "bridge" | "hipthrust" | "glute" | "calf" | "legext" | "legcurl"
  | "sled" | "cardio";
type Gear = "barbell" | "dumbbell" | "wheel" | "kettlebell" | "cable" | "band" | "none";
type Seg = "torso" | "thigh" | "shin" | "upper" | "fore";

const full = (p: Base): Pose => ({
  kn2: [p.kn[0] - 3, p.kn[1]], ft2: [p.ft[0] - 3, p.ft[1]], el2: [p.el[0] - 3, p.el[1]], ha2: [p.ha[0] - 3, p.ha[1]], ...p,
});
const stand = { head: [50, 15], sh: [50, 27], hip: [50, 55], kn: [51, 73], ft: [50, 91] } as const;
const S = (o: Partial<Pose>) => full({ ...stand, el: [52, 41], ha: [53, 55], ...o } as Base);
/** Framifrån: armar och ben speglade. */
const F = (o: Partial<Pose>) => S({ kn: [55, 73], ft: [57, 91], kn2: [45, 73], ft2: [43, 91], el: [57, 41], ha: [58, 55], el2: [43, 41], ha2: [42, 55], ...o });

interface Scene {
  a: Pose; b: Pose; gear: Gear; gearAt?: J; labels: [string, string]; work: Seg[];
  bench?: "high" | "low" | "seat"; bar?: boolean; mat?: boolean; dipbars?: boolean; sled?: boolean;
}

const benchLie: Pick<Pose, "head" | "sh" | "hip" | "kn" | "ft"> = { head: [22, 56], sh: [31, 59], hip: [58, 60], kn: [73, 66], ft: [80, 91] };
const bentOver: Pick<Pose, "head" | "sh" | "hip" | "kn" | "ft"> = { head: [72, 36], sh: [64, 41], hip: [41, 53], kn: [49, 73], ft: [47, 91] };
const plankBody: Pick<Pose, "head" | "sh" | "hip" | "kn" | "ft"> = { head: [80, 70], sh: [71, 75], hip: [46, 78], kn: [31, 82], ft: [16, 88] };

const SCENES: Record<Pattern, Scene> = {
  squat: {
    gear: "barbell", work: ["thigh"], labels: ["Stå upp", "Sitt ner djupt"],
    a: S({ el: [42, 32], ha: [49, 25], el2: [40, 32], ha2: [47, 25] }),
    b: full({ head: [58, 39], sh: [55, 50], hip: [35, 66], kn: [58, 70], ft: [50, 91], el: [46, 55], ha: [53, 48], el2: [44, 55], ha2: [51, 48] }),
  },
  lunge: {
    gear: "dumbbell", work: ["thigh"], labels: ["Stå upp", "Kliv fram och sänk"],
    a: S({}),
    b: full({ head: [50, 30], sh: [50, 42], hip: [48, 68], kn: [64, 72], ft: [66, 91], kn2: [38, 86], ft2: [26, 91], el: [50, 56], ha: [51, 70] }),
  },
  hinge: {
    gear: "barbell", work: ["torso", "thigh"], labels: ["Stången nere, rak rygg", "Res dig, höften fram"],
    a: full({ head: [72, 40], sh: [65, 45], hip: [42, 56], kn: [54, 72], ft: [50, 91], el: [63, 62], ha: [61, 80] }),
    b: S({ el: [51, 42], ha: [53, 58] }),
  },
  bench: {
    gear: "barbell", bench: "high", work: ["torso", "upper"], labels: ["Sänk till bröstet", "Pressa upp"],
    a: full({ ...benchLie, el: [40, 66], ha: [36, 50] }),
    b: full({ ...benchLie, el: [36, 46], ha: [34, 30] }),
  },
  fly: {
    gear: "dumbbell", bench: "high", work: ["torso", "upper"], labels: ["Armarna ihop ovanför bröstet", "Öppna i en vid båge"],
    a: full({ ...benchLie, el: [35, 45], ha: [33, 31] }),
    b: full({ ...benchLie, el: [36, 70], ha: [30, 80], el2: [34, 70], ha2: [28, 80] }),
  },
  pushup: {
    gear: "none", mat: true, work: ["torso", "upper"], labels: ["Armarna raka", "Bröstet mot golvet"],
    a: full({ head: [79, 60], sh: [70, 65], hip: [45, 72], kn: [31, 78], ft: [16, 88], el: [70, 78], ha: [70, 91] }),
    b: full({ head: [80, 78], sh: [70, 81], hip: [45, 84], kn: [31, 86], ft: [16, 89], el: [58, 80], ha: [70, 91] }),
  },
  ohp: {
    gear: "dumbbell", work: ["upper"], labels: ["Vid axlarna", "Pressa rakt upp"],
    a: S({ el: [60, 34], ha: [57, 22] }),
    b: S({ el: [54, 13], ha: [52, 1] }),
  },
  lateral: {
    gear: "dumbbell", work: ["upper"], labels: ["Armarna längs sidan", "Lyft ut till axelhöjd"],
    a: F({}),
    b: F({ el: [63, 30], ha: [75, 29], el2: [37, 30], ha2: [25, 29] }),
  },
  front: {
    gear: "dumbbell", work: ["upper"], labels: ["Armarna nere", "Lyft rakt fram"],
    a: S({ el: [51, 42], ha: [52, 56] }),
    b: S({ el: [62, 28], ha: [74, 28] }),
  },
  shrug: {
    gear: "barbell", work: ["upper", "torso"], labels: ["Axlarna nere", "Dra upp mot öronen"],
    a: S({ el: [51, 42], ha: [52, 57] }),
    b: S({ head: [50, 13], sh: [50, 23], el: [51, 38], ha: [52, 53] }),
  },
  vpull: {
    gear: "none", bar: true, work: ["torso", "upper"], labels: ["Häng med raka armar", "Dra bröstet mot stången"],
    a: full({ head: [50, 30], sh: [50, 40], hip: [50, 66], kn: [53, 79], ft: [49, 93], el: [52, 22], ha: [50, 7] }),
    b: full({ head: [50, 14], sh: [50, 25], hip: [50, 51], kn: [55, 64], ft: [50, 78], el: [38, 22], ha: [50, 7] }),
  },
  row: {
    gear: "barbell", work: ["torso", "upper"], labels: ["Armarna raka", "Dra mot magen"],
    a: full({ ...bentOver, el: [64, 56], ha: [63, 70] }),
    b: full({ ...bentOver, el: [49, 44], ha: [57, 55] }),
  },
  curl: {
    gear: "dumbbell", work: ["upper", "fore"], labels: ["Armen rak", "Böj upp, armbågen still"],
    a: S({ el: [52, 42], ha: [55, 58] }),
    b: S({ el: [52, 42], ha: [60, 29] }),
  },
  triceps: {
    gear: "dumbbell", work: ["upper"], labels: ["Armbågen böjd", "Sträck ut armen"],
    a: S({ el: [52, 42], ha: [61, 33] }),
    b: S({ el: [52, 42], ha: [55, 60] }),
  },
  kickback: {
    gear: "dumbbell", work: ["upper"], labels: ["Överarmen still, armbågen böjd", "Sträck armen bakåt"],
    a: full({ ...bentOver, el: [52, 48], ha: [55, 62] }),
    b: full({ ...bentOver, el: [52, 48], ha: [39, 50] }),
  },
  dips: {
    gear: "none", dipbars: true, work: ["upper", "torso"], labels: ["Armarna raka", "Sänk kroppen kontrollerat"],
    a: full({ head: [50, 18], sh: [50, 30], hip: [50, 56], kn: [46, 72], ft: [58, 80], el: [50, 43], ha: [50, 56] }),
    b: full({ head: [52, 30], sh: [52, 42], hip: [50, 67], kn: [46, 82], ft: [58, 89], el: [38, 49], ha: [50, 56] }),
  },
  core: {
    gear: "none", mat: true, work: ["torso"], labels: ["Ligg ner", "Rulla upp överkroppen"],
    a: full({ head: [17, 83], sh: [27, 85], hip: [55, 87], kn: [70, 70], ft: [84, 90], el: [30, 76], ha: [22, 74] }),
    b: full({ head: [31, 63], sh: [37, 72], hip: [55, 87], kn: [70, 70], ft: [84, 90], el: [45, 67], ha: [53, 63] }),
  },
  plank: {
    gear: "none", mat: true, work: ["torso"], labels: ["Rak linje från häl till huvud", "Spänn magen och håll"],
    a: full({ ...plankBody, el: [71, 90], ha: [81, 90] }),
    b: full({ ...plankBody, hip: [46, 77], el: [71, 90], ha: [81, 90] }),
  },
  rollout: {
    gear: "wheel", mat: true, work: ["torso"], labels: ["På knä, hjulet under axlarna", "Rulla fram och dra tillbaka"],
    a: full({ head: [64, 50], sh: [58, 57], hip: [42, 72], kn: [40, 89], ft: [24, 90], el: [62, 72], ha: [64, 86] }),
    b: full({ head: [80, 72], sh: [72, 77], hip: [52, 83], kn: [40, 89], ft: [24, 90], el: [80, 82], ha: [88, 86] }),
  },
  legraise: {
    gear: "none", mat: true, work: ["torso"], labels: ["Ligg med raka ben", "Lyft benen mot taket"],
    a: full({ head: [16, 84], sh: [26, 86], hip: [52, 88], kn: [68, 88], ft: [84, 89], el: [36, 90], ha: [46, 90] }),
    b: full({ head: [16, 84], sh: [26, 86], hip: [52, 88], kn: [58, 72], ft: [62, 55], el: [36, 90], ha: [46, 90] }),
  },
  hang: {
    gear: "none", bar: true, work: ["torso"], labels: ["Häng still", "Lyft knäna mot bröstet"],
    a: full({ head: [50, 20], sh: [50, 31], hip: [50, 57], kn: [51, 74], ft: [50, 91], el: [51, 19], ha: [50, 7] }),
    b: full({ head: [50, 20], sh: [50, 31], hip: [50, 57], kn: [66, 47], ft: [64, 66], el: [51, 19], ha: [50, 7] }),
  },
  climber: {
    gear: "none", mat: true, work: ["torso", "thigh"], labels: ["Höger knä fram", "Vänster knä fram"],
    a: full({ head: [79, 60], sh: [70, 65], hip: [45, 72], kn: [58, 80], ft: [46, 88], kn2: [31, 78], ft2: [16, 88], el: [70, 78], ha: [70, 91] }),
    b: full({ head: [79, 60], sh: [70, 65], hip: [45, 72], kn: [31, 78], ft: [16, 88], kn2: [58, 80], ft2: [46, 88], el: [70, 78], ha: [70, 91] }),
  },
  bridge: {
    gear: "none", mat: true, work: ["thigh", "torso"], labels: ["Höften nere", "Pressa upp höften"],
    a: full({ head: [14, 86], sh: [24, 88], hip: [46, 88], kn: [62, 72], ft: [70, 91], el: [34, 90], ha: [42, 90] }),
    b: full({ head: [14, 86], sh: [24, 87], hip: [46, 73], kn: [63, 70], ft: [70, 91], el: [34, 90], ha: [42, 90] }),
  },
  hipthrust: {
    gear: "barbell", gearAt: "hip", bench: "low", work: ["thigh", "torso"], labels: ["Skulderbladen mot bänken", "Pressa upp höften"],
    a: full({ head: [16, 64], sh: [26, 68], hip: [44, 84], kn: [62, 72], ft: [68, 91], el: [36, 78], ha: [44, 82] }),
    b: full({ head: [16, 64], sh: [26, 68], hip: [46, 66], kn: [64, 67], ft: [68, 91], el: [38, 64], ha: [46, 64] }),
  },
  glute: {
    gear: "none", work: ["thigh"], labels: ["Stå stabilt", "Spark benet bakåt"],
    a: S({ el: [60, 40], ha: [68, 48] }),
    b: S({ el: [60, 40], ha: [68, 48], kn: [40, 70], ft: [28, 82] }),
  },
  calf: {
    gear: "dumbbell", work: ["shin"], labels: ["Hälarna ner", "Upp på tå"],
    a: S({}),
    b: S({ head: [50, 11], sh: [50, 23], hip: [50, 51], kn: [51, 69], ft: [50, 88], el: [52, 37], ha: [53, 51] }),
  },
  legext: {
    gear: "none", bench: "seat", work: ["thigh"], labels: ["Knäna böjda", "Sträck ut benen"],
    a: full({ head: [36, 22], sh: [37, 34], hip: [40, 60], kn: [60, 60], ft: [62, 84], el: [39, 48], ha: [44, 60] }),
    b: full({ head: [36, 22], sh: [37, 34], hip: [40, 60], kn: [60, 60], ft: [83, 56], el: [39, 48], ha: [44, 60] }),
  },
  legcurl: {
    gear: "none", bench: "high", work: ["thigh"], labels: ["Benen raka", "Böj hälarna mot rumpan"],
    a: full({ head: [18, 54], sh: [27, 58], hip: [54, 59], kn: [73, 59], ft: [91, 59], el: [22, 66], ha: [18, 62] }),
    b: full({ head: [18, 54], sh: [27, 58], hip: [54, 59], kn: [73, 59], ft: [68, 40], el: [22, 66], ha: [18, 62] }),
  },
  sled: {
    gear: "none", sled: true, work: ["thigh"], labels: ["Höger ben driver", "Vänster ben driver"],
    a: full({ head: [70, 38], sh: [63, 43], hip: [43, 57], kn: [57, 68], ft: [52, 91], kn2: [38, 74], ft2: [26, 91], el: [72, 46], ha: [81, 47] }),
    b: full({ head: [70, 38], sh: [63, 43], hip: [43, 57], kn: [38, 74], ft: [26, 91], kn2: [57, 68], ft2: [52, 91], el: [72, 46], ha: [81, 47] }),
  },
  cardio: {
    gear: "none", work: ["thigh"], labels: ["Vänster fram", "Höger fram"],
    a: S({ head: [53, 15], sh: [52, 27], kn: [62, 68], ft: [58, 85], kn2: [42, 75], ft2: [34, 88], el: [44, 38], ha: [50, 48], el2: [60, 36], ha2: [68, 28] }),
    b: S({ head: [53, 15], sh: [52, 27], kn: [42, 75], ft: [34, 88], kn2: [62, 68], ft2: [58, 85], el: [60, 36], ha: [68, 28], el2: [44, 38], ha2: [50, 48] }),
  },
};

const RULES: [RegExp, Pattern][] = [
  [/maghjul|rollout/, "rollout"],
  [/mountain|bear crawl/, "climber"],
  [/planka|plank|hollow|l-sitt/, "plank"],
  [/hängande|captain|knälyft/, "hang"],
  [/benlyft|v-ups|dead bug/, "legraise"],
  [/crunch|sit-?up|magmaskin|ryska|twist|rotation|side bend|bird dog|pallof|bålrot|goblet march/, "core"],
  [/tåhäv|calf/, "calf"],
  [/bencurl|lårcurl|leg curl|nordic/, "legcurl"],
  [/bensträck/, "legext"],
  [/höftlyft|hip thrust|hip raise/, "hipthrust"],
  [/bridge/, "bridge"],
  [/triceps kickback/, "kickback"],
  [/kickback|benspark|multihip|abduktor|adduktor|sidosteg/, "glute"],
  [/trappsteg|stairmaster/, "cardio"],
  [/utfall|bulgar|lunge|bänksteg|step-?up/, "lunge"],
  [/dips/, "dips"],
  [/triceps|pushdown|fransk|tricepspress/, "triceps"],
  [/curl/, "curl"],
  [/shrug|dragkedja/, "shrug"],
  [/sidolyft|omvänd flyes|omvänd pec|reverse/, "lateral"],
  [/framåtlyft/, "front"],
  [/flyes|pec deck|kryssdrag|crossover|pullover/, "fly"],
  [/släd|sled|prowler/, "sled"],
  [/chins|pull-?up|latsdrag|pulldown/, "vpull"],
  [/marklyft|deadlift|good morning|sving|swing|hyperext|ryggres|superman/, "hinge"],
  [/rodd|row|face pull/, "row"],
  [/armhäv|push-?up/, "pushup"],
  [/knäböj|squat|benpress|wall sit|bältes|pendel/, "squat"],
  [/axelpress|militär|push press|arnold|kneeling|landmine press|viking|frontpress|seated dumbbell|thruster|rensa och pressa/, "ohp"],
  [/bänkpress|bröstpress|kabelpress|hantelpress|smith.*press|bench/, "bench"],
];

export interface Setup { gear: Gear; cable?: "high" | "low" | "mid" | undefined; incline?: boolean; decline?: boolean; machine?: boolean; primary: string }

const HIGH_CABLE: Pattern[] = ["vpull", "triceps", "fly"];
const LOW_CABLE: Pattern[] = ["curl", "lateral", "front", "shrug", "kickback", "glute"];

/** Övningsspecifik uppsättning: redskap, bänkvinkel, kabelhöjd och exakt muskeltext. */
export function setupFor(ex: Pick<ExercisePreset, "name" | "muscle"> & { eq?: string[] }): Setup {
  const n = ex.name.toLowerCase();
  const pat = patternFor(ex);
  const base = SCENES[pat].gear;
  let gear: Gear = base;
  const cable = /kabel|cable|crossover|kryssdrag|face pull|pushdown|latsdrag|pulldown|sittande rodd/.test(n);
  if (cable) gear = "cable";
  else if (/kettlebell|sving|swing|goblet/.test(n)) gear = "kettlebell";
  else if (/gummiband|band/.test(n)) gear = "band";
  else if (/hantel|dumbbell|hantlar/.test(n)) gear = "dumbbell";
  else if (/skivstång|stång|barbell|trap bar|ez|militär|smith/.test(n)) gear = "barbell";
  else if (/maskin|machine|pec deck|benpress|bensträck|bencurl|hack/.test(n)) gear = "none";
  else if (/armhäv|planka|dips|chins|pull-?up|kroppsvikt|utan vikt/.test(n)) gear = "none";
  const machine = /maskin|machine|pec deck|benpress|hack|smith|bensträck|bencurl/.test(n);
  const incline = /lutande|incline/.test(n) && ["bench", "fly", "row", "curl", "lateral"].includes(pat);
  const decline = /decline|nedåtlutande/.test(n);
  const c: Setup["cable"] = cable ? (pat === "row" || /face pull|crossover|kryss/.test(n) ? "mid" : HIGH_CABLE.includes(pat) ? "high" : LOW_CABLE.includes(pat) ? "low" : "mid") : undefined;
  let primary = PRIMARY[pat];
  if (pat === "bench" || pat === "fly") primary = incline ? "Övre bröst (clavicular)" : decline ? "Nedre bröst" : primary;
  if (/hammer/.test(n)) primary = "Brachialis & underarm";
  if (/omvänd flyes|omvänd pec|reverse|face pull/.test(n)) primary = "Bakre delta & övre rygg";
  if (/smal|close/.test(n) && pat === "bench") primary = "Triceps & inre bröst";
  if (/rumänsk|rdl|stela ben|good morning/.test(n)) primary = "Baksida lår (hamstrings)";
  if (/sumo/.test(n)) primary = "Insida lår & rumpa";
  if (/front ?squat|frontböj|goblet/.test(n)) primary = "Framsida lår (quads)";
  if (/hyperext|ryggres|superman/.test(n)) primary = "Ländrygg & rumpa";
  if (/sidoplanka|sneda|rysk|russian|vedhugg|woodchop/.test(n)) primary = "Sneda magmuskler";
  if (/sittande tå|seated calf/.test(n)) primary = "Djupa vadmuskeln (soleus)";
  if (/över huvudet|overhead|fransk/.test(n) && pat === "triceps") primary = "Triceps (långa huvudet)";
  if (/chins|underhand/.test(n)) primary = "Latissimus & biceps";
  if (/bred|wide/.test(n) && pat === "vpull") primary = "Latissimus (bredd)";
  return { gear, cable: c, incline, decline, machine, primary };
}

export function patternFor(ex: Pick<ExercisePreset, "name" | "muscle">): Pattern {
  const n = ex.name.toLowerCase();
  for (const [re, p] of RULES) if (re.test(n)) return p;
  const m: Record<string, Pattern> = { bröst: "bench", axlar: "ohp", rygg: "row", armar: "curl", ben: "squat", rumpa: "bridge", bål: "core" };
  return m[ex.muscle] ?? "cardio";
}

/** Primär muskel som visas under figuren. */
export const PRIMARY: Record<Pattern, string> = {
  squat: "Framsida lår & rumpa", lunge: "Framsida lår & rumpa", hinge: "Baksida lår, rumpa & ländrygg", bench: "Bröst & triceps",
  fly: "Bröst", pushup: "Bröst & triceps", ohp: "Axlar", lateral: "Sidodelta (axlar)", front: "Främre delta (axlar)", shrug: "Kappmuskel (trapezius)",
  vpull: "Latissimus & biceps", row: "Övre rygg & latissimus", curl: "Biceps", triceps: "Triceps", kickback: "Triceps", dips: "Triceps & bröst",
  core: "Raka magmuskeln", plank: "Hela bålen", rollout: "Raka magmuskeln", legraise: "Nedre mage & höftböjare", hang: "Nedre mage",
  climber: "Bål & höftböjare", bridge: "Rumpa", hipthrust: "Rumpa", glute: "Rumpa", calf: "Vader", legext: "Framsida lår",
  legcurl: "Baksida lår", sled: "Framsida lår & rumpa", cardio: "Ben & kondition",
};

/** Övningsspecifika kroppsställningar för varianter som rör sig annorlunda än sin grundrörelse. */
const seatedPull: Pick<Pose, "head" | "sh" | "hip" | "kn" | "ft"> = { head: [50, 26], sh: [50, 37], hip: [48, 62], kn: [66, 62], ft: [68, 86] };
export const VARIANTS: [RegExp, string, Partial<Scene>][] = [
  [/frontböj|front ?squat/, "frontsquat", {
    labels: ["Stången på främre axlarna", "Sitt ner, armbågarna högt"],
    a: S({ el: [60, 30], ha: [54, 27], el2: [58, 30], ha2: [52, 27] }),
    b: full({ head: [54, 40], sh: [52, 51], hip: [36, 69], kn: [60, 72], ft: [50, 91], el: [62, 52], ha: [56, 49], el2: [60, 52], ha2: [54, 49] }),
  }],
  [/goblet/, "goblet", {
    gearAt: "ha", labels: ["Vikten mot bröstet", "Sitt ner mellan knäna"],
    a: S({ el: [55, 40], ha: [56, 33], el2: [53, 40], ha2: [54, 33] }),
    b: full({ head: [55, 41], sh: [53, 52], hip: [36, 69], kn: [60, 72], ft: [50, 91], el: [58, 62], ha: [60, 54], el2: [56, 62], ha2: [58, 54] }),
  }],
  [/rumänsk|rdl|stela ben/, "rdl", {
    labels: ["Stå rakt, stången vid låren", "Fäll höften bakåt, mjuka knän"],
    a: S({ el: [51, 42], ha: [53, 58] }),
    b: full({ head: [75, 43], sh: [67, 47], hip: [42, 53], kn: [47, 72], ft: [50, 91], el: [65, 61], ha: [63, 75] }),
  }],
  [/sumo/, "sumo", {
    labels: ["Bred fotställning, knäna ut", "Res dig, rumpan fram"],
    a: F({ head: [50, 32], sh: [50, 44], hip: [50, 64], kn: [66, 74], kn2: [34, 74], ft: [72, 91], ft2: [28, 91], el: [53, 58], ha: [52, 74], el2: [47, 58], ha2: [48, 74] }),
    b: F({ kn: [60, 73], kn2: [40, 73], ft: [70, 91], ft2: [30, 91], el: [53, 42], ha: [52, 57], el2: [47, 42], ha2: [48, 57] }),
  }],
  [/hammer/, "hammer", { labels: ["Armen rak, tummen upp", "Böj upp, neutralt grepp"] }],
  [/preacher|scott/, "preacher", {
    bench: "seat", labels: ["Armen sträckt mot dynan", "Böj upp, överarmen på dynan"],
    a: full({ head: [40, 22], sh: [41, 34], hip: [40, 60], kn: [58, 60], ft: [60, 86], el: [58, 46], ha: [72, 58] }),
    b: full({ head: [40, 22], sh: [41, 34], hip: [40, 60], kn: [58, 60], ft: [60, 86], el: [58, 46], ha: [56, 30] }),
  }],
  [/latsdrag|pulldown/, "pulldown", {
    bar: false, bench: "seat", labels: ["Sitt, armarna raka uppåt", "Dra stången till bröstet"],
    a: full({ ...seatedPull, el: [54, 22], ha: [52, 8] }),
    b: full({ ...seatedPull, head: [48, 26], el: [40, 42], ha: [52, 30] }),
  }],
  [/dips/, "dips", {
    a: full({ head: [57, 19], sh: [53, 30], hip: [47, 55], kn: [44, 72], ft: [56, 80], el: [50, 43], ha: [50, 56] }),
    b: full({ head: [60, 32], sh: [55, 43], hip: [47, 66], kn: [44, 82], ft: [56, 89], el: [40, 49], ha: [50, 56] }),
  }],
];

export function variantFor(ex: Pick<ExercisePreset, "name">): string | null {
  const n = ex.name.toLowerCase();
  return VARIANTS.find(([re]) => re.test(n))?.[1] ?? null;
}

/** Steg-för-steg teknikguide: Startläge och Toppläge med skuggad 3D-känsla; arbetande muskler markeras. */
export function ExerciseDemo({ ex, className = "" }: { ex: Pick<ExercisePreset, "name" | "muscle" | "track">; className?: string }) {
  const [playing, setPlaying] = useState(true);
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!playing) return;
    let raf = 0; const start = performance.now();
    const loop = (now: number) => {
      // 3,2 s per rep: ner/upp med kort paus i ändlägena
      const c = ((now - start) / 3200) % 1;
      const k = c < 0.1 ? 0 : c < 0.45 ? (c - 0.1) / 0.35 : c < 0.55 ? 1 : c < 0.9 ? 1 - (c - 0.55) / 0.35 : 0;
      setT(0.5 - Math.cos(k * Math.PI) / 2);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing]);
  const phase: 0 | 1 = t > 0.5 ? 1 : 0;
  const setPhase = (p: 0 | 1) => { setPlaying(false); setT(p); };
  const n = ex.name.toLowerCase();
  const v = VARIANTS.find(([re]) => re.test(n))?.[2];
  const base: Scene = { ...SCENES[patternFor(ex)], ...v };
  const su = setupFor(ex);
  const tilt = (p: Pose): Pose => {
    if (!su.incline || !base.bench || base.bench === "seat") return p;
    const lift = (q: P, k: number): P => [q[0] + 4 * k, q[1] - 16 * k];
    return { ...p, head: lift(p.head, 1.2), sh: lift(p.sh, 1), el: lift(p.el, 0.9), el2: lift(p.el2, 0.9), ha: lift(p.ha, 0.8), ha2: lift(p.ha2, 0.8) };
  };
  const sc = { ...base, gear: su.gear, a: tilt(base.a), b: tilt(base.b) };
  const a = Object.fromEntries((Object.keys(sc.a) as J[]).map((j) => [j, [sc.a[j][0] + (sc.b[j][0] - sc.a[j][0]) * t, sc.a[j][1] + (sc.b[j][1] - sc.a[j][1]) * t]])) as Pose;
  const other = sc.b;
  const gearAt = sc.gearAt ?? "ha";
  const benchY = sc.bench === "low" ? 70 : sc.bench === "seat" ? 62 : 63;

  // Atletisk silhuett: solid kropp, arbetande muskel tonas in i accentfärg med ansträngningen
  const seg = (p: J, q: J, w: number, s: Seg, far = false) => {
    const hot = sc.work.includes(s);
    const pts = { x1: a[p][0], y1: a[p][1], x2: a[q][0], y2: a[q][1] };
    return (
      <g opacity={far ? 0.45 : 1}>
        <line {...pts} strokeWidth={w} strokeLinecap="round" className="stroke-foreground/80" />
        {hot && <line {...pts} strokeWidth={w} strokeLinecap="round" className="stroke-coral" opacity={0.25 + 0.75 * t} />}
        {hot && !far && <line {...pts} strokeWidth={w + 4} strokeLinecap="round" className="stroke-coral" filter="url(#glow)" opacity={0.5 * t} />}
      </g>
    );
  };
  const at = (p: J, child: ReactNode) => <g transform={`translate(${a[p][0]} ${a[p][1]})`}>{child}</g>;
  const ha = a[gearAt], hb = other[gearAt];
  const moved = Math.hypot(ha[0] - hb[0], ha[1] - hb[1]) > 4;

  return (
    <div className={`overflow-hidden rounded-2xl bg-card ${className}`}>
      <svg viewBox="0 0 100 112" role="img" aria-label={`Teknikguide: ${ex.name}, ${phase === 0 ? "startläge" : "toppläge"}`} className="block w-full">
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2" /></filter>
          <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" className="fill-coral" />
          </marker>
        </defs>
        <ellipse cx="50" cy="94" rx="36" ry="3.2" className="fill-foreground" opacity="0.08" />
        <line x1="6" y1="93" x2="94" y2="93" className="stroke-border" strokeWidth="2" strokeLinecap="round" />
        {sc.mat && <rect x="8" y="91" width="84" height="3" rx="1.5" className="fill-accent" />}
        {sc.bar && <g className="stroke-foreground/60" strokeWidth="2.5" strokeLinecap="round"><line x1="28" y1="7" x2="72" y2="7" /><line x1="30" y1="7" x2="30" y2="2" /><line x1="70" y1="7" x2="70" y2="2" /></g>}
        {sc.dipbars && <g className="stroke-foreground/60" strokeWidth="2.5" strokeLinecap="round"><line x1="40" y1="57" x2="62" y2="57" /><line x1="60" y1="57" x2="60" y2="93" /></g>}
        {sc.sled && <g className="fill-foreground/60"><rect x="82" y="40" width="4" height="40" rx="1.5" /><rect x="78" y="78" width="16" height="13" rx="2" /></g>}
        {sc.bench && (
          <g className="fill-foreground/35">
            <rect x={sc.bench === "seat" ? 26 : 12} y={benchY} width={sc.bench === "seat" ? 30 : sc.bench === "low" ? 24 : 60} height="5" rx="2.5" />
            <rect x={sc.bench === "seat" ? 30 : 18} y={benchY + 5} width="3" height={93 - benchY - 5} />
            <rect x={sc.bench === "seat" ? 50 : sc.bench === "low" ? 30 : 64} y={benchY + 5} width="3" height={93 - benchY - 5} />
          </g>
        )}
        {su.cable && (
          <g>
            <rect x="88" y="4" width="4" height="89" rx="1.5" className="fill-foreground/35" />
            <circle cx="88" cy={su.cable === "high" ? 8 : su.cable === "low" ? 86 : 45} r="2.4" className="fill-foreground/60" />
            <line x1="88" y1={su.cable === "high" ? 8 : su.cable === "low" ? 86 : 45} x2={a.ha[0]} y2={a.ha[1]} strokeWidth="0.9" className="stroke-foreground/70" />
          </g>
        )}
        {su.gear === "band" && <line x1={a.ft[0]} y1="91" x2={a.ha[0]} y2={a.ha[1]} strokeWidth="1.4" className="stroke-coral/70" />}
        {su.machine && !base.bench && <g className="fill-foreground/30"><rect x="8" y="10" width="5" height="83" rx="2" /><rect x="8" y="66" width="22" height="5" rx="2" /></g>}
        {su.incline && base.bench && base.bench !== "seat" && <line x1="54" y1="62" x2="30" y2="44" strokeWidth="5" strokeLinecap="round" className="stroke-foreground/35" />}
        {seg("hip", "kn2", 9, "thigh", true)}{seg("kn2", "ft2", 6.5, "shin", true)}
        {seg("sh", "el2", 6.5, "upper", true)}{seg("el2", "ha2", 5, "fore", true)}
        {seg("sh", "hip", 15, "torso")}
        {seg("hip", "kn", 10, "thigh")}{seg("kn", "ft", 7, "shin")}
        {seg("sh", "el", 7, "upper")}{seg("el", "ha", 5.5, "fore")}
        <line x1={a.sh[0]} y1={a.sh[1]} x2={a.head[0]} y2={a.head[1]} strokeWidth="6" strokeLinecap="round" className="stroke-foreground/80" />
        {(["ft", "ft2"] as J[]).map((f) => <line key={f} x1={a[f][0]} y1={a[f][1]} x2={a[f][0] + 4} y2={a[f][1]} strokeWidth="4" strokeLinecap="round" className="stroke-foreground/80" opacity={f === "ft2" ? 0.45 : 1} />)}
        <ellipse rx="5.4" ry="6.2" cx={a.head[0]} cy={a.head[1]} className="fill-foreground/80" />
        {sc.gear === "barbell" && at(gearAt, <g><circle r="8" className="fill-foreground" /><circle r="2.2" className="fill-card" /></g>)}
        {sc.gear === "dumbbell" && at(gearAt, <g className="fill-foreground"><rect x="-6" y="-2" width="12" height="4" rx="1" /><rect x="-7" y="-4.5" width="4" height="9" rx="1.5" /><rect x="3" y="-4.5" width="4" height="9" rx="1.5" /></g>)}
        {sc.gear === "kettlebell" && at(gearAt, <g><circle cy="3" r="4.5" className="fill-foreground" /><path d="M-2.5 -0.5 V-4 H2.5 V-0.5" fill="none" strokeWidth="1.4" className="stroke-foreground" /></g>)}
        {sc.gear === "cable" && at(gearAt, <rect x="-3.5" y="-1.2" width="7" height="2.4" rx="1.2" className="fill-foreground" />)}
        {sc.gear === "wheel" && at(gearAt, <g><circle r="5" className="fill-foreground" /><circle r="1.6" className="fill-card" /></g>)}
        {moved && (() => { const s0 = sc.a[gearAt], s1 = sc.b[gearAt]; return (
          <line x1={s0[0]} y1={s0[1]} x2={s0[0] + (s1[0] - s0[0]) * 0.85} y2={s0[1] + (s1[1] - s0[1]) * 0.85} strokeWidth="1" strokeDasharray="1.5 1.5" className="stroke-coral" opacity="0.7" markerEnd="url(#arrow)" />
        ); })()}
        <text x="50" y="105" fontSize="6.5" fontWeight="600" textAnchor="middle" className="fill-foreground">{sc.labels[phase]}</text>
      </svg>
      <div className="grid grid-cols-3 gap-1.5 px-2 pb-2">
        <button type="button" onClick={() => setPlaying((p) => !p)} aria-pressed={playing}
          className={`rounded-xl py-2 text-xs font-semibold transition-colors ${playing ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
          {playing ? "❚❚ Paus" : "▶ Spela"}
        </button>
        {(["Start", "Topp"] as const).map((l, i) => (
          <button key={l} type="button" onClick={() => setPhase(i as 0 | 1)}
            className={`rounded-xl py-2 text-xs font-semibold transition-colors ${!playing && phase === i ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            {l}
          </button>
        ))}
      </div>
      <p className="px-3 pb-3 text-[11px] text-muted-foreground">
        Primär muskel: <span className="font-semibold text-foreground">{su.primary}</span>
        {" · Muskeln lyser när den arbetar"}
      </p>
    </div>
  );
}
