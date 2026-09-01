/**
 * Validering — kravspecifikation v1 §6.
 *
 * Ren modul utan React-beroenden. Formuläret validerar på blur för enskilt fält
 * och vid stegövergång för hela steget; samma regler används av båda.
 */

import type { AnswerSet } from "./types";
import { MAX_TENANTS, totalRent } from "./types";
import { parseDate } from "./legal/regime";
import { isStepVisible, type StepId } from "./steps";

export type Errors = Record<string, string>;

/* ------------------------------------------------------ person- och org.nr */

export type IdNumberKind = "person" | "coordination" | "org";

export type IdNumberResult =
  | { ok: true; kind: IdNumberKind; normalized: string }
  | { ok: false; error: string };

function luhn(digits: string): boolean {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let n = Number(digits[i]);
    // Vikt 2 på varannan siffra från vänster i en tiosiffrig sträng.
    if (i % 2 === 0) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
  }
  return sum % 10 === 0;
}

function isValidDatePart(year: number, month: number, day: number): boolean {
  if (month < 1 || month > 12) return false;
  const d = new Date(Date.UTC(year, month - 1, day));
  return (
    d.getUTCFullYear() === year && d.getUTCMonth() === month - 1 && d.getUTCDate() === day
  );
}

/**
 * Accepterar YYYYMMDD-NNNN, YYMMDD-NNNN och NNNNNN-NNNN, med eller utan
 * skiljetecken. Normaliserar till tolv siffror utan bindestreck.
 * Samordningsnummer har dag + 60. Organisationsnummer känns igen på att
 * tredje siffran (månadspositionen) är minst 2, och normaliseras med prefix 16.
 */
export function validateIdNumber(raw: string): IdNumberResult {
  const cleaned = raw.replace(/[\s\-+]/g, "");
  if (!/^\d{10}$|^\d{12}$/.test(cleaned)) {
    return { ok: false, error: "Ange tio eller tolv siffror, t.ex. 19850101-0017." };
  }

  const long = cleaned.length === 12;
  const significant = long ? cleaned.slice(2) : cleaned;
  const prefix = long ? cleaned.slice(0, 2) : "";

  if (!luhn(significant)) {
    return { ok: false, error: "Kontrollsiffran stämmer inte. Kontrollera numret." };
  }

  const isOrg = Number(significant[2]) >= 2;

  if (isOrg) {
    if (long && prefix !== "16") {
      return { ok: false, error: "Organisationsnummer skrivs med prefixet 16." };
    }
    return { ok: true, kind: "org", normalized: "16" + significant };
  }

  const yy = Number(significant.slice(0, 2));
  const month = Number(significant.slice(2, 4));
  const rawDay = Number(significant.slice(4, 6));
  const isCoordination = rawDay > 60;
  const day = isCoordination ? rawDay - 60 : rawDay;

  let century: number;
  if (long) {
    century = Number(prefix);
    if (century !== 19 && century !== 20 && century !== 18) {
      return { ok: false, error: "Kontrollera århundradet i personnumret." };
    }
  } else {
    // Välj det århundrade som ger en födelsedag som redan inträffat.
    const nowYear = new Date().getUTCFullYear();
    century = 2000 + yy > nowYear ? 19 : 20;
  }

  const year = century * 100 + yy;
  if (!isValidDatePart(year, month, day)) {
    return { ok: false, error: "Datumdelen i numret är inte ett giltigt datum." };
  }

  return {
    ok: true,
    kind: isCoordination ? "coordination" : "person",
    normalized: String(century) + significant,
  };
}

/* ------------------------------------------------------------ övriga fält */

export function validatePostalCode(raw: string): string | null {
  return /^\d{3}\s?\d{2}$/.test(raw.trim())
    ? null
    : "Ange postnummer med fem siffror, t.ex. 111 22.";
}

export function normalizePostalCode(raw: string): string {
  const d = raw.replace(/\D/g, "");
  return d.length === 5 ? `${d.slice(0, 3)} ${d.slice(3)}` : raw.trim();
}

export function validateEmail(raw: string): string | null {
  const v = raw.trim();
  if (!/^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(v)) return "Ange en giltig e-postadress.";
  return null;
}

