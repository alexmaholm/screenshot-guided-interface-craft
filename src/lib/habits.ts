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
    result[key] = value;
  }
  return result;
}