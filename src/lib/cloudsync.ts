import type { Json } from "@/integrations/supabase/types";
import { supabase, supabaseConfigured } from "@/integrations/supabase/client";
import { getState, replaceState, subscribeState, type State } from "@/lib/balans";

/**
 * Offline-first sync: the app always reads/writes local state; when signed in
 * the whole state is mirrored to the user's row in `user_state` (debounced).
 * On sign-in, existing cloud data wins (restores a new phone); otherwise local
 * data is uploaded.
 *
 * Safety rules:
 * - Uploads are only allowed after the cloud copy was read successfully (`ready`).
 *   Otherwise a failed download could overwrite the cloud data with local data.
 * - A failed read or upload is retried later; pending changes are flushed when the page is hidden.
 */
const DEBOUNCE_MS = 1500;
const RETRY_MS = 15_000;

let started = false;
let userId: string | null = null;
let ready = false;
let dirty = false;
let timer: ReturnType<typeof setTimeout> | null = null;
let applyingRemote = false;

function clearTimer() {
  if (timer) clearTimeout(timer);
  timer = null;
}

async function push(): Promise<boolean> {
  if (!userId || !ready) return false;
  clearTimer();
  const { error } = await supabase.from("user_state").upsert({
    user_id: userId,
    data: getState() as unknown as Json,
    updated_at: new Date().toISOString(),
  });
  if (error) {
    console.warn("[sync] Uppladdningen misslyckades, försöker igen:", error.message);
    dirty = true;
    timer = setTimeout(() => void push(), RETRY_MS);
    return false;
  }
  dirty = false;
  return true;
}

async function pullOrSeed(id: string) {
  ready = false;
  const { data, error } = await supabase
    .from("user_state")
    .select("data")
    .eq("user_id", id)
    .maybeSingle();
  if (userId !== id) return; // signed out or switched account meanwhile

  if (error) {
    // Do not upload local data when the cloud copy could not be read. Try the download again.
    console.warn("[sync] Kunde inte läsa molnet, försöker igen:", error.message);
    clearTimer();
    timer = setTimeout(() => void pullOrSeed(id), RETRY_MS);
    return;
  }

  const remote = data?.data as Partial<State> | null | undefined;
  if (remote && remote.profile) {
    applyingRemote = true;
    try {
      replaceState(remote);
    } finally {
      applyingRemote = false;
    }
    ready = true;
    dirty = false;
  } else {
    // Confirmed empty in the cloud, so uploading local data is safe.
    ready = true;
    await push();
  }
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
      clearTimer();
      return;
    }
    if (id && id !== userId && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
      userId = id;
      void pullOrSeed(id);
    }
  });
}
