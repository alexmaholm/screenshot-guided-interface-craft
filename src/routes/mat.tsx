import { RecoveryMeals } from "@/components/RecoveryMeals";
import { MacroSummary } from "@/components/MacroSummary";
import { WaterTracker } from "@/components/WaterTracker";
import { FoodSearch } from "@/components/FoodSearch";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Star, Trash2, Plus, ChevronLeft, ChevronRight, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { AppShell, NeedsOnboarding, PageLoading } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  addDays, dateKey, macroTargets, sumMacros, MEAL_LABEL, MEAL_TYPES, prettyDate, suggestionsFor, uid, update, useBalans,
  type Meal, type MealType,
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
      { name: "description", content: "Logga måltider, spara favoriter och hitta förslag som passar din kost." },
      { property: "og:title", content: "Mat – Balans" },
      { property: "og:description", content: "Enkel måltidslogg med favoriter och förslag." },
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
  const s = useBalans()!;
  const p = s.profile!;
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
      <header className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Mat</h1>
          <div className="mt-1 flex items-center gap-1">
            <button aria-label="Föregående dag" className="grid h-10 w-10 place-items-center rounded-full hover:bg-muted" onClick={() => setDate(addDays(date, -1))}><ChevronLeft className="h-5 w-5" /></button>
            <span className="min-w-36 text-center text-sm capitalize text-muted-foreground">{isToday ? "Idag" : prettyDate(date)}</span>
            <button aria-label="Nästa dag" className="grid h-10 w-10 place-items-center rounded-full hover:bg-muted disabled:opacity-30" disabled={isToday} onClick={() => setDate(addDays(date, 1))}><ChevronRight className="h-5 w-5" /></button>
          </div>
        </div>
        <Button className="h-12 rounded-full px-5" onClick={() => { setType(guessType()); setOpen(true); }}>
          <Plus /> Lägg till
        </Button>
      </header>

      <RecoveryMeals profile={p} workout={[...s.workouts].reverse().find((w) => w.date === date && w.status === "klart" && w.kind !== "vila")} date={date} />
      <section className="card-soft space-y-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Dagens näring</h2>
          <button
            className="flex min-h-11 items-center gap-2 rounded-full px-3 text-sm text-muted-foreground hover:bg-muted"
            onClick={() => update((st) => ({ ...st, profile: { ...st.profile!, hideCalories: !p.hideCalories } }))}
          >
            {showKcal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showKcal ? "Dölj kalorier" : "Visa kalorier"}
          </button>
        </div>
        <MacroSummary eaten={eaten} target={target} showKcal={showKcal} />
      </section>
      <WaterTracker date={date} />

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
                          {m.amount}
                          {m.protein ? ` · ${m.protein} g P` : ""}
                          {m.carbs ? ` · ${m.carbs} g K` : ""}
                          {m.fat ? ` · ${m.fat} g F` : ""}
                          {showKcal && m.kcal ? ` · ${m.kcal} kcal` : ""}
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
  const s = useBalans()!;
  const [tab, setTab] = useState<"sök" | "egen" | "favoriter" | "tidigare" | "förslag">("sök");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [kcal, setKcal] = useState("");
  const [protein, setProtein] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => { if (open) { setName(""); setAmount(""); setKcal(""); setProtein(""); setErr(""); } }, [open]);

  const recent = Array.from(new Map([...s.meals].reverse().map((m) => [m.name, m])).values()).slice(0, 8);
  const sugg = suggestionsFor(s.profile?.diet, type, s.profile?.restrictions);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setErr("Skriv vad du åt.");
    onAdd({ type, name: name.trim(), amount: amount.trim() || "1 portion", kcal: kcal ? Number(kcal) : undefined, protein: protein ? Number(protein) : undefined });
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
      <DialogContent className="rounded-3xl">
        <DialogHeader><DialogTitle className="font-display text-2xl">Lägg till måltid</DialogTitle></DialogHeader>
        <div className="flex flex-wrap gap-2">
          {MEAL_TYPES.map((t) => (
            <button key={t} className="chip" aria-pressed={type === t} onClick={() => setType(t)}>{MEAL_LABEL[t]}</button>
          ))}
        </div>
        <div className="grid grid-cols-5 gap-1 rounded-full bg-muted p-1 text-sm" role="tablist">
          {(["sök", "egen", "favoriter", "tidigare", "förslag"] as const).map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`min-h-10 rounded-full text-xs capitalize sm:text-sm ${tab === t ? "bg-card font-semibold shadow-sm" : ""}`}>{t}</button>
          ))}
        </div>
        {tab === "sök" && <FoodSearch showKcal={showKcal} onPick={(f) => onAdd({ type, ...f })} />}
        {tab === "egen" && (
          <form onSubmit={submit} className="space-y-3">
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
                <Input id="mp" type="number" min={0} inputMode="numeric" className="mt-1 h-12 rounded-xl" value={protein} onChange={(e) => setProtein(e.target.value)} />
              </div>
              {showKcal && (
                <div>
                  <label htmlFor="mk" className="text-sm font-medium">Kalorier (valfritt)</label>
                  <Input id="mk" type="number" min={0} inputMode="numeric" className="mt-1 h-12 rounded-xl" value={kcal} onChange={(e) => setKcal(e.target.value)} />
                </div>
              )}
            </div>
            <Button type="submit" className="h-12 w-full rounded-full">Spara måltid</Button>
          </form>
        )}
        {tab === "favoriter" && <Pick items={s.favorites} />}
        {tab === "tidigare" && <Pick items={recent} />}
        {tab === "förslag" && <><Pick items={sugg} /><p className="text-xs text-muted-foreground">Kontrollera ingredienser och allergenmärkning. Chiapudding avser kokosdryck; lax tillagas med olja.</p></>}
      </DialogContent>
    </Dialog>
  );
}
