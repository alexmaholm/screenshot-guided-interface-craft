import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, LegalSection } from "@/components/LegalPage";

export const Route = createFileRoute("/integritet")({
  head: () => ({
    meta: [
      { title: "Integritetspolicy – Aequiv" },
      {
        name: "description",
        content:
          "Kort och ärligt: vilken data Aequiv sparar, hur AI-analysen fungerar och hur du raderar allt.",
      },
      { property: "og:title", content: "Integritetspolicy – Aequiv" },
      { property: "og:description", content: "Din data stannar hos dig. Inga annonsnätverk." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <LegalPage title="Integritetspolicy" updated="4 november 2026">
      <p>
        Vi samlar bara in det som behövs för att appen ska fungera. Tar ungefär två minuter att
        läsa.
      </p>
      <LegalSection title="Din data stannar hos dig">
        <p>
          Måltider, vatten, träningspass, vikt och profil sparas lokalt på din telefon. Appen
          fungerar utan konto.
        </p>
        <p>
          Loggar du in sparas en krypterad kopia i vår molntjänst inom EU/EES-säkra miljöer så att
          du kan byta telefon. Vi sparar då även din e-postadress.
        </p>
      </LegalSection>
      <LegalSection title="Hur AI-analysen fungerar">
        <p>
          När du använder fotologg, textlogg, AI-coach eller Töm kylen skickas bilden eller texten
          krypterat till Google Gemini för att räkna ut ett svar. Bilderna sparas inte av oss och
          används inte för att träna AI-modeller.
        </p>
      </LegalSection>
      <LegalSection title="Hälsodata">
        <p>
          Om du slår på synk med Apple Hälsa eller Health Connect läser vi bara steg, aktiva
          kalorier och vikt. Hälsodata delas aldrig med tredje part eller används för
          marknadsföring.
        </p>
      </LegalSection>
      <LegalSection title="Inga annonsnätverk">
        <p>Vi säljer aldrig data och använder inga annons- eller spårningsnätverk.</p>
      </LegalSection>
      <LegalSection title="Underleverantörer">
        <p>
          Molnlagring och inloggning (vår molntjänst), AI-analys (Google Gemini), produktdata vid
          sökning och streckkod (Open Food Facts – endast söktexten skickas), betalning (Apple App
          Store / Google Play).
        </p>
      </LegalSection>
      <LegalSection title="Dina rättigheter (GDPR)">
        <p>
          Du kan när som helst se, ändra eller radera din data. Under Inställningar → "Radera konto
          och all data" tas allt bort direkt, både på telefonen och i molnet.
        </p>
        <p>Du har rätt att klaga hos Integritetsskyddsmyndigheten (IMY).</p>
      </LegalSection>
      <LegalSection title="Kontakt">
        <p>Frågor om din data: support@aequiv.com</p>
      </LegalSection>
    </LegalPage>
  );
}
