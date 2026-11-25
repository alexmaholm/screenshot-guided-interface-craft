import { Droplets, Minus, Plus } from "lucide-react";
import { GLASS_ML, update, useBalans } from "@/lib/balans";

export function WaterTracker({ date }: { date: string }) {
  const s = useBalans();
  if (!s?.profile) return null;
  const goal = s.profile.waterGoal;
  const h = s.habits[date] ?? { water: 0 };
  const set = (water: number) =>
    update((st) => ({
      ...st,
      habits: { ...st.habits, [date]: { ...h, water: Math.max(0, water) } },
    }));
  const liters = (n: number) =>
    ((n * GLASS_ML) / 1000).toLocaleString("sv-SE", { maximumFractionDigits: 2 });
  const pct = Math.min(100, Math.round((h.water / Math.max(1, goal)) * 100));

  return (
    <section className="card-soft p-5">
      <div className="flex items-center gap-4">
        <div
          className="relative h-20 w-14 shrink-0 overflow-hidden rounded-b-2xl rounded-t-md border-2 border-primary/30 bg-muted"
          aria-hidden
        >
          <div
            className="absolute inset-x-0 bottom-0 bg-mint transition-all duration-500"
            style={{ height: `${pct}%` }}
          />
          <Droplets className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-primary" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold">Vatten</h2>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {liters(h.water)} av {liters(goal)} liter · {h.water} glas
          </p>
          {h.water >= goal && (
            <p className="mt-1 text-sm font-medium text-primary">Dagens mål nått – snyggt! 💧</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            aria-label="Ta bort ett glas"
            onClick={() => set(h.water - 1)}
            className="grid h-11 w-11 place-items-center rounded-md bg-muted"
          >
            <Minus className="h-5 w-5" />
          </button>
          <button
            aria-label="Lägg till ett glas (250 ml)"
            onClick={() => set(h.water + 1)}
            className="grid h-12 w-12 place-items-center rounded-md bg-primary text-primary-foreground"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
