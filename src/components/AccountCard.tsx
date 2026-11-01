import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** Sign-in options shared by the welcome screen and Inställningar: Apple, Google, email + password. */
export function SignInOptions({ onDone }: { onDone?: () => void }) {
  const [mode, setMode] = useState<"buttons" | "signup" | "login">("buttons");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function oauth(provider: "apple" | "google") {
    const r = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
    if (r.error) toast.error("Inloggningen misslyckades. Försök igen.");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) { toast.error("Lösenordet måste ha minst 6 tecken."); return; }
    setBusy(true);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
      setBusy(false);
      if (error) { toast.error(error.message); return; }
      setSent(true);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) { toast.error("Fel e-post eller lösenord."); return; }
      toast.success("Du är inloggad");
      onDone?.();
    }
  }

  async function forgot() {
    if (!email) { toast.error("Skriv din e-post först."); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
    if (error) toast.error(error.message);
    else toast.success("Vi har skickat en länk för att välja nytt lösenord.");
  }

  if (sent) {
    return (
      <p className="text-sm text-muted-foreground">
        Kolla din e-post <span className="font-medium text-foreground">{email}</span> och tryck på länken för att bekräfta ditt konto.
      </p>
    );
  }

  if (mode === "buttons") {
    return (
      <div className="space-y-3">
        <Button className="h-12 w-full rounded-full" onClick={() => oauth("apple")}>Fortsätt med Apple</Button>
        <Button variant="outline" className="h-12 w-full rounded-full" onClick={() => oauth("google")}>Fortsätt med Google</Button>
        <Button variant="outline" className="h-12 w-full rounded-full" onClick={() => setMode("signup")}>Fortsätt med e-post</Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3 text-left">
      <div className="grid grid-cols-2 gap-1 rounded-full bg-muted p-1">
        {(["signup", "login"] as const).map((m) => (
          <button key={m} type="button" onClick={() => setMode(m)}
            className={`h-9 rounded-full text-sm font-medium ${mode === m ? "bg-background shadow-sm" : "text-muted-foreground"}`}>
            {m === "signup" ? "Skapa konto" : "Logga in"}
          </button>
        ))}
      </div>
      <Input type="email" required autoComplete="email" placeholder="E-post" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12" />
      <Input type="password" required autoComplete={mode === "signup" ? "new-password" : "current-password"} placeholder="Lösenord (minst 6 tecken)" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12" />
      <Button type="submit" disabled={busy} className="h-12 w-full rounded-full">
        {busy ? "Vänta…" : mode === "signup" ? "Skapa konto" : "Logga in"}
      </Button>
      <div className="flex justify-between text-sm">
        <button type="button" className="text-muted-foreground underline" onClick={() => setMode("buttons")}>Tillbaka</button>
        {mode === "login" && <button type="button" className="text-muted-foreground underline" onClick={forgot}>Glömt lösenord?</button>}
      </div>
    </form>
  );
}

export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { setUser(data.user); setReady(true); });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);
  return { user, ready };
}

export function AccountCard() {
  const { user, ready } = useAuthUser();
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
      <SignInOptions />
    </div>
  );
}
