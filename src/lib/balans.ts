import { useSyncExternalStore } from "react";

export type Goal = "energi" | "styrka" | "kondition" | "vanor" | "annat";
export type Level = "nybörjare" | "van" | "erfaren";
export type Equipment = "ingen" | "hantlar" | "gummiband" | "gym" | "kettlebell";
export type Diet = "allt" | "vegetariskt" | "veganskt" | "pescetariskt" | "glutenfritt";
export type Restriction = "gluten" | "laktos" | "mjolk" | "notter" | "soja" | "agg";
export const RESTRICTIONS: { value: Restriction; label: string }[] = [
  { value: "gluten", label: "Glutenfritt" },
  { value: "laktos", label: "Laktosfritt" },
  { value: "mjolk", label: "Mjölkfritt" },
  { value: "notter", label: "Utan nötter och jordnötter" },
  { value: "soja", label: "Utan soja" },
  { value: "agg", label: "Utan ägg" },
];
export const DIETS: { value: Diet; label: string }[] = [
  { value: "allt", label: "Äter det mesta" },
  { value: "vegetariskt", label: "Vegetariskt" },
  { value: "veganskt", label: "Veganskt" },
  { value: "pescetariskt", label: "Pescetariskt" },
  { value: "glutenfritt", label: "Glutenfritt" },
];
export type MealType = "frukost" | "lunch" | "middag" | "mellanmål";
export type WorkoutKind = "styrka" | "kondition" | "rörlighet" | "vila";

export interface Profile {
  name: string;
  goal: Goal;
  goalOther?: string | undefined;
  level?: Level | undefined;
  equipment: Equipment[];
  days: number[]; // 0=mån … 6=sön
  diet?: Diet | undefined;
  restrictions?: Restriction[] | undefined;
  sessionMin: number;
  hideCalories: boolean;
  waterGoal: number;
  trainingFocus?: import("@/lib/exercises").TrainingFocus | undefined;
  trainingWishes?: string | undefined;
}

export interface Meal {
  id: string;
  date: string;
  type: MealType;
  name: string;
  amount: string;
  kcal?: number | undefined;
  protein?: number | undefined;
  carbs?: number | undefined;
  fat?: number | undefined;
}

export interface Favorite {
  id: string;
  name: string;
  amount: string;
  type: MealType;
  kcal?: number | undefined;
  protein?: number | undefined;
  carbs?: number | undefined;
  fat?: number | undefined;
}

export interface Exercise {
  name: string;
  sets?: number | undefined;
  reps?: number | undefined;
  timeSec?: number | undefined;
  restSec: number;
  done: boolean;
  weightKg?: number | undefined;
  /** Per-set log; when present, sets/weightKg/done are derived from it. */
  log?: SetEntry[] | undefined;
}

export type SetType = "normal" | "warmup" | "drop" | "failure";

export interface SetEntry {
  reps?: number | undefined;
  timeSec?: number | undefined;
  kg?: number | undefined;
  done: boolean;
  /** Missing means a normal working set. */
  type?: SetType | undefined;
}

export interface Workout {
  id: string;
  date: string;
  title: string;
  kind: WorkoutKind;
  durationMin: number;
  exercises: Exercise[];
  status: "planerat" | "klart";
  feeling?: number | undefined; // 1–5
  note?: string | undefined;
}

export interface DayHabits {
  water: number;
  produce?: number | undefined;
  sleepH?: number | undefined;
  recovery?: number | undefined; // 1–5
}

export interface CustomExercise {
  id: string;
  name: string;
  muscle: string;
  equipment: Equipment[];
  track: "vikt" | "reps" | "tid";
  note?: string | undefined;
}

export interface State {
  profile: Profile | null;
  meals: Meal[];
  favorites: Favorite[];
  workouts: Workout[];
  habits: Record<string, DayHabits>;
  body: { date: string; weight: number }[];
  customExercises: CustomExercise[];
  templates: import("@/lib/templates").WorkoutTemplate[];
}

const KEY = "balans:v1";
const empty: State = { profile: null, meals: [], favorites: [], workouts: [], habits: {}, body: [], customExercises: [], templates: [] };

let state: State | null = null;
const listeners = new Set<() => void>();

function load(): State {
  if (state) return state;
  try {
    const raw = localStorage.getItem(KEY);
    state = raw ? { ...empty, ...JSON.parse(raw) } : empty;
  } catch {
    state = empty;
  }
  return state ?? empty;
}

