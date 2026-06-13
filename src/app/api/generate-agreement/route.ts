import { NextResponse } from "next/server";
import { PDFDocument, PDFFont, PDFPage, rgb, StandardFonts } from "pdf-lib";
import legalDatabase from "../../../data/legal_database.json";

export const runtime = "nodejs";

interface Clause {
  id: string;
  lagrum: string;
  kategori: string;
  typ: string;
  beskrivning: string;
  klausul_text: string;
}
const clauses = legalDatabase as Clause[];
const byId = (id: string) => clauses.find((c) => c.id === id);

// pdf-lib StandardFonts use WinAnsi (cp1252). Replace anything outside it so a
// stray glyph can never throw and 500 the whole request.
function san(s: unknown): string {
  return String(s ?? "")
    .replace(/[‘’‚]/g, "'")
    .replace(/[“”„]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .replace(/[•●]/g, "-")
    .replace(/ /g, " ")
    // drop any remaining non-cp1252 chars
    .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, "");
}

const MARGIN = 56;
const SIZE = 11;
const LINE = 16;

class Doc {
  doc!: PDFDocument;
  page!: PDFPage;
  font!: PDFFont;
  bold!: PDFFont;
  y = 0;
  width = 0;
  height = 0;

  async init() {
    this.doc = await PDFDocument.create();
    this.font = await this.doc.embedFont(StandardFonts.Helvetica);
    this.bold = await this.doc.embedFont(StandardFonts.HelveticaBold);
    this.addPage();
  }
  addPage() {
    this.page = this.doc.addPage();
    const { width, height } = this.page.getSize();
    this.width = width;
    this.height = height;
    this.y = height - MARGIN;
  }
  ensure(space: number) {
    if (this.y - space < MARGIN) this.addPage();
  }
  text(t: string, { size = SIZE, font = this.font, gap = LINE, indent = 0 } = {}) {
    const maxW = this.width - MARGIN * 2 - indent;
    const words = san(t).split(/\s+/);
    let line = "";
    const flush = () => {
      this.ensure(gap);
      this.page.drawText(line, { x: MARGIN + indent, y: this.y, size, font, color: rgb(0.1, 0.1, 0.12) });
      this.y -= gap;
      line = "";
    };
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (font.widthOfTextAtSize(test, size) > maxW && line) flush();
      else line = test;
    }
    if (line) flush();
  }
  heading(t: string) {
    this.y -= 8;
    this.ensure(20);
    this.text(t, { size: 13, font: this.bold, gap: 18 });
    this.y -= 2;
  }
  kv(label: string, value: string) {
    this.text(`${label}: ${value || "—"}`);
  }
  gap(n = 10) {
    this.y -= n;
  }
}

