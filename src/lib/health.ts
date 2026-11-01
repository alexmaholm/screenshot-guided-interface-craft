/** Bridge to Apple Health / Google Health Connect. The native plugin is added in the Capacitor build; web falls back gracefully. */
import type { State } from "@/lib/balans";

export interface HealthReading { date: string; steps?: number | undefined; activeKcal?: number | undefined; weightKg?: number | undefined }
export interface HealthSyncPrefs { calories: boolean; steps: boolean; weight: boolean }

interface NativeHealth {
  requestAuthorization?: (o: { read: string[] }) => Promise<unknown>;
  readToday?: (o: { types: string[] }) => Promise<{ steps?: number; activeKcal?: number; weightKg?: number }>;
}

function plugin(): NativeHealth | null {
  if (typeof window === "undefined") return null;
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean; Plugins?: { Health?: NativeHealth } } }).Capacitor;
  return cap?.isNativePlatform?.() ? cap.Plugins?.Health ?? null : null;
}

export function isNativeHealthAvailable(): boolean {
  return !!plugin();
}

export function healthSourceName(): string {
  if (typeof navigator === "undefined") return "Hälsoappen";
  return /iPhone|iPad|Mac/i.test(navigator.userAgent) ? "Apple Hälsa" : "Google Health Connect";
}

function types(p: HealthSyncPrefs): string[] {
  return [p.steps && "steps", p.calories && "activeKcal", p.weight && "weight"].filter(Boolean) as string[];
}

/** Asks for permission and reads today's values. Returns null outside the mobile app. */
export async function readHealthToday(prefs: HealthSyncPrefs, date: string): Promise<HealthReading | null> {
  const h = plugin();
  const t = types(prefs);
  if (!h?.readToday || t.length === 0) return null;
  await h.requestAuthorization?.({ read: t });
  const r = await h.readToday({ types: t });
  return { date, steps: prefs.steps ? r.steps : undefined, activeKcal: prefs.calories ? r.activeKcal : undefined, weightKg: prefs.weight ? r.weightKg : undefined };
}

const valid = (n: unknown, max: number): n is number => typeof n === "number" && Number.isFinite(n) && n >= 0 && n <= max;

/** Merges a reading into state: steps/kcal per day, weight replaces that day's body entry. Ignores implausible values. */
export function mergeHealth(s: State, r: HealthReading): Partial<State> {
  const day = { ...(s.health?.[r.date] ?? {}) };
  if (valid(r.steps, 200000)) day.steps = Math.round(r.steps);
  if (valid(r.activeKcal, 10000)) day.activeKcal = Math.round(r.activeKcal);
  const out: Partial<State> = { health: { ...(s.health ?? {}), [r.date]: day } };
  if (valid(r.weightKg, 300) && r.weightKg >= 30) {
    out.body = [...s.body.filter((b) => b.date !== r.date), { date: r.date, weight: Math.round(r.weightKg * 10) / 10 }];
  }
  return out;
}
