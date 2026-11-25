import { describe, expect, it } from "vitest";
import { plateTotals, scaleItem } from "@/lib/photolog";

const rice = { name: "Ris", grams: 200, kcal: 260, protein: 5, carbs: 56, fat: 0.6 };

describe("photolog", () => {
  it("scales nutrition proportionally with grams", () => {
    expect(scaleItem(rice, 100)).toEqual({
      name: "Ris",
      grams: 100,
      kcal: 130,
      protein: 2.5,
      carbs: 28,
      fat: 0.3,
    });
  });
  it("never goes below 0 g", () => {
    expect(scaleItem(rice, -50).grams).toBe(0);
  });
  it("sums totals across items", () => {
    expect(plateTotals([rice, rice]).kcal).toBe(520);
  });
});

import { plateMicros as _pm, scaleItem as _si } from "@/lib/photolog";
describe("foto mikronäring", () => {
  it("halverad vikt halverar fibrer och salt, och tallriken summeras", () => {
    const a = _si(
      {
        name: "a",
        grams: 200,
        kcal: 200,
        protein: 10,
        carbs: 30,
        fat: 5,
        fiber: 6,
        sugar: 4,
        satFat: 2,
        salt: 1,
      },
      100,
    );
    expect(
      _pm([
        a,
        {
          name: "b",
          grams: 50,
          kcal: 50,
          protein: 1,
          carbs: 1,
          fat: 1,
          fiber: 1,
          sugar: 1,
          satFat: 1,
          salt: 0.2,
        },
      ]),
    ).toEqual({ fiber: 4, sugar: 3, satFat: 2, salt: 0.7 });
  });
});
