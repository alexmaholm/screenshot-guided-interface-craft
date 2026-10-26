import { useEffect, useRef, useState } from "react";
import { Mic } from "lucide-react";
import { toast } from "sonner";
import { parseVoice, type VoiceCommand } from "@/lib/voice";

type Result = { isFinal: boolean; 0: { transcript: string } };
type Rec = {
  lang: string; interimResults: boolean; continuous: boolean; maxAlternatives: number;
  start: () => void; stop: () => void; abort: () => void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<Result> }) => void) | null;
  onend: (() => void) | null; onerror: (() => void) | null;
};

/** Mikrofonknapp: lyssnar kontinuerligt, visar texten live och loggar direkt när ett kommando känns igen. */
export function VoiceLog({ onCommand }: { onCommand: (c: VoiceCommand) => string | null }) {
  const [on, setOn] = useState(false);
  const [live, setLive] = useState("");
  const rec = useRef<Rec | null>(null);
  const want = useRef(false);
  const handled = useRef<Set<number>>(new Set());
  const cb = useRef(onCommand);
  cb.current = onCommand;
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => { want.current = false; kill(); }, []);

  const run = (text: string, key: number) => {
    if (handled.current.has(key)) return true;
    const cmd = parseVoice(text);
    if (!cmd) return false;
    handled.current.add(key);
    const msg = cb.current(cmd);
    if (msg) toast.success(msg);
    navigator.vibrate?.(30);
    return true;
  };

  const kill = () => {
    clearTimeout(timer.current);
    const old = rec.current;
    rec.current = null;
    if (old) { old.onresult = null; old.onend = null; old.onerror = null; try { old.abort(); } catch { /* redan stoppad */ } }
  };

  // Ny igenkännare varje gång: iOS/WebKit vägrar ofta starta om samma instans, och resultatindex börjar om från 0.
  const begin = (Ctor: new () => Rec) => {
    kill();
    const r = new Ctor();
    r.lang = "sv-SE";
    r.interimResults = true;
    r.continuous = true;
    r.maxAlternatives = 1;
    handled.current = new Set();
    r.onresult = (e) => {
      if (rec.current !== r) return;
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i]!;
        const text = res[0].transcript.trim();
        setLive(text);
        clearTimeout(timer.current);
        if (res.isFinal) {
          if (!run(text, i)) toast(`"${text}" – säg t.ex. "10 på 20" eller "klar"`);
          timer.current = setTimeout(() => setLive(""), 1500);
        } else if (/\b(klar|nästa|kilo|kg|reps?|på)\b/i.test(text)) {
          timer.current = setTimeout(() => { if (rec.current === r) run(text, i); }, 450);
        }
      }
    };
    r.onend = () => {
      if (rec.current !== r) return;
      if (want.current) setTimeout(() => { if (want.current && rec.current === r) { try { begin(Ctor); } catch { want.current = false; setOn(false); } } }, 250);
      else { rec.current = null; setOn(false); setLive(""); }
    };
    r.onerror = () => {};
    rec.current = r;
    r.start();
  };

  const toggle = () => {
    const W = window as unknown as { SpeechRecognition?: new () => Rec; webkitSpeechRecognition?: new () => Rec };
    const Ctor = W.SpeechRecognition ?? W.webkitSpeechRecognition;
    if (!Ctor) return void toast.error("Röststyrning stöds inte på den här enheten än.");
    if (on) { want.current = false; kill(); setOn(false); setLive(""); return; }
    want.current = true;
    setOn(true);
    try { begin(Ctor); } catch { want.current = false; setOn(false); }
  };

  useEffect(() => {
    const onHide = () => { if (document.hidden) { want.current = false; kill(); setOn(false); setLive(""); } };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, []);

  return (
    <>
      {on && (
        <div className="fixed bottom-40 right-5 z-40 max-w-[70vw] rounded-2xl bg-card px-4 py-2 text-sm shadow-lg" aria-live="polite">
          {live || <span className="text-muted-foreground">Lyssnar…</span>}
        </div>
      )}
      <button onClick={toggle} aria-label={on ? "Sluta lyssna" : "Logga med rösten"} aria-pressed={on}
        className={`fixed bottom-24 right-5 z-40 grid h-14 w-14 place-items-center rounded-full shadow-lg transition ${on ? "animate-pulse bg-coral text-primary-foreground" : "bg-primary text-primary-foreground"}`}>
        <Mic className="h-6 w-6" />
      </button>
    </>
  );
}
