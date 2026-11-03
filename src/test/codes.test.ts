import { describe, expect, it } from "vitest";
import { redeemCode, status } from "@/lib/tiers";
describe("kampanjkoder", () => {
  it("grundarkoden ger livstids PRO, även med små bokstäver", async () => {
    const sub = await redeemCode(" balans-alex-7q4k9 ");
    expect(sub?.lifetime).toBe(true);
    expect(status(sub!, Date.now() + 10 * 365 * 86_400_000)).toBe("pro");
  });
  it("ogiltig kod avvisas", async () => { expect(await redeemCode("GRATIS")).toBeNull(); });
});
