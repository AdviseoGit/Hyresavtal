/**
 * PDF-layout enligt kravspecifikation v1 §8.4:
 * A4, 25 mm marginal, 11 pt brödtext, sidfot med sidnumrering och paraferingsrad.
 */

import { PDFDocument, PDFFont, PDFPage, rgb, StandardFonts } from "pdf-lib";

/** A4 i punkter. */
export const A4: [number, number] = [595.28, 841.89];
/** 25 mm. */
export const MARGIN = 70.87;
export const BODY_SIZE = 11;
export const LINE = 15.5;

const TEXT_COLOR = rgb(0.1, 0.1, 0.12);
const MUTED = rgb(0.42, 0.42, 0.46);
const RULE = rgb(0.3, 0.3, 0.3);

/**
 * pdf-libs standardtypsnitt använder WinAnsi (cp1252). Byt ut allt utanför den
 * teckenuppsättningen så att en enstaka glyf aldrig kan fälla hela begäran.
 * Svenska å, ä, ö ingår i cp1252 och påverkas inte.
 */
export function san(s: unknown): string {
  return String(s ?? "")
    .replace(/[‘’‚]/g, "'")
    .replace(/[“”„]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .replace(/[•●]/g, "-")
    .replace(/ /g, " ")
    .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, "");
}

export class Doc {
  doc!: PDFDocument;
  page!: PDFPage;
  font!: PDFFont;
  bold!: PDFFont;
  italic!: PDFFont;
  y = 0;
  width = A4[0];
  height = A4[1];

  static async create(): Promise<Doc> {
    const d = new Doc();
    d.doc = await PDFDocument.create();
    d.font = await d.doc.embedFont(StandardFonts.Helvetica);
    d.bold = await d.doc.embedFont(StandardFonts.HelveticaBold);
    d.italic = await d.doc.embedFont(StandardFonts.HelveticaOblique);
    d.addPage();
    return d;
  }

  addPage(): void {
    this.page = this.doc.addPage(A4);
    this.y = this.height - MARGIN;
  }

  /** Reserverar utrymme och bryter sida när innehållet inte får plats. */
  ensure(space: number): void {
    if (this.y - space < MARGIN) this.addPage();
  }

  text(
    t: string,
    {
      size = BODY_SIZE,
      font = this.font,
      gap = LINE,
      indent = 0,
      color = TEXT_COLOR,
    }: { size?: number; font?: PDFFont; gap?: number; indent?: number; color?: ReturnType<typeof rgb> } = {}
  ): void {
    const maxW = this.width - MARGIN * 2 - indent;
    const words = san(t).split(/\s+/).filter(Boolean);
    let line = "";
    const flush = () => {
      this.ensure(gap);
      this.page.drawText(line, { x: MARGIN + indent, y: this.y, size, font, color });
      this.y -= gap;
      line = "";
    };
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (font.widthOfTextAtSize(test, size) > maxW && line) {
        flush();
        line = w;
      } else {
        line = test;
      }
    }
    if (line) flush();
  }

  title(t: string, subtitle?: string): void {
    this.text(t, { size: 21, font: this.bold, gap: 26 });
    if (subtitle) this.text(subtitle, { size: 12, font: this.bold, gap: 18 });
    this.gap(8);
  }

  heading(t: string): void {
    this.gap(10);
    this.ensure(LINE * 2);
    this.text(t, { size: 12.5, font: this.bold, gap: 17 });
  }

  note(t: string): void {
    this.text(t, { size: 9, font: this.italic, gap: 12, color: MUTED });
  }

  kv(label: string, value: string): void {
    this.text(`${label}: ${value || "—"}`);
  }

  gap(n = 10): void {
    this.y -= n;
  }

  /** Ifyllningsrad för handskriven text. */
  ruledLine(label: string, width = this.width - MARGIN * 2): void {
    this.ensure(30);
    this.page.drawLine({
      start: { x: MARGIN, y: this.y },
      end: { x: MARGIN + width, y: this.y },
      thickness: 0.7,
      color: RULE,
    });
    this.y -= 11;
    this.page.drawText(san(label), { x: MARGIN, y: this.y, size: 8.5, font: this.font, color: MUTED });
    this.y -= 18;
  }

  /** Två ifyllningsrader bredvid varandra. */
  ruledPair(leftLabel: string, rightLabel: string): void {
    this.ensure(34);
    const colW = (this.width - MARGIN * 2 - 30) / 2;
    const y = this.y;
    this.page.drawLine({ start: { x: MARGIN, y }, end: { x: MARGIN + colW, y }, thickness: 0.7, color: RULE });
    this.page.drawLine({
      start: { x: MARGIN + colW + 30, y },
      end: { x: MARGIN + colW * 2 + 30, y },
      thickness: 0.7,
      color: RULE,
    });
    this.y -= 11;
    this.page.drawText(san(leftLabel), { x: MARGIN, y: this.y, size: 8.5, font: this.font, color: MUTED });
    this.page.drawText(san(rightLabel), { x: MARGIN + colW + 30, y: this.y, size: 8.5, font: this.font, color: MUTED });
    this.y -= 20;
  }

  /** Tunn avdelningslinje, t.ex. mellan tabellrader. */
  hrule(offset = 10): void {
    this.page.drawLine({
      start: { x: MARGIN, y: this.y + offset },
      end: { x: this.width - MARGIN, y: this.y + offset },
      thickness: 0.4,
      color: rgb(0.8, 0.8, 0.82),
    });
  }

  /** Enkel tabellrad med fasta kolumnbredder. */
  row(cells: string[], widths: number[], bold = false): void {
    this.ensure(LINE);
    let x = MARGIN;
    const font = bold ? this.bold : this.font;
    cells.forEach((cell, i) => {
      this.page.drawText(san(cell), { x, y: this.y, size: 9.5, font, color: TEXT_COLOR });
      x += widths[i];
    });
    this.y -= LINE;
  }

  /**
   * Sidfot enligt 8.4 på samtliga sidor. Körs sist, när sidantalet är känt.
   */
  finalize(documentName: string, withInitials: boolean): void {
    const pages = this.doc.getPages();
    pages.forEach((page, i) => {
      const label = san(`${documentName} · sida ${i + 1} av ${pages.length}`);
      page.drawText(label, { x: MARGIN, y: 40, size: 8, font: this.font, color: MUTED });
      if (withInitials) {
        const initials = "Parafering: ............... / ...............";
        const w = this.font.widthOfTextAtSize(initials, 8);
        page.drawText(initials, { x: this.width - MARGIN - w, y: 40, size: 8, font: this.font, color: MUTED });
      }
    });
  }

  save(): Promise<Uint8Array> {
    return this.doc.save();
  }
}

/** Slår ihop flera PDF:er till ett dokument (8.4, hyresavtal-komplett.pdf). */
export async function mergePdfs(parts: Uint8Array[]): Promise<Uint8Array> {
  const merged = await PDFDocument.create();
  for (const part of parts) {
    const src = await PDFDocument.load(part);
    const pages = await merged.copyPages(src, src.getPageIndices());
    pages.forEach((p) => merged.addPage(p));
  }
  return merged.save();
}
