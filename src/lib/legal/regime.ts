/**
 * Lagvalsmotorn — kravspecifikation v1 §4.
 *
 * Ren modul: inga sidoeffekter, inga React-beroenden, körbar i Node.
 * Allt annat i tjänsten (klausuler, varningar, PDF) läser resultatet härifrån.
 * Ändras något här ska tests/regime.test.ts (T1-T10) uppdateras först.
 */

import type { AnswerSet } from "../types";

export type LegalRegime = "PRIVATE_2026_772" | "JB12";

export interface NoticePeriod {
  months?: number;
  weeks?: number;
  days?: number;
  /** true = uppsägning sker till månadsskifte, false = rakt antal i förväg */
  toMonthEnd: boolean;
  legalBasis: string;
  /**
   * Satt när parten saknar rätt till ordinarie uppsägning. Under
   * privatuthyrningslagen får hyresvärden inte säga upp ett tidsbestämt avtal i
   * förtid; 6 kap. 1 § andra stycket ger den rätten bara åt hyresgästen.
   */
  unavailable?: { reason: string };
}

export type SecurityOfTenure =
  | { status: "none"; reason: string; legalBasis: string }
  | { status: "arises_after"; months: number; reason: string; legalBasis: string }
  | { status: "full"; reason: string; legalBasis: string };

export type WarningLevel = "blocking" | "high" | "medium" | "info";

export interface LegalWarning {
  id: string;
  level: WarningLevel;
  text: string;
  /** stegnummer i flödet (§7) där varningen visas inline */
  step: number;
}

export interface RentRule {
  clauseId: "C-RENT-PRIVATE" | "C-RENT-JB";
  principle: string;
  legalBasis: string;
}

export interface LegalContext {
  regime: LegalRegime;
  regimeName: string;
  regimeShortName: string;
  regimeLegalBasis: string;
  regimeExplanation: string;
  noticePeriods: {
    landlord: NoticePeriod;
    tenant: NoticePeriod;
    /** 12 kap. 5 § JB: hyresgästens tvingande rätt att säga upp med tre månader */
    tenantStatutoryThreeMonths: boolean;
  };
  securityOfTenure: SecurityOfTenure;
  rentRule: RentRule;
  /** 12 kap. 3 § JB — avtal på bestämd tid som varat mer än nio månader måste sägas upp */
  requiresNoticeToEnd: boolean;
  durationDays: number | null;
  durationMonths: number | null;
  warnings: LegalWarning[];
}

/* ------------------------------------------------------------------ datum */

export function parseDate(s?: string): Date | null {
  if (!s) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  if (isNaN(+d)) return null;
  return d;
}

/** Kalendermånader framåt, med klämning till månadens sista dag (31 jan + 1 mån = 28/29 feb). */
export function addMonths(d: Date, months: number): Date {
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth() + months;
  const day = d.getUTCDate();
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return new Date(Date.UTC(year, month, Math.min(day, lastDay)));
}

export function daysBetween(a: Date, b: Date): number {
  return Math.round((+b - +a) / 86_400_000);
}

/** Hela kalendermånader mellan två datum. */
export function monthsBetween(a: Date, b: Date): number {
  let months =
    (b.getUTCFullYear() - a.getUTCFullYear()) * 12 +
    (b.getUTCMonth() - a.getUTCMonth());
  if (b.getUTCDate() < a.getUTCDate()) months -= 1;
  return months;
}

/** true om hyrestiden är längre än `months` kalendermånader. */
export function exceedsMonths(start: Date, end: Date, months: number): boolean {
  return +end > +addMonths(start, months);
}

/* ------------------------------------------------------- 4.2 beslutstabell */

export interface RegimeDecision {
  regime: LegalRegime;
  /** vilken rad i beslutstabellen som träffade — används i test och UI */
  rule: 1 | 2 | 3 | 4 | 5;
  reason: string;
}

