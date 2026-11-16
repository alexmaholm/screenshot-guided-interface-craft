import { useState } from "react";
import { RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KIND_LABEL, macroTargets, recoveryGuide, sumMacros, useBalans, type Profile, type Workout } from "@/lib/balans";

/** Post-workout guide: which nutrients to prioritise now and good sources, adapted to the day. */
export function RecoveryMeals({ profile, workout, date }: { profile: Profile; workout: Workout | undefined; date: string }) {
  const s = useBalans();
  const [shuffle, setShuffle] = useState(0);
  if (!s || !workout) return null;
  const items = recoveryGuide({
    profile, workout, shuffle,
    eaten: sumMacros(s.meals.filter((m) => m.date === date)),
    target: macroTargets(profile, s.body.at(-1)?.weight),
    hour: new Date().getHours(),
    waterGlasses: s.habits[date]?.water ?? 0,
  });
  if (!items.length) return null;
  return (
    <section className="space-y-4 border-y py-5" aria-label="Återhämtning efter träningen">
      <div className="flex items-start gap-3">
        <Sparkles className="mt-1 h-5 w-5 shrink-0 text-coral" aria-hidden />
        <div className="flex-1">
          <h2 className="text-xl font-semibold">Vad kroppen behöver nu</h2>
          <p className="mt-1 text-sm text-muted-foreground">{KIND_LABEL[workout.kind]} · {workout.durationMin} min · {workout.title}</p>
        </div>
        <Button variant="outline" size="icon" className="h-11 w-11 shrink-0 rounded-md" aria-label="Nya förslag på källor" title="Nya förslag" onClick={() => setShuffle((n) => n + 1)}>
          <RefreshCw className="h-5 w-5" />
        </Button>
      </div>
      <ul className="divide-y">
        {items.map((it) => (
          <li key={it.key} className="py-3">
            <h3 className="text-base font-semibold">{it.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{it.why}</p>
            {it.sources.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {it.sources.map((src) => <span key={src} className="rounded-full bg-muted px-3 py-1 text-xs">{src}</span>)}
              </div>
            )}
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground">Allmänna råd anpassade efter ditt pass och din dag – inte ett medicinskt kostschema.</p>
    </section>
  );
}
