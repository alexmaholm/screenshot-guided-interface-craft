import type { Json } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { getState, replaceState, subscribeState, type State } from "@/lib/balans";

/**
 * Offline-first sync: the app always reads/writes local state; when signed in
 * the whole state is mirrored to the user's row in `user_state` (debounced).
 * On sign-in, existing cloud data wins (restores a new phone); otherwise local
 * data is uploaded.
 */
let started = false;
let userId: string | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
let applyingRemote = false;

async function push() {
  if (!userId) return;
  await supabase.from("user_state").upsert({
    user_id: userId,
    data: getState() as unknown as Json,
    updated_at: new Date().toISOString(),
  });
}

async function pullOrSeed(id: string) {
  const { data } = await supabase.from("user_state").select("data").eq("user_id", id).maybeSingle();
  const remote = data?.data as Partial<State> | null | undefined;
  if (remote && remote.profile) {
    applyingRemote = true;
    replaceState(remote);
    applyingRemote = false;
  } else {
    await push();
  }
}

export function startCloudSync() {
  if (started || typeof window === "undefined") return;
  started = true;
  subscribeState(() => {
    if (!userId || applyingRemote) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => void push(), 1500);
  });
  supabase.auth.onAuthStateChange((event, session) => {
    const id = session?.user.id ?? null;
    if (event === "SIGNED_OUT") {
      userId = null;
      return;
    }
    if (id && id !== userId && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
      userId = id;
      void pullOrSeed(id);
    }
  });
}
