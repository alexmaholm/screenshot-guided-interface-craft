import { describe, expect, it } from "vitest";
import { macroTargets, type Profile } from "@/lib/balans";

const base: Profile = { name: "", goal: "vanor", equipment: ["ingen"], days: [0, 2], sessionMin: 30, hideCalories: false, waterGoal: 8 };

describe("målbaserade dagsmål", () => {
  it("bygga muskler ger +250 kcal och 1,8 g protein/kg", () => {
    const t = macroTargets({ ...base, nutritionFocus: "muskler" }, 80);
    expect(t.kcal).toBe(2730);
    expect(t.protein).toBe(144);
  });
  it("forma kroppen ger snällt underskott på 300 kcal", () => {
    expect(macroTargets({ ...base, nutritionFocus: "forma" }, 80).kcal).toBe(2180);
  });
  it("goda vanor ger energibalans och 1,4 g protein/kg", () => {
    const t = macroTargets({ ...base, nutritionFocus: "balans" }, 80);
    expect(t.kcal).toBe(2480);
    expect(t.protein).toBe(112);
  });
});
