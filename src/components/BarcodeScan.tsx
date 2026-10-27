import { useEffect, useRef, useState } from "react";
import { Loader2, Minus, Plus, ScanBarcode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isValidBarcode, lookupBarcode, measureGrams, MEASURE_STEP, portionFor, type BarcodeProduct, type Measure } from "@/lib/barcode";

type Saved = { name: string; amount: string; kcal: number; protein: number; carbs: number; fat: number };

export function BarcodeScan({ showKcal, onSave }: { showKcal: boolean; onSave: (m: Saved) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const stopRef = useRef<(() => void) | null>(null);
  const [scanning, setScanning] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [manual, setManual] = useState("");
  const [product, setProduct] = useState<BarcodeProduct | null>(null);
  const [qty, setQty] = useState(100);
  const [unit, setUnit] = useState<Measure>("g");

  const stop = () => { stopRef.current?.(); stopRef.current = null; setScanning(false); };
  useEffect(() => stop, []);

  const find = async (code: string) => {
    stop();
    if (!isValidBarcode(code)) return setError("Streckkoden ska vara 8 eller 12–14 siffror.");
    setBusy(true); setError("");
    try {
      const p = await lookupBarcode(code.trim());
      if (!p) { setError("Hittade inte varan. Lägg till den under Egen."); return; }
      setProduct(p); setUnit("g"); setQty(Math.round(p.servingG ?? 100));
    } catch { setError("Kunde inte söka just nu. Kontrollera internet och försök igen."); }
    finally { setBusy(false); }
  };

  const start = async () => {
    setError(""); setProduct(null); setScanning(true);
    try {
      const { BrowserMultiFormatReader } = await import("@zxing/browser");
      const reader = new BrowserMultiFormatReader();
      const controls = await reader.decodeFromVideoDevice(undefined, videoRef.current!, (result) => {
        if (result) { navigator.vibrate?.(40); void find(result.getText()); }
      });
      stopRef.current = () => controls.stop();
    } catch {
      setScanning(false);
      setError("Kameran kunde inte startas. Tillåt kamera eller skriv in koden.");
    }
  };

  if (product) {
    const units: Measure[] = product.servingG ? ["g", "tsk", "msk", "dl", "portion"] : ["g", "tsk", "msk", "dl"];
    const g = unit === "g" ? qty : measureGrams(unit, qty, product.servingG);
    const m = portionFor(product, g);
    const step = MEASURE_STEP[unit];
    const label = unit === "g" ? `${g} g` : `${String(qty).replace(".", ",")} ${unit} (${g} g)`;
    const pick = (u: Measure) => { setUnit(u); setQty(u === "g" ? Math.round(product.servingG ?? 100) : 1); };
    return (
      <div className="space-y-4">
        <div className="rounded-2xl bg-muted p-4">
          <p className="font-semibold">{product.name}</p>
          <p className="text-sm text-muted-foreground">Per 100 g: {showKcal ? `${product.kcal} kcal · ` : ""}{product.protein} g P · {product.carbs} g K · {product.fat} g F</p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {units.map((u) => <button key={u} className="chip" aria-pressed={unit === u} onClick={() => pick(u)}>{u}</button>)}
        </div>
        <div className="flex items-center justify-between gap-2">
          <Button variant="secondary" size="icon" className="h-12 w-12 rounded-full" aria-label={`Minska ${step} ${unit}`} onClick={() => setQty((q) => Math.max(0, +(q - step).toFixed(1)))}><Minus /></Button>
          <label className="flex items-center gap-2">
            <Input inputMode="decimal" className="h-12 w-24 rounded-xl text-center text-lg" value={String(qty).replace(".", ",")} onChange={(e) => { const n = Number(e.target.value.replace(",", ".").replace(/[^\d.]/g, "")); setQty(Number.isFinite(n) ? Math.max(0, n) : 0); }} aria-label="Mängd" />
            <span>{unit}</span>
          </label>
          <Button variant="secondary" size="icon" className="h-12 w-12 rounded-full" aria-label={`Öka ${step} ${unit}`} onClick={() => setQty((q) => +(q + step).toFixed(1))}><Plus /></Button>
        </div>
        {unit !== "g" && <p className="text-center text-xs text-muted-foreground">≈ {g} g</p>}
        <p className="text-center text-sm">{showKcal ? `${m.kcal} kcal · ` : ""}{m.protein} g protein · {m.carbs} g kolhydrater · {m.fat} g fett</p>
        <Button className="h-12 w-full rounded-full" disabled={g <= 0} onClick={() => onSave({ name: product.name, amount: label, ...m })}>Lägg till</Button>
        <Button variant="ghost" className="h-11 w-full rounded-full" onClick={() => setProduct(null)}>Skanna en annan</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className={`relative overflow-hidden rounded-2xl bg-muted ${scanning ? "aspect-[4/3]" : "hidden"}`}>
        <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
        <div className="pointer-events-none absolute inset-x-8 top-1/2 h-24 -translate-y-1/2 rounded-xl border-2 border-primary" />
      </div>
      {scanning ? (
        <Button variant="secondary" className="h-12 w-full rounded-full" onClick={stop}>Avbryt</Button>
      ) : (
        <Button className="h-14 w-full rounded-full" onClick={start} disabled={busy}>
          {busy ? <Loader2 className="animate-spin" /> : <ScanBarcode />} Skanna streckkod
        </Button>
      )}
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); void find(manual); }}>
        <Input inputMode="numeric" className="h-12 rounded-xl" placeholder="Eller skriv koden" value={manual} onChange={(e) => setManual(e.target.value.replace(/\D/g, ""))} />
        <Button type="submit" variant="secondary" className="h-12 rounded-xl" disabled={busy}>Sök</Button>
      </form>
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
    </div>
  );
}
