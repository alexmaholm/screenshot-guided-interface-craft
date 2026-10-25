import { describe, expect, it } from "vitest";
import { nextSetType, setLabels, withRows } from "@/lib/progress";
import type { Exercise } from "@/lib/balans";

const ex: Exercise = { name: "Bänkpress", sets: 1, reps: 8, restSec: 90, done: false };

describe("set types", () => {
  it("cycles Normal → W → D → F → Normal", () => {
    expect(nextSetType(undefined)).toBe("warmup");
    expect(nextSetType("warmup")).toBe("drop");
    expect(nextSetType("drop")).toBe("failure");
    expect(nextSetType("failure")).toBe("normal");
  });

  it("numbers only working sets", () => {
    expect(setLabels([{ done: false, type: "warmup" }, { done: false }, { done: false }, { done: false, type: "drop" }])).toEqual(["W", "1", "2", "D"]);
  });

  it("ignores warm-up weight for heaviest lift", () => {
    const e = withRows(ex, [{ kg: 100, done: true, type: "warmup" }, { kg: 60, done: true }]);
    expect(e.weightKg).toBe(60);
  });
});
