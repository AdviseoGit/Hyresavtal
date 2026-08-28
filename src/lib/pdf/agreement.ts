/**
 * Dokumentgenerering — kravspecifikation v1 §8.
 *
 * Huvudavtalet renderas ur klausullistan, aldrig ur en fast mall. Bilagorna
 * (§5.8, §4.4) är egna handlingar och får aldrig bakas in som avsnitt i avtalet.
 */

import type { AnswerSet } from "../types";
import { formatAddress, formatDate, formatMoney, tenantNames } from "../format";
import { buildClauses } from "../legal/clauses";
import type { LegalContext } from "../legal/regime";
import { FEATURE_TENURE_WAIVER } from "../legal/review";
import { Doc, mergePdfs } from "./document";

export type DocumentPart = "main" | "inspection" | "inventory" | "keys" | "tenure_waiver";

export interface GeneratedDocument {
  part: DocumentPart;
  fileName: string;
  bytes: Uint8Array;
}

const DOC_NAME = "Hyresavtal - bostadslägenhet";

/* --------------------------------------------------------- huvudavtalet */

export async function renderAgreement(a: AnswerSet, ctx: LegalContext): Promise<Uint8Array> {
  const pdf = await Doc.create();

  pdf.title("HYRESAVTAL", "Bostadslägenhet");
  pdf.text(`Detta avtal regleras av ${ctx.regimeName}.`, { font: pdf.bold });
  pdf.gap(6);

  for (const clause of buildClauses(a, ctx)) {
    pdf.heading(`${clause.number}. ${clause.heading}`);
    clause.paragraphs.forEach((p, i) => {
      if (p.startsWith("- ")) {
        pdf.text(p.replace(/^-\s*/, "• "), { indent: 12 });
      } else {
        pdf.text(p);
      }
      if (i < clause.paragraphs.length - 1) pdf.gap(2);
    });
    if (clause.legalBasis) pdf.note(`Lagrum: ${clause.legalBasis}`);
  }

  // Underskriftssida: en rad per part (8.4).
  pdf.gap(24);
  pdf.heading("Underskrifter");
  pdf.text(
    `Avtalet undertecknas i ${a.copies ?? a.tenants.length + 1} exemplar. Ort och datum: ${a.signingPlace || "—"}, ${formatDate(a.signingDate)}.`
  );
  pdf.gap(18);

  pdf.text("Hyresvärd", { font: pdf.bold, gap: 18 });
  pdf.ruledPair("Namnteckning", "Ort och datum");
  pdf.text(`Namnförtydligande: ${a.landlordName || ""}`, { size: 9.5, gap: 22 });

  a.tenants.forEach((t, i) => {
    pdf.gap(6);
    pdf.text(a.tenants.length > 1 ? `Hyresgäst ${i + 1}` : "Hyresgäst", { font: pdf.bold, gap: 18 });
    pdf.ruledPair("Namnteckning", "Ort och datum");
    pdf.text(`Namnförtydligande: ${t.name || ""}`, { size: 9.5, gap: 22 });
  });

  pdf.gap(16);
  pdf.note(
    "Dokumentet är skapat med Hyresavtal.nu utifrån de uppgifter parterna lämnat. Kontrollera innehållet innan avtalet undertecknas."
  );

  pdf.finalize(DOC_NAME, true);
  return pdf.save();
}

/* ------------------------------------------------------------- bilagor */

async function renderInspection(a: AnswerSet): Promise<Uint8Array> {
  const pdf = await Doc.create();
  pdf.title("BESIKTNINGSPROTOKOLL", "Bilaga till hyresavtal");
  pdf.kv("Hyresobjekt", formatAddress(a.objectAddress));
  pdf.kv("Hyresvärd", a.landlordName);
  pdf.kv("Hyresgäst", tenantNames(a));
  pdf.kv("Tillträdesdag", formatDate(a.startDate));
  pdf.gap(8);

  pdf.heading("Kända brister vid tillträdet");
  pdf.text(a.existingDamage || "Inga kända brister har antecknats.");

  pdf.heading("Besiktning");
  pdf.text(
    "Parterna besiktigar bostaden gemensamt och antecknar skicket nedan. Protokollet undertecknas av båda parter vid respektive tillfälle."
  );
  pdf.gap(6);

  const widths = [150, 170, 140];
  pdf.row(["Utrymme", "Skick vid tillträde", "Skick vid avflyttning"], widths, true);
  const rooms = [
    "Hall",
    "Vardagsrum",
    "Kök",
    "Sovrum",
    "Badrum",
    "Balkong/uteplats",
    "Förråd",
    "Övrigt",
  ];
  rooms.forEach((r) => {
    pdf.row([r, "", ""], widths);
    pdf.hrule();
  });

  pdf.gap(20);
  pdf.heading("Underskrifter vid tillträde");
  pdf.ruledPair("Hyresvärd", "Hyresgäst");
  pdf.gap(10);
  pdf.heading("Underskrifter vid avflyttning");
  pdf.ruledPair("Hyresvärd", "Hyresgäst");

  pdf.finalize("Besiktningsprotokoll", false);
  return pdf.save();
}

