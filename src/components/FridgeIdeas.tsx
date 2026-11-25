import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CalendarPlus, Loader2, Refrigerator } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { fridgeIdeas, type FridgeDish } from "@/lib/fridge.functions";
import {
  dateKey,
  DIETS,
  NUTRITION_FOCUS,
  nutritionFocusOf,
  RESTRICTIONS,
  uid,
  update,
  type Profile,
} from "@/lib/balans";

export function FridgeIdeas({ profile }: { profile: Profile }) {
  const run = useServerFn(fridgeIdeas);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [dishes, setDishes] = useState<FridgeDish[]>([]);

  const ask = async () => {
    setBusy(true);
    try {
      const focus = nutritionFocusOf(profile);
      const res = await run({
        data: {
          text,
          diet: DIETS.find((d) => d.value === (profile.diet ?? "allt"))?.label ?? "",
          restrictions: (profile.restrictions ?? []).map(
            (r) => RESTRICTIONS.find((x) => x.value === r)?.label ?? r,
          ),
          focus: NUTRITION_FOCUS.find((f) => f.value === focus)?.label ?? "",
        },
      });
      if (res.ok) setDishes(res.dishes);
      else toast.error(res.error);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Något gick fel.");
    } finally {
      setBusy(false);
    }
  };

  const plan = (d: FridgeDish) => {
    update((st) => ({
      ...st,
      mealPlan: [
        ...(st.mealPlan ?? []),
        {
          id: uid(),
          date: dateKey(new Date()),
          type: "middag",
          name: d.name,
          kcal: Math.round(d.kcal),
          protein: Math.round(d.protein),
        },
      ],
    }));
    toast.success("Lagd i veckoplanen som dagens middag");
  };

  return (
    <section className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Refrigerator className="h-5 w-5 text-primary" />
        <h2 className="font-semibold">Töm kylen</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Skriv vad du har hemma så får du tre rätter som passar dina kostval.
      </p>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={500}
        placeholder="t.ex. kyckling, ris, paprika, crème fraiche, spenat"
      />
      <Button onClick={ask} disabled={busy || text.trim().length < 2} className="w-full">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ge mig förslag"}
      </Button>
      {dishes.map((d) => (
        <div key={d.name} className="rounded-md bg-muted/50 p-3 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-medium">{d.name}</p>
              <p className="text-xs text-muted-foreground">
                {Math.round(d.minutes)} min · {Math.round(d.kcal)} kcal · {Math.round(d.protein)} g
                protein
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => plan(d)}
              aria-label="Lägg i veckoplanen"
            >
              <CalendarPlus className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm">{d.why}</p>
          <p className="text-xs text-muted-foreground">
            Använder: {d.uses.join(", ")}
            {d.extra.length ? ` · Behöver även: ${d.extra.join(", ")}` : ""}
          </p>
          <ol className="list-decimal pl-5 text-sm space-y-0.5">
            {d.steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </div>
      ))}
    </section>
  );
}
