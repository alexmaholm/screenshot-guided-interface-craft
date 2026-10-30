import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, NeedsOnboarding, PageLoading } from "@/components/AppShell";
import { DietaryPreferences } from "@/components/DietaryPreferences";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { dateKey, NUTRITION_FOCUS, nutritionFocusOf, resetAll, update, useBalans, WEEKDAYS, type Profile } from "@/lib/balans";

export const Route = createFileRoute("/installningar")({
  head: () => ({
    meta: [
      { title: "Inställningar – Balans" },
      { name: "description", content: "Ändra fokus, vikt, kostval, träningsdagar och villkor i Balans." },
      { property: "og:title", content: "Inställningar – Balans" },
      { property: "og:description", content: "Anpassa Balans efter dig." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const s = useBalans();
  return <AppShell>{!s ? <PageLoading /> : !s.profile ? <NeedsOnboarding /> : <Settings />}</AppShell>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="card-soft space-y-4 p-5"><h2 className="font-semibold">{title}</h2>{children}</section>;
}

function Settings() {
  const s = useBalans()!;
  const p = s.profile!;
  const latest = [...s.body].sort((a, b) => a.date.localeCompare(b.date)).at(-1);
  const [weight, setWeight] = useState(latest ? String(latest.weight) : "");
  const set = (patch: Partial<Profile>) => update((st) => (st.profile ? { ...st, profile: { ...st.profile, ...patch } } : st));
  const focus = nutritionFocusOf(p);

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-2">
        <Link to="/profil" aria-label="Tillbaka till profil" className="flex h-12 w-12 items-center justify-center rounded-full bg-muted"><ChevronLeft className="h-5 w-5" aria-hidden /></Link>
        <h1 className="text-3xl font-bold">Inställningar</h1>
      </header>

      <Section title="Ditt fokus">
        <div className="flex flex-wrap gap-2">
          {NUTRITION_FOCUS.map((f) => (
            <Button key={f.value} variant="outline" className="chip" aria-pressed={focus === f.value} onClick={() => set({ nutritionFocus: f.value })}>{f.label}</Button>
          ))}
        </div>
      </Section>

      <Section title="Kroppsvikt">
        <form className="flex gap-2" onSubmit={(e) => {
          e.preventDefault();
          const v = Number(weight.replace(",", "."));
          if (!(v >= 30 && v <= 300)) { toast.error("Ange en vikt mellan 30 och 300 kg"); return; }
          const today = dateKey();
          update((st) => ({ ...st, body: [...st.body.filter((b) => b.date !== today), { date: today, weight: v }] }));
          toast.success("Vikten är sparad");
        }}>
          <Input aria-label="Vikt i kilo" inputMode="decimal" placeholder="Kilo" className="h-12 rounded-xl" value={weight} onChange={(e) => setWeight(e.target.value)} />
          <Button type="submit" className="h-12 rounded-full">Spara</Button>
        </form>
      </Section>

      <Section title="Kostval & allergier">
        <DietaryPreferences profile={p} onChange={set} />
      </Section>

      <Section title="Träningsdagar">
        <div className="grid grid-cols-7 gap-1">
          {WEEKDAYS.map((d, i) => (
            <button key={d} type="button" aria-pressed={p.days.includes(i)} onClick={() => set({ days: p.days.includes(i) ? p.days.filter((x) => x !== i) : [...p.days, i].sort() })} className="h-11 rounded-xl border text-sm aria-pressed:border-primary aria-pressed:bg-secondary aria-pressed:text-primary">{d}</button>
          ))}
        </div>
        <label className="flex items-center justify-between gap-3 text-sm">Passlängd (minuter)
          <Input type="number" min={10} max={120} className="h-11 w-24 rounded-xl" value={p.sessionMin} onChange={(e) => set({ sessionMin: Math.min(120, Math.max(10, Number(e.target.value) || 30)) })} />
        </label>
      </Section>

      <Section title="Upplevelse">
        <label className="flex items-center justify-between gap-3 text-sm">Dölj kalorier
          <Switch checked={p.hideCalories} onCheckedChange={(v) => set({ hideCalories: v })} />
        </label>
        <label className="flex items-center justify-between gap-3 text-sm">Vattenmål (glas/dag)
          <Input type="number" min={1} max={20} className="h-11 w-24 rounded-xl" value={p.waterGoal} onChange={(e) => set({ waterGoal: Math.min(20, Math.max(1, Number(e.target.value) || 1)) })} />
        </label>
      </Section>

      <Section title="Konto">
        <p className="text-sm text-muted-foreground">Din data sparas just nu på den här enheten. Inloggning med Apple och Google kommer inför lansering.</p>
      </Section>

      <Section title="Villkor & integritet">
        <details className="text-sm"><summary className="cursor-pointer font-medium">Medicinsk friskrivning</summary><p className="mt-2 text-muted-foreground">Balans ger generell inspiration för livsstil och träning – inte medicinsk rådgivning, diagnos eller behandling. Rådfråga vården vid skador, sjukdom eller graviditet.</p></details>
        <details className="text-sm"><summary className="cursor-pointer font-medium">Integritet</summary><p className="mt-2 text-muted-foreground">Din data lagras lokalt på enheten. Bilder som analyseras med AI sparas inte permanent.</p></details>
        <details className="text-sm"><summary className="cursor-pointer font-medium">Användarvillkor</summary><p className="mt-2 text-muted-foreground">AI-genererade förslag och näringsvärden är uppskattningar. Kontrollera alltid märkning och allergener.</p></details>
      </Section>

      <Button variant="outline" className="h-12 w-full rounded-full" onClick={() => { if (confirm("Börja om? All din data raderas.")) resetAll(); }}>Radera all data</Button>
    </div>
  );
}
