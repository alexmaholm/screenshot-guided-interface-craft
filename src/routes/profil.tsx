import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, Settings } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { AppShell, NeedsOnboarding, PageLoading } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { update, useBalans } from "@/lib/balans";
import { streakInfo } from "@/lib/habits";

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
  const streak = streakInfo(s);
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
        {[{ v: streak.current, l: "dagar i rad" }, { v: done, l: "pass klara" }, { v: s.meals.length, l: "måltider" }].map((x) => (
          <div key={x.l} className="card-soft p-4 text-center"><div className="text-2xl font-bold">{x.v}</div><div className="text-xs text-muted-foreground">{x.l}</div></div>
        ))}
      </section>

      <section className="card-soft flex items-center justify-between p-5">
        <div><div className="text-sm text-muted-foreground">Medlemskap</div><div className="font-semibold">Gratis</div></div>
        <span className="rounded-full bg-muted px-3 py-1 text-xs">PRO kommer snart</span>
      </section>
    </div>
  );
}
