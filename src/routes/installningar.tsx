import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, NeedsOnboarding, PageLoading } from "@/components/AppShell";
import { DietaryPreferences } from "@/components/DietaryPreferences";
import { AccountCard } from "@/components/AccountCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { isNativeHealthAvailable, healthSourceName, readHealthToday, mergeHealth, type HealthSyncPrefs } from "@/lib/health";
import { dateKey, getState, NUTRITION_FOCUS, nutritionFocusOf, resetAll, update, useBalans, WEEKDAYS, type Profile } from "@/lib/balans";
import { supabase } from "@/integrations/supabase/client";
import { deleteMyAccount } from "@/lib/account.functions";
import { exportFilename, exportPayload } from "@/lib/export";

async function exportData() {
  const blob = new Blob([JSON.stringify(exportPayload(getState()), null, 2)], { type: "application/json" });
  const name = exportFilename();
  const file = new File([blob], name, { type: blob.type });
  if (matchMedia("(pointer: coarse)").matches && navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: name }); return; }
    catch (e) { if ((e as DOMException).name === "AbortError") return; }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
  toast.success("Din data är exporterad");
}

async function deleteEverything() {
  if (!confirm("Radera konto och all data? Detta går inte att ångra.")) return;
  const { data } = await supabase.auth.getSession();
  if (data.session) {
    try { await deleteMyAccount(); await supabase.auth.signOut(); }
    catch { toast.error("Kunde inte radera kontot i molnet. Försök igen."); return; }
  }
  resetAll();
  toast.success("All data är raderad");
}

