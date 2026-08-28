/**
 * Klausulmotorn — kravspecifikation v1 §8.
 *
 * Avtalet byggs som en lista av klausuler, inte som en mall med hål i.
 * Varje klausul har ett villkor, en ordning, ett lagrum och granskningsstatus.
 * Ingen klausultext är ännu granskad av jurist — se §12 och review.ts.
 */

import type { AnswerSet, CostItem, CostMode } from "../types";
import { totalRent } from "../types";
import {
  formatAddress,
  formatAmount,
  formatDate,
  formatMoney,
  tenantNames,
} from "../format";
import { describeNotice, type LegalContext } from "./regime";

export interface ClauseReview {
  reviewedBy?: string;
  reviewedAt?: string;
  reviewVersion?: string;
}

export interface ClauseDef {
  id: string;
  heading: string;
  /** Brödtext med {{platshållare}}. Radbrytning ger nytt stycke. */
  body: string;
  legalBasis?: string;
  condition: (a: AnswerSet, ctx: LegalContext) => boolean;
  order: number;
  review: ClauseReview;
}

export interface RenderedClause {
  id: string;
  number: number;
  heading: string;
  paragraphs: string[];
  legalBasis?: string;
}

const always = () => true;

/* ------------------------------------------------------------ etiketter */

const FURNISHED_LABEL: Record<string, string> = {
  none: "omöblerad",
  partial: "delvis möblerad",
  full: "fullt möblerad",
};

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  bankgiro: "bankgiro",
  plusgiro: "plusgiro",
  bank_account: "bankkonto",
  swish: "Swish",
};

const COST_LABEL: Record<string, string> = {
  costHeating: "Värme",
  costWater: "Vatten och varmvatten",
  costElectricity: "Hushållsel",
  costBroadband: "Bredband",
  costTv: "TV",
  costLaundry: "Tvättstuga",
  costWaste: "Sophämtning",
};

const COST_MODE_LABEL: Record<CostMode, string> = {
  included: "ingår i hyran",
  separate_actual: "betalas separat efter faktisk kostnad",
  separate_fixed: "betalas separat med fast belopp",
  tenant_own_contract: "hyresgästen tecknar eget abonnemang i eget namn",
};

const DEDUCTION_LABEL: Record<string, string> = {
  unpaid_rent: "obetald hyra",
  damage_beyond_wear: "skador utöver normalt slitage",
  cleaning: "kostnad för städning",
  missing_keys: "saknade nycklar",
};

const PETS_LABEL: Record<string, string> = {
  yes: "Husdjur är tillåtna.",
  no: "Husdjur får inte hållas i lägenheten.",
  by_agreement: "Husdjur får hållas i lägenheten endast efter hyresvärdens medgivande.",
};

/* -------------------------------------------------------- platshållare */

function describeCost(key: string, item: CostItem): string {
  const label = COST_LABEL[key] ?? key;
  const mode = COST_MODE_LABEL[item.mode];
  if (item.mode === "separate_fixed") {
    return `${label}: ${mode} om ${formatMoney(item.amount ?? null)} per månad.`;
  }
  return `${label}: ${mode}.`;
}

function paymentDueText(a: AnswerSet): string {
  switch (a.paymentDueRule) {
    case "first_of_month":
      return "den första dagen i varje kalendermånad";
    case "custom":
      return a.paymentDueCustom || "enligt överenskommelse";
    default:
      return "senast sista vardagen i månaden före den kalendermånad hyran avser";
  }
}

function renewalText(a: AnswerSet): string {
  switch (a.fixedTermRenewal) {
    case "auto_renew_same":
      return "Om avtalet inte sägs upp förlängs det med en tid som motsvarar den ursprungliga hyrestiden.";
    case "auto_renew_indefinite":
      return "Om avtalet inte sägs upp övergår det till att gälla tills vidare, varvid uppsägningstiderna för avtal som löper tills vidare börjar gälla.";
    default:
      return "Avtalet förlängs inte automatiskt.";
  }
}

