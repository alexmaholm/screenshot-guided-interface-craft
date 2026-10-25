import { AlertTriangle, Footprints, MoveVertical, Wind } from "lucide-react";
import { ExerciseDemo, patternFor } from "@/components/ExerciseDemo";
import { TECHNIQUE, VIDEOS } from "@/lib/technique";
import type { ExercisePreset } from "@/lib/exercises";

/** Videoloop (eller rörelsefigur) + teknikcoach. Används i övningsbanken och under passet. */
export function TechniqueCoach({ ex }: { ex: ExercisePreset }) {
  const t = TECHNIQUE[patternFor(ex)];
  const video = VIDEOS[ex.id];
  const rows = [
    { icon: Footprints, title: "Startläge", text: t.start },
    { icon: MoveVertical, title: "Utförande", text: t.move },
    { icon: Wind, title: "Andning & tempo", text: t.breath },
  ];
  return (
    <div className="space-y-3">
      {video ? (
        <video src={video} autoPlay loop muted playsInline className="mx-auto aspect-square w-full max-w-64 rounded-2xl bg-card object-cover" />
      ) : (
        <ExerciseDemo ex={ex} className="mx-auto h-48 w-48" />
      )}
      <p className="text-sm">{ex.desc}</p>
      <ol className="space-y-2">
        {rows.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex gap-3 rounded-2xl bg-secondary p-3">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div><p className="text-sm font-semibold">{title}</p><p className="text-sm">{text}</p></div>
          </li>
        ))}
      </ol>
      <div className="rounded-2xl border border-coral/40 p-3">
        <p className="flex items-center gap-2 text-sm font-semibold"><AlertTriangle className="h-4 w-4 text-coral" /> Vanliga misstag</p>
        <ul className="mt-1 list-inside list-disc text-sm">{t.mistakes.map((m) => <li key={m}>{m}</li>)}</ul>
      </div>
      {ex.tips.length > 0 && (
        <div className="rounded-2xl bg-accent p-3">
          <p className="text-sm font-semibold">Tänk på</p>
          <ul className="mt-1 list-inside list-disc text-sm">{ex.tips.map((x) => <li key={x}>{x}</li>)}</ul>
        </div>
      )}
    </div>
  );
}
