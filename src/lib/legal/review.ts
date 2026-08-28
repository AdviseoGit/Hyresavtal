/**
 * Granskningsgrind — kravspecifikation v1 §12.
 *
 * Ingen klausultext får renderas i produktion innan en verksam jurist granskat
 * den. Granskningsstatus ligger som metadata per klausul i registret; den här
 * modulen gör statusen kontrollerbar och låter bygget fela hellre än att
 * skicka ut ogranskad text.
 *
 * Under utveckling och granskning sätts ALLOW_UNREVIEWED_CLAUSES=1.
 */

import { CLAUSES, type ClauseDef } from "./clauses";

/** Den granskningsomgång som krävs för att texten ska få gå till produktion. */
export const REQUIRED_REVIEW_VERSION = "v1";

export const FEATURE_TENURE_WAIVER = process.env.FEATURE_TENURE_WAIVER === "true";

export function allowUnreviewed(): boolean {
  return process.env.ALLOW_UNREVIEWED_CLAUSES === "1";
}

export function isReviewed(clause: ClauseDef): boolean {
  const r = clause.review;
  return Boolean(r.reviewedBy && r.reviewedAt && r.reviewVersion === REQUIRED_REVIEW_VERSION);
}

export function unreviewedClauses(): string[] {
  return CLAUSES.filter((c) => !isReviewed(c)).map((c) => c.id);
}

export interface ReviewStatus {
  total: number;
  reviewed: number;
  unreviewed: string[];
  requiredVersion: string;
  allowUnreviewed: boolean;
}

export function reviewStatus(): ReviewStatus {
  const unreviewed = unreviewedClauses();
  return {
    total: CLAUSES.length,
    reviewed: CLAUSES.length - unreviewed.length,
    unreviewed,
    requiredVersion: REQUIRED_REVIEW_VERSION,
    allowUnreviewed: allowUnreviewed(),
  };
}

/** Kastar om ogranskad klausultext skulle renderas utan uttryckligt medgivande. */
export function assertClausesReviewed(): void {
  if (allowUnreviewed()) return;
  const unreviewed = unreviewedClauses();
  if (unreviewed.length === 0) return;
  throw new Error(
    `${unreviewed.length} av ${CLAUSES.length} klausuler saknar juristgranskning (${REQUIRED_REVIEW_VERSION}): ` +
      `${unreviewed.join(", ")}. Sätt ALLOW_UNREVIEWED_CLAUSES=1 för att bygga eller köra ändå.`
  );
}
