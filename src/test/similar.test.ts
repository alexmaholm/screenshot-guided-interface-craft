import { describe, expect, it } from "vitest";
import { EXERCISES, similarExercises, totalLoadKg } from "@/lib/exercises";
import { patternFor } from "@/components/ExerciseDemo";

describe("hantlar och liknande övningar", () => {
  it("hantelvikt räknas x2 i total", () => {
    expect(totalLoadKg("Hantelcurl", 12)).toBe(24);
    expect(totalLoadKg("Bänkpress", 60)).toBe(60);
  });
  it("liknande övningar exkluderar övningen själv och har samma mönster eller muskel", () => {
    const ex = EXERCISES.find((e) => /curl/i.test(e.name) && e.muscle === "armar")!;
    const sim = similarExercises(EXERCISES, ex, patternFor);
    expect(sim.length).toBeGreaterThan(0);
    expect(sim.some((s) => s.id === ex.id)).toBe(false);
    expect(patternFor(sim[0]!)).toBe("curl");
  });
});
