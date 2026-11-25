import { describe, expect, it } from "vitest";
import { getState, normalizeState, resetAll, update } from "@/lib/balans";
import { parseNutrition } from "@/lib/habits";

describe("Avrundning av näringsvärden", () => {
  it("rensar flyttalsbrus ur sparade måltider", () => {
    const s = normalizeState({
      meals: [
        {
          id: "1",
          date: "2026-11-04",
          type: "lunch",
          name: "Macka",
          amount: "1",
          kcal: 250.6,
          protein: 5.000000000000001,
          carbs: 30.26,
          fat: 8.94,
          fiber: 4.05,
          sugar: 12.049,
          satFat: 1.11,
          salt: 0.444,
        },
      ],
    } as never);
    expect(s.meals[0]).toMatchObject({
      kcal: 251,
      protein: 5,
      carbs: 30.3,
      fat: 8.9,
      fiber: 4.1,
      sugar: 12,
      satFat: 1.1,
      salt: 0.4,
    });
  });

  it("avrundar manuellt inmatade värden till en decimal", () => {
    expect(parseNutrition({ kcal: "500,6", protein: "5,749", carbs: "45,5", fat: "18" })).toEqual({
      kcal: 501,
      protein: 5.7,
      carbs: 45.5,
      fat: 18,
    });
  });

  it("avrundar direkt vid sparande, inte först vid omstart", () => {
    resetAll();
    update((st) => ({
      ...st,
      meals: [
        ...st.meals,
        {
          id: "x",
          date: "2026-11-04",
          type: "middag",
          name: "Pasta",
          amount: "1 tallrik",
          kcal: 620.4,
          protein: 21.987654321,
          carbs: 70,
          fat: 9.99,
        },
      ],
      favorites: [
        ...st.favorites,
        {
          id: "f",
          name: "Kvarg",
          amount: "250 g",
          type: "mellanmål",
          kcal: 140.6,
          protein: 30.000000000000004,
          carbs: 0,
          fat: 0.25,
        },
      ],
      mealPlan: [
        ...st.mealPlan,
        { id: "p", date: "2026-11-05", type: "lunch", name: "Sallad", kcal: 300.7, protein: 12.34 },
      ],
    }));
    const s = getState();
    expect(s.meals[0]).toMatchObject({ kcal: 620, protein: 22, carbs: 70, fat: 10 });
    expect(s.favorites[0]).toMatchObject({ kcal: 141, protein: 30, carbs: 0, fat: 0.3 });
    expect(s.mealPlan[0]).toMatchObject({ kcal: 301, protein: 12.3 });
    resetAll();
  });
});