export function update(fn: (s: State) => State) {
  state = fn(load());
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* lagring full eller blockerad */
  }
  listeners.forEach((l) => l());
}

export function resetAll() {
  localStorage.removeItem(KEY);
  state = empty;
  listeners.forEach((l) => l());
}

/** Returns null during server render / before hydration. */
export function useBalans(): State | null {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => load(),
    () => null,
  );
}

export const uid = () => Math.random().toString(36).slice(2, 10);

export function dateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
export function addDays(key: string, n: number) {
  const [y = 0, m = 1, d = 1] = key.split("-").map(Number);
  return dateKey(new Date(y, m - 1, d + n));
}
export function weekdayIndex(key: string) {
  const [y = 0, m = 1, d = 1] = key.split("-").map(Number);
  return (new Date(y, m - 1, d).getDay() + 6) % 7;
}
export const WEEKDAYS = ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"];
export function prettyDate(key: string) {
  const [y = 0, m = 1, d = 1] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("sv-SE", { weekday: "long", day: "numeric", month: "long" });
}

export const MEAL_TYPES: MealType[] = ["frukost", "lunch", "middag", "mellanmål"];
export const MEAL_LABEL: Record<MealType, string> = {
  frukost: "Frukost",
  lunch: "Lunch",
  middag: "Middag",
  mellanmål: "Mellanmål",
};

/* ---------------- Träningsgenerator ---------------- */

type Lib = { name: string; eq: Equipment[]; time?: boolean };
const LIB: Record<Exclude<WorkoutKind, "vila">, Lib[]> = {
  styrka: [
    { name: "Knäböj", eq: ["ingen"] },
    { name: "Armhävningar", eq: ["ingen"] },
    { name: "Utfallssteg", eq: ["ingen"] },
    { name: "Planka", eq: ["ingen"], time: true },
    { name: "Glute bridge", eq: ["ingen"] },
    { name: "Hantelrodd", eq: ["hantlar", "gym"] },
    { name: "Axelpress med hantlar", eq: ["hantlar", "gym"] },
    { name: "Rumänsk marklyft", eq: ["hantlar", "gym", "kettlebell"] },
    { name: "Kettlebellsving", eq: ["kettlebell"] },
    { name: "Bandrodd", eq: ["gummiband"] },
    { name: "Bänkpress", eq: ["gym"] },
    { name: "Latsdrag", eq: ["gym"] },
  ],
  kondition: [
    { name: "Jumping jacks", eq: ["ingen"], time: true },
    { name: "Höga knän", eq: ["ingen"], time: true },
    { name: "Mountain climbers", eq: ["ingen"], time: true },
    { name: "Burpees i lugnt tempo", eq: ["ingen"], time: true },
    { name: "Skridskohopp", eq: ["ingen"], time: true },
    { name: "Roddmaskin", eq: ["gym"], time: true },
    { name: "Kettlebellsving", eq: ["kettlebell"], time: true },
  ],
  rörlighet: [
    { name: "Katt och ko", eq: ["ingen"], time: true },
    { name: "Höftöppnare", eq: ["ingen"], time: true },
    { name: "Bröstryggsrotation", eq: ["ingen"], time: true },
    { name: "Hamstringsstretch", eq: ["ingen"], time: true },
    { name: "Barnets position", eq: ["ingen"], time: true },
    { name: "Djup knäböj-håll", eq: ["ingen"], time: true },
  ],
};

export const KIND_LABEL: Record<WorkoutKind, string> = {
  styrka: "Styrka",
  kondition: "Kondition",
  rörlighet: "Rörlighet",
  vila: "Vilodag",
};

