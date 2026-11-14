import { DietaryPreferences } from "@/components/DietaryPreferences";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, NeedsOnboarding, PageLoading } from "@/components/AppShell";
import { SundayReport } from "@/components/SundayReport";
import { StrengthProgress } from "@/components/StrengthProgress";
import { DailyHabits } from "@/components/DailyHabits";
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
      <header className="pt-2">
        <p className="label-xs telemetry">Veckoöversikt · 7 dagar</p>
        <h1 className="mt-2 text-[2rem] font-semibold leading-[1.05] tracking-[-0.03em]">Framsteg</h1>
      </header>

      <section className="panel p-5" aria-label="Aktiva dagar i rad">
        <p className="label-xs">Aktiva dagar i rad</p>
        <p className="telemetry mt-2 text-6xl font-semibold leading-none tracking-[-0.04em]">{streak}<span className="ml-2 text-base font-normal text-muted-foreground">{streak === 1 ? "dag" : "dagar"}</span></p>
        <div className="mt-4 h-px w-full bg-border"><div className="glow-primary h-px bg-primary" style={{ width: `${Math.min(100, (streak / 7) * 100)}%` }} /></div>
        <p className="mt-3 text-sm text-muted-foreground">{streak >= 3 ? "Rutinen sitter." : "Varje dag är en ny start."}{restDays ? ` ${restDays} vilodag${restDays > 1 ? "ar" : ""} ingår – vila räknas.` : ""}</p>
      </section>

      <section className="panel grid grid-cols-4 divide-x divide-border">
        <Box label="Pass" value={planned.length ? `${workoutsDone.length}/${planned.length}` : `${workoutsDone.length}`} />
        <Box label="Matlogg" value={`${mealDays}/7`} />
        <Box label="Vatten" value={waterAvg.toFixed(1)} unit="glas" />
        <Box label="Sömn" value={sleepAvg ? sleepAvg.toFixed(1) : "–"} unit={sleepAvg ? "h" : undefined} />
      </section>

      <SundayReport workouts={s.workouts} days={days} restDays={restDays} streak={streak} waterAvg={waterAvg} mealDays={mealDays} />

      <StrengthProgress workouts={s.workouts} />

      <section className="panel p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="label-xs">Veckomatris</h2>
          <p className="label-xs flex gap-3"><span className="flex items-center gap-1.5"><span className="h-2 w-2 bg-foreground/70" /> Måltider</span><span className="flex items-center gap-1.5"><span className="h-2 w-2 bg-primary" /> Pass</span></p>
        </div>
        <div className="mt-5 flex h-36 items-end gap-2" role="img" aria-label="Loggade måltider och pass per dag">
          {days.map((d) => {
            const n = new Set(s.meals.filter((m) => m.date === d).map((m) => m.type)).size;
            const w = s.workouts.find((x) => x.date === d && x.status === "klart");
            return (
              <div key={d} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full flex-1 items-end border-b border-border">
                  <div className={`w-full ${d === today ? "bg-foreground" : "bg-foreground/40"}`} style={{ height: `${Math.max(3, (n / maxMeals) * 100)}%` }} title={`${n} måltider`} />
                </div>
                <div className={`h-1 w-full ${w ? "glow-primary bg-primary" : "bg-border"}`} title={w ? "Pass klart" : "Inget pass"} />
                <span className={`telemetry text-[10px] uppercase ${d === today ? "text-foreground" : "text-muted-foreground"}`}>{WEEKDAYS[weekdayIndex(d)]}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="panel p-5">
        <h2 className="label-xs">Genomförda pass</h2>
        {workoutsDone.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">–</p>
        ) : (
          <ul className="mt-2 divide-y divide-border">
            {workoutsDone.map((w) => (
              <li key={w.id} className="flex items-center justify-between py-3">
                <span><span className="font-medium">{w.title}</span><span className="label-xs telemetry mt-0.5 block">{prettyDate(w.date)}</span></span>
                <span className="label-xs">{w.feeling ? ["Tungt", "Utmanande", "Lagom", "Bra", "Superbra"][w.feeling - 1] : ""}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <DailyHabits date={today} />
    </div>
  );
}

function Box({ label, value, unit }: { label: string; value: string; unit?: string | undefined }) {
  return (
    <div className="px-3 py-4">
      <p className="label-xs">{label}</p>
      <p className="telemetry mt-1.5 text-lg font-semibold">{value}{unit && <span className="ml-0.5 text-[10px] font-normal text-muted-foreground">{unit}</span>}</p>
    </div>
  );
}
