import Link from "next/link";

import AgreementForm from "../components/AgreementForm";
import SiteFooter from "../components/SiteFooter";
import {
  PAUSED,
  PAUSE_BODY,
  PAUSE_EXISTING_DOCS,
  PAUSE_HEADING,
} from "../lib/service-status";

export default function Home() {
  return (
    <main className="min-h-screen">
      <header className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <span className="text-lg font-bold text-brand">Hyresavtal.nu</span>
          <span className="text-sm text-gray-500">Rätt lag för din uthyrning</span>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-6 pt-12 pb-6 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          {PAUSED ? PAUSE_HEADING : "Skapa ett hyresavtal som utgår från rätt lag"}
        </h1>
        {!PAUSED && (
          <>
            <p className="mt-4 text-gray-600 max-w-xl mx-auto">
              Hyr du ut din egen bostad gäller ofta lagen om uthyrning av egen bostad — inte
              hyreslagen. Skillnaden avgör uppsägningstid, besittningsskydd och hur hyran får sättas.
              Svara på några frågor så bygger vi avtalet därefter.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 justify-center text-sm text-gray-600">
              <span className="bg-white border rounded-full px-3 py-1">✓ Lagvalet avgörs i första steget</span>
              <span className="bg-white border rounded-full px-3 py-1">✓ Rätt uppsägningstid automatiskt</span>
              <span className="bg-white border rounded-full px-3 py-1">✓ Besiktning, inventarier och nycklar som bilagor</span>
            </div>
          </>
        )}
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-16">
        {PAUSED ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-900 space-y-3">
            <p>{PAUSE_BODY}</p>
            <p>{PAUSE_EXISTING_DOCS}</p>
            <p className="text-red-800">
              Du kan fortfarande läsa våra{" "}
              <Link href="/villkor" className="underline font-medium">
                villkor &amp; ansvarsfriskrivning
              </Link>{" "}
              och vår{" "}
              <Link href="/integritetspolicy" className="underline font-medium">
                integritetspolicy
              </Link>
              .
            </p>
          </div>
        ) : (
          <>
            <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <strong>Observera:</strong> Tjänsten skapar ett <strong>utkast</strong> till hyresavtal
              och utgör inte juridisk rådgivning. Granska dokumentet innan det undertecknas. Läs mer i{" "}
              <Link href="/villkor" className="underline font-medium">
                villkor &amp; ansvarsfriskrivning
              </Link>
              .
            </div>
            <AgreementForm />
          </>
        )}
      </section>

      <SiteFooter />
    </main>
  );
}
