import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, Settings } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { AppShell, NeedsOnboarding, PageLoading } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addDays, dateKey, update, useBalans } from "@/lib/balans";
import { streakInfo } from "@/lib/habits";
import { weightTrend } from "@/lib/progress";
import { Paywall } from "@/components/Paywall";
import { PLANS, status, trialDaysLeft } from "@/lib/tiers";

function WeightTrendChart({ body }: { body: { date: string; weight: number }[] }) {
  const pts = weightTrend(body).slice(-60);
  const last = pts[pts.length - 1]!;
  const first = pts[0]!;
  const diff = Math.round((last.trend - first.trend) * 10) / 10;
  if (pts.length < 2) return <p className="text-sm text-muted-foreground">Trend: {String(last.trend).replace(".", ",")} kg. Väg dig några gånger till så visas kurvan.</p>;
  const vals = pts.flatMap((p) => [p.weight, p.trend]);
  const min = Math.min(...vals) - 0.5, max = Math.max(...vals) + 0.5;
  const W = 300, H = 110;
  const x = (i: number) => (i / (pts.length - 1)) * W;
  const y = (v: number) => H - ((v - min) / (max - min)) * H;
  const line = pts.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.trend).toFixed(1)}`).join(" ");
  return (
    <div className="space-y-1">
      <p className="text-sm"><span className="font-semibold">Trend {String(last.trend).replace(".", ",")} kg</span> <span className="text-muted-foreground">· {diff === 0 ? "stabil" : `${diff > 0 ? "+" : "−"}${String(Math.abs(diff)).replace(".", ",")} kg`} sedan start</span></p>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-28 w-full" role="img" aria-label="Vikttrend">
        {pts.map((p, i) => <circle key={p.date} cx={x(i)} cy={y(p.weight)} r={2.5} className="fill-muted-foreground/40" />)}
        <path d={line} fill="none" strokeWidth={2.5} strokeLinecap="round" className="stroke-primary" />
      </svg>
      <p className="text-xs text-muted-foreground">Prickarna är dagens vågsiffra, linjen din verkliga trend – vätskesvängningar jämnas ut.</p>
    </div>
  );
}

export const Route = createFileRoute("/profil")({
  head: () => ({
    meta: [
      { title: "Profil – Balans" },
      { name: "description", content: "Ditt namn, din profilbild och din resa i Balans." },
      { property: "og:title", content: "Profil – Balans" },
      { property: "og:description", content: "Din personliga profil i Balans." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfilePage,
});

const AVATARS = ["🌿", "💪", "🏃", "🧘", "🔥", "🌞", "🍓", "⚡"];

function ProfilePage() {
  const s = useBalans();
  return <AppShell>{!s ? <PageLoading /> : !s.profile ? <NeedsOnboarding /> : <Profile />}</AppShell>;
}

function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const size = 256;
      const c = document.createElement("canvas");
      c.width = size; c.height = size;
      const ctx = c.getContext("2d")!;
      const m = Math.min(img.width, img.height);
      ctx.drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, size, size);
      resolve(c.toDataURL("image/jpeg", 0.8));
      URL.revokeObjectURL(img.src);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function Profile() {
  const s = useBalans()!;
  const p = s.profile!;
  const [name, setName] = useState(p.name);
  const fileRef = useRef<HTMLInputElement>(null);
  const streak = streakInfo(s, dateKey(), addDays);
  const done = s.workouts.filter((w) => w.status === "klart").length;
  const avatar = p.avatar ?? "🌿";
  const isPhoto = avatar.startsWith("data:");
  const setProfile = (patch: Partial<typeof p>) => update((st) => (st.profile ? { ...st, profile: { ...st.profile, ...patch } } : st));

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Profil</h1>
        <Link to="/installningar" aria-label="Inställningar" className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Settings className="h-5 w-5" aria-hidden />
        </Link>
      </header>

      <section className="card-soft flex flex-col items-center gap-4 p-6 text-center">
        <button type="button" onClick={() => fileRef.current?.click()} className="relative" aria-label="Byt profilbild">
          <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-secondary text-5xl">
            {isPhoto ? <img src={avatar} alt="Profilbild" className="h-full w-full object-cover" /> : <span aria-hidden>{avatar}</span>}
          </div>
          <span className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground"><Camera className="h-4 w-4" aria-hidden /></span>
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          try { setProfile({ avatar: await resizeImage(f) }); toast.success("Profilbild uppdaterad"); } catch { toast.error("Kunde inte läsa bilden"); }
        }} />
        <div className="flex flex-wrap justify-center gap-2">
          {AVATARS.map((a) => (
            <button key={a} type="button" aria-pressed={avatar === a} onClick={() => setProfile({ avatar: a })} className="h-11 w-11 rounded-full border text-xl aria-pressed:border-primary aria-pressed:bg-secondary">{a}</button>
          ))}
        </div>
        <form className="flex w-full max-w-sm gap-2" onSubmit={(e) => { e.preventDefault(); const n = name.trim(); if (!n) return; setProfile({ name: n.slice(0, 40) }); toast.success("Namnet är sparat"); }}>
          <Input aria-label="Användarnamn" className="h-12 rounded-xl" value={name} maxLength={40} onChange={(e) => setName(e.target.value)} />
          <Button type="submit" className="h-12 rounded-full">Spara</Button>
        </form>
      </section>

      <section className="grid grid-cols-3 gap-3">
        {[{ v: streak.streak, l: "dagar i rad" }, { v: done, l: "pass klara" }, { v: s.meals.length, l: "måltider" }].map((x) => (
          <div key={x.l} className="card-soft p-4 text-center"><div className="text-2xl font-bold">{x.v}</div><div className="text-xs text-muted-foreground">{x.l}</div></div>
        ))}
      </section>

      <WeightLog />

      <Link to="/installningar" className="card-soft flex min-h-14 items-center justify-between p-5 font-semibold">
        <span className="flex items-center gap-3"><Settings className="h-5 w-5" aria-hidden /> Inställningar</span>
        <span aria-hidden>›</span>
      </Link>

      <button onClick={() => update((st) => (st.profile ? { ...st, profile: { ...st.profile, tourSeen: false } } : st))} className="card-soft flex min-h-14 w-full items-center justify-between p-5 text-left font-semibold">
        <span>✨ Visa introduktion</span><span aria-hidden>›</span>
      </button>

      <Membership />
    </div>
  );
}

function WeightLog() {
  const s = useBalans()!;
  const [weight, setWeight] = useState("");
  const [show, setShow] = useState(false);
  const today = dateKey();
  return (
    <section className="card-soft p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Vikt (frivilligt)</h2>
          <p className="text-sm text-muted-foreground">Helt valfritt. Visas bara om du vill.</p>
        </div>
        <Button variant="outline" className="h-11 rounded-full" onClick={() => setShow(!show)}>{show ? "Dölj" : "Visa"}</Button>
      </div>
      {show && (
        <div className="mt-4 space-y-3">
          <form className="flex gap-2" onSubmit={(e) => {
            e.preventDefault();
            const v = Number(weight.replace(",", "."));
            if (!Number.isFinite(v) || v < 20 || v > 400) { toast.error("Ange en vikt i kilo, t.ex. 72,5"); return; }
            update((st) => ({ ...st, body: [...st.body.filter((b) => b.date !== today), { date: today, weight: v }] }));
            setWeight("");
            toast.success("Sparat");
          }}>
            <Input className="h-12 rounded-xl" inputMode="decimal" placeholder="Kilo" value={weight} onChange={(e) => setWeight(e.target.value)} aria-label="Vikt i kilo" />
            <Button type="submit" className="h-12 rounded-full">Spara</Button>
          </form>
          {s.body.length === 0 ? <p className="text-sm text-muted-foreground">Inga mätningar ännu.</p> : (
            <>
              <WeightTrendChart body={s.body} />
              <ul className="text-sm">
                {[...s.body].reverse().slice(0, 5).map((b) => (
                  <li key={b.date} className="flex justify-between py-1"><span>{b.date}</span><span>{b.weight} kg</span></li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </section>
  );
}

function Membership() {
  const s = useBalans()!;
  const [open, setOpen] = useState(false);
  const sub = s.subscription;
  const st = status(sub);
  const plan = PLANS.find((p) => p.id === sub?.plan);
  const label = st === "free" ? "Gratis" : st === "trial" ? `PRO – provperiod (${trialDaysLeft(sub)} dagar kvar)` : `PRO – aktiv (${plan?.label})`;
  return (
    <section className="card-soft space-y-3 p-5">
      <div className="flex items-center justify-between">
        <div><div className="text-sm text-muted-foreground">Medlemskap</div><div className="font-semibold">{label}</div></div>
        {st === "free" && <Button className="rounded-full" onClick={() => setOpen(true)}>Prova PRO</Button>}
      </div>
      {st !== "free" && plan && <p className="text-sm text-muted-foreground">{sub?.cancelled ? "Avslutad – PRO gäller provperioden ut." : `Därefter ${plan.price} kr per ${plan.months === 1 ? "månad" : `${plan.months} mån`}.`}</p>}
      {st !== "free" && !sub?.cancelled && (
        <Button variant="ghost" className="h-10 w-full rounded-full" onClick={() => { update((x) => (x.subscription ? { ...x, subscription: { ...x.subscription, cancelled: true } } : x)); toast("Prenumerationen är avslutad"); }}>Avsluta prenumeration</Button>
      )}
      <Paywall open={open} onOpenChange={setOpen} />
    </section>
  );
}