async function renderInventory(a: AnswerSet): Promise<Uint8Array> {
  const pdf = await Doc.create();
  pdf.title("INVENTARIELISTA", "Bilaga till hyresavtal");
  pdf.kv("Hyresobjekt", formatAddress(a.objectAddress));
  pdf.kv("Möbleringsgrad", a.furnished === "full" ? "Fullt möblerad" : "Delvis möblerad");
  pdf.gap(8);

  const widths = [230, 80, 150];
  pdf.row(["Inventarie", "Antal", "Skick vid tillträde"], widths, true);
  a.inventoryItems.forEach((item) => {
    pdf.row([item.item, String(item.quantity), item.condition || ""], widths);
  });
  if (a.inventoryItems.length === 0) pdf.text("Inga inventarier har angetts.");

  pdf.gap(20);
  pdf.text(
    "Hyresgästen kvitterar genom sin underskrift att ovanstående inventarier finns i bostaden vid tillträdet och ska återlämnas i samma skick vid avflyttningen, med undantag för normalt slitage."
  );
  pdf.gap(14);
  pdf.ruledPair("Hyresvärd", "Hyresgäst");

  pdf.finalize("Inventarielista", false);
  return pdf.save();
}

async function renderKeys(a: AnswerSet): Promise<Uint8Array> {
  const pdf = await Doc.create();
  pdf.title("NYCKELKVITTENS", "Bilaga till hyresavtal");
  pdf.kv("Hyresobjekt", formatAddress(a.objectAddress));
  pdf.kv("Hyresgäst", tenantNames(a));
  pdf.gap(8);

  const widths = [230, 90, 140];
  pdf.row(["Nyckeltyp", "Antal", "Återlämnad (datum)"], widths, true);
  a.keys.forEach((k) => pdf.row([k.type, String(k.quantity), ""], widths));
  if (a.keys.length === 0) pdf.text("Inga nycklar har angetts.");

  pdf.gap(16);
  if (a.keyReplacementCost !== null) {
    pdf.text(`Kostnad för ersättningsnyckel: ${formatMoney(a.keyReplacementCost)}.`);
  }
  pdf.text(
    "Hyresgästen kvitterar mottagandet av ovanstående nycklar och ansvarar för att samtliga återlämnas senast vid hyrestidens slut."
  );
  pdf.gap(14);
  pdf.text("Kvittens vid utlämning", { font: pdf.bold, gap: 18 });
  pdf.ruledPair("Hyresvärd", "Hyresgäst");
  pdf.gap(8);
  pdf.text("Kvittens vid återlämning", { font: pdf.bold, gap: 18 });
  pdf.ruledPair("Hyresvärd", "Hyresgäst");

  pdf.finalize("Nyckelkvittens", false);
  return pdf.save();
}

/**
 * 4.4 — avstående från besittningsskydd ska vara en särskilt upprättad handling,
 * aldrig ett avsnitt i avtalet. Bakom feature-flagga tills juristgranskning skett.
 */
async function renderTenureWaiver(a: AnswerSet, ctx: LegalContext): Promise<Uint8Array> {
  const pdf = await Doc.create();
  pdf.title("ÖVERENSKOMMELSE OM AVSTÅENDE FRÅN BESITTNINGSSKYDD", "Särskilt upprättad handling");
  pdf.kv("Hyresobjekt", formatAddress(a.objectAddress));
  pdf.kv("Hyresvärd", a.landlordName);
  pdf.kv("Hyresgäst", tenantNames(a));
  pdf.kv("Hyrestid från", formatDate(a.startDate));
  pdf.gap(10);
  pdf.text(
    "Parterna är överens om att hyresgästen avstår från sitt besittningsskydd enligt 12 kap. 45 a § jordabalken. Överenskommelsen avser tiden från tillträdesdagen och gäller högst fyra år."
  );
  pdf.gap(6);
  pdf.text(
    "En sådan överenskommelse gäller som huvudregel först sedan hyresnämnden godkänt den. Godkännande behövs inte i de undantagsfall som anges i 12 kap. 45 a § andra stycket jordabalken."
  );
  pdf.gap(6);
  pdf.text(`Besittningsskyddets utgångspunkt i detta hyresförhållande: ${ctx.securityOfTenure.reason}`);
  pdf.gap(18);
  pdf.ruledPair("Hyresvärd", "Hyresgäst");
  pdf.note(
    "Denna handling är ett utkast som inte är granskat av jurist och kräver normalt hyresnämndens godkännande för att gälla."
  );
  pdf.finalize("Avstående från besittningsskydd", false);
  return pdf.save();
}

/* ------------------------------------------------------------ paketering */

export async function generateDocuments(
  a: AnswerSet,
  ctx: LegalContext
): Promise<GeneratedDocument[]> {
  const docs: GeneratedDocument[] = [
    { part: "main", fileName: "hyresavtal.pdf", bytes: await renderAgreement(a, ctx) },
  ];

  if (a.inspectionOnMoveIn || a.inspectionOnMoveOut) {
    docs.push({
      part: "inspection",
      fileName: "bilaga-besiktningsprotokoll.pdf",
      bytes: await renderInspection(a),
    });
  }
  if (a.furnished !== "none" && a.furnished !== "") {
    docs.push({
      part: "inventory",
      fileName: "bilaga-inventarielista.pdf",
      bytes: await renderInventory(a),
    });
  }
  if (a.keys.length > 0) {
    docs.push({ part: "keys", fileName: "bilaga-nyckelkvittens.pdf", bytes: await renderKeys(a) });
  }
  if (FEATURE_TENURE_WAIVER && ctx.securityOfTenure.status === "arises_after") {
    docs.push({
      part: "tenure_waiver",
      fileName: "bilaga-avstaende-besittningsskydd.pdf",
      bytes: await renderTenureWaiver(a, ctx),
    });
  }

  return docs;
}

export async function generateCompletePdf(a: AnswerSet, ctx: LegalContext): Promise<Uint8Array> {
  const docs = await generateDocuments(a, ctx);
  return docs.length === 1 ? docs[0].bytes : mergePdfs(docs.map((d) => d.bytes));
}