export function generateWorkout(opts: {
  kind: WorkoutKind;
  level: Level;
  equipment: Equipment[];
  minutes: number;
  date: string;
}): Workout {
  const { kind, level, minutes, date } = opts;
  if (kind === "vila") {
    return {
      id: uid(),
      date,
      title: "Vila & återhämtning",
      kind,
      durationMin: 20,
      status: "planerat",
      exercises: [
        { name: "Lugn promenad", timeSec: 900, restSec: 0, done: false },
        { name: "Andningsövning", timeSec: 300, restSec: 0, done: false },
      ],
    };
  }
  const eq = new Set<Equipment>(["ingen", ...opts.equipment]);
  const pool = LIB[kind].filter((e) => e.eq.some((x) => eq.has(x)));
  const count = Math.max(3, Math.min(pool.length, Math.round(minutes / 6)));
  const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, count);
  const lvl = level === "nybörjare" ? 0 : level === "van" ? 1 : 2;
  const exercises: Exercise[] = shuffled.map((e) =>
    e.time || kind !== "styrka"
      ? { name: e.name, sets: kind === "rörlighet" ? 1 : 2 + lvl, timeSec: kind === "rörlighet" ? 60 : 30 + lvl * 10, restSec: kind === "rörlighet" ? 15 : 30, done: false }
      : { name: e.name, sets: 2 + lvl, reps: [10, 10, 8][lvl], restSec: 60 + lvl * 15, done: false },
  );
  const titles: Record<Exclude<WorkoutKind, "vila">, string[]> = {
    styrka: ["Helkropp styrka", "Stark bas", "Styrka & stabilitet"],
    kondition: ["Pulshöjare", "Intervaller light", "Energiboost"],
    rörlighet: ["Mjuk rörlighet", "Lätt i kroppen", "Stretch & andning"],
  };
  return {
    id: uid(),
    date,
    title: titles[kind][Math.floor(Math.random() * 3)] ?? KIND_LABEL[kind],
    kind,
    durationMin: minutes,
    exercises,
    status: "planerat",
  };
}

function kindForGoal(goal: Goal, i: number): WorkoutKind {
  const cycles: Record<Goal, WorkoutKind[]> = {
    styrka: ["styrka", "rörlighet", "styrka", "kondition"],
    kondition: ["kondition", "styrka", "kondition", "rörlighet"],
    energi: ["kondition", "rörlighet", "styrka"],
    vanor: ["rörlighet", "styrka", "kondition"],
    annat: ["styrka", "kondition", "rörlighet"],
  };
  const c = cycles[goal];
  return c[i % c.length] ?? "rörlighet";
}

/* ---------------- Måltidsförslag ---------------- */

export interface Suggestion {
  name: string;
  amount: string;
  type: MealType;
  kcal: number;
  protein: number;
  diets: Diet[];
}
const ALL: Diet[] = ["allt", "vegetariskt", "veganskt", "pescetariskt", "glutenfritt"];
export const SUGGESTIONS: Suggestion[] = [
  { name: "Havregrynsgröt med bär och nötter", amount: "1 skål", type: "frukost", kcal: 380, protein: 12, diets: ["allt", "vegetariskt", "veganskt", "pescetariskt"] },
  { name: "Kvarg med banan och müsli", amount: "1 skål", type: "frukost", kcal: 340, protein: 24, diets: ["allt", "vegetariskt", "pescetariskt"] },
  { name: "Äggröra på surdegsbröd", amount: "2 ägg, 1 skiva", type: "frukost", kcal: 360, protein: 18, diets: ["allt", "vegetariskt", "pescetariskt"] },
  { name: "Chiapudding med mango", amount: "1 glas", type: "frukost", kcal: 300, protein: 9, diets: ALL },
  { name: "Linsgryta med ris", amount: "1 tallrik", type: "lunch", kcal: 520, protein: 22, diets: ALL },
  { name: "Kycklingsallad med quinoa", amount: "1 stor skål", type: "lunch", kcal: 480, protein: 35, diets: ["allt", "glutenfritt"] },
  { name: "Halloumiwrap med grönsaker", amount: "1 wrap", type: "lunch", kcal: 560, protein: 24, diets: ["allt", "vegetariskt", "pescetariskt"] },
  { name: "Ugnsbakad lax med potatis", amount: "1 tallrik", type: "middag", kcal: 610, protein: 38, diets: ["allt", "pescetariskt", "glutenfritt"] },
  { name: "Tofu-wok med nudlar", amount: "1 tallrik", type: "middag", kcal: 550, protein: 26, diets: ["allt", "vegetariskt", "veganskt", "pescetariskt"] },
  { name: "Kikärtscurry med ris", amount: "1 tallrik", type: "middag", kcal: 540, protein: 18, diets: ALL },
  { name: "Köttfärssås med pasta", amount: "1 tallrik", type: "middag", kcal: 650, protein: 34, diets: ["allt"] },
  { name: "Äpple och jordnötssmör", amount: "1 äpple, 1 msk", type: "mellanmål", kcal: 190, protein: 4, diets: ALL },
  { name: "Hummus med morötter", amount: "1 liten skål", type: "mellanmål", kcal: 180, protein: 6, diets: ALL },
  { name: "Proteinyoghurt", amount: "1 burk", type: "mellanmål", kcal: 150, protein: 17, diets: ["allt", "vegetariskt", "pescetariskt", "glutenfritt"] },
];
// Ingredients assumed by the curated suggestions. Missing metadata is never eligible.
const CONTAINS: Record<string, Restriction[]> = {
  "Havregrynsgröt med bär och nötter": ["gluten", "notter"],
  "Kvarg med banan och müsli": ["gluten", "laktos", "mjolk", "notter"],
  "Äggröra på surdegsbröd": ["gluten", "agg", "mjolk", "laktos"],
  "Chiapudding med mango": [], // Prepared with coconut drink.
  "Linsgryta med ris": [],
  "Kycklingsallad med quinoa": [],
  "Halloumiwrap med grönsaker": ["gluten", "mjolk", "laktos"],
  "Ugnsbakad lax med potatis": [], // Prepared with oil, not butter.
  "Tofu-wok med nudlar": ["gluten", "soja"],
  "Kikärtscurry med ris": [], // Prepared with coconut milk.
  "Köttfärssås med pasta": ["gluten"],
  "Äpple och jordnötssmör": ["notter"],
  "Hummus med morötter": [],
  "Proteinyoghurt": ["mjolk", "laktos"],
};

