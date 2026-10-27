/** Barcode product lookup (Open Food Facts) and portion math. Values are per 100 g. */
export interface BarcodeProduct {
  code: string;
  name: string;
  kcal: number; protein: number; carbs: number; fat: number;
  /** Suggested serving in grams, if the product lists one. */
  servingG?: number | undefined;
}

export function isValidBarcode(code: string) {
  return /^\d{8}$|^\d{12,14}$/.test(code.trim());
}

const num = (v: unknown) => {
  const n = typeof v === "string" ? parseFloat(v.replace(",", ".")) : typeof v === "number" ? v : NaN;
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};

/** Parse an Open Food Facts v2 product response; null if missing or without nutrition. */
export function parseOffProduct(code: string, json: unknown): BarcodeProduct | null {
  const p = (json as { status?: number; product?: Record<string, unknown> })?.product;
  if (!p) return null;
  const n = (p["nutriments"] ?? {}) as Record<string, unknown>;
  const kj = num(n["energy_100g"]);
  const kcal = num(n["energy-kcal_100g"]) ?? (kj !== undefined ? kj / 4.184 : undefined);
  const protein = num(n["proteins_100g"]), carbs = num(n["carbohydrates_100g"]), fat = num(n["fat_100g"]);
  if (kcal === undefined && protein === undefined && carbs === undefined && fat === undefined) return null;
  const name = String(p["product_name_sv"] || p["product_name"] || "").trim();
  const brand = String(p["brands"] ?? "").split(",")[0]?.trim();
  return {
    code,
    name: [brand, name].filter(Boolean).join(" ") || `Produkt ${code}`,
    kcal: Math.round(kcal ?? 0), protein: protein ?? 0, carbs: carbs ?? 0, fat: fat ?? 0,
    servingG: num(p["serving_quantity"]),
  };
}

export function portionFor(p: BarcodeProduct, grams: number) {
  const k = Math.max(0, grams) / 100;
  const r1 = (n: number) => Math.round(n * k * 10) / 10;
  return { kcal: Math.round(p.kcal * k), protein: r1(p.protein), carbs: r1(p.carbs), fat: r1(p.fat) };
}

export async function lookupBarcode(code: string): Promise<BarcodeProduct | null> {
  const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=product_name,product_name_sv,brands,nutriments,serving_quantity`);
  if (!res.ok) return null;
  return parseOffProduct(code, await res.json());
}
