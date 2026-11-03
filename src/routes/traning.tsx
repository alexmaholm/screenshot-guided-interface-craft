import { DecimalInput } from "@/components/DecimalInput";
import { ProGate } from "@/components/Paywall";
import { RecoveryMeals } from "@/components/RecoveryMeals";
import { ExercisePicker, useExerciseLibrary } from "@/components/ExercisePicker";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Check, Clock, RefreshCw, CalendarDays, Plus, Minus, X, Play, ArrowLeft, Timer, Dumbbell, Info, Bookmark, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell, NeedsOnboarding, PageLoading } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { changeSetCount, improvements, lastSets, lastWeight, nextSetType, prevSetText, setLabels, setRows, withRows } from "@/lib/progress";
import { VoiceLog } from "@/components/VoiceLog";
import type { VoiceCommand } from "@/lib/voice";
import type { SetType } from "@/lib/balans";
import type { Exercise } from "@/lib/balans";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  addDays, dateKey, generateWorkout, uid, KIND_LABEL, prettyDate, update, useBalans, weekdayIndex, WEEKDAYS,
  type Workout, type WorkoutKind,
} from "@/lib/balans";
import { MuscleMap } from "@/components/MuscleMap";
import { TechniqueCoach } from "@/components/TechniqueCoach";
import { EXERCISES, isDumbbell, totalLoadKg } from "@/lib/exercises";
import { BUILT_IN_TEMPLATES, templateFromWorkout, workoutFromTemplate } from "@/lib/templates";

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
const SET_TYPE_NAME: Record<SetType, string> = { normal: "arbetsset", warmup: "uppvärmning", drop: "dropset", failure: "till failure" };
const SET_TYPE_CLASS: Record<SetType, string> = {
  normal: "bg-secondary text-foreground",
  warmup: "bg-amber text-coral-foreground",
  drop: "bg-primary text-primary-foreground",
  failure: "bg-coral text-coral-foreground",
};

