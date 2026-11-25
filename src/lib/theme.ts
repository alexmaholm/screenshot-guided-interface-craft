export type Theme = "stealth" | "warm";
export const THEME_KEY = "balans-theme";
export const THEMES: { id: Theme; name: string; desc: string; swatch: [string, string] }[] = [
  {
    id: "stealth",
    name: "Mörkt läge",
    desc: "Mörk bakgrund",
    swatch: ["oklch(0.16 0.004 260)", "oklch(0.9 0.17 120)"],
  },
  {
    id: "warm",
    name: "Ljust läge",
    desc: "Ljus bakgrund",
    swatch: ["oklch(0.975 0.002 260)", "oklch(0.9 0.19 120)"],
  },
];
export function getTheme(): Theme {
  try {
    return localStorage.getItem(THEME_KEY) === "warm" ? "warm" : "stealth";
  } catch {
    return "stealth";
  }
}
export function setTheme(t: Theme) {
  try {
    localStorage.setItem(THEME_KEY, t);
  } catch {
    /* ignore */
  }
  if (t === "warm") document.documentElement.dataset["theme"] = "warm";
  else delete document.documentElement.dataset["theme"];
}