/** Shared eligibility rule for any dish (suggestions, recipes). */
export function dishEligible(diets: Diet[], contains: Restriction[] | undefined, diet: Diet | undefined, restrictions: Restriction[] = []) {
  return contains !== undefined && diets.includes(diet ?? "allt") && restrictions.every((r) => !contains.includes(r));
}

export function suggestionsFor(diet: Diet | undefined, type?: MealType, restrictions: Restriction[] = []) {
  const d = diet ?? "allt";
  return SUGGESTIONS.filter((s) => {
    const contains = CONTAINS[s.name];
    return contains !== undefined && s.diets.includes(d) && (!type || s.type === type)
      && restrictions.every((r) => !contains.includes(r));
  });
}

export function recoverySuggestions(profile: Profile, workout: Workout | undefined): Suggestion[] {
  if (!workout || workout.status !== "klart" || workout.kind === "vila") return [];
  return suggestionsFor(profile.diet, undefined, profile.restrictions)
    .filter((meal) => meal.type === "lunch" || meal.type === "middag")
    .sort((a, b) => workout.kind === "styrka" ? b.protein - a.protein : a.kcal - b.kcal)
    .slice(0, 3);
}

/* ---------------- Onboarding: skapa plan + exempeldata ---------------- */

/** New users start with no history: only upcoming planned workouts from today, no meals, habits or favorites. */
export function completeOnboarding(p: Profile) {
  const today = dateKey();
  const level = p.level ?? "nybörjare";
  const days = p.days.length ? p.days : [0, 2, 4];
  const workouts: Workout[] = [];
  let n = 0;
  for (let off = 0; off <= 7; off++) {
    const date = addDays(today, off);
    if (days.includes(weekdayIndex(date))) {
      workouts.push(generateWorkout({ kind: kindForGoal(p.goal, n++), level, equipment: p.equipment, minutes: p.sessionMin, date }));
    }
  }
  update(() => ({ profile: p, meals: [], favorites: [], workouts, habits: {}, body: [], customExercises: [], templates: [] }));
}

/* ---------------- Tips ---------------- */

export function dayTip(w: Workout | undefined, mealsToday: Meal[]): string {
  if (!w || w.kind === "vila")
    return "Vilodagar är en del av träningen. Ät som vanligt, drick vatten och unna dig en promenad om kroppen vill.";
  if (w.status === "klart")
    return "Snyggt jobbat! En måltid med både protein och kolhydrater inom några timmar kan hjälpa återhämtningen.";
  if (mealsToday.length === 0)
    return "Många mår bra av ett lätt mellanmål 1–2 timmar före ett pass, till exempel en banan eller en yoghurt.";
  if (w.kind === "styrka")
    return "Inför styrkepass kan det kännas bra att ha ätit en vanlig måltid några timmar innan. Lyssna på din kropp.";
  return "Inför konditionspass passar något lättsmält. Ta med en vattenflaska och värm upp lugnt.";
}

