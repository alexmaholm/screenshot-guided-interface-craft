import { Plus, Utensils } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { KIND_LABEL, recoverySuggestions, uid, update, type Profile, type Workout } from "@/lib/balans";

export function RecoveryMeals({ profile, workout, date }: { profile: Profile; workout: Workout | undefined; date: string }) {
  const suggestions = recoverySuggestions(profile, workout);
  if (!workout || !suggestions.length) return null;
  return (
    <section className="space-y-4 border-y py-5" aria-label="Mat efter träningen">
      <div className="flex items-start gap-3">
        <Utensils className="mt-1 h-5 w-5 shrink-0 text-coral" aria-hidden />
        <div>
          <h2 className="text-xl font-semibold">Mat efter träningen</h2>
          <p className="mt-1 text-sm text-muted-foreground">{KIND_LABEL[workout.kind]} · {workout.durationMin} min · {workout.title}</p>
          <p className="mt-2 text-sm">{workout.kind === "styrka" ? "Protein och kolhydrater kan stödja återhämtningen efter styrkepasset." : "Fyll på med en vanlig måltid och vatten efter passet."}</p>
        </div>
      </div>
      <ul className="divide-y">
        {suggestions.map((meal) => (
          <li key={meal.name} className="flex items-center gap-3 py-3">
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold">{meal.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{meal.amount} · ca {meal.protein} g protein{!profile.hideCalories ? ` · ca ${meal.kcal} kcal` : ""}</p>
            </div>
            <Button variant="outline" size="icon" className="h-11 w-11 shrink-0 rounded-full" aria-label={`Logga ${meal.name}`} title={`Logga ${meal.name}`} onClick={() => {
              update((state) => ({ ...state, meals: [...state.meals, { id: uid(), date, type: meal.type, name: meal.name, amount: meal.amount, kcal: meal.kcal, protein: meal.protein }] }));
              toast.success(`${meal.name} tillagd`);
            }}><Plus className="h-5 w-5" /></Button>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground">Ungefärliga näringsvärden, inte ett individuellt kostschema. Kontrollera ingredienser och allergenmärkning; välj växtdryck i chiapudding och olja i stället för smör till lax.</p>
    </section>
  );
}