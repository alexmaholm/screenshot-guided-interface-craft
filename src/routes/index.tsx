import { RecoveryMeals } from "@/components/RecoveryMeals";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Droplets, Dumbbell, Plus, Play, ChevronRight } from "lucide-react";
import { greetingFor } from "@/lib/greeting";
import { AppShell, PageLoading } from "@/components/AppShell";
import { StartScreen } from "@/components/StartScreen";
import { dateKey, GLASS_ML, KIND_LABEL, macroTargets, prettyDate, sumMacros, update, useBalans } from "@/lib/balans";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Balans – mat, träning och återhämtning" },
      { name: "description", content: "Planera och följ mat, träning och vila på ett ställe – enkelt och utan pekpinnar." },
      { property: "og:title", content: "Balans – mat, träning och återhämtning" },
      { property: "og:description", content: "Din dag med mat, träning och vila samlat på ett ställe." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const s = useBalans();
  if (!s) return <div className="p-6"><PageLoading /></div>;
  if (!s.profile) return <StartScreen />;
  return (
    <AppShell>
      <Today />
    </AppShell>
  );
}

function Today() {
  const s = useBalans();
  const [greeting, setGreeting] = useState<string | null>(null);
  useEffect(() => {
    const tick = () => setGreeting(greetingFor(new Date().getHours()));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);
  const p = s?.profile;
  if (!s || !p) return null;
  const today = dateKey();
  const meals = s.meals.filter((m) => m.date === today);
  const workout = s.workouts.find((w) => w.date === today);
  const h = s.habits[today] ?? { water: 0 };
  const setWater = (water: number) =>
    update((st) => ({ ...st, habits: { ...st.habits, [today]: { ...h, water: Math.max(0, water) } } }));
  const target = macroTargets(p, s.body.at(-1)?.weight);
  const eaten = sumMacros(meals);
  const kcalLeft = Math.max(0, target.kcal - eaten.kcal);
  const kcalPct = Math.min(100, Math.round((eaten.kcal / Math.max(1, target.kcal)) * 100));
  const waterL = (h.water * GLASS_ML) / 1000;
  const waterGoalL = (p.waterGoal * GLASS_ML) / 1000;
  const doneEx = workout?.exercises.filter((e) => e.done).length ?? 0;
  const finished = [...s.workouts].reverse().find((w) => w.date === today && w.status === "klart" && w.kind !== "vila");
  const fmt = (n: number, d = 1) => n.toLocaleString("sv-SE", { minimumFractionDigits: d, maximumFractionDigits: d });

  return (
    <div className="space-y-4">
      <header className="pt-4 pb-2">
        <p className="label-xs telemetry">{prettyDate(today)}</p>
        <h1 className="mt-2 text-[2rem] font-semibold leading-[1.05] tracking-[-0.03em]">
          <span className="text-muted-foreground">{greeting ?? "\u00a0"}{greeting && p.name ? "," : ""}</span>
          {p.name && <><br />{p.name}</>}
        </h1>
      </header>

      <section className="panel p-5" aria-label="Energi idag">
        <div className="flex items-start justify-between">
          <div>
            <p className="label-xs">Kvar idag</p>
            <p className="telemetry mt-1 text-5xl font-semibold">{kcalLeft.toLocaleString("sv-SE")}<span className="ml-1 text-base font-normal text-muted-foreground">kcal</span></p>
          </div>
          <p className="telemetry text-sm text-muted-foreground">{kcalPct}%</p>
        </div>
        <div className="mt-4 h-px w-full bg-border">
          <div className="h-px bg-primary glow-primary transition-all" style={{ width: `${kcalPct}%` }} />
        </div>
        <dl className="mt-5 grid grid-cols-3 gap-4">
          {([["Protein", eaten.protein, target.protein], ["Kolhydrater", eaten.carbs, target.carbs], ["Fett", eaten.fat, target.fat]] as const).map(([l, v, t]) => (
            <div key={l}>
              <dt className="label-xs">{l}</dt>
              <dd className="telemetry mt-1 text-lg">{v}<span className="text-muted-foreground">/{t}g</span></dd>
              <div className="mt-2 h-px bg-border"><div className="h-px bg-foreground/70" style={{ width: `${Math.min(100, (v / Math.max(1, t)) * 100)}%` }} /></div>
            </div>
          ))}
        </dl>
      </section>

      <section className="panel p-5" aria-label="Dagens pass">
        <div className="flex items-center justify-between">
          <p className="label-xs">Dagens uppdrag</p>
          {workout && <p className="telemetry text-xs text-muted-foreground">{doneEx}/{workout.exercises.length}</p>}
        </div>
        <h2 className="mt-2 text-xl font-semibold tracking-tight">{workout ? workout.title : "Ingen träning planerad"}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {workout ? `${KIND_LABEL[workout.kind]} · ${workout.durationMin} min · ${workout.exercises.length} moment` : "Vilodag – eller logga ett eget pass."}
        </p>
        <Link
          to="/traning"
          search={{ starta: workout?.id }}
          className="mt-4 flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary font-semibold text-primary-foreground glow-primary"
        >
          {workout ? <Play className="h-4 w-4" aria-hidden /> : <Dumbbell className="h-4 w-4" aria-hidden />}
          {workout ? (workout.status === "klart" ? "Visa pass" : "Starta pass") : "Logga pass"}
        </Link>
      </section>

      <RecoveryMeals profile={p} workout={finished} date={today} />

      <section className="panel p-5" aria-label="Vätska">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-muted-foreground" aria-hidden />
            <p className="label-xs">Vätska</p>
          </div>
          <p className="telemetry text-sm">{fmt(waterL)}<span className="text-muted-foreground"> / {fmt(waterGoalL)} L</span></p>
        </div>
        <div className="mt-3 h-px bg-border"><div className="h-px bg-chart-3" style={{ width: `${Math.min(100, (h.water / Math.max(1, p.waterGoal)) * 100)}%` }} /></div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <button onClick={() => setWater(h.water - 1)} className="min-h-11 rounded-lg border telemetry text-sm text-muted-foreground" aria-label="Ta bort ett glas">−250</button>
          <button onClick={() => setWater(h.water + 1)} className="min-h-11 rounded-lg border telemetry text-sm">+250 ml</button>
          <button onClick={() => setWater(h.water + 2)} className="min-h-11 rounded-lg border telemetry text-sm">+500 ml</button>
        </div>
      </section>

      <Link to="/mat" search={{ ny: true }} className="panel flex min-h-14 items-center justify-between px-5 transition-colors active:bg-muted">
        <span className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-md border"><Plus className="h-4 w-4 text-primary" aria-hidden /></span>
          <span className="text-sm font-medium">Logga måltid</span>
        </span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />
      </Link>
    </div>
  );
}
