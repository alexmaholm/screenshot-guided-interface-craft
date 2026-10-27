import { useState } from "react";
import { ChefHat, Clock, Copy, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Meal, Profile } from "@/lib/balans";
import { RECIPE_FOCUS, recipesFor, scaleIngredients, ingredientsText, type Recipe, type RecipeFocus } from "@/lib/recipes";

export function RecipeBank({ profile, showKcal, onLog }: { profile: Profile; showKcal: boolean; onLog: (m: Omit<Meal, "id" | "date">) => void }) {
  const [focus, setFocus] = useState<RecipeFocus | undefined>(profile.goal === "styrka" ? "muskler" : undefined);
  const [open, setOpen] = useState<Recipe | null>(null);
  const [portions, setPortions] = useState(1);
  const list = recipesFor(profile.diet, profile.restrictions, focus);

  const copy = async (r: Recipe) => {
    try { await navigator.clipboard.writeText(ingredientsText(r, portions)); toast.success("Ingredienserna är kopierade"); }
    catch { toast.error("Kunde inte kopiera"); }
  };

  return (
    <section className="card-soft space-y-3 p-5">
      <h2 className="flex items-center gap-2 text-lg font-semibold"><ChefHat className="h-5 w-5 text-primary" /> Recept</h2>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        <button onClick={() => setFocus(undefined)} className={`min-h-9 shrink-0 rounded-full px-3 text-xs ${!focus ? "bg-primary text-primary-foreground" : "bg-muted"}`}>Alla</button>
        {RECIPE_FOCUS.map((f) => (
          <button key={f.value} onClick={() => setFocus(f.value)} className={`min-h-9 shrink-0 rounded-full px-3 text-xs ${focus === f.value ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{f.label}</button>
        ))}
      </div>
      {list.length === 0 ? <p className="py-4 text-center text-sm text-muted-foreground">Inga recept matchar dina val just nu.</p> : (
        <ul className="space-y-2">
          {list.map((r) => (
            <li key={r.id}>
              <button onClick={() => { setOpen(r); setPortions(1); }} className="flex min-h-14 w-full items-center justify-between gap-2 rounded-2xl bg-muted px-4 py-2 text-left">
                <span>
                  <span className="block font-medium">{r.name}</span>
                  <span className="text-sm text-muted-foreground">{r.minutes} min · {r.protein} g protein{showKcal ? ` · ${r.kcal} kcal` : ""}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          {open && (<>
            <DialogHeader><DialogTitle>{open.name}</DialogTitle></DialogHeader>
            <p className="flex items-center gap-2 text-sm text-muted-foreground"><Clock className="h-4 w-4" /> {open.minutes} min · per portion: {open.protein} g P · {open.carbs} g K · {open.fat} g F{showKcal ? ` · ${open.kcal} kcal` : ""}</p>
            <div className="flex items-center gap-2">
              <span className="text-sm">Portioner</span>
              {[1, 2, 4].map((n) => (
                <button key={n} onClick={() => setPortions(n)} className={`h-9 w-9 rounded-full text-sm ${portions === n ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{n}</button>
              ))}
            </div>
            <div>
              <h3 className="mb-1 font-semibold">Ingredienser</h3>
              <ul className="list-disc space-y-0.5 pl-5 text-sm">{scaleIngredients(open, portions).map((l) => <li key={l}>{l}</li>)}</ul>
            </div>
            <div>
              <h3 className="mb-1 font-semibold">Gör så här</h3>
              <ol className="list-decimal space-y-0.5 pl-5 text-sm">{open.steps.map((s) => <li key={s}>{s}</li>)}</ol>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" className="h-12 rounded-full" onClick={() => copy(open)}><Copy /> Kopiera</Button>
              <Button className="h-12 rounded-full" onClick={() => {
                onLog({ type: open.type, name: open.name, amount: "1 portion", kcal: open.kcal, protein: open.protein, carbs: open.carbs, fat: open.fat });
                toast.success("Loggad i dagens mat"); setOpen(null);
              }}><Plus /> Logga 1 portion</Button>
            </div>
          </>)}
        </DialogContent>
      </Dialog>
    </section>
  );
}
