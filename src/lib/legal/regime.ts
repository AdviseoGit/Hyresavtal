/**
 * Lagvalsmotorn — kravspecifikation v1 §4.
 *
 * Ren modul: inga sidoeffekter, inga React-beroenden, körbar i Node.
 * Allt annat i tjänsten (klausuler, varningar, PDF) läser resultatet härifrån.
 * Ändras något här ska tests/regime.test.ts (T1-T10) uppdateras först.
 */

import { totalRent, type AnswerSet } from "../types";

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
  /** Sant tills grundfrågorna är besvarade — lagvalet får då inte påstås. */
  regimePending: boolean;
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
  /**
   * Sant när grundfrågorna ännu inte är besvarade. 1 kap. 1 § är ett positivt
   * tillämpningsvillkor, inte en presumtion — frånvaron av ett diskvalificerande
   * svar betyder inte att lagen gäller. `regime` innehåller då den regim som
   * *skulle* gälla om resten lämnas obesvarad, men `reason` säger att frågan är
   * öppen och får inte presenteras som ett konstaterande.
   */
  pending: boolean;
}

/** Grundfrågor som måste vara besvarade innan lagvalet kan påstås. */
function regimeQuestionsAnswered(a: AnswerSet): boolean {
  return a.landlordEntity !== "" && a.landlordTitle !== "" && a.purpose !== "";
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
      pending: false,
      reason:
        "Hyresvärden är en juridisk person. Privatuthyrningslagen gäller bara när en fysisk person eller ett dödsbo hyr ut.",
    };
  }
  if (a.landlordTitle === "first_hand_lease" || a.landlordTitle === "second_hand") {
    return {
      regime: "JB12",
      rule: 2,
      pending: false,
      reason:
        "Hyresvärden innehar lägenheten med hyresrätt. Privatuthyrningslagen gäller inte sådana upplåtelser.",
    };
  }
  if (a.purpose === "leisure") {
    return {
      regime: "JB12",
      rule: 3,
      pending: false,
      reason:
        "Upplåtelsen avser fritidsändamål. Privatuthyrningslagen gäller inte sådana upplåtelser.",
    };
  }
  if (a.landlordRentsMoreThanTwo === true) {
    return {
      regime: "JB12",
      rule: 4,
      pending: false,
      reason:
        "Hyresvärden hyr regelmässigt ut fler än två lägenheter som inte utgör del av den egna bostaden. Privatuthyrningslagen gäller då inte.",
    };
  }
  if (!regimeQuestionsAnswered(a)) {
    return {
      regime: "PRIVATE_2026_772",
      rule: 5,
      pending: true,
      reason:
        "Lagvalet är ännu inte avgjort. Svara på frågorna om vem som hyr ut, hur du förfogar över bostaden och vad den ska användas till.",
    };
  }
  return {
    regime: "PRIVATE_2026_772",
    rule: 5,
    pending: false,
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
      "Avtalet upphör vid hyrestidens slut. Hyresvärden kan inte säga upp ett tidsbestämt avtal i förtid med ordinarie uppsägningstid, utan bara på någon av grunderna i 6 kap. 3 § eller i de konkursfall 7 kap. 3 § hänvisar till.",
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
 * 12 kap. 1 d § JB — 1 § delades upp genom SFS 2026:773). I praktiken betyder det att hyresvärdens
 * uppsägningstid kan förlängas — hyresgästens egen kan aldrig förlängas till
 * dennes nackdel, och ett sådant villkor lämnas därför utan avseende.
 */
/** Grundvärdet uttryckt i månader, så att veckor och dagar går att jämföra. */
function noticeInMonths(n: NoticePeriod): number {
  if (n.months !== undefined) return n.months;
  if (n.weeks !== undefined) return n.weeks / 4.345;
  if (n.days !== undefined) return n.days / 30.44;
  return 0;
}

function applyExtendedNotice(landlord: NoticePeriod, extended: number | null): NoticePeriod {
  if (!extended || landlord.unavailable) return landlord;
  // F18: tidigare krävdes att grundvärdet var uttryckt i månader, vilket tyst
  // kastade en avtalad förlängning när lagens minimum var veckor eller dagar.
  if (extended <= noticeInMonths(landlord)) return landlord;
  return {
    months: extended,
    toMonthEnd: landlord.toMonthEnd,
    legalBasis: landlord.legalBasis + ", avtalad förlängning",
  };
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
      landlord: applyExtendedNotice(PRIVATE_LANDLORD, a.noticeExtendedLandlord),
      tenant: PRIVATE_TENANT,
      tenantStatutoryThreeMonths: true,
    };
  }

  if (a.contractType === "fixed") {
    const notice = jbFixedTermNotice(start, end);
    return {
      landlord: applyExtendedNotice(notice, a.noticeExtendedLandlord),
      tenant: notice,
      // 12 kap. 5 § JB: hyresgästen får alltid säga upp ett bostadshyresavtal
      // till månadsskifte tidigast tre månader bort, även vid bestämd tid.
      tenantStatutoryThreeMonths: true,
    };
  }

  return {
    landlord: applyExtendedNotice(JB_INDEFINITE, a.noticeExtendedLandlord),
    tenant: JB_INDEFINITE,
    tenantStatutoryThreeMonths: true,
  };
}

