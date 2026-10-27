import { describe, expect, it } from "vitest";
import { plateTotals, scaleItem } from "@/lib/photolog";

const rice = { name: "Ris", grams: 200, kcal: 260, protein: 5, carbs: 56, fat: 0.6 };

describe("photolog", () => {
  it("scales nutrition proportionally with grams", () => {
    expect(scaleItem(rice, 100)).toEqual({ name: "Ris", grams: 100, kcal: 130, protein: 2.5, carbs: 28, fat: 0.3 });
  });
  it("never goes below 0 g", () => {
    expect(scaleItem(rice, -50).grams).toBe(0);
  });
  it("sums totals across items", () => {
    expect(plateTotals([rice, rice]).kcal).toBe(520);
  });
});
