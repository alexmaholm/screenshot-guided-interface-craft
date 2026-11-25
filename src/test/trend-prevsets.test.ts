import { describe, expect, it } from "vitest";
import { lastSets, prevSetText, weightTrend } from "@/lib/progress";
import type { Workout } from "@/lib/balans";

describe("weightTrend", () => {
  it("smooths a one-day water spike", () => {
    const t = weightTrend([
      { date: "2026-01-01", weight: 80 },
      { date: "2026-01-02", weight: 82 },
    ]);
    expect(t[1]!.trend).toBe(80.5);
  });
});

describe("previous set guide", () => {
  it("shows last finished workout's set per row", () => {
    const all = [
      {
        id: "a",
        date: "2026-01-01",
        status: "klart",
        exercises: [{ name: "Bänkpress", log: [{ reps: 8, kg: 80, done: true }] }],
      },
    ] as unknown as Workout[];
    expect(prevSetText(lastSets("bänkpress", "b", all)?.[0])).toBe("80 kg × 8");
  });
});
