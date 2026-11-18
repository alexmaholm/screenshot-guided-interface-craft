import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { sanitizeActions, type CoachAction } from "./coachActions";
import type { CoachTurn } from "./coachTelemetry";

const schema = z.object({
  answer: z.string(),
  followUps: z.array(z.string()),
  actions: z.array(z.object({
    kind: z.enum(["log_meal", "log_water", "log_weight", "log_workout"]),
    type: z.enum(["frukost", "lunch", "middag", "mellanmål"]).optional(),
    name: z.string().optional(),
    amount: z.string().optional(),
    kcal: z.number().optional(), protein: z.number().optional(), carbs: z.number().optional(), fat: z.number().optional(),
    ml: z.number().optional(),
    kg: z.number().optional(),
    status: z.enum(["klart", "planerat"]).optional(),
    title: z.string().optional(),
    workoutKind: z.enum(["styrka", "kondition", "rörlighet"]).optional(),
    durationMin: z.number().optional(),
    exercises: z.array(z.object({
      name: z.string(),
      sets: z.array(z.object({ reps: z.number().optional(), kg: z.number().optional(), timeSec: z.number().optional() })),
    })).optional(),
  })),
});

const SYSTEM = `Du är Balans AI-coach: en varm, stöttande och realistisk svensk livsstilscoach för kost, träning och återhämtning.
Regler:
- Svara på svenska, kort (max ca 120 ord), konkret och med 2–4 punkter ("- ") när det passar.
- Skriv ren text: inga rubriker, inga stjärnor och ingen annan markdown utöver punktlistor.
- Använd användarens kontext (dagens mat, kvarvarande makron, fokus, allergier, senaste pass).
- Föreslå aldrig något som bryter mot användarens allergier eller kostval.
- Aldrig dömande, ingen kaloriskam, inga medicinska löften eller diagnoser. Vid smärta, skada, sjukdom eller graviditet: rekommendera att prata med vården.
- Vila och återhämtning räknas som framsteg.
- Ge i "followUps" exakt 3 korta naturliga följdfrågor (max ca 60 tecken) som användaren själv kan vilja ställa härnäst, skrivna i jag-form och kopplade till ditt svar.
- Förstå fritt vardagsspråk, slang, stavfel, svengelska och förkortningar (t.ex. "käkade", "slängde i mig", "4x10@80", "3x8 på 70", "PR", "halvliter", "en stor flaska"). Tolka hellre generöst än att be om förtydligande; fråga bara om något är helt omöjligt att uppskatta.
- "actions": Skapa ett kort för VARJE sak användaren berättar att hen gjort eller ber dig logga/skapa. Ett meddelande kan ge flera kort. Annars tom lista.
  - log_meal: en per måltid (type = frukost/lunch/middag/mellanmål, gissa utifrån tid/ord), name kort och tydligt, amount (t.ex. "1 tallrik", "3 st"), kcal/protein/carbs/fat som realistiska uppskattningar för svenska portioner och produkter. Summera hela måltiden inklusive tillbehör och dryck med kalorier.
  - log_water: ml (glas 250, flaska 500, stor flaska 750–1000). Räkna även kaffe/te/kolsyrat vatten utan socker.
  - log_weight: kg när användaren anger sin kroppsvikt.
  - log_workout: status "klart" för pass som gjorts, "planerat" när användaren ber dig skapa/föreslå ett pass. title, workoutKind (styrka/kondition/rörlighet), durationMin, exercises med vanliga svenska övningsnamn och ett objekt per set (reps, kg; timeSec för tidsövningar). "4x10 på 65" = fyra set à 10 reps 65 kg. Planerade pass ska passa användarens utrustning, fokus och muskelåterhämtning och undvika smärtande områden.
- Minne: du får tidigare meddelanden i samtalet. Bygg vidare på dem. "Byt ut X", "lägg till ett set", "gör det tyngre", "ta bort sista" syftar på det du nyss föreslog – skicka då ett NYTT komplett kort med ändringen.
- Återhämtning: följ muskelstatusen i kontexten. Planera inte tung träning för muskler med status "vila"; prioritera "redo". Nämn kort varför du valde musklerna.
- Progression: utgå från användarens bästa lyft. Föreslå konkreta vikter för planerade pass: ca 70–85 % av bästa vikten för 6–12 reps, eller +2,5 kg (överkropp) / +5 kg (underkropp) när användaren klarat samma vikt och reps förut. Gissa aldrig vikter för övningar utan historik – lämna kg tomt.
- Planerade styrkepass: 4–7 övningar, basövning först, 2–4 set per övning, total tid realistisk (ca 3 min per set inkl. vila).
- Kost: använd realistiska svenska värden (t.ex. ägg 70 kcal/6 g protein, 100 g kycklingfilé 110 kcal/23 g protein, 1 dl kokt ris 120 kcal, kvarg 200 g 120 kcal/22 g protein, lättmjölk 1 dl 39 kcal). Restaurangportioner är större än hemlagade.
- Säg kort i svaret vad korten innehåller och att användaren bekräftar med Logga.`;

export const askCoach = createServerFn({ method: "POST" })
  .inputValidator((input: { question: string; context: string; history?: CoachTurn[] }) => {
    const question = typeof input?.question === "string" ? input.question.trim() : "";
    const context = typeof input?.context === "string" ? input.context.slice(0, 4000) : "";
    if (question.length < 2 || question.length > 1500) throw new Error("Skriv max 1500 tecken.");
    const history = (Array.isArray(input?.history) ? input.history : []).slice(-8)
      .filter((t) => t && typeof t.q === "string" && typeof t.a === "string")
      .map((t) => ({ q: t.q.slice(0, 600), a: t.a.slice(0, 900) }));
    return { question, context, history };
  })
  .handler(async ({ data }): Promise<{ ok: true; answer: string; followUps: string[]; actions: CoachAction[] } | { ok: false; error: string }> => {
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
        prompt: `Användarens läge just nu:\n${data.context}\n\n${data.history.length ? `Tidigare i samtalet:\n${data.history.map((t) => `Användare: ${t.q}\nCoach: ${t.a}`).join("\n")}\n\n` : ""}Nytt meddelande: ${data.question}`,
      });
      const out = await result.output;
      const answer = out.answer.trim();
      if (!answer) return { ok: false, error: "Coachen kunde inte svara på det. Prova en annan fråga." };
      const followUps = out.followUps.map((f) => f.trim()).filter((f) => f.length > 1).slice(0, 3);
      return { ok: true, answer, followUps, actions: sanitizeActions(out.actions) };
    } catch (e) {
      const status = (e as { statusCode?: number }).statusCode;
      if (status === 429) return { ok: false, error: "Många frågor just nu – försök igen om en stund." };
      if (status === 402) return { ok: false, error: "AI-krediterna är slut för tillfället." };
      console.error("askCoach", e);
      return { ok: false, error: "Coachen kunde inte svara just nu. Försök igen." };
    }
  });
