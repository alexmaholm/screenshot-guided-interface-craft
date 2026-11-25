import { useEffect, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { foodsFor, portion, UNIT_LABEL, useBalans, type Food, type Unit } from "@/lib/balans";
import type { BarcodeProduct } from "@/lib/barcode";
import { searchBrandFoods } from "@/lib/foodsearch.functions";

export interface FoodPick {
  name: string;
  amount: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

const toFood = (p: BarcodeProduct): Food => ({
  name: p.name,
  kcal: p.kcal,
  protein: p.protein,
  carbs: p.carbs,
  fat: p.fat,
  units: p.servingG ? { g: 1, st: p.servingG } : { g: 1 },
  contains: [],
});

export function FoodSearch({
  onPick,
  showKcal,
}: {
  onPick: (p: FoodPick) => void;
  showKcal: boolean;
}) {
  const s = useBalans();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Food | null>(null);
  const [qty, setQty] = useState("1");
  const [unit, setUnit] = useState<Unit>("g");
  const [brands, setBrands] = useState<BarcodeProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const list = foodsFor(s?.profile?.diet, s?.profile?.restrictions, q);

  useEffect(() => {
    const term = q.trim();
    setFailed(false);
    if (term.length < 2) {
      setBrands([]);
      setLoading(false);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    const t = setTimeout(() => {
      searchBrandFoods({ data: { q: term } })
        .then((r) => {
          if (!ctrl.signal.aborted) setBrands(r);
        })
        .catch(() => {
          if (!ctrl.signal.aborted) {
            setBrands([]);
            setFailed(true);
          }
        })
        .finally(() => {
          if (!ctrl.signal.aborted) setLoading(false);
        });
    }, 400);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

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
          <Input
            aria-label="Mängd"
            inputMode="decimal"
            className="h-12 w-24 rounded-md"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            {(Object.keys(sel.units) as Unit[]).map((u) => (
              <button key={u} className="chip" aria-pressed={unit === u} onClick={() => setUnit(u)}>
                {UNIT_LABEL[u]}
              </button>
            ))}
          </div>
        </div>
        {p ? (
          <p className="rounded-lg bg-muted p-3 text-sm">
            ca {Math.round(p.grams)} g · {p.protein} g protein · {p.carbs} g kolhydrater · {p.fat} g
            fett{showKcal ? ` · ${p.kcal} kcal` : ""}
          </p>
        ) : (
          <p className="text-sm text-destructive">Ange en mängd större än 0.</p>
        )}
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" className="h-12 rounded-md" onClick={() => setSel(null)}>
            Tillbaka
          </Button>
          <Button
            className="h-12 rounded-md"
            disabled={!p}
            onClick={() =>
              p &&
              onPick({
                name: sel.name,
                amount: `${qty} ${UNIT_LABEL[unit]}`,
                kcal: p.kcal,
                protein: p.protein,
                carbs: p.carbs,
                fat: p.fat,
              })
            }
          >
            Lägg till
          </Button>
        </div>
      </div>
    );
  }

  const row = (key: string, name: string, f: Food) => (
    <li key={key}>
      <button
        onClick={() => choose(f)}
        className="flex min-h-12 w-full items-center justify-between gap-3 rounded-lg bg-muted px-4 py-2 text-left hover:bg-secondary"
      >
        <span className="font-medium">{name}</span>
        <span className="shrink-0 text-xs text-muted-foreground">
          {f.protein} g prot{showKcal ? ` · ${f.kcal} kcal` : ""} /100 g
        </span>
      </button>
    </li>
  );

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          aria-label="Sök livsmedel"
          placeholder="Sök t.ex. havregryn, Nocco, Barebells…"
          className="h-12 rounded-md pl-9"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <ul className="max-h-80 space-y-2 overflow-y-auto">
        {list.map((f) => row(f.name, f.name, f))}
        {q.trim().length >= 2 && (
          <li className="flex items-center gap-2 pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Märkesvaror {loading && <Loader2 className="h-3 w-3 animate-spin" />}
          </li>
        )}
        {brands.map((b) => row(`off-${b.code}`, b.name, toFood(b)))}
        {q.trim().length >= 2 && !loading && brands.length === 0 && (
          <li className="py-2 text-center text-sm text-muted-foreground">
            {failed ? "Kunde inte söka märkesvaror just nu." : "Inga märkesvaror hittades."}
          </li>
        )}
        {q.trim().length < 2 && list.length === 0 && (
          <li className="py-6 text-center text-sm text-muted-foreground">
            Inga träffar som passar din kost.
          </li>
        )}
      </ul>
    </div>
  );
}
