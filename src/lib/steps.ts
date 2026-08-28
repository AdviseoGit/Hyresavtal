/**
 * Flödesstruktur — kravspecifikation v1 §7.
 *
 * Steg som blir irrelevanta av lagvalet döljs och räknas inte i
 * progressindikatorn. Visningsvillkoren bor här, inte i komponenterna.
 */

import type { AnswerSet } from "./types";

export type StepId =
  | "basics"
  | "consent"
  | "parties"
  | "object"
  | "rent"
  | "term"
  | "deposit"
  | "condition"
  | "usage"
  | "review";

export interface StepDef {
  id: StepId;
  title: string;
  summary: string;
}

export const STEPS: StepDef[] = [
  { id: "basics", title: "Grunduppgifter", summary: "Här avgörs vilken lag som gäller" },
  { id: "consent", title: "Samtycke & tillstånd", summary: "Styrelsens eller hyresvärdens medgivande" },
  { id: "parties", title: "Parterna", summary: "Hyresvärd och hyresgäster" },
  { id: "object", title: "Hyresobjektet", summary: "Bostaden och vad som ingår" },
  { id: "rent", title: "Hyra & kostnader", summary: "Hyra, betalning och driftskostnader" },
  { id: "term", title: "Avtalstid", summary: "Hyrestid och uppsägning" },
  { id: "deposit", title: "Deposition", summary: "Säkerhet och återbetalning" },
  { id: "condition", title: "Skick, inventarier & nycklar", summary: "Besiktning och överlämnande" },
  { id: "usage", title: "Nyttjande & ordningsregler", summary: "Vad som gäller under hyrestiden" },
  { id: "review", title: "Granska & signera", summary: "Sammanfattning och alla varningar" },
];

/**
 * Steget för samtycke är bara relevant när någon annan måste godkänna
 * upplåtelsen: bostadsrättsföreningens styrelse eller den egna hyresvärden.
 * En villaägare behöver inget medgivande och hoppar över steget.
 */
export function isStepVisible(id: StepId, a: AnswerSet): boolean {
  if (id === "consent") return a.landlordTitle !== "" && a.landlordTitle !== "owner_freehold";
  return true;
}

export function visibleSteps(a: AnswerSet): StepDef[] {
  return STEPS.filter((s) => isStepVisible(s.id, a));
}

export function stepIndex(id: StepId, a: AnswerSet): number {
  return visibleSteps(a).findIndex((s) => s.id === id);
}
