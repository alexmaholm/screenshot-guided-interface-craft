import { describe, expect, it } from "vitest";
import { EXERCISES } from "@/lib/exercises";
import { patternFor } from "@/components/ExerciseDemo";

const p = (name: string) => patternFor(EXERCISES.find((e) => e.name === name)!);

describe("rätt demonstration per övning", () => {
  it.each([
    ["Planka", "plank"], ["Sidoplanka", "plank"], ["Crunches", "core"], ["Maghjul", "rollout"],
    ["Hängande benlyft", "hang"], ["Benlyft liggande", "legraise"], ["Höftlyft med skivstång", "hipthrust"],
    ["Glute bridge", "bridge"], ["Sidolyft", "lateral"], ["Lutande sidolyft på bänk", "lateral"],
    ["Militärpress", "ohp"], ["Bänkpress", "bench"], ["Flyes med hantlar", "fly"], ["Dips", "dips"],
    ["Triceps kickbacks", "kickback"], ["Lutande hantelcurl", "curl"], ["Gående utfall", "lunge"],
    ["Trap bar marklyft", "hinge"], ["Slädpress", "sled"], ["Tåhävningar", "calf"], ["Bensträck", "legext"],
    ["Bencurl liggande", "legcurl"], ["Benpress", "squat"], ["Latsdrag", "vpull"], ["Armhävningar", "pushup"],
    ["Mountain climbers", "climber"], ["Smithmaskin knäböj", "squat"], ["Trappsteg", "cardio"],
  ])("%s → %s", (name, pat) => expect(p(name)).toBe(pat));
});

import { setupFor } from "@/components/ExerciseDemo";
const s = (name: string) => setupFor(EXERCISES.find((e) => e.name === name)!);

describe("övningsspecifik uppsättning", () => {
  it("alla övningar har redskap och primärmuskel", () => {
    for (const e of EXERCISES) expect(setupFor(e).primary.length).toBeGreaterThan(2);
  });
  it("latsdrag använder övre kabel", () => expect(s("Latsdrag").cable).toBe("high"));
  it("hammercurl markerar brachialis", () => expect(s("Hammercurl").primary).toMatch(/Brachialis/));
});
