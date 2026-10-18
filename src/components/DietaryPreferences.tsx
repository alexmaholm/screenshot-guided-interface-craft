import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DIETS, RESTRICTIONS, type Profile } from "@/lib/balans";

export function DietaryPreferences({ profile, onChange }: { profile: Profile; onChange: (patch: Partial<Profile>) => void }) {
  const selected = profile.restrictions ?? [];
  return (
    <div className="space-y-5">
      <fieldset>
        <legend className="mb-3 text-sm font-medium">Kostinriktning</legend>
        <div className="flex flex-wrap gap-2">
          {DIETS.map((diet) => (
            <Button key={diet.value} variant="outline" className="chip h-auto whitespace-normal text-left" aria-pressed={(profile.diet ?? "allt") === diet.value} onClick={() => onChange({ diet: diet.value })}>
              {diet.label}
            </Button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-3 text-sm font-medium">Allergier och intoleranser</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {RESTRICTIONS.map(({ value, label }) => (
            <label key={value} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm">
              <input type="checkbox" className="h-5 w-5 shrink-0 accent-primary" checked={selected.includes(value)} onChange={() => onChange({ restrictions: selected.includes(value) ? selected.filter((r) => r !== value) : [...selected, value] })} />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <p className="flex items-start gap-2 text-xs text-muted-foreground"><Check className="h-4 w-4 shrink-0" aria-hidden />Förslag utgår från dina kostval. Kontrollera alltid ingredienser, märkning och risk för spår av allergener.</p>
    </div>
  );
}