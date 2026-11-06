export type Theme = "stealth" | "warm";
export const THEME_KEY = "balans-theme";
export const THEMES: { id: Theme; name: string; desc: string; swatch: [string, string] }[] = [
  { id: "stealth", name: "Nordic Stealth", desc: "Mörk grafit med limeaccent", swatch: ["oklch(0.16 0.004 260)", "oklch(0.9 0.17 120)"] },
  { id: "warm", name: "Skandinavisk värme", desc: "Ljus havre med skogsgrönt", swatch: ["oklch(0.965 0.016 85)", "oklch(0.36 0.07 160)"] },
];
export function getTheme(): Theme {
  try { return localStorage.getItem(THEME_KEY) === "warm" ? "warm" : "stealth"; } catch { return "stealth"; }
}
export function setTheme(t: Theme) {
  try { localStorage.setItem(THEME_KEY, t); } catch { /* ignore */ }
  if (t === "warm") document.documentElement.dataset["theme"] = "warm";
  else delete document.documentElement.dataset["theme"];
}
