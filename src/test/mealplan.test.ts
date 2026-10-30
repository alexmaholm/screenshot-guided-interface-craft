import { describe, expect, it } from "vitest";
import { dayKind, planText, weekDates } from "@/lib/mealplan";

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
  it("egna måltider listas per dag i ordning", () => {
    const plan = [
      { id: "2", date: "2026-10-28", type: "middag" as const, name: "Kycklingwok" },
      { id: "1", date: "2026-10-27", type: "lunch" as const, name: "Matlåda" },
    ];
    expect(planText(plan, ["2026-10-27", "2026-10-28"], ["Tis", "Ons"])).toBe("- Tis: Matlåda\n- Ons: Kycklingwok");
  });
});
