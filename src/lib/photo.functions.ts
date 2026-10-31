import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { PlateAnalysis } from "./photolog";

const itemSchema = z.object({
  name: z.string(),
  grams: z.number(),
  kcal: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fat: z.number(),
  fiber: z.number(),
  sugar: z.number(),
  satFat: z.number(),
  salt: z.number(),
});
const schema = z.object({
  title: z.string(),
  items: z.array(itemSchema),
  questions: z.array(z.object({ id: z.string(), question: z.string(), options: z.array(z.string()) })),
});

const SYSTEM = `Du är en svensk kostexpert som analyserar foton av måltider.
Identifiera varje synlig råvara/komponent, uppskatta vikt i gram och beräkna kcal, protein, kolhydrater, fett, fibrer (fiber), socker (sugar), mättat fett (satFat) och salt (salt) i gram för den mängden.
Om något inte går att avgöra säkert från bilden (t.ex. typ av sås/dressing, tillagningsfett, panering, dryck, dolda ingredienser, osäker portion), lägg en kort fråga på svenska i "questions" med 2–4 korta svarsalternativ. Ställ max 4 frågor (max 4 svarsalternativ), och bara när det påverkar näringen märkbart.
Om svar på tidigare frågor ges, använd dem och ställ inte samma frågor igen.
"title" är ett kort svenskt namn på rätten. Om bilden inte visar mat: tom items och en fråga om vad användaren åt.`;

export const analyzePlate = createServerFn({ method: "POST" })
  .inputValidator((input: { image: string; answers?: { question: string; answer: string }[]; diet?: string | undefined }) => {
    if (typeof input?.image !== "string" || !input.image.startsWith("data:image/")) throw new Error("Ogiltig bild");
    if (input.image.length > 8_000_000) throw new Error("Bilden är för stor");
    return input;
  })
  .handler(async ({ data }): Promise<{ ok: true; result: PlateAnalysis } | { ok: false; error: string }> => {
    const { geminiModel } = await import("./gemini.server");
    const model = await geminiModel();
    if (!model) return { ok: false, error: "AI-analysen är inte konfigurerad." };
    const { streamText, Output } = await import("ai");
    const extra = [
      data.diet ? `Användarens kost: ${data.diet}.` : "",
      data.answers?.length ? "Svar från användaren:\n" + data.answers.map((a) => `- ${a.question} → ${a.answer}`).join("\n") : "",
    ].filter(Boolean).join("\n");
    try {
      const result = streamText({
        model,
        system: SYSTEM,
        output: Output.object({ schema }),
        maxRetries: 0,
        messages: [{ role: "user", content: [
          { type: "text", text: `Analysera tallriken.${extra ? "\n" + extra : ""}` },
          { type: "file", data: data.image, mediaType: data.image.slice(5, data.image.indexOf(";")) },
        ] }],
      });
      const out = await result.output;
      return { ok: true, result: out };
    } catch (e) {
      const status = (e as { statusCode?: number }).statusCode;
      if (status === 429) return { ok: false, error: "För många analyser just nu – försök igen om en stund." };
      if (status === 402) return { ok: false, error: "AI-krediterna är slut för tillfället." };
      console.error("analyzePlate", e);
      return { ok: false, error: "Kunde inte analysera bilden. Försök igen eller logga manuellt." };
    }
  });
