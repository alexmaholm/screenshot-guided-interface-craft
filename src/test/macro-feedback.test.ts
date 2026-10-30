import { describe, expect, it } from "vitest";
import { macroFeedback } from "@/lib/balans";
describe("macroFeedback", () => {
  it("is silent before logging", () => expect(macroFeedback("carbs", 0, 200)).toBeNull());
  it("shows percent for carbs", () => expect(macroFeedback("carbs", 100, 200)).toMatch(/^50 %/));
  it("celebrates fat goal reached", () => expect(macroFeedback("fat", 70, 70)).toMatch(/Fettmålet nått/));
});
