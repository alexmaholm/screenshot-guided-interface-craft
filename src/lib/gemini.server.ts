// Shared Google Gemini model for all AI features (photo log, text log, coach).
// Uses Gemini's OpenAI-compatible endpoint with the project's GEMINI_API_KEY.
// Fast "lite" models answer in ~1 s. When one is overloaded (503) or retired (404),
// the next one in the list is tried automatically so users never see a silent failure.
export const GEMINI_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-flash-lite-latest",
  "gemini-3.1-flash-lite",
];
export const GEMINI_MODEL = GEMINI_MODELS[0]!;

export async function geminiModel() {
  const key = process.env["GEMINI_API_KEY"];
  if (!key) return null;
  const { createOpenAI } = await import("@ai-sdk/openai");
  const google = createOpenAI({
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai",
    apiKey: key,
  });
  const models = GEMINI_MODELS.map((m) => google.chat(m));
  const primary = models[0]!;
  type M = typeof primary;
  const withFallback = <K extends "doGenerate" | "doStream">(k: K) =>
    (async (opts: Parameters<M[K]>[0]) => {
      let last: unknown;
      for (const m of models) {
        try {
          return await (m[k] as (o: typeof opts) => ReturnType<M[K]>)(opts);
        } catch (e) {
          last = e;
        }
      }
      throw last;
    }) as M[K];
  return {
    ...primary,
    specificationVersion: primary.specificationVersion,
    provider: primary.provider,
    modelId: primary.modelId,
    supportedUrls: primary.supportedUrls,
    doGenerate: withFallback("doGenerate"),
    doStream: withFallback("doStream"),
  } as M;
}
