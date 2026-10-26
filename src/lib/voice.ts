export type VoiceCommand = { reps?: number; kg?: number; done: boolean };

const WORDS: Record<string, number> = {
  noll: 0, en: 1, ett: 1, två: 2, tre: 3, fyra: 4, fem: 5, sex: 6, sju: 7, åtta: 8, nio: 9, tio: 10,
  elva: 11, tolv: 12, tretton: 13, fjorton: 14, femton: 15, sexton: 16, sjutton: 17, arton: 18, nitton: 19,
  tjugo: 20, trettio: 30, fyrtio: 40, femtio: 50, sextio: 60, sjuttio: 70, åttio: 80, nittio: 90, hundra: 100,
};

/** Tolkar svenska fraser som "10 reps på 20 kilo", "8 repetitioner 22,5 kg" eller "klar". */
export function parseVoice(text: string): VoiceCommand | null {
  let t = ` ${text.toLowerCase().replace(/(\d),(\d)/g, "$1.$2")} `;
  t = t.replace(/\b([a-zåäö]+)\b/g, (w) => (w in WORDS ? String(WORDS[w]) : w));
  t = t.replace(/(\d+) och en halv/g, (_, n) => `${Number(n) + 0.5}`).replace(/(\d+) komma (\d)/g, "$1.$2");
  const kg = t.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilo|kilogram)/)?.[1];
  const reps = t.match(/(\d+)\s*(?:reps?|repetitioner|repetition|gånger|st)\b/)?.[1];
  const done = /\b(klar|klart|färdig|färdigt|done)\b/.test(t);
  if (!kg && !reps && !done) return null;
  const cmd: VoiceCommand = { done: done || !!reps };
  if (reps) cmd.reps = Number(reps);
  if (kg) cmd.kg = Number(kg);
  return cmd;
}
