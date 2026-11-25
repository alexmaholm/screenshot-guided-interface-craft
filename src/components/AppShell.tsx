import { AequivLogo } from "@/components/AequivLogo";
import { Link } from "@tanstack/react-router";
import { Home, Utensils, Dumbbell, LineChart, User } from "lucide-react";
import type { ReactNode } from "react";
import { AiCoach } from "@/components/AiCoach";
import { AppTour } from "@/components/AppTour";
import { WelcomeAccount } from "@/components/WelcomeAccount";

const TABS = [
  { to: "/", label: "Hem", icon: Home },
  { to: "/mat", label: "Mat", icon: Utensils },
  { to: "/traning", label: "Träning", icon: Dumbbell },
  { to: "/framsteg", label: "Framsteg", icon: LineChart },
  { to: "/profil", label: "Profil", icon: User },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen md:flex">
      <aside className="hidden md:flex md:w-60 md:flex-col md:gap-2 md:border-r md:bg-card md:p-5 md:sticky md:top-0 md:h-screen">
        <div className="mb-6 flex items-center gap-2 font-display text-2xl font-bold text-primary">
          <AequivLogo className="h-6 w-6" /> Aequiv
        </div>
        <nav aria-label="Huvudmeny" className="flex flex-col gap-1">
          {TABS.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: true }}
              className="flex min-h-12 items-center gap-3 rounded-md px-4 font-medium text-muted-foreground transition hover:bg-muted data-[status=active]:bg-secondary data-[status=active]:text-primary"
            >
              <Icon className="h-5 w-5" aria-hidden /> {label}
            </Link>
          ))}
        </nav>
        <p className="mt-auto text-xs text-muted-foreground">
          Aequiv ger generell inspiration och ersätter inte vård eller individuell kostrådgivning.
        </p>
      </aside>
      <main className="mx-auto w-full max-w-3xl px-4 pb-[calc(9rem+env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] md:px-8 md:pb-12">
        {children}
      </main>
      <AiCoach />
      <AppTour />
      <WelcomeAccount />
      <nav
        aria-label="Huvudmeny"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
      >
        <ul className="mx-auto grid max-w-md grid-cols-5">
          {TABS.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <Link
                to={to}
                activeOptions={{ exact: true }}
                className="flex min-h-14 flex-col items-center justify-center gap-1 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground data-[status=active]:text-foreground"
              >
                <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export function PageLoading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Laddar">
      <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
      <div className="h-40 animate-pulse rounded-xl bg-muted" />
      <div className="h-24 animate-pulse rounded-xl bg-muted" />
    </div>
  );
}

export function NeedsOnboarding() {
  return (
    <div className="panel p-8 text-center">
      <h1 className="text-[2rem] font-semibold leading-[1.1] tracking-[-0.03em]">
        Välkommen till Aequiv
      </h1>
      <p className="mt-2 text-muted-foreground">
        Svara på några korta frågor så skapar vi din personliga start.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex min-h-12 items-center rounded-md bg-primary px-6 font-semibold text-primary-foreground"
      >
        Kom igång
      </Link>
    </div>
  );
}
