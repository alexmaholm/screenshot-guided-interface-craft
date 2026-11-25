import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, Send, Loader2, Check, Plus, Mic } from "lucide-react";
import { applyAction, type CoachAction } from "@/lib/coachActions";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { askCoach } from "@/lib/coach.functions";
import {
  dateKey,
  macroTargets,
  nutritionFocusOf,
  NUTRITION_FOCUS,
  sumMacros,
  useBalans,
  type State,
  update,
} from "@/lib/balans";
import { Paywall } from "@/components/Paywall";
import { isPro } from "@/lib/tiers";
import { toast } from "sonner";
import { bestLifts, historyFor, recoveryLine } from "@/lib/coachTelemetry";
import { isOffline, OFFLINE_MSG } from "@/lib/online";
import { ensureSignedIn } from "@/lib/account-gate";

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
  const last = s.workouts
    .filter((w) => w.status === "klart")
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  return [
    `Fokus: ${focus}`,
    `Kost: ${p.diet ?? "allt"}; restriktioner: ${(p.restrictions ?? []).join(", ") || "inga"}`,
    `Idag ätit: ${eaten.kcal} kcal, ${eaten.protein} g protein, ${eaten.carbs} g kolhydrater, ${eaten.fat} g fett`,
    `Dagsmål: ${t.kcal} kcal, ${t.protein} g protein, ${t.carbs} g kolhydrater, ${t.fat} g fett`,
    p.hideCalories ? "Användaren vill inte se kalorier – nämn inte kcal." : "",
    last ? `Senaste pass: ${last.title} (${last.kind}) ${last.date}` : "Inga loggade pass ännu.",
    `Utrustning: ${p.equipment.join(", ") || "ingen"}`,
    weight ? `Senaste vikt: ${weight} kg` : "",
    `Klockan: ${new Date().toTimeString().slice(0, 5)}`,
    `Vatten idag: ${(s.habits[today]?.water ?? 0) * 250} ml`,
    `Idag loggat: ${
      s.meals
        .filter((m) => m.date === today)
        .map((m) => `${m.type}: ${m.name}`)
        .join("; ") || "inget"
    }`,
    `Senaste pass i detalj: ${
      s.workouts
        .filter((w) => w.status === "klart")
        .slice(-3)
        .map(
          (w) =>
            `${w.date} ${w.title} [${w.exercises.map((e) => `${e.name} ${e.sets ?? ""}x${e.reps ?? ""}${e.weightKg ? `@${e.weightKg}` : ""}`).join(", ")}]`,
        )
        .join(" | ") || "inga"
    }`,
    `Muskelstatus: ${recoveryLine(s.workouts, today)}`,
    `Bästa lyft: ${
      bestLifts(s.workouts, 8)
        .map((b) => `${b.name} ${b.kg} kg x ${b.reps}`)
        .join("; ") || "inga ännu"
    }`,
  ]
    .filter(Boolean)
    .join("\n");
}

type Rec = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult:
    | ((e: {
        resultIndex: number;
        results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
      }) => void)
    | null;
  onend: (() => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
};