function Training() {
  const s = useBalans()!;
  const p = s.profile!;
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/traning" });
  const today = dateKey();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [browsing, setBrowsing] = useState(false);
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

      <ProGate title="Muskelkarta"><MuscleMap workouts={s.workouts} today={today} /></ProGate>

      <Button variant="outline" className="h-12 w-full rounded-full" onClick={() => setBrowsing(true)}><Dumbbell /> Övningsbank</Button>
      <ExercisePicker open={browsing} onOpenChange={setBrowsing} onPick={(ex) => toast(`${ex.name} – lägg till den när du startar ett pass`)} />

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
        if (w.exercises.length === 0 && w.kind !== "vila") { setActiveId(w.id); toast.success("Tomt pass skapat – välj dina övningar"); }
        else toast.success("Pass skapat");
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
  const [blank, setBlank] = useState(false);
  const [mode, setMode] = useState<"forslag" | "blankt" | "mall">("forslag");
  const mine = useBalans()!.templates ?? [];
  const create = () => {
    if (blank && kind !== "vila") {
      onCreate({ id: uid(), date, title: "Mitt eget pass", kind, durationMin: min, exercises: [], status: "planerat" });
    } else onCreate(generateWorkout({ kind, level: p.level ?? "nybörjare", equipment: p.equipment, minutes: min, date }));
  };
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
            <MinutesInput value={min} onChange={setMin} />
          </>
        )}
        <p className="text-sm font-medium">Dag</p>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 7 }, (_, i) => addDays(today, i)).map((d) => (
            <button key={d} className="chip" aria-pressed={date === d} onClick={() => setDate(d)}>{d === today ? "Idag" : WEEKDAYS[weekdayIndex(d)]}</button>
          ))}
        </div>
        {kind !== "vila" && (
          <>
            <p className="text-sm font-medium">Hur vill du börja?</p>
            <div className="grid grid-cols-3 gap-2">
              {([["forslag", "Förslag", "Valt åt dig"], ["mall", "Mall", "Färdigt upplägg"], ["blankt", "Blankt", "Välj själv"]] as const).map(([m, t, d]) => (
                <button key={m} className="chip flex-col items-start rounded-2xl! py-3! text-left" aria-pressed={mode === m} onClick={() => { setMode(m); setBlank(m === "blankt"); }}>
                  <span className="font-semibold">{t}</span><span className="text-xs opacity-80">{d}</span>
                </button>
              ))}
            </div>
          </>
        )}
        {kind !== "vila" && mode === "mall" ? (
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {mine.length > 0 && <p className="text-xs font-semibold uppercase text-muted-foreground">Mina mallar</p>}
            {mine.map((t) => (
              <div key={t.id} className="flex items-center gap-2">
                <button className="card-soft flex-1 p-3 text-left" onClick={() => onCreate(workoutFromTemplate(t, date))}>
                  <span className="block font-semibold">{t.title}</span><span className="text-xs text-muted-foreground">{t.exercises.length} övningar · {t.durationMin} min</span>
                </button>
                <button aria-label={`Ta bort mallen ${t.title}`} className="grid h-11 w-11 place-items-center text-muted-foreground" onClick={() => update((x) => ({ ...x, templates: (x.templates ?? []).filter((y) => y.id !== t.id) }))}><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
            <p className="text-xs font-semibold uppercase text-muted-foreground">Färdiga mallar</p>
            {BUILT_IN_TEMPLATES.map((t) => (
              <button key={t.id} className="card-soft block w-full p-3 text-left" onClick={() => onCreate(workoutFromTemplate(t, date))}>
                <span className="block font-semibold">{t.title}</span><span className="text-xs text-muted-foreground">{t.exercises.map((e) => e.name).join(" · ")}</span>
              </button>
            ))}
          </div>
        ) : (
          <>
        <p className="text-xs text-muted-foreground">{blank ? "Du får smarta förslag efter ditt fokus när du lägger till övningar." : `Anpassas efter din nivå och utrustning: ${p.equipment.join(", ")}.`}</p>
        <Button className="h-12 rounded-full" onClick={create}>
          {blank && kind !== "vila" ? "Skapa och välj övningar" : "Skapa pass"}
        </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function RestTimer({ seconds, trigger = 0 }: { seconds: number; trigger?: number }) {
  const [left, setLeft] = useState<number | null>(null);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => () => { if (ref.current) clearInterval(ref.current); }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (trigger > 0) start(); }, [trigger]);
  const start = () => {
    if (ref.current) clearInterval(ref.current);
    setLeft(seconds);
    ref.current = setInterval(() => {
      setLeft((v) => {
        if (v === null || v <= 1) {
          if (ref.current) clearInterval(ref.current);
          if (v === 1) toast.success("Vilan är över – dags för nästa set! 💪");
          return null;
        }
        return v - 1;
      });
    }, 1000);
  };
  if (left === null)
    return <Button variant="outline" size="sm" className="h-9 rounded-full" onClick={start}><Timer className="h-4 w-4" /> Starta vila {fmt(seconds)}</Button>;
  return (
    <span className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-sm font-semibold text-primary" role="timer" aria-label="Vilotimer">
      <Timer className="h-4 w-4" aria-hidden /> {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}
      <button className="underline" onClick={() => { if (ref.current) clearInterval(ref.current); setLeft(null); }}>Avbryt</button>
    </span>
  );
}

function ActiveWorkout({ w, onBack, onPatch }: { w: Workout; onBack: () => void; onPatch: (fn: (w: Workout) => Workout) => void }) {
  const all = useBalans()?.workouts ?? [];
  const [feeling, setFeeling] = useState(w.feeling);
  const [note, setNote] = useState(w.note ?? "");
  const [picking, setPicking] = useState(w.exercises.length === 0 && w.status !== "klart");
  const done = w.exercises.filter((e) => e.done).length;
  const [restTrigger, setRestTrigger] = useState<Record<number, number>>({});
  const [demo, setDemo] = useState<string | null>(null);
  const demoEx = demo ? EXERCISES.find((x) => x.name === demo) : undefined;
  const saveTemplate = () => {
    if (!w.exercises.length) return;
    update((x) => ({ ...x, templates: [...(x.templates ?? []), templateFromWorkout(w)] }));
    toast.success("Sparat under Mina mallar");
  };
  const patchEx = (i: number, fn: (e: Exercise) => Exercise) => onPatch((x) => ({ ...x, exercises: x.exercises.map((e, j) => (j === i ? fn(e) : e)) }));
  const toggle = (i: number) => patchEx(i, (e) => { const d = !e.done; return withRows(e, setRows(e).map((r) => ({ ...r, done: d }))); });
  const toggleSet = (i: number, s: number) => {
    const row = setRows(w.exercises[i]!)[s];
    if (row && !row.done) setRestTrigger((t) => ({ ...t, [i]: (t[i] ?? 0) + 1 }));
    patchEx(i, (e) => withRows(e, setRows(e).map((r, k) => (k === s ? { ...r, done: !r.done } : r))));
  };
  const setRow = (i: number, s: number, field: "reps" | "timeSec" | "kg", v: string) => {
    const n = v === "" ? undefined : Number(v.replace(",", "."));
    if (n !== undefined && (!Number.isFinite(n) || n < 0)) return;
    patchEx(i, (e) => withRows(e, setRows(e).map((r, k) => (k === s ? { ...r, [field]: n } : r))));
  };
  const voice = (c: VoiceCommand): string | null => {
    const i = w.exercises.findIndex((e) => !e.done);
    if (i < 0) return "Alla övningar är klara";
    const rows = setRows(w.exercises[i]!);
    const s = rows.findIndex((r) => !r.done);
    if (s < 0) return null;
    if (c.done) setRestTrigger((t) => ({ ...t, [i]: (t[i] ?? 0) + 1 }));
    patchEx(i, (e) => withRows(e, setRows(e).map((r, k) => (k === s ? { ...r, ...(c.reps !== undefined ? { reps: c.reps } : {}), ...(c.kg !== undefined ? { kg: c.kg } : {}), done: c.done || r.done } : r))));
    return `${w.exercises[i]!.name} · set ${s + 1}${c.reps !== undefined ? ` · ${c.reps} reps` : ""}${c.kg !== undefined ? ` · ${c.kg} kg` : ""}${c.done ? " ✓" : ""}`;
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
      {w.status !== "klart" && w.exercises.length > 0 && <ProGate title="Röstloggning"><VoiceLog onCommand={voice} /></ProGate>}
      <button onClick={onBack} className="flex min-h-11 items-center gap-2 font-medium text-primary"><ArrowLeft className="h-5 w-5" /> Alla pass</button>
      <header className="bg-hero rounded-3xl p-6 text-primary-foreground">
        <p className="text-sm opacity-80">{KIND_LABEL[w.kind]}</p>
        <h1 className="text-3xl font-bold">{w.title}</h1>
        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-primary-foreground/20">
          <div className="h-full rounded-full bg-coral transition-all" style={{ width: `${(done / w.exercises.length) * 100}%` }} />
        </div>
        <p className="mt-2 text-sm">{done} av {w.exercises.length} klara</p>
      </header>
      <ul className="space-y-3">
        {w.exercises.map((e, i) => {
          const prev = lastWeight(e.name, w.id, all);
          const prevRows = lastSets(e.name, w.id, all);
          const rows = setRows(e);
          const labels = setLabels(rows);
          const timed = !e.reps && !!e.timeSec;
          return (
          <li key={i} className="card-soft p-4">
            <button onClick={() => toggle(i)} aria-pressed={e.done} className="flex min-h-12 w-full items-center gap-4 text-left">
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 ${e.done ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
                {e.done && <Check className="h-5 w-5" />}
              </span>
              <span className="flex-1">
                <span className={`block font-semibold ${e.done ? "line-through opacity-60" : ""}`}>{e.name}</span>
                <span className="text-sm text-muted-foreground">
                  {prev ? `Förra passet ${prev} kg` : null}
                  {e.restSec ? <>{prev ? " · " : ""}<Clock className="inline h-3.5 w-3.5" aria-hidden /> vila {fmt(e.restSec)}</> : null}
                </span>
              </span>
            </button>
            {EXERCISES.some((x) => x.name === e.name) && (
              <button onClick={() => setDemo(e.name)} className="mt-1 flex min-h-10 items-center gap-1.5 text-sm font-medium text-primary"><Info className="h-4 w-4" /> Se hur övningen går till</button>
            )}
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm font-medium">Antal set</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-10 w-10 rounded-full" aria-label="Ta bort set" disabled={rows.length <= 1} onClick={() => patchEx(i, (x) => changeSetCount(x, -1))}><Minus className="h-4 w-4" /></Button>
                <span className="w-6 text-center text-lg font-bold" aria-live="polite">{rows.length}</span>
                <Button variant="outline" size="icon" className="h-10 w-10 rounded-full" aria-label="Lägg till set" onClick={() => patchEx(i, (x) => changeSetCount(x, 1))}><Plus className="h-4 w-4" /></Button>
              </div>
            </div>
            <ol className="mt-3 space-y-2">
              {rows.map((r, s) => {
                const pt = prevSetText(prevRows?.[s]);
                return (
                <li key={s}>
                {pt && <p className="mb-0.5 pl-10 text-xs text-muted-foreground">Förra: {pt}</p>}
                <div className="flex items-center gap-2">
                  <button
                    aria-label={`Set ${s + 1}: ${SET_TYPE_NAME[r.type ?? "normal"]}. Tryck för att byta typ`}
                    onClick={() => patchEx(i, (x) => withRows(x, setRows(x).map((q, k) => (k === s ? { ...q, type: nextSetType(q.type) } : q))))}
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm font-bold transition-colors ${SET_TYPE_CLASS[r.type ?? "normal"]}`}
                  >{labels[s]}</button>
                  <Input aria-label={`${timed ? "Sekunder" : "Reps"} set ${s + 1}`} type="number" inputMode="numeric" min={0} className="h-10 w-16 px-2 text-center" value={(timed ? r.timeSec : r.reps) ?? ""} onChange={(ev) => setRow(i, s, timed ? "timeSec" : "reps", ev.target.value)} />
                  <span className="text-xs text-muted-foreground">{timed ? "sek" : "reps"}</span>
                  {!timed && (
                    <>
                      <button aria-label={`Minska vikt set ${s + 1}`} onClick={() => setRow(i, s, "kg", String(Math.max(0, (r.kg ?? 0) - 2.5)))} className="grid h-10 w-7 place-items-center rounded-full border border-border text-lg leading-none">−</button>
                      <DecimalInput aria-label={`Vikt set ${s + 1}, kg`} placeholder="–" className="h-10 w-14 px-1 text-center" value={r.kg} onValue={(n) => setRow(i, s, "kg", n === undefined ? "" : String(n))} />
                      <button aria-label={`Öka vikt set ${s + 1}`} onClick={() => setRow(i, s, "kg", String((r.kg ?? 0) + 2.5))} className="grid h-10 w-7 place-items-center rounded-full border border-border text-lg leading-none">+</button>
                      <span className="text-xs leading-tight text-muted-foreground">{isDumbbell(e.name) ? <>kg/hantel{r.kg ? <><br />= {totalLoadKg(e.name, r.kg)} kg</> : null}</> : "kg"}</span>
                    </>
                  )}
                  <button aria-label={`Set ${s + 1} klart`} aria-pressed={r.done} onClick={() => toggleSet(i, s)} className={`ml-auto grid h-10 w-10 place-items-center rounded-full border-2 ${r.done ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}><Check className="h-4 w-4" /></button>
                  <button aria-label={`Ta bort set ${s + 1}`} disabled={rows.length <= 1} onClick={() => patchEx(i, (x) => withRows(x, setRows(x).filter((_, k) => k !== s)))} className="grid h-10 w-8 place-items-center text-muted-foreground disabled:opacity-30"><X className="h-4 w-4" /></button>
                </div>
                </li>
                );
              })}
            </ol>
            {e.restSec > 0 ? <div className="mt-3"><RestTimer seconds={e.restSec} trigger={restTrigger[i] ?? 0} /></div> : null}
          </li>
          );
        })}
      </ul>
      <Button variant="outline" className="h-12 w-full rounded-full" onClick={() => setPicking(true)}><Plus /> Lägg till övning</Button>
      <Button variant="ghost" className="h-11 w-full rounded-full" disabled={!w.exercises.length} onClick={saveTemplate}><Bookmark /> Spara som mall</Button>
      <Dialog open={!!demoEx} onOpenChange={(o) => !o && setDemo(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl">
          {demoEx && (
            <>
              <DialogHeader><DialogTitle className="font-display text-2xl">{demoEx.name}</DialogTitle></DialogHeader>
              <TechniqueCoach ex={demoEx} />
            </>
          )}
        </DialogContent>
      </Dialog>
      <ExercisePicker open={picking} onOpenChange={setPicking} onPick={(ex) => {
        const last = lastWeight(ex.name, w.id, all);
        onPatch((x) => ({
          ...x,
          exercises: [...x.exercises, ex.track === "tid"
            ? { name: ex.name, sets: 2, timeSec: 40, restSec: ex.restSec, done: false }
            : { name: ex.name, sets: 3, reps: 10, restSec: ex.restSec, done: false, weightKg: ex.track === "vikt" ? last : undefined }],
        }));
        toast.success(`${ex.name} tillagd i passet`);
      }} />
      <section className="card-soft space-y-3 p-5">
        <p className="text-sm font-medium">Hur länge tränade du?</p>
        <MinutesInput value={w.durationMin} onChange={(m) => onPatch((x) => ({ ...x, durationMin: m }))} />
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

function MinutesInput({ value, onChange }: { value: number; onChange: (m: number) => void }) {
  const set = (n: number) => onChange(Math.max(1, Math.min(600, Math.round(n))));
  return (
    <div className="flex items-center gap-2">
      <Button type="button" variant="outline" size="icon" className="h-11 w-11 rounded-full" aria-label="Minska tid" onClick={() => set(value - 5)}><Minus className="h-4 w-4" /></Button>
      <Input aria-label="Tid i minuter" type="number" inputMode="numeric" min={1} max={600} className="h-11 w-20 text-center text-lg font-semibold" value={value || ""}
        onChange={(e) => { const n = Number(e.target.value); if (e.target.value === "") onChange(0); else if (Number.isFinite(n)) set(n); }}
        onBlur={() => { if (!value) set(1); }} />
      <span className="text-sm text-muted-foreground">min</span>
      <Button type="button" variant="outline" size="icon" className="h-11 w-11 rounded-full" aria-label="Öka tid" onClick={() => set(value + 5)}><Plus className="h-4 w-4" /></Button>
    </div>
  );
}