/* --------------------------------------------------- 4.4 besittningsskydd */

function isSublet(a: AnswerSet): boolean {
  return a.landlordTitle === "first_hand_lease" || a.landlordTitle === "second_hand";
}

/** 12 kap. 45 § första stycket 2 JB — möblerat rum eller bostad för fritidsändamål. */
/**
 * 12 kap. 45 § första stycket 2: "ett möblerat rum eller en lägenhet för
 * fritidsändamål".
 *
 * Fritidsledet knyter an till ÄNDAMÅLET, inte till bostadstypen. Ett fritidshus
 * som hyrs ut för permanentboende är inte en lägenhet för fritidsändamål, och
 * hyresgästen har då fullt besittningsskydd enligt 46 §.
 *
 * Rumsledet ("ett möblerat rum") tillämpas INTE. Koden likställde tidigare varje
 * möblerad enrumslägenhet med ett möblerat rum, vilket saknar stöd i ordalydelsen
 * — lagtexten skiljer på "ett möblerat rum" och "en lägenhet" — och slog mot
 * hyresgästen. Ett möblerat rum som inte ingår i hyresvärdens egen bostad (det
 * fallet täcks av punkt 3) går inte att uttrycka i formulärets bostadstyper, så
 * grunden kan inte avgöras av motorn. Den är hänskjuten till jurist, och tills
 * dess tolkas frågan till hyresgästens fördel: inget nedsatt besittningsskydd.
 */
function isFurnishedRoomOrLeisure(a: AnswerSet): boolean {
  return a.purpose === "leisure";
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
        "Hyran ska vara bestämd till beloppet. För nyttigheter såsom uppvärmning, nedkylning, varmvatten, el och avgifter för vatten och avlopp får det avtalas att ersättning i stället betalas med ett belopp som motsvarar den faktiska förbrukningen. Det som begränsar är att ersättningen ska svara mot förbrukningen — en fast schablon för sådana poster är alltså inte ett giltigt undantag från att hyran ska vara bestämd till beloppet. Är hyran inte bestämd till beloppet, eller strider överenskommelsen mot detta, ska hyran betalas med ett skäligt belopp. Hyresgästen kan begära att hyresnämnden prövar hyran, som sätts ned om den är väsentligt högre än hyran för liknande lägenheter som hyrs ut enligt samma lag. Sänks hyran för förfluten tid ska hyresvärden betala tillbaka det överskjutande beloppet jämte ränta.",
      legalBasis: "2 kap. 1, 5 och 6 §§ privatuthyrningslagen (2026:772)",
      // 2 kap. 1 § andra stycket säger "nyttigheter såsom …". Ordet såsom gör
      // uppräkningen exemplifierande; jämför 12 kap. 19 § JB som räknar upp
      // samma poster utan det ordet. Skriv aldrig att listan är uttömmande.
    };
  }
  if (isSublet(a)) {
    return {
      clauseId: "C-RENT-JB",
      principle:
        "Hyran bestäms enligt bruksvärdesprincipen. Vid andrahandsupplåtelse av en hyresrätt utgör förstahandshyran taket. Ett tillägg för möbler och annan utrustning får inte överstiga 15 procent av den hyra hyresvärden själv betalar. Tillägg för andra nyttigheter får inte överstiga hyresvärdens kostnader för dem.",
      legalBasis: "12 kap. 55 § fjärde stycket jordabalken",
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
        "Vid andrahandsuthyrning av en hyresrätt får tillägget för möbler och utrustning inte överstiga 15 procent av den hyra du själv betalar, och övriga tillägg inte överstiga dina faktiska kostnader. Tar du ut mer utan behövligt samtycke från din hyresvärd eller tillstånd av hyresnämnden är det straffbart enligt 12 kap. 65 c § jordabalken. Har du samtycke är oskälig hyra i stället en grund för förverkande och kan medföra återbetalningsskyldighet.",
      step: 5,
    });
  }

  // F19: tröskeln ska räknas på samma belopp som avtalet anger som hyra.
  const rent = totalRent(a);
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
      // 12 kap. jordabalken gäller inte under privatuthyrningslagen (12 kap. 1 c §).
      // Motsvarigheten är 2 kap. 2 § jämförd med den tvingande 1 kap. 4 §.
      text:
        regime === "PRIVATE_2026_772"
          ? "Hyran ska betalas i förskott före varje kalendermånads början. Förskottshyra utöver det är till hyresgästens nackdel jämfört med 2 kap. 2 § privatuthyrningslagen och är enligt 1 kap. 4 § utan verkan mot hyresgästen."
          : "Förskottshyra utöver en månad kan strida mot 12 kap. 20 § jordabalken.",
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
    regimePending: decision.pending,
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
