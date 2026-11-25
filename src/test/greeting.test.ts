import { describe, it, expect } from "vitest";
import { greetingFor } from "@/lib/greeting";
describe("greetingFor", () => {
  it("morgon 05–11", () => {
    expect(greetingFor(5)).toBe("God morgon");
    expect(greetingFor(11)).toBe("God morgon");
  });
  it("eftermiddag 12–17", () => {
    expect(greetingFor(12)).toBe("God eftermiddag");
    expect(greetingFor(17)).toBe("God eftermiddag");
  });
  it("kväll 18–22", () => {
    expect(greetingFor(18)).toBe("God kväll");
    expect(greetingFor(22)).toBe("God kväll");
  });
  it("natt 23–04", () => {
    expect(greetingFor(23)).toBe("Vila gott");
    expect(greetingFor(4)).toBe("Vila gott");
  });
});
