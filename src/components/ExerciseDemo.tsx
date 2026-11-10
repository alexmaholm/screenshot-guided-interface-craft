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
  | "sled" | "cardio" | "crossover" | "seatedrow" | "facepull" | "legpress" | "pecdeck" | "machinepress"
  | "cablepress" | "pallof" | "chop" | "straightarm"
  | "ergrow" | "superman" | "hyperext" | "revpecdeck" | "revfly" | "reardelt" | "wallsit" | "sidelunge" | "benchdip" | "skullcrusher" | "overheadtri" | "pullover" | "twist" | "birddog" | "deadbug" | "sidebend" | "kneelcrunch" | "machinecrunch" | "march" | "latstep" | "quadkick" | "revhyper" | "sidelie" | "abduct" | "cableabd" | "burpee" | "jack" | "bike" | "jump" | "ropes" | "punch" | "invrow" | "uprightrow" | "nordic" | "seatedlegcurl" | "standlegcurl" | "ballcurl" | "seatedcalf" | "handstand" | "pike" | "floorpress" | "floorfly" | "sealrow" | "spidercurl" | "renegade" | "svend" | "pistol" | "conccurl" | "hollow" | "lsit" | "extrot" | "crab" | "getup";
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
  /** Var kabeln går ut ur trissan (annars på tornet till höger). */
  cableAt?: P; dualCable?: boolean; legpress?: boolean; backrest?: boolean;
  ergo?: boolean; hyper?: boolean; wall?: number; bike?: boolean; rope?: boolean; rings?: boolean; ball?: boolean;
}

const benchLie: Pick<Pose, "head" | "sh" | "hip" | "kn" | "ft"> = { head: [22, 56], sh: [31, 59], hip: [58, 60], kn: [73, 66], ft: [80, 91] };
const bentOver: Pick<Pose, "head" | "sh" | "hip" | "kn" | "ft"> = { head: [72, 36], sh: [64, 41], hip: [41, 53], kn: [49, 73], ft: [47, 91] };
const plankBody: Pick<Pose, "head" | "sh" | "hip" | "kn" | "ft"> = { head: [80, 70], sh: [71, 75], hip: [46, 78], kn: [31, 82], ft: [16, 88] };