/* ---------------- Livsmedelsbas & makron ---------------- */

export type Unit = "g" | "dl" | "msk" | "st";
export interface Food {
  name: string;
  /** Per 100 g */
  kcal: number; protein: number; carbs: number; fat: number;
  /** Grams per unit */
  units: Partial<Record<Unit, number>>;
  contains: Restriction[];
  animal?: "kott" | "fisk" | "mejeri" | "agg" | undefined;
}

export const FOODS: Food[] = [
  { name: "Havregryn", kcal: 370, protein: 13, carbs: 59, fat: 7, units: { g: 1, dl: 35 }, contains: ["gluten"] },
  { name: "Glutenfria havregryn", kcal: 370, protein: 13, carbs: 59, fat: 7, units: { g: 1, dl: 35 }, contains: [] },
  { name: "Mellanmjölk", kcal: 46, protein: 3.5, carbs: 4.8, fat: 1.5, units: { g: 1, dl: 100 }, contains: ["mjolk", "laktos"], animal: "mejeri" },
  { name: "Havredryck", kcal: 45, protein: 1, carbs: 7, fat: 1.5, units: { g: 1, dl: 100 }, contains: [] },
  { name: "Kvarg naturell", kcal: 63, protein: 11, carbs: 4, fat: 0.2, units: { g: 1, dl: 110 }, contains: ["mjolk", "laktos"], animal: "mejeri" },
  { name: "Grekisk yoghurt 2 %", kcal: 75, protein: 9, carbs: 4, fat: 2, units: { g: 1, dl: 105 }, contains: ["mjolk", "laktos"], animal: "mejeri" },
  { name: "Ägg", kcal: 140, protein: 12.5, carbs: 0.5, fat: 10, units: { g: 1, st: 55 }, contains: ["agg"], animal: "agg" },
  { name: "Banan", kcal: 95, protein: 1.1, carbs: 21, fat: 0.3, units: { g: 1, st: 120 }, contains: [] },
  { name: "Äpple", kcal: 52, protein: 0.3, carbs: 12, fat: 0.2, units: { g: 1, st: 150 }, contains: [] },
  { name: "Blåbär", kcal: 50, protein: 0.7, carbs: 10, fat: 0.6, units: { g: 1, dl: 65 }, contains: [] },
  { name: "Kycklingfilé, tillagad", kcal: 150, protein: 30, carbs: 0, fat: 3, units: { g: 1, st: 130 }, contains: [], animal: "kott" },
  { name: "Nötfärs 10 %, stekt", kcal: 215, protein: 26, carbs: 0, fat: 12, units: { g: 1 }, contains: [], animal: "kott" },
  { name: "Lax, ugnsbakad", kcal: 200, protein: 22, carbs: 0, fat: 12, units: { g: 1, st: 125 }, contains: [], animal: "fisk" },
  { name: "Tonfisk i vatten", kcal: 105, protein: 24, carbs: 0, fat: 1, units: { g: 1, st: 120 }, contains: [], animal: "fisk" },
  { name: "Tofu", kcal: 125, protein: 13, carbs: 2, fat: 7, units: { g: 1 }, contains: ["soja"] },
  { name: "Kikärtor, kokta", kcal: 140, protein: 7, carbs: 18, fat: 2.5, units: { g: 1, dl: 70 }, contains: [] },
  { name: "Röda linser, kokta", kcal: 115, protein: 9, carbs: 17, fat: 0.4, units: { g: 1, dl: 80 }, contains: [] },
  { name: "Ris, kokt", kcal: 130, protein: 2.7, carbs: 28, fat: 0.3, units: { g: 1, dl: 65 }, contains: [] },
  { name: "Pasta, kokt", kcal: 150, protein: 5.5, carbs: 30, fat: 0.9, units: { g: 1, dl: 45 }, contains: ["gluten"] },
  { name: "Potatis, kokt", kcal: 75, protein: 1.8, carbs: 16, fat: 0.1, units: { g: 1, st: 80 }, contains: [] },
  { name: "Quinoa, kokt", kcal: 120, protein: 4.4, carbs: 21, fat: 1.9, units: { g: 1, dl: 70 }, contains: [] },
  { name: "Knäckebröd", kcal: 340, protein: 10, carbs: 60, fat: 2, units: { g: 1, st: 12 }, contains: ["gluten"] },
  { name: "Fullkornsbröd", kcal: 245, protein: 9, carbs: 42, fat: 3.5, units: { g: 1, st: 35 }, contains: ["gluten"] },
  { name: "Hårdost 17 %", kcal: 280, protein: 27, carbs: 0, fat: 17, units: { g: 1, st: 10 }, contains: ["mjolk"], animal: "mejeri" },
  { name: "Smör", kcal: 740, protein: 0.5, carbs: 0.5, fat: 82, units: { g: 1, msk: 12 }, contains: ["mjolk"], animal: "mejeri" },
  { name: "Rapsolja", kcal: 900, protein: 0, carbs: 0, fat: 100, units: { g: 1, msk: 9 }, contains: [] },
  { name: "Jordnötssmör", kcal: 600, protein: 25, carbs: 13, fat: 50, units: { g: 1, msk: 16 }, contains: ["notter"] },
  { name: "Mandlar", kcal: 600, protein: 21, carbs: 7, fat: 52, units: { g: 1, dl: 60 }, contains: ["notter"] },
  { name: "Avokado", kcal: 160, protein: 2, carbs: 2, fat: 15, units: { g: 1, st: 140 }, contains: [] },
  { name: "Broccoli", kcal: 35, protein: 3, carbs: 4, fat: 0.4, units: { g: 1, dl: 35 }, contains: [] },
  { name: "Tomat", kcal: 20, protein: 0.9, carbs: 3, fat: 0.2, units: { g: 1, st: 100 }, contains: [] },
  { name: "Morot", kcal: 40, protein: 0.9, carbs: 8, fat: 0.2, units: { g: 1, st: 70 }, contains: [] },
  { name: "Hummus", kcal: 250, protein: 7, carbs: 14, fat: 18, units: { g: 1, msk: 15 }, contains: [] },
];