function objectExtras(a: AnswerSet): string {
  const extras: string[] = [];
  if (a.hasBalcony) extras.push("balkong");
  if (a.hasStorage) extras.push("förråd");
  if (a.hasParking) extras.push(a.parkingDetails ? `parkering (${a.parkingDetails})` : "parkering");
  return extras.length ? extras.join(", ") : "inga särskilda utrymmen";
}

function maintenanceText(a: AnswerSet): string {
  return a.maintenanceResponsibility === "landlord_all"
    ? "Hyresvärden svarar för allt underhåll av lägenheten."
    : "Hyresvärden svarar för lägenhetens skick och för reparationer som beror på ålder och normalt slitage. Hyresgästen svarar för löpande skötsel och för skador som hyresgästen, någon i hyresgästens hushåll eller besökare orsakat.";
}

function bullets(lines: string[]): string {
  return lines.length ? lines.map((l) => `- ${l}`).join("\n") : "—";
}

export function templateValues(a: AnswerSet, ctx: LegalContext): Record<string, string> {
  const tenantLines = a.tenants
    .filter((t) => t.name || t.idNumber)
    .map((t) =>
      `${t.name || "—"}, ${t.idNumber || "—"}, ${formatAddress(t.currentAddress)}` +
      `${t.email ? `, ${t.email}` : ""}${t.phone ? `, ${t.phone}` : ""}`
    );

  const costLines = (
    ["costHeating", "costWater", "costElectricity", "costBroadband", "costTv", "costLaundry", "costWaste"] as const
  ).map((key) => describeCost(key, a[key]));
  a.costOther.forEach((item) => {
    costLines.push(
      item.mode === "separate_fixed"
        ? `${item.label}: ${COST_MODE_LABEL[item.mode]} om ${formatMoney(item.amount ?? null)} per månad.`
        : `${item.label}: ${COST_MODE_LABEL[item.mode]}.`
    );
  });

  const ownContract = costLines.length
    ? (["costElectricity", "costBroadband", "costTv"] as const).some((k) => a[k].mode === "tenant_own_contract")
    : false;

  return {
    landlordName: a.landlordName || "—",
    landlordIdNumber: a.landlordIdNumber || "—",
    landlordAddress: formatAddress(a.landlordAddress),
    landlordEmail: a.landlordEmail || "—",
    landlordPhone: a.landlordPhone || "—",
    tenantList: bullets(tenantLines),
    tenantNames: tenantNames(a),
    tenantCount: String(a.tenants.length),

    objectAddress: formatAddress(a.objectAddress),
    apartmentNumber: a.apartmentNumber || "—",
    propertyDesignation: a.propertyDesignation || "—",
    rooms: a.rooms !== null ? String(a.rooms) : "—",
    areaSqm: a.areaSqm !== null ? formatAmount(a.areaSqm) : "—",
    floor: a.floor || "—",
    objectExtras: objectExtras(a),
    furnishedLabel: FURNISHED_LABEL[a.furnished] ?? "—",
    sharedAreas: a.sharedAreas || "—",
    objectDescription: a.objectDescription || "—",

    regimeName: ctx.regimeName,
    regimeShortName: ctx.regimeShortName,
    regimeLegalBasis: ctx.regimeLegalBasis,
    regimeExplanation: ctx.regimeExplanation,

    baseRent: formatMoney(a.baseRent),
    furnishingSurcharge: formatMoney(a.furnishingSurcharge),
    parkingFee: formatMoney(a.parkingFee),
    totalRent: formatMoney(totalRent(a)),
    paymentDue: paymentDueText(a),
    paymentMethod: PAYMENT_METHOD_LABEL[a.paymentMethod] ?? "—",
    paymentReference: a.paymentReference || "—",
    rentPrinciple: ctx.rentRule.principle,
    rentAdjustmentIndex: a.rentAdjustmentIndex || "—",
    costTable: bullets(costLines),
    ownContractNote: ownContract
      ? "Hyresgästen ska teckna abonnemang i eget namn för de poster som anges ovan och svarar själv för dessa kostnader."
      : "",

    noticeLandlord: describeNotice(ctx.noticePeriods.landlord),
    noticeTenant: describeNotice(ctx.noticePeriods.tenant),
    noticeLegalBasis: ctx.noticePeriods.landlord.legalBasis,
    startDate: formatDate(a.startDate),
    endDate: formatDate(a.endDate),
    durationMonths: ctx.durationMonths !== null ? String(ctx.durationMonths) : "—",
    renewalText: renewalText(a),

    tenureReason: ctx.securityOfTenure.reason,
    tenureLegalBasis: ctx.securityOfTenure.legalBasis,
    tenureMonths:
      ctx.securityOfTenure.status === "arises_after" ? String(ctx.securityOfTenure.months) : "—",

    depositAmount: formatMoney(a.depositAmount),
    depositReturnDays: a.depositReturnDays !== null ? String(a.depositReturnDays) : "—",
    depositDeductions:
      a.depositDeductions.map((d) => DEDUCTION_LABEL[d] ?? d).join(", ") || "—",
    prepaidRentMonths: a.prepaidRentMonths !== null ? String(a.prepaidRentMonths) : "—",

    inventoryList: bullets(
      a.inventoryItems.map((i) => `${i.item} (${i.quantity} st) – skick: ${i.condition || "ej angivet"}`)
    ),
    keysList: bullets(a.keys.map((k) => `${k.type}: ${k.quantity} st`)),
    keyReplacementCost: formatMoney(a.keyReplacementCost),
    existingDamage: a.existingDamage || "Inga kända brister har antecknats.",

    maxOccupants: a.maxOccupants !== null ? String(a.maxOccupants) : "—",
    smokingText: a.smokingAllowed
      ? "Rökning är tillåten i lägenheten."
      : "Rökning är inte tillåten i lägenheten.",
    petsText: PETS_LABEL[a.petsAllowed] ?? "—",
    quietHours: a.quietHours || "—",
    accessNotice: a.landlordAccessNotice !== null ? String(a.landlordAccessNotice) : "—",
    maintenanceText: maintenanceText(a),
    houseRulesText: a.houseRulesAttached
      ? "Föreningens eller fastighetsägarens ordningsregler bifogas avtalet och utgör en del av det."
      : "",

    consentBoard:
      a.boardConsentObtained === "yes"
        ? `Bostadsrättsföreningens styrelse har lämnat samtycke till upplåtelsen${a.boardConsentDate ? ` den ${formatDate(a.boardConsentDate)}` : ""}${a.boardConsentRef ? ` (${a.boardConsentRef})` : ""}.`
        : a.boardConsentObtained === "applied"
        ? "Ansökan om styrelsens samtycke till upplåtelsen är inlämnad men ännu inte beviljad."
        : "",
    consentLandlord:
      a.landlordConsentObtained === "yes"
        ? "Hyresvärden har lämnat tillstånd till andrahandsupplåtelsen."
        : a.landlordConsentObtained === "applied"
        ? "Ansökan om hyresvärdens tillstånd till andrahandsupplåtelsen är inlämnad men ännu inte beviljad."
        : "",
    rentTribunalPermit: a.rentTribunalPermit || "—",

    signingPlace: a.signingPlace || "—",
    signingDate: formatDate(a.signingDate),
    copies: a.copies !== null ? String(a.copies) : String(a.tenants.length + 1),
  };
}

