/** Aequiv PRO: plans, 7-day trial and membership status. Purchases are simulated until native StoreKit/Play Billing is wired in. */
import type { State } from "@/lib/balans";

export type PlanId = "month" | "quarter" | "year";
export interface Plan {
  id: PlanId;
  label: string;
  price: number;
  months: number;
  tag: string;
}

export const PLANS: Plan[] = [
  { id: "month", label: "1 månad", price: 79, months: 1, tag: "Flexibelt" },
  { id: "quarter", label: "3 månader", price: 199, months: 3, tag: "Populärast för 12 veckor" },
  { id: "year", label: "12 månader", price: 699, months: 12, tag: "Bästa årspris" },
];

export const TRIAL_DAYS = 7;
const DAY = 86_400_000;

export interface Subscription {
  plan: PlanId;
  startedAt: number;
  trialEndsAt: number;
  cancelled?: boolean | undefined;
  lifetime?: boolean | undefined;
  codeLabel?: string | undefined;
}

export const perMonth = (p: Plan) => Math.round(p.price / p.months);
/** Percent saved versus paying the monthly price for the same period. */
export const savingPct = (p: Plan) =>
  Math.round((1 - p.price / (PLANS[0]!.price * p.months)) * 100);

export function startTrial(plan: PlanId, now = Date.now()): Subscription {
  return { plan, startedAt: now, trialEndsAt: now + TRIAL_DAYS * DAY };
}

export type Status = "free" | "trial" | "pro";
export function status(sub: Subscription | undefined, now = Date.now()): Status {
  if (!sub) return "free";
  if (sub.lifetime) return "pro";
  if (now < sub.trialEndsAt) return "trial";
  return sub.cancelled ? "free" : "pro";
}

export const isPro = (s: State | null | undefined, now = Date.now()) =>
  status(s?.subscription, now) !== "free";

export function trialDaysLeft(sub: Subscription | undefined, now = Date.now()) {
  return sub ? Math.max(0, Math.ceil((sub.trialEndsAt - now) / DAY)) : 0;
}

/** Redeemable codes, stored only as SHA-256 hashes so the real codes never appear in the app bundle. */
const CODES: Record<string, { lifetime?: true; months?: number; label: string }> = {
  d8dfd6766e7e817c8a05ff0801c9c460c69ec14fe6b14f9c63d9458a86816d91: {
    lifetime: true,
    label: "Grundare – livstid",
  },
};

export const normalizeCode = (c: string) => c.trim().toUpperCase().replace(/\s+/g, "");

async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Returns the new subscription for a valid code, or null. */
export async function redeemCode(code: string, now = Date.now()): Promise<Subscription | null> {
  const hit = CODES[await sha256(normalizeCode(code))];
  if (!hit) return null;
  if (hit.lifetime)
    return { plan: "year", startedAt: now, trialEndsAt: now, lifetime: true, codeLabel: hit.label };
  return {
    plan: "month",
    startedAt: now,
    trialEndsAt: now + (hit.months ?? 1) * 30 * DAY,
    cancelled: true,
    codeLabel: hit.label,
  };
}