export const UNIT_LABEL: Record<Unit, string> = { g: "g", dl: "dl", msk: "msk", st: "st" };

const DIET_EXCLUDES: Record<Diet, NonNullable<Food["animal"]>[]> = {
  allt: [], glutenfritt: [], vegetariskt: ["kott", "fisk"], pescetariskt: ["kott"], veganskt: ["kott", "fisk", "mejeri", "agg"],
};

/** Foods eligible for the profile's diet and restrictions (same rules as meal suggestions). */
export function foodsFor(diet: Diet | undefined, restrictions: Restriction[] = [], query = "") {
  const d = diet ?? "allt";
  const r = d === "glutenfritt" ? [...restrictions, "gluten" as Restriction] : restrictions;
  const q = query.trim().toLowerCase();
  return FOODS.filter((f) => !(f.animal && DIET_EXCLUDES[d].includes(f.animal))
    && r.every((x) => !f.contains.includes(x)) && (!q || f.name.toLowerCase().includes(q)));
}

export function portion(food: Food, qty: number, unit: Unit) {
  const grams = qty * (food.units[unit] ?? 1);
  const k = grams / 100;
  const r1 = (n: number) => Math.round(n * k * 10) / 10;
  return { grams, kcal: Math.round(food.kcal * k), protein: r1(food.protein), carbs: r1(food.carbs), fat: r1(food.fat) };
}

export interface MacroTargets { kcal: number; protein: number; carbs: number; fat: number }
/** Simple daily targets from latest weight (default 70 kg) and goal. */
export function macroTargets(profile: Profile, weightKg?: number): MacroTargets {
  const w = weightKg && weightKg > 30 ? weightKg : 70;
  const kcal = Math.round((w * 31 + (profile.days.length >= 4 ? 150 : 0)) / 10) * 10;
  const protein = Math.round(w * (profile.goal === "styrka" ? 1.8 : 1.4));
  const fat = Math.round((kcal * 0.3) / 9);
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
  return { kcal, protein, carbs, fat };
}

export function sumMacros(meals: Meal[]): MacroTargets {
  const r = (n: number) => Math.round(n);
  return {
    kcal: r(meals.reduce((a, m) => a + (m.kcal ?? 0), 0)),
    protein: r(meals.reduce((a, m) => a + (m.protein ?? 0), 0)),
    carbs: r(meals.reduce((a, m) => a + (m.carbs ?? 0), 0)),
    fat: r(meals.reduce((a, m) => a + (m.fat ?? 0), 0)),
  };
}

export const GLASS_ML = 250;
