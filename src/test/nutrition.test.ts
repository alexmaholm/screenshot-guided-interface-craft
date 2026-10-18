import { describe, expect, it } from "vitest";
import { completeOnboarding, dateKey, recoverySuggestions, resetAll, suggestionsFor, type Profile, type Restriction, type Workout } from "@/lib/balans";

const profile: Profile = { name: "Alex", goal: "styrka", equipment: ["ingen"], days: [0, 2, 4], sessionMin: 25, waterGoal: 8, hideCalories: false, diet: "allt" };
const workout: Workout = { id: "test", date: dateKey(), title: "Styrka", kind: "styrka", durationMin: 25, exercises: [], status: "klart" };

describe("Dietary restrictions", () => {
  const cases: [Restriction, string][] = [
    ["gluten", "Äggröra på surdegsbröd"],
    ["laktos", "Proteinyoghurt"],
    ["mjolk", "Halloumiwrap med grönsaker"],
    ["notter", "Äpple och jordnötssmör"],
    ["soja", "Tofu-wok med nudlar"],
    ["agg", "Äggröra på surdegsbröd"],
  ];
  it.each(cases)("excludes %s ingredients", (restriction, name) => {
    expect(suggestionsFor("allt").map((s) => s.name)).toContain(name);
    expect(suggestionsFor("allt", undefined, [restriction]).map((s) => s.name)).not.toContain(name);
  });
  it("combines vegan preferences with gluten restriction", () => {
    const meals = suggestionsFor("veganskt", undefined, ["gluten"]);
    expect(meals.map((s) => s.name)).toContain("Linsgryta med ris");
    expect(meals.map((s) => s.name)).not.toContain("Tofu-wok med nudlar");
    expect(meals.every((s) => s.diets.includes("veganskt"))).toBe(true);
  });
  it("applies restrictions to initial meals and favorites", () => {
    resetAll();
    completeOnboarding({ ...profile, restrictions: ["gluten", "mjolk", "notter"] });
    const saved = JSON.parse(localStorage.getItem("balans:v1") ?? "{}");
    const allowed = suggestionsFor("allt", undefined, ["gluten", "mjolk", "notter"]).map((s) => s.name);
    expect(saved.meals.length).toBeGreaterThan(0);
    for (const meal of [...saved.meals, ...saved.favorites]) expect(allowed).toContain(meal.name);
    resetAll();
  });
});

describe("Recovery meals", () => {
  it("recommends meals only after a completed non-rest workout", () => {
    expect(recoverySuggestions(profile, { ...workout, status: "planerat" })).toEqual([]);
    expect(recoverySuggestions(profile, { ...workout, kind: "vila" })).toEqual([]);
    expect(recoverySuggestions(profile, workout)).toHaveLength(3);
  });
  it("respects dietary restrictions after strength training", () => {
    const results = recoverySuggestions({ ...profile, diet: "veganskt", restrictions: ["gluten"] }, workout);
    expect(results.map((s) => s.name)).toEqual(["Linsgryta med ris", "Kikärtscurry med ris"]);
  });
});