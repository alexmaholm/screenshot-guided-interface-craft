import { describe, expect, it } from "vitest";
import { completeOnboarding, getState, quickStartProfile, resetAll } from "@/lib/balans";
import { exportFilename, exportPayload } from "@/lib/export";

describe("Zero-friction start", () => {
  it("creates a usable profile in one step, name optional", () => {
    resetAll();
    completeOnboarding(quickStartProfile("  Alex "));
    const s = getState();
    expect(s.profile?.name).toBe("Alex");
    expect(s.profile?.days).toEqual([0, 2, 4]);
    expect(s.workouts.length).toBeGreaterThan(0);
    expect(quickStartProfile().name).toBe("");
  });
  it("exports all logged data with a dated filename", () => {
    const s = getState();
    const out = exportPayload(s, new Date("2026-11-23T08:00:00Z"));
    expect(out.data).toBe(s);
    expect(exportFilename(new Date("2026-11-23T08:00:00Z"))).toBe("aequiv-data-2026-11-23.json");
  });
});
