import { DecimalInput } from "@/components/DecimalInput";
import { Apple, Check, Flame, Leaf, Minus, Moon, Plus, Sparkles, Utensils, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addDays, update, useBalans, type DayHabits } from "@/lib/balans";
import { habitSummary, PRODUCE_GOAL, SLEEP_GOAL, streakInfo } from "@/lib/habits";

export function DailyHabits({ date }: { date: string }) {
  const state = useBalans();
  if (!state?.profile) return null;
  const habits = state.habits[date] ?? { water: 0 };
  const { score, parts, mealCount } = habitSummary(habits, state.meals.filter((meal) => meal.date === date), state.profile);
  const { streak, restDays } = streakInfo(state, date, addDays);
  const setHabit = (patch: Partial<DayHabits>) => update((s) => ({
    ...s, habits: { ...s.habits, [date]: { ...(s.habits[date] ?? { water: 0 }), ...patch } },
  }));
  const rows = [
    { label: "Vatten", icon: Droplets, value: `${habits.water}/${state.profile.waterGoal} glas`, progress: parts.water },
    { label: "Frukt & grönt", icon: Apple, value: `${habits.produce ?? 0}/${PRODUCE_GOAL} portioner`, progress: parts.produce },
    { label: "Sömn", icon: Moon, value: `${habits.sleepH ?? "–"}/${SLEEP_GOAL} timmar`, progress: parts.sleep },
    { label: "Måltidsrytm", icon: Utensils, value: `${mealCount}/3 huvudmåltider`, progress: parts.meals },
  ];

  return (
    <section aria-label="Dagliga vanor" className="space-y-4 border-y py-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-primary"><Sparkles className="h-4 w-4" /> Små steg, varje dag</p>
          <h2 className="mt-1 text-xl font-semibold">Dina vanor</h2>
        </div>
        <div className="shrink-0 text-right" aria-live="polite">
          <p className="font-display text-3xl font-bold text-primary">{score}<span className="text-sm font-normal text-muted-foreground"> / 100</span></p>
          <p className="text-xs text-muted-foreground">Dagens hälsoscore</p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{score === 100 ? "Alla dagens riktmärken nådda. Fint jobbat!" : score >= 50 ? "Du har gett dagen en fin grund. Varje liten vana räknas." : "En ny dag, i din takt. Det du gör räknas – inte det som saknas."}</p>
      <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
        <Flame className="h-6 w-6 shrink-0 text-coral" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{streak} {streak === 1 ? "dag" : "dagar"} i rad</p>
          <p className="text-xs text-muted-foreground">{habits.restDay ? "Vila är också framsteg 🌿 Sviten lever." : restDays ? `Inklusive ${restDays} vilodag${restDays > 1 ? "ar" : ""} – vila räknas.` : "Logga mat, vanor eller träning – eller välj vila."}</p>
        </div>
        <Button size="sm" variant={habits.restDay ? "default" : "secondary"} className="shrink-0 rounded-full" aria-pressed={!!habits.restDay} onClick={() => setHabit({ restDay: !habits.restDay })}>
          <Leaf className="h-4 w-4" /> {habits.restDay ? "Vilodag" : "Vila idag"}
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {rows.map(({ label, icon: Icon, value, progress }) => (
          <div key={label} className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2"><Icon className="h-4 w-4 text-primary" /><h3 className="text-sm font-semibold">{label}</h3>{progress === 1 && <Check className="ml-auto h-4 w-4 text-primary" />}</div>
            <p className="mt-2 text-sm text-muted-foreground">{value}</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label={`${label}, vana`} aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full rounded-full bg-primary motion-safe:transition-all" style={{ width: `${progress * 100}%` }} />
            </div>
            {label === "Frukt & grönt" && <div className="mt-3 flex items-center justify-between gap-2">
              <Button variant="secondary" size="icon" className="h-10 w-10 rounded-full" aria-label="Ta bort en portion frukt och grönt" disabled={!habits.produce} onClick={() => setHabit({ produce: Math.max(0, (habits.produce ?? 0) - 1) })}><Minus /></Button>
              <span className="text-xs text-muted-foreground">Portioner</span>
              <Button size="icon" className="h-10 w-10 rounded-full" aria-label="Lägg till en portion frukt och grönt" onClick={() => setHabit({ produce: (habits.produce ?? 0) + 1 })}><Plus /></Button>
            </div>}
            {label === "Sömn" && <div className="mt-3 flex items-center gap-2">
              <DecimalInput aria-label="Sömn i natt, timmar" placeholder="Timmar" className="h-10" value={habits.sleepH} onValue={(value) => {
                if (value === undefined || value <= 24) setHabit({ sleepH: value });
              }} />
              <span className="text-sm text-muted-foreground">h</span>
            </div>}
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Scoren visar dina loggade vanor, inte en medicinsk bedömning. 5 portioner och 8 timmars sömn är generella riktmärken; dina behov kan skilja sig. Måltidsrytmen följer loggad frukost, lunch och middag.</p>
    </section>
  );
}