import type { Workout } from "@/lib/balans";

export interface Improvement { name: string; diffKg: number }

/** Compares each weighted exercise with the most recent earlier finished workout containing it. */
export function improvements(current: Workout, all: Workout[]): Improvement[] {
  const earlier = all
    .filter((w) => w.id !== current.id && w.status === "klart" && w.date <= current.date)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  const out: Improvement[] = [];
  for (const e of current.exercises) {
    if (!e.weightKg) continue;
    const key = e.name.toLowerCase();
    const prev = earlier.flatMap((w) => w.exercises).find((x) => x.name.toLowerCase() === key && x.weightKg);
    if (prev?.weightKg && e.weightKg > prev.weightKg) out.push({ name: e.name, diffKg: Math.round((e.weightKg - prev.weightKg) * 10) / 10 });
  }
  return out;
}

export function lastWeight(name: string, currentId: string, all: Workout[]): number | undefined {
  const key = name.toLowerCase();
  return all
    .filter((w) => w.id !== currentId && w.status === "klart")
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .flatMap((w) => w.exercises)
    .find((x) => x.name.toLowerCase() === key && x.weightKg)?.weightKg;
}
