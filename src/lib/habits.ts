import type { DayHabits, Meal, Profile } from "@/lib/balans";

export const PRODUCE_GOAL = 5;
export const SLEEP_GOAL = 8;

/** Habit completion, not a medical assessment. Missing entries contribute zero. */
export function habitSummary(habits: DayHabits, meals: Meal[], profile: Profile) {
  const mealCount = new Set(meals.filter((m) => m.type !== "mellanmål").map((m) => m.type)).size;
  const completion = (value: number, goal: number) => Math.max(0, Math.min(1, value / Math.max(1, goal)));
  const parts = {
    water: completion(habits.water, profile.waterGoal),
    produce: completion(habits.produce ?? 0, PRODUCE_GOAL),
    sleep: completion(habits.sleepH ?? 0, SLEEP_GOAL),
    meals: completion(mealCount, 3),
  };
  return { parts, mealCount, score: Math.round(Object.values(parts).reduce((sum, value) => sum + value, 0) * 25) };
}

export function parseNutrition(values: { kcal: string; protein: string; carbs: string; fat: string }) {
  const result: { kcal?: number | undefined; protein?: number | undefined; carbs?: number | undefined; fat?: number | undefined } = {};
  for (const key of ["kcal", "protein", "carbs", "fat"] as const) {
    const raw = values[key].trim();
    if (!raw) continue;
    const value = Number(raw.replace(",", "."));
    if (!Number.isFinite(value) || value < 0) return null;
    result[key] = key === "kcal" ? Math.round(value) : round1(value);
  }
  return result;
}
type StreakInput = {
  meals: Pick<Meal, "date">[];
  workouts: { date: string; status: string; kind: string }[];
  habits: Record<string, DayHabits>;
};

/** "Vila är också framsteg": vald vilodag eller planerat vilopass räknas som aktiv dag. */
export function dayStatus(s: StreakInput, date: string): "aktiv" | "vila" | "tom" {
  const h = s.habits[date];
  const active = s.meals.some((m) => m.date === date)
    || s.workouts.some((w) => w.date === date && w.status === "klart" && w.kind !== "vila")
    || !!(h && (h.water > 0 || (h.produce ?? 0) > 0 || (h.sleepH ?? 0) > 0));
  if (active) return "aktiv";
  if (h?.restDay || s.workouts.some((w) => w.date === date && w.kind === "vila")) return "vila";
  return "tom";
}

/** Dagar i rad bakåt från idag. Idag får vara tom utan att bryta sviten. */
export function streakInfo(s: StreakInput, today: string, addDays: (d: string, n: number) => string) {
  let streak = 0, restDays = 0;
  for (let i = 0; i < 365; i++) {
    const d = addDays(today, -i);
    const st = dayStatus(s, d);
    if (st === "tom") { if (i === 0) continue; break; }
    streak++;
    if (st === "vila") restDays++;
  }
  return { streak, restDays, today: dayStatus(s, today) };
}
