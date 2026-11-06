import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { getTheme, setTheme, THEMES, type Theme } from "@/lib/theme";

export function ThemePicker() {
  const [theme, setT] = useState<Theme>("stealth");
  useEffect(() => setT(getTheme()), []);
  return (
    <section aria-label="Tema" className="card-soft space-y-3 p-5">
      <h2 className="font-semibold">Tema</h2>
      <div className="grid grid-cols-2 gap-3">
        {THEMES.map((t) => (
          <button key={t.id} aria-pressed={theme === t.id} onClick={() => { setTheme(t.id); setT(t.id); }}
            className={`relative rounded-lg border p-3 text-left ${theme === t.id ? "border-primary ring-2 ring-primary" : ""}`}>
            <div className="mb-2 flex h-10 overflow-hidden rounded-md border">
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
