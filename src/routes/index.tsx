import { RecoveryMeals } from "@/components/RecoveryMeals";
import { WaterTracker } from "@/components/WaterTracker";
import { DailyHabits } from "@/components/DailyHabits";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Droplets, Moon, Utensils, Dumbbell, Sparkles, Plus, Play } from "lucide-react";
import { AppShell, PageLoading } from "@/components/AppShell";
import { Onboarding } from "@/components/Onboarding";
import { dateKey, dayTip, KIND_LABEL, MEAL_LABEL, MEAL_TYPES, prettyDate, update, useBalans } from "@/lib/balans";

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
  if (!s.profile) return <Onboarding />;
  return (
    <AppShell>
      <Today />
    </AppShell>
  );
}

function Today() {
  const s = useBalans();
  const p = s?.profile;
  if (!s || !p) return null;
  const today = dateKey();
  const meals = s.meals.filter((m) => m.date === today);
  const workout = s.workouts.find((w) => w.date === today);
  const h = s.habits[today] ?? { water: 0 };
  const setHabit = (patch: Partial<typeof h>) =>
    update((st) => ({ ...st, habits: { ...st.habits, [today]: { ...h, ...patch } } }));
  const loggedTypes = new Set(meals.map((m) => m.type));
  const doneEx = workout?.exercises.filter((e) => e.done).length ?? 0;
  const hour = new Date().getHours();
  const greet = hour < 10 ? "God morgon" : hour < 17 ? "Hej" : "God kväll";

  return (
    <div className="space-y-5">
      <header>
        <p className="text-sm capitalize text-muted-foreground">{prettyDate(today)}</p>
        <h1 className="text-3xl font-bold">{greet}{p.name ? `, ${p.name}` : ""}</h1>
      </header>

      <section className="bg-hero rounded-3xl p-6 text-primary-foreground shadow-[var(--shadow-soft)]">
        <p className="text-sm opacity-80">Dagens pass</p>
        {workout ? (
          <>
            <h2 className="mt-1 text-2xl font-bold">{workout.title}</h2>
            <p className="mt-1 opacity-90">
              {KIND_LABEL[workout.kind]} · {workout.durationMin} min · {workout.exercises.length} moment
            </p>
            <p className="mt-3 text-sm">
              {workout.status === "klart" ? "Klart – fint jobbat! 🌿" : doneEx ? `${doneEx} av ${workout.exercises.length} moment klara` : "Redo när du är det."}
            </p>
          </>
        ) : (
          <>
            <h2 className="mt-1 text-2xl font-bold">Ingen träning planerad</h2>
            <p className="mt-1 opacity-90">Njut av dagen, eller lägg till ett kort pass.</p>
          </>
        )}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Link to="/mat" search={{ ny: true }} className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-card font-semibold text-primary">
            <Utensils className="h-5 w-5" aria-hidden /> Logga mat
          </Link>
          <Link to="/traning" search={{ starta: workout?.id }} className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-coral font-semibold text-coral-foreground">
            {workout ? <Play className="h-5 w-5" aria-hidden /> : <Dumbbell className="h-5 w-5" aria-hidden />}
            {workout ? (workout.status === "klart" ? "Visa pass" : "Starta pass") : "Logga pass"}
          </Link>
        </div>
      </section>

      <RecoveryMeals profile={p} workout={[...s.workouts].reverse().find((w) => w.date === today && w.status === "klart" && w.kind !== "vila")} date={today} />

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Måltider" value={`${loggedTypes.size}/4`} icon={<Utensils className="h-5 w-5" />} />
        <Stat label="Rörelse" value={workout?.status === "klart" ? "Klart" : workout ? "Planerat" : "Fri dag"} icon={<Dumbbell className="h-5 w-5" />} />
        <Stat label="Vatten" value={`${h.water}/${p.waterGoal} glas`} icon={<Droplets className="h-5 w-5" />} />
        <Stat label="Sömn" value={h.sleepH ? `${h.sleepH} h` : "–"} icon={<Moon className="h-5 w-5" />} />
      </section>

      <WaterTracker date={today} />
      <DailyHabits date={today} />

      <section className="card-soft p-5">
        <h2 className="text-lg font-semibold">Återhämtning</h2>
        <p className="text-sm text-muted-foreground">Hur känns kroppen idag?</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {["Trött", "Seg", "Okej", "Pigg", "Toppen"].map((l, i) => (
            <button key={l} className="chip" aria-pressed={h.recovery === i + 1} onClick={() => setHabit({ recovery: i + 1 })}>
              {l}
            </button>
          ))}
        </div>
      </section>

      <section className="card-soft p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Dagens måltider</h2>
          <Link to="/mat" className="text-sm font-semibold text-primary underline-offset-4 hover:underline">Visa alla</Link>
        </div>
        <ul className="mt-3 divide-y">
          {MEAL_TYPES.map((t) => {
            const list = meals.filter((m) => m.type === t);
            return (
              <li key={t} className="flex min-h-14 items-center justify-between gap-3 py-2">
                <div>
                  <p className="font-medium">{MEAL_LABEL[t]}</p>
                  <p className="text-sm text-muted-foreground">{list.length ? list.map((m) => m.name).join(", ") : "Inte loggat än"}</p>
                </div>
                <Link to="/mat" search={{ ny: true, typ: t }} aria-label={`Lägg till ${MEAL_LABEL[t]}`} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-secondary text-primary">
                  <Plus className="h-5 w-5" />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="flex gap-3 rounded-3xl bg-sand p-5">
        <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-coral" aria-hidden />
        <div>
          <h2 className="font-semibold">Dagens tips</h2>
          <p className="mt-1 text-sm">{dayTip(workout, meals)}</p>
          <p className="mt-2 text-xs text-muted-foreground">Generella råd – inte medicinsk eller individuell kostrådgivning.</p>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="card-soft p-4">
      <div className="text-primary" aria-hidden>{icon}</div>
      <p className="mt-2 text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
