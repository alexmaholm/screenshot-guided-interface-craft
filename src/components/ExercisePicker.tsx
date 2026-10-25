import { ExerciseDemo } from "@/components/ExerciseDemo";
import { useMemo, useState } from "react";
import { Plus, Search, Info } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { dateKey, uid, update, useBalans, type CustomExercise, type Equipment } from "@/lib/balans";
import { EXERCISES, FOCUSES, MUSCLES, muscleRecovery, recommendExercises, searchExercises, type TrainingFocus, type ExercisePreset, type Muscle, type TrackType } from "@/lib/exercises";

const EQ_LABEL: Record<Equipment, string> = { ingen: "Kroppsvikt", hantlar: "Hantlar", gummiband: "Gummiband", gym: "Gym", kettlebell: "Kettlebell" };
const TRACK_LABEL: Record<TrackType, string> = { vikt: "Vikt + reps", reps: "Reps", tid: "Tid" };

function toPreset(c: CustomExercise): ExercisePreset {
  return {
    id: c.id, name: c.name, nameEn: "", muscle: (MUSCLES.some((m) => m.value === c.muscle) ? c.muscle : "helkropp") as Muscle,
    eq: c.equipment, track: c.track, desc: c.note || "Din egen övning.", tips: c.note ? [c.note] : [], restSec: 60, custom: true,
  };
}

export function useExerciseLibrary(): ExercisePreset[] {
  const s = useBalans();
  return useMemo(() => [...EXERCISES, ...(s?.customExercises ?? []).map(toPreset)], [s?.customExercises]);
}

