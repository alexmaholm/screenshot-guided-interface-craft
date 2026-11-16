import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { SignInOptions, useAuthUser } from "@/components/AccountCard";
import { useBalans } from "@/lib/balans";

const KEY = "balans-welcome-account-seen";

/** Shown once after the intro tour: create an account (Apple, Google, email) or try without one. */
export function WelcomeAccount() {
  const s = useBalans();
  const { user, ready } = useAuthUser();
  const [seen, setSeen] = useState(true);
  useEffect(() => { setSeen(localStorage.getItem(KEY) === "1"); }, []);
  const close = () => { localStorage.setItem(KEY, "1"); setSeen(true); };
  useEffect(() => { if (user) close(); }, [user]);

  const open = ready && !user && !seen && !!s?.profile?.tourSeen;
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) close(); }}>
      <DialogContent className="max-w-sm rounded-xl p-8 text-center">
        <DialogTitle className="text-2xl">Skapa ditt konto</DialogTitle>
        <DialogDescription className="text-base">Spara dina pass, måltider och svit i molnet – så följer allt med om du byter telefon.</DialogDescription>
        <SignInOptions onDone={close} />
        <button type="button" onClick={close} className="text-sm text-muted-foreground underline">Prova först utan konto</button>
      </DialogContent>
    </Dialog>
  );
}
