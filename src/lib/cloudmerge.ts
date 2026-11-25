import type { State } from "@/lib/balans";

/**
 * Merges the local state with the cloud copy without losing entries on either side.
 *
 * - Entries with an `id` (meals, workouts, favorites, templates, ...) are united by id.
 *   When the same id exists on both sides, the cloud copy wins.
 * - Day-keyed records (habits, health, body weight) are united by date, with the cloud copy winning.
 * - The profile and subscription come from the cloud when it has them.
 *
 * Known trade-off: an entry deleted on one device is restored if the other device still has it,
 * because deletions are not stored. This never loses logged data.
 */

type WithId = { id: string };

export function unionById<T extends WithId>(remote: T[] | undefined, local: T[] | undefined): T[] {
  const r = remote ?? [];
  const seen = new Set(r.map((x) => x.id));
  return [...r, ...(local ?? []).filter((x) => !seen.has(x.id))];
}

export function unionByKey<T>(
  remote: T[] | undefined,
  local: T[] | undefined,
  key: (x: T) => string,
): T[] {
  const r = remote ?? [];
  const seen = new Set(r.map(key));
  return [...r, ...(local ?? []).filter((x) => !seen.has(key(x)))];
}

export function mergeRecords<T>(
  remote: Record<string, T> | undefined,
  local: Record<string, T> | undefined,
): Record<string, T> {
  return { ...(local ?? {}), ...(remote ?? {}) };
}

export function mergeStates(local: State, remote: Partial<State>): State {
  return {
    ...local,
    profile: remote.profile ?? local.profile,
    meals: unionById(remote.meals, local.meals),
    workouts: unionById(remote.workouts, local.workouts),
    favorites: unionById(remote.favorites, local.favorites),
    templates: unionById(remote.templates, local.templates),
    customExercises: unionById(remote.customExercises, local.customExercises),
    mealPlan: unionById(remote.mealPlan, local.mealPlan),
    body: unionByKey(remote.body, local.body, (b) => b.date),
    habits: mergeRecords(remote.habits, local.habits),
    health: remote.health || local.health ? mergeRecords(remote.health, local.health) : undefined,
    subscription: remote.subscription ?? local.subscription,
  };
}
