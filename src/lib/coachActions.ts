import {
  dateKey,
  uid,
  type Exercise,
  type Meal,
  type MealType,
  type State,
  type WorkoutKind,
} from "./balans";
import { EXERCISES } from "./exercises";

export const MEAL_TYPES: MealType[] = ["frukost", "lunch", "middag", "mellanmål"];
const KINDS: WorkoutKind[] = ["styrka", "kondition", "rörlighet"];

export interface CoachSet {
  reps?: number | undefined;
  kg?: number | undefined;
  timeSec?: number | undefined;
}
export interface CoachExercise {
  name: string;
  sets: CoachSet[];
}

export type CoachAction =
  | {
      kind: "log_meal";
      type: MealType;
      name: string;
      amount: string;
      kcal: number;
      protein: number;
      carbs: number;
      fat: number;
    }
  | { kind: "log_water"; ml: number }
  | { kind: "log_weight"; kg: number }
  | {
      kind: "log_workout";
      status: "klart" | "planerat";
      title: string;
      workoutKind: WorkoutKind;
      durationMin: number;
      exercises: CoachExercise[];
    };

const num = (v: unknown, max: number) => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) && n >= 0 && n <= max ? Math.round(n * 10) / 10 : null;
};
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

type Raw = Partial<
  Record<
    | "kind"
    | "ml"
    | "kg"
    | "name"
    | "type"
    | "amount"
    | "kcal"
    | "protein"
    | "carbs"
    | "fat"
    | "status"
    | "title"
    | "workoutKind"
    | "durationMin"
    | "exercises"
    | "sets"
    | "reps"
    | "timeSec",
    unknown
  >
>;

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9åäö]+/g, " ")
    .trim();

/** Maps a free-text exercise name to the library name (Swedish or English), else keeps the AI's name. */
export function matchExerciseName(name: string, custom: { name: string }[] = []): string {
  const n = norm(name);
  if (!n) return name;
  const all = [...custom.map((c) => ({ name: c.name, nameEn: c.name })), ...EXERCISES];
  const exact = all.find((e) => norm(e.name) === n || norm(e.nameEn) === n);
  if (exact) return exact.name;
  const partial = all
    .filter(
      (e) =>
        norm(e.name).includes(n) ||
        norm(e.nameEn).includes(n) ||
        n.includes(norm(e.name)) ||
        n.includes(norm(e.nameEn)),
    )
    .sort(
      (a, b) => Math.abs(norm(a.name).length - n.length) - Math.abs(norm(b.name).length - n.length),
    );
  return partial[0]?.name ?? name;
}

function sanitizeSets(raw: unknown): CoachSet[] {
  if (!Array.isArray(raw)) return [];
  const out: CoachSet[] = [];
  for (const s of raw.slice(0, 12)) {
    if (!s || typeof s !== "object") continue;
    const r = s as Raw;
    const reps = r.reps == null ? null : num(r.reps, 200);
    const kg = r.kg == null ? null : num(r.kg, 600);
    const timeSec = r.timeSec == null ? null : num(r.timeSec, 7200);
    if (!reps && !timeSec) continue;
    out.push({
      reps: reps ? Math.round(reps) : undefined,
      kg: kg ?? undefined,
      timeSec: timeSec ? Math.round(timeSec) : undefined,
    });
  }
  return out;
}

