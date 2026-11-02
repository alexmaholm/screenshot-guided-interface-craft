import { describe, expect, it } from "vitest";
import { checkPhoto, recordPhoto, photosLeft, type PhotoUsage } from "@/lib/fairuse";

const t0 = new Date(2026, 10, 2, 12, 0, 0).getTime();

describe("fair use photo cap", () => {
  it("allows 6 photos per day, blocks the 7th", () => {
    let u: PhotoUsage | null = null;
    for (let i = 0; i < 6; i++) {
      const now = t0 + i * 20_000;
      expect(checkPhoto(u, now).ok).toBe(true);
      u = recordPhoto(u, now);
    }
    expect(checkPhoto(u, t0 + 10 * 60_000)).toEqual({ ok: false, reason: "limit" });
  });
  it("requires 15 s between photos", () => {
    const u = recordPhoto(null, t0);
    expect(checkPhoto(u, t0 + 5_000)).toMatchObject({ ok: false, reason: "cooldown", waitS: 10 });
    expect(checkPhoto(u, t0 + 15_000).ok).toBe(true);
  });
  it("resets at midnight", () => {
    let u: PhotoUsage | null = null;
    for (let i = 0; i < 6; i++) u = recordPhoto(u, t0 + i * 20_000);
    const nextDay = new Date(2026, 10, 3, 0, 1).getTime();
    expect(photosLeft(u, nextDay)).toBe(6);
    expect(checkPhoto(u, nextDay).ok).toBe(true);
  });
});
