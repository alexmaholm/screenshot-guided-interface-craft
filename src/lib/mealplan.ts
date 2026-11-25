import {
  addDays,
  weekdayIndex,
  type DayHabits,
  type PlannedMeal,
  type Workout,
} from "@/lib/balans";

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

/** Planned meals for the given dates as shareable text, one line per meal in date order. */
export function planText(plan: PlannedMeal[], dates: string[], dayLabels: string[]): string {
  return dates
    .flatMap((d, i) =>
      plan.filter((pm) => pm.date === d && pm.name).map((pm) => `- ${dayLabels[i]}: ${pm.name}`),
    )
    .join("\n");
}