/**
 * Tillämpningsområdet enligt privatuthyrningslagen (2026:772).
 *
 * 1 kap. 1 §: lagen gäller avtal genom vilka en fysisk person eller ett dödsbo mot
 * ersättning upplåter hus eller del av hus, om lägenheten upplåtits för att helt
 * eller till inte oväsentlig del användas som bostad.
 *
 * 1 kap. 3 § första stycket undantar tre fall: hyresvärden hyr regelmässigt ut fler
 * än två lägenheter som inte utgör del av hyresvärdens bostad (p. 1), hyresvärden
 * innehar lägenheten med hyresrätt (p. 2), eller upplåtelsen avser fritidsändamål
 * (p. 3). Faller avtalet utanför lagen gäller 12 kap. jordabalken.
 *
 * Den upphävda lagens regel om att endast den första upplåtelsen omfattades finns
 * inte kvar och har därför ingen motsvarighet här.
 *
 * Utvärderas i ordning — första träff vinner.
 */
export function resolveRegimeDecision(a: AnswerSet): RegimeDecision {
  if (a.landlordEntity === "legal_entity") {
    return {
      regime: "JB12",
      rule: 1,
      reason:
        "Hyresvärden är en juridisk person. Privatuthyrningslagen gäller bara när en fysisk person eller ett dödsbo hyr ut.",
    };
  }
  if (a.landlordTitle === "first_hand_lease" || a.landlordTitle === "second_hand") {
    return {
      regime: "JB12",
      rule: 2,
      reason:
        "Hyresvärden innehar lägenheten med hyresrätt. Privatuthyrningslagen gäller inte sådana upplåtelser.",
    };
  }
  if (a.purpose === "leisure") {
    return {
      regime: "JB12",
      rule: 3,
      reason:
        "Upplåtelsen avser fritidsändamål. Privatuthyrningslagen gäller inte sådana upplåtelser.",
    };
  }
  if (a.landlordRentsMoreThanTwo === true) {
    return {
      regime: "JB12",
      rule: 4,
      reason:
        "Hyresvärden hyr regelmässigt ut fler än två lägenheter som inte utgör del av den egna bostaden. Privatuthyrningslagen gäller då inte.",
    };
  }
  return {
    regime: "PRIVATE_2026_772",
    rule: 5,
    reason:
      "En fysisk person eller ett dödsbo hyr ut en bostad för permanentboende, utanför undantagen i 1 kap. 3 §. Privatuthyrningslagen gäller.",
  };
}

export function resolveLegalRegime(a: AnswerSet): LegalRegime {
  return resolveRegimeDecision(a).regime;
}

/* ------------------------------------------------- 4.3 uppsägningstider */

/** 6 kap. 2 §: tre månader för båda parter vid avtal som gäller tills vidare. */
const PRIVATE_TENANT: NoticePeriod = {
  months: 3,
  toMonthEnd: true,
  legalBasis: "6 kap. 2 § privatuthyrningslagen (2026:772)",
};
const PRIVATE_LANDLORD: NoticePeriod = {
  months: 3,
  toMonthEnd: true,
  legalBasis: "6 kap. 2 § privatuthyrningslagen (2026:772)",
};
/** 6 kap. 1 § andra stycket: hyresgästen får alltid säga upp med tre månader. */
const PRIVATE_TENANT_FIXED: NoticePeriod = {
  months: 3,
  toMonthEnd: true,
  legalBasis: "6 kap. 1 § andra stycket privatuthyrningslagen (2026:772)",
};
/**
 * 6 kap. 1 §: avtalet upphör vid hyrestidens slut. Hyresvärden har ingen
 * motsvarande rätt att säga upp i förtid — endast grunderna i 6 kap. 3 §.
 */
const PRIVATE_LANDLORD_FIXED: NoticePeriod = {
  toMonthEnd: false,
  legalBasis: "6 kap. 1 § privatuthyrningslagen (2026:772)",
  unavailable: {
    reason:
      "Avtalet upphör vid hyrestidens slut. Hyresvärden kan inte säga upp ett tidsbestämt avtal i förtid, annat än på någon av grunderna i 6 kap. 3 §.",
  },
};
const JB_INDEFINITE: NoticePeriod = {
  months: 3,
  toMonthEnd: true,
  legalBasis: "12 kap. 4 § första stycket jordabalken",
};

function jbFixedTermNotice(start: Date | null, end: Date | null): NoticePeriod {
  const basis = "12 kap. 4 § andra stycket jordabalken";
  // Utan fullständiga datum kan hyrestiden inte bedömas. Välj längsta perioden —
  // ett för långt varsel är ett mindre fel än ett för kort.
  if (!start || !end) return { months: 3, toMonthEnd: false, legalBasis: basis };
  if (daysBetween(start, end) <= 14) return { days: 1, toMonthEnd: false, legalBasis: basis };
  if (!exceedsMonths(start, end, 3)) return { weeks: 1, toMonthEnd: false, legalBasis: basis };
  return { months: 3, toMonthEnd: false, legalBasis: basis };
}

