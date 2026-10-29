import { useState } from "react";
import { CalendarDays, Check, Copy, Dumbbell, Leaf, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { dateKey, MEAL_LABEL, MEAL_TYPES, uid, update, useBalans, WEEKDAYS, type MealType, type Profile } from "@/lib/balans";
import { RECIPES, recipesFor } from "@/lib/recipes";
import { DAY_HINT, dayKind, planIngredientsText, weekDates } from "@/lib/mealplan";

export function WeekPlan({ profile }: { profile: Profile }) {
  const s = useBalans();
  const today = dateKey();
  const dates = weekDates(today);
  const [day, setDay] = useState(today);
  const [adding, setAdding] = useState<MealType | null>(null);
  if (!s) return null;
  const plan = s.mealPlan ?? [];
  const kind = dayKind(s.workouts, s.habits[day], day);
  const recipes = recipesFor(profile.diet, profile.restrictions);

  const add = (recipeId: string) => {
    if (!adding) return;
    update((st) => ({ ...st, mealPlan: [...(st.mealPlan ?? []), { id: uid(), date: day, type: adding, recipeId }] }));
    setAdding(null);
  };
  const remove = (id: string) => update((st) => ({ ...st, mealPlan: (st.mealPlan ?? []).filter((x) => x.id !== id) }));
  const eat = (id: string) => {
    const pm = plan.find((x) => x.id === id);
    const r = pm && RECIPES.find((x) => x.id === pm.recipeId);
    if (!pm || !r) return;
    update((st) => ({
      ...st,
      meals: [...st.meals, { id: uid(), date: today, type: pm.type, name: r.name, amount: "1 portion", kcal: r.kcal, protein: r.protein, carbs: r.carbs, fat: r.fat }],
      mealPlan: (st.mealPlan ?? []).filter((x) => x.id !== id),
    }));
    toast.success("Loggad i dagens mat");
  };
  const copy = async () => {
    const text = planIngredientsText(plan, dates);
    if (!text) return toast("Planera några måltider först");
    try { await navigator.clipboard.writeText(`Veckans ingredienser\n${text}`); toast.success("Veckans ingredienser är kopierade"); }
    catch { toast.error("Kunde inte kopiera"); }
  };

  return (
    <section className="card-soft space-y-3 p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-lg font-semibold"><CalendarDays className="h-5 w-5 text-primary" /> Veckoplan</h2>
        <Button variant="secondary" size="sm" className="rounded-full" onClick={copy}><Copy /> Ingredienser</Button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {dates.map((d, i) => {
          const k = dayKind(s.workouts, s.habits[d], d);
          const n = plan.filter((x) => x.date === d).length;
          return (
            <button key={d} onClick={() => setDay(d)} aria-pressed={d === day}
              className={`flex min-h-16 flex-col items-center justify-center gap-0.5 rounded-2xl text-xs ${d === day ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
              <span className="font-semibold">{WEEKDAYS[i]}</span>
              {k === "träning" ? <Dumbbell className="h-3.5 w-3.5" aria-label="Träning" /> : k === "vila" ? <Leaf className="h-3.5 w-3.5" aria-label="Vila" /> : <span className="h-3.5" />}
              <span>{n || ""}</span>
            </button>
          );
        })}
      </div>
      <p className="text-sm text-muted-foreground">{DAY_HINT[kind]}</p>
      <ul className="space-y-2">
        {MEAL_TYPES.map((t) => {
          const items = plan.filter((x) => x.date === day && x.type === t);
          return (
            <li key={t} className="rounded-2xl bg-muted p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{MEAL_LABEL[t]}</span>
                <button onClick={() => setAdding(t)} className="flex h-9 w-9 items-center justify-center rounded-full bg-card" aria-label={`Planera ${MEAL_LABEL[t]}`}><Plus className="h-4 w-4" /></button>
              </div>
              {items.map((pm) => {
                const r = RECIPES.find((x) => x.id === pm.recipeId);
                if (!r) return null;
                return (
                  <div key={pm.id} className="mt-2 flex items-center justify-between gap-2 text-sm">
                    <span>{r.name}</span>
                    <span className="flex gap-1">
                      {day === today && <button onClick={() => eat(pm.id)} className="flex h-9 items-center gap-1 rounded-full bg-primary px-3 text-xs text-primary-foreground"><Check className="h-3.5 w-3.5" /> Ät idag</button>}
                      <button onClick={() => remove(pm.id)} className="flex h-9 w-9 items-center justify-center rounded-full" aria-label="Ta bort"><Trash2 className="h-4 w-4" /></button>
                    </span>
                  </div>
                );
              })}
            </li>
          );
        })}
      </ul>

      <Dialog open={!!adding} onOpenChange={(o) => !o && setAdding(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Välj recept{adding ? ` – ${MEAL_LABEL[adding]}` : ""}</DialogTitle></DialogHeader>
          <ul className="space-y-2">
            {[...recipes].sort((a, b) => Number(b.type === adding) - Number(a.type === adding)).map((r) => (
              <li key={r.id}>
                <button onClick={() => add(r.id)} className="min-h-14 w-full rounded-2xl bg-muted px-4 py-2 text-left">
                  <span className="block font-medium">{r.name}</span>
                  <span className="text-sm text-muted-foreground">{MEAL_LABEL[r.type]} · {r.minutes} min · {r.protein} g protein</span>
                </button>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </section>
  );
}