export function normalizePhone(raw: string): string {
  const cleaned = raw.replace(/[\s()\-.]/g, "");
  if (/^\+\d{6,15}$/.test(cleaned)) return cleaned;
  if (/^00\d{6,15}$/.test(cleaned)) return "+" + cleaned.slice(2);
  if (/^0\d{6,12}$/.test(cleaned)) return "+46" + cleaned.slice(1);
  return raw.trim();
}

export function validatePhone(raw: string): string | null {
  return /^\+\d{7,15}$/.test(normalizePhone(raw))
    ? null
    : "Ange ett giltigt telefonnummer, t.ex. 070-123 45 67.";
}

export const MAX_AMOUNT = 999_999;

export function validateAmount(value: number | null, label = "Beloppet"): string | null {
  if (value === null || Number.isNaN(value)) return `${label} måste anges.`;
  if (!Number.isInteger(value)) return `${label} anges i hela kronor.`;
  if (value < 0) return `${label} kan inte vara negativt.`;
  if (value > MAX_AMOUNT) return `${label} får vara högst ${MAX_AMOUNT} kr.`;
  return null;
}

export function validateDate(raw: string): string | null {
  return parseDate(raw) ? null : "Ange datum som ÅÅÅÅ-MM-DD.";
}

/* ---------------------------------------------------- validering per steg */

function req(value: unknown, message: string): string | null {
  if (value === null || value === undefined || value === "") return message;
  if (Array.isArray(value) && value.length === 0) return message;
  return null;
}

function put(errors: Errors, field: string, message: string | null): void {
  if (message) errors[field] = message;
}

function validateAddress(errors: Errors, prefix: string, a: { street: string; postalCode: string; city: string }): void {
  put(errors, `${prefix}.street`, req(a.street, "Ange gatuadress."));
  put(errors, `${prefix}.postalCode`, a.postalCode ? validatePostalCode(a.postalCode) : "Ange postnummer.");
  put(errors, `${prefix}.city`, req(a.city, "Ange ort."));
}

function validateIdField(errors: Errors, field: string, value: string, allowOrg: boolean): void {
  if (!value) {
    put(errors, field, allowOrg ? "Ange person- eller organisationsnummer." : "Ange personnummer.");
    return;
  }
  const result = validateIdNumber(value);
  if (!result.ok) {
    put(errors, field, result.error);
  } else if (!allowOrg && result.kind === "org") {
    put(errors, field, "Ange ett personnummer, inte ett organisationsnummer.");
  }
}

