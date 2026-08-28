import Link from "next/link";

import { SITE, siteValue } from "../../data/site";
import { DRAFT_TTL_DAYS } from "../../lib/draft";

export const metadata = {
  title: "Integritetspolicy – Hyresavtal.nu",
  description:
    "Så behandlas personuppgifter i Hyresavtal.nu: inga uppgifter lagras på server, utkast sparas lokalt i din webbläsare.",
};

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-semibold mt-8 mb-2">{children}</h2>;
}

export default function Integritetspolicy() {
  return (
    <main className="min-h-screen">
      <header className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-brand">
            Hyresavtal.nu
          </Link>
          <Link href="/" className="text-sm text-brand hover:underline">
            ← Tillbaka
          </Link>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-6 py-10 text-[15px] leading-relaxed text-gray-800">
        <h1 className="text-2xl font-bold">Integritetspolicy</h1>
        <p className="text-sm text-gray-500 mt-1">Senast uppdaterad: 2026-08-28</p>

        <H>Personuppgiftsansvarig</H>
        <p>
          {siteValue(SITE.operator)}
          {SITE.orgNumber ? `, org.nr ${SITE.orgNumber}` : ", org.nr uppgift saknas"}
          {SITE.address ? `, ${SITE.address}` : ""}, är personuppgiftsansvarig för behandlingen.
          Kontakta oss på {siteValue(SITE.contactEmail)} vid frågor eller för att utöva dina
          rättigheter.
        </p>

        <H>Vilka uppgifter behandlas</H>
        <p>
          För att skapa ett hyresavtal fyller du i namn, person- eller organisationsnummer,
          adresser, e-postadresser och telefonnummer för hyresvärd och hyresgäster, samt uppgifter
          om bostaden, hyran och avtalsvillkoren.
        </p>

        <H>Hur uppgifterna behandlas</H>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>
            Uppgifterna sparas som utkast i din egen webbläsare (localStorage) i {DRAFT_TTL_DAYS}{" "}
            dagar, så att du kan fortsätta där du slutade. De skickas inte till oss.
          </li>
          <li>
            När du väljer att skapa PDF:en skickas uppgifterna till vår server enbart för att
            rendera dokumentet. De lagras inte, sparas inte i loggar och används inte till något
            annat. Svaret cachas inte.
          </li>
          <li>Vi säljer inte uppgifter och delar dem inte med tredje part.</li>
        </ul>

        <H>Rättslig grund</H>
        <p>
          Behandlingen sker för att kunna leverera den tjänst du efterfrågar, det vill säga för att
          fullgöra ett avtal med dig eller på grundval av ditt samtycke när du själv matar in
          uppgifterna.
        </p>

        <H>Lagringstid</H>
        <p>
          Ingen lagring sker hos oss. Utkastet i din webbläsare raderas automatiskt efter{" "}
          {DRAFT_TTL_DAYS} dagar, och du kan radera det när som helst med knappen &quot;Rensa mina
          uppgifter&quot; i formuläret.
        </p>

        <H>Cookies</H>
        <p>
          Tjänsten sätter inga cookies för marknadsföring eller spårning. Det utkast som sparas i
          din webbläsare är nödvändigt för funktionen och kan raderas av dig.
        </p>

        <H>Dina rättigheter</H>
        <p>
          Du har rätt till information om, rättelse av och radering av dina personuppgifter samt
          rätt att invända mot behandlingen. Eftersom vi inte lagrar några uppgifter kan vi normalt
          bara hjälpa dig med frågor om behandlingen som sådan. Du har också rätt att klaga till
          Integritetsskyddsmyndigheten.
        </p>

        <div className="mt-10">
          <Link href="/" className="text-brand hover:underline">
            ← Tillbaka till avtalsgeneratorn
          </Link>
        </div>
      </article>
    </main>
  );
}