function monthsBetween(a?: string, b?: string): number | null {
  if (!a || !b) return null;
  const d1 = new Date(a), d2 = new Date(b);
  if (isNaN(+d1) || isNaN(+d2)) return null;
  return (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
}

export async function POST(request: Request) {
  try {
    const f = await request.json();
    const pdf = new Doc();
    await pdf.init();

    const today = new Date().toISOString().slice(0, 10);
    const bestamd = f.contractType === "bestämd_tid";

    // Title
    pdf.text("HYRESAVTAL", { size: 22, font: pdf.bold, gap: 26 });
    pdf.text("Bostadslägenhet", { size: 12, font: pdf.bold, gap: 16 });
    pdf.gap(6);
    pdf.text(byId("12_KAP_1_PAR_1_ST")?.klausul_text ?? "");
    pdf.gap(10);

    // 1. Parter
    pdf.heading("1. Parter");
    pdf.kv("Hyresvärd", san(f.landlordName));
    if (f.landlordOrgNr) pdf.kv("Person-/org.nr", san(f.landlordOrgNr));
    pdf.kv("Adress", san(f.landlordAddress));
    pdf.gap(6);
    pdf.kv("Hyresgäst", san(f.tenantName));
    if (f.tenantPersonNr) pdf.kv("Personnummer", san(f.tenantPersonNr));
    pdf.kv("Adress", san(f.tenantAddress));

    // 2. Hyresobjekt
    pdf.heading("2. Hyresobjekt");
    pdf.kv("Adress", san(f.propertyAddress));
    if (f.roomsAndArea) pdf.kv("Omfattning", san(f.roomsAndArea));
    if (f.propertyDescription) pdf.kv("Beskrivning", san(f.propertyDescription));
    pdf.gap(2);
    pdf.text(byId("12_KAP_1_PAR_4_ST")?.klausul_text ?? "");

    // 3. Hyrestid och uppsägning
    pdf.heading("3. Hyrestid och uppsägning");
    pdf.kv("Tillträdesdag", san(f.startDate));
    if (bestamd) {
      pdf.kv("Avtalet upphör", san(f.endDate));
      const m = monthsBetween(f.startDate, f.endDate);
      // > 9 mån i följd kräver alltid uppsägning (JB 12:3)
      if (m !== null && m > 9) {
        pdf.text(byId("12_KAP_3_PAR_1_ST_2")?.klausul_text ?? "");
      } else {
        pdf.text(byId("12_KAP_3_PAR_1_ST_1")?.klausul_text ?? "");
      }
    } else {
      pdf.text(byId("12_KAP_4_PAR_1_ST")?.klausul_text ?? "");
    }

    // 4. Hyra och betalning
    pdf.heading("4. Hyra och betalning");
    const rent = Number(f.rentAmount || 0).toLocaleString("sv-SE");
    pdf.kv("Månadshyra", `${rent} kr`);
    pdf.kv("Betalas senast", san(f.rentPaymentDate) || "sista vardagen före varje kalendermånad");
    pdf.text(
      f.inkluderarVarme === "nej"
        ? "Kostnad för värme, varmvatten och hushållsel ingår inte i hyran utan betalas separat av hyresgästen."
        : "Kostnad för värme och vatten ingår i hyran."
    );

    // 5. Deposition (villkorlig)
    if (f.deposit && Number(f.deposit) > 0) {
      pdf.heading("5. Deposition");
      pdf.text(
        `Hyresgästen erlägger en deposition om ${Number(f.deposit).toLocaleString("sv-SE")} kr. ` +
          "Depositionen återbetalas inom en månad efter hyrestidens slut, efter avdrag för ev. skador utöver normalt slitage eller obetald hyra."
      );
    }

    // 6. Hyresgästens vårdplikt
    pdf.heading("6. Hyresgästens vårdplikt");
    pdf.text(byId("12_KAP_24_PAR_1_ST_VARDPLIKT")?.klausul_text ?? "");

    // 7. Ändringar och avtalsform
    pdf.heading("7. Ändringar och tillägg");
    pdf.text(byId("12_KAP_2_PAR_1_ST")?.klausul_text ?? "");

    // 8. Tvingande lagregler
    pdf.heading("8. Tvingande lagregler");
    pdf.text(byId("12_KAP_1_PAR_6_ST")?.klausul_text ?? "");

    // 9. Friskrivning (i själva dokumentet)
    pdf.heading("9. Friskrivning");
    pdf.text(
      "Detta avtal har genererats automatiskt av tjänsten Hyresavtal.nu utifrån de uppgifter " +
        "parterna lämnat och bygger på 12 kap. jordabalken (hyreslagen). Dokumentet är ett utkast " +
        "och utgör inte juridisk rådgivning. Tjänsten är inte part i avtalet och ansvarar inte för " +
        "dokumentets innehåll, för att enskilda villkor är giltiga eller lämpliga, eller för att " +
        "parterna fullgör sina skyldigheter. Parterna ansvarar själva för att avtalet följer " +
        "gällande lag och för att dess villkor efterlevs. Tvingande bestämmelser i hyreslagen " +
        "gäller alltid, oavsett vad som anges ovan."
    );

    // Signaturer
    pdf.gap(20);
    pdf.heading("Underskrifter");
    pdf.kv("Ort och datum", today);
    pdf.gap(28);
    const colW = (pdf.width - MARGIN * 2 - 30) / 2;
    pdf.ensure(40);
    const sy = pdf.y;
    pdf.page.drawLine({ start: { x: MARGIN, y: sy }, end: { x: MARGIN + colW, y: sy }, thickness: 0.7, color: rgb(0.3, 0.3, 0.3) });
    pdf.page.drawLine({ start: { x: MARGIN + colW + 30, y: sy }, end: { x: MARGIN + colW * 2 + 30, y: sy }, thickness: 0.7, color: rgb(0.3, 0.3, 0.3) });
    pdf.y -= 14;
    pdf.page.drawText(san(`Hyresvärd: ${f.landlordName || ""}`), { x: MARGIN, y: pdf.y, size: 9, font: pdf.font });
    pdf.page.drawText(san(`Hyresgäst: ${f.tenantName || ""}`), { x: MARGIN + colW + 30, y: pdf.y, size: 9, font: pdf.font });

    // Footer disclaimer on last page
    pdf.gap(30);
    pdf.text(
      "Detta avtal är ett standardavtal grundat i 12 kap. Jordabalken (Hyreslagen) och utgör inte individuell juridisk rådgivning.",
      { size: 8, gap: 11 }
    );

    const bytes = await pdf.doc.save();
    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="hyresavtal.pdf"',
      },
    });
  } catch (err) {
    console.error("generate-agreement error:", err);
    return NextResponse.json({ error: "Kunde inte skapa avtalet." }, { status: 500 });
  }
}
