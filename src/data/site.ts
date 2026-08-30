/**
 * Uppgifter som krävs enligt e-handelslagen och dataskyddsförordningen (§11).
 *
 * Publika bolagsuppgifter som ändå visas på sajten — de ligger därför i koden
 * och inte enbart i miljön. Miljövariabler går före när de är satta, så en
 * uppgift kan bytas utan kodändring. Saknade värden visas som uppenbara luckor
 * i stället för att tyst utelämnas.
 */

export const SITE = {
  name: "Hyresavtal.nu",
  operator: process.env.NEXT_PUBLIC_SITE_OPERATOR || "Adivseo AB",
  orgNumber: process.env.NEXT_PUBLIC_SITE_ORG_NUMBER || "559312-5437",
  contactEmail: process.env.NEXT_PUBLIC_SITE_CONTACT_EMAIL || "simon@adviseo.se",
  address: process.env.NEXT_PUBLIC_SITE_ADDRESS ?? "",
};

export const MISSING = "uppgift saknas";

export function siteValue(value: string): string {
  return value || MISSING;
}

export function siteDetailsComplete(): boolean {
  return Boolean(SITE.operator && SITE.orgNumber && SITE.contactEmail);
}
