import type { Workout } from "./balans";
import { MUSCLES, muscleRecovery, recoveryStatus } from "./exercises";

/** Heaviest completed set per exercise (with reps at that weight), heaviest first. */
export function bestLifts(
  workouts: Workout[],
  limit = 10,
): { name: string; kg: number; reps: number }[] {
  const best = new Map<string, { name: string; kg: number; reps: number }>();
  for (const w of workouts) {
    if (w.status !== "klart") continue;
    for (const e of w.exercises) {
      const sets = e.log?.length ? e.log : [{ kg: e.weightKg, reps: e.reps }];
      for (const s of sets) {
        const kg = s.kg ?? 0,
          reps = s.reps ?? 0;
        if (kg <= 0 || reps <= 0) continue;
        const cur = best.get(e.name);
        if (!cur || kg > cur.kg || (kg === cur.kg && reps > cur.reps))
          best.set(e.name, { name: e.name, kg, reps });
      }
    }
  }
  return [...best.values()].sort((a, b) => b.kg - a.kg).slice(0, limit);
}

/** One line per muscle group: days rested and readiness. */
export function recoveryLine(workouts: Workout[], today: string): string {
  const rec = muscleRecovery(workouts, today);
  return MUSCLES.filter((m) => m.value !== "kondition" && m.value !== "helkropp")
    .map(
      (m) =>
        `${m.label}: ${recoveryStatus(rec[m.value]).label} (${recoveryStatus(rec[m.value]).tone})`,
    )
    .join("; ");
}

export interface CoachTurn {
  q: string;
  a: string;
}
/** Last turns sent as memory; trimmed so the prompt stays small. */
export function historyFor(
  chat: { q: string; a: string; error?: boolean }[],
  max = 8,
): CoachTurn[] {
  return chat
    .filter((m) => !m.error)
    .slice(-max)
    .map((m) => ({ q: m.q.slice(0, 600), a: m.a.slice(0, 900) }));
}
