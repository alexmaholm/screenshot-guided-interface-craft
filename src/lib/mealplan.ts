import { addDays, weekdayIndex, type DayHabits, type PlannedMeal, type Workout } from "@/lib/balans";
import { RECIPES, scaleIngredients } from "@/lib/recipes";

/** Monday–Sunday date keys for the week containing `key`. */
export function weekDates(key: string): string[] {
  const start = addDays(key, -weekdayIndex(key));
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export type DayKind = "träning" | "vila" | "fri";
/** Training day when a non-rest workout exists; rest when chosen or a rest workout is planned. */
export function dayKind(workouts: Workout[], habits: DayHabits | undefined, date: string): DayKind {
  const w = workouts.filter((x) => x.date === date);
  if (w.some((x) => x.kind !== "vila")) return "träning";
  if (habits?.restDay || w.some((x) => x.kind === "vila")) return "vila";
  return "fri";
}

export const DAY_HINT: Record<DayKind, string> = {
  träning: "Träningsdag – lite extra kolhydrater ger energi till passet.",
  vila: "Vilodag – fokusera på protein och grönt för återhämtning.",
  fri: "Ät efter hunger och dina vanliga mål.",
};

/** All planned ingredients for the given dates, merged per name+unit. */
export function planIngredientsText(plan: PlannedMeal[], dates: string[]): string {
  const totals = new Map<string, { qty: number; unit: string; name: string }>();
  for (const pm of plan) {
    if (!dates.includes(pm.date)) continue;
    const r = RECIPES.find((x) => x.id === pm.recipeId);
    if (!r) continue;
    for (const i of r.ingredients) {
      const k = `${i.name}|${i.unit}`;
      const cur = totals.get(k) ?? { qty: 0, unit: i.unit, name: i.name };
      cur.qty += i.qty;
      totals.set(k, cur);
    }
  }
  const fmt = (n: number) => String(Math.round(n * 10) / 10).replace(".", ",");
  return [...totals.values()].map((i) => `- ${fmt(i.qty)} ${i.unit} ${i.name}`).join("\n");
}

export { scaleIngredients };
