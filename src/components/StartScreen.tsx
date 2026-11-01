import { useState } from "react";
import { Leaf, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignInOptions, useAuthUser } from "@/components/AccountCard";
import { Onboarding } from "@/components/Onboarding";

const POINTS = [
  { icon: "📸", text: "Logga mat med ett foto" },
  { icon: "🎙️", text: "Röststyrd gymlogg" },
  { icon: "🌿", text: "Vila räknas också" },
  { icon: "✨", text: "Din egen AI-coach" },
];

/** First screen after install: start fresh or sign in to restore your data. */
export function StartScreen() {
  const [view, setView] = useState<"start" | "login" | "onboarding">("start");
  const { user } = useAuthUser();

  if (view === "onboarding" || user) return <Onboarding />;

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col px-6 py-10">
      {view === "login" ? (
        <>
          <Button variant="ghost" size="icon" className="h-12 w-12" onClick={() => setView("start")} aria-label="Tillbaka">
            <ArrowLeft />
          </Button>
          <div className="mt-6 flex-1">
            <h1 className="text-3xl font-bold">Välkommen tillbaka</h1>
            <p className="mt-2 text-muted-foreground">Logga in så hämtar vi dina pass, måltider och din svit.</p>
            <div className="mt-8"><SignInOptions /></div>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-1 flex-col justify-center">
            <div className="flex items-center gap-2 font-display text-3xl font-bold text-primary">
              <Leaf className="h-8 w-8 text-coral" aria-hidden /> Balans
            </div>
            <h1 className="mt-8 text-4xl font-bold leading-tight">Mat, träning och vila – i balans.</h1>
            <p className="mt-3 text-lg text-muted-foreground">Enkelt, i din takt och utan pekpinnar.</p>
            <ul className="mt-8 grid grid-cols-2 gap-3">
              {POINTS.map((p) => (
                <li key={p.text} className="card-soft flex items-center gap-3 p-4 text-sm font-medium">
                  <span className="text-2xl" aria-hidden>{p.icon}</span>{p.text}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-10 flex flex-col gap-2">
            <Button size="lg" className="h-14 rounded-full text-base" onClick={() => setView("onboarding")}>Kom igång</Button>
            <Button variant="ghost" className="h-12 rounded-full" onClick={() => setView("login")}>Har du redan ett konto? Logga in</Button>
          </div>
        </>
      )}
    </div>
  );
}