/**
 * Längre uppsägningstid får avtalas till hyresgästens fördel (1 kap. 4 § privatuthyrningslagen,
 * 12 kap. 1 § sjätte stycket JB). I praktiken betyder det att hyresvärdens
 * uppsägningstid kan förlängas — hyresgästens egen kan aldrig förlängas till
 * dennes nackdel, och ett sådant villkor lämnas därför utan avseende.
 */
function applyExtendedNotice(landlord: NoticePeriod, extended: number | null): NoticePeriod {
  if (!extended || !landlord.months || extended <= landlord.months) return landlord;
  return { ...landlord, months: extended, legalBasis: landlord.legalBasis + ", avtalad förlängning" };
}

export function resolveNoticePeriods(
  a: AnswerSet,
  regime: LegalRegime
): LegalContext["noticePeriods"] {
  const start = parseDate(a.startDate);
  const end = parseDate(a.endDate);

  if (regime === "PRIVATE_2026_772") {
    if (a.contractType === "fixed") {
      // 6 kap. 1 §: avtalet löper ut av sig självt. Bara hyresgästen kan säga upp.
      return {
        landlord: PRIVATE_LANDLORD_FIXED,
        tenant: PRIVATE_TENANT_FIXED,
        tenantStatutoryThreeMonths: true,
      };
    }
    return {
      landlord: applyExtendedNotice(PRIVATE_LANDLORD, a.noticeExtendedTenant),
      tenant: PRIVATE_TENANT,
      tenantStatutoryThreeMonths: true,
    };
  }

  if (a.contractType === "fixed") {
    const notice = jbFixedTermNotice(start, end);
    return {
      landlord: applyExtendedNotice(notice, a.noticeExtendedTenant),
      tenant: notice,
      // 12 kap. 5 § JB: hyresgästen får alltid säga upp ett bostadshyresavtal
      // till månadsskifte tidigast tre månader bort, även vid bestämd tid.
      tenantStatutoryThreeMonths: true,
    };
  }

  return {
    landlord: applyExtendedNotice(JB_INDEFINITE, a.noticeExtendedTenant),
    tenant: JB_INDEFINITE,
    tenantStatutoryThreeMonths: true,
  };
}

/* --------------------------------------------------- 4.4 besittningsskydd */

function isSublet(a: AnswerSet): boolean {
  return a.landlordTitle === "first_hand_lease" || a.landlordTitle === "second_hand";
}

/** 12 kap. 45 § första stycket 2 JB — möblerat rum eller bostad för fritidsändamål. */
function isFurnishedRoomOrLeisure(a: AnswerSet): boolean {
  if (a.propertyType === "holiday_home" || a.purpose === "leisure") return true;
  return a.furnished !== "none" && a.furnished !== "" && a.rooms === 1;
}

export function resolveSecurityOfTenure(
  a: AnswerSet,
  regime: LegalRegime
): SecurityOfTenure {
  if (regime === "PRIVATE_2026_772") {
    // Privatuthyrningslagen innehåller ingen bestämmelse om förlängning, och
    // 12 kap. jordabalken med sitt besittningsskydd är undantaget enligt
    // 12 kap. 1 c § JB. Ingen förlängningsrätt finns därför att åberopa.
    return {
      status: "none",
      reason:
        "Privatuthyrningslagen ger ingen rätt till förlängning av avtalet, och hyreslagens besittningsskydd gäller inte för sådana upplåtelser.",
      legalBasis:
        "privatuthyrningslagen (2026:772) jämförd med 12 kap. 1 c § jordabalken",
    };
  }
  if (a.propertyType === "room_in_own_home") {
    return {
      status: "none",
      reason:
        "Upplåtelsen avser en del av upplåtarens egen bostad. Besittningsskydd föreligger inte.",
      legalBasis: "12 kap. 45 § första stycket 3 jordabalken",
    };
  }
  if (isSublet(a)) {
    return {
      status: "arises_after",
      months: 24,
      reason:
        "Vid andrahandsupplåtelse av en hel lägenhet uppstår besittningsskydd först när hyresförhållandet varat längre än två år i följd.",
      legalBasis: "12 kap. 45 § första stycket 1 jordabalken",
    };
  }
  if (isFurnishedRoomOrLeisure(a)) {
    return {
      status: "arises_after",
      months: 9,
      reason:
        "Vid möblerat rum eller bostad för fritidsändamål uppstår besittningsskydd först när hyresförhållandet varat längre än nio månader i följd.",
      legalBasis: "12 kap. 45 § första stycket 2 jordabalken",
    };
  }
  return {
    status: "full",
    reason:
      "Hyresgästen har besittningsskydd och har som huvudregel rätt till förlängning av avtalet.",
    legalBasis: "12 kap. 46 § jordabalken",
  };
}

