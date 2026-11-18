import { describe, it, expect } from "vitest";
import { bestLifts, historyFor } from "@/lib/coachTelemetry";
import type { Workout } from "@/lib/balans";

const w = (status: "klart" | "planerat", log: { kg: number; reps: number }[]): Workout => ({
  id: status, date: "2026-11-10", title: "P", kind: "styrka", durationMin: 40, status,
  exercises: [{ name: "Bänkpress", sets: log.length, done: true, log: log.map((l) => ({ ...l, done: true })) }],
} as Workout);

describe("coach telemetry", () => {
  it("picks the heaviest completed set and ignores planned workouts", () => {
    const r = bestLifts([w("klart", [{ kg: 75, reps: 8 }, { kg: 80, reps: 5 }]), w("planerat", [{ kg: 120, reps: 5 }])]);
    expect(r).toEqual([{ name: "Bänkpress", kg: 80, reps: 5 }]);
  });
  it("keeps only the last 8 successful turns as memory", () => {
    const chat = Array.from({ length: 10 }, (_, i) => ({ q: `q${i}`, a: "a" })).concat([{ q: "fel", a: "x", error: true } as never]);
    const h = historyFor(chat);
    expect(h).toHaveLength(8);
    expect(h[0]!.q).toBe("q2");
  });
});
