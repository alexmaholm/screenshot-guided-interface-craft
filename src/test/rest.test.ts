import { describe, expect, it } from "vitest";
import { clampRest, rememberedRest } from "@/lib/rest";
import type { Workout } from "@/lib/balans";

describe("rest timer", () => {
  it("clamps between 0 and 600 s", () => {
    expect(clampRest(-15)).toBe(0);
    expect(clampRest(615)).toBe(600);
    expect(clampRest(75)).toBe(75);
  });
  it("remembers the last chosen rest per exercise", () => {
    const w = (sec: number): Workout => ({
      id: String(sec),
      date: "2026-11-01",
      title: "",
      kind: "styrka",
      durationMin: 30,
      status: "klart",
      exercises: [{ name: "Bänkpress", restSec: sec, done: true }],
    });
    expect(rememberedRest("Bänkpress", [w(60), w(150)], 45)).toBe(150);
    expect(rememberedRest("Latsdrag", [w(60)], 45)).toBe(45);
  });
});
