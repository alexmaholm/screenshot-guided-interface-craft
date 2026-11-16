import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { update, useBalans } from "@/lib/balans";

const SLIDES = [
  { icon: "📸", title: "Logga mat på sekunder", text: "Fota tallriken, blippa streckkoden eller skriv vad du åt – AI:n räknar ut näringen åt dig." },
  { icon: "🎙️", title: "Röststyrd gymlogg", text: "Säg ditt set, dina reps och din vikt handsfree. Du ser direkt när du slår förra passet." },
  { icon: "🌿", title: "Vila är också framsteg", text: "Markera vilodagar – de bryter aldrig din svit. Balans peppar, aldrig skäms." },
  { icon: "✨", title: "Din personliga AI-coach", text: "Tryck på stjärnknappen och fråga vad du vill – svaren anpassas efter ditt fokus och dina kostval." },
];

export function AppTour() {
  const s = useBalans();
  const [i, setI] = useState(0);
  const open = !!s?.profile && !s.profile.tourSeen;
  const done = () => { setI(0); update((st) => (st.profile ? { ...st, profile: { ...st.profile, tourSeen: true } } : st)); };
  const slide = SLIDES[i]!;
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) done(); }}>
      <DialogContent className="max-w-sm rounded-xl p-8 text-center">
        <div className="text-6xl" aria-hidden>{slide.icon}</div>
        <DialogTitle className="text-2xl">{slide.title}</DialogTitle>
        <DialogDescription className="text-base">{slide.text}</DialogDescription>
        <div className="flex justify-center gap-2" aria-label={`Steg ${i + 1} av ${SLIDES.length}`}>
          {SLIDES.map((_, k) => <span key={k} className={`h-2 rounded-full transition-all ${k === i ? "w-6 bg-primary" : "w-2 bg-muted"}`} />)}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" className="h-12 flex-1 rounded-md" onClick={done}>Hoppa över</Button>
          <Button className="h-12 flex-1 rounded-md" onClick={() => (i < SLIDES.length - 1 ? setI(i + 1) : done())}>
            {i < SLIDES.length - 1 ? "Nästa" : "Kom igång"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
