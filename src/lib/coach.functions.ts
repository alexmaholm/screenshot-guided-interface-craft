import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  answer: z.string(),
  followUps: z.array(z.string()),
});

const SYSTEM = `Du är Balans AI-coach: en varm, stöttande och realistisk svensk livsstilscoach för kost, träning och återhämtning.
Regler:
- Svara på svenska, kort (max ca 120 ord), konkret och med 2–4 punkter ("- ") när det passar.
- Skriv ren text: inga rubriker, inga stjärnor och ingen annan markdown utöver punktlistor.
- Använd användarens kontext (dagens mat, kvarvarande makron, fokus, allergier, senaste pass).
- Föreslå aldrig något som bryter mot användarens allergier eller kostval.
- Aldrig dömande, ingen kaloriskam, inga medicinska löften eller diagnoser. Vid smärta, skada, sjukdom eller graviditet: rekommendera att prata med vården.
- Vila och återhämtning räknas som framsteg.
- Ge i "followUps" exakt 3 korta naturliga följdfrågor (max ca 60 tecken) som användaren själv kan vilja ställa härnäst, skrivna i jag-form och kopplade till ditt svar.`;

export const askCoach = createServerFn({ method: "POST" })
  .inputValidator((input: { question: string; context: string }) => {
    const question = typeof input?.question === "string" ? input.question.trim() : "";
    const context = typeof input?.context === "string" ? input.context.slice(0, 2000) : "";
    if (question.length < 2 || question.length > 500) throw new Error("Skriv en kort fråga (max 500 tecken).");
    return { question, context };
  })
  .handler(async ({ data }): Promise<{ ok: true; answer: string; followUps: string[] } | { ok: false; error: string }> => {
    const { geminiModel } = await import("./gemini.server");
    const model = await geminiModel();
    if (!model) return { ok: false, error: "AI-coachen är inte konfigurerad." };
    const { streamText, Output } = await import("ai");
    try {
      const result = streamText({
        model,
        system: SYSTEM,
        output: Output.object({ schema }),
        maxRetries: 0,
        prompt: `Användarens läge just nu:\n${data.context}\n\nFråga: ${data.question}`,
      });
      const out = await result.output;
      const answer = out.answer.trim();
      if (!answer) return { ok: false, error: "Coachen kunde inte svara på det. Prova en annan fråga." };
      const followUps = out.followUps.map((f) => f.trim()).filter((f) => f.length > 1).slice(0, 3);
      return { ok: true, answer, followUps };
    } catch (e) {
      const status = (e as { statusCode?: number }).statusCode;
      if (status === 429) return { ok: false, error: "Många frågor just nu – försök igen om en stund." };
      if (status === 402) return { ok: false, error: "AI-krediterna är slut för tillfället." };
      console.error("askCoach", e);
      return { ok: false, error: "Coachen kunde inte svara just nu. Försök igen." };
    }
  });
