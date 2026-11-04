import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Permanently deletes the signed-in user's cloud data and account (GDPR / App Store 5.1.1(v)). */
export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const id = context.userId;
    await supabaseAdmin.from("user_state").delete().eq("user_id", id);
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (error) throw new Error("Kunde inte radera kontot");
    return { ok: true };
  });
