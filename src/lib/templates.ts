import { uid, type Exercise, type Workout, type WorkoutKind } from "@/lib/balans";
import { EXERCISES } from "@/lib/exercises";

export interface WorkoutTemplate {
  id: string;
  title: string;
  kind: WorkoutKind;
  durationMin: number;
  exercises: Exercise[];
  custom?: boolean | undefined;
}

const ex = (name: string, sets = 3, reps = 10): Exercise => {
  const p = EXERCISES.find((e) => e.name === name);
  const rest = p?.restSec ?? 60;
  return p?.track === "tid"
    ? { name, sets: 2, timeSec: 40, restSec: rest, done: false }
    : { name, sets, reps, restSec: rest, done: false };
};

export const BUILT_IN_TEMPLATES: WorkoutTemplate[] = [
  { id: "push", title: "Överkropp – Push", kind: "styrka", durationMin: 45, exercises: [ex("Bänkpress", 4, 8), ex("Axelpress med hantlar"), ex("Lutande hantelpress"), ex("Sidolyft", 3, 12), ex("Triceps pushdown", 3, 12)] },
  { id: "pull", title: "Överkropp – Pull", kind: "styrka", durationMin: 45, exercises: [ex("Latsdrag"), ex("Sittande kabelrodd"), ex("Hantelrodd"), ex("Face pulls", 3, 15), ex("Bicepscurls", 3, 12)] },
  { id: "ben", title: "Underkropp & säte", kind: "styrka", durationMin: 50, exercises: [ex("Knäböj med skivstång", 4, 8), ex("Rumänsk marklyft"), ex("Benpress", 3, 12), ex("Höftlyft med skivstång"), ex("Bencurl", 3, 12)] },
  { id: "helkropp", title: "Helkroppspass 35 min", kind: "styrka", durationMin: 35, exercises: [ex("Goblet squat"), ex("Armhävningar"), ex("Hantelrodd"), ex("Glute bridge", 3, 12), ex("Planka")] },
  { id: "hemma", title: "Hemmapass utan redskap", kind: "styrka", durationMin: 25, exercises: [ex("Knäböj", 3, 15), ex("Armhävningar"), ex("Utfallssteg"), ex("Superman"), ex("Mountain climbers")] },
];

/** Skapar ett nytt planerat pass från en mall – set nollställs, inga gamla avbockningar följer med. */
export function workoutFromTemplate(t: WorkoutTemplate, date: string): Workout {
  return {
    id: uid(), date, title: t.title, kind: t.kind, durationMin: t.durationMin, status: "planerat",
    exercises: t.exercises.map((e) => ({ ...e, done: false, log: e.log?.map((r) => ({ ...r, done: false })) })),
  };
}

/** Sparar ett pass som egen mall (vikter och reps behålls som utgångsläge). */
export function templateFromWorkout(w: Workout, title = w.title): WorkoutTemplate {
  return {
    id: uid(), title, kind: w.kind, durationMin: w.durationMin, custom: true,
    exercises: w.exercises.map((e) => ({ ...e, done: false, log: e.log?.map((r) => ({ ...r, done: false })) })),
  };
}
