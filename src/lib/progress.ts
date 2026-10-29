import type { Exercise, SetEntry, SetType, Workout } from "@/lib/balans";

const SET_CYCLE: SetType[] = ["normal", "warmup", "drop", "failure"];
/** Next set type when the set badge is tapped: Normal → W → D → F → Normal. */
export const nextSetType = (t: SetType | undefined): SetType => SET_CYCLE[(SET_CYCLE.indexOf(t ?? "normal") + 1) % SET_CYCLE.length]!;

/** Badge text: working sets are numbered among themselves; W/D/F use letters. */
export function setLabels(rows: SetEntry[]): string[] {
  let n = 0;
  return rows.map((r) => (r.type === "warmup" ? "W" : r.type === "drop" ? "D" : r.type === "failure" ? "F" : String(++n)));
}

/** Per-set rows for an exercise; older saved exercises get rows built from sets/reps/weight. */
export function setRows(e: Exercise): SetEntry[] {
  if (e.log) return e.log;
  return Array.from({ length: Math.max(1, e.sets ?? 1) }, () => ({ reps: e.reps, timeSec: e.timeSec, kg: e.weightKg, done: e.done }));
}

/** Writes rows back and keeps summary fields (sets, reps, heaviest kg, done) in sync for history and progress. */
export function withRows(e: Exercise, rows: SetEntry[]): Exercise {
  // Warm-up sets never count as the heaviest lift, so progress and records stay honest.
  const kgs = rows.filter((r) => r.type !== "warmup").map((r) => r.kg ?? 0).filter((k) => k > 0);
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

export interface StrengthPoint { date: string; kg: number }

/** Heaviest weight per finished workout date for one exercise, oldest first. */
export function strengthHistory(name: string, all: Workout[]): StrengthPoint[] {
  const key = name.toLowerCase();
  const byDate = new Map<string, number>();
  for (const w of all) {
    if (w.status !== "klart") continue;
    for (const e of w.exercises) {
      if (e.name.toLowerCase() !== key || !e.weightKg) continue;
      byDate.set(w.date, Math.max(byDate.get(w.date) ?? 0, e.weightKg));
    }
  }
  return [...byDate].sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([date, kg]) => ({ date, kg }));
}

/** Weighted exercises from finished workouts, most frequently logged first. */
export function trackedExercises(all: Workout[]): string[] {
  const count = new Map<string, number>();
  for (const w of all) if (w.status === "klart") for (const e of w.exercises) if (e.weightKg) count.set(e.name, (count.get(e.name) ?? 0) + 1);
  return [...count].sort((a, b) => b[1] - a[1]).map(([n]) => n);
}

/** Lifted volume (kg × reps) for one workout; warm-up sets are excluded so the number reflects working effort. */
export function workoutVolume(w: Workout): number {
  return w.exercises.reduce((sum, e) => sum + setRows(e)
    .filter((r) => r.type !== "warmup")
    .reduce((a, r) => a + (r.kg ?? 0) * (r.reps ?? 0), 0), 0);
}

export interface WeekReport { workouts: number; volumeKg: number; minutes: number; topLift?: { name: string; kg: number } | undefined }

/** Week summary over finished workouts whose date is in `days`. */
export function weekReport(all: Workout[], days: string[]): WeekReport {
  const done = all.filter((w) => w.status === "klart" && days.includes(w.date));
  let top: WeekReport["topLift"];
  for (const w of done) for (const e of w.exercises) if (e.weightKg && (!top || e.weightKg > top.kg)) top = { name: e.name, kg: e.weightKg };
  return { workouts: done.length, volumeKg: Math.round(done.reduce((a, w) => a + workoutVolume(w), 0)), minutes: done.reduce((a, w) => a + w.durationMin, 0), topLift: top };
}
