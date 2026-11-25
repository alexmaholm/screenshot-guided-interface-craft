import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Lock, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { update, useBalans } from "@/lib/balans";
import {
  isPro,
  perMonth,
  PLANS,
  savingPct,
  startTrial,
  TRIAL_DAYS,
  type PlanId,
} from "@/lib/tiers";

const PERKS = [
  "AI-fotologg av tallriken",
  "AI-coach med personliga råd",
  "Smarta träningsmallar & progressionsdata",
  "Röstloggning i gymmet",
  "Muskelåterhämtningskarta",
  "Mikronäring: fibrer, socker, salt",
];

export function Paywall({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const s = useBalans();
  const [plan, setPlan] = useState<PlanId>("month");
  const buy = () => {
    // Native app: replace with StoreKit / Play Billing purchase (RevenueCat).
    update((st) => ({ ...st, subscription: startTrial(plan) }));
    toast.success(`Provperioden har startat – ${TRIAL_DAYS} dagar gratis`);
    onOpenChange(false);
  };
  const restore = () => {
    // Native app: replace with RevenueCat Purchases.restorePurchases().
    if (isPro(s)) {
      toast.success("Ditt PRO-medlemskap är aktivt");
      onOpenChange(false);
    } else toast("Inga tidigare köp hittades på det här kontot");
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-5 w-5 text-primary" /> Aequiv PRO
          </DialogTitle>
          <DialogDescription>
            Prova allt gratis i {TRIAL_DAYS} dagar. Ingen bindningstid.
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-2">
          {PERKS.map((p) => (
            <li key={p} className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary" />
              {p}
            </li>
          ))}
        </ul>
        <div className="space-y-2" role="radiogroup" aria-label="Välj period">
          {PLANS.map((p) => (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={plan === p.id}
              onClick={() => setPlan(p.id)}
              className="flex w-full items-center justify-between rounded-lg border p-4 text-left aria-checked:border-primary aria-checked:bg-secondary"
            >
              <span>
                <span className="block font-semibold">{p.label}</span>
                <span className="text-xs text-muted-foreground">
                  {p.tag}
                  {savingPct(p) > 0 ? ` · spara ${savingPct(p)} %` : ""}
                </span>
              </span>
              <span className="text-right">
                <span className="block font-semibold">{p.price} kr</span>
                {p.months > 1 && (
                  <span className="text-xs text-muted-foreground">ca {perMonth(p)} kr/mån</span>
                )}
              </span>
            </button>
          ))}
        </div>
        <Button className="h-12 w-full rounded-md" onClick={buy}>
          Starta {TRIAL_DAYS} dagar gratis
        </Button>
        <Button
          variant="ghost"
          className="h-10 w-full rounded-md text-sm text-muted-foreground"
          onClick={restore}
        >
          Återställ köp
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Avsluta när du vill. Debiteras först efter provperioden och förnyas automatiskt tills du
          avslutar.
        </p>
        <p className="text-center text-xs text-muted-foreground">
          <Link to="/villkor" className="underline" onClick={() => onOpenChange(false)}>
            Användarvillkor
          </Link>{" "}
          ·{" "}
          <Link to="/integritet" className="underline" onClick={() => onOpenChange(false)}>
            Integritetspolicy
          </Link>
        </p>
      </DialogContent>
    </Dialog>
  );
}

/** Shows children for PRO/trial members; otherwise a calm locked card that opens the paywall. */
export function ProGate({ title, children }: { title: string; children: ReactNode }) {
  const s = useBalans();
  const [open, setOpen] = useState(false);
  if (isPro(s)) return <>{children}</>;
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="card-soft flex w-full items-center justify-between p-5 text-left"
      >
        <span>
          <span className="block font-semibold">{title}</span>
          <span className="text-sm text-muted-foreground">Ingår i Aequiv PRO – prova gratis</span>
        </span>
        <Lock className="h-5 w-5 text-muted-foreground" aria-hidden />
      </button>
      <Paywall open={open} onOpenChange={setOpen} />
    </>
  );
}
