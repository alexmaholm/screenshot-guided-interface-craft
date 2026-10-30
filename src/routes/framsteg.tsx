import { DietaryPreferences } from "@/components/DietaryPreferences";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, NeedsOnboarding, PageLoading } from "@/components/AppShell";
import { SundayReport } from "@/components/SundayReport";
import { StrengthProgress } from "@/components/StrengthProgress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addDays, dateKey, prettyDate, resetAll, update, useBalans, weekdayIndex, WEEKDAYS } from "@/lib/balans";
import { streakInfo } from "@/lib/habits";

export const Route = createFileRoute("/framsteg")({
  head: () => ({
    meta: [
      { title: "Framsteg – Balans" },
      { name: "description", content: "Veckosammanfattning av pass, måltider och vanor – med fokus på kontinuitet." },
      { property: "og:title", content: "Framsteg – Balans" },
      { property: "og:description", content: "Se din vecka med träning, mat och vanor." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  const s = useBalans();
  return <AppShell>{!s ? <PageLoading /> : !s.profile ? <NeedsOnboarding /> : <Progress />}</AppShell>;
}

function Progress() {
  const s = useBalans()!;
  const p = s.profile!;
  const today = dateKey();
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));
  const workoutsDone = s.workouts.filter((w) => days.includes(w.date) && w.status === "klart");
  const planned = s.workouts.filter((w) => days.includes(w.date));
  const mealDays = days.filter((d) => s.meals.some((m) => m.date === d)).length;
  const waterAvg = days.reduce((a, d) => a + (s.habits[d]?.water ?? 0), 0) / 7;
  const sleeps = days.map((d) => s.habits[d]?.sleepH).filter(Boolean) as number[];
  const sleepAvg = sleeps.length ? sleeps.reduce((a, b) => a + b, 0) / sleeps.length : 0;
  const maxMeals = 4;
  const [weight, setWeight] = useState("");
  const [showBody, setShowBody] = useState(s.body.length > 0);

  const { streak, restDays } = streakInfo(s, today, addDays);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-3xl font-bold">Framsteg</h1>
        <p className="text-muted-foreground">Senaste 7 dagarna. Kontinuitet slår perfektion.</p>
      </header>

      <section className="bg-hero rounded-3xl p-6 text-primary-foreground">
        <p className="text-sm opacity-80">Aktiva dagar i rad</p>
        <p className="font-display text-5xl font-bold">{streak}</p>
        <p className="mt-1 text-sm">{streak >= 3 ? "Du bygger en fin rutin." : "Varje dag är en ny chans – inga krav."}{restDays ? ` ${restDays} vilodag${restDays > 1 ? "ar" : ""} ingår – vila är också framsteg.` : ""}</p>
      </section>

      <SundayReport workouts={s.workouts} days={days} restDays={restDays} streak={streak} waterAvg={waterAvg} mealDays={mealDays} />

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Box label="Genomförda pass" value={`${workoutsDone.length}/${planned.length || 0}`} />
        <Box label="Dagar med matlogg" value={`${mealDays}/7`} />
        <Box label="Vatten snitt" value={`${waterAvg.toFixed(1)} glas`} />
        <Box label="Sömn snitt" value={sleepAvg ? `${sleepAvg.toFixed(1)} h` : "–"} />
      </section>

      <StrengthProgress workouts={s.workouts} />

      <section className="card-soft p-5">
        <h2 className="text-lg font-semibold">Måltider per dag</h2>
        <div className="mt-4 flex h-40 items-end gap-2" role="img" aria-label="Stapeldiagram över loggade måltider per dag">
          {days.map((d) => {
            const n = new Set(s.meals.filter((m) => m.date === d).map((m) => m.type)).size;
            const w = s.workouts.find((x) => x.date === d && x.status === "klart");
            return (
              <div key={d} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex w-full flex-1 items-end">
                  <div className="w-full rounded-t-xl bg-mint" style={{ height: `${Math.max(6, (n / maxMeals) * 100)}%` }} title={`${n} måltider`} />
                </div>
                <div className={`h-2.5 w-2.5 rounded-full ${w ? "bg-coral" : "bg-muted"}`} title={w ? "Pass klart" : "Inget pass"} />
                <span className="text-xs text-muted-foreground">{WEEKDAYS[weekdayIndex(d)]}</span>
              </div>
            );
          })}
        </div>
        <p className="mt-3 flex gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-mint" /> Måltider</span>
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-coral" /> Pass klart</span>
        </p>
      </section>

      <section className="card-soft p-5">
        <h2 className="text-lg font-semibold">Genomförda pass</h2>
        {workoutsDone.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Inga pass loggade den här veckan än.</p>
        ) : (
          <ul className="mt-2 divide-y">
            {workoutsDone.map((w) => (
              <li key={w.id} className="flex justify-between py-3">
                <span><span className="font-medium">{w.title}</span><span className="block text-sm capitalize text-muted-foreground">{prettyDate(w.date)}</span></span>
                <span className="text-sm text-muted-foreground">{w.feeling ? ["Tungt", "Utmanande", "Lagom", "Bra", "Superbra"][w.feeling - 1] : ""}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

    </div>
  );
}

function Box({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-soft p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}
