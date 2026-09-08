import Link from "next/link";
import SiteFooter from "../../components/SiteFooter";

export const metadata = {
  title: "Privatuthyrningslagen: Regler vid uthyrning av egen bostad 2026",
  description: "Lag (2026:772) om privatuthyrning styr uthyrning av egen bostad. Se vilka regler som gäller för uppsägningstid, hyra och besittningsskydd.",
  alternates: { canonical: "/privatuthyrningslagen" },
};

export default function PrivatuthyrningslagenPage() {
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
            <strong>Viktigt om lagändringen 2026:</strong> Den 1 juli 2026 ersattes Lag (2012:978) om uthyrning av egen bostad 
            (som ofta kallades "privatuthyrningslagen") med den nya <strong>privatuthyrningslagen (2026:772)</strong>. 
            Många mallar och källor på nätet hänvisar fortfarande till den upphävda lagen från 2012. 
            Informationen på denna sida utgår från den lagstiftning som gäller nu. Avtal som ingåtts före 
            1 juli 2026 omfattas dock fortfarande av de äldre reglerna (enligt lagens övergångsbestämmelser).
          </p>
        </div>

        <h1 className="text-3xl font-bold tracking-tight mb-6">Privatuthyrningslagen – Så fungerar den</h1>
        
        <p className="lead text-lg text-gray-600 mb-8">
          Ska du hyra ut din egen bostad? Då är det högst troligt att privatuthyrningslagen gäller i stället 
          för hyreslagen. Detta är avgörande eftersom privatuthyrningslagen ger dig som uthyrare ett betydligt 
          starkare skydd när det gäller uppsägning, hyressättning och besittningsskydd.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4">När gäller privatuthyrningslagen?</h2>
        <p>
          Lagen gäller när du (som privatperson) hyr ut en egen bostad utanför näringsverksamhet. Med egen bostad menas oftast:
        </p>
        <ul className="list-disc pl-6 mb-6">
          <li>Din bostadsrätt (som du hyr ut i andra hand)</li>
          <li>Din villa, ditt radhus eller ägarlägenhet</li>
          <li>Ett möblerat eller omöblerat rum i den bostad där du själv bor</li>
        </ul>
        <p>
          <strong>Undantag:</strong> Lagen gäller <em>inte</em> när du hyr ut en hyresrätt i andra hand. Då gäller 
          alltid den vanliga hyreslagen (12 kap. jordabalken). Lagen gäller heller inte om du hyr ut 
          mer än en bostad (då gäller privatuthyrningslagen för den första, och hyreslagen för den andra).
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4">Uppsägningstid enligt privatuthyrningslagen</h2>
        <p>
          Uppsägningstiderna skiljer sig markant från den vanliga hyreslagen och är oftast till uthyrarens fördel.
        </p>
        <h3 className="text-xl font-medium mt-6 mb-3">För dig som hyresvärd</h3>
        <p>
          Som hyresvärd har du oftast rätt att säga upp hyresavtalet. Om ni har avtalat om en bestämd hyrestid 
          har du dock som hyresvärd <em>inte</em> rätt att säga upp avtalet i förtid, såvida ni inte uttryckligen skrivit in det 
          i avtalet eller om hyresgästen allvarligt missköter sig (enligt 6 kap. 1 §). 
        </p>
        <p>
          När du säger upp avtalet är uppsägningstiden som utgångspunkt tre månader från det månadsskifte som infaller 
          närmast efter uppsägningen (enligt 6 kap. 2 §). Om ni kommit överens om en kortare uppsägningstid 
          för dig som hyresvärd gäller ändå minst tre månader, eftersom lagen är tvingande till hyresgästens förmån.
        </p>

        <h3 className="text-xl font-medium mt-6 mb-3">För hyresgästen</h3>
        <p>
          För hyresgästen är uppsägningstiden alltid en månad, räknat från nästkommande månadsskifte (6 kap. 2 §). 
          Oavsett vad som står i ert hyresavtal kan hyresgästen alltid säga upp avtalet med en månads varsel, 
          även om ni har avtalat om en bestämd tid. 
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4">Besittningsskydd – Får hyresgästen bo kvar?</h2>
        <p>
          Ett av de viktigaste skälen till att det är avgörande vilken lag som tillämpas är besittningsskyddet. 
          När ett avtal styrs av privatuthyrningslagen får hyresgästen <strong>aldrig besittningsskydd</strong> (enligt 12 kap. 1 c § jordabalken i kombination med att besittningsskydd helt saknas i 2026:772).
        </p>
        <p>
          Det innebär att du som värd kan säga upp hyresgästen när du vill (med tre månaders uppsägningstid), 
          och hyresgästen kan inte vända sig till hyresnämnden för att tvinga fram en förlängning. Du behöver 
          därför inte skriva något separat avtal om avstående från besittningsskydd när du hyr ut med stöd 
          av privatuthyrningslagen.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4">Hyran – Vad är en skälig hyra?</h2>
        <p>
          Privatuthyrningslagen tillåter en högre hyra än hyreslagen. Hyran är skälig om den inte påtagligt överstiger 
          hyresvärdens kapitalkostnad och driftskostnad för bostaden.
        </p>
        <p>
          <strong>Kapitalkostnaden</strong> beräknas som en skälig avkastningsränta på bostadens marknadsvärde. 
          Räntan är en uppskattning oberoende av vilka lån du faktiskt har. Riksbankens referensränta plus ett par procent 
          brukar anses skäligt, men en maxgräns existerar nu, där avkastningsräntan aldrig får beräknas 
          till mer än 15 procent av bostadens värde i relation till beskattningsår (motsvarar taket enligt tidigare 12 kap. 55 § fjärde stycket, se relevanta lagrum för exakt beräkning).
        </p>
        <p>
          <strong>Driftskostnaden</strong> är de faktiska kostnader du har för att hålla bostaden. Det kan vara 
          avgift till bostadsrättsföreningen, el, bredband, vatten och eventuell möbelslitage (ofta schablonmässigt beräknat 
          till cirka 10–15 procent av den hyra bostaden skulle gett om den var omöblerad).
        </p>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-12 mb-8 not-prose">
          <h3 className="text-xl font-bold mb-3">Skriv avtalet med rätt lagrum</h3>
          <p className="text-gray-600 mb-4">
            Att använda en gammal mall kan leda till att hyreslagen (med sämre villkor för dig) eller 
            den upphävda lagen (2012:978) blir tillämplig på ert avtal. Hyresavtal.io ser till att 
            ditt kontrakt blir korrekt utifrån hur lagstiftningen ser ut idag.
          </p>
          <Link href="/" className="inline-block bg-brand text-white font-medium px-6 py-3 rounded-md hover:bg-brand-dark transition-colors">
            Börja skapa hyresavtal
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-12 pt-6 border-t">
          <em>Observera: Informationen på den här sidan är avsedd som allmän upplysning och utgör inte juridisk rådgivning. Sidan är inte granskad av jurist. Lagar och regler kan ändras, kontrollera alltid aktuell lagstiftning på Sveriges riksdags webbplats (Lag 2026:772).</em>
        </p>
      </article>

      <SiteFooter />
    </main>
  );
}