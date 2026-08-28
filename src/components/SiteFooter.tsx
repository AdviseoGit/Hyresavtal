import Link from "next/link";

import { SITE, siteValue } from "../data/site";

export default function SiteFooter() {
  return (
    <footer className="border-t bg-white">
      <div className="max-w-3xl mx-auto px-6 py-8 text-xs text-gray-500 space-y-3">
        <p>
          Tjänsten avgör vilken lag som gäller för din uthyrning och skapar ett standardutkast
          utifrån den. Utkastet utgör inte individuell juridisk rådgivning. Granska dokumentet
          innan det undertecknas och kontakta en jurist vid komplexa situationer. Se{" "}
          <Link href="/villkor" className="underline">
            villkor &amp; ansvarsfriskrivning
          </Link>
          .
        </p>
        <p>
          Personuppgiftsansvarig: {siteValue(SITE.operator)}
          {SITE.orgNumber ? `, org.nr ${SITE.orgNumber}` : `, org.nr ${siteValue("")}`}
          {SITE.address ? `, ${SITE.address}` : ""}. Kontakt: {siteValue(SITE.contactEmail)}.
        </p>
        <p>
          © {new Date().getFullYear()} {SITE.name} ·{" "}
          <Link href="/villkor" className="underline">
            Villkor
          </Link>{" "}
          ·{" "}
          <Link href="/integritetspolicy" className="underline">
            Integritetspolicy
          </Link>
        </p>
      </div>
    </footer>
  );
}