/* ------------------------------------------------------- 4.5 hyressättning */

function resolveRentRule(a: AnswerSet, regime: LegalRegime): RentRule {
  if (regime === "PRIVATE_2026_772") {
    return {
      clauseId: "C-RENT-PRIVATE",
      principle:
        "Hyran ska vara bestämd till beloppet. Ersättning som motsvarar förbrukningen får avtalas särskilt för uppvärmning, nedkylning, varmvatten, el och avgifter för vatten och avlopp — men inte för andra nyttigheter. Hyresgästen kan begära att hyresnämnden prövar hyran, som sätts ned om den är väsentligt högre än hyran för liknande lägenheter som hyrs ut enligt samma lag. Sänks hyran för förfluten tid ska hyresvärden betala tillbaka det överskjutande beloppet jämte ränta.",
      legalBasis: "2 kap. 1, 5 och 6 §§ privatuthyrningslagen (2026:772)",
    };
  }
  if (isSublet(a)) {
    return {
      clauseId: "C-RENT-JB",
      principle:
        "Hyran bestäms enligt bruksvärdesprincipen. Vid andrahandsupplåtelse av en hyresrätt utgör förstahandshyran taket, med tillägg om högst omkring 15 procent om lägenheten hyrs ut möblerad samt med faktisk ersättning för el, bredband och liknande kostnader.",
      legalBasis: "12 kap. 55 § jordabalken",
    };
  }
  return {
    clauseId: "C-RENT-JB",
    principle:
      "Hyran bestäms enligt bruksvärdesprincipen. Hyran ska vara skälig i förhållande till hyran för lägenheter som med hänsyn till bruksvärdet är likvärdiga.",
    legalBasis: "12 kap. 55 § jordabalken",
  };
}

/* ------------------------------------------------------------ 9 varningar */