/** Dictation into a text field: appends final speech to `base`, shows interim text live. */
function useDictation(onText: (t: string) => void) {
  const [on, setOn] = useState(false);
  const rec = useRef<Rec | null>(null);
  const stop = () => {
    const r = rec.current;
    rec.current = null;
    if (r) {
      r.onresult = null;
      r.onend = null;
      try {
        r.abort();
      } catch {
        /* stopped */
      }
    }
    setOn(false);
  };
  useEffect(() => {
    const hide = () => {
      if (document.hidden) stop();
    };
    document.addEventListener("visibilitychange", hide);
    return () => {
      document.removeEventListener("visibilitychange", hide);
      stop();
    };
  }, []);
  const toggle = (base: string) => {
    if (on) return stop();
    const W = window as unknown as {
      SpeechRecognition?: new () => Rec;
      webkitSpeechRecognition?: new () => Rec;
    };
    const Ctor = W.SpeechRecognition ?? W.webkitSpeechRecognition;
    if (!Ctor) return void toast.error("Röstinmatning stöds inte på den här enheten.");
    const r = new Ctor();
    r.lang = "sv-SE";
    r.interimResults = true;
    r.continuous = true;
    let final = base.trim();
    r.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i]!;
        const t = res[0].transcript.trim();
        if (res.isFinal) final = [final, t].filter(Boolean).join(" ");
        else interim += ` ${t}`;
      }
      onText([final, interim.trim()].filter(Boolean).join(" ").slice(0, 1500));
    };
    r.onerror = (e) => {
      if (e?.error === "not-allowed") toast.error("Tillåt mikrofonen för att prata in.");
    };
    r.onend = () => {
      if (rec.current === r) {
        rec.current = null;
        setOn(false);
        onText(final);
      }
    };
    rec.current = r;
    try {
      r.start();
      setOn(true);
      navigator.vibrate?.(20);
    } catch {
      rec.current = null;
    }
  };
  return { on, toggle, stop };
}

