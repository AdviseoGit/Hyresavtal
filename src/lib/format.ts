/**
 * Presentation i sv-SE — kravspecifikation v1 §10.
 * Belopp med mellanslag som tusentalsavgränsare och "kr" efter beloppet,
 * datum alltid ÅÅÅÅ-MM-DD.
 */

import type { Address, AnswerSet } from "./types";

const NBSP = " ";

export function formatAmount(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("sv-SE").format(value).replace(/\s/g, NBSP);
}

export function formatMoney(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `${formatAmount(value)}${NBSP}kr`;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  return value.slice(0, 10);
}

export function formatAddress(a: Address | null | undefined): string {
  if (!a) return "—";
  const parts = [a.street, [a.postalCode, a.city].filter(Boolean).join(" ")].filter(Boolean);
  return parts.join(", ") || "—";
}

export function formatBool(value: boolean | null | undefined, yes = "Ja", no = "Nej"): string {
  if (value === null || value === undefined) return "—";
  return value ? yes : no;
}

export function tenantNames(a: AnswerSet): string {
  const names = a.tenants.map((t) => t.name).filter(Boolean);
  if (names.length === 0) return "—";
  if (names.length === 1) return names[0];
  return names.slice(0, -1).join(", ") + " och " + names[names.length - 1];
}

/** Filnamn enligt 8.4: hyresavtal-{{gata}}-{{tillträdesdag}}.pdf, slugifierat. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[åä]/g, "a")
    .replace(/ö/g, "o")
    .replace(/é/g, "e")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function agreementFileName(a: AnswerSet, suffix = ""): string {
  const street = slugify(a.objectAddress.street || "bostad");
  const date = a.startDate ? a.startDate.slice(0, 10) : "utkast";
  return `hyresavtal-${street}-${date}${suffix}.pdf`;
}