const seatSide: Pick<Pose, "head" | "sh" | "hip" | "kn" | "ft"> = { head: [42, 24], sh: [42, 36], hip: [40, 60], kn: [58, 60], ft: [60, 86] };
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
    gear: "none", bar: true, cableAt: [52, 3], work: ["torso", "upper"], labels: ["Häng med raka armar", "Dra bröstet mot stången"],
    a: full({ head: [50, 30], sh: [50, 40], hip: [50, 66], kn: [53, 79], ft: [49, 93], el: [52, 22], ha: [50, 7] }),
    b: full({ head: [50, 14], sh: [50, 25], hip: [50, 51], kn: [55, 64], ft: [50, 78], el: [38, 22], ha: [50, 7] }),
  },
  row: {
    gear: "barbell", work: ["torso", "upper"], labels: ["Armarna raka", "Dra mot magen"],
    a: full({ ...bentOver, el: [64, 56], ha: [63, 70] }),
    b: full({ ...bentOver, el: [49, 44], ha: [57, 55] }),
  },
  curl: {
    gear: "dumbbell", cableAt: [70, 90], work: ["upper", "fore"], labels: ["Armen rak", "Böj upp, armbågen still"],
    a: S({ el: [52, 42], ha: [55, 58] }),
    b: S({ el: [52, 42], ha: [60, 29] }),
  },
  triceps: {
    gear: "dumbbell", cableAt: [62, 3], work: ["upper"], labels: ["Armbågen böjd", "Sträck ut armen"],
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
  straightarm: {
    gear: "cable", cableAt: [86, 6], work: ["upper", "torso"], labels: ["Raka armar framåt-uppåt", "Pressa ner stången mot låren"],
    a: S({ head: [46, 16], sh: [47, 28], el: [60, 20], ha: [72, 14] }),
    b: S({ head: [46, 16], sh: [47, 28], el: [52, 42], ha: [56, 56] }),
  },
  crossover: {
    gear: "cable", dualCable: true, work: ["torso", "upper"], labels: ["Armarna ute, lätt böj", "För ihop händerna framför"],
    a: F({ el: [68, 33], ha: [82, 26], el2: [32, 33], ha2: [18, 26] }),
    b: F({ el: [60, 43], ha: [53, 54], el2: [40, 43], ha2: [47, 54] }),
  },
  seatedrow: {
    gear: "cable", cableAt: [90, 72], bench: "low", work: ["torso", "upper"], labels: ["Armarna raka, bröstet upp", "Dra handtaget mot magen"],
    a: full({ head: [42, 30], sh: [40, 42], hip: [36, 68], kn: [56, 58], ft: [74, 72], el: [58, 52], ha: [74, 58] }),
    b: full({ head: [38, 29], sh: [37, 41], hip: [36, 68], kn: [56, 58], ft: [74, 72], el: [26, 52], ha: [46, 58] }),
  },
  facepull: {
    gear: "cable", cableAt: [90, 18], work: ["upper"], labels: ["Armarna raka mot trissan", "Dra repet mot pannan, armbågar högt"],
    a: S({ el: [66, 24], ha: [80, 20] }),
    b: S({ el: [42, 20], ha: [56, 15] }),
  },
  legpress: {
    gear: "none", gearAt: "ft", legpress: true, work: ["thigh"], labels: ["Knäna böjda mot bröstet", "Pressa plattan, mjuka knän"],
    a: full({ head: [17, 47], sh: [24, 56], hip: [38, 72], kn: [46, 48], ft: [64, 54], el: [30, 66], ha: [38, 76] }),
    b: full({ head: [17, 47], sh: [24, 56], hip: [38, 72], kn: [56, 57], ft: [72, 46], el: [30, 66], ha: [38, 76] }),
  },
  pecdeck: {
    gear: "none", backrest: true, bench: "seat", work: ["torso", "upper"], labels: ["Armarna ute, armbågar i axelhöjd", "För ihop dynorna framför bröstet"],
    a: F({ hip: [50, 60], kn: [58, 64], ft: [58, 88], kn2: [42, 64], ft2: [42, 88], el: [70, 30], ha: [72, 17], el2: [30, 30], ha2: [28, 17] }),
    b: F({ hip: [50, 60], kn: [58, 64], ft: [58, 88], kn2: [42, 64], ft2: [42, 88], el: [56, 31], ha: [53, 17], el2: [44, 31], ha2: [47, 17] }),
  },
  machinepress: {
    gear: "none", backrest: true, bench: "seat", work: ["torso", "upper"], labels: ["Handtagen vid bröstet", "Pressa rakt fram"],
    a: full({ ...seatSide, el: [32, 44], ha: [46, 40] }),
    b: full({ ...seatSide, el: [58, 39], ha: [72, 39] }),
  },
  cablepress: {
    gear: "cable", cableAt: [8, 38], work: ["torso", "upper"], labels: ["Handtagen vid bröstet", "Pressa fram och ihop"],
    a: S({ kn: [56, 73], ft: [60, 91], kn2: [44, 74], ft2: [36, 91], el: [38, 40], ha: [52, 38] }),
    b: S({ kn: [56, 73], ft: [60, 91], kn2: [44, 74], ft2: [36, 91], el: [62, 36], ha: [77, 37] }),
  },
  pallof: {
    gear: "cable", cableAt: [8, 40], work: ["torso"], labels: ["Handtaget mot bröstet", "Pressa ut – låt inte kroppen vrida"],
    a: F({ el: [56, 42], ha: [51, 39], el2: [44, 42], ha2: [49, 39] }),
    b: F({ el: [53, 38], ha: [51, 34], el2: [47, 38], ha2: [49, 34], sh: [50, 27] }),
  },
  chop: {
    gear: "cable", cableAt: [10, 8], work: ["torso"], labels: ["Händerna högt vid trissan", "Dra diagonalt ner över kroppen"],
    a: F({ head: [47, 15], el: [36, 24], ha: [24, 14], el2: [38, 26], ha2: [26, 16] }),
    b: F({ head: [53, 16], sh: [52, 27], el: [64, 50], ha: [74, 64], el2: [62, 52], ha2: [72, 66] }),
  },
  ergrow: {
    gear: "none", ergo: true, work: ["torso", "thigh", "upper"], labels: ["Fram: knän böjda, armar raka", "Driv med benen, dra till magen"],
    a: full({ head: [55, 45], sh: [50, 56], hip: [38, 80], kn: [56, 62], ft: [70, 82], el: [60, 63], ha: [70, 66] }),
    b: full({ head: [30, 46], sh: [33, 57], hip: [38, 80], kn: [58, 76], ft: [76, 83], el: [30, 70], ha: [44, 67] }),
  },
  superman: {
    gear: "none", mat: true, work: ["torso", "thigh"], labels: ["Ligg på magen, armar fram", "Lyft armar och ben samtidigt"],
    a: full({ head: [22, 85], sh: [30, 88], hip: [55, 89], kn: [71, 89], ft: [87, 89], el: [18, 88], ha: [7, 88] }),
    b: full({ head: [21, 79], sh: [30, 84], hip: [55, 89], kn: [71, 86], ft: [86, 81], el: [18, 81], ha: [8, 77] }),
  },
  hyperext: {
    gear: "none", hyper: true, work: ["torso", "thigh"], labels: ["Fäll fram med rak rygg", "Res upp i linje med benen"],
    a: full({ head: [64, 84], sh: [62, 72], hip: [50, 50], kn: [38, 63], ft: [27, 76], el: [57, 66], ha: [60, 60] }),
    b: full({ head: [72, 30], sh: [66, 38], hip: [50, 50], kn: [38, 63], ft: [27, 76], el: [61, 44], ha: [64, 40] }),
  },
  revpecdeck: {
    gear: "none", backrest: true, bench: "seat", work: ["upper", "torso"], labels: ["Handtagen framför bröstet", "För armarna bakåt, skulderbladen ihop"],
    a: F({ hip: [50, 60], kn: [58, 64], ft: [58, 88], kn2: [42, 64], ft2: [42, 88], el: [58, 31], ha: [53, 30], el2: [42, 31], ha2: [47, 30] }),
    b: F({ hip: [50, 60], kn: [58, 64], ft: [58, 88], kn2: [42, 64], ft2: [42, 88], el: [66, 30], ha: [80, 30], el2: [34, 30], ha2: [20, 30] }),
  },
  revfly: {
    gear: "cable", dualCable: true, cableAt: [92, 30], work: ["upper"], labels: ["Händerna korsade framför", "Dra isär till T, armar raka"],
    a: F({ el: [56, 32], ha: [44, 31], el2: [44, 32], ha2: [56, 31] }),
    b: F({ el: [66, 29], ha: [80, 29], el2: [34, 29], ha2: [20, 29] }),
  },
  reardelt: {
    gear: "dumbbell", work: ["upper"], labels: ["Framåtlutad, armar hänger", "Lyft ut åt sidorna, armbågar mjuka"],
    a: F({ head: [50, 36], sh: [50, 42], hip: [50, 56], kn: [55, 74], ft: [57, 91], kn2: [45, 74], ft2: [43, 91], el: [55, 52], ha: [55, 62], el2: [45, 52], ha2: [45, 62] }),
    b: F({ head: [50, 36], sh: [50, 42], hip: [50, 56], kn: [55, 74], ft: [57, 91], kn2: [45, 74], ft2: [43, 91], el: [64, 42], ha: [78, 43], el2: [36, 42], ha2: [22, 43] }),
  },
  wallsit: {
    gear: "none", wall: 30, work: ["thigh"], labels: ["Ryggen mot väggen, 90° i knät", "Håll positionen"],
    a: full({ head: [36, 30], sh: [36, 41], hip: [36, 66], kn: [58, 66], ft: [58, 91], el: [44, 52], ha: [52, 62] }),
    b: full({ head: [36, 30], sh: [36, 41], hip: [36, 67], kn: [58, 66], ft: [58, 91], el: [44, 53], ha: [52, 63] }),
  },
  sidelunge: {
    gear: "none", work: ["thigh"], labels: ["Stå med bred fotställning", "Sitt ner åt ena sidan, andra benet rakt"],
    a: F({ kn: [58, 73], ft: [64, 91], kn2: [42, 73], ft2: [36, 91], el: [55, 42], ha: [50, 50], el2: [45, 42], ha2: [50, 50] }),
    b: F({ head: [40, 36], sh: [40, 47], hip: [40, 68], kn: [60, 78], ft: [76, 91], kn2: [26, 74], ft2: [32, 91], el: [45, 58], ha: [42, 66], el2: [35, 58], ha2: [40, 66] }),
  },
  benchdip: {
    gear: "none", bench: "low", work: ["upper"], labels: ["Händerna på bänken, armar raka", "Sänk rumpan, armbågar bakåt"],
    a: full({ head: [36, 38], sh: [35, 49], hip: [39, 73], kn: [60, 72], ft: [78, 91], el: [32, 60], ha: [30, 70] }),
    b: full({ head: [39, 50], sh: [38, 61], hip: [42, 84], kn: [62, 80], ft: [80, 91], el: [24, 62], ha: [30, 70] }),
  },
  skullcrusher: {
    gear: "barbell", bench: "high", work: ["upper"], labels: ["Armarna raka över bröstet", "Böj armbågarna, stången mot pannan"],
    a: full({ ...benchLie, el: [32, 45], ha: [32, 31] }),
    b: full({ ...benchLie, el: [32, 45], ha: [21, 50] }),
  },
  overheadtri: {
    gear: "dumbbell", cableAt: [86, 86], work: ["upper"], labels: ["Vikten bakom huvudet", "Sträck armarna rakt upp"],
    a: S({ el: [54, 13], ha: [44, 24], el2: [51, 13], ha2: [41, 24] }),
    b: S({ el: [53, 13], ha: [52, 0], el2: [50, 13], ha2: [49, 0] }),
  },
  pullover: {
    gear: "dumbbell", bench: "high", work: ["torso", "upper"], labels: ["Armarna bakom huvudet", "För vikten i båge över bröstet"],
    a: full({ ...benchLie, el: [18, 55], ha: [5, 55] }),
    b: full({ ...benchLie, el: [31, 45], ha: [32, 31] }),
  },
  twist: {
    gear: "none", mat: true, work: ["torso"], labels: ["Luta bakåt, händerna åt höger", "Rotera händerna till vänster"],
    a: F({ head: [52, 52], sh: [51, 63], hip: [50, 86], kn: [60, 73], ft: [66, 82], kn2: [40, 73], ft2: [34, 82], el: [62, 70], ha: [66, 78], el2: [56, 72], ha2: [64, 78] }),
    b: F({ head: [48, 52], sh: [49, 63], hip: [50, 86], kn: [60, 73], ft: [66, 82], kn2: [40, 73], ft2: [34, 82], el: [44, 72], ha: [36, 78], el2: [38, 70], ha2: [34, 78] }),
  },
  birddog: {
    gear: "none", mat: true, work: ["torso", "thigh"], labels: ["På alla fyra, rak rygg", "Sträck ut motsatt arm och ben"],
    a: full({ head: [74, 66], sh: [66, 71], hip: [42, 71], kn: [44, 90], ft: [24, 91], el: [66, 81], ha: [66, 91], kn2: [40, 90], ft2: [21, 91], el2: [63, 81], ha2: [63, 91] }),
    b: full({ head: [74, 66], sh: [66, 71], hip: [42, 71], kn: [44, 90], ft: [24, 91], el: [80, 69], ha: [93, 67], kn2: [24, 71], ft2: [7, 70], el2: [63, 81], ha2: [63, 91] }),
  },
  deadbug: {
    gear: "none", mat: true, work: ["torso"], labels: ["Rygg i golvet, armar och knän upp", "Sänk motsatt arm och ben"],
    a: full({ head: [16, 84], sh: [26, 86], hip: [52, 88], kn: [56, 70], ft: [72, 70], kn2: [53, 70], ft2: [69, 70], el: [28, 74], ha: [29, 62], el2: [25, 74], ha2: [26, 62] }),
    b: full({ head: [16, 84], sh: [26, 86], hip: [52, 88], kn: [68, 84], ft: [86, 86], kn2: [53, 70], ft2: [69, 70], el: [16, 80], ha: [5, 80], el2: [25, 74], ha2: [26, 62] }),
  },
  sidebend: {
    gear: "dumbbell", work: ["torso"], labels: ["Stå rakt, vikten vid sidan", "Böj åt sidan, vikten ner mot knät"],
    a: F({ el: [59, 41], ha: [60, 56], el2: [43, 38], ha2: [42, 28] }),
    b: F({ head: [60, 18], sh: [57, 28], el: [64, 44], ha: [64, 62], el2: [48, 36], ha2: [48, 26] }),
  },
  kneelcrunch: {
    gear: "cable", cableAt: [66, 4], work: ["torso"], labels: ["På knä, repet vid huvudet", "Rulla ner, armbågar mot knäna"],
    a: full({ head: [58, 30], sh: [56, 41], hip: [52, 66], kn: [50, 90], ft: [30, 91], el: [62, 34], ha: [60, 25] }),
    b: full({ head: [74, 66], sh: [70, 56], hip: [52, 68], kn: [50, 90], ft: [30, 91], el: [66, 68], ha: [72, 62] }),
  },
  machinecrunch: {
    gear: "none", backrest: true, bench: "seat", work: ["torso"], labels: ["Sitt upprätt, händerna vid dynorna", "Rulla ihop bålen framåt"],
    a: full({ ...seatSide, el: [48, 30], ha: [50, 26] }),
    b: full({ ...seatSide, head: [58, 38], sh: [52, 44], el: [60, 46], ha: [62, 40] }),
  },
  march: {
    gear: "kettlebell", work: ["torso", "thigh"], labels: ["Vikten mot bröstet", "Lyft knät högt, bålen still"],
    a: S({ el: [55, 40], ha: [56, 33] }),
    b: S({ el: [55, 40], ha: [56, 33], kn: [66, 56], ft: [64, 74] }),
  },
  latstep: {
    gear: "band", work: ["thigh"], labels: ["Halvböjda knän, bandet spänt", "Kliv ut åt sidan"],
    a: F({ hip: [50, 58], kn: [56, 75], ft: [57, 91], kn2: [44, 75], ft2: [43, 91] }),
    b: F({ hip: [53, 58], kn: [64, 75], ft: [70, 91], kn2: [46, 75], ft2: [43, 91] }),
  },
  quadkick: {
    gear: "none", mat: true, work: ["thigh"], labels: ["På alla fyra", "Pressa foten mot taket"],
    a: full({ head: [74, 66], sh: [66, 71], hip: [42, 71], kn: [44, 90], ft: [24, 91], el: [66, 81], ha: [66, 91] }),
    b: full({ head: [74, 66], sh: [66, 71], hip: [42, 71], kn: [24, 66], ft: [22, 48], kn2: [41, 90], ft2: [21, 91], el: [66, 81], ha: [66, 91] }),
  },
  revhyper: {
    gear: "none", bench: "high", work: ["thigh", "torso"], labels: ["Överkroppen på bänken, benen ner", "Lyft benen bakåt-upp"],
    a: full({ head: [18, 56], sh: [27, 59], hip: [62, 60], kn: [70, 76], ft: [72, 91], el: [18, 66], ha: [14, 76] }),
    b: full({ head: [18, 56], sh: [27, 59], hip: [62, 60], kn: [80, 58], ft: [96, 56], el: [18, 66], ha: [14, 76] }),
  },
  sidelie: {
    gear: "none", mat: true, work: ["thigh"], labels: ["Ligg på sidan", "Lyft övre benet"],
    a: full({ head: [16, 82], sh: [24, 86], hip: [50, 87], kn: [66, 84], ft: [84, 88], kn2: [66, 88], ft2: [84, 90], el: [32, 80], ha: [40, 84] }),
    b: full({ head: [16, 82], sh: [24, 86], hip: [50, 85], kn: [66, 74], ft: [82, 66], kn2: [66, 88], ft2: [84, 90], el: [32, 80], ha: [40, 84] }),
  },
  abduct: {
    gear: "none", backrest: true, bench: "seat", work: ["thigh"], labels: ["Knäna ihop", "Pressa isär knäna"],
    a: F({ hip: [50, 60], kn: [55, 66], ft: [56, 88], kn2: [45, 66], ft2: [44, 88], el: [58, 46], ha: [60, 58], el2: [42, 46], ha2: [40, 58] }),
    b: F({ hip: [50, 60], kn: [68, 64], ft: [64, 88], kn2: [32, 64], ft2: [36, 88], el: [58, 46], ha: [60, 58], el2: [42, 46], ha2: [40, 58] }),
  },
  cableabd: {
    gear: "cable", gearAt: "ft", cableAt: [86, 88], work: ["thigh"], labels: ["Stå på ett ben vid kabeln", "För benet ut åt sidan"],
    a: F({ kn: [53, 73], ft: [53, 91], kn2: [47, 73], ft2: [46, 91], el2: [36, 30], ha2: [26, 26] }),
    b: F({ kn: [62, 72], ft: [72, 86], kn2: [47, 73], ft2: [46, 91], el2: [36, 30], ha2: [26, 26] }),
  },
  burpee: {
    gear: "none", work: ["thigh", "torso", "upper"], labels: ["Stå upp", "Ner i armhävningsläge"],
    a: S({ el: [54, 22], ha: [56, 10] }),
    b: full({ head: [79, 60], sh: [70, 65], hip: [45, 72], kn: [31, 78], ft: [16, 88], el: [70, 78], ha: [70, 91] }),
  },
  jack: {
    gear: "none", work: ["thigh", "upper"], labels: ["Fötterna ihop, armar nere", "Hoppa isär, armar upp"],
    a: F({ kn: [53, 73], ft: [53, 91], kn2: [47, 73], ft2: [47, 91] }),
    b: F({ kn: [60, 73], ft: [68, 91], kn2: [40, 73], ft2: [32, 91], el: [62, 17], ha: [64, 5], el2: [38, 17], ha2: [36, 5] }),
  },
  bike: {
    gear: "none", bike: true, work: ["thigh"], labels: ["Höger pedal ner", "Vänster pedal ner"],
    a: full({ head: [62, 24], sh: [55, 33], hip: [36, 52], kn: [56, 58], ft: [56, 76], kn2: [50, 70], ft2: [44, 88], el: [64, 44], ha: [72, 48] }),
    b: full({ head: [62, 24], sh: [55, 33], hip: [36, 52], kn: [50, 70], ft: [44, 88], kn2: [56, 58], ft2: [56, 76], el: [64, 44], ha: [72, 48] }),
  },
  jump: {
    gear: "none", work: ["thigh"], labels: ["Sitt ner och ladda", "Explodera upp"],
    a: full({ head: [58, 41], sh: [55, 52], hip: [36, 68], kn: [58, 72], ft: [50, 91], el: [42, 62], ha: [32, 68] }),
    b: S({ head: [50, 3], sh: [50, 14], hip: [50, 42], kn: [52, 60], ft: [48, 77], el: [56, 8], ha: [60, 0] }),
  },
  ropes: {
    gear: "none", rope: true, work: ["upper", "torso"], labels: ["Händerna upp", "Slå ner repen"],
    a: full({ head: [58, 26], sh: [54, 37], hip: [42, 62], kn: [56, 74], ft: [50, 91], el: [64, 40], ha: [76, 34] }),
    b: full({ head: [58, 28], sh: [54, 39], hip: [42, 63], kn: [56, 75], ft: [50, 91], el: [62, 52], ha: [76, 62] }),
  },
  punch: {
    gear: "none", work: ["upper", "torso"], labels: ["Garden uppe", "Slå rakt fram"],
    a: full({ head: [52, 16], sh: [50, 28], hip: [48, 55], kn: [56, 73], ft: [60, 91], kn2: [42, 74], ft2: [36, 91], el: [56, 40], ha: [58, 26] }),
    b: full({ head: [54, 16], sh: [53, 28], hip: [48, 55], kn: [56, 73], ft: [60, 91], kn2: [42, 74], ft2: [36, 91], el: [66, 27], ha: [80, 25] }),
  },
  invrow: {
    gear: "none", rings: true, work: ["torso", "upper"], labels: ["Häng under ringarna, rak kropp", "Dra bröstet upp mot händerna"],
    a: full({ head: [26, 52], sh: [34, 58], hip: [58, 70], kn: [73, 80], ft: [86, 91], el: [35, 44], ha: [36, 30] }),
    b: full({ head: [30, 33], sh: [36, 41], hip: [60, 59], kn: [74, 75], ft: [86, 91], el: [26, 40], ha: [36, 30] }),
  },
  uprightrow: {
    gear: "barbell", work: ["upper"], labels: ["Armarna nere framför låren", "Dra upp till hakan, armbågar högt"],
    a: F({ el: [55, 42], ha: [52, 56], el2: [45, 42], ha2: [48, 56] }),
    b: F({ el: [66, 26], ha: [54, 28], el2: [34, 26], ha2: [46, 28] }),
  },
  nordic: {
    gear: "none", mat: true, work: ["thigh"], labels: ["På knä, fötterna fixerade", "Fäll framåt så långsamt du kan"],
    a: full({ head: [30, 25], sh: [29, 36], hip: [27, 64], kn: [24, 90], ft: [6, 91], el: [34, 48], ha: [36, 42] }),
    b: full({ head: [84, 62], sh: [73, 67], hip: [48, 79], kn: [24, 90], ft: [6, 91], el: [78, 78], ha: [82, 88] }),
  },
  seatedlegcurl: {
    gear: "none", bench: "seat", backrest: true, work: ["thigh"], labels: ["Benen raka framåt", "Böj hälarna ner och bak"],
    a: full({ head: [36, 22], sh: [37, 34], hip: [40, 60], kn: [60, 60], ft: [82, 58], el: [39, 48], ha: [44, 60] }),
    b: full({ head: [36, 22], sh: [37, 34], hip: [40, 60], kn: [60, 60], ft: [54, 82], el: [39, 48], ha: [44, 60] }),
  },
  standlegcurl: {
    gear: "none", work: ["thigh"], labels: ["Stå stabilt, benet rakt", "Böj hälen mot rumpan"],
    a: S({ el: [60, 40], ha: [68, 46] }),
    b: S({ el: [60, 40], ha: [68, 46], kn: [53, 73], ft: [36, 62] }),
  },
  ballcurl: {
    gear: "none", mat: true, ball: true, work: ["thigh"], labels: ["Höften uppe, benen raka", "Dra hälarna mot rumpan"],
    a: full({ head: [14, 86], sh: [24, 87], hip: [46, 80], kn: [64, 79], ft: [82, 80], el: [32, 90], ha: [40, 90] }),
    b: full({ head: [14, 86], sh: [24, 86], hip: [46, 70], kn: [62, 64], ft: [70, 80], el: [32, 90], ha: [40, 90] }),
  },
  seatedcalf: {
    gear: "none", bench: "seat", work: ["shin"], labels: ["Hälarna ner", "Pressa upp på tå"],
    a: full({ ...seatSide, kn: [58, 60], ft: [60, 88], el: [50, 46], ha: [56, 58] }),
    b: full({ ...seatSide, kn: [58, 55], ft: [61, 84], el: [50, 44], ha: [56, 54] }),
  },
  handstand: {
    gear: "none", wall: 60, work: ["upper"], labels: ["Handstående, armar raka", "Sänk huvudet mot golvet"],
    a: full({ head: [52, 72], sh: [52, 64], hip: [55, 38], kn: [56, 21], ft: [56, 5], el: [51, 78], ha: [50, 91] }),
    b: full({ head: [52, 86], sh: [53, 76], hip: [55, 50], kn: [56, 33], ft: [56, 17], el: [40, 82], ha: [50, 91] }),
  },
  pike: {
    gear: "none", mat: true, work: ["upper"], labels: ["Höften högt, armar raka", "Sänk huvudet mellan händerna"],
    a: full({ head: [66, 74], sh: [62, 67], hip: [44, 46], kn: [32, 68], ft: [20, 90], el: [63, 79], ha: [64, 91] }),
    b: full({ head: [68, 86], sh: [62, 78], hip: [44, 52], kn: [32, 71], ft: [20, 90], el: [54, 82], ha: [64, 91] }),
  },
  floorpress: {
    gear: "dumbbell", mat: true, work: ["torso", "upper"], labels: ["Armbågarna i golvet", "Pressa upp"],
    a: full({ head: [22, 85], sh: [31, 88], hip: [58, 89], kn: [72, 74], ft: [80, 91], el: [40, 89], ha: [37, 76] }),
    b: full({ head: [22, 85], sh: [31, 88], hip: [58, 89], kn: [72, 74], ft: [80, 91], el: [33, 74], ha: [32, 60] }),
  },
  floorfly: {
    gear: "dumbbell", mat: true, work: ["torso", "upper"], labels: ["Armarna ihop ovanför bröstet", "Öppna tills armbågarna nuddar golvet"],
    a: full({ head: [22, 85], sh: [31, 88], hip: [58, 89], kn: [72, 74], ft: [80, 91], el: [33, 74], ha: [32, 60] }),
    b: full({ head: [22, 85], sh: [31, 88], hip: [58, 89], kn: [72, 74], ft: [80, 91], el: [38, 89], ha: [30, 90], el2: [34, 89], ha2: [27, 90] }),
  },
  sealrow: {
    gear: "dumbbell", bench: "high", work: ["torso", "upper"], labels: ["På magen på bänken, armar hänger", "Dra armbågarna mot taket"],
    a: full({ head: [20, 54], sh: [29, 58], hip: [56, 59], kn: [72, 60], ft: [88, 61], el: [30, 72], ha: [30, 86] }),
    b: full({ head: [20, 54], sh: [29, 58], hip: [56, 59], kn: [72, 60], ft: [88, 61], el: [42, 52], ha: [38, 64] }),
  },
  spidercurl: {
    gear: "dumbbell", bench: "high", work: ["upper", "fore"], labels: ["Bröstet mot bänken, armen hänger", "Böj upp, överarmen lodrät"],
    a: full({ head: [20, 54], sh: [29, 58], hip: [56, 59], kn: [72, 60], ft: [88, 61], el: [29, 72], ha: [29, 86] }),
    b: full({ head: [20, 54], sh: [29, 58], hip: [56, 59], kn: [72, 60], ft: [88, 61], el: [29, 72], ha: [18, 64] }),
  },
  renegade: {
    gear: "dumbbell", mat: true, work: ["torso", "upper"], labels: ["Armhävningsläge på hantlarna", "Ro upp ena hanteln"],
    a: full({ head: [79, 60], sh: [70, 65], hip: [45, 72], kn: [31, 78], ft: [16, 88], el: [70, 78], ha: [70, 89], el2: [67, 78], ha2: [67, 89] }),
    b: full({ head: [79, 60], sh: [70, 65], hip: [45, 72], kn: [31, 78], ft: [16, 88], el: [58, 64], ha: [64, 76], el2: [67, 78], ha2: [67, 89] }),
  },
  svend: {
    gear: "dumbbell", work: ["torso", "upper"], labels: ["Pressa ihop vikten mot bröstet", "Pressa rakt fram"],
    a: S({ el: [56, 44], ha: [60, 36] }),
    b: S({ el: [66, 36], ha: [80, 36] }),
  },
  pistol: {
    gear: "none", work: ["thigh"], labels: ["Stå på ett ben", "Sitt ner, andra benet rakt fram"],
    a: S({ el: [62, 36], ha: [74, 36], el2: [59, 36], ha2: [71, 36] }),
    b: full({ head: [60, 44], sh: [56, 55], hip: [38, 72], kn: [58, 72], ft: [50, 91], kn2: [58, 74], ft2: [78, 72], el: [68, 56], ha: [80, 56], el2: [66, 56], ha2: [78, 56] }),
  },
  conccurl: {
    gear: "dumbbell", bench: "seat", work: ["upper", "fore"], labels: ["Armbågen mot låret, armen rak", "Böj upp mot axeln"],
    a: full({ head: [55, 30], sh: [50, 40], hip: [40, 60], kn: [58, 60], ft: [60, 86], el: [54, 56], ha: [56, 72] }),
    b: full({ head: [55, 30], sh: [50, 40], hip: [40, 60], kn: [58, 60], ft: [60, 86], el: [54, 56], ha: [48, 42] }),
  },
  hollow: {
    gear: "none", mat: true, work: ["torso"], labels: ["Ländryggen i golvet", "Lyft armar och ben, håll bananformen"],
    a: full({ head: [18, 82], sh: [26, 85], hip: [52, 88], kn: [68, 85], ft: [84, 82], el: [16, 81], ha: [6, 78] }),
    b: full({ head: [18, 79], sh: [26, 83], hip: [52, 88], kn: [68, 83], ft: [84, 78], el: [16, 77], ha: [6, 73] }),
  },
  lsit: {
    gear: "none", dipbars: true, work: ["torso", "upper"], labels: ["Tryck upp kroppen", "Håll benen raka framåt"],
    a: full({ head: [48, 26], sh: [48, 37], hip: [48, 62], kn: [66, 62], ft: [84, 62], el: [53, 47], ha: [56, 57] }),
    b: full({ head: [48, 25], sh: [48, 36], hip: [48, 61], kn: [66, 60], ft: [84, 58], el: [53, 47], ha: [56, 57] }),
  },
  extrot: {
    gear: "band", cableAt: [12, 44], work: ["upper"], labels: ["Armbågen mot sidan, 90°", "Rotera underarmen utåt"],
    a: F({ el: [58, 42], ha: [46, 45] }),
    b: F({ el: [58, 42], ha: [70, 40] }),
  },
  crab: {
    gear: "none", work: ["upper", "thigh"], labels: ["Händer och fötter i golvet", "Gå framåt, höften uppe"],
    a: full({ head: [22, 58], sh: [27, 66], hip: [48, 72], kn: [62, 66], ft: [70, 91], el: [26, 78], ha: [25, 91] }),
    b: full({ head: [28, 58], sh: [33, 66], hip: [54, 72], kn: [68, 66], ft: [74, 91], el: [32, 78], ha: [31, 91] }),
  },
  getup: {
    gear: "kettlebell", work: ["torso", "upper", "thigh"], labels: ["Ligg ner, vikten rakt upp", "Res dig med armen låst"],
    a: full({ head: [16, 84], sh: [26, 86], hip: [52, 88], kn: [66, 74], ft: [78, 91], el: [28, 74], ha: [29, 62] }),
    b: S({ el: [51, 13], ha: [51, 1] }),
  },
  cardio: {
    gear: "none", work: ["thigh"], labels: ["Vänster fram", "Höger fram"],
    a: S({ head: [53, 15], sh: [52, 27], kn: [62, 68], ft: [58, 85], kn2: [42, 75], ft2: [34, 88], el: [44, 38], ha: [50, 48], el2: [60, 36], ha2: [68, 28] }),
    b: S({ head: [53, 15], sh: [52, 27], kn: [42, 75], ft: [34, 88], kn2: [62, 68], ft2: [58, 85], el: [60, 36], ha: [68, 28], el2: [44, 38], ha2: [50, 48] }),
  },
};

