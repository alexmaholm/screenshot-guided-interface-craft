import { useEffect, useState } from "react";
import { Minus, Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExercisePicker } from "@/components/ExercisePicker";
import { KIND_LABEL, uid, update, type Exercise, type WorkoutKind } from "@/lib/balans";
import type { WorkoutTemplate } from "@/lib/templates";

function Stepper({ label, value, onChange, step = 1, min = 1, max = 99, suffix }: { label: string; value: number; onChange: (n: number) => void; step?: number; min?: number; max?: number; suffix?: string }) {
  const set = (n: number) => onChange(Math.max(min, Math.min(max, n)));
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1">
        <button type="button" aria-label={`Minska ${label}`} className="grid h-8 w-8 place-items-center rounded-full border border-border" onClick={() => set(value - step)}><Minus className="h-3.5 w-3.5" /></button>
        <span className="min-w-10 text-center text-sm font-semibold tabular-nums">{value}{suffix}</span>
        <button type="button" aria-label={`Öka ${label}`} className="grid h-8 w-8 place-items-center rounded-full border border-border" onClick={() => set(value + step)}><Plus className="h-3.5 w-3.5" /></button>
      </div>
    </div>
  );
}

export function TemplateBuilder({ open, onOpenChange, initial }: { open: boolean; onOpenChange: (o: boolean) => void; initial?: WorkoutTemplate | null }) {
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<WorkoutKind>("styrka");
  const [min, setMin] = useState(45);
  const [exs, setExs] = useState<Exercise[]>([]);
  const [picking, setPicking] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle(initial?.title ?? "");
    setKind(initial?.kind ?? "styrka");
    setMin(initial?.durationMin ?? 45);
    setExs(initial?.exercises.map((e) => ({ ...e, log: undefined, done: false })) ?? []);
  }, [open, initial]);

  const patch = (i: number, p: Partial<Exercise>) => setExs((l) => l.map((e, j) => (j === i ? { ...e, ...p } : e)));
  const move = (i: number, d: number) => setExs((l) => { const n = [...l]; const j = i + d; if (j < 0 || j >= n.length) return l; [n[i], n[j]] = [n[j]!, n[i]!]; return n; });

  const save = () => {
    const name = title.trim();
    if (!name) { toast.error("Ge mallen ett namn"); return; }
    if (!exs.length) { toast.error("Lägg till minst en övning"); return; }
    const t: WorkoutTemplate = { id: initial?.custom ? initial.id : uid(), title: name, kind, durationMin: min, exercises: exs, custom: true };
    update((x) => {
      const list = x.templates ?? [];
      return { ...x, templates: list.some((y) => y.id === t.id) ? list.map((y) => (y.id === t.id ? t : y)) : [...list, t] };
    });
    toast.success(initial?.custom ? "Mallen uppdaterad" : "Mallen sparad under Mina mallar");
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[85dvh] overflow-y-auto rounded-3xl">
          <DialogHeader><DialogTitle className="font-display text-2xl">{initial?.custom ? "Redigera mall" : "Ny mall"}</DialogTitle></DialogHeader>
          <Input aria-label="Mallens namn" placeholder="T.ex. Push – tung dag" value={title} onChange={(e) => setTitle(e.target.value)} className="h-12 text-base" />
          <div className="flex flex-wrap gap-2">
            {(Object.keys(KIND_LABEL) as WorkoutKind[]).filter((k) => k !== "vila").map((k) => (
              <button key={k} className="chip" aria-pressed={kind === k} onClick={() => setKind(k)}>{KIND_LABEL[k]}</button>
            ))}
          </div>
          <div className="flex justify-start"><Stepper label="Tid" value={min} onChange={setMin} step={5} min={5} max={240} suffix=" min" /></div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Övningar · {exs.length}</p>
          <ul className="space-y-2">
            {exs.map((e, i) => (
              <li key={`${e.name}-${i}`} className="card-soft space-y-3 p-3">
                <div className="flex items-center gap-1">
                  <span className="flex-1 font-semibold">{i + 1}. {e.name}</span>
                  <button aria-label="Flytta upp" className="grid h-9 w-9 place-items-center text-muted-foreground disabled:opacity-30" disabled={i === 0} onClick={() => move(i, -1)}><ChevronUp className="h-4 w-4" /></button>
                  <button aria-label="Flytta ner" className="grid h-9 w-9 place-items-center text-muted-foreground disabled:opacity-30" disabled={i === exs.length - 1} onClick={() => move(i, 1)}><ChevronDown className="h-4 w-4" /></button>
                  <button aria-label={`Ta bort ${e.name}`} className="grid h-9 w-9 place-items-center text-muted-foreground" onClick={() => setExs((l) => l.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></button>
                </div>
                <div className="flex flex-wrap justify-between gap-2">
                  <Stepper label="Set" value={e.sets ?? 3} onChange={(n) => patch(i, { sets: n })} max={20} />
                  {e.timeSec != null
                    ? <Stepper label="Tid" value={e.timeSec} onChange={(n) => patch(i, { timeSec: n })} step={5} min={5} max={600} suffix="s" />
                    : <Stepper label="Reps" value={e.reps ?? 10} onChange={(n) => patch(i, { reps: n })} max={100} />}
                  <Stepper label="Vila" value={e.restSec} onChange={(n) => patch(i, { restSec: n })} step={15} min={0} max={600} suffix="s" />
                </div>
              </li>
            ))}
          </ul>
          <Button variant="outline" className="h-12 w-full rounded-full" onClick={() => setPicking(true)}><Plus /> Lägg till övning</Button>
          <Button className="h-12 w-full rounded-full" onClick={save}>Spara mall</Button>
        </DialogContent>
      </Dialog>
      <ExercisePicker open={picking} onOpenChange={setPicking} onPick={(ex) => {
        setExs((l) => [...l, ex.track === "tid"
          ? { name: ex.name, sets: 2, timeSec: 40, restSec: ex.restSec, done: false }
          : { name: ex.name, sets: 3, reps: 10, restSec: ex.restSec, done: false }]);
      }} />
    </>
  );
}