export function ExercisePicker({ open, onOpenChange, onPick }: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onPick: (e: ExercisePreset) => void;
}) {
  const s = useBalans()!;
  const p = s.profile!;
  const all = useExerciseLibrary();
  const [q, setQ] = useState("");
  const [muscle, setMuscle] = useState<Muscle | undefined>();
  const [detail, setDetail] = useState<ExercisePreset | null>(null);
  const [creating, setCreating] = useState(false);
  const [smart, setSmart] = useState(true);
  const [wishes, setWishes] = useState(p.trainingWishes ?? "");
  const rec = useMemo(() => muscleRecovery(s.workouts, dateKey()), [s.workouts]);
  const filtered = useMemo(() => searchExercises(all, q, muscle, p.equipment), [all, q, muscle, p.equipment]);
  const results = useMemo(() => (smart ? recommendExercises(filtered, p.trainingFocus, wishes, rec) : filtered), [smart, filtered, p.trainingFocus, wishes, rec]);
  const setFocus = (f: TrainingFocus) => update((st) => ({ ...st, profile: st.profile ? { ...st.profile, trainingFocus: st.profile.trainingFocus === f ? undefined : f } : st.profile }));
  const saveWishes = () => update((st) => ({ ...st, profile: st.profile ? { ...st.profile, trainingWishes: wishes.trim() || undefined } : st.profile }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col overflow-y-auto rounded-3xl">
        <DialogHeader><DialogTitle className="font-display text-2xl">Välj övning</DialogTitle></DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input className="h-12 rounded-2xl pl-9" placeholder="Sök bland 100+ övningar…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Sök övning" />
        </div>
        <div className="flex gap-2">
          <button className="chip flex-1 justify-center" aria-pressed={smart} onClick={() => setSmart(true)}>Passar dig</button>
          <button className="chip flex-1 justify-center" aria-pressed={!smart} onClick={() => setSmart(false)}>Alla övningar</button>
        </div>
        {smart && (
          <div className="space-y-2 rounded-2xl bg-secondary p-3">
            <p className="text-sm font-semibold text-primary">Vad vill du uppnå?</p>
            <div className="flex flex-wrap gap-2">
              {FOCUSES.map((f) => <button key={f.value} className="chip" aria-pressed={p.trainingFocus === f.value} onClick={() => setFocus(f.value)}>{f.label}</button>)}
            </div>
            <Input className="h-11 rounded-2xl bg-background" placeholder="Egna önskemål, t.ex. rygg och axlar, skonsamt för knäna" value={wishes} onChange={(e) => setWishes(e.target.value)} onBlur={saveWishes} aria-label="Egna önskemål" />
            <p className="text-xs text-muted-foreground">Vi väljer övningar efter ditt fokus, dina önskemål, din utrustning och vilka muskler som är utvilade.</p>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <button className="chip" aria-pressed={!muscle} onClick={() => setMuscle(undefined)}>Alla</button>
          {MUSCLES.map((m) => (
            <button key={m.value} className="chip" aria-pressed={muscle === m.value} onClick={() => setMuscle(muscle === m.value ? undefined : m.value)}>{m.label}</button>
          ))}
        </div>
        <Button variant="outline" className="h-11 rounded-full" onClick={() => setCreating(true)}><Plus /> Skapa egen övning</Button>
        <ul className="-mx-1 space-y-2 px-1" aria-label="Övningslista">
          {results.length === 0 && <li className="py-6 text-center text-sm text-muted-foreground">Inga övningar matchar – prova ett annat sökord eller skapa en egen.</li>}
          {results.map((e) => (
            <li key={e.id} className="card-soft flex items-center gap-2 p-3">
              <button className="min-h-11 flex-1 text-left" onClick={() => { onPick(e); onOpenChange(false); }}>
                <span className="block font-semibold">{e.name}</span>
                <span className="text-xs text-muted-foreground">
                  {MUSCLES.find((m) => m.value === e.muscle)?.label} · {e.eq.map((x) => EQ_LABEL[x]).join("/")} · {TRACK_LABEL[e.track]}
                  {e.custom ? " · Egen övning" : ""}
                </span>
              </button>
              <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0" aria-label={`Info om ${e.name}`} onClick={() => setDetail(e)}><Info className="h-4 w-4" /></Button>
            </li>
          ))}
        </ul>

        <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
          <DialogContent className="rounded-3xl">
            <DialogHeader><DialogTitle className="font-display text-2xl">{detail?.name}</DialogTitle></DialogHeader>
            {detail && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">{detail.nameEn ? `${detail.nameEn} · ` : ""}{MUSCLES.find((m) => m.value === detail.muscle)?.label}</p>
                {!detail.custom && <ExerciseDemo ex={detail} className="mx-auto h-40 w-40" />}
                <p className="text-sm">{detail.desc}</p>
                {detail.tips.length > 0 && (
                  <div className="rounded-2xl bg-secondary p-4">
                    <p className="text-sm font-semibold text-primary">Tänk på</p>
                    <ul className="mt-1 list-inside list-disc text-sm">{detail.tips.map((t) => <li key={t}>{t}</li>)}</ul>
                  </div>
                )}
                <Button className="h-12 w-full rounded-full" onClick={() => { onPick(detail); setDetail(null); onOpenChange(false); }}>Lägg till i passet</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <CustomExerciseDialog open={creating} onOpenChange={setCreating} />
      </DialogContent>
    </Dialog>
  );
}

function CustomExerciseDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [name, setName] = useState("");
  const [muscle, setMuscle] = useState<Muscle>("helkropp");
  const [eq, setEq] = useState<Equipment[]>(["ingen"]);
  const [track, setTrack] = useState<TrackType>("vikt");
  const [note, setNote] = useState("");
  const toggleEq = (v: Equipment) => setEq((a) => (a.includes(v) ? a.filter((x) => x !== v) : [...a, v]));
  const save = () => {
    if (!name.trim()) { toast.error("Ge övningen ett namn"); return; }
    const ex: CustomExercise = { id: uid(), name: name.trim(), muscle, equipment: eq.length ? eq : ["ingen"], track, note: note.trim() || undefined };
    update((st) => ({ ...st, customExercises: [...st.customExercises, ex] }));
    toast.success("Övning sparad");
    setName(""); setNote(""); onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl">
        <DialogHeader><DialogTitle className="font-display text-2xl">Egen övning</DialogTitle></DialogHeader>
        <Input className="h-12 rounded-2xl" placeholder="Namn, t.ex. Min favoritövning" value={name} onChange={(e) => setName(e.target.value)} aria-label="Övningens namn" />
        <p className="text-sm font-medium">Muskelgrupp</p>
        <div className="flex flex-wrap gap-2">
          {MUSCLES.map((m) => <button key={m.value} className="chip" aria-pressed={muscle === m.value} onClick={() => setMuscle(m.value)}>{m.label}</button>)}
        </div>
        <p className="text-sm font-medium">Utrustning</p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(EQ_LABEL) as Equipment[]).map((v) => <button key={v} className="chip" aria-pressed={eq.includes(v)} onClick={() => toggleEq(v)}>{EQ_LABEL[v]}</button>)}
        </div>
        <p className="text-sm font-medium">Hur loggar du den?</p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(TRACK_LABEL) as TrackType[]).map((t) => <button key={t} className="chip" aria-pressed={track === t} onClick={() => setTrack(t)}>{TRACK_LABEL[t]}</button>)}
        </div>
        <Input className="h-12 rounded-2xl" placeholder="Anteckning / tips (valfritt)" value={note} onChange={(e) => setNote(e.target.value)} aria-label="Anteckning" />
        <Button className="h-12 rounded-full" onClick={save}>Spara övning</Button>
      </DialogContent>
    </Dialog>
  );
}
