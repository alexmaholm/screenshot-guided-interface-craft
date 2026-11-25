import { describe, expect, it } from "vitest";
import { habitSummary, parseNutrition } from "@/lib/habits";
import type { Meal, Profile } from "@/lib/balans";

const profile: Profile = {
  name: "Alex",
  goal: "vanor",
  equipment: [],
  days: [],
  sessionMin: 25,
  waterGoal: 8,
  hideCalories: false,
};
const meal = (type: Meal["type"]): Meal => ({
  id: type,
  date: "2026-10-20",
  type,
  name: "Mat",
  amount: "1 portion",
});

describe("Manual full nutrition logging", () => {
  it("saves fat and carbohydrates together with energy and protein", () => {
    expect(parseNutrition({ kcal: "500", protein: "30", carbs: "45,5", fat: "18" })).toEqual({
      kcal: 500,
      protein: 30,
      carbs: 45.5,
      fat: 18,
    });
  });
  it("keeps omitted values absent and accepts zero", () => {
    expect(parseNutrition({ kcal: "", protein: "0", carbs: "", fat: "" })).toEqual({ protein: 0 });
  });
  it.each(["-1", "NaN", "Infinity"])("rejects invalid nutrition %s", (fat) => {
    expect(parseNutrition({ kcal: "", protein: "", carbs: "", fat })).toBeNull();
  });
});

describe("Daily habits", () => {
  it("handles old entries without new habits", () => {
    expect(habitSummary({ water: 0 }, [], profile).score).toBe(0);
  });
  it("links water, produce, sleep and main meals to completion", () => {
    const summary = habitSummary(
      { water: 8, produce: 5, sleepH: 8 },
      [meal("frukost"), meal("lunch"), meal("middag")],
      profile,
    );
    expect(summary.score).toBe(100);
    expect(summary.parts).toEqual({ water: 1, produce: 1, sleep: 1, meals: 1 });
  });
  it("does not count duplicate meals or snacks as multiple main meals", () => {
    expect(
      habitSummary({ water: 0 }, [meal("lunch"), meal("lunch"), meal("mellanmål")], profile)
        .mealCount,
    ).toBe(1);
  });
  it("caps excess logs at 100 and uses the profile water target", () => {
    expect(habitSummary({ water: 4 }, [], { ...profile, waterGoal: 4 }).parts.water).toBe(1);
    expect(
      habitSummary(
        { water: 20, produce: 20, sleepH: 24 },
        [meal("frukost"), meal("lunch"), meal("middag")],
        profile,
      ).score,
    ).toBe(100);
  });
});
