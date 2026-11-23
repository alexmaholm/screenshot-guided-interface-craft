import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { update, useBalans } from "@/lib/balans";
import { ScanLine, Mic, Activity, Cpu } from "lucide-react";

const SLIDES = [
  { icon: ScanLine, title: "Optisk makroanalys", text: "Fota, skanna streckkod eller skriv. AI:n beräknar makron på sekunder." },
  { icon: Mic, title: "Handsfree set-telemetri", text: "Säg set, reps och vikt. Progressionen mot förra passet visas direkt." },
  { icon: Activity, title: "Programmerad återhämtning", text: "Vilodagar är en del av systemet och bryter aldrig din svit." },
  { icon: Cpu, title: "Kontextmedveten AI-coach", text: "Fråga vad som helst. Svaren kalibreras mot ditt fokus, din kost och din dag." },
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
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg border border-border bg-muted" aria-hidden><slide.icon className="h-8 w-8 text-primary" strokeWidth={1.5} /></div>
        <DialogTitle className="text-2xl">{slide.title}</DialogTitle>
        <DialogDescription className="text-base">{slide.text}</DialogDescription>
        <div className="flex justify-center gap-2" aria-label={`Steg ${i + 1} av ${SLIDES.length}`}>
          {SLIDES.map((_, k) => <span key={k} className={`h-2 rounded-full transition-all ${k === i ? "w-6 bg-primary" : "w-2 bg-muted"}`} />)}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" className="h-12 flex-1 rounded-md" onClick={done}>Hoppa över</Button>
          <Button className="h-12 flex-1 rounded-md" onClick={() => (i < SLIDES.length - 1 ? setI(i + 1) : done())}>
            {i < SLIDES.length - 1 ? "Nästa" : "Starta"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
