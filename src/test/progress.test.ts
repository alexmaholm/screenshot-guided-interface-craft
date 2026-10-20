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
