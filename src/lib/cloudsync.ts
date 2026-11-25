import type { Json } from "@/integrations/supabase/types";
import { supabase, supabaseConfigured } from "@/integrations/supabase/client";
import { getState, replaceState, subscribeState, type State } from "@/lib/balans";
import { mergeStates } from "@/lib/cloudmerge";

/**
 * Offline-first sync. The app always reads and writes local state (the source of truth on the
 * device). When signed in, the state is mirrored to one row per user in `user_state`.
 *
 * Rules:
 * - Sign-in merges local and cloud data (see cloudmerge.ts). Nothing is silently dropped.
 * - Every upload is conditional on the cloud row's `updated_at` we last saw. If another device
 *   wrote in between, we download, merge and upload again. Two devices never overwrite each other.
 * - Uploads happen only after the cloud copy was read successfully, so a failed download
 *   cannot replace cloud data.
 * - Failed reads and uploads are retried. Pending changes are flushed when the page is hidden.
 */
const DEBOUNCE_MS = 1500;
const RETRY_MS = 15_000;
const MAX_CONFLICT_ROUNDS = 3;

let started = false;
let userId: string | null = null;
let ready = false;
let dirty = false;
/** `updated_at` of the cloud row we last read or wrote. null = no cloud row seen yet. */
let known: string | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
let applyingRemote = false;

function clearTimer() {
  if (timer) clearTimeout(timer);
  timer = null;
}

/** Uploads the local state. Returns true when the cloud copy now matches this device. */
async function push(round = 0): Promise<boolean> {
  if (!userId || !ready) return false;
  clearTimer();
  const id = userId;
  const now = new Date().toISOString();
  const payload = getState() as unknown as Json;

  if (known === null) {
    // First write for this user. Insert fails if another device created the row meanwhile.
    const { data, error } = await supabase
      .from("user_state")
      .insert({ user_id: id, data: payload, updated_at: now })
      .select("updated_at");
    if (userId !== id) return false;
    if (!error && data && data.length > 0) {
      known = data[0]!.updated_at;
      dirty = false;
      return true;
    }
    return reconcile(round, error?.message);
  }

  const { data, error } = await supabase
    .from("user_state")
    .update({ data: payload, updated_at: now })
    .eq("user_id", id)
    .eq("updated_at", known)
    .select("updated_at");
  if (userId !== id) return false;
  if (error) {
    console.warn("[sync] Uppladdningen misslyckades, försöker igen:", error.message);
    dirty = true;
    timer = setTimeout(() => void push(), RETRY_MS);
    return false;
  }
  if (!data || data.length === 0) {
    // The cloud row changed since we read it: another device wrote. Merge, then upload again.
    return reconcile(round, "conflict");
  }
  known = data[0]!.updated_at;
  dirty = false;
  return true;
}

async function reconcile(round: number, reason?: string): Promise<boolean> {
  if (round >= MAX_CONFLICT_ROUNDS) {
    console.warn("[sync] För många samtidiga ändringar, försöker senare.", reason);
    dirty = true;
    timer = setTimeout(() => void pullOrSeed(userId!), RETRY_MS);
    return false;
  }
  await pullOrSeed(userId!, round + 1);
  return !dirty;
}

/** Downloads the cloud copy, merges it with local data and uploads the result. */
async function pullOrSeed(id: string, round = 0) {
  ready = false;
  const { data, error } = await supabase
    .from("user_state")
    .select("data, updated_at")
    .eq("user_id", id)
    .maybeSingle();
  if (userId !== id) return; // signed out or switched account meanwhile

  if (error) {
    // Never upload local data when the cloud copy could not be read. Try the download again.
    console.warn("[sync] Kunde inte läsa molnet, försöker igen:", error.message);
    clearTimer();
    timer = setTimeout(() => void pullOrSeed(id), RETRY_MS);
    return;
  }

  if (!data) {
    // Confirmed: no cloud row yet. Upload local data as the first copy.
    known = null;
    ready = true;
    await push(round);
    return;
  }

  const remote = (data.data ?? {}) as Partial<State>;
  known = data.updated_at;
  const merged = mergeStates(getState(), remote);
  applyingRemote = true;
  try {
    replaceState(merged);
  } finally {
    applyingRemote = false;
  }
  ready = true;
  dirty = true;
  await push(round);
}

export function startCloudSync() {
  if (started || typeof window === "undefined" || !supabaseConfigured) return;
  started = true;

  subscribeState(() => {
    if (!userId || !ready || applyingRemote) return;
    dirty = true;
    clearTimer();
    timer = setTimeout(() => void push(), DEBOUNCE_MS);
  });

  // Flush pending changes when the app goes to the background or closes.
  const flush = () => {
    if (dirty && userId && ready) void push();
  };
  window.addEventListener("pagehide", flush);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
  });

  supabase.auth.onAuthStateChange((event, session) => {
    const id = session?.user.id ?? null;
    if (event === "SIGNED_OUT") {
      userId = null;
      ready = false;
      known = null;
      clearTimer();
      return;
    }
    if (id && id !== userId && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
      userId = id;
      void pullOrSeed(id);
    }
  });
}
