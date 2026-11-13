import { FridgeIdeas } from "@/components/FridgeIdeas";
import { ProGate } from "@/components/Paywall";
import { WeekPlan } from "@/components/WeekPlan";
import { RecoveryMeals } from "@/components/RecoveryMeals";
import { MacroSummary } from "@/components/MacroSummary";
import { WaterTracker } from "@/components/WaterTracker";
import { FoodSearch } from "@/components/FoodSearch";
import { DailyHabits } from "@/components/DailyHabits";
import { PhotoLog } from "@/components/PhotoLog";
import { BarcodeScan } from "@/components/BarcodeScan";
import { parseNutrition } from "@/lib/habits";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Star, Trash2, Plus, ChevronLeft, ChevronRight, ChevronDown, Eye, EyeOff, Sparkles, Loader2, Search, ScanBarcode, PenLine, Camera, History } from "lucide-react";
import { toast } from "sonner";
import { AppShell, NeedsOnboarding, PageLoading } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { estimateText } from "@/lib/textlog.functions";
import {
  addDays, dateKey, macroFeedback, macroTargets, nutritionFocusOf, NUTRITION_FOCUS, sumMacros, sumMicros, MEAL_LABEL, MEAL_TYPES, prettyDate, uid, update, useBalans,
  type Meal, type MealType, type Micros,
} from "@/lib/balans";

type Search = { ny?: boolean | undefined; typ?: MealType | undefined };

