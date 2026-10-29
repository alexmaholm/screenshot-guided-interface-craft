import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { weekReport } from "@/lib/progress";
import type { Workout } from "@/lib/balans";

interface Props { workouts: Workout[]; days: string[]; restDays: number; streak: number; waterAvg: number; mealDays: number }

function compare(kg: number) {
  if (kg >= 1500) return `Det motsvarar ungefär ${Math.round(kg / 1500)} personbil${kg >= 3000 ? "ar" : ""} 🚗`;
  if (kg >= 500) return `Det är som att lyfta ${Math.round(kg / 500)} flygel${kg >= 1000 ? "lar" : ""} 🎹`;
  return "Varje kilo räknas – fin start! 💪";
}

export function SundayReport({ workouts, days, restDays, streak, waterAvg, mealDays }: Props) {
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);
  const r = weekReport(workouts, days);
  const slides = [
    { k: "Din vecka", big: `${r.workouts}`, unit: r.workouts === 1 ? "pass" : "pass", sub: `${r.minutes} minuters rörelse` },
    { k: "Total lyft volym", big: r.volumeKg >= 1000 ? (r.volumeKg / 1000).toLocaleString("sv-SE", { maximumFractionDigits: 1 }) : `${r.volumeKg}`, unit: r.volumeKg >= 1000 ? "ton" : "kg", sub: compare(r.volumeKg) },
    { k: "Veckans tyngsta lyft", big: r.topLift ? `${r.topLift.kg}` : "–", unit: r.topLift ? "kg" : "", sub: r.topLift?.name ?? "Logga vikter så dyker ditt toppyft upp här" },
    { k: "Kontinuitet", big: `${streak}`, unit: "dagar i rad", sub: restDays ? `${restDays} vilodag${restDays > 1 ? "ar" : ""} – vila är också framsteg 🌿` : `Mat loggad ${mealDays}/7 dagar · ${waterAvg.toFixed(1)} glas vatten/dag` },
  ];
  const s = slides[i]!;
  const share = async () => {
    const text = `Min vecka med Balans: ${r.workouts} pass, ${r.volumeKg} kg lyft, ${streak} dagar i rad 💪`;
    try {
      if (navigator.share) await navigator.share({ text });
      else { await navigator.clipboard.writeText(text); toast.success("Kopierat – klistra in var du vill"); }
    } catch { /* användaren avbröt */ }
  };

  return (
    <>
      <button onClick={() => { setI(0); setOpen(true); }} className="bg-hero w-full rounded-3xl p-5 text-left text-primary-foreground active:scale-[0.99]">
        <p className="text-sm opacity-80">Söndagsrapport</p>
        <p className="font-display text-2xl font-bold">Veckans rapport är redo 🎉</p>
        <p className="mt-1 text-sm opacity-90">Tryck för att se din vecka</p>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-hero max-w-sm overflow-hidden rounded-3xl border-0 p-0 text-primary-foreground">
          <DialogTitle className="sr-only">Söndagsrapport</DialogTitle>
          <div className="flex gap-1 px-5 pt-5">{slides.map((_, n) => <span key={n} className={`h-1 flex-1 rounded-full bg-primary-foreground ${n <= i ? "opacity-100" : "opacity-30"}`} />)}</div>
          <div className="flex min-h-[340px] flex-col justify-center px-6 py-8 text-center" onClick={() => setI((n) => Math.min(slides.length - 1, n + 1))}>
            <p className="text-sm uppercase tracking-widest opacity-80">{s.k}</p>
            <p className="font-display mt-3 text-7xl font-bold leading-none">{s.big}</p>
            <p className="mt-1 text-xl font-semibold">{s.unit}</p>
            <p className="mt-5 text-base opacity-90">{s.sub}</p>
          </div>
          <div className="flex gap-2 px-5 pb-5">
            <Button variant="secondary" className="h-12 flex-1 rounded-full" onClick={() => setI((n) => Math.max(0, n - 1))} disabled={i === 0}>Tillbaka</Button>
            {i < slides.length - 1
              ? <Button variant="secondary" className="h-12 flex-1 rounded-full" onClick={() => setI(i + 1)}>Nästa</Button>
              : <Button variant="secondary" className="h-12 flex-1 rounded-full" onClick={share}>Dela</Button>}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
