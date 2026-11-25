// Fair Use for AI photo analysis: daily cap + cooldown between new photos.
// Follow-up answers on the same photo do not count as a new analysis.
export const PHOTO_DAILY_LIMIT = 6;
export const PHOTO_COOLDOWN_MS = 15_000;

export type PhotoUsage = { date: string; count: number; last: number };

const KEY = "balans.photoUsage";
const dayKey = (now: number) => {
  const d = new Date(now);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

export function normalize(u: PhotoUsage | null, now: number): PhotoUsage {
  const date = dayKey(now);
  if (!u || u.date !== date) return { date, count: 0, last: u?.last ?? 0 };
  return u;
}

export type PhotoCheck =
  { ok: true; left: number } | { ok: false; reason: "limit" | "cooldown"; waitS?: number };

export function checkPhoto(u: PhotoUsage | null, now: number): PhotoCheck {
  const n = normalize(u, now);
  if (n.count >= PHOTO_DAILY_LIMIT) return { ok: false, reason: "limit" };
  const wait = n.last + PHOTO_COOLDOWN_MS - now;
  if (wait > 0) return { ok: false, reason: "cooldown", waitS: Math.ceil(wait / 1000) };
  return { ok: true, left: PHOTO_DAILY_LIMIT - n.count };
}

export function recordPhoto(u: PhotoUsage | null, now: number): PhotoUsage {
  const n = normalize(u, now);
  return { date: n.date, count: n.count + 1, last: now };
}

export function photosLeft(u: PhotoUsage | null, now: number) {
  return Math.max(0, PHOTO_DAILY_LIMIT - normalize(u, now).count);
}

export function loadUsage(): PhotoUsage | null {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "null");
  } catch {
    return null;
  }
}
export function saveUsage(u: PhotoUsage) {
  try {
    localStorage.setItem(KEY, JSON.stringify(u));
  } catch {
    /* ignore */
  }
}
