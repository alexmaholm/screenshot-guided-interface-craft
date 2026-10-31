import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  name: z.string(),
  amount: z.string(),
  kcal: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fat: z.number(),
  fiber: z.number(),
  sugar: z.number(),
  satFat: z.number(),
  salt: z.number(),
});
export type TextEstimate = z.infer<typeof schema>;

const SYSTEM = `Du är en svensk kostexpert. Användaren beskriver en måltid i fritext (svenska mått som g, dl, msk, tsk, st förekommer).
Uppskatta rimliga portioner om mängd saknas. Returnera för HELA måltiden: kort svenskt namn ("name"), kort mängdbeskrivning ("amount", t.ex. "2 ägg + 1 knäckemacka"), kcal, protein, kolhydrater, fett, fibrer, socker, mättat fett (satFat) och salt, alla i gram utom kcal. Avrunda till en decimal.`;

export const estimateText = createServerFn({ method: "POST" })
  .inputValidator((input: { text: string }) => {
    const text = typeof input?.text === "string" ? input.text.trim() : "";
    if (text.length < 2 || text.length > 500) throw new Error("Beskriv måltiden kort (max 500 tecken).");
    return { text };
  })
  .handler(async ({ data }): Promise<{ ok: true; result: TextEstimate } | { ok: false; error: string }> => {
    const { geminiModel } = await import("./gemini.server");
    const model = await geminiModel();
    if (!model) return { ok: false, error: "AI-beräkningen är inte konfigurerad." };
    const { streamText, Output } = await import("ai");
    try {
      const result = streamText({
        model,
        system: SYSTEM,
        output: Output.object({ schema }),
        maxRetries: 0,
        prompt: data.text,
      });
      return { ok: true, result: await result.output };
    } catch (e) {
      const status = (e as { statusCode?: number }).statusCode;
      if (status === 429) return { ok: false, error: "För många beräkningar just nu – försök igen om en stund." };
      if (status === 402) return { ok: false, error: "AI-krediterna är slut för tillfället." };
      console.error("estimateText", e);
      return { ok: false, error: "Kunde inte beräkna. Försök igen eller fyll i manuellt." };
    }
  });
