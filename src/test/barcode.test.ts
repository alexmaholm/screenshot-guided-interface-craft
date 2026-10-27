import { describe, expect, it } from "vitest";
import { isValidBarcode, parseOffProduct, portionFor } from "@/lib/barcode";

describe("streckkod", () => {
  it("godkänner EAN-13 och EAN-8 men inte för korta koder", () => {
    expect(isValidBarcode("7310865004703")).toBe(true);
    expect(isValidBarcode("73108650")).toBe(true);
    expect(isValidBarcode("12345")).toBe(false);
  });
  it("räknar om kJ till kcal när kcal saknas", () => {
    const p = parseOffProduct("73108650", { product: { product_name: "Kvarg", nutriments: { energy_100g: 418.4, proteins_100g: 11 } } });
    expect(p?.kcal).toBe(100);
  });
  it("saknad produkt ger null", () => {
    expect(parseOffProduct("73108650", { status: 0 })).toBeNull();
  });
  it("150 g av en vara räknas från värden per 100 g", () => {
    const p = { code: "1", name: "x", kcal: 60, protein: 10, carbs: 4, fat: 0.2 };
    expect(portionFor(p, 150)).toEqual({ kcal: 90, protein: 15, carbs: 6, fat: 0.3 });
  });
});

import { measureGrams } from "@/lib/barcode";
describe("measureGrams", () => {
  it("1 tsk är 5 g", () => expect(measureGrams("tsk", 1)).toBe(5));
  it("2 msk är 30 g", () => expect(measureGrams("msk", 2)).toBe(30));
  it("1,5 dl är 150 g", () => expect(measureGrams("dl", 1.5)).toBe(150));
  it("portion följer förpackningen", () => expect(measureGrams("portion", 2, 30)).toBe(60));
});
