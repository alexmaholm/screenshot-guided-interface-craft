import type { State } from "@/lib/balans";

/** Full personal data export (GDPR art. 20). Excludes nothing the user logged. */
export function exportPayload(s: State, now = new Date()) {
  return { app: "Aequiv", format: 1, exportedAt: now.toISOString(), data: s };
}

export const exportFilename = (now = new Date()) => `aequiv-data-${now.toISOString().slice(0, 10)}.json`;
