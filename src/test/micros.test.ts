import { describe, it, expect } from "vitest";
import { sumMicros } from "@/lib/balans";
describe("sumMicros", () => {
  it("summerar mikronäring och räknar saknade värden som 0", () => {
    expect(sumMicros([{ fiber: 3.2, sugar: 5, satFat: 1.1, salt: 0.4 }, {}, { fiber: 1.9, salt: 0.35 }]))
      .toEqual({ fiber: 5.1, sugar: 5, satFat: 1.1, salt: 0.8 });
  });
});
