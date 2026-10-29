import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { askCoach } from "@/lib/coach.functions";
import { dateKey, macroTargets, nutritionFocusOf, NUTRITION_FOCUS, sumMacros, useBalans, type State } from "@/lib/balans";

const QUICK = [
  "Vad passar bra att äta nu för att nå mitt mål?",
  "Jag känner mig lite seg idag – hur borde jag träna?",
  "Hur ser min balans ut hittills idag?",
];

/** Compact summary of today's state sent to the coach. */
export function coachContext(s: State): string {
  const p = s.profile;
  if (!p) return "Ingen profil ännu.";
  const today = dateKey();
  const eaten = sumMacros(s.meals.filter((m) => m.date === today));
  const weight = s.body.at(-1)?.weight;
  const t = macroTargets(p, weight);
  const focus = NUTRITION_FOCUS.find((f) => f.value === nutritionFocusOf(p))?.label;
  const last = s.workouts.filter((w) => w.status === "klart").sort((a, b) => b.date.localeCompare(a.date))[0];
  return [
    `Fokus: ${focus}`,
    `Kost: ${p.diet ?? "allt"}; restriktioner: ${(p.restrictions ?? []).join(", ") || "inga"}`,
    `Idag ätit: ${eaten.kcal} kcal, ${eaten.protein} g protein, ${eaten.carbs} g kolhydrater, ${eaten.fat} g fett`,
    `Dagsmål: ${t.kcal} kcal, ${t.protein} g protein, ${t.carbs} g kolhydrater, ${t.fat} g fett`,
    p.hideCalories ? "Användaren vill inte se kalorier – nämn inte kcal." : "",
    last ? `Senaste pass: ${last.title} (${last.kind}) ${last.date}` : "Inga loggade pass ännu.",
    `Utrustning: ${p.equipment.join(", ") || "ingen"}`,
  ].filter(Boolean).join("\n");
}

export function AiCoach() {
  const s = useBalans();
  const ask = useServerFn(askCoach);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [suggest, setSuggest] = useState<string[]>(QUICK);
  const [chat, setChat] = useState<{ q: string; a: string; error?: boolean }[]>([]);
  if (!s?.profile) return null;

  async function send(question: string) {
    if (!s || busy || question.trim().length < 2) return;
    setBusy(true);
    setQ("");
    try {
      const r = await ask({ data: { question, context: coachContext(s) } });
      if (r.ok && r.followUps.length) setSuggest(r.followUps);
      setChat((c) => [...c, r.ok ? { q: question, a: r.answer } : { q: question, a: r.error, error: true }]);
    } catch {
      setChat((c) => [...c, { q: question, a: "Coachen kunde inte svara just nu. Försök igen.", error: true }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Öppna AI-coach"
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg md:bottom-6"
      >
        <Sparkles className="h-6 w-6" aria-hidden />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" aria-hidden /> Din coach</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {chat.length === 0 && (
              <p className="text-sm text-muted-foreground">Fråga om mat, dagsform eller träning – coachen utgår från din dag.</p>
            )}
            {chat.map((m, i) => (
              <div key={i} className="space-y-2">
                <p className="ml-8 rounded-2xl bg-secondary px-3 py-2 text-sm">{m.q}</p>
                <p className={`mr-8 whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${m.error ? "bg-muted text-muted-foreground" : "bg-muted"}`}>{m.a}</p>
              </div>
            ))}
            {busy && <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Coachen tänker…</p>}
            <div className="flex flex-wrap gap-2">
              {suggest.map((x) => (
                <button key={x} className="chip text-left" disabled={busy} onClick={() => send(x)}>{x}</button>
              ))}
            </div>
            <div className="flex gap-2">
              <Textarea value={q} onChange={(e) => setQ(e.target.value)} placeholder="Skriv din fråga…" maxLength={500} rows={2} />
              <Button size="icon" className="h-auto" disabled={busy || q.trim().length < 2} onClick={() => send(q)} aria-label="Skicka">
                <Send className="h-5 w-5" aria-hidden />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Livsstilsinspiration – inte medicinsk rådgivning.</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
