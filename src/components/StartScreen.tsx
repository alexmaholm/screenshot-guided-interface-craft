import { AequivLogo } from "@/components/AequivLogo";
import { useState } from "react";
import { Activity, ArrowLeft, ArrowRight, Cpu, Mic, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SignInOptions } from "@/components/AccountCard";
import { completeOnboarding, quickStartProfile } from "@/lib/balans";

const POINTS = [
  { icon: ScanLine, label: "Vision", text: "Fota tallriken – makron på sekunder" },
  { icon: Mic, label: "Röst", text: "Logga set, reps och vikt med rösten" },
  { icon: Activity, label: "Återhämtning", text: "Muskelstatus i realtid" },
  { icon: Cpu, label: "AI-coach", text: "Anpassar passet efter din dagsform" },
];

/** First screen after install: one tap into the app with strong defaults, or sign in to restore data. */
export function StartScreen() {
  const [view, setView] = useState<"start" | "login">("start");
  const [name, setName] = useState("");
  const start = () => completeOnboarding(quickStartProfile(name));

  if (view === "login") {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col px-6 py-10">
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12"
          onClick={() => setView("start")}
          aria-label="Tillbaka"
        >
          <ArrowLeft />
        </Button>
        <div className="mt-6 flex-1">
          <p className="label-xs telemetry">Återställ profil</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em]">Välkommen tillbaka.</h1>
          <p className="mt-2 text-muted-foreground">
            Logga in så synkas dina pass, måltider och din svit.
          </p>
          <div className="mt-8">
            <SignInOptions />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col px-6 pb-8 pt-[max(2.5rem,env(safe-area-inset-top))]">
      <div className="flex items-center justify-between">
        <AequivLogo className="h-9 w-9" />
        <p className="label-xs telemetry">v1.0</p>
      </div>
      <div className="flex flex-1 flex-col justify-center py-10">
        <h1 className="text-[2.6rem] font-semibold leading-[1.02] tracking-[-0.04em]">
          Träning. Nutrition. Återhämtning.
          <br />
          <span className="text-primary">I jämvikt.</span>
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          Precision för din kropp – utan friktion.
        </p>
        <ul className="mt-8 divide-y divide-border border-y">
          {POINTS.map(({ icon: Icon, label, text }) => (
            <li key={label} className="flex items-center gap-4 py-3.5">
              <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span className="label-xs w-24 shrink-0">{label}</span>
              <span className="text-sm text-muted-foreground">{text}</span>
            </li>
          ))}
        </ul>
      </div>
      <form
        className="flex flex-col gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          start();
        }}
      >
        <label htmlFor="name" className="sr-only">
          Ditt namn
        </label>
        <Input
          id="name"
          autoComplete="given-name"
          className="h-14 rounded-md text-base"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ditt namn (valfritt)"
        />
        <Button
          type="submit"
          size="lg"
          className="h-14 rounded-md text-base font-semibold glow-primary"
        >
          Starta Aequiv <ArrowRight className="h-4 w-4" aria-hidden />
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="h-12 rounded-md text-muted-foreground"
          onClick={() => setView("login")}
        >
          Har du redan ett konto? Logga in
        </Button>
        <p className="mt-1 text-center text-xs text-muted-foreground">
          Mål, utrustning och kost finjusterar du när du vill i Inställningar.
        </p>
      </form>
    </div>
  );
}
