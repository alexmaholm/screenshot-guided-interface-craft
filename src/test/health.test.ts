import { describe, it, expect } from "vitest";
import { mergeHealth } from "@/lib/health";
import type { State } from "@/lib/balans";
const base = { profile: null, meals: [], favorites: [], workouts: [], habits: {}, body: [{ date: "2026-11-01", weight: 80 }], customExercises: [], templates: [], mealPlan: [] } as State;
describe("mergeHealth", () => {
  it("saves steps and kcal for the day", () => {
    expect(mergeHealth(base, { date: "2026-11-01", steps: 8421.4, activeKcal: 350 }).health?.["2026-11-01"]).toEqual({ steps: 8421, activeKcal: 350 });
  });
  it("replaces that day's weight", () => {
    expect(mergeHealth(base, { date: "2026-11-01", weightKg: 78.46 }).body).toEqual([{ date: "2026-11-01", weight: 78.5 }]);
  });
  it("ignores implausible values", () => {
    const r = mergeHealth(base, { date: "2026-11-01", steps: -5, weightKg: 5 });
    expect(r.health?.["2026-11-01"]).toEqual({});
    expect(r.body).toBeUndefined();
  });
});
