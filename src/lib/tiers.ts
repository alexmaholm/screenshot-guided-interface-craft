/** Balans PRO: plans, 7-day trial and membership status. Purchases are simulated until native StoreKit/Play Billing is wired in. */
import type { State } from "@/lib/balans";

export type PlanId = "month" | "quarter" | "year";
export interface Plan { id: PlanId; label: string; price: number; months: number; tag: string }

export const PLANS: Plan[] = [
  { id: "month", label: "1 månad", price: 79, months: 1, tag: "Flexibelt" },
  { id: "quarter", label: "3 månader", price: 199, months: 3, tag: "Populärast för 12 veckor" },
  { id: "year", label: "12 månader", price: 699, months: 12, tag: "Bästa årspris" },
];

export const TRIAL_DAYS = 7;
const DAY = 86_400_000;

export interface Subscription { plan: PlanId; startedAt: number; trialEndsAt: number; cancelled?: boolean | undefined }

export const perMonth = (p: Plan) => Math.round(p.price / p.months);
/** Percent saved versus paying the monthly price for the same period. */
export const savingPct = (p: Plan) => Math.round((1 - p.price / (PLANS[0]!.price * p.months)) * 100);

export function startTrial(plan: PlanId, now = Date.now()): Subscription {
  return { plan, startedAt: now, trialEndsAt: now + TRIAL_DAYS * DAY };
}

export type Status = "free" | "trial" | "pro";
export function status(sub: Subscription | undefined, now = Date.now()): Status {
  if (!sub) return "free";
  if (now < sub.trialEndsAt) return "trial";
  return sub.cancelled ? "free" : "pro";
}

export const isPro = (s: State | null | undefined, now = Date.now()) => status(s?.subscription, now) !== "free";

export function trialDaysLeft(sub: Subscription | undefined, now = Date.now()) {
  return sub ? Math.max(0, Math.ceil((sub.trialEndsAt - now) / DAY)) : 0;
}
