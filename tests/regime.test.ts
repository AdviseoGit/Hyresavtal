/**
 * Acceptanskriterier §13, T1-T10. Regressionsskydd för lagvalsmotorn.
 * Poängen med hela ombyggnaden är att T1 och T3 ger olika uppsägningstid.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  addMonths,
  daysBetween,
  exceedsMonths,
  monthsBetween,
  resolveLegalContext,
  resolveLegalRegime,
  resolveRegimeDecision,
  describeNotice,
} from "../src/lib/legal/regime";
import { createEmptyAnswerSet } from "../src/lib/types";
import { T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, base } from "./fixtures";

test("T1 bostadsrätt, privatperson, permanent -> privatuthyrningslagen, 3/3 månader", () => {
  const ctx = resolveLegalContext(T1);
  assert.equal(ctx.regime, "PRIVATE_2026_772");
  // 6 kap. 2 §: tre månader för båda parter. Under den upphävda lagen var
  // hyresgästens uppsägningstid en månad.
  assert.deepEqual(ctx.noticePeriods.tenant.months, 3);
  assert.equal(ctx.noticePeriods.tenant.toMonthEnd, true);
  assert.deepEqual(ctx.noticePeriods.landlord.months, 3);
  assert.equal(ctx.noticePeriods.landlord.toMonthEnd, true);
  assert.equal(ctx.securityOfTenure.status, "none");
  // Grunden är inte längre en egen paragraf utan att lagen saknar
  // förlängningsregel och att 12 kap. 1 c § JB undantar upplåtelsen.
  assert.match(ctx.securityOfTenure.legalBasis, /1 c §/);
});

test("T2 bostadsrätt, privat, permanent, ytterligare -> JB12, 3/3 månader", () => {
  const ctx = resolveLegalContext(T2);
  assert.equal(ctx.regime, "JB12");
  assert.equal(ctx.noticePeriods.tenant.months, 3);
  assert.equal(ctx.noticePeriods.landlord.months, 3);
});

test("T3 hyresrätt i andra hand -> JB12, 3/3, besittningsskydd efter 24 mån, W-RENT-CRIMINAL", () => {
  const ctx = resolveLegalContext(T3);
  assert.equal(ctx.regime, "JB12");
  assert.equal(ctx.noticePeriods.tenant.months, 3);
  assert.equal(ctx.noticePeriods.landlord.months, 3);
  assert.equal(ctx.securityOfTenure.status, "arises_after");
  assert.equal(
    ctx.securityOfTenure.status === "arises_after" ? ctx.securityOfTenure.months : null,
    24
  );
  assert.ok(ctx.warnings.some((w) => w.id === "W-RENT-CRIMINAL"));
});

test("T4 villa, privat, fritidsändamål -> JB12", () => {
  assert.equal(resolveLegalRegime(T4), "JB12");
});

test("T5 villa, näringsverksamhet, permanent -> JB12", () => {
  assert.equal(resolveLegalRegime(T5), "JB12");
});

test("T6 rum i egen bostad, privatperson, permanent -> PRIVATE, inget besittningsskydd", () => {
  const ctx = resolveLegalContext(T6);
  assert.equal(ctx.regime, "PRIVATE_2026_772");
  assert.equal(ctx.securityOfTenure.status, "none");
});

test("T7 JB12, bestämd tid 2 månader -> uppsägningstid 1 vecka", () => {
  const ctx = resolveLegalContext(T7);
  assert.equal(ctx.regime, "JB12");
  assert.equal(ctx.noticePeriods.landlord.weeks, 1);
  assert.equal(ctx.noticePeriods.landlord.months, undefined);
  assert.equal(ctx.requiresNoticeToEnd, false);
});

test("T8 JB12, bestämd tid 6 månader -> uppsägningstid 3 månader", () => {
  const ctx = resolveLegalContext(T8);
  assert.equal(ctx.noticePeriods.landlord.months, 3);
  assert.equal(ctx.requiresNoticeToEnd, false);
});

test("T9 JB12, bestämd tid 12 månader -> 3 månader och krav på uppsägning", () => {
  const ctx = resolveLegalContext(T9);
  assert.equal(ctx.noticePeriods.landlord.months, 3);
  assert.equal(ctx.requiresNoticeToEnd, true);
  assert.ok(ctx.warnings.some((w) => w.id === "W-FIXED-9M"));
});

test("T10 PRIVATE, bestämd tid 12 månader -> hyresgästen 3 mån, hyresvärden ingen uppsägningsrätt", () => {
  const ctx = resolveLegalContext(T10);
  assert.equal(ctx.regime, "PRIVATE_2026_772");
  // 6 kap. 1 § andra stycket ger hyresgästen en ovillkorlig tremånadersrätt.
  assert.equal(ctx.noticePeriods.tenant.months, 3);
  // Hyresvärden kan inte säga upp ett tidsbestämt avtal i förtid enligt 6 kap. 1 §.
  assert.ok(ctx.noticePeriods.landlord.unavailable);
  assert.equal(ctx.noticePeriods.landlord.months, undefined);
  assert.equal(ctx.requiresNoticeToEnd, false);
  // Niomånadersregeln i 12 kap. 3 § JB hör till hyreslagen och gäller inte här.
  assert.ok(!ctx.warnings.some((w) => w.id === "W-FIXED-9M"));
});

test("regressionstest: T1 och T3 ger olika uppsägningstid för hyresgästen", () => {
  // Under den upphävda lagen skilde sig T1 och T3 åt i antal månader (1 mot 3).
  // Privatuthyrningslagen ger tre månader i båda regimerna, så skillnaden ligger
  // numera i lagrummet och i besittningsskyddet — inte i siffran.
  const c1 = resolveLegalContext(T1);
  const c3 = resolveLegalContext(T3);
  assert.notEqual(c1.regime, c3.regime);
  assert.notEqual(c1.noticePeriods.tenant.legalBasis, c3.noticePeriods.tenant.legalBasis);
  assert.notEqual(c1.securityOfTenure.status, c3.securityOfTenure.status);
});

test("beslutstabellen utvärderas i ordning — juridisk person slår allt", () => {
  const a = base({
    landlordEntity: "legal_entity",
    purpose: "permanent",
    landlordRentsMoreThanTwo: false,
  });
  assert.equal(resolveLegalRegime(a), "JB12");
});

test("dödsbo omfattas av privatuthyrningslagen (1 kap. 1 §)", () => {
  assert.equal(resolveLegalRegime(base({ landlordEntity: "estate" })), "PRIVATE_2026_772");
});

test("regelmässigt fler än två lägenheter faller utanför lagen (1 kap. 3 § 1 st 1)", () => {
  assert.equal(resolveLegalRegime(base({ landlordRentsMoreThanTwo: true })), "JB12");
});

test("uppsägningstid tills vidare är tre månader för båda parter (6 kap. 2 §)", () => {
  const ctx = resolveLegalContext(base({ contractType: "indefinite" }));
  assert.equal(ctx.regime, "PRIVATE_2026_772");
  assert.equal(ctx.noticePeriods.tenant.months, 3);
  assert.equal(ctx.noticePeriods.landlord.months, 3);
});

test("vid bestämd tid får hyresvärden inte säga upp i förtid (6 kap. 1 §)", () => {
  const ctx = resolveLegalContext(
    base({ contractType: "fixed", startDate: "2030-01-01", endDate: "2031-01-01" })
  );
  assert.equal(ctx.regime, "PRIVATE_2026_772");
  assert.equal(ctx.noticePeriods.tenant.months, 3);
  assert.ok(ctx.noticePeriods.landlord.unavailable);
  assert.equal(ctx.noticePeriods.landlord.months, undefined);
});

test("tredjehandsupplåtelse faller under JB12", () => {
  assert.equal(resolveLegalRegime(base({ landlordTitle: "second_hand" })), "JB12");
});

test("JB12 bestämd tid högst två veckor -> uppsägningstid 1 dag", () => {
  const ctx = resolveLegalContext(
    base({
      landlordTitle: "first_hand_lease",
      contractType: "fixed",
      startDate: "2030-01-01",
      endDate: "2030-01-14",
    })
  );
  assert.equal(ctx.noticePeriods.landlord.days, 1);
});

test("JB12 bestämd tid exakt tre månader -> 1 vecka, en dag mer -> 3 månader", () => {
  const treMan = resolveLegalContext(
    base({ landlordTitle: "first_hand_lease", contractType: "fixed", startDate: "2030-01-01", endDate: "2030-04-01" })
  );
  assert.equal(treMan.noticePeriods.landlord.weeks, 1);
  const overTreMan = resolveLegalContext(
    base({ landlordTitle: "first_hand_lease", contractType: "fixed", startDate: "2030-01-01", endDate: "2030-04-02" })
  );
  assert.equal(overTreMan.noticePeriods.landlord.months, 3);
});

test("hyresgästens tremånadersrätt gäller numera i båda regimerna", () => {
  // JB: 12 kap. 5 §. Privatuthyrningslagen: 6 kap. 1 § andra stycket och 6 kap. 2 §.
  assert.equal(resolveLegalContext(T3).noticePeriods.tenantStatutoryThreeMonths, true);
  assert.equal(resolveLegalContext(T1).noticePeriods.tenantStatutoryThreeMonths, true);
});

test("avtalad förlängning höjer hyresvärdens uppsägningstid men aldrig hyresgästens", () => {
  const ctx = resolveLegalContext(base({ noticeExtendedLandlord: 6 }));
  assert.equal(ctx.noticePeriods.landlord.months, 6);
  assert.equal(ctx.noticePeriods.tenant.months, 3);
});

test("kortare avtalad tid än lagens minimum lämnas utan avseende", () => {
  const ctx = resolveLegalContext(base({ noticeExtendedLandlord: 1 }));
  assert.equal(ctx.noticePeriods.landlord.months, 3);
});

test("F11 — möblerad etta likställs inte med möblerat rum", () => {
  // 12 kap. 45 § 1 st 2 skiljer på "ett möblerat rum" och "en lägenhet".
  // Koden likställde tidigare varje möblerad enrumslägenhet med ett möblerat rum
  // och förnekade besittningsskyddet i nio månader utan stöd i ordalydelsen.
  const ctx = resolveLegalContext(
    base({ landlordRentsMoreThanTwo: true, rooms: 1, furnished: "full" })
  );
  assert.equal(ctx.regime, "JB12");
  assert.equal(ctx.securityOfTenure.status, "full");
});

test("fritidsbostad under JB12 ger besittningsskydd efter 9 månader", () => {
  const ctx = resolveLegalContext(base({ propertyType: "holiday_home", purpose: "leisure" }));
  assert.equal(
    ctx.securityOfTenure.status === "arises_after" ? ctx.securityOfTenure.months : null,
    9
  );
});

test("ordinär andrahandsuthyrning av bostadsrätt (ytterligare) ger fullt besittningsskydd", () => {
  const ctx = resolveLegalContext(base({ landlordRentsMoreThanTwo: true }));
  assert.equal(ctx.securityOfTenure.status, "full");
});

test("saknat samtycke ger blockerande varning", () => {
  const ctx = resolveLegalContext(base({ boardConsentObtained: "no" }));
  const w = ctx.warnings.find((x) => x.id === "W-CONSENT");
  assert.ok(w);
  assert.equal(w?.level, "blocking");
});

test("deposition över tre månadshyror och förskottshyra ger varningar", () => {
  const ctx = resolveLegalContext(base({ depositAmount: 40000, prepaidRentMonths: 3 }));
  assert.ok(ctx.warnings.some((w) => w.id === "W-DEPOSIT-HIGH"));
  assert.ok(ctx.warnings.some((w) => w.id === "W-PREPAID"));
});

test("datumhjälpare räknar kalendermånader och klämmer månadsslut", () => {
  assert.equal(addMonths(new Date(Date.UTC(2030, 0, 31)), 1).toISOString().slice(0, 10), "2030-02-28");
  assert.equal(monthsBetween(new Date(Date.UTC(2030, 0, 1)), new Date(Date.UTC(2031, 0, 1))), 12);
  assert.equal(daysBetween(new Date(Date.UTC(2030, 0, 1)), new Date(Date.UTC(2030, 0, 15))), 14);
  assert.equal(exceedsMonths(new Date(Date.UTC(2030, 0, 1)), new Date(Date.UTC(2030, 9, 1)), 9), false);
  assert.equal(exceedsMonths(new Date(Date.UTC(2030, 0, 1)), new Date(Date.UTC(2030, 9, 2)), 9), true);
});

/* -------------------------------------------------------------------------
   F22: luckorna som gjorde att fynden i granskningsrapporten kunde uppstå
   utan att något test gick sönder.
   ------------------------------------------------------------------------- */

