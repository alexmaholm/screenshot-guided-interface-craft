import { describe, expect, it } from "vitest";
import { EXERCISES, MUSCLES, recommendExercises, type Muscle } from "@/lib/exercises";

const rested = Object.fromEntries(MUSCLES.map((m) => [m.value, undefined])) as Record<Muscle, number | undefined>;

describe("Ditt fokus", () => {
  it("flås-fokus lyfter konditionsövningar först", () => {
    expect(recommendExercises(EXERCISES, "flas", "", rested)[0]?.muscle).toBe("kondition");
  });
  it("önskemål om rygg ger ryggövning överst", () => {
    expect(recommendExercises(EXERCISES, "muskler", "rygg", rested)[0]?.muscle).toBe("rygg");
  });
  it("skonsamt för knäna tar bort hoppövningar", () => {
    const r = recommendExercises(EXERCISES, "energi", "skonsamt för knäna", rested);
    expect(r.some((e) => /hopp|jump|burpee/i.test(e.name + e.nameEn))).toBe(false);
  });
});
