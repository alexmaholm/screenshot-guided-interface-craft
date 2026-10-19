import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { foodsFor, portion, UNIT_LABEL, useBalans, type Food, type Unit } from "@/lib/balans";

export interface FoodPick { name: string; amount: string; kcal: number; protein: number; carbs: number; fat: number }

export function FoodSearch({ onPick, showKcal }: { onPick: (p: FoodPick) => void; showKcal: boolean }) {
  const s = useBalans();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Food | null>(null);
  const [qty, setQty] = useState("1");
  const [unit, setUnit] = useState<Unit>("g");
  const list = foodsFor(s?.profile?.diet, s?.profile?.restrictions, q);

  const choose = (f: Food) => {
    setSel(f);
    const u = (Object.keys(f.units).find((k) => k !== "g") as Unit | undefined) ?? "g";
    setUnit(u);
    setQty(u === "g" ? "100" : "1");
  };

  if (sel) {
    const n = Number(qty.replace(",", "."));
    const valid = Number.isFinite(n) && n > 0;
    const p = valid ? portion(sel, n, unit) : null;
    return (
      <div className="space-y-3">
        <p className="font-semibold">{sel.name}</p>
        <div className="flex gap-2">
          <Input aria-label="Mängd" inputMode="decimal" className="h-12 w-24 rounded-xl" value={qty} onChange={(e) => setQty(e.target.value)} />
          <div className="flex flex-wrap gap-2">
            {(Object.keys(sel.units) as Unit[]).map((u) => (
              <button key={u} className="chip" aria-pressed={unit === u} onClick={() => setUnit(u)}>{UNIT_LABEL[u]}</button>
            ))}
          </div>
        </div>
        {p ? (
          <p className="rounded-2xl bg-muted p-3 text-sm">
            ca {Math.round(p.grams)} g · {p.protein} g protein · {p.carbs} g kolhydrater · {p.fat} g fett{showKcal ? ` · ${p.kcal} kcal` : ""}
          </p>
        ) : <p className="text-sm text-destructive">Ange en mängd större än 0.</p>}
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" className="h-12 rounded-full" onClick={() => setSel(null)}>Tillbaka</Button>
          <Button className="h-12 rounded-full" disabled={!p} onClick={() => p && onPick({ name: sel.name, amount: `${qty} ${UNIT_LABEL[unit]}`, kcal: p.kcal, protein: p.protein, carbs: p.carbs, fat: p.fat })}>Lägg till</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input aria-label="Sök livsmedel" placeholder="Sök t.ex. havregryn, kyckling…" className="h-12 rounded-xl pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <ul className="max-h-72 space-y-2 overflow-y-auto">
        {list.length === 0 && <li className="py-6 text-center text-sm text-muted-foreground">Inga träffar som passar din kost.</li>}
        {list.map((f) => (
          <li key={f.name}>
            <button onClick={() => choose(f)} className="flex min-h-12 w-full items-center justify-between rounded-2xl bg-muted px-4 py-2 text-left hover:bg-secondary">
              <span className="font-medium">{f.name}</span>
              <span className="text-xs text-muted-foreground">{f.protein} g prot{showKcal ? ` · ${f.kcal} kcal` : ""} /100 g</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