test("F22:1 — tomt formulär påstår inte att någon lag gäller", () => {
  // 1 kap. 1 § är ett positivt tillämpningsvillkor, inte en presumtion.
  const d = resolveRegimeDecision(createEmptyAnswerSet());
  assert.equal(d.pending, true);
  assert.ok(!/Privatuthyrningslagen gäller/.test(d.reason));
  assert.match(d.reason, /ännu inte avgjort/);
});

test("F22:1b — besvarade grundfrågor ger ett avgjort lagval", () => {
  assert.equal(resolveRegimeDecision(T1).pending, false);
  assert.equal(resolveRegimeDecision(T3).pending, false);
});

test("F22:2 — beslutstabellens ordning vid äkta krock mellan flera undantag", () => {
  // Hyresrätt (1 kap. 3 § 1 st 2) och fritidsändamål (p. 3) samtidigt.
  // Båda ger JB12, men vilken regel som rapporteras skrivs in i avtalet.
  const d = resolveRegimeDecision(
    base({ landlordTitle: "first_hand_lease", purpose: "leisure" })
  );
  assert.equal(d.regime, "JB12");
  assert.equal(d.rule, 2, "hyresrättsledet ska rapporteras före fritidsledet");
  assert.match(d.reason, /hyresrätt/);
});

