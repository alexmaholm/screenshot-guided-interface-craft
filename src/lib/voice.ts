export type VoiceCommand = { reps?: number; kg?: number; done: boolean };

const ONES: Record<string, number> = {
  noll: 0, en: 1, ett: 1, två: 2, tre: 3, fyra: 4, fem: 5, sex: 6, sju: 7, åtta: 8, nio: 9, tio: 10,
  elva: 11, tolv: 12, tretton: 13, fjorton: 14, femton: 15, sexton: 16, sjutton: 17, arton: 18, nitton: 19,
};
const TENS: Record<string, number> = { tjugo: 20, trettio: 30, fyrtio: 40, femtio: 50, sextio: 60, sjuttio: 70, åttio: 80, nittio: 90 };

/** "tjugofem" → 25, "hundrafemtio" → 150, "tolv" → 12. */
function wordToNumber(w: string): number | undefined {
  if (w in ONES) return ONES[w];
  let rest = w, total = 0;
  const h = rest.match(/^(?:(en|ett|två|tre|fyra|fem)?hundra)/);
  if (h) { total += (h[1] ? ONES[h[1]]! : 1) * 100; rest = rest.slice(h[0].length); }
  for (const [k, v] of Object.entries(TENS)) if (rest.startsWith(k)) { total += v; rest = rest.slice(k.length); break; }
  if (rest && rest in ONES) { total += ONES[rest]!; rest = ""; }
  return rest === "" && total > 0 ? total : undefined;
}

const DONE = /\b(klar|klart|färdig|färdigt|done|nästa|bocka|check|okej|ok)\b/;

/** Tolkar svenska gymfraser: "10 reps på 20 kilo", "10 på 20", "tjugofem kilo", "12 st", "klar", "nästa". */
export function parseVoice(text: string): VoiceCommand | null {
  let t = ` ${text.toLowerCase().replace(/(\d),(\d)/g, "$1.$2")} `;
  t = t.replace(/[a-zåäö]+/g, (w) => { const n = wordToNumber(w); return n === undefined ? w : String(n); });
  t = t.replace(/(\d+) och en halv/g, (_, n) => `${Number(n) + 0.5}`).replace(/(\d+) (?:komma|punkt) (\d)/g, "$1.$2");
  let kg = t.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilo|kilogram|kilon)/)?.[1];
  let reps = t.match(/(\d+)\s*(?:reps?|repetitioner|repetition|gånger|st|stycken|lyft)\b/)?.[1];
  const pair = t.match(/(\d+)\s+(?:på|med|x|gånger)\s+(\d+(?:\.\d+)?)/);
  if (pair) { reps ??= pair[1]; kg ??= pair[2]; }
  const done = DONE.test(t);
  if (!kg && !reps) {
    const lone = t.trim().match(/^(\d+(?:\.\d+)?)$/)?.[1];
    if (lone && !lone.includes(".")) reps = lone;
  }
  if (!kg && !reps && !done) return null;
  const cmd: VoiceCommand = { done: done || !!reps };
  if (reps) cmd.reps = Number(reps);
  if (kg) cmd.kg = Number(kg);
  return cmd;
}
