import Link from "next/link";
import SiteFooter from "../../components/SiteFooter";

export const metadata = {
  title: "Hyra ut egen bostad regler 2026: Detta måste du veta",
  description: "Vilka regler gäller när man hyr ut sin egen bostad (bostadsrätt, villa eller ägarlägenhet)? Lär dig om skillnaderna mellan olika lagar, skatteregler och föreningens roll.",
  alternates: { canonical: "/hyra-ut-egen-bostad-regler" },
};

export default function HyraUtEgenBostadReglerPage() {
  return (
    <main className="min-h-screen">
      <header className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-brand hover:text-brand-dark">Hyresavtal.io</Link>
          <span className="text-sm text-gray-500 hidden sm:inline">Rätt lag för din uthyrning</span>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-6 py-12 prose prose-slate">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 not-prose">
          <p className="text-sm text-amber-800 m-0 font-medium">
            <strong>Lagändring 2026:</strong> Observera att den tidigare lagen (2012:978) om uthyrning av egen bostad 
            upphävdes den 1 juli 2026 och ersattes av <strong>privatuthyrningslagen (2026:772)</strong>. Guiden nedan 
            baseras på de nya reglerna. Gamla mallar och källor på nätet kan leda dig fel.
          </p>
        </div>

        <h1 className="text-3xl font-bold tracking-tight mb-6">Hyra ut egen bostad – Vilka regler gäller?</h1>
        
        <p className="lead text-lg text-gray-600 mb-8">
          Att hyra ut sin egen bostad har blivit vanligare, men reglerna beror helt på vilken <em>typ</em> av 
          bostad du hyr ut. Det viktigaste första steget är att veta vilken lag som styr ditt hyresavtal.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4">Vilken lag gäller för min bostad?</h2>
        <p>
          För uthyrning av bostad gäller huvudsakligen två olika lagar, och de ger helt olika regler för hyresnivå, uppsägning och besittningsskydd.
        </p>
        <ul className="list-disc pl-6 mb-6">
          <li>
            <strong>Privatuthyrningslagen (2026:772):</strong> Gäller när du hyr ut en bostadsrätt, 
            villa, radhus eller ägarlägenhet. Gäller även om du hyr ut ett rum i en bostad där du själv bor. 
            <Link href="/privatuthyrningslagen"> Läs mer om privatuthyrningslagen här.</Link>
          </li>
          <li>
            <strong>Hyreslagen (12 kap. jordabalken):</strong> Gäller alltid när du hyr ut en hyresrätt i andra hand. 
            Den gäller också om du hyr ut <em>mer än en</em> ägd bostad (då gäller hyreslagen för den andra bostaden och framåt).
          </li>
        </ul>
        <p>
          Det som ofta är förvirrande är att båda fallen i dagligt tal kallas för att hyra ut i "andra hand", 
          men juridiskt är det alltså två vitt skilda regelsätt. Privatuthyrningslagen ger dig som uthyrare 
          betydligt starkare rättigheter.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4">Måste jag ha tillstånd för att hyra ut?</h2>
        <p>
          Ja, som huvudregel krävs alltid tillstånd, men från vem beror på boendeform:
        </p>
        <h3 className="text-xl font-medium mt-6 mb-3">För bostadsrätt</h3>
        <p>
          Du måste ha bostadsrättsföreningens (styrelsens) tillstånd för att hyra ut din lägenhet. 
          Föreningen ska ge tillstånd om du har <em>skäl</em> för uthyrningen (t.ex. studier på annan ort, 
          provsamboende, ålder eller sjukdom). Skulle styrelsen neka dig kan du vända dig till hyresnämnden 
          som kan överpröva beslutet.
        </p>
        <h3 className="text-xl font-medium mt-6 mb-3">För hyresrätt</h3>
        <p>
          Du måste ha din hyresvärds samtycke. Även här kan hyresnämnden ge tillstånd om värden säger nej, 
          förutsatt att du har "beaktansvärda skäl" och att hyresvärden inte har någon befogad anledning att vägra.
        </p>
        <h3 className="text-xl font-medium mt-6 mb-3">För villa eller ägarlägenhet</h3>
        <p>
          Här behöver du inget tillstånd, eftersom du själv äger fastigheten. Du kan hyra ut när och till vem du vill.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4">Regler kring uppsägning och besittningsskydd</h2>
        <p>
          Om du hyr ut en bostadsrätt eller villa och <strong>privatuthyrningslagen</strong> gäller:
        </p>
        <ul className="list-disc pl-6 mb-6">
          <li>Hyresgästen får <strong>aldrig besittningsskydd</strong> (12 kap. 1 c § JB och avsaknaden i 2026:772). Du kan säga upp avtalet för att du själv vill ha tillbaka bostaden.</li>
          <li>Uppsägningstiden för dig som uthyrare är tre månader (enligt 6 kap. 2 § privatuthyrningslagen).</li>
          <li>Hyresgästens uppsägningstid är endast en månad.</li>
        </ul>
        <p>
          Om du hyr ut en hyresrätt och <strong>hyreslagen</strong> gäller:
        </p>
        <ul className="list-disc pl-6 mb-6">
          <li>Hyresgästen kan i vissa (sällsynta) fall få besittningsskydd efter två år, varför ett avståendeavtal kan behövas.</li>
          <li>Uppsägningstiden för dig som uthyrare är oftast tre månader.</li>
          <li>En andrahandshyresgäst i en hyresrätt har starkare skydd mot uppsägning än vid privatuthyrning.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-10 mb-4">Ekonomi och hyra</h2>
        <p>
          Hur hög hyra du får ta ut är strikt reglerat, oavsett lag:
        </p>
        <ul className="list-disc pl-6 mb-6">
          <li><strong>Bostadsrätt/Villa (Privatuthyrningslagen):</strong> Du får ta ut en kostnadsbaserad hyra (kapitalkostnad och driftskostnad). Läs mer om beräkningen i vår guide om <Link href="/privatuthyrningslagen">privatuthyrningslagen</Link>. Viktigt: Du får nu (till skillnad från i äldre lag) använda indexklausuler för att räkna upp hyran årligen (2 kap. 4 §). Skulle hyresnämnden finna att hyran varit för hög, <em>ska</em> de förplikta dig att återbetala överhyran för förfluten tid <em>med ränta</em> (2 kap. 6 § tredje stycket).</li>
          <li><strong>Hyresrätt (Hyreslagen):</strong> Du får i princip bara ta ut den hyra du själv betalar, plus eventuellt ett litet påslag (cirka 10-15%) om du hyr ut fullt möblerat. Tar du ut en högre hyra än så gör du dig skyldig till ett brott som kan ge fängelse (om det sker satt i system), och hyresgästen kan via hyresnämnden kräva tillbaka pengarna.</li>
        </ul>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-12 mb-8 not-prose">
          <h3 className="text-xl font-bold mb-3">Låt systemet välja rätt lag åt dig</h3>
          <p className="text-gray-600 mb-4">
            Att fylla i fel mall kan ge dig helt fel avtalsvillkor och uppsägningstider. Med Hyresavtal.io 
            svarar du bara på några enkla frågor om din bostad, så genererar vi ett juridiskt korrekt avtal 
            baserat på rätt lag (2026:772 eller hyreslagen).
          </p>
          <Link href="/" className="inline-block bg-brand text-white font-medium px-6 py-3 rounded-md hover:bg-brand-dark transition-colors">
            Börja skapa hyresavtal
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-12 pt-6 border-t">
          <em>Observera: Informationen på den här sidan är avsedd som allmän upplysning och utgör inte juridisk rådgivning. Sidan är inte granskad av jurist. Lagar och regler kan ändras, kontrollera alltid aktuell lagstiftning på Sveriges riksdags webbplats.</em>
        </p>
      </article>

      <SiteFooter />
    </main>
  );
}