test("F22:4 — fritidshus som hyrs ut för permanentboende ger fullt besittningsskydd", () => {
  // 12 kap. 45 § 1 st 2 kräver att lägenheten upplåts FÖR fritidsändamål.
  // Tidigare räckte bostadstypen, vilket förnekade skyddet i nio månader.
  const ctx = resolveLegalContext(
    base({ propertyType: "holiday_home", purpose: "permanent", landlordTitle: "first_hand_lease" })
  );
  assert.equal(ctx.regime, "JB12");
  assert.notEqual(ctx.securityOfTenure.status, "none");
});

test("F22:6 — avtalad förlängning gäller även när lagens minimum är veckor", () => {
  // 12 kap. 4 § 2 st: "och är inte längre uppsägningstid avtalad".
  const ctx = resolveLegalContext(
    base({
      landlordTitle: "first_hand_lease",
      contractType: "fixed",
      startDate: "2030-01-01",
      endDate: "2030-04-01",
      noticeExtendedLandlord: 6,
    })
  );
  assert.equal(ctx.noticePeriods.landlord.months, 6, "förlängningen får inte kastas");
  assert.match(ctx.noticePeriods.landlord.legalBasis, /avtalad förlängning/);
});

test("F22:7 — hyresregeln under privatuthyrningslagen citerar 2 kap., inte hyreslagen", () => {
  const r = resolveLegalContext(T1).rentRule;
  assert.equal(r.clauseId, "C-RENT-PRIVATE");
  assert.match(r.legalBasis, /privatuthyrningslagen/);
  assert.ok(!/12 kap\./.test(r.legalBasis));
  assert.match(r.principle, /bestämd till beloppet/);
});

