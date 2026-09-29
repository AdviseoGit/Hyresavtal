import Link from "next/link";
import SiteFooter from "../../components/SiteFooter";

export const metadata = {
  title: "Uppsägningstid vid andrahandsuthyrning 2026",
  description: "Hur lång uppsägningstid gäller vid andrahandsuthyrning? Lär dig skillnaden mellan hyresrätt (hyreslagen) och bostadsrätt/villa (privatuthyrningslagen).",
  alternates: { canonical: "/uppsagningstid-andrahandsuthyrning" },
};

export default function UppsagningstidAndrahandsuthyrningPage() {
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
            <strong>Viktigt 2026:</strong> Uppgifter på nätet om att hyresgästen har en månads uppsägningstid 
            grundar sig ofta på den gamla uthyrningslagen (2012:978) som <strong>upphävdes 1 juli 2026</strong>. 
            Idag (enligt privatuthyrningslagen 2026:772) är hyresgästens uppsägningstid <strong>tre månader</strong>.
          </p>
        </div>

        <h1 className="text-3xl font-bold tracking-tight mb-6">Uppsägningstid andrahandsuthyrning</h1>
        
        <p className="lead text-lg text-gray-600 mb-8">
          När man pratar om uppsägningstid vid "andrahandsuthyrning" gör lagen skillnad på vad det är 
          för typ av bostad som hyrs ut. Hyr du ut en hyresrätt gäller en lag, och hyr du ut en bostadsrätt 
          eller villa gäller en annan.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4">Om bostaden är en bostadsrätt eller villa</h2>
        <p>
          Hyr du ut en bostad du själv äger, tillämpas <strong><Link href="/privatuthyrningslagen">privatuthyrningslagen (2026:772)</Link></strong>. Lagen är tvingande till hyresgästens förmån, vilket 
          innebär att man inte kan avtala fram sämre villkor för hyresgästen än vad lagen föreskriver.
        </p>

        <h3 className="text-xl font-medium mt-6 mb-3">Tillsvidareavtal (obestämd tid)</h3>
        <ul className="list-disc pl-6 mb-6">
          <li><strong>Du som hyresvärd</strong> har tre månaders uppsägningstid (6 kap. 2 §).</li>
          <li><strong>Hyresgästen</strong> har också tre månaders uppsägningstid (6 kap. 2 §).</li>
        </ul>

        <h3 className="text-xl font-medium mt-6 mb-3">Tidsbestämt avtal (bestämd tid)</h3>
        <p>
          Ett avtal på bestämd tid upphör normalt att gälla när hyrestiden har löpt ut, utan att någon separat uppsägning 
          behövs (såvida ni inte kommit överens om annat). Men:
        </p>
        <ul className="list-disc pl-6 mb-6">
          <li><strong>Du som hyresvärd</strong> saknar lagstadgad rätt att bryta kontraktet i förtid under den bestämda hyrestiden (6 kap. 1 §). 
          Du kan alltså inte säga upp en hyresgäst med tre månaders varsel om kontraktet är skrivit på till exempel tolv månader, såvida hyresgästen inte allvarligt misskött sig.</li>
          <li><strong>Hyresgästen</strong> kan däremot när som helst välja att avbryta avtalet i förtid med tre månaders uppsägningstid (6 kap. 2 §).</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-10 mb-4">Om bostaden är en hyresrätt</h2>
        <p>
          Hyr du ut din hyreslägenhet i andra hand gäller vanliga hyreslagen i <strong>12 kap. jordabalken (JB)</strong>.
        </p>

        <h3 className="text-xl font-medium mt-6 mb-3">Tillsvidareavtal (obestämd tid)</h3>
        <ul className="list-disc pl-6 mb-6">
          <li><strong>Du som hyresvärd</strong> har tre månaders uppsägningstid (12 kap. 4 § första stycket JB).</li>
          <li><strong>Hyresgästen</strong> har även tre månaders uppsägningstid (samma paragraf) eller, om hyran rör möblerat rum kortare tid, kortare tid.</li>
        </ul>
        
        <h3 className="text-xl font-medium mt-6 mb-3">Tidsbestämt avtal (bestämd tid)</h3>
        <p>
          För bostadslägenheter kan en andrahandshyresgäst i en hyresrätt, oavsett överenskommen bestämd hyrestid, i vissa fall 
          frånträda i förtid enligt reglerna i hyreslagen (till exempel med tre månaders varsel om avtalet är minst tre månader), 
          medan uthyraren som huvudregel är bunden fram till slutdatumet.
        </p>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-12 mb-8 not-prose">
          <h3 className="text-xl font-bold mb-3">Använd ett korrekt avtal</h3>
          <p className="text-gray-600 mb-4">
            Uppsägningstiderna beror helt på vilken lag som ska tillämpas på din uthyrning. Med Hyresavtal.io 
            genereras ditt hyresavtal automatiskt utifrån korrekt lag (2026:772 eller hyreslagen) baserat på 
            din bostadstyp. Läs mer om alla <strong><Link href="/hyra-ut-egen-bostad-regler">regler för uthyrning av egen bostad</Link></strong>.
          </p>
          <Link href="/" className="inline-block bg-brand text-white font-medium px-6 py-3 rounded-md hover:bg-brand-dark transition-colors">
            Generera ditt hyresavtal
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-12 pt-6 border-t">
          <em>Observera: Informationen på den här sidan är avsedd som allmän upplysning och utgör inte juridisk rådgivning. 
          Sidan är inte granskad av jurist. Lagar och regler kan ändras, kontrollera alltid aktuell lagstiftning på Sveriges riksdags webbplats.</em>
        </p>
      </article>

      <SiteFooter />
    </main>
  );
}
