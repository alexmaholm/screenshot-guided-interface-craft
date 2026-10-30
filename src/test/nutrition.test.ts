import { describe, expect, it } from "vitest";
import { completeOnboarding, dateKey, recoveryGuide, resetAll, dishEligible, type Profile, type Restriction, type Workout } from "@/lib/balans";

const profile: Profile = { name: "Alex", goal: "styrka", equipment: ["ingen"], days: [0, 2, 4], sessionMin: 25, waterGoal: 8, hideCalories: false, diet: "allt" };
const workout: Workout = { id: "test", date: dateKey(), title: "Styrka", kind: "styrka", durationMin: 25, exercises: [], status: "klart" };

describe("Dietary restrictions", () => {
  it("excludes dishes containing a restricted ingredient", () => {
    expect(dishEligible(["allt"], ["gluten"], "allt", [])).toBe(true);
    expect(dishEligible(["allt"], ["gluten"], "allt", ["gluten"])).toBe(false);
  });
  it("excludes dishes outside the chosen diet or missing ingredient data", () => {
    expect(dishEligible(["allt"], [], "veganskt")).toBe(false);
    expect(dishEligible(["veganskt"], undefined, "veganskt")).toBe(false);
  });
  it("starts new users with no history", () => {
    resetAll();
    completeOnboarding(profile);
    const saved = JSON.parse(localStorage.getItem("balans:v1") ?? "{}");
    expect(saved.meals).toEqual([]);
    expect(saved.favorites).toEqual([]);
    expect(saved.habits).toEqual({});
    expect(saved.workouts.every((w: Workout) => w.status !== "klart" && w.date >= dateKey())).toBe(true);
    resetAll();
  });
});

describe("Recovery guide", () => {
  const base = { profile, workout, eaten: { kcal: 0, protein: 0, carbs: 0, fat: 0 }, target: { kcal: 2200, protein: 120, carbs: 250, fat: 70 }, hour: 12, waterGlasses: 6 };
  it("only appears after a completed non-rest workout", () => {
    expect(recoveryGuide({ ...base, workout: { ...workout, status: "planerat" } })).toEqual([]);
    expect(recoveryGuide({ ...base, workout: { ...workout, kind: "vila" } })).toEqual([]);
  });
  it("prioritises protein after strength training", () => {
    expect(recoveryGuide(base)[0]?.key).toBe("protein");
  });
  it("prioritises carbs and electrolytes after running", () => {
    const keys = recoveryGuide({ ...base, workout: { ...workout, kind: "kondition", durationMin: 50 } }).map((i) => i.key);
    expect(keys.slice(0, 2)).toEqual(["kolhydrater", "elektrolyter"]);
  });
  it("drops protein once the daily protein goal is reached", () => {
    const keys = recoveryGuide({ ...base, eaten: { ...base.eaten, protein: 130 } }).map((i) => i.key);
    expect(keys).not.toContain("protein");
  });
  it("adds magnesium for evening workouts", () => {
    expect(recoveryGuide({ ...base, hour: 20 }).map((i) => i.key)).toContain("magnesium");
  });
  it("respects vegan diet and gluten restriction in sources", () => {
    const items = recoveryGuide({ ...base, profile: { ...profile, diet: "veganskt", restrictions: ["gluten"] } });
    const all = items.flatMap((i) => i.sources);
    for (const bad of ["Kvarg", "Ägg", "Kyckling", "Lax", "Havregryn", "Rågbröd"]) expect(all).not.toContain(bad);
  });
});
import { foodsFor, portion, FOODS, macroTargets } from "@/lib/balans";
describe("livsmedelsbas", () => {
  it("glutenfri profil får inte havregryn med gluten", () => {
    expect(foodsFor("allt", ["gluten"]).some((f) => f.name === "Havregryn")).toBe(false);
  });
  it("vegansk kost utesluter ägg och mjölk", () => {
    const names = foodsFor("veganskt").map((f) => f.name);
    expect(names).not.toContain("Ägg");
    expect(names).not.toContain("Mellanmjölk");
  });
  it("2 st ägg = 110 g", () => {
    expect(portion(FOODS.find((f) => f.name === "Ägg")!, 2, "st").grams).toBe(110);
  });
  it("styrkemål ger 1,8 g protein per kg", () => {
    expect(macroTargets({ ...profile, goal: "styrka" }, 80).protein).toBe(144);
  });
});