test("F22:8 — förskottsvarningen citerar rätt lag för rätt regim", () => {
  const priv = resolveLegalContext(base({ prepaidRentMonths: 3 }));
  const wp = priv.warnings.find((w) => w.id === "W-PREPAID");
  assert.ok(wp);
  assert.match(wp.text, /2 kap\. 2 § privatuthyrningslagen/);
  assert.ok(!/12 kap\. 20 §/.test(wp.text), "hyreslagen gäller inte här");

  const jb = resolveLegalContext(
    base({ landlordTitle: "first_hand_lease", prepaidRentMonths: 3 })
  );
  const wj = jb.warnings.find((w) => w.id === "W-PREPAID");
  assert.ok(wj);
  assert.match(wj.text, /12 kap\. 20 §/);
});

test("F22:9 — describeNotice ger en läsbar mening när uppsägningsrätt saknas", () => {
  const ctx = resolveLegalContext(
    base({ contractType: "fixed", startDate: "2030-01-01", endDate: "2031-01-01" })
  );
  const text = describeNotice(ctx.noticePeriods.landlord);
  assert.ok(!/undefined/.test(text));
  assert.match(text, /^Avtalet upphör vid hyrestidens slut/);
});

test("F14 — straffvarningen anger båda rekvisiten i 12 kap. 65 c §", () => {
  const ctx = resolveLegalContext(base({ landlordTitle: "first_hand_lease" }));
  const w = ctx.warnings.find((x) => x.id === "W-RENT-CRIMINAL");
  assert.ok(w);
  assert.match(w.text, /utan behövligt samtycke/);
  assert.match(w.text, /15 procent/);
  assert.ok(!/omkring 15/.test(w.text), "taket är exakt, inte ungefärligt");
});
