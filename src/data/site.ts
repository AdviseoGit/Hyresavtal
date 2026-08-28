/**
 * Uppgifter som krävs enligt e-handelslagen och dataskyddsförordningen (§11).
 * Sätts som miljövariabler vid driftsättning; saknade värden visas som
 * uppenbara luckor i stället för att tyst utelämnas.
 */

export const SITE = {
  name: "Hyresavtal.nu",
  operator: process.env.NEXT_PUBLIC_SITE_OPERATOR ?? "",
  orgNumber: process.env.NEXT_PUBLIC_SITE_ORG_NUMBER ?? "",
  contactEmail: process.env.NEXT_PUBLIC_SITE_CONTACT_EMAIL ?? "",
  address: process.env.NEXT_PUBLIC_SITE_ADDRESS ?? "",
};

export const MISSING = "uppgift saknas";

export function siteValue(value: string): string {
  return value || MISSING;
}

export function siteDetailsComplete(): boolean {
  return Boolean(SITE.operator && SITE.orgNumber && SITE.contactEmail);
}