const RULES: [RegExp, Pattern][] = [
  [/raka armars pulldown|straight-?arm|pullover i kabel|kabelpullover/, "straightarm"],
  [/roddmaskin|roddintervall/, "ergrow"],
  [/superman|ryggresning på golvet/, "superman"],
  [/hyperext|ryggres i maskin/, "hyperext"],
  [/omvänd pec deck|reverse pec/, "revpecdeck"],
  [/omvänd flyes i kabel|reverse cable fly/, "revfly"],
  [/omvänd flyes|reverse fly|rear delt/, "reardelt"],
  [/wall sit/, "wallsit"],
  [/sidoutfall|kosack/, "sidelunge"],
  [/tricepsdips på bänk|tricepsdips med raka ben|bänkdips/, "benchdip"],
  [/fransk press med skivstång|jm-press|skull ?crusher|liggande triceps/, "skullcrusher"],
  [/fransk press|overhead triceps|triceps overhead|katana/, "overheadtri"],
  [/^pullovers?$/, "pullover"],
  [/ryska twist|russian twist|rotationsmaskin/, "twist"],
  [/bird dog/, "birddog"],
  [/dead bug/, "deadbug"],
  [/side bends|sidoböj/, "sidebend"],
  [/kabelcrunch/, "kneelcrunch"],
  [/magmaskin/, "machinecrunch"],
  [/goblet march/, "march"],
  [/bålrotation med band/, "chop"],
  [/sidosteg/, "latstep"],
  [/donkey|fire hydrant/, "quadkick"],
  [/reverse hyper/, "revhyper"],
  [/clamshell|sidoliggande benlyft/, "sidelie"],
  [/adduktormaskin|abduktormaskin/, "abduct"],
  [/kabelabduktion/, "cableabd"],
  [/^benspark i maskin/, "glute"],
  [/burpee/, "burpee"],
  [/jumping jacks|seal jacks/, "jack"],
  [/cykling|cykelinterv|spinning|assault bike/, "bike"],
  [/boxjump|box jump|tuck jump|broad jump|knäböjshopp|hopprep/, "jump"],
  [/battling ropes/, "ropes"],
  [/skuggboxning/, "punch"],
  [/ringrodd/, "invrow"],
  [/dragkedja|upright row/, "uprightrow"],
  [/nordic/, "nordic"],
  [/sittande bencurl/, "seatedlegcurl"],
  [/lårcurl stående/, "standlegcurl"],
  [/bencurl med boll|glidande bencurl/, "ballcurl"],
  [/sittande tåhäv|^tåhävning i maskin/, "seatedcalf"],
  [/handstående/, "handstand"],
  [/pike/, "pike"],
  [/golvpress/, "floorpress"],
  [/flyes på golvet/, "floorfly"],
  [/seal row|bröststöttad rodd/, "sealrow"],
  [/spidercurl/, "spidercurl"],
  [/renegade/, "renegade"],
  [/svend/, "svend"],
  [/pistol/, "pistol"],
  [/koncentrationscurl/, "conccurl"],
  [/hollow/, "hollow"],
  [/l-sitt/, "lsit"],
  [/utåtrotation/, "extrot"],
  [/krabbgång/, "crab"],
  [/turkish/, "getup"],
  [/flyes med band/, "crossover"],
  [/leg extension/, "legext"],
  [/y-lyft|y-raise/, "lateral"],
  [/farmers walk|suitcase carry|bondgång/, "shrug"],
  [/waiters walk/, "ohp"],
  [/wall balls/, "squat"],
  [/hang clean|kettlebell clean|power clean|sandsäckslyft|slam ball|kettlebell windmill/, "hinge"],
  [/snatch|devil press|man makers/, "ohp"],
  [/inchworm/, "pushup"],
  [/tåhäv|calf/, "calf"],
  [/face pull/, "facepull"],
  [/pec deck|butterfly|flyes i maskin/, "pecdeck"],
  [/crossover|kryssdrag|cable fly|kabelflyes|flyes i kabel/, "crossover"],
  [/sittande (kabel)?rodd|kabelrodd|seated (cable )?row|rodd i kabel/, "seatedrow"],
  [/benpress|leg press/, "legpress"],
  [/pallof/, "pallof"],
  [/vedhugg|woodchop|kabelrotation/, "chop"],
  [/bröstpress i maskin|lutande bröstpress i maskin|chest press machine|bröstpress maskin/, "machinepress"],
  [/^kabelpress|kabelbröstpress|bröstpress i kabel|bröstpress med band/, "cablepress"],
  [/jm-press/, "triceps"],
  [/döda häng|dead hang/, "hang"],
  [/skulderbladsdrag/, "vpull"],
  [/kabelabduktion|fire hydrant|donkey|clamshell|sidoliggande benlyft/, "glute"],
  [/fladderspark|saxspark|omvända crunches|dragon flag/, "legraise"],
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
  const banded = /gummiband|med band|\bband/.test(n) && !/löpband/.test(n);
  const cable = !banded && /kabel|cable|crossover|kryssdrag|face pull|pushdown|latsdrag|pulldown|sittande rodd|med rep|pallof|vedhugg|woodchop|katana|bayesian/.test(n) || (["crossover", "seatedrow", "facepull", "cablepress", "pallof", "chop", "straightarm"] as Pattern[]).includes(pat) && !banded;
  const eq = ex.eq ?? [];
  if (cable) gear = "cable";
  else if (/kettlebell|sving|swing|goblet/.test(n)) gear = "kettlebell";
  else if (banded) gear = "band";
  else if (/skulderblad|wall ball|slam ball|sandsäck|bälte/.test(n)) gear = "none";
  else if (/hantel|dumbbell|hantlar|renegade/.test(n)) gear = "dumbbell";
  else if (/skivstång|stång|barbell|trap bar|ez|militär|smith/.test(n)) gear = "barbell";
  else if (/maskin|machine|pec deck|benpress|bensträck|bencurl|hack/.test(n)) gear = "none";
  else if (/armhäv|planka|dips|chins|pull-?up|kroppsvikt|utan vikt|ring|handstående|roddmaskin|roddintervall|löpband|hyperext|ryggres|superman|greppklämm|skulderblad/.test(n)) gear = "none";
  else if (/push press|landmine|viking|bradford|z-press|rensa och pressa|dragcurl/.test(n)) gear = "barbell";
  else if (eq[0] === "ingen" && gear !== "wheel") gear = "none";
  else if (eq[0] === "gummiband") gear = "band";
  else if (eq[0] === "hantlar" && gear !== "none") gear = "dumbbell";
  else if (eq[0] === "kettlebell" && gear !== "none") gear = "kettlebell";
  const machine = /maskin|machine|pec deck|benpress|hack|smith|bensträck|bencurl/.test(n) && !(["legpress", "pecdeck", "machinepress"] as Pattern[]).includes(pat) && !SCENES[pat].bench;
  const incline = /lutande|incline/.test(n) && ["bench", "fly", "row", "curl", "lateral"].includes(pat);
  const decline = /decline|nedåtlutande/.test(n);
  const c: Setup["cable"] = cable ? (/nerifrån/.test(n) ? "low" : /uppifrån/.test(n) ? "high" : pat === "row" || /face pull|crossover|kryss/.test(n) ? "mid" : HIGH_CABLE.includes(pat) ? "high" : LOW_CABLE.includes(pat) ? "low" : "mid") : undefined;
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
  crossover: "Bröst (inre & nedre)", seatedrow: "Mellersta rygg & latissimus", facepull: "Bakre delta & rotatorkuff",
  legpress: "Framsida lår & rumpa", pecdeck: "Bröst", machinepress: "Bröst & triceps", cablepress: "Bröst & triceps",
  pallof: "Djupa bålen (antirotation)", chop: "Sneda magmuskler", straightarm: "Latissimus (raka armar)",
  ergrow: "Rygg, ben & kondition", superman: "Ländrygg & rumpa", hyperext: "Ländrygg & rumpa", revpecdeck: "Bakre delta & övre rygg",
  revfly: "Bakre delta & övre rygg", reardelt: "Bakre delta & övre rygg", wallsit: "Framsida lår", sidelunge: "Lår (insida) & rumpa",
  benchdip: "Triceps", skullcrusher: "Triceps (långa huvudet)", overheadtri: "Triceps (långa huvudet)", pullover: "Latissimus & bröst",
  twist: "Sneda magmuskler", birddog: "Djupa bålen & ländrygg", deadbug: "Djupa bålen", sidebend: "Sneda magmuskler",
  kneelcrunch: "Raka magmuskeln", machinecrunch: "Raka magmuskeln", march: "Bål & höftböjare", latstep: "Sätesmuskel (gluteus medius)",
  quadkick: "Rumpa", revhyper: "Rumpa & ländrygg", sidelie: "Sätesmuskel (gluteus medius)", abduct: "Höftens ut-/insida",
  cableabd: "Sätesmuskel (gluteus medius)", burpee: "Helkropp & kondition", jack: "Kondition", bike: "Framsida lår & kondition",
  jump: "Framsida lår & rumpa (explosivitet)", ropes: "Axlar, armar & kondition", punch: "Axlar & bål", invrow: "Övre rygg & biceps",
  uprightrow: "Sidodelta & trapezius", nordic: "Baksida lår (hamstrings)", seatedlegcurl: "Baksida lår", standlegcurl: "Baksida lår",
  ballcurl: "Baksida lår & rumpa", seatedcalf: "Djupa vadmuskeln (soleus)", handstand: "Axlar & triceps", pike: "Axlar & triceps",
  floorpress: "Bröst & triceps", floorfly: "Bröst", sealrow: "Övre rygg & latissimus", spidercurl: "Biceps (korta huvudet)",
  renegade: "Rygg & bål", svend: "Inre bröst", pistol: "Framsida lår & rumpa", conccurl: "Biceps", hollow: "Raka magmuskeln",
  lsit: "Bål & höftböjare", extrot: "Rotatorkuff (infraspinatus)", crab: "Triceps, axlar & bål", getup: "Helkropp & axelstabilitet",
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
  [/axelpress i maskin|frontpress i maskin|seated dumbbell|sittande axelpress|sittande hantelpress/, "seatedpress", {
    bench: "seat", backrest: true, labels: ["Sitt, händerna vid axlarna", "Pressa rakt upp"],
    a: full({ ...seatSide, el: [50, 40], ha: [48, 27] }),
    b: full({ ...seatSide, el: [46, 18], ha: [45, 5] }),
  }],
  [/hammer/, "hammer", { labels: ["Armen rak, tummen upp", "Böj upp, neutralt grepp"] }],
  [/preacher|scott|bicepscurl i maskin/, "preacher", {
    bench: "seat", labels: ["Armen sträckt mot dynan", "Böj upp, överarmen på dynan"],
    a: full({ head: [40, 22], sh: [41, 34], hip: [40, 60], kn: [58, 60], ft: [60, 86], el: [58, 46], ha: [72, 58] }),
    b: full({ head: [40, 22], sh: [41, 34], hip: [40, 60], kn: [58, 60], ft: [60, 86], el: [58, 46], ha: [56, 30] }),
  }],
  [/latsdrag|^(?!.*raka armar).*pulldown/, "pulldown", {
    bar: false, bench: "seat", cableAt: [52, 3], labels: ["Sitt, armarna raka uppåt", "Dra stången till bröstet"],
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
  const pat = patternFor(ex);
  const base: Scene = { ...SCENES[pat], ...v };
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

  // Skulpterad silhuett: avsmalnande lemmar med muskelbuk, arbetande muskel tonas in i accentfärg
  const limbPath = (p: P, q: P, w1: number, w2: number, bulge: number, at = 0.4) => {
    const dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy) || 1;
    const nx = -dy / L, ny = dx / L;
    const c: P = [p[0] + dx * at, p[1] + dy * at];
    const o = (b: P, w: number, s: 1 | -1) => `${(b[0] + nx * w * s / 2).toFixed(2)} ${(b[1] + ny * w * s / 2).toFixed(2)}`;
    // kontrollpunkt förskjuts så kurvan når "bulge"-bredden
    const k = (w: number) => 2 * w - (w1 + w2) / 2;
    return `M${o(p, w1, 1)} Q${o(c, k(bulge), 1)} ${o(q, w2, 1)} L${o(q, w2, -1)} Q${o(c, k(bulge), -1)} ${o(p, w1, -1)}Z`;
  };
  const SHAPE: Record<Seg, [number, number, number, number?]> = {
    thigh: [10, 6.5, 11.5], shin: [6.2, 3.6, 7.2, 0.3], upper: [6.4, 4.4, 7], fore: [5, 3.2, 5.6, 0.3], torso: [15, 11, 15.5, 0.25],
  };
  const seg = (p: J, q: J, _w: number, s: Seg, far = false) => {
    const hot = sc.work.includes(s);
    const [w1, w2, b, at] = SHAPE[s];
    const d = limbPath(a[p], a[q], w1, w2, b, at);
    return (
      <g opacity={far ? 0.5 : 1}>
        <path d={d} className={far ? "fill-muted-foreground" : "fill-foreground"} />
        <circle cx={a[q][0]} cy={a[q][1]} r={w2 / 2} className={far ? "fill-muted-foreground" : "fill-foreground"} />
        <circle cx={a[p][0]} cy={a[p][1]} r={w1 / 2} className={far ? "fill-muted-foreground" : "fill-foreground"} />
        {hot && <path d={d} className="fill-coral" opacity={0.25 + 0.75 * t} />}
        {hot && !far && <path d={d} className="fill-coral" filter="url(#glow)" opacity={0.5 * t} />}
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
        {su.cable && (() => {
          // Kabelstation: torn med viktmagasin som lyfts när vajern dras ut, trissa vid utgången.
          const y0 = su.cable === "high" ? 8 : su.cable === "low" ? 86 : 45;
          const anchor: P = sc.cableAt ?? [88, y0];
          const left = anchor[0] < 30;
          const tx = left ? 4 : 88;
          const lift = 9 * t;
          const plates = [0, 1, 2, 3, 4, 5];
          const tower = (x: number, k: string) => (
            <g key={k}>
              <rect x={x} y="3" width="8" height="90" rx="1.5" className="fill-foreground/10 stroke-foreground/40" strokeWidth="0.6" />
              <line x1={x + 4} y1="5" x2={x + 4} y2={78 - lift} strokeWidth="0.5" className="stroke-foreground/60" />
              {plates.map((i) => {
                const moving = i >= 3;
                return <rect key={i} x={x + 1.2} y={89 - i * 3.2 - (moving ? lift : 0)} width="5.6" height="2.6" rx="0.6" className={moving ? "fill-coral/80" : "fill-foreground/45"} />;
              })}
              <circle cx={x + 4} cy="5" r="1.6" className="fill-card stroke-foreground/70" strokeWidth="0.7" />
            </g>
          );
          const hand: P = a[gearAt];
          return (
            <g>
              {tower(tx, "t1")}
              {sc.dualCable && tower(4, "t2")}
              {Math.abs(anchor[0] - (tx + 4)) > 6 && <path d={`M${tx + 4} 5 L${anchor[0]} 5 L${anchor[0]} ${anchor[1]}`} fill="none" strokeWidth="0.6" className="stroke-foreground/50" />}
              <circle cx={anchor[0]} cy={anchor[1]} r="2" className="fill-card stroke-foreground/80" strokeWidth="0.8" />
              <line x1={anchor[0]} y1={anchor[1]} x2={hand[0]} y2={hand[1]} strokeWidth="0.7" className="stroke-foreground/80" />
              {sc.dualCable && <>
                <circle cx="8" cy={anchor[1]} r="2" className="fill-card stroke-foreground/80" strokeWidth="0.8" />
                <line x1="8" y1={anchor[1]} x2={a.ha2[0]} y2={a.ha2[1]} strokeWidth="0.7" className="stroke-foreground/80" />
              </>}
            </g>
          );
        })()}
        {sc.legpress && (() => {
          // Benpress 45°: sits/ryggstöd och fotplatta som glider på skenan.
          const f = a.ft;
          return (
            <g>
              <line x1="30" y1="86" x2="92" y2="36" strokeWidth="2" strokeLinecap="round" className="stroke-foreground/25" />
              <path d="M10 44 L30 76 L46 78" fill="none" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" className="stroke-foreground/35" />
              <rect x="34" y="78" width="6" height="15" className="fill-foreground/30" />
              <g transform={`translate(${f[0] + 3} ${f[1] + 1}) rotate(-51)`}><rect x="-12" y="-1.6" width="24" height="3.2" rx="1" className="fill-foreground/60" /></g>
            </g>
          );
        })()}
        {sc.ergo && <g><line x1="14" y1="85" x2="92" y2="85" strokeWidth="2" strokeLinecap="round" className="stroke-foreground/35" /><circle cx="86" cy="72" r="7" className="fill-foreground/15 stroke-foreground/40" strokeWidth="0.8" /><rect x={a.hip[0] - 7} y="81" width="14" height="3" rx="1.5" className="fill-foreground/45" /><line x1={a.ha[0]} y1={a.ha[1]} x2="80" y2="70" strokeWidth="0.6" className="stroke-foreground/60" /></g>}
        {sc.hyper && <g className="fill-foreground/35"><rect x="40" y="48" width="16" height="5" rx="2.5" transform="rotate(-40 48 50)" /><line x1="44" y1="54" x2="32" y2="93" strokeWidth="3" className="stroke-foreground/35" /><rect x="22" y="76" width="8" height="4" rx="2" /></g>}
        {sc.wall !== undefined && <line x1={sc.wall} y1="2" x2={sc.wall} y2="93" strokeWidth="2.5" strokeLinecap="round" className="stroke-foreground/35" />}
        {sc.bike && <g className="stroke-foreground/40" fill="none" strokeWidth="2" strokeLinecap="round"><line x1="34" y1="54" x2="50" y2="82" /><line x1="50" y1="82" x2="72" y2="50" /><line x1="34" y1="54" x2="74" y2="48" /><line x1="50" y1="82" x2="40" y2="93" /><line x1="50" y1="82" x2="64" y2="93" /><circle cx="50" cy="82" r="8" strokeWidth="0.8" /><rect x="28" y="51" width="12" height="3" rx="1.5" className="fill-foreground/50" stroke="none" /></g>}
        {sc.rope && <path d={`M${a.ha[0]} ${a.ha[1]} Q${(a.ha[0] + 96) / 2} ${a.ha[1] < 50 ? 92 : 60} 96 84`} fill="none" strokeWidth="1.4" className="stroke-foreground/70" />}
        {sc.rings && <g className="stroke-foreground/60" fill="none"><line x1="36" y1="0" x2={a.ha[0]} y2={a.ha[1] - 2} strokeWidth="0.7" /><circle cx={a.ha[0]} cy={a.ha[1]} r="2.4" strokeWidth="1" /></g>}
        {sc.ball && <circle cx="84" cy="85" r="7" className="fill-coral/30 stroke-coral/60" strokeWidth="0.8" />}
        {sc.backrest && <rect x="22" y="22" width="5" height="44" rx="2" className="fill-foreground/35" />}
        {pat === "pecdeck" && <>
          <rect x={a.ha[0] - 2} y={a.ha[1] - 2} width="4" height="18" rx="1.5" className="fill-foreground/50" />
          <rect x={a.ha2[0] - 2} y={a.ha2[1] - 2} width="4" height="18" rx="1.5" className="fill-foreground/50" />
        </>}
        {pat === "machinepress" && <rect x={a.ha[0] - 1} y={a.ha[1] - 6} width="2.4" height="12" rx="1" className="fill-foreground/60" />}
        {su.gear === "band" && <line x1={a.ft[0]} y1="91" x2={a.ha[0]} y2={a.ha[1]} strokeWidth="1.4" className="stroke-coral/70" />}
        {su.machine && !base.bench && <g className="fill-foreground/30"><rect x="8" y="10" width="5" height="83" rx="2" /><rect x="8" y="66" width="22" height="5" rx="2" /></g>}
        {su.incline && base.bench && base.bench !== "seat" && <line x1="54" y1="62" x2="30" y2="44" strokeWidth="5" strokeLinecap="round" className="stroke-foreground/35" />}
        {seg("hip", "kn2", 9, "thigh", true)}{seg("kn2", "ft2", 6.5, "shin", true)}
        {seg("sh", "el2", 6.5, "upper", true)}{seg("el2", "ha2", 5, "fore", true)}
        {(["ft2"] as J[]).map((f) => <path key={f} d={`M${a[f][0] - 2.4} ${a[f][1] + 1.4} Q${a[f][0] - 2.6} ${a[f][1] - 2.4} ${a[f][0] + 0.5} ${a[f][1] - 2} L${a[f][0] + 5.2} ${a[f][1] - 0.2} Q${a[f][0] + 6.4} ${a[f][1] + 1.4} ${a[f][0] + 5} ${a[f][1] + 1.6} Z`} className="fill-muted-foreground" />)}
        <path d={limbPath(a.sh, a.head, 5.5, 4.6, 5, 0.5)} className="fill-foreground" />
        {seg("sh", "hip", 15, "torso")}
        {seg("hip", "kn", 10, "thigh")}{seg("kn", "ft", 7, "shin")}
        <path d={`M${a.ft[0] - 2.4} ${a.ft[1] + 1.4} Q${a.ft[0] - 2.6} ${a.ft[1] - 2.4} ${a.ft[0] + 0.5} ${a.ft[1] - 2} L${a.ft[0] + 5.2} ${a.ft[1] - 0.2} Q${a.ft[0] + 6.4} ${a.ft[1] + 1.4} ${a.ft[0] + 5} ${a.ft[1] + 1.6} Z`} className="fill-foreground" />
        {seg("sh", "el", 7, "upper")}{seg("el", "ha", 5.5, "fore")}
        <circle cx={a.sh[0]} cy={a.sh[1] + 1.2} r="4.4" className={sc.work.includes("upper") ? "fill-foreground" : "fill-foreground"} />
        {sc.work.includes("upper") && <circle cx={a.sh[0]} cy={a.sh[1] + 1.2} r="4.4" className="fill-coral" opacity={0.25 + 0.75 * t} />}
        <circle cx={a.ha[0]} cy={a.ha[1]} r="2.3" className="fill-foreground" />
        <ellipse rx="5" ry="6" cx={a.head[0]} cy={a.head[1]} className="fill-foreground" />
        {sc.gear === "barbell" && at(gearAt, <g><circle r="8" className="fill-foreground" /><circle r="2.2" className="fill-card" /></g>)}
        {sc.gear === "dumbbell" && at(gearAt, <g className="fill-foreground"><rect x="-6" y="-2" width="12" height="4" rx="1" /><rect x="-7" y="-4.5" width="4" height="9" rx="1.5" /><rect x="3" y="-4.5" width="4" height="9" rx="1.5" /></g>)}
        {sc.gear === "kettlebell" && at(gearAt, <g><circle cy="3" r="4.5" className="fill-foreground" /><path d="M-2.5 -0.5 V-4 H2.5 V-0.5" fill="none" strokeWidth="1.4" className="stroke-foreground" /></g>)}
        {sc.gear === "cable" && at(gearAt, /rep|rope|face pull/.test(n) || pat === "facepull"
          ? <g className="stroke-foreground" strokeWidth="1.2" strokeLinecap="round" fill="none"><path d="M0 -2 L-2.5 3" /><path d="M0 -2 L2.5 3" /></g>
          : pat === "vpull" || /latsdrag|pulldown/.test(n) ? <rect x="-9" y="-0.9" width="18" height="1.8" rx="0.9" className="fill-foreground" />
          : <path d="M-2.5 -2.5 L2.5 -2.5 L1.5 2 L-1.5 2 Z" fill="none" strokeWidth="1.1" className="stroke-foreground" />)}
        {sc.gear === "cable" && sc.dualCable && <path transform={`translate(${a.ha2[0]} ${a.ha2[1]})`} d="M-2.5 -2.5 L2.5 -2.5 L1.5 2 L-1.5 2 Z" fill="none" strokeWidth="1.1" className="stroke-foreground" />}
        {sc.gear === "wheel" && at(gearAt, <g><circle r="5" className="fill-foreground" /><circle r="1.6" className="fill-card" /></g>)}
        {moved && (() => {
          // Pilen ritas vid sidan av rörelsebanan, på den sida som är längst från kroppen, så den aldrig skär genom figuren.
          const s0 = sc.a[gearAt], s1 = sc.b[gearAt];
          const dx = s1[0] - s0[0], dy = s1[1] - s0[1], len = Math.hypot(dx, dy) || 1;
          let nx = -dy / len, ny = dx / len;
          const mx = (s0[0] + s1[0]) / 2, my = (s0[1] + s1[1]) / 2;
          const body = [sc.a.sh, sc.a.hip, sc.b.sh, sc.b.hip, sc.a.head, sc.b.head];
          const cx = body.reduce((s, p) => s + p[0], 0) / body.length, cy = body.reduce((s, p) => s + p[1], 0) / body.length;
          if (nx * (mx - cx) + ny * (my - cy) < 0) { nx = -nx; ny = -ny; }
          const off = 10, cl = (v: number) => Math.min(96, Math.max(4, v));
          const x1 = cl(s0[0] + dx * 0.15 + nx * off), y1 = cl(s0[1] + dy * 0.15 + ny * off);
          const x2 = cl(s0[0] + dx * 0.85 + nx * off), y2 = cl(s0[1] + dy * 0.85 + ny * off);
          return <line x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="1" strokeDasharray="1.5 1.5" className="stroke-coral" opacity="0.8" markerEnd="url(#arrow)" />;
        })()}
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