const num = (v: string) => {
  const n = Number(v.replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? n : 0;
};
const Num = ({
  value,
  onChange,
  label,
  w = "w-12",
}: {
  value: number | undefined;
  onChange: (n: number) => void;
  label: string;
  w?: string;
}) => (
  <input
    inputMode="decimal"
    aria-label={label}
    defaultValue={value ?? ""}
    onBlur={(e) => onChange(num(e.target.value))}
    className={`telemetry ${w} rounded-sm border border-border bg-background px-1 py-0.5 text-[11px] text-foreground focus:border-primary focus:outline-none`}
  />
);

function cardLabel(a: CoachAction): string {
  if (a.kind === "log_meal") return a.type;
  if (a.kind === "log_water") return "Vatten";
  if (a.kind === "log_weight") return "Vikt";
  return a.status === "klart" ? "Genomfört pass" : "Planerat pass";
}
function cardTitle(a: CoachAction): string {
  if (a.kind === "log_meal") return a.name;
  if (a.kind === "log_water") return `${a.ml} ml`;
  if (a.kind === "log_weight") return `${a.kg} kg`;
  return `${a.title} · ${a.durationMin} min`;
}

export function AiCoach() {
  const s = useBalans();
  const ask = useServerFn(askCoach);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [suggest, setSuggest] = useState<string[]>(QUICK);
  const [chat, setChat] = useState<
    { q: string; a: string; error?: boolean; actions?: CoachAction[]; done?: number[] }[]
  >([]);
  const [pay, setPay] = useState(false);
  const mic = useDictation(setQ);
  // `mic` is a new object each render, but stop() only touches a ref and a stable
  // state setter, so running the effect on `open` alone is intentional.
  useEffect(() => {
    if (!open) mic.stop();
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!s?.profile) return null;

  const edit = (i: number, j: number, fn: (a: CoachAction) => CoachAction) =>
    setChat((c) =>
      c.map((m, k) =>
        k === i && m.actions
          ? { ...m, actions: m.actions.map((a, x) => (x === j ? fn(a) : a)) }
          : m,
      ),
    );

  async function send(question: string) {
    if (!s || busy || question.trim().length < 2) return;
    mic.stop();
    if (!(await ensureSignedIn())) return;
    if (isOffline()) {
      setChat((c) => [...c, { q: question, a: OFFLINE_MSG, error: true }]);
      return;
    }
    setBusy(true);
    setQ("");
    try {
      const r = await ask({
        data: { question, context: coachContext(s), history: historyFor(chat) },
      });
      if (r.ok && r.followUps.length) setSuggest(r.followUps);
      setChat((c) => [
        ...c,
        r.ok
          ? { q: question, a: r.answer, actions: r.actions, done: [] }
          : { q: question, a: r.error, error: true },
      ]);
    } catch {
      setChat((c) => [
        ...c,
        { q: question, a: "Coachen kunde inte svara just nu. Försök igen.", error: true },
      ]);
    } finally {
      setBusy(false);
    }
  }

  const confirm = (i: number, j: number, a: CoachAction) => {
    update((st) => applyAction(st, a));
    toast.success(
      a.kind === "log_workout"
        ? a.status === "klart"
          ? "Passet är sparat"
          : "Passet ligger i Träning"
        : "Loggat",
    );
    setChat((c) => c.map((m, k) => (k === i ? { ...m, done: [...(m.done ?? []), j] } : m)));
  };

  return (
    <>
      <button
        onClick={() => (isPro(s) ? setOpen(true) : setPay(true))}
        aria-label="Öppna AI-coach"
        className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] right-4 z-40 flex h-11 items-center gap-2 rounded-lg border border-border bg-background/85 px-3.5 text-foreground backdrop-blur-xl transition-colors active:bg-muted md:bottom-6"
      >
        <Sparkles className="h-4 w-4 text-primary" strokeWidth={1.5} aria-hidden />
        <span className="label-xs text-foreground">Coach</span>
      </button>
      <Paywall open={pay} onOpenChange={setPay} />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" aria-hidden /> Din coach
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {chat.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Fråga om mat, dagsform eller träning – coachen utgår från din dag.
              </p>
            )}
            {chat.map((m, i) => (
              <div key={i} className="space-y-2">
                <p className="ml-8 rounded-lg bg-secondary px-3 py-2 text-sm">{m.q}</p>
                <div
                  className={`mr-8 space-y-2 rounded-lg bg-muted px-3 py-2 text-sm leading-relaxed ${m.error ? "text-muted-foreground" : ""}`}
                >
                  {m.a
                    .split("\n")
                    .map((l) => l.trim())
                    .filter(Boolean)
                    .map((line, j) => {
                      const bullet = /^([-*•]|\d+[.)])\s+/.test(line);
                      const text = line.replace(/^([-*•]|\d+[.)])\s+/, "").replace(/^#+\s*/, "");
                      const parts = text.split(/\*\*(.+?)\*\*/g).map((p, k) =>
                        k % 2 ? (
                          <strong key={k} className="font-semibold">
                            {p}
                          </strong>
                        ) : (
                          p.replace(/\*/g, "")
                        ),
                      );
                      return bullet ? (
                        <p key={j} className="flex gap-2">
                          <span className="text-primary" aria-hidden>
                            •
                          </span>
                          <span>{parts}</span>
                        </p>
                      ) : (
                        <p key={j}>{parts}</p>
                      );
                    })}
                </div>
                {m.actions?.map((a, j) => {
                  const done = m.done?.includes(j);
                  return (
                    <div key={j} className="panel mr-8 flex items-start gap-3 p-3">
                      <div className="min-w-0 flex-1">
                        <p className="label-xs text-muted-foreground">{cardLabel(a)}</p>
                        <p className="truncate text-sm font-medium">{cardTitle(a)}</p>
                        {a.kind === "log_meal" &&
                          (done ? (
                            <p className="telemetry text-[11px] text-muted-foreground">
                              {a.kcal} KCAL · P {a.protein} · K {a.carbs} · F {a.fat}
                            </p>
                          ) : (
                            <div className="mt-1 flex flex-wrap items-center gap-1 text-[10px] text-muted-foreground">
                              {(["kcal", "protein", "carbs", "fat"] as const).map((f) => (
                                <label key={f} className="flex items-center gap-1">
                                  <span className="label-xs">
                                    {f === "kcal"
                                      ? "KCAL"
                                      : f === "protein"
                                        ? "P"
                                        : f === "carbs"
                                          ? "K"
                                          : "F"}
                                  </span>
                                  <Num
                                    label={f}
                                    value={a[f]}
                                    w={f === "kcal" ? "w-14" : "w-10"}
                                    onChange={(n) =>
                                      edit(i, j, (x) =>
                                        x.kind === "log_meal" ? { ...x, [f]: Math.round(n) } : x,
                                      )
                                    }
                                  />
                                </label>
                              ))}
                            </div>
                          ))}
                        {a.kind === "log_workout" && (
                          <ul className="mt-1 space-y-0.5">
                            {a.exercises.map((e, k) => (
                              <li
                                key={k}
                                className="telemetry flex justify-between gap-2 text-[11px] text-muted-foreground"
                              >
                                <span className="truncate">{e.name}</span>
                                {done ? (
                                  <span className="shrink-0">
                                    {e.sets
                                      .map((x) =>
                                        x.timeSec
                                          ? `${x.timeSec}s`
                                          : `${x.reps ?? ""}${x.kg ? `×${x.kg}` : ""}`,
                                      )
                                      .join(" · ")}
                                  </span>
                                ) : (
                                  <span className="flex shrink-0 flex-wrap justify-end gap-1">
                                    {e.sets.map((x, si) =>
                                      x.timeSec ? (
                                        <span key={si}>{x.timeSec}s</span>
                                      ) : (
                                        <span key={si} className="flex items-center gap-0.5">
                                          <Num
                                            label={`${e.name} set ${si + 1} reps`}
                                            value={x.reps}
                                            w="w-8"
                                            onChange={(n) =>
                                              edit(i, j, (w) =>
                                                w.kind === "log_workout"
                                                  ? {
                                                      ...w,
                                                      exercises: w.exercises.map((ee, ek) =>
                                                        ek === k
                                                          ? {
                                                              ...ee,
                                                              sets: ee.sets.map((ss, sk) =>
                                                                sk === si
                                                                  ? {
                                                                      ...ss,
                                                                      reps:
                                                                        Math.round(n) || undefined,
                                                                    }
                                                                  : ss,
                                                              ),
                                                            }
                                                          : ee,
                                                      ),
                                                    }
                                                  : w,
                                              )
                                            }
                                          />
                                          ×
                                          <Num
                                            label={`${e.name} set ${si + 1} kg`}
                                            value={x.kg}
                                            w="w-10"
                                            onChange={(n) =>
                                              edit(i, j, (w) =>
                                                w.kind === "log_workout"
                                                  ? {
                                                      ...w,
                                                      exercises: w.exercises.map((ee, ek) =>
                                                        ek === k
                                                          ? {
                                                              ...ee,
                                                              sets: ee.sets.map((ss, sk) =>
                                                                sk === si
                                                                  ? { ...ss, kg: n || undefined }
                                                                  : ss,
                                                              ),
                                                            }
                                                          : ee,
                                                      ),
                                                    }
                                                  : w,
                                              )
                                            }
                                          />
                                        </span>
                                      ),
                                    )}
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant={done ? "outline" : "default"}
                        disabled={done}
                        onClick={() => confirm(i, j, a)}
                      >
                        {done ? (
                          <>
                            <Check className="h-4 w-4" aria-hidden /> Loggad
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4" aria-hidden /> Logga
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            ))}
            {busy && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Coachen tänker…
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {suggest.map((x) => (
                <button key={x} className="chip text-left" disabled={busy} onClick={() => send(x)}>
                  {x}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Textarea
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={
                  mic.on
                    ? "Lyssnar… prata nu"
                    : "Skriv eller prata – mat, vatten, vikt eller ditt pass…"
                }
                maxLength={1500}
                rows={2}
              />
              <Button
                type="button"
                size="icon"
                variant={mic.on ? "default" : "outline"}
                className={`h-auto ${mic.on ? "animate-pulse" : ""}`}
                disabled={busy}
                onClick={() => mic.toggle(q)}
                aria-label={mic.on ? "Sluta lyssna" : "Prata in meddelande"}
                aria-pressed={mic.on}
              >
                <Mic className="h-5 w-5" strokeWidth={1.5} aria-hidden />
              </Button>
              <Button
                size="icon"
                className="h-auto"
                disabled={busy || q.trim().length < 2}
                onClick={() => send(q)}
                aria-label="Skicka"
              >
                <Send className="h-5 w-5" aria-hidden />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Livsstilsinspiration – inte medicinsk rådgivning.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