/** Validates raw AI output; drops anything unsafe or nonsensical. */
export function sanitizeActions(raw: unknown, custom: { name: string }[] = []): CoachAction[] {
  if (!Array.isArray(raw)) return [];
  const out: CoachAction[] = [];
  for (const a of raw.slice(0, 6)) {
    if (!a || typeof a !== "object") continue;
    const r = a as Raw;
    if (r.kind === "log_water") {
      const ml = num(r.ml, 3000);
      if (ml && ml >= 50) out.push({ kind: "log_water", ml: Math.round(ml) });
    } else if (r.kind === "log_weight") {
      const kg = num(r.kg, 350);
      if (kg && kg >= 25) out.push({ kind: "log_weight", kg });
    } else if (r.kind === "log_meal") {
      const name = str(r.name, 80);
      const type = MEAL_TYPES.includes(r.type as MealType) ? (r.type as MealType) : null;
      const kcal = num(r.kcal, 5000),
        protein = num(r.protein, 400),
        carbs = num(r.carbs, 800),
        fat = num(r.fat, 400);
      if (!name || !type || kcal === null || protein === null || carbs === null || fat === null)
        continue;
      out.push({
        kind: "log_meal",
        type,
        name,
        amount: str(r.amount, 40) || "1 portion",
        kcal: Math.round(kcal),
        protein,
        carbs,
        fat,
      });
    } else if (r.kind === "log_workout") {
      const exercises = (Array.isArray(r.exercises) ? r.exercises : [])
        .slice(0, 15)
        .flatMap((e: unknown) => {
          if (!e || typeof e !== "object") return [];
          const x = e as Raw;
          const name = str(x.name, 60);
          const sets = sanitizeSets(x.sets);
          return name && sets.length ? [{ name: matchExerciseName(name, custom), sets }] : [];
        });
      if (!exercises.length) continue;
      const workoutKind = KINDS.includes(r.workoutKind as WorkoutKind)
        ? (r.workoutKind as WorkoutKind)
        : "styrka";
      const dur = num(r.durationMin, 300);
      out.push({
        kind: "log_workout",
        status: r.status === "planerat" ? "planerat" : "klart",
        title: str(r.title, 60) || "Pass",
        workoutKind,
        durationMin:
          dur && dur >= 5
            ? Math.round(dur)
            : Math.max(10, exercises.reduce((n, e) => n + e.sets.length, 0) * 3),
        exercises,
      });
    }
  }
  return out;
}

/** 250 ml = one glass in the water log. */
export const mlToGlasses = (ml: number) => Math.max(1, Math.round(ml / 250));

function toExercise(e: CoachExercise, done: boolean): Exercise {
  const preset = EXERCISES.find((p) => p.name === e.name);
  const top = Math.max(0, ...e.sets.map((s) => s.kg ?? 0));
  return {
    name: e.name,
    sets: e.sets.length,
    reps: e.sets[0]?.reps,
    timeSec: e.sets[0]?.timeSec,
    weightKg: top || undefined,
    restSec: preset?.restSec ?? 90,
    done,
    log: e.sets.map((s) => ({ reps: s.reps, kg: s.kg, timeSec: s.timeSec, done })),
  };
}

export function applyAction(st: State, a: CoachAction, date = dateKey()): State {
  if (a.kind === "log_water") {
    const h = st.habits[date] ?? { water: 0 };
    return {
      ...st,
      habits: { ...st.habits, [date]: { ...h, water: h.water + mlToGlasses(a.ml) } },
    };
  }
  if (a.kind === "log_weight") {
    return {
      ...st,
      body: [...st.body.filter((b) => b.date !== date), { date, weight: a.kg }].sort((x, y) =>
        x.date.localeCompare(y.date),
      ),
    };
  }
  if (a.kind === "log_workout") {
    const done = a.status === "klart";
    return {
      ...st,
      workouts: [
        ...st.workouts,
        {
          id: uid(),
          date,
          title: a.title,
          kind: a.workoutKind,
          durationMin: a.durationMin,
          status: a.status,
          exercises: a.exercises.map((e) => toExercise(e, done)),
        },
      ],
    };
  }
  const meal: Meal = {
    id: uid(),
    date,
    type: a.type,
    name: a.name,
    amount: a.amount,
    kcal: a.kcal,
    protein: a.protein,
    carbs: a.carbs,
    fat: a.fat,
  };
  return { ...st, meals: [...st.meals, meal] };
}
