import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { getTheme, setTheme, THEMES, type Theme } from "@/lib/theme";

export function ThemePicker() {
  const [theme, setT] = useState<Theme>("stealth");
  useEffect(() => setT(getTheme()), []);
  return (
    <section aria-label="Tema" className="panel space-y-3 p-5">
      <h2 className="label-xs text-muted-foreground">Tema</h2>
      <div className="grid grid-cols-2 gap-3">
        {THEMES.map((t) => (
          <button key={t.id} aria-pressed={theme === t.id} onClick={() => { setTheme(t.id); setT(t.id); }}
            className={`relative rounded-md border p-3 text-left ${theme === t.id ? "border-primary" : "border-border"}`}>
            <div className="mb-2 flex h-10 overflow-hidden rounded-sm border border-border">
              <span className="flex-[3]" style={{ background: t.swatch[0] }} />
              <span className="flex-1" style={{ background: t.swatch[1] }} />
            </div>
            <p className="text-sm font-semibold">{t.name}</p>
            <p className="text-xs text-muted-foreground">{t.desc}</p>
            {theme === t.id && <Check className="absolute right-2 top-2 h-4 w-4 text-primary" />}
          </button>
        ))}
      </div>
    </section>
  );
}
