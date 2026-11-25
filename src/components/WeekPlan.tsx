import { useState } from "react";
import { CalendarDays, Check, Copy, Dumbbell, Leaf, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  dateKey,
  MEAL_LABEL,
  MEAL_TYPES,
  uid,
  update,
  useBalans,
  WEEKDAYS,
  type MealType,
  type Profile,
} from "@/lib/balans";
import { DAY_HINT, dayKind, planText, weekDates } from "@/lib/mealplan";
import { round1 } from "@/lib/utils";

const num = (v: string) => {
  const n = Number(v.replace(",", "."));
  return v.trim() && Number.isFinite(n) && n >= 0 ? round1(n) : undefined;
};

export function WeekPlan(_props: { profile: Profile }) {
  const s = useBalans();
  const today = dateKey();
  const dates = weekDates(today);
  const [day, setDay] = useState(today);
  const [adding, setAdding] = useState<MealType | null>(null);
  const [name, setName] = useState("");
  const [kcal, setKcal] = useState("");
  const [protein, setProtein] = useState("");
  if (!s) return null;
  const plan = (s.mealPlan ?? []).filter((x) => x.name);
  const kind = dayKind(s.workouts, s.habits[day], day);

  const open = (t: MealType) => {
    setAdding(t);
    setName("");
    setKcal("");
    setProtein("");
  };
  const add = () => {
    if (!adding || !name.trim()) return;
    const item = {
      id: uid(),
      date: day,
      type: adding,
      name: name.trim(),
      kcal: num(kcal),
      protein: num(protein),
    };
    update((st) => ({ ...st, mealPlan: [...(st.mealPlan ?? []), item] }));
    setAdding(null);
  };
  const remove = (id: string) =>
    update((st) => ({ ...st, mealPlan: (st.mealPlan ?? []).filter((x) => x.id !== id) }));
  const eat = (id: string) => {
    const pm = plan.find((x) => x.id === id);
    if (!pm) return;
    update((st) => ({
      ...st,
      meals: [
        ...st.meals,
        {
          id: uid(),
          date: today,
          type: pm.type,
          name: pm.name,
          amount: "1 portion",
          kcal: pm.kcal ?? 0,
          protein: pm.protein ?? 0,
          carbs: 0,
          fat: 0,
        },
      ],
      mealPlan: (st.mealPlan ?? []).filter((x) => x.id !== id),
    }));
    toast.success("Loggad i dagens mat");
  };
  const copy = async () => {
    const text = planText(plan, dates, WEEKDAYS);
    if (!text) {
      toast("Planera några måltider först");
      return;
    }
    try {
      await navigator.clipboard.writeText(`Veckans måltider\n${text}`);
      toast.success("Veckoplanen är kopierad");
    } catch {
      toast.error("Kunde inte kopiera");
    }
  };

  return (
    <section className="card-soft space-y-3 p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <CalendarDays className="h-5 w-5 text-primary" /> Veckoplan
        </h2>
        <Button variant="secondary" size="sm" className="rounded-md" onClick={copy}>
          <Copy /> Kopiera
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {dates.map((d, i) => {
          const k = dayKind(s.workouts, s.habits[d], d);
          const n = plan.filter((x) => x.date === d).length;
          return (
            <button
              key={d}
              onClick={() => setDay(d)}
              aria-pressed={d === day}
              className={`flex min-h-16 flex-col items-center justify-center gap-0.5 rounded-lg text-xs ${d === day ? "bg-primary text-primary-foreground" : "bg-muted"}`}
            >
              <span className="font-semibold">{WEEKDAYS[i]}</span>
              {k === "träning" ? (
                <Dumbbell className="h-3.5 w-3.5" aria-label="Träning" />
              ) : k === "vila" ? (
                <Leaf className="h-3.5 w-3.5" aria-label="Vila" />
              ) : (
                <span className="h-3.5" />
              )}
              <span>{n || ""}</span>
            </button>
          );
        })}
      </div>
      <p className="text-sm text-muted-foreground">{DAY_HINT[kind]}</p>
      <ul className="space-y-2">
        {MEAL_TYPES.map((t) => (
          <li key={t} className="rounded-lg bg-muted p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">{MEAL_LABEL[t]}</span>
              <button
                onClick={() => open(t)}
                className="flex h-9 w-9 items-center justify-center rounded-md bg-card"
                aria-label={`Planera ${MEAL_LABEL[t]}`}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {plan
              .filter((x) => x.date === day && x.type === t)
              .map((pm) => (
                <div key={pm.id} className="mt-2 flex items-center justify-between gap-2 text-sm">
                  <span>
                    {pm.name}
                    {pm.kcal != null && (
                      <span className="text-muted-foreground"> · {pm.kcal} kcal</span>
                    )}
                  </span>
                  <span className="flex gap-1">
                    {day === today && (
                      <button
                        onClick={() => eat(pm.id)}
                        className="flex h-9 items-center gap-1 rounded-md bg-primary px-3 text-xs text-primary-foreground"
                      >
                        <Check className="h-3.5 w-3.5" /> Ät idag
                      </button>
                    )}
                    <button
                      onClick={() => remove(pm.id)}
                      className="flex h-9 w-9 items-center justify-center rounded-md"
                      aria-label="Ta bort"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </span>
                </div>
              ))}
          </li>
        ))}
      </ul>

      <Dialog open={!!adding} onOpenChange={(o) => !o && setAdding(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Planera {adding ? MEAL_LABEL[adding].toLowerCase() : ""}</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              add();
            }}
          >
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="T.ex. Lax med potatis eller Matlåda"
              maxLength={80}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                inputMode="decimal"
                value={kcal}
                onChange={(e) => setKcal(e.target.value)}
                placeholder="kcal (valfritt)"
              />
              <Input
                inputMode="decimal"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                placeholder="Protein g (valfritt)"
              />
            </div>
            <Button type="submit" className="w-full rounded-md" disabled={!name.trim()}>
              Lägg till
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
