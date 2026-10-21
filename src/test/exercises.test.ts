import { describe, expect, it } from "vitest";
import { EXERCISES, muscleRecovery, recoveryStatus, searchExercises } from "@/lib/exercises";
import type { Workout } from "@/lib/balans";

const w = (date: string, names: string[]): Workout => ({
  id: date, date, title: "Pass", kind: "styrka", durationMin: 30, status: "klart",
  exercises: names.map((name) => ({ name, restSec: 60, done: true })),
});

describe("övningsbibliotek", () => {
  it("har minst 100 övningar", () => {
    expect(EXERCISES.length).toBeGreaterThanOrEqual(100);
  });
  it("varje övning har beskrivning, tips och muskelgrupp", () => {
    for (const e of EXERCISES) {
      expect(e.desc.length).toBeGreaterThan(10);
      expect(e.tips.length).toBeGreaterThan(0);
      expect(e.muscle).toBeTruthy();
    }
  });
  it("söker på svenska och engelska namn", () => {
    expect(searchExercises(EXERCISES, "bänkpress").length).toBeGreaterThan(0);
    expect(searchExercises(EXERCISES, "deadlift").length).toBeGreaterThan(0);
  });
  it("filtrerar på muskelgrupp och utrustning", () => {
    const bröst = searchExercises(EXERCISES, "", "bröst");
    expect(bröst.every((e) => e.muscle === "bröst")).toBe(true);
    const hemma = searchExercises(EXERCISES, "", undefined, ["ingen"]);
    expect(hemma.every((e) => e.eq.includes("ingen"))).toBe(true);
    expect(hemma.length).toBeGreaterThan(10);
  });
});

describe("muskelåterhämtning", () => {
  it("räknar dagar sedan muskeln tränades", () => {
    const rec = muscleRecovery([w("2026-10-19", ["Bänkpress", "Knäböj"])], "2026-10-21");
    expect(rec["bröst"]).toBe(2);
    expect(rec["ben"]).toBe(2);
    expect(rec["armar"]).toBeUndefined();
  });
  it("ignorerar pass som inte är klara", () => {
    const planned: Workout = { ...w("2026-10-20", ["Bänkpress"]), status: "planerat" };
    expect(muscleRecovery([planned], "2026-10-21")["bröst"]).toBeUndefined();
  });
  it("ger status redo efter 2+ dagar", () => {
    expect(recoveryStatus(0).tone).toBe("vila");
    expect(recoveryStatus(1).tone).toBe("snart");
    expect(recoveryStatus(3).tone).toBe("redo");
    expect(recoveryStatus(undefined).tone).toBe("redo");
  });
});
