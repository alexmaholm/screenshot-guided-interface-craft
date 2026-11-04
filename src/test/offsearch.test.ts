import { describe, it, expect } from "vitest";
import { parseOffSearch } from "@/lib/barcode";
describe("parseOffSearch", () => {
  it("keeps products with nutrition, dedupes by name", () => {
    const r = parseOffSearch({ products: [
      { code: "1", product_name: "Miami", brands: "Nocco", nutriments: { "energy-kcal_100g": 3, proteins_100g: 0.8 } },
      { code: "2", product_name: "Miami", brands: "Nocco", nutriments: { "energy-kcal_100g": 3 } },
      { code: "3", product_name: "Tom", nutriments: {} },
    ] });
    expect(r).toHaveLength(1);
    expect(r[0]!.name).toBe("Nocco Miami");
    expect(r[0]!.kcal).toBe(3);
  });
});
