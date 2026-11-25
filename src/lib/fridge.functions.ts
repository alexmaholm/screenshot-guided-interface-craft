import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const dish = z.object({
  name: z.string(),
  why: z.string(),
  uses: z.array(z.string()),
  extra: z.array(z.string()),
  steps: z.array(z.string()),
  minutes: z.number(),
  kcal: z.number(),
  protein: z.number(),
});
const schema = z.object({ dishes: z.array(dish) });
export type FridgeDish = z.infer<typeof dish>;

const SYSTEM = `Du är en svensk kock och kostcoach i appen Balans. Användaren listar vad som finns i kylen/skafferiet.
Föreslå exakt 3 olika, enkla rätter (max 30 min) som främst använder de ingredienserna. Basvaror (salt, peppar, olja, vatten) får antas finnas.
"uses" = ingredienser från listan, "extra" = max 2 saker som kan behövas utöver (gärna tom), "steps" = 3–5 korta steg, "why" = en mening om varför den passar användarens fokus.
kcal och protein (gram) per portion. Följ ALLTID användarens kost och restriktioner strikt. Skriv ren svensk text utan markdown.`;

export const fridgeIdeas = createServerFn({ method: "POST" })
  .inputValidator(
    (input: { text: string; diet: string; restrictions: string[]; focus: string }) => {
      const text = typeof input?.text === "string" ? input.text.trim() : "";
      if (text.length < 2 || text.length > 500)
        throw new Error("Skriv vad du har hemma (max 500 tecken).");
      const restrictions = Array.isArray(input.restrictions)
        ? input.restrictions.map(String).slice(0, 10)
        : [];
      return {
        text,
        diet: String(input.diet ?? "").slice(0, 60),
        restrictions,
        focus: String(input.focus ?? "").slice(0, 80),
      };
    },
  )
  .handler(
    async ({
      data,
    }): Promise<{ ok: true; dishes: FridgeDish[] } | { ok: false; error: string }> => {
      const { geminiModel } = await import("./gemini.server");
      const model = await geminiModel();
      if (!model) return { ok: false, error: "AI-funktionen är inte konfigurerad." };
      const { streamText, Output } = await import("ai");
      try {
        const result = streamText({
          model,
          system: SYSTEM,
          output: Output.object({ schema }),
          maxRetries: 0,
          prompt: `Kost: ${data.diet || "äter det mesta"}. Restriktioner: ${data.restrictions.join(", ") || "inga"}. Fokus: ${data.focus || "balans"}.\nI kylen: ${data.text}`,
        });
        const out = await result.output;
        return { ok: true, dishes: out.dishes.slice(0, 3) };
      } catch (e) {
        const status = (e as { statusCode?: number }).statusCode;
        if (status === 429)
          return { ok: false, error: "För många förfrågningar just nu – försök igen om en stund." };
        console.error("fridgeIdeas", e);
        return { ok: false, error: "Kunde inte ta fram förslag. Försök igen." };
      }
    },
  );
