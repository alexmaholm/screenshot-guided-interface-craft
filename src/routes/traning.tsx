import { RecoveryMeals } from "@/components/RecoveryMeals";
import { ExercisePicker, useExerciseLibrary } from "@/components/ExercisePicker";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Check, Clock, RefreshCw, CalendarDays, Plus, Play, ArrowLeft, Timer } from "lucide-react";
import { toast } from "sonner";
import { AppShell, NeedsOnboarding, PageLoading } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { improvements, lastWeight } from "@/lib/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  addDays, dateKey, generateWorkout, KIND_LABEL, prettyDate, update, useBalans, weekdayIndex, WEEKDAYS,
  type Workout, type WorkoutKind,
} from "@/lib/balans";
import { MUSCLES, muscleRecovery, recoveryStatus } from "@/lib/exercises";

export const Route = createFileRoute("/traning")({
  validateSearch: (s: Record<string, unknown>): { starta?: string | undefined } => ({
    starta: typeof s["starta"] === "string" ? s["starta"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Träning – Balans" },
      { name: "description", content: "Personliga pass för styrka, kondition och rörlighet – flytta, byt och bocka av." },
      { property: "og:title", content: "Träning – Balans" },
      { property: "og:description", content: "Träningspass anpassade efter mål, nivå och utrustning." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TrainingPage,
});

function TrainingPage() {
  const s = useBalans();
  return <AppShell>{!s ? <PageLoading /> : !s.profile ? <NeedsOnboarding /> : <Training />}</AppShell>;
}

const fmt = (sec: number) => (sec >= 60 ? `${Math.round(sec / 60)} min` : `${sec} s`);

function Training() {
  const s = useBalans()!;
  const p = s.profile!;
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/traning" });
  const today = dateKey();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [moving, setMoving] = useState<Workout | null>(null);

  useEffect(() => {
    if (search.starta) setActiveId(search.starta);
  }, [search]);

  const monday = addDays(today, -weekdayIndex(today));
  const week = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const upcoming = s.workouts.filter((w) => w.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  const active = s.workouts.find((w) => w.id === activeId);

  const patch = (id: string, fn: (w: Workout) => Workout) =>
    update((st) => ({ ...st, workouts: st.workouts.map((w) => (w.id === id ? fn(w) : w)) }));
  const swap = (w: Workout) => {
    const n = generateWorkout({ kind: w.kind, level: p.level ?? "nybörjare", equipment: p.equipment, minutes: w.durationMin, date: w.date });
    patch(w.id, () => ({ ...n, id: w.id }));
    toast("Nytt pass framtaget");
  };

  if (active) {
    return (
      <ActiveWorkout
        w={active}
        onBack={() => { setActiveId(null); navigate({ search: {}, replace: true }); }}
        onPatch={(fn) => patch(active.id, fn)}
      />
    );
  }

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between">
        <h1 className="text-3xl font-bold">Träning</h1>
        <Button className="h-12 rounded-full px-5" onClick={() => setCreating(true)}><Plus /> Nytt pass</Button>
      </header>

      <section className="card-soft p-4" aria-label="Veckan">
        <div className="grid grid-cols-7 gap-1 text-center">
          {week.map((d, i) => {
            const w = s.workouts.find((x) => x.date === d);
            return (
              <div key={d} className={`rounded-2xl py-2 ${d === today ? "bg-secondary" : ""}`}>
                <p className="text-xs text-muted-foreground">{WEEKDAYS[i]}</p>
                <p className="font-semibold">{Number(d.slice(8))}</p>
                <div className={`mx-auto mt-1 h-2.5 w-2.5 rounded-full ${w ? (w.status === "klart" ? "bg-primary" : "bg-coral") : "bg-muted"}`} aria-label={w ? `${KIND_LABEL[w.kind]}, ${w.status}` : "Inget pass"} />
              </div>
            );
          })}
        </div>
      </section>

      <RecoveryMeals profile={p} workout={[...s.workouts].reverse().find((w) => w.date === today && w.status === "klart" && w.kind !== "vila")} date={today} />
      <h2 className="text-lg font-semibold">Kommande pass</h2>
      {upcoming.length === 0 ? (
        <div className="card-soft p-6 text-center text-muted-foreground">Inga planerade pass. Skapa ett när det passar dig.</div>
      ) : (
        <ul className="space-y-3">
          {upcoming.map((w) => (
            <li key={w.id} className="card-soft p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm capitalize text-muted-foreground">{w.date === today ? "Idag" : prettyDate(w.date)}</p>
                  <h3 className="text-xl font-semibold">{w.title}</h3>
                  <p className="text-sm text-muted-foreground">{KIND_LABEL[w.kind]} · {w.durationMin} min · {w.exercises.length} moment</p>
                </div>
                {w.status === "klart" && <span className="rounded-full bg-secondary px-3 py-1 text-sm font-medium text-primary">Klart</span>}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button className="h-11 rounded-full" onClick={() => setActiveId(w.id)}><Play /> {w.status === "klart" ? "Visa" : "Starta"}</Button>
                <Button variant="outline" className="h-11 rounded-full" onClick={() => setMoving(w)}><CalendarDays /> Flytta</Button>
                {w.status !== "klart" && <Button variant="outline" className="h-11 rounded-full" onClick={() => swap(w)}><RefreshCw /> Byt pass</Button>}
              </div>
            </li>
          ))}
        </ul>
      )}

      <CreateDialog open={creating} onOpenChange={(o) => { setCreating(o); if (!o) navigate({ search: {}, replace: true }); }} onCreate={(w) => {
        update((st) => ({ ...st, workouts: [...st.workouts, w] }));
        setCreating(false);
        toast.success("Pass skapat");
      }} />

      <Dialog open={!!moving} onOpenChange={(o) => !o && setMoving(null)}>
        <DialogContent className="rounded-3xl">
          <DialogHeader><DialogTitle className="font-display text-2xl">Flytta pass</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 8 }, (_, i) => addDays(today, i)).map((d) => (
              <button key={d} className="chip justify-center capitalize" aria-pressed={moving?.date === d} onClick={() => {
                if (moving) patch(moving.id, (w) => ({ ...w, date: d }));
                setMoving(null);
                toast("Passet är flyttat");
              }}>
                {d === today ? "Idag" : prettyDate(d).split(" ").slice(0, 2).join(" ")}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CreateDialog({ open, onOpenChange, onCreate }: { open: boolean; onOpenChange: (o: boolean) => void; onCreate: (w: Workout) => void }) {
  const p = useBalans()!.profile!;
  const today = dateKey();
  const [kind, setKind] = useState<WorkoutKind>("styrka");
  const [min, setMin] = useState(p.sessionMin);
  const [date, setDate] = useState(today);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl">
        <DialogHeader><DialogTitle className="font-display text-2xl">Skapa pass</DialogTitle></DialogHeader>
        <p className="text-sm font-medium">Typ</p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(KIND_LABEL) as WorkoutKind[]).map((k) => (
            <button key={k} className="chip" aria-pressed={kind === k} onClick={() => setKind(k)}>{KIND_LABEL[k]}</button>
          ))}
        </div>
        {kind !== "vila" && (
          <>
            <p className="text-sm font-medium">Tid</p>
            <div className="flex flex-wrap gap-2">
              {[10, 15, 25, 40, 60].map((m) => (
                <button key={m} className="chip" aria-pressed={min === m} onClick={() => setMin(m)}>{m} min</button>
              ))}
            </div>
          </>
        )}
        <p className="text-sm font-medium">Dag</p>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 7 }, (_, i) => addDays(today, i)).map((d) => (
            <button key={d} className="chip" aria-pressed={date === d} onClick={() => setDate(d)}>{d === today ? "Idag" : WEEKDAYS[weekdayIndex(d)]}</button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Anpassas efter din nivå och utrustning: {p.equipment.join(", ")}.</p>
        <Button className="h-12 rounded-full" onClick={() => onCreate(generateWorkout({ kind, level: p.level ?? "nybörjare", equipment: p.equipment, minutes: min, date }))}>
          Skapa pass
        </Button>
      </DialogContent>
    </Dialog>
  );
}

function ActiveWorkout({ w, onBack, onPatch }: { w: Workout; onBack: () => void; onPatch: (fn: (w: Workout) => Workout) => void }) {
  const all = useBalans()?.workouts ?? [];
  const [feeling, setFeeling] = useState(w.feeling);
  const [note, setNote] = useState(w.note ?? "");
  const done = w.exercises.filter((e) => e.done).length;
  const toggle = (i: number) => onPatch((x) => ({ ...x, exercises: x.exercises.map((e, j) => (j === i ? { ...e, done: !e.done } : e)) }));
  const setKg = (i: number, v: string) => {
    const n = v === "" ? undefined : Number(v.replace(",", "."));
    if (n !== undefined && (!Number.isFinite(n) || n < 0)) return;
    onPatch((x) => ({ ...x, exercises: x.exercises.map((e, j) => (j === i ? { ...e, weightKg: n } : e)) }));
  };
  const finish = () => {
    const ups = improvements(w, all);
    onPatch((x) => ({ ...x, status: "klart", feeling, note }));
    if (ups.length) ups.forEach((u) => toast.success(`Nytt framsteg! +${u.diffKg} kg i ${u.name.toLowerCase()} sedan förra passet 🎉`));
    else toast.success("Passet är loggat – bra jobbat!");
    onBack();
  };
  return (
    <div className="space-y-5">
      <button onClick={onBack} className="flex min-h-11 items-center gap-2 font-medium text-primary"><ArrowLeft className="h-5 w-5" /> Alla pass</button>
      <header className="bg-hero rounded-3xl p-6 text-primary-foreground">
        <p className="text-sm opacity-80">{KIND_LABEL[w.kind]} · {w.durationMin} min</p>
        <h1 className="text-3xl font-bold">{w.title}</h1>
        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-primary-foreground/20">
          <div className="h-full rounded-full bg-coral transition-all" style={{ width: `${(done / w.exercises.length) * 100}%` }} />
        </div>
        <p className="mt-2 text-sm">{done} av {w.exercises.length} klara</p>
      </header>
      <ul className="space-y-3">
        {w.exercises.map((e, i) => {
          const prev = lastWeight(e.name, w.id, all);
          return (
          <li key={i} className="card-soft p-4">
            <button onClick={() => toggle(i)} aria-pressed={e.done} className="flex min-h-12 w-full items-center gap-4 text-left">
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 ${e.done ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
                {e.done && <Check className="h-5 w-5" />}
              </span>
              <span className="flex-1">
                <span className={`block font-semibold ${e.done ? "line-through opacity-60" : ""}`}>{e.name}</span>
                <span className="text-sm text-muted-foreground">
                  {e.sets ? `${e.sets} set × ` : ""}{e.reps ? `${e.reps} reps` : e.timeSec ? fmt(e.timeSec) : ""}
                  {e.restSec ? <> · <Clock className="inline h-3.5 w-3.5" aria-hidden /> vila {fmt(e.restSec)}</> : null}
                </span>
              </span>
            </button>
            {e.reps ? (
              <div className="mt-3 flex items-center gap-2 pl-14">
                <Input aria-label={`Vikt för ${e.name}, kg`} type="number" inputMode="decimal" min={0} step={0.5} placeholder="Vikt" className="h-10 w-24" value={e.weightKg ?? ""} onChange={(ev) => setKg(i, ev.target.value)} />
                <span className="text-sm text-muted-foreground">kg{prev ? ` · förra passet ${prev} kg` : ""}</span>
              </div>
            ) : null}
          </li>
          );
        })}
      </ul>
      <section className="card-soft space-y-3 p-5">
        <h2 className="text-lg font-semibold">Hur kändes det?</h2>
        <div className="flex flex-wrap gap-2">
          {["Tungt", "Utmanande", "Lagom", "Bra", "Superbra"].map((l, i) => (
            <button key={l} className="chip" aria-pressed={feeling === i + 1} onClick={() => setFeeling(i + 1)}>{l}</button>
          ))}
        </div>
        <Textarea className="rounded-2xl" placeholder="Anteckning (valfritt)" value={note} onChange={(e) => setNote(e.target.value)} aria-label="Anteckning" />
        <Button className="h-12 w-full rounded-full" onClick={finish}>{w.status === "klart" ? "Spara ändringar" : "Avsluta och logga pass"}</Button>
      </section>
    </div>
  );
}
