import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, LegalSection } from "@/components/LegalPage";
import { PLANS, TRIAL_DAYS } from "@/lib/tiers";

export const Route = createFileRoute("/villkor")({
  head: () => ({
    meta: [
      { title: "Användarvillkor – Balans" },
      { name: "description", content: "Villkor för Balans: medicinsk friskrivning, prenumeration, provperiod och uppsägning." },
      { property: "og:title", content: "Användarvillkor – Balans" },
      { property: "og:description", content: "Korta, raka villkor för Balans och Balans PRO." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Terms,
});

function Terms() {
  return (
    <LegalPage title="Användarvillkor" updated="4 november 2026">
      <p>Genom att använda Balans godkänner du dessa villkor.</p>
      <LegalSection title="Inte medicinsk rådgivning">
        <p>Balans ger generell inspiration för mat, vanor och träning. Appen ersätter inte läkare, dietist eller fysioterapeut och är inte avsedd för diagnos, behandling eller ätstörningar. Rådfråga vården vid sjukdom, skada eller graviditet.</p>
      </LegalSection>
      <LegalSection title="AI och näringsvärden">
        <p>Näringsvärden och AI-förslag är uppskattningar och kan vara fel. Kontrollera alltid förpackningens märkning, särskilt vid allergier.</p>
      </LegalSection>
      <LegalSection title="Träning på eget ansvar">
        <p>Anpassa vikter och övningar efter din förmåga och avbryt vid smärta.</p>
      </LegalSection>
      <LegalSection title="Balans PRO">
        <p>PRO finns som {PLANS.map((p) => `${p.price} kr/${p.label.toLowerCase()}`).join(", ")}. Nya prenumeranter får {TRIAL_DAYS} dagars gratis provperiod.</p>
        <p>Betalningen dras från ditt Apple ID eller Google-konto när provperioden slutar. Prenumerationen förnyas automatiskt om du inte avslutar minst 24 timmar innan perioden går ut.</p>
        <p>Du hanterar och avslutar prenumerationen i telefonens inställningar under Apple ID → Prenumerationer, eller i Google Play → Betalningar och prenumerationer. Återbetalning hanteras av Apple eller Google.</p>
      </LegalSection>
      <LegalSection title="Ändringar">
        <p>Vi kan uppdatera villkoren. Vid större ändringar meddelar vi dig i appen.</p>
      </LegalSection>
      <LegalSection title="Kontakt">
        <p>kontakt@balans.app · Svensk lag gäller.</p>
      </LegalSection>
    </LegalPage>
  );
}
