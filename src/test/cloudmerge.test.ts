import { describe, expect, it } from "vitest";
import { mergeStates, unionById, unionByKey } from "@/lib/cloudmerge";
import { normalizeState } from "@/lib/balans";

const meal = (id: string, name: string) =>
  ({ id, date: "2026-11-25", type: "lunch", name, amount: "1 st" }) as never;

describe("unionById", () => {
  it("keeps entries from both sides and lets the cloud copy win on the same id", () => {
    const remote = [{ id: "a", v: "cloud" }];
    const local = [
      { id: "a", v: "local" },
      { id: "b", v: "local-only" },
    ];
    expect(unionById(remote, local)).toEqual([
      { id: "a", v: "cloud" },
      { id: "b", v: "local-only" },
    ]);
  });

  it("handles missing lists", () => {
    expect(unionById(undefined, [{ id: "x" }])).toEqual([{ id: "x" }]);
    expect(unionById([{ id: "x" }], undefined)).toEqual([{ id: "x" }]);
  });
});

describe("unionByKey", () => {
  it("merges weight entries by date, cloud winning", () => {
    const merged = unionByKey(
      [{ date: "2026-11-01", weight: 80 }],
      [
        { date: "2026-11-01", weight: 81 },
        { date: "2026-11-02", weight: 82 },
      ],
      (b) => b.date,
    );
    expect(merged).toEqual([
      { date: "2026-11-01", weight: 80 },
      { date: "2026-11-02", weight: 82 },
    ]);
  });
});

describe("mergeStates", () => {
  const local = normalizeState({
    profile: { name: "Lokal" } as never,
    meals: [meal("m-offline", "Gjord offline")],
    habits: { "2026-11-25": { water: 3 } },
  });

  it("keeps meals logged offline when the cloud has other meals", () => {
    const remote = { meals: [meal("m-cloud", "Från molnet")], profile: { name: "Moln" } as never };
    const merged = mergeStates(local, remote);
    const names = merged.meals.map((m) => m.name);
    expect(names).toContain("Från molnet");
    expect(names).toContain("Gjord offline");
    expect(merged.profile?.name).toBe("Moln");
  });

  it("keeps local habits for dates the cloud does not have", () => {
    const remote = { habits: { "2026-11-24": { water: 5 } } };
    const merged = mergeStates(local, remote);
    expect(merged.habits["2026-11-24"]).toEqual({ water: 5 });
    expect(merged.habits["2026-11-25"]).toEqual({ water: 3 });
  });

  it("uses the local profile when the cloud has none", () => {
    const merged = mergeStates(local, {});
    expect(merged.profile?.name).toBe("Lokal");
  });

  it("never returns fewer meals than either side had", () => {
    const remote = { meals: [meal("m1", "a"), meal("m2", "b")] };
    const merged = mergeStates(local, remote);
    expect(merged.meals.length).toBeGreaterThanOrEqual(
      Math.max(remote.meals.length, local.meals.length),
    );
  });
});
