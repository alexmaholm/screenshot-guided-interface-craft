import { dateKey, uid, type Meal, type MealType, type State } from "./balans";

export const MEAL_TYPES: MealType[] = ["frukost", "lunch", "middag", "mellanmål"];

export type CoachAction =
  | { kind: "log_meal"; type: MealType; name: string; amount: string; kcal: number; protein: number; carbs: number; fat: number }
  | { kind: "log_water"; ml: number };

const num = (v: unknown, max: number) => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) && n >= 0 && n <= max ? Math.round(n * 10) / 10 : null;
};

/** Validates raw AI output; drops anything unsafe or nonsensical. */
export function sanitizeActions(raw: unknown): CoachAction[] {
  if (!Array.isArray(raw)) return [];
  const out: CoachAction[] = [];
  for (const a of raw.slice(0, 4)) {
    if (!a || typeof a !== "object") continue;
    const r = a as Partial<Record<"kind" | "ml" | "name" | "type" | "amount" | "kcal" | "protein" | "carbs" | "fat", unknown>>;
    if (r.kind === "log_water") {
      const ml = num(r.ml, 3000);
      if (ml && ml >= 50) out.push({ kind: "log_water", ml: Math.round(ml) });
    } else if (r.kind === "log_meal") {
      const name = typeof r.name === "string" ? r.name.trim().slice(0, 80) : "";
      const type = MEAL_TYPES.includes(r.type as MealType) ? (r.type as MealType) : null;
      const kcal = num(r.kcal, 5000), protein = num(r.protein, 400), carbs = num(r.carbs, 800), fat = num(r.fat, 400);
      if (!name || !type || kcal === null || protein === null || carbs === null || fat === null) continue;
      out.push({ kind: "log_meal", type, name, amount: typeof r.amount === "string" ? r.amount.slice(0, 40) : "1 portion", kcal: Math.round(kcal), protein, carbs, fat });
    }
  }
  return out;
}

/** 250 ml = one glass in the water log. */
export const mlToGlasses = (ml: number) => Math.max(1, Math.round(ml / 250));

export function applyAction(st: State, a: CoachAction, date = dateKey()): State {
  if (a.kind === "log_water") {
    const h = st.habits[date] ?? { water: 0 };
    return { ...st, habits: { ...st.habits, [date]: { ...h, water: h.water + mlToGlasses(a.ml) } } };
  }
  const meal: Meal = { id: uid(), date, type: a.type, name: a.name, amount: a.amount, kcal: a.kcal, protein: a.protein, carbs: a.carbs, fat: a.fat };
  return { ...st, meals: [...st.meals, meal] };
}
