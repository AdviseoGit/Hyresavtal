/**
 * PDF-generering. Ingen serverlagring och ingen loggning av fältinnehåll (§11).
 */

import { NextResponse } from "next/server";

import { createEmptyAnswerSet, type AnswerSet } from "../../../lib/types";
import { agreementFileName } from "../../../lib/format";
import { resolveLegalContext } from "../../../lib/legal/regime";
import { assertClausesReviewed } from "../../../lib/legal/review";
import { validateAll } from "../../../lib/validation";
import { generateDocuments, type DocumentPart } from "../../../lib/pdf/agreement";
import { mergePdfs } from "../../../lib/pdf/document";

export const runtime = "nodejs";

const PDF_HEADERS = {
  "Content-Type": "application/pdf",
  // Dokumentet innehåller personuppgifter och får inte mellanlagras (§11).
  "Cache-Control": "no-store",
} as const;

function fail(message: string, status: number, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ error: message, ...extra }, { status, headers: { "Cache-Control": "no-store" } });
}

/** Fyller på med standardvärden så att en ofullständig begäran inte kan krascha renderingen. */
function coerce(input: unknown): AnswerSet {
  const base = createEmptyAnswerSet();
  if (!input || typeof input !== "object") return base;
  return { ...base, ...(input as Partial<AnswerSet>) } as AnswerSet;
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    // Felmeddelandet från JSON.parse kan innehålla delar av kroppen — logga det inte.
    return fail("Kunde inte läsa begäran.", 400);
  }

  try {
    assertClausesReviewed();
  } catch (err) {
    console.error("generate-agreement: klausulregistret är inte granskat");
    return fail(
      "Tjänsten är inte tillgänglig: avtalstexten inväntar juristgranskning.",
      503,
      { detail: err instanceof Error ? err.message : undefined }
    );
  }

  const answers = coerce(payload);

  const errors = validateAll(answers);
  if (Object.keys(errors).length > 0) {
    return fail("Formuläret är inte komplett.", 400, { fields: errors });
  }

  const ctx = resolveLegalContext(answers);

  // 9: W-CONSENT kräver aktiv bekräftelse innan PDF genereras.
  const blocking = ctx.warnings.filter((w) => w.level === "blocking");
  if (blocking.length > 0 && !answers.acknowledgeConsentRisk) {
    return fail("Bekräfta varningen om samtycke innan avtalet skapas.", 400, {
      warnings: blocking.map((w) => w.id),
    });
  }

  try {
    const docs = await generateDocuments(answers, ctx);
    const requested = new URL(request.url).searchParams.get("part") as DocumentPart | "complete" | null;

    if (requested && requested !== "complete") {
      const doc = docs.find((d) => d.part === requested);
      if (!doc) return fail("Den efterfrågade handlingen ingår inte i detta avtal.", 404);
      return new NextResponse(Buffer.from(doc.bytes), {
        status: 200,
        headers: { ...PDF_HEADERS, "Content-Disposition": `attachment; filename="${doc.fileName}"` },
      });
    }

    const bytes = docs.length === 1 ? docs[0].bytes : await mergePdfs(docs.map((d) => d.bytes));
    const fileName =
      docs.length === 1 ? agreementFileName(answers) : agreementFileName(answers, "-komplett");

    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: { ...PDF_HEADERS, "Content-Disposition": `attachment; filename="${fileName}"` },
    });
  } catch (err) {
    // Aldrig hela felobjektet: det kan bära med sig indata till loggen.
    console.error("generate-agreement: rendering misslyckades", err instanceof Error ? err.name : "okänt fel");
    return fail("Kunde inte skapa avtalet.", 500);
  }
}
