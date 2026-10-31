import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Camera, Loader2, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { analyzePlate } from "@/lib/photo.functions";
import { plateMicros, plateTotals, scaleItem, type PlateItem, type PlateQuestion } from "@/lib/photolog";

type Saved = { name: string; amount: string; kcal: number; protein: number; carbs: number; fat: number; fiber?: number; sugar?: number; satFat?: number; salt?: number };

async function shrink(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
    const max = 1024, s = Math.min(1, max / Math.max(img.width, img.height));
    const c = document.createElement("canvas");
    c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", 0.82);
  } finally { URL.revokeObjectURL(url); }
}

export function PhotoLog({ diet, showKcal, onSave }: { diet?: string | undefined; showKcal: boolean; onSave: (m: Saved) => void }) {
  const analyze = useServerFn(analyzePlate);
  const fileRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [items, setItems] = useState<PlateItem[] | null>(null);
  const [questions, setQuestions] = useState<PlateQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<{ question: string; answer: string }[]>([]);
  const [newName, setNewName] = useState("");

  const run = async (img: string, prev: { question: string; answer: string }[]) => {
    setBusy(true); setError("");
    try {
      const r = await analyze({ data: { image: img, answers: prev, diet } });
      if (!r.ok) { setError(r.error); return; }
      setTitle(r.result.title);
      setItems(r.result.items.map((i) => ({ ...i, grams: Math.round(i.grams), kcal: Math.round(i.kcal) })));
      setQuestions(r.result.questions);
      setAnswers({});
    } catch { setError("Kunde inte analysera bilden. Försök igen."); }
    finally { setBusy(false); }
  };

  const pick = async (f: File | undefined) => {
    if (!f) return;
    const img = await shrink(f);
    setImage(img); setItems(null); setHistory([]);
    run(img, []);
  };

  const submitAnswers = () => {
    const next = [...history, ...questions.map((q) => ({ question: q.question, answer: answers[q.id]?.trim() || "Vet ej" }))];
    setHistory(next); setQuestions([]);
    if (image) run(image, next);
  };

  const setGrams = (idx: number, g: number) => setItems((l) => l && l.map((it, i) => (i === idx ? scaleItem(it, g) : it)));
  const total = items ? plateTotals(items) : null;

  return (
    <div className="space-y-3">
      <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} />
      {!image ? (
        <button onClick={() => fileRef.current?.click()} className="flex min-h-32 w-full flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-primary/40 bg-secondary/50 p-4 text-primary">
          <Camera className="h-8 w-8" />
          <span className="font-semibold">Fota din tallrik</span>
          <span className="text-xs text-muted-foreground">AI räknar ut näringen – du kan justera innan du sparar</span>
        </button>
      ) : (
        <div className="flex items-center gap-3">
          <img src={image} alt="Din måltid" className="h-20 w-20 rounded-2xl object-cover" />
          <div className="flex-1">
            {busy ? <p className="flex items-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" /> Analyserar tallriken…</p> : <Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-11 rounded-xl font-medium" aria-label="Namn på måltiden" />}
          </div>
          <Button variant="ghost" size="icon" aria-label="Ta ny bild" onClick={() => fileRef.current?.click()}><Camera /></Button>
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {items && !busy && (
        <>
          <ul className="max-h-64 space-y-2 overflow-y-auto">
            {items.map((it, i) => (
              <li key={i} className="rounded-2xl bg-muted px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{it.name}</span>
                  <button aria-label={`Ta bort ${it.name}`} onClick={() => setItems(items.filter((_, j) => j !== i))} className="grid h-9 w-9 place-items-center rounded-full hover:bg-secondary"><Trash2 className="h-4 w-4" /></button>
                </div>
                <div className="flex items-center gap-2">
                  <button aria-label="Minska 20 g" onClick={() => setGrams(i, it.grams - 20)} className="grid h-9 w-9 place-items-center rounded-full bg-card"><Minus className="h-4 w-4" /></button>
                  <Input inputMode="numeric" value={it.grams} onChange={(e) => setGrams(i, Number(e.target.value.replace(/\D/g, "")) || 0)} className="h-9 w-20 rounded-xl text-center" aria-label={`Gram ${it.name}`} />
                  <span className="text-sm">g</span>
                  <button aria-label="Öka 20 g" onClick={() => setGrams(i, it.grams + 20)} className="grid h-9 w-9 place-items-center rounded-full bg-card"><Plus className="h-4 w-4" /></button>
                  <span className="ml-auto text-xs text-muted-foreground">{it.protein}P · {it.carbs}K · {it.fat}F{showKcal ? ` · ${it.kcal} kcal` : ""}</span>
                </div>
              </li>
            ))}
          </ul>
          <form className="flex gap-2" onSubmit={(e) => {
            e.preventDefault();
            if (!newName.trim() || !image) return;
            const next = [...history, { question: "Användaren lade till", answer: newName.trim() }];
            setHistory(next); setNewName(""); run(image, next);
          }}>
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Saknas något? T.ex. 1 msk smör" className="h-11 rounded-xl" />
            <Button type="submit" variant="secondary" className="h-11 rounded-full">Lägg till</Button>
          </form>
          {total && (
            <p className="text-sm text-muted-foreground">Totalt {total.grams} g · {total.protein} g P · {total.carbs} g K · {total.fat} g F{showKcal ? ` · ${total.kcal} kcal` : ""}</p>
          )}
          <Button className="h-12 w-full rounded-full" disabled={items.length === 0} onClick={() => total && onSave({ name: title.trim() || "Måltid", amount: `${total.grams} g (foto)`, kcal: total.kcal, protein: total.protein, carbs: total.carbs, fat: total.fat, ...plateMicros(items) })}>Spara måltid</Button>
          <p className="text-xs text-muted-foreground">Uppskattning från bild – justera vid behov.</p>
        </>
      )}

      <Dialog open={questions.length > 0 && !busy} onOpenChange={(o) => { if (!o) setQuestions([]); }}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Hjälp oss räkna rätt</DialogTitle>
            <DialogDescription>Det här kunde AI inte se säkert på bilden. Fyll i så blir näringen mer exakt.</DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] space-y-4 overflow-y-auto">
            {questions.map((q) => (
              <div key={q.id} className="space-y-2">
                <p className="font-medium">{q.question}</p>
                <div className="flex flex-wrap gap-2">
                  {q.options.map((o) => (
                    <button key={o} className="chip" aria-pressed={answers[q.id] === o} onClick={() => setAnswers({ ...answers, [q.id]: o })}>{o}</button>
                  ))}
                </div>
                <Input value={q.options.includes(answers[q.id] ?? "") ? "" : (answers[q.id] ?? "")} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} placeholder="Eller skriv själv" className="h-11 rounded-xl" />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" className="h-12 flex-1 rounded-full" onClick={() => setQuestions([])}>Hoppa över</Button>
            <Button className="h-12 flex-1 rounded-full" onClick={submitAnswers}>Räkna om</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
