import { describe, expect, it } from "vitest";
import { applyAction, mlToGlasses, sanitizeActions } from "@/lib/coachActions";
import { normalizeState } from "@/lib/balans";

describe("coach actions", () => {
  it("500 ml vatten blir 2 glas", () => expect(mlToGlasses(500)).toBe(2));
  it("avvisar negativa makron och okänd måltidstyp", () => {
    expect(sanitizeActions([{ kind: "log_meal", type: "lunch", name: "Ägg", kcal: -5, protein: 1, carbs: 1, fat: 1 }])).toEqual([]);
    expect(sanitizeActions([{ kind: "log_meal", type: "brunch", name: "Ägg", kcal: 100, protein: 1, carbs: 1, fat: 1 }])).toEqual([]);
  });
  it("loggar måltid och vatten på dagen", () => {
    const [meal, water] = sanitizeActions([
      { kind: "log_meal", type: "lunch", name: "Två ägg", kcal: 140, protein: 12, carbs: 1, fat: 10 },
      { kind: "log_water", ml: 250 },
    ]);
    let s = normalizeState({});
    s = applyAction(s, meal!, "2026-01-01");
    s = applyAction(s, water!, "2026-01-01");
    expect(s.meals[0]).toMatchObject({ name: "Två ägg", kcal: 140, date: "2026-01-01" });
    expect(s.habits["2026-01-01"]?.water).toBe(1);
  });
});
