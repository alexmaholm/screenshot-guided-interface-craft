import { describe, it, expect } from "vitest";
import { recipesFor, scaleIngredients, RECIPES } from "@/lib/recipes";
describe("recipes", () => {
  it("glutenfri filtrering utesluter gluten", () => { expect(recipesFor("allt", ["gluten"]).every((r) => !r.contains.includes("gluten"))).toBe(true); });
  it("vegansk kost ger bara veganska recept", () => { expect(recipesFor("veganskt").every((r) => r.diets.includes("veganskt"))).toBe(true); });
  it("portioner skalar mängder", () => { expect(scaleIngredients(RECIPES[0]!, 2)[0]).toBe("300 g kycklingfilé"); });
});
