/**
 * Uppgifter som krävs enligt e-handelslagen och dataskyddsförordningen (§11).
 *
 * Publika bolagsuppgifter som ändå visas på sajten — de ligger därför i koden
 * och inte enbart i miljön. Miljövariabler går före när de är satta, så en
 * uppgift kan bytas utan kodändring. Saknade värden visas som uppenbara luckor
 * i stället för att tyst utelämnas.
 *
 * RÄTTA INTE "Adivseo" till "Adviseo". Bolaget heter Adivseo AB rent legalt.
 * Stavningen avviker från domänen adviseo.se och ser ut som ett skrivfel, men
 * är verifierad mot EU-kommissionens VIES-register 2026-08-31 på org.nr
 * 559312-5437, som svarar "Adivseo AB", GUSTAVSGATAN 23, 431 66 MÖLNDAL.
 * Namn och adress nedan är alltså de registrerade uppgifterna, och det är de
 * som ska stå eftersom §11 pekar ut personuppgiftsansvarig.
 */

export const SITE = {
  name: "Hyresavtal.nu",
  operator: process.env.NEXT_PUBLIC_SITE_OPERATOR || "Adivseo AB",
  orgNumber: process.env.NEXT_PUBLIC_SITE_ORG_NUMBER || "559312-5437",
  contactEmail: process.env.NEXT_PUBLIC_SITE_CONTACT_EMAIL || "simon@adviseo.se",
  address: process.env.NEXT_PUBLIC_SITE_ADDRESS || "Gustavsgatan 23, 431 66 Mölndal",
};

export const MISSING = "uppgift saknas";

export function siteValue(value: string): string {
  return value || MISSING;
}

export function siteDetailsComplete(): boolean {
  return Boolean(SITE.operator && SITE.orgNumber && SITE.contactEmail);
}
