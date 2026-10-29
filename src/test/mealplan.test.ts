import { describe, expect, it } from "vitest";
import { dayKind, planIngredientsText, weekDates } from "@/lib/mealplan";
import { RECIPES } from "@/lib/recipes";

describe("veckoplan", () => {
  it("veckan börjar på måndag", () => {
    const w = weekDates("2026-10-29"); // torsdag
    expect(w[0]).toBe("2026-10-26");
    expect(w[6]).toBe("2026-11-01");
  });
  it("träningspass gör dagen till träningsdag, vald vila till vilodag", () => {
    const w = [{ id: "1", date: "2026-10-29", title: "", kind: "styrka" as const, durationMin: 30, exercises: [], status: "planerat" as const }];
    expect(dayKind(w, undefined, "2026-10-29")).toBe("träning");
    expect(dayKind([], { water: 0, restDay: true }, "2026-10-29")).toBe("vila");
    expect(dayKind([], undefined, "2026-10-29")).toBe("fri");
  });
  it("samma ingrediens slås ihop över veckan", () => {
    const r = RECIPES[0]!;
    const plan = [1, 2].map((n) => ({ id: String(n), date: "2026-10-27", type: r.type, recipeId: r.id }));
    const first = r.ingredients[0]!;
    expect(planIngredientsText(plan, ["2026-10-27"])).toContain(`${first.qty * 2} ${first.unit} ${first.name}`);
  });
});
