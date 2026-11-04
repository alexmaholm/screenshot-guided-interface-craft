import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <main className="mx-auto max-w-xl space-y-6 px-5 pb-16 pt-6">
      <Link to="/installningar" className="inline-flex min-h-11 items-center gap-1 text-sm text-muted-foreground"><ChevronLeft className="h-4 w-4" />Tillbaka</Link>
      <header><h1 className="text-2xl font-semibold">{title}</h1><p className="text-xs text-muted-foreground">Senast uppdaterad {updated}</p></header>
      <div className="space-y-5 text-sm leading-relaxed">{children}</div>
    </main>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="space-y-2"><h2 className="font-semibold">{title}</h2><div className="space-y-2 text-muted-foreground">{children}</div></section>;
}
