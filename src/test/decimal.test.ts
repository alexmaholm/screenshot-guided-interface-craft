import { describe, it, expect } from "vitest";
import { parseDecimal } from "@/components/DecimalInput";
describe("parseDecimal", () => {
  it("accepts comma decimals", () => expect(parseDecimal("1,5")).toBe(1.5));
  it("keeps a trailing comma valid while typing", () => expect(parseDecimal("1,")).toBe(1));
  it("empty is undefined", () => expect(parseDecimal("")).toBeUndefined());
  it("rejects letters and negatives", () => { expect(parseDecimal("a")).toBeNaN(); expect(parseDecimal("-2")).toBeNaN(); });
});