export const Route = createFileRoute("/mat")({
  validateSearch: (s: Record<string, unknown>): Search => ({ // eslint-disable-line
    ny: s["ny"] === true || s["ny"] === "true" ? true : undefined,
    typ: MEAL_TYPES.includes(s["typ"] as MealType) ? (s["typ"] as MealType) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Mat – Balans" },
      { name: "description", content: "Logga måltider med foto, streckkod eller egen text och spara favoriter." },
      { property: "og:title", content: "Mat – Balans" },
      { property: "og:description", content: "Enkel måltidslogg med foto, streckkod och favoriter." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MatPage,
});

function MatPage() {
  const s = useBalans();
  return <AppShell>{!s ? <PageLoading /> : !s.profile ? <NeedsOnboarding /> : <Mat />}</AppShell>;
}

function Mat() {
  const s = useBalans();
  const p = s?.profile;
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/mat" });
  const [date, setDate] = useState(dateKey());
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<MealType>("lunch");

  useEffect(() => {
    if (search.ny) {
      setType(search.typ ?? guessType());
      setOpen(true);
      navigate({ search: {}, replace: true });
    }
  }, [search.ny, search.typ, navigate]);

  if (!s || !p) return null;
  const meals = s.meals.filter((m) => m.date === date);
  const showKcal = !p.hideCalories;
  const eaten = sumMacros(meals);
  const target = macroTargets(p, s.body.at(-1)?.weight);
  const isToday = date === dateKey();

  const addMeal = (m: Omit<Meal, "id" | "date">) => {
    update((st) => ({ ...st, meals: [...st.meals, { ...m, id: uid(), date }] }));
    toast.success(`${m.name} tillagd i ${MEAL_LABEL[m.type].toLowerCase()}`);
  };
  const remove = (id: string) => update((st) => ({ ...st, meals: st.meals.filter((m) => m.id !== id) }));
  const toggleFav = (m: Meal) => {
    const existing = s.favorites.find((f) => f.name === m.name);
    update((st) => ({
      ...st,
      favorites: existing
        ? st.favorites.filter((f) => f.id !== existing.id)
        : [...st.favorites, { id: uid(), name: m.name, amount: m.amount, type: m.type, kcal: m.kcal, protein: m.protein, carbs: m.carbs, fat: m.fat }],
    }));
    toast(existing ? "Borttagen från favoriter" : "Sparad som favorit");
  };

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <p className="label-xs text-muted-foreground">Näring · {isToday ? "Idag" : prettyDate(date)}</p>
        <div className="flex items-end justify-between gap-3">
          <h1 className="text-4xl font-semibold tracking-tight">Mat</h1>
          <div className="flex items-center gap-1">
            <button aria-label="Föregående dag" className="grid h-10 w-10 place-items-center rounded-full border border-border hover:bg-muted" onClick={() => setDate(addDays(date, -1))}><ChevronLeft className="h-4 w-4" /></button>
            <button aria-label="Nästa dag" className="grid h-10 w-10 place-items-center rounded-full border border-border hover:bg-muted disabled:opacity-30" disabled={isToday} onClick={() => setDate(addDays(date, 1))}><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      </header>

      <button
        onClick={() => { setType(guessType()); setOpen(true); }}
        className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-base font-semibold text-primary-foreground active:scale-[0.99] transition"
      >
        <Plus className="h-5 w-5" /> Logga måltid
      </button>

      <RecoveryMeals profile={p} workout={[...s.workouts].reverse().find((w) => w.date === date && w.status === "klart" && w.kind !== "vila")} date={date} />
      <section className="card-soft space-y-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Dagens näring</h2>
          <button
            className="flex min-h-11 items-center gap-2 rounded-full px-3 text-sm text-muted-foreground hover:bg-muted"
            onClick={() => update((st) => st.profile ? ({ ...st, profile: { ...st.profile, hideCalories: !p.hideCalories } }) : st)}
          >
            {showKcal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showKcal ? "Dölj kalorier" : "Visa kalorier"}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">{NUTRITION_FOCUS.find((f) => f.value === nutritionFocusOf(p))?.label} · Vägledande uppskattning, inte medicinsk rådgivning.</p>
        <MacroSummary eaten={eaten} target={target} showKcal={showKcal} />
        {(["protein", "carbs", "fat"] as const).map((k) => { const t = macroFeedback(k, eaten[k], target[k]); return t ? <p key={k} className="text-sm text-primary">{t}</p> : null; })}
        <details className="group rounded-2xl bg-muted px-4 py-2">
          <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between text-sm font-medium">
            Fler näringsämnen <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
          </summary>
          {(() => { const mi = sumMicros(meals); return (
            <dl className="grid grid-cols-2 gap-2 pb-2 pt-1 text-sm">
              <div><dt className="text-muted-foreground">Fibrer</dt><dd className="font-semibold">{mi.fiber} g</dd></div>
              <div><dt className="text-muted-foreground">Socker</dt><dd className="font-semibold">{mi.sugar} g</dd></div>
              <div><dt className="text-muted-foreground">Mättat fett</dt><dd className="font-semibold">{mi.satFat} g</dd></div>
              <div><dt className="text-muted-foreground">Salt</dt><dd className="font-semibold">{mi.salt} g</dd></div>
              <p className="col-span-2 text-xs text-muted-foreground">Uppskattningar från AI-loggade måltider.</p>
            </dl>
          ); })()}
        </details>
      </section>

      {MEAL_TYPES.map((t) => {
        const list = meals.filter((m) => m.type === t);
        return (
          <section key={t} className="card-soft p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{MEAL_LABEL[t]}</h2>
              <button aria-label={`Lägg till ${MEAL_LABEL[t]}`} onClick={() => { setType(t); setOpen(true); }} className="grid h-11 w-11 place-items-center rounded-full bg-secondary text-primary">
                <Plus className="h-5 w-5" />
              </button>
            </div>
            {list.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">Inget loggat – helt okej.</p>
            ) : (
              <ul className="mt-2 divide-y">
                {list.map((m) => {
                  const fav = s.favorites.some((f) => f.name === m.name);
                  return (
                    <li key={m.id} className="flex items-center gap-2 py-3">
                      <div className="flex-1">
                        <p className="font-medium">{m.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {[m.amount, m.protein ? `${m.protein} g P` : "", m.carbs ? `${m.carbs} g K` : "", m.fat ? `${m.fat} g F` : "", showKcal && m.kcal ? `${m.kcal} kcal` : ""].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                      <button aria-label={fav ? "Ta bort favorit" : "Spara som favorit"} aria-pressed={fav} onClick={() => toggleFav(m)} className="grid h-11 w-11 place-items-center rounded-full hover:bg-muted">
                        <Star className={`h-5 w-5 ${fav ? "fill-coral text-coral" : ""}`} />
                      </button>
                      <button aria-label={`Ta bort ${m.name}`} onClick={() => remove(m.id)} className="grid h-11 w-11 place-items-center rounded-full hover:bg-muted">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        );
      })}

      <WaterTracker date={date} />
      <DailyHabits date={date} />
      <ProGate title="Töm kylen"><FridgeIdeas profile={p} /></ProGate>
      <WeekPlan profile={p} />


      <AddMealDialog open={open} onOpenChange={setOpen} type={type} setType={setType} onAdd={(m) => { addMeal(m); setOpen(false); }} showKcal={showKcal} />
    </div>
  );
}

function guessType(): MealType {
  const h = new Date().getHours();
  return h < 10 ? "frukost" : h < 14 ? "lunch" : h < 17 ? "mellanmål" : "middag";
}

function AddMealDialog({
  open, onOpenChange, type, setType, onAdd, showKcal,
}: {
  open: boolean; onOpenChange: (o: boolean) => void; type: MealType; setType: (t: MealType) => void;
  onAdd: (m: Omit<Meal, "id" | "date">) => void; showKcal: boolean;
}) {
  const s = useBalans();
  const [tab, setTab] = useState<null | "foto" | "kod" | "sök" | "egen" | "favoriter" | "tidigare">(null);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [kcal, setKcal] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [err, setErr] = useState("");
  const [aiText, setAiText] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [micros, setMicros] = useState<Micros | null>(null);
  const estimate = useServerFn(estimateText);

  useEffect(() => { if (open) { setName(""); setAmount(""); setKcal(""); setProtein(""); setCarbs(""); setFat(""); setErr(""); setAiText(""); setMicros(null); setTab(null); } }, [open]);

  if (!s) return null;

  const recent = Array.from(new Map([...s.meals].reverse().map((m) => [m.name, m])).values()).slice(0, 8);

  const runAi = async () => {
    setAiBusy(true);
    try {
      const r = await estimate({ data: { text: aiText } });
      if (!r.ok) { toast.error(r.error); return; }
      const v = r.result;
      setName(v.name); setAmount(v.amount);
      setKcal(String(Math.round(v.kcal))); setProtein(String(v.protein)); setCarbs(String(v.carbs)); setFat(String(v.fat));
      setMicros({ fiber: v.fiber, sugar: v.sugar, satFat: v.satFat, salt: v.salt });
      setErr("");
    } catch { toast.error("Kunde inte beräkna. Försök igen eller fyll i manuellt."); }
    finally { setAiBusy(false); }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setErr("Skriv vad du åt.");
    const nutrition = parseNutrition({ kcal, protein, carbs, fat });
    if (!nutrition) return setErr("Ange näringsvärden som är 0 eller större.");
    onAdd({ type, name: name.trim(), amount: amount.trim() || "1 portion", ...nutrition, ...(micros ?? {}) });
  };
  const Pick = ({ items }: { items: { name: string; amount: string; kcal?: number | undefined; protein?: number | undefined; carbs?: number | undefined; fat?: number | undefined }[] }) =>
    items.length === 0 ? (
      <p className="py-6 text-center text-sm text-muted-foreground">Inget här än.</p>
    ) : (
      <ul className="max-h-72 space-y-2 overflow-y-auto">
        {items.map((i) => (
          <li key={i.name}>
            <button onClick={() => onAdd({ type, name: i.name, amount: i.amount, kcal: i.kcal, protein: i.protein, carbs: i.carbs, fat: i.fat })} className="flex min-h-14 w-full items-center justify-between gap-2 rounded-2xl bg-muted px-4 py-2 text-left hover:bg-secondary">
              <span>
                <span className="block font-medium">{i.name}</span>
                <span className="text-sm text-muted-foreground">{i.amount}{showKcal && i.kcal ? ` · ${i.kcal} kcal` : ""}</span>
              </span>
              <Plus className="h-5 w-5 shrink-0 text-primary" />
            </button>
          </li>
        ))}
      </ul>
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto overscroll-contain rounded-3xl pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <DialogHeader><DialogTitle className="text-2xl font-semibold tracking-tight">Logga måltid</DialogTitle></DialogHeader>
        <div className="grid grid-cols-4 gap-1.5">
          {MEAL_TYPES.map((t) => (
            <button key={t} className="chip justify-center px-1 text-xs" aria-pressed={type === t} onClick={() => setType(t)}>{MEAL_LABEL[t]}</button>
          ))}
        </div>
        {tab === null ? (
          <div className="grid gap-2">
            {([
              ["sök", Search, "Sök livsmedel", "Databas med livsmedel"],
              ["kod", ScanBarcode, "Skanna streckkod", "Förpackade varor"],
              ["egen", PenLine, "Skriv in", "Beskriv fritt – AI räknar, eller fyll i själv"],
              ["foto", Camera, "Fota tallriken", "AI läser av måltiden"],
              ["favoriter", Star, "Favoriter", `${s.favorites.length} sparade`],
              ["tidigare", History, "Senaste", "Logga igen med ett tryck"],
            ] as const).map(([k, Icon, title, sub]) => (
              <button key={k} onClick={() => setTab(k)} className="flex min-h-16 items-center gap-4 rounded-2xl border border-border bg-card px-4 text-left hover:bg-muted">
                <Icon className="h-5 w-5 text-primary" />
                <span className="flex-1"><span className="block font-medium">{title}</span><span className="text-xs text-muted-foreground">{sub}</span></span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        ) : (
          <button onClick={() => setTab(null)} className="flex min-h-10 items-center gap-1 self-start text-sm text-muted-foreground"><ChevronLeft className="h-4 w-4" /> Alla sätt att logga</button>
        )}
        {tab === "foto" && <ProGate title="AI-fotologg"><PhotoLog diet={[s.profile?.diet, ...(s.profile?.restrictions ?? [])].filter(Boolean).join(", ")} showKcal={showKcal} onSave={(m) => onAdd({ type, ...m })} /></ProGate>}
        {tab === "kod" && <BarcodeScan showKcal={showKcal} onSave={(m) => onAdd({ type, ...m })} />}
        {tab === "sök" && <FoodSearch showKcal={showKcal} onPick={(f) => onAdd({ type, ...f })} />}
        {tab === "egen" && (
          <form onSubmit={submit} className="space-y-3">
            <div className="space-y-2 rounded-2xl bg-secondary/60 p-3">
              <label htmlFor="ait" className="text-sm font-medium">Beskriv måltiden</label>
              <Textarea id="ait" rows={2} className="rounded-xl" value={aiText} onChange={(e) => setAiText(e.target.value)} placeholder="T.ex. 2 kokta ägg och en knäckemacka med ost" />
              <Button type="button" variant="outline" className="h-11 w-full rounded-full" disabled={aiBusy || aiText.trim().length < 2} onClick={runAi}>
                {aiBusy ? <Loader2 className="animate-spin" /> : <Sparkles />} Beräkna med AI
              </Button>
              {micros && <p className="text-xs text-muted-foreground">Fibrer {micros.fiber} g · Socker {micros.sugar} g · Mättat fett {micros.satFat} g · Salt {micros.salt} g</p>}
            </div>
            <div>
              <label htmlFor="mn" className="text-sm font-medium">Maträtt</label>
              <Input id="mn" className="mt-1 h-12 rounded-xl" value={name} onChange={(e) => { setName(e.target.value); setErr(""); }} placeholder="T.ex. Pasta med pesto" aria-invalid={!!err} />
              {err && <p className="mt-1 text-sm text-destructive">{err}</p>}
            </div>
            <div>
              <label htmlFor="ma" className="text-sm font-medium">Ungefärlig mängd</label>
              <Input id="ma" className="mt-1 h-12 rounded-xl" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="T.ex. 1 tallrik" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="mp" className="text-sm font-medium">Protein (g, valfritt)</label>
                <Input id="mp" inputMode="decimal" className="mt-1 h-12 rounded-xl" value={protein} onChange={(e) => setProtein(e.target.value)} />
              </div>
              <div>
                <label htmlFor="mc" className="text-sm font-medium">Kolhydrater (g, valfritt)</label>
                <Input id="mc" inputMode="decimal" className="mt-1 h-12 rounded-xl" value={carbs} onChange={(e) => setCarbs(e.target.value)} />
              </div>
              <div>
                <label htmlFor="mf" className="text-sm font-medium">Fett (g, valfritt)</label>
                <Input id="mf" inputMode="decimal" className="mt-1 h-12 rounded-xl" value={fat} onChange={(e) => setFat(e.target.value)} />
              </div>
              {showKcal && (
                <div>
                  <label htmlFor="mk" className="text-sm font-medium">Kalorier (valfritt)</label>
                  <Input id="mk" inputMode="decimal" className="mt-1 h-12 rounded-xl" value={kcal} onChange={(e) => setKcal(e.target.value)} />
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Näringsvärden för hela mängden du loggar.</p>
            <Button type="submit" className="h-12 w-full rounded-full">Spara måltid</Button>
          </form>
        )}
        {tab === "favoriter" && <Pick items={s.favorites} />}
        {tab === "tidigare" && <Pick items={recent} />}
      </DialogContent>
    </Dialog>
  );
}
