import type { Exercise, SetEntry, Workout } from "@/lib/balans";

/** Per-set rows for an exercise; older saved exercises get rows built from sets/reps/weight. */
export function setRows(e: Exercise): SetEntry[] {
  if (e.log) return e.log;
  return Array.from({ length: Math.max(1, e.sets ?? 1) }, () => ({ reps: e.reps, timeSec: e.timeSec, kg: e.weightKg, done: e.done }));
}

/** Writes rows back and keeps summary fields (sets, reps, heaviest kg, done) in sync for history and progress. */
export function withRows(e: Exercise, rows: SetEntry[]): Exercise {
  const kgs = rows.map((r) => r.kg ?? 0).filter((k) => k > 0);
  return {
    ...e,
    log: rows,
    sets: rows.length,
    reps: e.reps !== undefined ? rows[0]?.reps ?? e.reps : undefined,
    weightKg: kgs.length ? Math.max(...kgs) : undefined,
    done: rows.length > 0 && rows.every((r) => r.done),
  };
}

/** Adds a set copying the previous one, or removes the last set (minimum one). */
export function changeSetCount(e: Exercise, delta: 1 | -1): Exercise {
  const rows = setRows(e);
  if (delta === 1) {
    const last = rows[rows.length - 1];
    return withRows(e, [...rows, { reps: last?.reps, timeSec: last?.timeSec, kg: last?.kg, done: false }]);
  }
  return rows.length <= 1 ? e : withRows(e, rows.slice(0, -1));
}

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
