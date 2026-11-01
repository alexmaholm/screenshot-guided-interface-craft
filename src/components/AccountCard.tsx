import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";

export function AccountCard() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { setUser(data.user); setReady(true); });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  async function signIn(provider: "apple" | "google") {
    const r = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
    if (r.error) toast.error("Inloggningen misslyckades. Försök igen.");
  }

  if (!ready) return <p className="text-sm text-muted-foreground">Laddar konto…</p>;

  if (user) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Inloggad som <span className="font-medium text-foreground">{user.email ?? "ditt konto"}</span>. Din data säkerhetskopieras automatiskt i molnet.
        </p>
        <Button variant="outline" className="h-11 w-full rounded-full" onClick={async () => { await supabase.auth.signOut(); toast.success("Du är utloggad"); }}>
          Logga ut
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Logga in för att spara din data i molnet och behålla den om du byter telefon.</p>
      <Button className="h-11 w-full rounded-full" onClick={() => signIn("apple")}>Fortsätt med Apple</Button>
      <Button variant="outline" className="h-11 w-full rounded-full" onClick={() => signIn("google")}>Fortsätt med Google</Button>
    </div>
  );
}
