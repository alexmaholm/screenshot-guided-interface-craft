import { describe, expect, it } from "vitest";
import { improvements } from "@/lib/progress";
import type { Workout } from "@/lib/balans";

const w = (id: string, date: string, kg: number, status: Workout["status"] = "klart"): Workout => ({
  id, date, title: "Pass", kind: "styrka", durationMin: 30, status,
  exercises: [{ name: "Bicepscurls", restSec: 60, done: true, weightKg: kg }],
});

describe("progression", () => {
  it("firar +5 kg jämfört med förra passet", () => {
    expect(improvements(w("b", "2026-10-20", 15, "planerat"), [w("a", "2026-10-18", 10)])).toEqual([{ name: "Bicepscurls", diffKg: 5 }]);
  });
  it("ingen ökning när vikten är samma", () => {
    expect(improvements(w("b", "2026-10-20", 10, "planerat"), [w("a", "2026-10-18", 10)])).toEqual([]);
  });
});

import { changeSetCount, setRows, withRows } from "@/lib/progress";
describe("set-hantering", () => {
  const base = { name: "Bänkpress", sets: 3, reps: 10, restSec: 90, done: false, weightKg: 40 };
  it("bygger 3 rader från äldre sparad övning", () => { expect(setRows(base)).toHaveLength(3); });
  it("plus lägger till set som kopierar förra", () => {
    const e = changeSetCount(base, 1);
    expect(e.sets).toBe(4); expect(e.log?.[3]).toEqual({ reps: 10, timeSec: undefined, kg: 40, done: false });
  });
  it("minus stannar på minst 1 set", () => {
    const one = withRows(base, [{ reps: 10, kg: 40, done: false }]);
    expect(changeSetCount(one, -1).sets).toBe(1);
  });
  it("övningen klar när alla set är klara, tyngsta vikt sparas", () => {
    const e = withRows(base, [{ reps: 10, kg: 40, done: true }, { reps: 8, kg: 45, done: true }]);
    expect(e.done).toBe(true); expect(e.weightKg).toBe(45);
  });
});

import { strengthHistory } from "@/lib/progress";
describe("strengthHistory", () => {
  it("tyngsta vikt per datum, äldst först, bara klara pass", () => {
    const h = strengthHistory("Bicepscurls", [w("b", "2026-10-05", 60), w("a", "2026-10-01", 50), w("c", "2026-10-07", 70, "planerat")]);
    expect(h).toEqual([{ date: "2026-10-01", kg: 50 }, { date: "2026-10-05", kg: 60 }]);
  });
});
