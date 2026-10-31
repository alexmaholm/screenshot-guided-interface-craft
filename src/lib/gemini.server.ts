// Shared Google Gemini model for all AI features (photo log, text log, coach).
// Uses Gemini's OpenAI-compatible endpoint with the project's GEMINI_API_KEY.
// flash-lite: answers in ~1–3 s; gemini-3.8-flash hung >12 s per call.
export const GEMINI_MODEL = "gemini-3.1-flash-lite";

export async function geminiModel() {
  const key = process.env["GEMINI_API_KEY"];
  if (!key) return null;
  const { createOpenAI } = await import("@ai-sdk/openai");
  const google = createOpenAI({
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai",
    apiKey: key,
  });
  return google.chat(GEMINI_MODEL);
}
