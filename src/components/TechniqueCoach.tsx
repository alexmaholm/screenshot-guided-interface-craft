import { AlertTriangle, Footprints, MoveVertical, Wind } from "lucide-react";
import { ExerciseDemo, patternFor } from "@/components/ExerciseDemo";
import { TECHNIQUE, VIDEOS } from "@/lib/technique";
import { EXERCISES, similarExercises, type ExercisePreset } from "@/lib/exercises";
import { useState } from "react";

/** Videoloop (eller rörelsefigur) + teknikcoach. Används i övningsbanken och under passet. */
export function TechniqueCoach({ ex: start }: { ex: ExercisePreset }) {
  const [ex, setEx] = useState(start);
  const similar = similarExercises(EXERCISES, ex, patternFor);
  const t = TECHNIQUE[patternFor(ex)];
  const video = VIDEOS[ex.id];
  const rows = [
    { icon: Footprints, title: "Startläge", text: t.start },
    { icon: MoveVertical, title: "Utförande", text: t.move },
    { icon: Wind, title: "Andning & tempo", text: t.breath },
  ];
  return (
    <div className="space-y-3">
      {ex.id !== start.id && (
        <button onClick={() => setEx(start)} className="text-sm font-medium text-primary">
          ← Tillbaka till {start.name}
        </button>
      )}
      {ex.id !== start.id && <p className="text-lg font-bold">{ex.name}</p>}
      {video ? (
        <video
          src={video}
          autoPlay
          loop
          muted
          playsInline
          className="mx-auto aspect-square w-full max-w-64 rounded-lg bg-card object-cover"
        />
      ) : (
        <ExerciseDemo ex={ex} className="mx-auto w-60" />
      )}
      <p className="text-sm">{ex.desc}</p>
      <ol className="space-y-2">
        {rows.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex gap-3 rounded-lg bg-secondary p-3">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-semibold">{title}</p>
              <p className="text-sm">{text}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="rounded-lg border border-coral/40 p-3">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <AlertTriangle className="h-4 w-4 text-coral" /> Vanliga misstag
        </p>
        <ul className="mt-1 list-inside list-disc text-sm">
          {t.mistakes.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      </div>
      {ex.tips.length > 0 && (
        <div className="rounded-lg bg-accent p-3">
          <p className="text-sm font-semibold">Tänk på</p>
          <ul className="mt-1 list-inside list-disc text-sm">
            {ex.tips.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
      )}
      {similar.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold">Liknande övningar</p>
          <div className="flex flex-wrap gap-2">
            {similar.map((s) => (
              <button
                key={s.id}
                onClick={() => setEx(s)}
                className="min-h-10 rounded-md border border-border px-3 text-sm"
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
