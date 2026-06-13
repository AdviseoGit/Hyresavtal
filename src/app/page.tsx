import Link from "next/link";
import AgreementForm from "../components/AgreementForm";

export default function Home() {
  return (
    <main className="min-h-screen">
      <header className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <span className="text-lg font-bold text-brand">Hyresavtal.nu</span>
          <span className="text-sm text-gray-500">Enligt 12 kap. Jordabalken</span>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-6 pt-12 pb-6 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Skapa ett juridiskt korrekt hyresavtal
        </h1>
        <p className="mt-4 text-gray-600 max-w-xl mx-auto">
          Svara på några frågor så bygger vi ett komplett hyresavtal för bostad,
          grundat i Hyreslagen (12 kap. Jordabalken). Ladda ner som PDF – gratis.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 justify-center text-sm text-gray-600">
          <span className="bg-white border rounded-full px-3 py-1">✓ Tillsvidare eller bestämd tid</span>
          <span className="bg-white border rounded-full px-3 py-1">✓ Rätt uppsägningstid automatiskt</span>
          <span className="bg-white border rounded-full px-3 py-1">✓ Tvingande regler till hyresgästens skydd</span>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-16">
        <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>Observera:</strong> Tjänsten skapar ett <strong>utkast</strong> till
          hyresavtal grundat i Hyreslagen och utgör inte juridisk rådgivning. Granska
          dokumentet innan det undertecknas. Läs mer i{" "}
          <Link href="/villkor" className="underline font-medium">villkor &amp; ansvarsfriskrivning</Link>.
        </div>
        <AgreementForm />
      </section>

      <footer className="border-t bg-white">
        <div className="max-w-3xl mx-auto px-6 py-8 text-xs text-gray-500 space-y-2">
          <p>
            Avtalet bygger på bestämmelserna i 12 kap. Jordabalken (Hyreslagen).
            Tjänsten ger ett standardutkast och utgör inte individuell juridisk
            rådgivning. Vi tar inget ansvar för dokumentets innehåll, för att villkor
            visar sig ogiltiga eller för att en part bryter mot avtalet – se{" "}
            <Link href="/villkor" className="underline">villkor &amp; ansvarsfriskrivning</Link>.
            Vid komplexa situationer, kontakta en jurist.
          </p>
          <p>
            © {new Date().getFullYear()} Hyresavtal.nu ·{" "}
            <Link href="/villkor" className="underline">Villkor &amp; ansvarsfriskrivning</Link>
          </p>
        </div>
      </footer>
    </main>
  );
}
