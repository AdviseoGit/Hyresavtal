import Link from "next/link";

import { SITE, siteValue } from "../../data/site";

export const metadata = {
  title: "Användarvillkor & Ansvarsfriskrivning – Hyresavtal.io",
  description:
    "Användarvillkor och ansvarsfriskrivning för Hyresavtal.io. Tjänsten genererar utkast till hyresavtal grundade i Hyreslagen och utgör inte juridisk rådgivning.",
};

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-semibold mt-8 mb-2">{children}</h2>;
}

export default function Villkor() {
  return (
    <main className="min-h-screen">
      <header className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-brand">Hyresavtal.io</Link>
          <Link href="/" className="text-sm text-brand hover:underline">← Tillbaka</Link>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-6 py-10 text-[15px] leading-relaxed text-gray-800">
        <h1 className="text-2xl font-bold">Användarvillkor &amp; ansvarsfriskrivning</h1>
        <p className="text-sm text-gray-500 mt-1">Senast uppdaterad: 2026-06-13</p>

        <p className="mt-6">
          Läs dessa villkor noggrant innan du använder Hyresavtal.io (&quot;Tjänsten&quot;).
          Genom att skapa ett dokument med Tjänsten godkänner du villkoren i sin helhet.
        </p>

        <H>1. Vad Tjänsten är – och inte är</H>
        <p>
          Tjänsten är ett digitalt verktyg som hjälper dig att snabbt ta fram ett{" "}
          <strong>utkast till hyresavtal</strong> för bostad. Tjänsten avgör utifrån dina svar
          om privatuthyrningslagen (2026:772) eller 12 kap. jordabalken (hyreslagen)
          är tillämplig, och bygger utkastet på den lagen samt vanligt förekommande
          standardvillkor. Tjänsten är <strong>inte</strong> en juristbyrå, lämnar{" "}
          <strong>inte</strong> juridisk rådgivning, och är <strong>inte</strong> part i det
          avtal som upprättas mellan hyresvärd och hyresgäst. Ingen klient- eller
          uppdragsrelation uppstår genom att du använder Tjänsten.
        </p>

        <H>2. Ingen garanti</H>
        <p>
          Tjänsten tillhandahålls i befintligt skick (&quot;as is&quot;). Vi lämnar inga
          garantier – uttryckliga eller underförstådda – för att ett genererat dokument är
          korrekt, fullständigt, aktuellt eller lämpligt för just din situation. Lagstiftning,
          praxis och förhållanden förändras, och varje uthyrning är unik. Ett genererat utkast
          kan därför behöva ändras, kompletteras eller ersättas för att passa det enskilda fallet.
        </p>

        <H>3. Ditt ansvar som användare</H>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>Du ansvarar för att de uppgifter du lämnar är riktiga och fullständiga.</li>
          <li>Du ansvarar för att granska, anpassa och vid behov låta en jurist se över dokumentet innan det undertecknas.</li>
          <li>Du och övriga parter ansvarar själva för att avtalet och dess tillämpning följer gällande lag.</li>
          <li>Parterna ansvarar själva för att de villkor som avtalats faktiskt efterlevs.</li>
        </ul>

        <H>4. Tvingande lagstiftning gäller alltid</H>
        <p>
          Stora delar av hyreslagen och privatuthyrningslagen är tvingande till
          hyresgästens förmån. Ett avtalsvillkor
          som är mindre förmånligt för hyresgästen än lagen är utan verkan, oavsett vad som
          står i dokumentet. Tjänsten kan inte garantera att ett enskilt villkor är giltigt
          i din situation.
        </p>

        <H>5. Ansvarsbegränsning</H>
        <p>
          I den utsträckning som tillåts enligt tvingande lag friskriver vi oss från allt
          ansvar för direkta och indirekta skador, förluster, kostnader, utebliven vinst eller
          andra följder som kan uppstå i samband med användningen av Tjänsten eller ett
          genererat dokument. Detta omfattar – utan begränsning – ansvar för fel eller brister
          i ett dokument, för att ett villkor visar sig ogiltigt eller olämpligt, samt för att
          någon av parterna bryter mot avtalet eller mot lag. Du använder Tjänsten på egen risk.
        </p>
        <p className="mt-2 text-sm text-gray-600">
          Inget i dessa villkor begränsar ansvar som enligt tvingande lag inte kan begränsas
          (t.ex. vid uppsåt eller grov vårdslöshet, eller tvingande konsumenträttigheter).
        </p>

        <H>6. Vår rekommendation</H>
        <p>
          Vid osäkerhet, vid större ekonomiska värden eller vid komplexa situationer
          (t.ex. andrahandsuthyrning, lokaler, eller särskilda villkor) rekommenderar vi att
          du anlitar en jurist eller advokat innan avtalet undertecknas.
        </p>

        <H>7. Ändringar</H>
        <p>
          Vi kan uppdatera dessa villkor. Den version som gäller är den som publiceras här vid
          tidpunkten för din användning.
        </p>

        <H>8. Tillämplig lag</H>
        <p>Svensk rätt tillämpas på dessa villkor och på användningen av Tjänsten.</p>

        <p className="mt-8 text-sm text-gray-500">
          Tjänsten tillhandahålls av {siteValue(SITE.operator)}
          {SITE.orgNumber ? `, org.nr ${SITE.orgNumber}` : ", org.nr uppgift saknas"}. Kontakt:{" "}
          {siteValue(SITE.contactEmail)}. Se även{" "}
          <Link href="/integritetspolicy" className="underline">
            integritetspolicyn
          </Link>
          .
        </p>

        <div className="mt-10">
          <Link href="/" className="text-brand hover:underline">← Tillbaka till avtalsgeneratorn</Link>
        </div>
      </article>
    </main>
  );
}