export const Route = createFileRoute("/installningar")({
  head: () => ({
    meta: [
      { title: "Inställningar – Aequiv" },
      { name: "description", content: "Ändra fokus, vikt, kostval, träningsdagar och villkor i Aequiv." },
      { property: "og:title", content: "Inställningar – Aequiv" },
      { property: "og:description", content: "Anpassa Aequiv efter dig." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const s = useBalans();
  return <AppShell>{!s ? <PageLoading /> : !s.profile ? <NeedsOnboarding /> : <Settings />}</AppShell>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="space-y-2"><h2 className="label-xs px-1 text-muted-foreground">{title}</h2><div className="panel space-y-4 p-5">{children}</div></section>;
}

function Settings() {
  const s = useBalans()!;
  const p = s.profile!;
  const latest = [...s.body].sort((a, b) => a.date.localeCompare(b.date)).at(-1);
  const [weight, setWeight] = useState(latest ? String(latest.weight) : "");
  const set = (patch: Partial<Profile>) => update((st) => (st.profile ? { ...st, profile: { ...st.profile, ...patch } } : st));
  const focus = nutritionFocusOf(p);

  return (
    <div className="space-y-5">
      <header className="space-y-3">
        <Link to="/profil" className="-ml-1 inline-flex h-9 items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ChevronLeft className="h-4 w-4" aria-hidden /> Profil</Link>
        <div>
          <p className="label-xs telemetry text-muted-foreground">Konto · Inställningar</p>
          <h1 className="mt-1 text-[2rem] font-semibold tracking-[-0.03em]">Inställningar</h1>
        </div>
      </header>

      <Section title="Ditt fokus">
        <div className="flex flex-wrap gap-2">
          {NUTRITION_FOCUS.map((f) => (
            <Button key={f.value} variant="outline" className="h-10 rounded-md aria-pressed:border-primary aria-pressed:text-primary" aria-pressed={focus === f.value} onClick={() => set({ nutritionFocus: f.value })}>{f.label}</Button>
          ))}
        </div>
      </Section>

      <Section title="Kroppsvikt">
        <form className="flex gap-2" onSubmit={(e) => {
          e.preventDefault();
          const v = Number(weight.replace(",", "."));
          if (!(v >= 30 && v <= 300)) { toast.error("Ange en vikt mellan 30 och 300 kg"); return; }
          const today = dateKey();
          update((st) => ({ ...st, body: [...st.body.filter((b) => b.date !== today), { date: today, weight: v }] }));
          toast.success("Vikten är sparad");
        }}>
          <Input aria-label="Vikt i kilo" inputMode="decimal" placeholder="Kilo" className="h-11 rounded-md telemetry" value={weight} onChange={(e) => setWeight(e.target.value)} />
          <Button type="submit" className="h-11 rounded-md">Spara</Button>
        </form>
      </Section>

      <Section title="Kostval & allergier">
        <DietaryPreferences profile={p} onChange={set} />
      </Section>

      <Section title="Träningsdagar">
        <div className="grid grid-cols-7 gap-1">
          {WEEKDAYS.map((d, i) => (
            <button key={d} type="button" aria-pressed={p.days.includes(i)} onClick={() => set({ days: p.days.includes(i) ? p.days.filter((x) => x !== i) : [...p.days, i].sort() })} className="label-xs h-11 rounded-md border border-border text-muted-foreground aria-pressed:border-primary aria-pressed:text-primary">{d}</button>
          ))}
        </div>
        <label className="flex items-center justify-between gap-3 text-sm">Passlängd (minuter)
          <Input type="number" min={10} max={120} className="h-11 w-24 rounded-md telemetry text-right" value={p.sessionMin} onChange={(e) => set({ sessionMin: Math.min(120, Math.max(10, Number(e.target.value) || 30)) })} />
        </label>
      </Section>

      <Section title="Upplevelse">
        <label className="flex items-center justify-between gap-3 text-sm">Dölj kalorier
          <Switch checked={p.hideCalories} onCheckedChange={(v) => set({ hideCalories: v })} />
        </label>
        <label className="flex items-center justify-between gap-3 text-sm">Vattenmål (glas/dag)
          <Input type="number" min={1} max={20} className="h-11 w-24 rounded-md telemetry text-right" value={p.waterGoal} onChange={(e) => set({ waterGoal: Math.min(20, Math.max(1, Number(e.target.value) || 1)) })} />
        </label>
      </Section>

      <Section title="Hälso-synk">
        <p className="text-sm text-muted-foreground">Synka med {healthSourceName()} så hamnar förbränning, steg och vikt automatiskt i Aequiv.</p>
        {([["calories", "Aktiva kalorier"], ["steps", "Steg"], ["weight", "Kroppsvikt"]] as const).map(([k, label]) => {
          const hs = p.healthSync ?? { calories: false, steps: false, weight: false };
          return (
            <label key={k} className="flex min-h-11 items-center justify-between gap-3 text-sm">{label}
              <Switch checked={hs[k]} onCheckedChange={(v) => {
                if (v && !isNativeHealthAvailable()) toast(`Synken med ${healthSourceName()} aktiveras i mobilappen – ditt val är sparat.`);
                set({ healthSync: { ...hs, [k]: v } });
              }} />
            </label>
          );
        })}
        <HealthToday prefs={p.healthSync ?? { calories: false, steps: false, weight: false }} />
      </Section>

      <Section title="Konto">
        <AccountCard />
      </Section>

      <Section title="Din data">
        <p className="text-sm text-muted-foreground">Ladda ner alla pass, lyft, måltider, vanor och vikt som en fil.</p>
        <Button variant="outline" className="h-12 w-full rounded-md" onClick={() => void exportData()}>Exportera all data</Button>
      </Section>

      <Section title="Villkor & integritet">
        <p className="text-sm text-muted-foreground">Aequiv är inspiration för vardag och träning – inte medicinsk rådgivning.</p>
        <div className="flex flex-col">
          <Link to="/integritet" className="flex min-h-11 items-center text-sm font-medium underline-offset-4 hover:underline">Integritetspolicy</Link>
          <Link to="/villkor" className="flex min-h-11 items-center text-sm font-medium underline-offset-4 hover:underline">Användarvillkor</Link>
        </div>
      </Section>

      <Button variant="outline" className="h-12 w-full rounded-md border-destructive/40 text-destructive" onClick={deleteEverything}>Radera konto och all data</Button>
    </div>
  );
}

function HealthToday({ prefs }: { prefs: HealthSyncPrefs }) {
  const s = useBalans();
  const [busy, setBusy] = useState(false);
  const today = dateKey(new Date());
  const d = s?.health?.[today];
  if (!(prefs.calories || prefs.steps || prefs.weight)) return null;
  const sync = async () => {
    if (!isNativeHealthAvailable()) { toast(`Synken med ${healthSourceName()} fungerar i mobilappen.`); return; }
    setBusy(true);
    try {
      const r = await readHealthToday(prefs, today);
      if (r) update((st) => ({ ...st, ...mergeHealth(st, r) }));
      toast("Synkat!");
    } catch { toast("Kunde inte hämta data från hälsoappen."); }
    finally { setBusy(false); }
  };
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-border p-3 text-sm">
      <span className="telemetry text-muted-foreground">Idag: {d?.steps ?? "–"} steg · {d?.activeKcal ?? "–"} aktiva kcal</span>
      <Button size="sm" variant="outline" className="rounded-md" disabled={busy} onClick={sync}>{busy ? "Synkar…" : "Synka nu"}</Button>
    </div>
  );
}
