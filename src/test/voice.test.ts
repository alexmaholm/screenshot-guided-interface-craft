import { describe, expect, it } from "vitest";
import { parseVoice } from "@/lib/voice";

describe("röstlogg", () => {
  it("reps och kilo", () => expect(parseVoice("10 reps på 20 kilo")).toEqual({ reps: 10, kg: 20, done: true }));
  it("decimal med komma", () => expect(parseVoice("8 repetitioner 22,5 kg")).toEqual({ reps: 8, kg: 22.5, done: true }));
  it("ord som tal", () => expect(parseVoice("tolv reps på tjugo kilo")).toEqual({ reps: 12, kg: 20, done: true }));
  it("bara klar", () => expect(parseVoice("Klar")).toEqual({ done: true }));
  it("okänt ger null", () => expect(parseVoice("hej hej")).toBeNull());
  it("gymslang 10 på 20", () => expect(parseVoice("10 på 20")).toEqual({ reps: 10, kg: 20, done: true }));
  it("sammansatta tal", () => expect(parseVoice("åtta på tjugofem kilo")).toEqual({ reps: 8, kg: 25, done: true }));
  it("hundratal", () => expect(parseVoice("fem reps hundrafemtio kilo")).toEqual({ reps: 5, kg: 150, done: true }));
  it("nästa bockar av", () => expect(parseVoice("nästa")).toEqual({ done: true }));
  it("bara stycken", () => expect(parseVoice("12 stycken")).toEqual({ reps: 12, done: true }));
  it("och en halv", () => expect(parseVoice("10 på 22 och en halv")).toEqual({ reps: 10, kg: 22.5, done: true }));
});
