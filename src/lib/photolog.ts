// Pure helpers for the AI photo log: per-item scaling and totals.
export type PlateItem = {
  name: string;
  grams: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number | undefined;
  sugar?: number | undefined;
  satFat?: number | undefined;
  salt?: number | undefined;
};

export type PlateQuestion = { id: string; question: string; options: string[] };

export type PlateAnalysis = { title: string; items: PlateItem[]; questions: PlateQuestion[] };

const r1 = (n: number) => Math.round(n * 10) / 10;

/** Change an item's weight and scale its nutrition proportionally. */
export function scaleItem(item: PlateItem, grams: number): PlateItem {
  const g = Math.max(0, Math.round(grams));
  if (item.grams <= 0) return { ...item, grams: g };
  const f = g / item.grams;
  return { ...item, grams: g, kcal: Math.round(item.kcal * f), protein: r1(item.protein * f), carbs: r1(item.carbs * f), fat: r1(item.fat * f),
    ...(item.fiber !== undefined && { fiber: r1(item.fiber * f) }),
    ...(item.sugar !== undefined && { sugar: r1(item.sugar * f) }),
    ...(item.satFat !== undefined && { satFat: r1(item.satFat * f) }),
    ...(item.salt !== undefined && { salt: Math.round(item.salt * f * 100) / 100 }) };
}

export function plateTotals(items: PlateItem[]) {
  const t = items.reduce(
    (a, i) => ({ grams: a.grams + i.grams, kcal: a.kcal + i.kcal, protein: a.protein + i.protein, carbs: a.carbs + i.carbs, fat: a.fat + i.fat }),
    { grams: 0, kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );
  return { grams: Math.round(t.grams), kcal: Math.round(t.kcal), protein: r1(t.protein), carbs: r1(t.carbs), fat: r1(t.fat) };
}

/** Sum fiber, sugar, saturated fat and salt over the plate (grams). */
export function plateMicros(items: PlateItem[]) {
  const s = (k: "fiber" | "sugar" | "satFat" | "salt") => items.reduce((a, i) => a + (i[k] ?? 0), 0);
  return { fiber: r1(s("fiber")), sugar: r1(s("sugar")), satFat: r1(s("satFat")), salt: Math.round(s("salt") * 100) / 100 };
}
