import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { SignInOptions, useAuthUser } from "@/components/AccountCard";
import { ACCOUNT_GATE_EVENT } from "@/lib/account-gate";
import { supabaseConfigured } from "@/integrations/supabase/client";

/** Opens the sign-in dialog whenever a feature that needs an account is used while signed out. */
export function AccountGate() {
  const [open, setOpen] = useState(false);
  const { user } = useAuthUser();

  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener(ACCOUNT_GATE_EVENT, show);
    return () => window.removeEventListener(ACCOUNT_GATE_EVENT, show);
  }, []);

  useEffect(() => {
    if (user) setOpen(false);
  }, [user]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogTitle>Logga in för att använda AI</DialogTitle>
        <DialogDescription>
          AI-analysen kostar per användning, så den kräver ett konto. Din lokala data finns kvar på
          enheten.
        </DialogDescription>
        {supabaseConfigured ? (
          <SignInOptions onDone={() => setOpen(false)} />
        ) : (
          <p className="text-sm text-muted-foreground">
            Kontotjänsten är inte konfigurerad i den här versionen.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
