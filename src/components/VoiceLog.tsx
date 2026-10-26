import { useRef, useState } from "react";
import { Mic } from "lucide-react";
import { toast } from "sonner";
import { parseVoice, type VoiceCommand } from "@/lib/voice";

type Rec = { lang: string; interimResults: boolean; start: () => void; stop: () => void; onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onend: (() => void) | null; onerror: (() => void) | null };

/** Mikrofonknapp för handsfree-loggning under passet. */
export function VoiceLog({ onCommand }: { onCommand: (c: VoiceCommand) => string | null }) {
  const [on, setOn] = useState(false);
  const rec = useRef<Rec | null>(null);
  const start = () => {
    const W = window as unknown as { SpeechRecognition?: new () => Rec; webkitSpeechRecognition?: new () => Rec };
    const Ctor = W.SpeechRecognition ?? W.webkitSpeechRecognition;
    if (!Ctor) return toast.error("Röststyrning stöds inte på den här enheten än.");
    if (on) return rec.current?.stop();
    const r = new Ctor();
    r.lang = "sv-SE";
    r.interimResults = false;
    r.onresult = (e) => {
      const text = e.results[0]?.[0]?.transcript ?? "";
      const cmd = parseVoice(text);
      if (!cmd) return void toast(`"${text}" – säg t.ex. "10 reps på 20 kilo"`);
      const msg = onCommand(cmd);
      if (msg) toast.success(msg);
    };
    r.onend = () => setOn(false);
    r.onerror = () => setOn(false);
    rec.current = r;
    setOn(true);
    r.start();
  };
  return (
    <button onClick={start} aria-label={on ? "Lyssnar" : "Logga med rösten"} aria-pressed={on}
      className={`fixed bottom-24 right-5 z-40 grid h-14 w-14 place-items-center rounded-full shadow-lg transition ${on ? "animate-pulse bg-coral text-primary-foreground" : "bg-primary text-primary-foreground"}`}>
      <Mic className="h-6 w-6" />
    </button>
  );
}
