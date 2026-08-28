/**
 * Utkast i localStorage — kravspecifikation v1 §7 och §11.
 * Ingen serverlagring: uppgifterna lämnar aldrig webbläsaren förrän användaren
 * själv begär en PDF. Utkastet gallras efter 30 dagar.
 */

import { createEmptyAnswerSet, type AnswerSet } from "./types";

export const DRAFT_KEY = "hyresavtal_draft_v1";
export const DRAFT_TTL_DAYS = 30;

interface StoredDraft {
  savedAt: string;
  answers: AnswerSet;
}

export function saveDraft(answers: AnswerSet): void {
  if (typeof window === "undefined") return;
  try {
    const payload: StoredDraft = { savedAt: new Date().toISOString(), answers };
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
  } catch {
    // Full eller blockerad lagring får aldrig stoppa ifyllnaden.
  }
}

export function loadDraft(): AnswerSet | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredDraft;
    const savedAt = new Date(parsed.savedAt);
    const ageDays = (Date.now() - +savedAt) / 86_400_000;
    if (!parsed.answers || Number.isNaN(+savedAt) || ageDays > DRAFT_TTL_DAYS) {
      clearDraft();
      return null;
    }
    // Slå ihop med tomt svarsset så att nya fält får standardvärden.
    return { ...createEmptyAnswerSet(), ...parsed.answers };
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignoreras
  }
}

export function draftSavedAt(): Date | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredDraft;
    const d = new Date(parsed.savedAt);
    return Number.isNaN(+d) ? null : d;
  } catch {
    return null;
  }
}
