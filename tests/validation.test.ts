/** §6: validering. B2 i nulägesanalysen — dagens formulär accepterar skräp. */

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  normalizePhone,
  normalizePostalCode,
  validateAmount,
  validateEmail,
  validateIdNumber,
  validatePhone,
  validatePostalCode,
  validateStep,
} from "../src/lib/validation";
import { base, T1 } from "./fixtures";

test("B2: sammanslagna personnummer accepteras inte längre", () => {
  const r = validateIdNumber("19900101-000019900101-0000");
  assert.equal(r.ok, false);
});

test("giltigt personnummer normaliseras till tolv siffror", () => {
  const r = validateIdNumber("850101-0014");
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.equal(r.kind, "person");
    assert.equal(r.normalized, "198501010014");
  }
});

test("tolvsiffrigt personnummer med bindestreck accepteras", () => {
  const r = validateIdNumber("19850101-0014");
  assert.equal(r.ok, true);
});

test("fel kontrollsiffra avvisas", () => {
  const r = validateIdNumber("19850101-0018");
  assert.equal(r.ok, false);
});

test("samordningsnummer känns igen (dag + 60)", () => {
  const r = validateIdNumber("19850161-0011");
  assert.equal(r.ok, true);
  if (r.ok) assert.equal(r.kind, "coordination");
});

test("organisationsnummer känns igen på tredje siffran och prefixas med 16", () => {
  const r = validateIdNumber("556016-0680");
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.equal(r.kind, "org");
    assert.equal(r.normalized, "165560160680");
  }
});

test("ogiltig datumdel avvisas", () => {
  assert.equal(validateIdNumber("19851301-0014").ok, false);
});

test("postnummer valideras och normaliseras", () => {
  assert.equal(validatePostalCode("11122"), null);
  assert.equal(validatePostalCode("111 22"), null);
  assert.ok(validatePostalCode("1112"));
  assert.equal(normalizePostalCode("11122"), "111 22");
});

test("e-post och telefon valideras, telefon normaliseras till E.164", () => {
  assert.equal(validateEmail("a@example.com"), null);
  assert.ok(validateEmail("a@example"));
  assert.equal(normalizePhone("070-123 45 67"), "+46701234567");
  assert.equal(normalizePhone("0046701234567"), "+46701234567");
  assert.equal(validatePhone("070-123 45 67"), null);
  assert.ok(validatePhone("12"));
});

test("belopp ska vara heltal inom intervallet", () => {
  assert.equal(validateAmount(9000), null);
  assert.ok(validateAmount(null));
  assert.ok(validateAmount(-1));
  assert.ok(validateAmount(1_000_000));
  assert.ok(validateAmount(1200.5));
});

test("stegvalidering: tomt formulär ger fel på grundfrågorna", () => {
  const e = validateStep("basics", base({ propertyType: "", landlordTitle: "", purpose: "", landlordEntity: "" }));
  assert.ok(e.propertyType && e.landlordTitle && e.purpose && e.landlordEntity);
});

test("B3: bestämd tid kräver slutdatum efter tillträdesdagen", () => {
  const utan = validateStep("term", base({ contractType: "fixed", fixedTermRenewal: "ends" }));
  assert.ok(utan.endDate);
  const bakvant = validateStep(
    "term",
    base({ contractType: "fixed", fixedTermRenewal: "ends", startDate: "2030-06-01", endDate: "2030-01-01" })
  );
  assert.ok(bakvant.endDate);
});

test("ifyllt referensfall passerar samtliga steg", () => {
  const steps = ["basics", "consent", "parties", "object", "rent", "term", "usage"] as const;
  for (const step of steps) {
    const e = validateStep(step, { ...T1, keys: T1.keys });
    assert.deepEqual(e, {}, `${step}: ${JSON.stringify(e)}`);
  }
});

test("möblerad bostad kräver inventarielista", () => {
  const e = validateStep("condition", base({ furnished: "full", inventoryItems: [] }));
  assert.ok(e.inventoryItems);
});

test("fast belopp för driftskostnad kräver belopp", () => {
  const e = validateStep("rent", base({ costElectricity: { mode: "separate_fixed" } }));
  assert.ok(e["costElectricity.amount"]);
});
