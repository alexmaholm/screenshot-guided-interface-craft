import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Nytt lösenord – Balans" },
      { name: "description", content: "Välj ett nytt lösenord för ditt Balans-konto." },
      { property: "og:title", content: "Nytt lösenord – Balans" },
      { property: "og:description", content: "Välj ett nytt lösenord för ditt Balans-konto." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 6) { toast.error("Lösenordet måste ha minst 6 tecken."); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) { toast.error("Länken har gått ut. Begär en ny."); return; }
    toast.success("Ditt lösenord är uppdaterat");
    navigate({ to: "/", replace: true });
  }
  return (
    <main className="mx-auto max-w-sm space-y-4 px-6 py-16">
      <h1 className="text-2xl font-semibold">Välj nytt lösenord</h1>
      <form onSubmit={save} className="space-y-3">
        <Input type="password" autoComplete="new-password" placeholder="Nytt lösenord" value={pw} onChange={(e) => setPw(e.target.value)} className="h-12" />
        <Button type="submit" disabled={busy} className="h-12 w-full rounded-md">Spara lösenord</Button>
      </form>
    </main>
  );
}