function resolveWarnings(
  a: AnswerSet,
  regime: LegalRegime,
  tenure: SecurityOfTenure,
  durationMonths: number | null,
  requiresNoticeToEnd: boolean
): LegalWarning[] {
  const w: LegalWarning[] = [];

  const consentMissing =
    (a.landlordTitle === "condominium" && a.boardConsentObtained !== "" && a.boardConsentObtained !== "yes") ||
    (a.landlordTitle === "first_hand_lease" && a.landlordConsentObtained !== "" && a.landlordConsentObtained !== "yes");
  if (consentMissing) {
    w.push({
      id: "W-CONSENT",
      level: "blocking",
      text:
        "Uthyrning utan styrelsens samtycke eller hyresvärdens tillstånd kan leda till att din egen bostadsrätt eller ditt förstahandskontrakt förverkas. Sök tillstånd innan hyresgästen flyttar in, eller ansök om tillstånd hos hyresnämnden.",
      step: 2,
    });
  }

  if (tenure.status === "arises_after" && durationMonths !== null && durationMonths > tenure.months) {
    w.push({
      id: "W-TENURE",
      level: "high",
      text: `Hyresgästen får besittningsskydd efter ${tenure.months} månader. Ett avstående från besittningsskydd kräver en särskilt upprättad handling och normalt hyresnämndens godkännande.`,
      step: 6,
    });
  }
  if (tenure.status === "arises_after" && a.contractType === "indefinite") {
    w.push({
      id: "W-TENURE",
      level: "high",
      text: `Avtalet löper tills vidare. Hyresgästen får besittningsskydd när hyresförhållandet varat längre än ${tenure.months} månader i följd. Ett avstående kräver en särskilt upprättad handling och normalt hyresnämndens godkännande.`,
      step: 6,
    });
  }

  if (a.landlordTitle === "first_hand_lease") {
    w.push({
      id: "W-RENT-CRIMINAL",
      level: "high",
      text:
        "Att ta ut oskäligt hög hyra vid andrahandsuthyrning av en hyresrätt kan vara straffbart. Utgå från förstahandshyran, lägg till högst omkring 15 procent för möblering och ta i övrigt bara ut faktiska kostnader.",
      step: 5,
    });
  }

  const rent = (a.baseRent ?? 0) + (a.furnishingSurcharge ?? 0) + (a.hasParking ? a.parkingFee ?? 0 : 0);
  if (a.depositAmount && rent > 0 && a.depositAmount > rent * 3) {
    w.push({
      id: "W-DEPOSIT-HIGH",
      level: "medium",
      text: "Depositionen motsvarar mer än tre månadshyror, vilket är ovanligt högt och kan ifrågasättas.",
      step: 7,
    });
  }

  if ((a.prepaidRentMonths ?? 0) > 1) {
    w.push({
      id: "W-PREPAID",
      level: "medium",
      text: "Förskottshyra utöver en månad kan strida mot 12 kap. 20 § jordabalken.",
      step: 7,
    });
  }

  if (requiresNoticeToEnd) {
    w.push({
      id: "W-FIXED-9M",
      level: "info",
      text:
        "Hyrestiden överstiger nio månader. Avtalet upphör inte automatiskt vid hyrestidens utgång utan måste sägas upp för att upphöra.",
      step: 6,
    });
  }

  const start = parseDate(a.startDate);
  if (start) {
    const today = new Date();
    const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    if (+start < +todayUtc) {
      w.push({
        id: "W-START-PAST",
        level: "info",
        text: "Tillträdesdagen ligger bakåt i tiden. Kontrollera att datumet är rätt.",
        step: 6,
      });
    }
  }

  return w;
}

/* ------------------------------------------------------------- fasadfunktion */

const REGIME_META: Record<LegalRegime, Pick<LegalContext, "regimeName" | "regimeShortName" | "regimeLegalBasis">> = {
  PRIVATE_2026_772: {
    regimeName: "privatuthyrningslagen (2026:772)",
    regimeShortName: "Privatuthyrningslagen",
    regimeLegalBasis: "privatuthyrningslagen (2026:772)",
  },
  JB12: {
    regimeName: "12 kap. jordabalken (hyreslagen)",
    regimeShortName: "Hyreslagen (12 kap. jordabalken)",
    regimeLegalBasis: "12 kap. jordabalken",
  },
};

export function resolveLegalContext(a: AnswerSet): LegalContext {
  const decision = resolveRegimeDecision(a);
  const regime = decision.regime;

  const start = parseDate(a.startDate);
  const end = parseDate(a.endDate);
  const isFixed = a.contractType === "fixed";
  const durationDays = isFixed && start && end ? daysBetween(start, end) : null;
  const durationMonths = isFixed && start && end ? monthsBetween(start, end) : null;

  const requiresNoticeToEnd =
    regime === "JB12" && isFixed && !!start && !!end && exceedsMonths(start, end, 9);

  const securityOfTenure = resolveSecurityOfTenure(a, regime);
  const noticePeriods = resolveNoticePeriods(a, regime);

  return {
    regime,
    ...REGIME_META[regime],
    regimeExplanation: decision.reason,
    noticePeriods,
    securityOfTenure,
    rentRule: resolveRentRule(a, regime),
    requiresNoticeToEnd,
    durationDays,
    durationMonths,
    warnings: resolveWarnings(a, regime, securityOfTenure, durationMonths, requiresNoticeToEnd),
  };
}

/* ------------------------------------------------------------ presentation */

export function describeNotice(n: NoticePeriod): string {
  if (n.unavailable) return n.unavailable.reason;
  const amount =
    n.months !== undefined
      ? n.months === 1
        ? "en månad"
        : `${n.months} månader`
      : n.weeks !== undefined
      ? n.weeks === 1
        ? "en vecka"
        : `${n.weeks} veckor`
      : n.days === 1
      ? "en dag"
      : `${n.days} dagar`;
  return n.toMonthEnd
    ? `till det månadsskifte som inträffar tidigast ${amount} från uppsägningen`
    : `senast ${amount} före hyrestidens utgång`;
}
