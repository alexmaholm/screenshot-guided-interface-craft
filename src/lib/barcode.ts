/** Barcode product lookup (Open Food Facts) and portion math. Values are per 100 g. */
export interface BarcodeProduct {
  code: string;
  name: string;
  kcal: number; protein: number; carbs: number; fat: number;
  /** Per 100 g, when the product lists them. */
  fiber?: number | undefined; sugar?: number | undefined; satFat?: number | undefined; salt?: number | undefined;
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
  const sodium = num(n["sodium_100g"]);
  const micros = {
    fiber: num(n["fiber_100g"]), sugar: num(n["sugars_100g"]), satFat: num(n["saturated-fat_100g"]),
    salt: num(n["salt_100g"]) ?? (sodium !== undefined ? Math.round(sodium * 2.5 * 100) / 100 : undefined),
  };
  const name = String(p["product_name_sv"] || p["product_name"] || "").trim();
  const brand = String(p["brands"] ?? "").split(",")[0]?.trim();
  return {
    code,
    name: [brand, name].filter(Boolean).join(" ") || `Produkt ${code}`,
    kcal: Math.round(kcal ?? 0), protein: protein ?? 0, carbs: carbs ?? 0, fat: fat ?? 0,
    servingG: num(p["serving_quantity"]),
    ...Object.fromEntries(Object.entries(micros).filter(([, v]) => v !== undefined)),
  };
}

export function portionFor(p: BarcodeProduct, grams: number) {
  const k = Math.max(0, grams) / 100;
  const r1 = (n: number) => Math.round(n * k * 10) / 10;
  const out: { kcal: number; protein: number; carbs: number; fat: number; fiber?: number; sugar?: number; satFat?: number; salt?: number } =
    { kcal: Math.round(p.kcal * k), protein: r1(p.protein), carbs: r1(p.carbs), fat: r1(p.fat) };
  for (const key of ["fiber", "sugar", "satFat", "salt"] as const) {
    const v = p[key];
    if (v !== undefined) out[key] = key === "salt" ? Math.round(v * k * 100) / 100 : r1(v);
  }
  return out;
}

export async function lookupBarcode(code: string): Promise<BarcodeProduct | null> {
  const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=product_name,product_name_sv,brands,nutriments,serving_quantity`);
  if (!res.ok) return null;
  return parseOffProduct(code, await res.json());
}

/** Household measures for packaged goods. Approximate grams per unit; "portion" uses the package serving. */
export type Measure = "g" | "tsk" | "msk" | "dl" | "portion";
export const MEASURE_G: Record<Exclude<Measure, "portion">, number> = { g: 1, tsk: 5, msk: 15, dl: 100 };
export const MEASURE_STEP: Record<Measure, number> = { g: 10, tsk: 1, msk: 1, dl: 0.5, portion: 1 };

export function measureGrams(unit: Measure, qty: number, servingG?: number) {
  const per = unit === "portion" ? (servingG ?? 0) : MEASURE_G[unit];
  return Math.round(Math.max(0, qty) * per);
}
