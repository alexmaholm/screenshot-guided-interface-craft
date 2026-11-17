import { useState } from "react";
import { Leaf, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DietaryPreferences } from "@/components/DietaryPreferences";
import { Input } from "@/components/ui/input";
import { completeOnboarding, WEEKDAYS, type Equipment, type Goal, type Level, type Profile } from "@/lib/balans";

const GOALS: { v: Goal; l: string; d: string }[] = [
  { v: "energi", l: "Mer energi", d: "Orka mer i vardagen" },
  { v: "styrka", l: "Bygga styrka", d: "Bli starkare steg för steg" },
  { v: "kondition", l: "Förbättra kondition", d: "Flåset ska hänga med" },
  { v: "vanor", l: "Regelbundna vanor", d: "Små rutiner som håller" },
  { v: "annat", l: "Något annat", d: "Beskriv med egna ord" },
];
const LEVELS: { v: Level; l: string }[] = [
  { v: "nybörjare", l: "Ny eller nystartad" },
  { v: "van", l: "Tränar ibland" },
  { v: "erfaren", l: "Tränar regelbundet" },
];
const EQ: { v: Equipment; l: string }[] = [
  { v: "ingen", l: "Bara kroppen" },
  { v: "hantlar", l: "Hantlar" },
  { v: "gummiband", l: "Gummiband" },
  { v: "kettlebell", l: "Kettlebell" },
  { v: "gym", l: "Gym" },
];


export function Onboarding() {
  const [step, setStep] = useState(0);
  const [p, setP] = useState<Profile>({
    name: "",
    goal: "energi",
    equipment: ["ingen"],
    days: [0, 2, 4],
    sessionMin: 25,
    hideCalories: false,
    waterGoal: 8,
  });
  const set = (patch: Partial<Profile>) => setP((x) => ({ ...x, ...patch }));
  const steps = ["Namn", "Mål", "Nivå", "Utrustning", "Dagar", "Kost"];
  const last = step === steps.length - 1;
  const next = () => (last ? completeOnboarding(p) : setStep(step + 1));
  const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col px-5 py-8">
      <div className="flex items-center justify-between">
        {step > 0 ? (
          <Button variant="ghost" size="icon" className="h-12 w-12" onClick={() => setStep(step - 1)} aria-label="Tillbaka">
            <ArrowLeft />
          </Button>
        ) : (
          <div className="flex items-center gap-2 font-display text-xl font-bold text-primary">
            <Leaf className="h-5 w-5 text-primary" aria-hidden /> Balans
          </div>
        )}
        <span className="text-sm text-muted-foreground">
          Steg {step + 1} av {steps.length}
        </span>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={steps.length}>
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
      </div>

      <div className="mt-10 flex-1">
        {step === 0 && (
          <section>
            <h1 className="text-4xl font-bold">Hej! Vad vill du att vi kallar dig?</h1>
            <p className="mt-3 text-muted-foreground">Balans hjälper dig planera mat, träning och vila – i din takt.</p>
            <label className="mt-8 block text-sm font-medium" htmlFor="name">Förnamn eller smeknamn</label>
            <Input id="name" className="mt-2 h-14 rounded-lg text-lg" value={p.name} onChange={(e) => set({ name: e.target.value })} placeholder="T.ex. Alex" />
          </section>
        )}
        {step === 1 && (
          <section>
            <h1 className="text-3xl font-bold">Vad vill du främst uppnå?</h1>
            <div className="mt-6 grid gap-3">
              {GOALS.map((g) => (
                <button key={g.v} aria-pressed={p.goal === g.v} onClick={() => set({ goal: g.v })} className="chip justify-between rounded-lg! px-5! py-4! text-left">
                  <span>
                    <span className="block font-semibold">{g.l}</span>
                    <span className="block text-sm opacity-80">{g.d}</span>
                  </span>
                </button>
              ))}
              {p.goal === "annat" && (
                <Input className="h-12 rounded-lg" placeholder="Beskriv ditt mål" value={p.goalOther ?? ""} onChange={(e) => set({ goalOther: e.target.value })} />
              )}
            </div>
          </section>
        )}
        {step === 2 && (
          <section>
            <h1 className="text-3xl font-bold">Hur van är du vid träning?</h1>
            <p className="mt-2 text-muted-foreground">Vi anpassar passens upplägg efter det.</p>
            <div className="mt-6 grid gap-3">
              {LEVELS.map((l) => (
                <button key={l.v} aria-pressed={p.level === l.v} onClick={() => set({ level: l.v })} className="chip rounded-lg! py-4!">
                  {l.l}
                </button>
              ))}
            </div>
          </section>
        )}
        {step === 3 && (
          <section>
            <h1 className="text-3xl font-bold">Vad har du tillgång till?</h1>
            <p className="mt-2 text-muted-foreground">Välj allt som passar.</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {EQ.map((e) => (
                <button key={e.v} aria-pressed={p.equipment.includes(e.v)} onClick={() => set({ equipment: toggle(p.equipment, e.v) })} className="chip">
                  {e.l}
                </button>
              ))}
            </div>
            <p className="mt-8 font-medium">Hur långa pass passar dig?</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {[15, 25, 40, 60].map((m) => (
                <button key={m} aria-pressed={p.sessionMin === m} onClick={() => set({ sessionMin: m })} className="chip">
                  {m} min
                </button>
              ))}
            </div>
          </section>
        )}
        {step === 4 && (
          <section>
            <h1 className="text-3xl font-bold">Vilka dagar vill du träna?</h1>
            <p className="mt-2 text-muted-foreground">Du kan alltid flytta pass senare.</p>
            <div className="mt-6 grid grid-cols-4 gap-2 sm:grid-cols-7">
              {WEEKDAYS.map((d, i) => (
                <button key={d} aria-pressed={p.days.includes(i)} onClick={() => set({ days: toggle(p.days, i).sort() })} className="chip justify-center px-0!">
                  {d}
                </button>
              ))}
            </div>
          </section>
        )}
        {step === 5 && (
          <section>
            <h1 className="text-3xl font-bold">Hur äter du helst?</h1>
            <div className="mt-6"><DietaryPreferences profile={p} onChange={set} /></div>
            <label className="mt-8 flex min-h-12 items-center gap-3 rounded-lg bg-card p-4">
              <input type="checkbox" className="h-5 w-5 accent-[var(--primary)]" checked={p.hideCalories} onChange={(e) => set({ hideCalories: e.target.checked })} />
              <span>Dölj kalorier i appen</span>
            </label>
          </section>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-2">
        <Button size="lg" className="h-14 rounded-md text-base" onClick={next}>
          {last ? "Skapa min plan" : "Fortsätt"}
        </Button>
        {(step === 0 || step === 2 || step === 5) && (
          <Button
            variant="ghost"
            className="h-12 rounded-full"
            onClick={() => {
              if (step === 2) set({ level: undefined });
              if (step === 5) { completeOnboarding({ ...p, diet: undefined, restrictions: [] }); return; }
              next();
            }}
          >
            Hoppa över
          </Button>
        )}
      </div>
    </div>
  );
}
