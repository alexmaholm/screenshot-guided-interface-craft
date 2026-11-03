import { describe, expect, it } from "vitest";
import { PLANS, perMonth, savingPct, startTrial, status, trialDaysLeft } from "@/lib/tiers";

describe("Balans PRO", () => {
  it("priser 79 / 199 / 699 kr", () => expect(PLANS.map((p) => p.price)).toEqual([79, 199, 699]));
  it("3 mån ca 66 kr/mån och 16 % rabatt, år 26 %", () => {
    expect(perMonth(PLANS[1]!)).toBe(66);
    expect(savingPct(PLANS[1]!)).toBe(16);
    expect(savingPct(PLANS[2]!)).toBe(26);
  });
  it("7 dagars provperiod", () => {
    const sub = startTrial("month", 0);
    expect(trialDaysLeft(sub, 0)).toBe(7);
    expect(status(sub, 6 * 86_400_000)).toBe("trial");
    expect(status(sub, 8 * 86_400_000)).toBe("pro");
  });
  it("avslutad blir gratis efter provperioden", () => {
    expect(status({ ...startTrial("year", 0), cancelled: true }, 8 * 86_400_000)).toBe("free");
    expect(status(undefined)).toBe("free");
  });
});
