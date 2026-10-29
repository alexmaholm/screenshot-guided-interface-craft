import { describe, expect, it } from "vitest";
import { weekReport } from "@/lib/progress";
import type { Workout } from "@/lib/balans";

const w = (date: string, status: Workout["status"]): Workout => ({ id: date + status, date, title: "P", kind: "styrka", durationMin: 45, status, exercises: [
  { name: "Bänkpress", restSec: 90, done: true, weightKg: 60, log: [
    { reps: 10, kg: 20, done: true, type: "warmup" }, { reps: 8, kg: 60, done: true }, { reps: 8, kg: 60, done: true }] },
] });

describe("weekReport", () => {
  it("summerar volym utan uppvärmningsset", () => {
    expect(weekReport([w("2026-10-26", "klart")], ["2026-10-26"]).volumeKg).toBe(960);
  });
  it("räknar bara klara pass inom veckan", () => {
    const r = weekReport([w("2026-10-26", "klart"), w("2026-10-27", "planerat"), w("2026-10-01", "klart")], ["2026-10-26", "2026-10-27"]);
    expect(r.workouts).toBe(1);
    expect(r.topLift).toEqual({ name: "Bänkpress", kg: 60 });
  });
});
