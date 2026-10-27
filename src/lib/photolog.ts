// Pure helpers for the AI photo log: per-item scaling and totals.
export type PlateItem = {
  name: string;
  grams: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type PlateQuestion = { id: string; question: string; options: string[] };

export type PlateAnalysis = { title: string; items: PlateItem[]; questions: PlateQuestion[] };

const r1 = (n: number) => Math.round(n * 10) / 10;

/** Change an item's weight and scale its nutrition proportionally. */
export function scaleItem(item: PlateItem, grams: number): PlateItem {
  const g = Math.max(0, Math.round(grams));
  if (item.grams <= 0) return { ...item, grams: g };
  const f = g / item.grams;
  return { ...item, grams: g, kcal: Math.round(item.kcal * f), protein: r1(item.protein * f), carbs: r1(item.carbs * f), fat: r1(item.fat * f) };
}

export function plateTotals(items: PlateItem[]) {
  const t = items.reduce(
    (a, i) => ({ grams: a.grams + i.grams, kcal: a.kcal + i.kcal, protein: a.protein + i.protein, carbs: a.carbs + i.carbs, fat: a.fat + i.fat }),
    { grams: 0, kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );
  return { grams: Math.round(t.grams), kcal: Math.round(t.kcal), protein: r1(t.protein), carbs: r1(t.carbs), fat: r1(t.fat) };
}
