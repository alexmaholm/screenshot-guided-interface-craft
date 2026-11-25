import { supabase } from "@/integrations/supabase/client";

/** Fired on window when a feature needs a signed-in account. AccountGate listens for it. */
export const ACCOUNT_GATE_EVENT = "aequiv:require-account";

/**
 * Returns true when the user is signed in. Otherwise opens the sign-in dialog and returns false.
 * AI features call this before using the server, because AI calls cost money per use.
 */
export async function ensureSignedIn(): Promise<boolean> {
  try {
    const { data } = await supabase.auth.getSession();
    if (data.session) return true;
  } catch {
    // Treat an unreadable session as signed out.
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(ACCOUNT_GATE_EVENT));
  }
  return false;
}
