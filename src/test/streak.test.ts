import { describe, expect, it } from "vitest";
import { addDays } from "@/lib/balans";
import { streakInfo } from "@/lib/habits";

const today = "2026-10-28";
const y = addDays(today, -1),
  y2 = addDays(today, -2);

describe("streak – vila är också framsteg", () => {
  it("vald vilodag bryter inte sviten", () => {
    const r = streakInfo(
      {
        meals: [{ date: y2 }, { date: today }],
        workouts: [],
        habits: { [y]: { water: 0, restDay: true } },
      },
      today,
      addDays,
    );
    expect(r.streak).toBe(3);
    expect(r.restDays).toBe(1);
  });
  it("tom dag bryter sviten", () => {
    const r = streakInfo(
      { meals: [{ date: y2 }, { date: today }], workouts: [], habits: {} },
      today,
      addDays,
    );
    expect(r.streak).toBe(1);
  });
  it("tom idag bryter inte gårdagens svit", () => {
    const r = streakInfo(
      { meals: [{ date: y }, { date: y2 }], workouts: [], habits: {} },
      today,
      addDays,
    );
    expect(r.streak).toBe(2);
  });
});
