import { describe, expect, it } from "vitest";
import { normalizeState } from "@/lib/balans";

describe("normalizeState", () => {
  it("fyller saknade profilfält så sidor inte kraschar", () => {
    const s = normalizeState({ profile: { name: "Alex" } as never });
    expect(s.profile!.days).toEqual([0, 2, 4]);
    expect(s.profile!.equipment).toEqual(["ingen"]);
    expect(s.profile!.waterGoal).toBe(8);
    expect(s.meals).toEqual([]);
  });
});