export function validateStep(step: StepId, a: AnswerSet): Errors {
  const e: Errors = {};

  switch (step) {
    case "basics":
      put(e, "propertyType", req(a.propertyType, "Välj vad du hyr ut."));
      put(e, "landlordTitle", req(a.landlordTitle, "Välj hur du förfogar över bostaden."));
      put(e, "landlordEntity", req(a.landlordEntity, "Välj vem som är hyresvärd."));
      put(e, "purpose", req(a.purpose, "Välj vad bostaden ska användas till."));
      if (
        (a.landlordEntity === "natural_person" || a.landlordEntity === "estate") &&
        (a.landlordTitle === "owner_freehold" || a.landlordTitle === "condominium")
      ) {
        put(
          e,
          "landlordRentsMoreThanTwo",
          a.landlordRentsMoreThanTwo === null ? "Välj ett alternativ." : ""
        );
      }
      break;

    case "consent":
      if (a.landlordTitle === "condominium") {
        put(e, "boardConsentObtained", req(a.boardConsentObtained, "Välj ett alternativ."));
        if (a.boardConsentObtained === "yes") {
          put(e, "boardConsentDate", a.boardConsentDate ? validateDate(a.boardConsentDate) : null);
        }
      }
      if (a.landlordTitle === "first_hand_lease") {
        put(e, "landlordConsentObtained", req(a.landlordConsentObtained, "Välj ett alternativ."));
      }
      break;

    case "parties":
      put(e, "landlordName", req(a.landlordName, "Ange hyresvärdens namn."));
      validateIdField(e, "landlordIdNumber", a.landlordIdNumber, true);
      validateAddress(e, "landlordAddress", a.landlordAddress);
      put(e, "landlordEmail", a.landlordEmail ? validateEmail(a.landlordEmail) : "Ange e-postadress.");
      put(e, "landlordPhone", a.landlordPhone ? validatePhone(a.landlordPhone) : "Ange telefonnummer.");
      if (a.tenants.length < 1) put(e, "tenants", "Minst en hyresgäst krävs.");
      if (a.tenants.length > MAX_TENANTS) put(e, "tenants", `Högst ${MAX_TENANTS} hyresgäster kan anges.`);
      a.tenants.forEach((t, i) => {
        put(e, `tenants.${i}.name`, req(t.name, "Ange hyresgästens namn."));
        validateIdField(e, `tenants.${i}.idNumber`, t.idNumber, false);
        put(e, `tenants.${i}.email`, t.email ? validateEmail(t.email) : "Ange e-postadress.");
        put(e, `tenants.${i}.phone`, t.phone ? validatePhone(t.phone) : "Ange telefonnummer.");
        validateAddress(e, `tenants.${i}.currentAddress`, t.currentAddress);
      });
      break;

    case "object":
      validateAddress(e, "objectAddress", a.objectAddress);
      put(e, "rooms", a.rooms === null ? "Ange antal rum." : a.rooms < 1 || a.rooms > 20 ? "Antal rum ska vara mellan 1 och 20." : null);
      put(e, "areaSqm", a.areaSqm === null ? "Ange yta i kvadratmeter." : a.areaSqm < 5 || a.areaSqm > 1000 ? "Ytan ska vara mellan 5 och 1000 kvm." : null);
      put(e, "furnished", req(a.furnished, "Välj möbleringsgrad."));
      break;

    case "rent":
      put(e, "baseRent", validateAmount(a.baseRent, "Grundhyran"));
      // 1 kap. 1 § privatuthyrningslagen och 12 kap. 1 § jordabalken kräver båda att
      // upplåtelsen sker mot ersättning. Utan hyra är det ett lån av bostad, och
      // ingen av regimerna är tillämplig — men validateAmount godtar 0.
      if (a.baseRent === 0) {
        put(e, "baseRent", "Hyran måste vara högre än noll. Utan ersättning är det inte ett hyresavtal.");
      }
      if (a.furnished !== "none" && a.furnishingSurcharge !== null) {
        put(e, "furnishingSurcharge", validateAmount(a.furnishingSurcharge, "Möbleringstillägget"));
      }
      if (a.hasParking && a.parkingFee !== null) {
        put(e, "parkingFee", validateAmount(a.parkingFee, "Avgiften för parkering"));
      }
      put(e, "paymentDueRule", req(a.paymentDueRule, "Välj förfallodag."));
      if (a.paymentDueRule === "custom") {
        put(e, "paymentDueCustom", req(a.paymentDueCustom, "Beskriv förfallodagen."));
      }
      put(e, "paymentMethod", req(a.paymentMethod, "Välj betalsätt."));
      put(e, "paymentReference", req(a.paymentReference, "Ange konto- eller betalningsnummer."));
      put(e, "lateInterest", req(a.lateInterest, "Välj ett alternativ."));
      put(e, "rentAdjustment", req(a.rentAdjustment, "Välj ett alternativ."));
      if (a.rentAdjustment === "index") {
        put(e, "rentAdjustmentIndex", req(a.rentAdjustmentIndex, "Ange vilket index som ska användas."));
      }
      (["costHeating", "costWater", "costElectricity", "costBroadband", "costTv", "costLaundry", "costWaste"] as const).forEach((key) => {
        const item = a[key];
        if (item.mode === "separate_fixed") {
          put(e, `${key}.amount`, validateAmount(item.amount ?? null, "Beloppet"));
        }
      });
      a.costOther.forEach((item, i) => {
        put(e, `costOther.${i}.label`, req(item.label, "Ange vad kostnaden avser."));
        if (item.mode === "separate_fixed") {
          put(e, `costOther.${i}.amount`, validateAmount(item.amount ?? null, "Beloppet"));
        }
      });
      break;

    case "term":
      put(e, "contractType", req(a.contractType, "Välj avtalstyp."));
      put(e, "startDate", a.startDate ? validateDate(a.startDate) : "Ange tillträdesdag.");
      if (a.contractType === "fixed") {
        put(e, "endDate", a.endDate ? validateDate(a.endDate) : "Ange slutdatum.");
        const start = parseDate(a.startDate);
        const end = parseDate(a.endDate);
        if (start && end && +end <= +start) {
          put(e, "endDate", "Slutdatumet måste ligga efter tillträdesdagen.");
        }
        put(e, "fixedTermRenewal", req(a.fixedTermRenewal, "Välj vad som händer när hyrestiden löper ut."));
      }
      if (a.noticeExtendedLandlord !== null && a.noticeExtendedLandlord < 0) {
        put(e, "noticeExtendedLandlord", "Ange ett positivt antal månader.");
      }
      break;

    case "deposit":
      if (a.depositAmount !== null) {
        put(e, "depositAmount", validateAmount(a.depositAmount, "Depositionen"));
        if (a.depositAmount > 0) {
          put(e, "depositReturnDays", a.depositReturnDays === null || a.depositReturnDays < 0 ? "Ange antal dagar för återbetalning." : null);
          put(e, "depositDeductions", req(a.depositDeductions, "Välj vad depositionen får avräknas mot."));
        }
      }
      if (a.prepaidRentMonths !== null && a.prepaidRentMonths < 0) {
        put(e, "prepaidRentMonths", "Ange ett positivt antal månader.");
      }
      break;

    case "condition":
      if (a.furnished !== "none" && a.furnished !== "" && a.inventoryItems.length === 0) {
        put(e, "inventoryItems", "Lägg till minst en post i inventarielistan för en möblerad bostad.");
      }
      a.inventoryItems.forEach((item, i) => {
        put(e, `inventoryItems.${i}.item`, req(item.item, "Ange vad posten avser."));
      });
      put(e, "keys", req(a.keys, "Ange minst en nyckeltyp."));
      a.keys.forEach((k, i) => {
        put(e, `keys.${i}.type`, req(k.type, "Ange nyckeltyp."));
        put(e, `keys.${i}.quantity`, k.quantity > 0 ? null : "Ange antal.");
      });
      if (a.keyReplacementCost !== null) {
        put(e, "keyReplacementCost", validateAmount(a.keyReplacementCost, "Kostnaden"));
      }
      break;

    case "usage":
      put(e, "maxOccupants", a.maxOccupants === null || a.maxOccupants < 1 ? "Ange högsta antal boende." : null);
      put(e, "smokingAllowed", a.smokingAllowed === null ? "Välj ett alternativ." : null);
      put(e, "petsAllowed", req(a.petsAllowed, "Välj ett alternativ."));
      put(e, "sublettingAllowed", a.sublettingAllowed === null ? "Välj ett alternativ." : null);
      put(e, "tenantInsuranceRequired", a.tenantInsuranceRequired === null ? "Välj ett alternativ." : null);
      put(e, "maintenanceResponsibility", req(a.maintenanceResponsibility, "Välj ett alternativ."));
      put(e, "landlordAccessNotice", a.landlordAccessNotice === null || a.landlordAccessNotice < 0 ? "Ange antal dagars varsel." : null);
      break;

    case "review":
      put(e, "signingPlace", req(a.signingPlace, "Ange ort för undertecknandet."));
      put(e, "signingDate", a.signingDate ? validateDate(a.signingDate) : "Ange datum för undertecknandet.");
      put(e, "copies", a.copies === null || a.copies < 1 ? "Ange antal exemplar." : null);
      put(e, "acknowledgeDraft", a.acknowledgeDraft ? null : "Du behöver godkänna villkoren för att skapa avtalet.");
      break;
  }

  return e;
}

/** Alla synliga steg valideras — används innan PDF genereras (§7, §9). */
export function validateAll(a: AnswerSet): Errors {
  const e: Errors = {};
  (["basics", "consent", "parties", "object", "rent", "term", "deposit", "condition", "usage", "review"] as StepId[])
    .filter((id) => isStepVisible(id, a))
    .forEach((id) => Object.assign(e, validateStep(id, a)));
  return e;
}

/** 5.7 — depositionen uttryckt i månadshyror, för W-DEPOSIT-HIGH. */
export function depositMonthsEquivalent(a: AnswerSet): number | null {
  const rent = totalRent(a);
  if (!a.depositAmount || rent <= 0) return null;
  return a.depositAmount / rent;
}
