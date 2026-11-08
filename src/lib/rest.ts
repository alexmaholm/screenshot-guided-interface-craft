import type { Workout } from "@/lib/balans";

export const REST_PRESETS = [30, 60, 90, 120, 180] as const;
export const REST_STEP = 15;

/** Klampar vilotiden till 0–600 s i steg om 5 s. */
export function clampRest(sec: number): number {
  return Math.max(0, Math.min(600, Math.round(sec / 5) * 5));
}

/** Senast valda vilotid för en övning i tidigare pass, annars standardvärdet. */
export function rememberedRest(name: string, workouts: Workout[], fallback: number): number {
  for (let i = workouts.length - 1; i >= 0; i--) {
    const e = workouts[i]!.exercises.find((x) => x.name === name);
    if (e && typeof e.restSec === "number") return e.restSec;
  }
  return fallback;
}
