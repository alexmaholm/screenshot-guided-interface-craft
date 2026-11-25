import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, ChevronRight, PlayCircle, Settings } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { AppShell, NeedsOnboarding, PageLoading } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addDays, dateKey, update, useBalans } from "@/lib/balans";
import { streakInfo } from "@/lib/habits";
import { weightTrend } from "@/lib/progress";
import { ThemePicker } from "@/components/ThemePicker";
import { Paywall } from "@/components/Paywall";
import { PLANS, redeemCode, status, trialDaysLeft } from "@/lib/tiers";

function WeightTrendChart({ body }: { body: { date: string; weight: number }[] }) {
  const pts = weightTrend(body).slice(-60);
  const last = pts[pts.length - 1]!;
  const first = pts[0]!;
  const diff = Math.round((last.trend - first.trend) * 10) / 10;
  if (pts.length < 2)
    return (
      <p className="text-sm text-muted-foreground">
        Trend: {String(last.trend).replace(".", ",")} kg. Väg dig några gånger till så visas kurvan.
      </p>
    );
  const vals = pts.flatMap((p) => [p.weight, p.trend]);
  const min = Math.min(...vals) - 0.5,
    max = Math.max(...vals) + 0.5;
  const W = 300,
    H = 110;
  const x = (i: number) => (i / (pts.length - 1)) * W;
  const y = (v: number) => H - ((v - min) / (max - min)) * H;
  const line = pts
    .map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.trend).toFixed(1)}`)
    .join(" ");
  return (
    <div className="space-y-1">
      <p className="text-sm">
        <span className="telemetry font-semibold">
          Trend {String(last.trend).replace(".", ",")} kg
        </span>{" "}
        <span className="text-muted-foreground">
          ·{" "}
          {diff === 0
            ? "stabil"
            : `${diff > 0 ? "+" : "−"}${String(Math.abs(diff)).replace(".", ",")} kg`}{" "}
          sedan start
        </span>
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-28 w-full" role="img" aria-label="Vikttrend">
        {pts.map((p, i) => (
          <circle
            key={p.date}
            cx={x(i)}
            cy={y(p.weight)}
            r={2}
            className="fill-muted-foreground/40"
          />
        ))}
        <path
          d={line}
          fill="none"
          strokeWidth={1.5}
          strokeLinecap="round"
          className="stroke-primary"
        />
      </svg>
      <p className="text-xs text-muted-foreground">
        Prickarna är dagens vågsiffra, linjen din verkliga trend – vätskesvängningar jämnas ut.
      </p>
    </div>
  );
}

export const Route = createFileRoute("/profil")({
  head: () => ({
    meta: [
      { title: "Profil – Aequiv" },
      { name: "description", content: "Ditt namn, din profilbild och din resa i Aequiv." },
      { property: "og:title", content: "Profil – Aequiv" },
      { property: "og:description", content: "Din personliga profil i Aequiv." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const s = useBalans();
  return (
    <AppShell>{!s ? <PageLoading /> : !s.profile ? <NeedsOnboarding /> : <Profile />}</AppShell>
  );
}

function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const size = 256;
      const c = document.createElement("canvas");
      c.width = size;
      c.height = size;
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
  const avatar = p.avatar ?? "";
  const isPhoto = avatar.startsWith("data:");
  const initial = (p.name.trim()[0] ?? "A").toUpperCase();
  const setProfile = (patch: Partial<typeof p>) =>
    update((st) => (st.profile ? { ...st, profile: { ...st.profile, ...patch } } : st));

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <p className="label-xs telemetry text-muted-foreground">Konto · Profil</p>
          <h1 className="mt-1 text-[2rem] font-semibold tracking-[-0.03em]">Profil</h1>
        </div>
        <Link
          to="/installningar"
          aria-label="Inställningar"
          className="flex h-11 w-11 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground"
        >
          <Settings className="h-5 w-5" strokeWidth={1.5} aria-hidden />
        </Link>
      </header>

      <section className="panel flex items-center gap-4 p-5">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="relative"
          aria-label="Byt profilbild"
        >
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-3xl font-semibold tracking-[-0.03em]">
            {isPhoto ? (
              <img src={avatar} alt="Profilbild" className="h-full w-full object-cover" />
            ) : (
              <span aria-hidden>{initial}</span>
            )}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background text-foreground">
            <Camera className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
          </span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            try {
              setProfile({ avatar: await resizeImage(f) });
              toast.success("Profilbild uppdaterad");
            } catch {
              toast.error("Kunde inte läsa bilden");
            }
          }}
        />
        <form
          className="flex min-w-0 flex-1 flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const n = name.trim();
            if (!n) return;
            setProfile({ name: n.slice(0, 40) });
            toast.success("Namnet är sparat");
          }}
        >
          <label className="label-xs text-muted-foreground" htmlFor="profile-name">
            Namn
          </label>
          <div className="flex gap-2">
            <Input
              id="profile-name"
              className="h-11 rounded-md"
              value={name}
              maxLength={40}
              onChange={(e) => setName(e.target.value)}
            />
            <Button
              type="submit"
              variant="outline"
              className="h-11 rounded-md"
              disabled={!name.trim() || name.trim() === p.name}
            >
              Spara
            </Button>
          </div>
        </form>
      </section>

      <section className="panel grid grid-cols-3 divide-x divide-border">
        {[
          { v: streak.streak, l: "Dagar i rad" },
          { v: done, l: "Pass klara" },
          { v: s.meals.length, l: "Måltider" },
        ].map((x) => (
          <div key={x.l} className="p-4">
            <div className="telemetry text-2xl font-semibold tracking-[-0.03em]">{x.v}</div>
            <div className="label-xs mt-1 text-muted-foreground">{x.l}</div>
          </div>
        ))}
      </section>

      <WeightLog />

      <nav aria-label="Profilval" className="panel divide-y divide-border">
        <Link
          to="/installningar"
          className="flex min-h-14 items-center justify-between px-5 text-sm font-medium"
        >
          <span className="flex items-center gap-3">
            <Settings className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} aria-hidden />{" "}
            Inställningar
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />
        </Link>
        <button
          onClick={() =>
            update((st) =>
              st.profile ? { ...st, profile: { ...st.profile, tourSeen: false } } : st,
            )
          }
          className="flex min-h-14 w-full items-center justify-between px-5 text-left text-sm font-medium"
        >
          <span className="flex items-center gap-3">
            <PlayCircle className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} aria-hidden />{" "}
            Visa introduktion
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />
        </button>
      </nav>

      <ThemePicker />
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
    <section className="panel p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="label-xs text-muted-foreground">Frivilligt</p>
          <h2 className="mt-1 font-semibold">Vikt</h2>
        </div>
        <Button variant="outline" className="h-10 rounded-md" onClick={() => setShow(!show)}>
          {show ? "Dölj" : "Visa"}
        </Button>
      </div>
      {show && (
        <div className="mt-4 space-y-3">
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const v = Number(weight.replace(",", "."));
              if (!Number.isFinite(v) || v < 20 || v > 400) {
                toast.error("Ange en vikt i kilo, t.ex. 72,5");
                return;
              }
              update((st) => ({
                ...st,
                body: [...st.body.filter((b) => b.date !== today), { date: today, weight: v }],
              }));
              setWeight("");
              toast.success("Sparat");
            }}
          >
            <Input
              className="h-11 rounded-md telemetry"
              inputMode="decimal"
              placeholder="Kilo"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              aria-label="Vikt i kilo"
            />
            <Button type="submit" className="h-11 rounded-md">
              Spara
            </Button>
          </form>
          {s.body.length === 0 ? (
            <p className="text-sm text-muted-foreground">Inga mätningar ännu.</p>
          ) : (
            <>
              <WeightTrendChart body={s.body} />
              <ul className="divide-y divide-border border-t border-border text-sm">
                {[...s.body]
                  .reverse()
                  .slice(0, 5)
                  .map((b) => (
                    <li key={b.date} className="flex justify-between py-2 telemetry">
                      <span className="text-muted-foreground">{b.date}</span>
                      <span>{String(b.weight).replace(".", ",")} kg</span>
                    </li>
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
  const [code, setCode] = useState("");
  const redeem = async () => {
    const next = await redeemCode(code);
    if (!next) {
      toast.error("Koden är inte giltig");
      return;
    }
    update((x) => ({ ...x, subscription: next }));
    setCode("");
    toast.success(`Kod inlöst: ${next.codeLabel}`);
  };
  const label = sub?.lifetime
    ? `PRO – ${sub.codeLabel ?? "livstid"}`
    : st === "free"
      ? "Gratis"
      : st === "trial"
        ? `PRO – provperiod (${trialDaysLeft(sub)} dagar kvar)`
        : `PRO – aktiv (${plan?.label})`;
  return (
    <section className="panel space-y-3 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="label-xs text-muted-foreground">Medlemskap</div>
          <div className="mt-1 font-semibold">{label}</div>
        </div>
        {st === "free" && (
          <Button className="h-10 rounded-md" onClick={() => setOpen(true)}>
            Prova PRO
          </Button>
        )}
      </div>
      {st !== "free" && plan && !sub?.lifetime && (
        <p className="text-sm text-muted-foreground">
          {sub?.cancelled
            ? "Avslutad – PRO gäller provperioden ut."
            : `Därefter ${plan.price} kr per ${plan.months === 1 ? "månad" : `${plan.months} mån`}.`}
        </p>
      )}
      {st !== "free" && !sub?.cancelled && !sub?.lifetime && (
        <Button
          variant="ghost"
          className="h-10 w-full rounded-md text-muted-foreground"
          onClick={() => {
            update((x) =>
              x.subscription ? { ...x, subscription: { ...x.subscription, cancelled: true } } : x,
            );
            toast("Prenumerationen är avslutad");
          }}
        >
          Avsluta prenumeration
        </Button>
      )}
      {!sub?.lifetime && (
        <div className="flex gap-2 pt-1">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Har du en kampanjkod?"
            autoCapitalize="characters"
            className="h-10 rounded-md"
          />
          <Button
            variant="outline"
            className="h-10 rounded-md"
            disabled={!code.trim()}
            onClick={redeem}
          >
            Lös in
          </Button>
        </div>
      )}
      <Paywall open={open} onOpenChange={setOpen} />
    </section>
  );
}
