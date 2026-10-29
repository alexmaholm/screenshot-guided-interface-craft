import { createServerFn } from "@tanstack/react-start";

const SYSTEM = `Du är Balans AI-coach: en varm, stöttande och realistisk svensk livsstilscoach för kost, träning och återhämtning.
Regler:
- Svara på svenska, kort (max ca 120 ord), konkret och med 2–4 punkter när det passar.
- Använd användarens kontext (dagens mat, kvarvarande makron, fokus, allergier, senaste pass).
- Föreslå aldrig något som bryter mot användarens allergier eller kostval.
- Aldrig dömande, ingen kaloriskam, inga medicinska löften eller diagnoser. Vid smärta, skada, sjukdom eller graviditet: rekommendera att prata med vården.
- Vila och återhämtning räknas som framsteg.`;

export const askCoach = createServerFn({ method: "POST" })
  .inputValidator((input: { question: string; context: string }) => {
    const question = typeof input?.question === "string" ? input.question.trim() : "";
    const context = typeof input?.context === "string" ? input.context.slice(0, 2000) : "";
    if (question.length < 2 || question.length > 500) throw new Error("Skriv en kort fråga (max 500 tecken).");
    return { question, context };
  })
  .handler(async ({ data }): Promise<{ ok: true; answer: string } | { ok: false; error: string }> => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { ok: false, error: "AI-coachen är inte konfigurerad." };
    const { createOpenAI } = await import("@ai-sdk/openai");
    const { streamText } = await import("ai");
    const openai = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey: key,
      headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    });
    try {
      const result = streamText({
        model: openai.responses("openai/gpt-6-astra"),
        system: SYSTEM,
        maxRetries: 0,
        prompt: `Användarens läge just nu:\n${data.context}\n\nFråga: ${data.question}`,
        providerOptions: { openai: { forceReasoning: true, reasoningEffort: "low", store: false } },
      });
      const answer = (await result.text).trim();
      if (!answer) return { ok: false, error: "Coachen kunde inte svara på det. Prova en annan fråga." };
      return { ok: true, answer };
    } catch (e) {
      const status = (e as { statusCode?: number }).statusCode;
      if (status === 429) return { ok: false, error: "Många frågor just nu – försök igen om en stund." };
      if (status === 402) return { ok: false, error: "AI-krediterna är slut för tillfället." };
      console.error("askCoach", e);
      return { ok: false, error: "Coachen kunde inte svara just nu. Försök igen." };
    }
  });