/* ---------------------------------------------------------- 8.2 registret */

export const CLAUSES: ClauseDef[] = [
  {
    id: "C-PARTIES",
    heading: "Parter",
    order: 10,
    condition: always,
    review: {},
    body:
      "Hyresvärd: {{landlordName}}, {{landlordIdNumber}}, {{landlordAddress}}. E-post {{landlordEmail}}, telefon {{landlordPhone}}.\n" +
      "Hyresgäst:\n{{tenantList}}\n" +
      "Parterna har träffat detta hyresavtal om upplåtelse av bostadslägenhet.",
  },
  {
    id: "C-JOINT-LIABILITY",
    heading: "Solidariskt betalningsansvar",
    order: 20,
    condition: (a) => a.tenants.length > 1,
    review: {},
    body:
      "Hyresgästerna svarar solidariskt för samtliga förpliktelser enligt detta avtal. " +
      "Hyresvärden har rätt att kräva hela hyran och övriga belopp av vilken som helst av hyresgästerna. " +
      "En uppsägning från en av hyresgästerna gäller endast den hyresgästen om parterna inte kommer överens om annat.",
  },
  {
    id: "C-OBJECT",
    heading: "Hyresobjektet",
    order: 30,
    condition: always,
    review: {},
    body:
      "Upplåtelsen avser bostadslägenheten på adressen {{objectAddress}}, lägenhetsnummer {{apartmentNumber}}, fastighetsbeteckning {{propertyDesignation}}.\n" +
      "Lägenheten omfattar {{rooms}} rum om {{areaSqm}} kvm, våningsplan {{floor}}. I upplåtelsen ingår {{objectExtras}}.\n" +
      "Lägenheten upplåts {{furnishedLabel}}.\n" +
      "{{objectDescription}}",
  },
  {
    id: "C-SHARED-AREAS",
    heading: "Gemensamma utrymmen",
    order: 35,
    condition: (a) => a.propertyType === "room_in_own_home",
    review: {},
    body:
      "Upplåtelsen avser en del av upplåtarens egen bostad. Följande utrymmen nyttjas gemensamt: {{sharedAreas}}.",
  },
  {
    id: "C-FURNISHING",
    heading: "Möblering och inventarier",
    order: 40,
    condition: (a) => a.furnished !== "none" && a.furnished !== "",
    review: {},
    body:
      "Lägenheten upplåts {{furnishedLabel}}. Den möblering och de inventarier som ingår framgår av bifogad inventarielista, som utgör en del av detta avtal.\n" +
      "Hyresgästen ska vårda inventarierna och återlämna dem vid hyrestidens slut i samma skick som vid tillträdet, med undantag för normalt slitage.",
  },
  {
    id: "C-LEGAL-REGIME",
    heading: "Tillämplig lag",
    order: 50,
    condition: always,
    legalBasis: "1 § lagen (2012:978) om uthyrning av egen bostad samt 12 kap. jordabalken",
    review: {},
    body:
      "På detta avtal tillämpas {{regimeName}}. {{regimeExplanation}}\n" +
      "Avtalsvillkor som är mindre förmånliga för hyresgästen än vad som följer av tvingande bestämmelser i tillämplig lag är utan verkan.",
  },
  {
    id: "C-CONSENT-PENDING",
    heading: "Villkorat av samtycke",
    order: 55,
    condition: (a) =>
      (a.landlordTitle === "condominium" && a.boardConsentObtained !== "yes") ||
      ((a.landlordTitle === "first_hand_lease" || a.landlordTitle === "second_hand") &&
        a.landlordConsentObtained !== "yes"),
    review: {},
    body:
      "Upplåtelsen förutsätter samtycke från bostadsrättsföreningens styrelse respektive tillstånd från hyresvärden eller hyresnämnden. Sådant samtycke eller tillstånd är ännu inte lämnat.\n" +
      "Avtalet gäller under förutsättning att samtycke eller tillstånd lämnas. Om samtycke eller tillstånd inte lämnas har vardera parten rätt att frånträda avtalet med omedelbar verkan, varvid erlagd hyra för tid efter frånträdandet återbetalas.\n" +
      "Hänvisning till hyresnämndens beslut, i förekommande fall: {{rentTribunalPermit}}.",
  },
  {
    id: "C-CONSENT-GIVEN",
    heading: "Samtycke och tillstånd",
    order: 56,
    condition: (a) => a.boardConsentObtained === "yes" || a.landlordConsentObtained === "yes",
    review: {},
    body: "{{consentBoard}}\n{{consentLandlord}}",
  },
  {
    id: "C-TERM-INDEFINITE",
    heading: "Hyrestid",
    order: 60,
    condition: (a) => a.contractType === "indefinite",
    review: {},
    body:
      "Avtalet gäller från och med {{startDate}} och löper tills vidare. Avtalet upphör att gälla efter uppsägning enligt vad som anges nedan.",
  },
  {
    id: "C-TERM-FIXED",
    heading: "Hyrestid",
    order: 60,
    condition: (a) => a.contractType === "fixed",
    review: {},
    body:
      "Avtalet gäller för bestämd tid från och med {{startDate}} till och med {{endDate}}, vilket motsvarar {{durationMonths}} månader.\n" +
      "{{renewalText}}",
  },
  {
    id: "C-TERM-FIXED-9M",
    heading: "Uppsägning krävs vid hyrestid över nio månader",
    order: 65,
    legalBasis: "12 kap. 3 § jordabalken",
    condition: (_a, ctx) => ctx.requiresNoticeToEnd,
    review: {},
    body:
      "Eftersom hyresförhållandet avses vara längre än nio månader i följd upphör avtalet inte automatiskt vid hyrestidens utgång. Avtalet måste sägas upp för att upphöra att gälla.",
  },
  {
    id: "C-NOTICE",
    heading: "Uppsägning",
    order: 70,
    condition: always,
    review: {},
    body:
      "Hyresvärden kan säga upp avtalet {{noticeLandlord}}.\n" +
      "Hyresgästen kan säga upp avtalet {{noticeTenant}}.\n" +
      "Uppsägningstiderna följer {{noticeLegalBasis}}.",
  },
  {
    id: "C-NOTICE-TENANT-STATUTORY",
    heading: "Hyresgästens uppsägningsrätt",
    order: 72,
    legalBasis: "12 kap. 5 § jordabalken",
    condition: (_a, ctx) => ctx.noticePeriods.tenantStatutoryThreeMonths,
    review: {},
    body:
      "Hyresgästen har alltid rätt att säga upp avtalet till det månadsskifte som inträffar tidigast tre månader från uppsägningen, även om avtalet löper på bestämd tid. Denna rätt kan inte avtalas bort.",
  },
  {
    id: "C-NOTICE-FORM",
    heading: "Uppsägningens form och delgivning",
    order: 74,
    legalBasis: "12 kap. 8 § jordabalken",
    condition: always,
    review: {},
    body:
      "En uppsägning ska vara skriftlig. Uppsägningen ska delges motparten. Skriftlig uppsägning som sänds i rekommenderat brev till motpartens senast kända adress anses ha skett när brevet lämnades in för postbefordran.\n" +
      "Parterna ska underrätta varandra om ändrade kontaktuppgifter.",
  },
  {
    id: "C-TENURE-NONE",
    heading: "Besittningsskydd föreligger inte",
    order: 80,
    condition: (_a, ctx) => ctx.securityOfTenure.status === "none",
    review: {},
    body:
      "{{tenureReason}} Hyresgästen har därmed inte rätt till förlängning av avtalet när det upphör efter uppsägning. Detta följer av {{tenureLegalBasis}}.",
  },
  {
    id: "C-TENURE-INFO",
    heading: "Besittningsskydd",
    order: 80,
    condition: (_a, ctx) => ctx.securityOfTenure.status !== "none",
    review: {},
    body:
      "{{tenureReason}} Detta följer av {{tenureLegalBasis}}.\n" +
      "En överenskommelse om att hyresgästen avstår från besittningsskydd ska träffas i en särskilt upprättad handling och kräver som huvudregel hyresnämndens godkännande. Någon sådan överenskommelse ingår inte i detta avtal.",
  },
  {
    id: "C-RENT-PRIVATE",
    heading: "Hyra",
    order: 90,
    legalBasis: "4 § lagen (2012:978) om uthyrning av egen bostad",
    condition: (_a, ctx) => ctx.rentRule.clauseId === "C-RENT-PRIVATE",
    review: {},
    body:
      "Hyran uppgår till {{totalRent}} per månad, varav grundhyra {{baseRent}}.\n" +
      "{{rentPrinciple}}",
  },
  {
    id: "C-RENT-JB",
    heading: "Hyra",
    order: 90,
    legalBasis: "12 kap. 55 § jordabalken",
    condition: (_a, ctx) => ctx.rentRule.clauseId === "C-RENT-JB",
    review: {},
    body:
      "Hyran uppgår till {{totalRent}} per månad, varav grundhyra {{baseRent}}.\n" +
      "{{rentPrinciple}}",
  },
  {
    id: "C-RENT-ADJUST",
    heading: "Hyresjustering",
    order: 95,
    condition: (a) => a.rentAdjustment !== "none" && a.rentAdjustment !== "",
    review: {},
    body:
      "Hyran kan ändras under hyrestiden. Ändring sker genom förhandling mellan parterna, eller om parterna avtalat om index, med utgångspunkt i {{rentAdjustmentIndex}}.\n" +
      "En höjning gäller tidigast från och med den månad som infaller närmast efter det att hyresgästen underrättats skriftligen. Tvingande bestämmelser om hyressättning gäller framför detta villkor.",
  },
  {
    id: "C-PAYMENT",
    heading: "Betalning",
    order: 100,
    condition: always,
    review: {},
    body:
      "Hyran betalas i förskott {{paymentDue}} till {{paymentMethod}} {{paymentReference}}.\n" +
      "Betalningen ska vara hyresvärden tillhanda senast på förfallodagen.",
  },
  {
    id: "C-LATE-INTEREST",
    heading: "Dröjsmålsränta",
    order: 105,
    legalBasis: "6 § räntelagen (1975:635)",
    condition: (a) => a.lateInterest === "statutory",
    review: {},
    body:
      "Vid försenad betalning utgår dröjsmålsränta enligt räntelagen, med referensräntan plus åtta procentenheter, från förfallodagen till dess betalning sker.",
  },
  {
    id: "C-COSTS",
    heading: "Driftskostnader",
    order: 110,
    condition: always,
    review: {},
    body: "Följande gäller för driftskostnader:\n{{costTable}}\n{{ownContractNote}}",
  },
  {
    id: "C-DEPOSIT",
    heading: "Deposition",
    order: 120,
    condition: (a) => (a.depositAmount ?? 0) > 0,
    review: {},
    body:
      "Hyresgästen betalar en deposition om {{depositAmount}} senast på tillträdesdagen. Depositionen är en säkerhet för hyresgästens förpliktelser enligt avtalet och utgör inte förskottsbetald hyra.\n" +
      "Depositionen återbetalas inom {{depositReturnDays}} dagar från det att lägenheten återlämnats och besiktigats, efter avdrag för: {{depositDeductions}}.\n" +
      "Hyresvärden ska skriftligen redovisa varje avdrag.",
  },
  {
    id: "C-INSPECTION",
    heading: "Besiktning",
    order: 130,
    condition: (a) => a.inspectionOnMoveIn || a.inspectionOnMoveOut,
    review: {},
    body:
      "Lägenheten besiktigas gemensamt av parterna vid tillträdet och vid avflyttningen. Resultatet antecknas i ett besiktningsprotokoll som undertecknas av båda parter och bifogas detta avtal.\n" +
      "Kända brister vid tillträdet: {{existingDamage}}",
  },
  {
    id: "C-KEYS",
    heading: "Nycklar",
    order: 140,
    condition: always,
    review: {},
    body:
      "Följande nycklar överlämnas till hyresgästen vid tillträdet:\n{{keysList}}\n" +
      "Samtliga nycklar ska återlämnas senast vid hyrestidens slut. Vid förlorad nyckel svarar hyresgästen för kostnaden för ersättningsnyckel och, om låsbyte krävs, för denna kostnad, dock högst {{keyReplacementCost}} om belopp angetts.\n" +
      "Hyresgästen får inte låta tillverka extra nycklar utan hyresvärdens medgivande.",
  },
  {
    id: "C-MAINTENANCE",
    heading: "Underhåll och skötsel",
    order: 150,
    legalBasis: "12 kap. 24 § jordabalken",
    condition: always,
    review: {},
    body:
      "{{maintenanceText}}\n" +
      "Hyresgästen ska väl vårda lägenheten med vad därtill hör och är skyldig att ersätta skada som uppkommit genom hyresgästens vållande eller vårdslöshet.\n" +
      "Hyresgästen ska utan dröjsmål underrätta hyresvärden om skador och brister som måste åtgärdas för att allvarlig olägenhet inte ska uppstå.",
  },
  {
    id: "C-ACCESS",
    heading: "Hyresvärdens tillträde",
    order: 160,
    legalBasis: "12 kap. 26 § jordabalken",
    condition: always,
    review: {},
    body:
      "Hyresvärden har rätt att utan uppskov få tillträde till lägenheten för att utföra brådskande arbete som inte kan skjutas upp.\n" +
      "För annat tillträde, exempelvis besiktning eller visning, ska hyresvärden komma överens med hyresgästen om tidpunkt och underrätta hyresgästen minst {{accessNotice}} dagar i förväg.",
  },
  {
    id: "C-RULES",
    heading: "Ordningsregler",
    order: 170,
    condition: always,
    review: {},
    body:
      "Lägenheten får bebos av högst {{maxOccupants}} personer.\n" +
      "{{smokingText}} {{petsText}}\n" +
      "Hyresgästen ska iaktta tystnad mellan {{quietHours}} och i övrigt se till att de som bor i omgivningen inte utsätts för störningar.\n" +
      "{{houseRulesText}}",
  },
  {
    id: "C-INSURANCE",
    heading: "Försäkring",
    order: 180,
    condition: (a) => a.tenantInsuranceRequired === true,
    review: {},
    body:
      "Hyresgästen ska under hela hyrestiden inneha gällande hemförsäkring och ska på begäran visa upp bevis om detta.",
  },
  {
    id: "C-SUBLET-BAN",
    heading: "Förbud mot vidareuthyrning",
    order: 190,
    legalBasis: "12 kap. 39 § jordabalken",
    condition: (a) => a.sublettingAllowed === false,
    review: {},
    body:
      "Hyresgästen får inte upplåta lägenheten eller del av den i andra hand utan hyresvärdens skriftliga samtycke. Detta gäller även korttidsuthyrning genom förmedlingstjänster.",
  },
  {
    id: "C-FORFEITURE",
    heading: "Förverkande",
    order: 200,
    legalBasis: "12 kap. 42 § jordabalken",
    condition: always,
    review: {},
    body:
      "Hyresrätten är förverkad och hyresvärden har rätt att säga upp avtalet i förtid bland annat om hyresgästen dröjer med att betala hyran mer än en vecka efter förfallodagen, utan behövligt samtycke upplåter lägenheten i andra hand, vanvårdar lägenheten eller utsätter omgivningen för störningar.\n" +
      "Hyresgästen har i vissa fall rätt att återvinna hyresrätten enligt 12 kap. 43-44 §§ jordabalken.",
  },
  {
    id: "C-DISPUTE",
    heading: "Tvist",
    order: 210,
    condition: always,
    review: {},
    body:
      "Tvist med anledning av detta avtal prövas av hyresnämnden i den mån frågan hör till nämndens behörighet, och i övrigt av allmän domstol.",
  },
  {
    id: "C-SIGNATURES",
    heading: "Underskrifter",
    order: 900,
    condition: always,
    review: {},
    body:
      "Detta avtal har upprättats i {{copies}} likalydande exemplar, varav parterna tagit var sitt.\n" +
      "Ändringar och tillägg till avtalet ska vara skriftliga för att gälla.\n" +
      "Ort och datum: {{signingPlace}}, {{signingDate}}",
  },
];

/* ------------------------------------------------------------ rendering */

const PLACEHOLDER = /\{\{(\w+)\}\}/g;

export function interpolate(body: string, values: Record<string, string>): string {
  return body.replace(PLACEHOLDER, (_m, key: string) => values[key] ?? "");
}

export function buildClauses(a: AnswerSet, ctx: LegalContext): RenderedClause[] {
  const values = templateValues(a, ctx);
  return CLAUSES.filter((c) => c.condition(a, ctx))
    .slice()
    .sort((x, y) => x.order - y.order || x.id.localeCompare(y.id))
    .map((c, i) => ({
      id: c.id,
      number: i + 1,
      heading: c.heading,
      legalBasis: c.legalBasis,
      paragraphs: interpolate(c.body, values)
        .split("\n")
        .map((p) => p.trim())
        .filter(Boolean),
    }));
}
