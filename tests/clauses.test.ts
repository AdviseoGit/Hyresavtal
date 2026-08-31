/** §13: snapshot-tester på genererad klausullista per regim. */

import { test } from "node:test";
import assert from "node:assert/strict";

import { buildClauses } from "../src/lib/legal/clauses";
import { resolveLegalContext } from "../src/lib/legal/regime";
import { emptyTenant } from "../src/lib/types";
import { T1, T3, T6, T9, T10, base } from "./fixtures";

function ids(a: Parameters<typeof resolveLegalContext>[0]): string[] {
  return buildClauses(a, resolveLegalContext(a)).map((c) => c.id);
}

test("T1 (privatuthyrningslagen) ger förväntad klausullista", () => {
  assert.deepEqual(ids(T1), [
    "C-PARTIES",
    "C-OBJECT",
    "C-LEGAL-REGIME",
    "C-CONSENT-GIVEN",
    "C-TERM-INDEFINITE",
    "C-NOTICE",
    "C-NOTICE-TENANT-STATUTORY-PRIVATE",
    "C-NOTICE-FORM-PRIVATE",
    "C-TENURE-NONE",
    "C-RENT-PRIVATE",
    "C-PAYMENT",
    "C-LATE-INTEREST",
    "C-COSTS",
    "C-INSPECTION",
    "C-KEYS",
    "C-MAINTENANCE-PRIVATE",
    "C-ACCESS",
    "C-RULES",
    "C-INSURANCE",
    "C-SUBLET-BAN-PRIVATE",
    "C-FORFEITURE-PRIVATE",
    "C-DISPUTE",
    "C-DISCLAIMER",
    "C-SIGNATURES",
  ]);
});

test("T3 (andrahand, JB12) byter hyres- och besittningsklausuler", () => {
  const list = ids(T3);
  assert.ok(list.includes("C-RENT-JB"));
  assert.ok(!list.includes("C-RENT-PRIVATE"));
  assert.ok(list.includes("C-TENURE-INFO"));
  assert.ok(!list.includes("C-TENURE-NONE"));
  assert.ok(list.includes("C-NOTICE-TENANT-STATUTORY"));
});

test("T6 (rum i egen bostad) genererar klausul om gemensamma utrymmen", () => {
  const list = ids(T6);
  assert.ok(list.includes("C-SHARED-AREAS"));
  assert.ok(list.includes("C-FURNISHING"));
  assert.ok(list.includes("C-TENURE-NONE"));
});

test("T9 genererar niomånadersklausulen, T10 gör det inte", () => {
  assert.ok(ids(T9).includes("C-TERM-FIXED-9M"));
  assert.ok(!ids(T10).includes("C-TERM-FIXED-9M"));
});

test("flera hyresgäster ger klausul om solidariskt ansvar", () => {
  const a = base({ tenants: [...T1.tenants, { ...emptyTenant(), name: "Cecilia Carlsson" }] });
  assert.ok(ids(a).includes("C-JOINT-LIABILITY"));
  assert.ok(!ids(T1).includes("C-JOINT-LIABILITY"));
});

test("saknat samtycke ger villkorsklausul i stället för bekräftelseklausul", () => {
  const a = base({ boardConsentObtained: "applied" });
  const list = ids(a);
  assert.ok(list.includes("C-CONSENT-PENDING"));
  assert.ok(!list.includes("C-CONSENT-GIVEN"));
});

test("uppsägningstexten skiljer sig mellan T1 och T3 — hela poängen med ombyggnaden", () => {
  const notice = (a: typeof T1) =>
    buildClauses(a, resolveLegalContext(a))
      .find((c) => c.id === "C-NOTICE")!
      .paragraphs.join(" ");
  const t1 = notice(T1);
  const t3 = notice(T3);
  // Siffran är densamma i båda regimerna sedan 1 juli 2026; det som skiljer
  // är vilken lag texten vilar på.
  assert.match(t1, /privatuthyrningslagen/);
  assert.ok(!/2012:978/.test(t1), "den upphävda lagen ska inte förekomma");
  assert.match(t3, /12 kap\. 4 §/);
  assert.notEqual(t1, t3);
});

test("inga platshållare lämnas kvar i renderad text", () => {
  for (const fixture of [T1, T3, T6, T9, T10]) {
    for (const clause of buildClauses(fixture, resolveLegalContext(fixture))) {
      assert.ok(
        !/\{\{|\}\}/.test(clause.paragraphs.join(" ")),
        `${clause.id} innehåller orenderad platshållare`
      );
    }
  }
});

test("klausulerna numreras löpande och i stigande ordning", () => {
  const clauses = buildClauses(T1, resolveLegalContext(T1));
  clauses.forEach((c, i) => assert.equal(c.number, i + 1));
});

test("C-NOTICE blir en läsbar mening när hyresvärden saknar uppsägningsrätt", () => {
  // Regression: mallen prefixade "Hyresvärden kan säga upp avtalet" och limmade
  // på describeNotice(), vilket vid unavailable gav en självmotsägande mening
  // med dubbel punkt.
  const first = buildClauses(T10, resolveLegalContext(T10))
    .find((c) => c.id === "C-NOTICE")!
    .paragraphs[0];
  assert.ok(!/kan säga upp avtalet Avtalet/.test(first), "hopklistrad mening");
  assert.ok(!/\.\./.test(first), "dubbel punkt");
  assert.match(first, /^Avtalet upphör vid hyrestidens slut\./);
});

test("C-NOTICE behåller den vanliga lydelsen när uppsägningsrätt finns", () => {
  const first = buildClauses(T1, resolveLegalContext(T1))
    .find((c) => c.id === "C-NOTICE")!
    .paragraphs[0];
  assert.match(first, /^Hyresvärden kan säga upp avtalet till det månadsskifte/);
  assert.ok(!/\.\./.test(first));
});

test("hyresklausulen påstår inte att nyttighetslistan är uttömmande", () => {
  // 2 kap. 1 § andra stycket säger "nyttigheter såsom …" — uppräkningen
  // exemplifierar. Det som begränsar är förbrukningsrekvisitet.
  const ctx = resolveLegalContext(T1);
  assert.ok(
    !/men inte för andra nyttigheter/.test(ctx.rentRule.principle),
    "får inte påstå att listan är stängd"
  );
  assert.match(ctx.rentRule.principle, /förbrukning/);
  assert.match(ctx.rentRule.principle, /skäligt belopp/);
});

test("ingen klausul under privatuthyrningslagen citerar hyreslagen på egen hand", () => {
  // Regimläckage: en klausul med regimneutralt condition renderar hyreslagens
  // regel i ett avtal där 12 kap. 1 c § JB säger att kapitlet inte gäller.
  // Två undantag är riktiga: C-LEGAL-REGIME förklarar själva lagvalet, och
  // C-ACCESS vilar på 4 kap. 7 § som uttryckligen tillämpar 12 kap. 26 § JB.
  const tillatna = new Set(["C-LEGAL-REGIME", "C-ACCESS"]);
  const lackage = buildClauses(T1, resolveLegalContext(T1))
    .filter((c) => /12 kap\./.test(c.legalBasis ?? ""))
    .map((c) => c.id)
    .filter((id) => !tillatna.has(id));
  assert.deepEqual(lackage, [], "klausuler citerar hyreslagen under fel regim");
});

test("förtida uppsägning under privatuthyrningslagen anger två veckor, inte en", () => {
  // 6 kap. 3 § första stycket 1. Hyreslagens 12 kap. 42 § säger en vecka.
  const text = buildClauses(T1, resolveLegalContext(T1))
    .find((c) => c.id === "C-FORFEITURE-PRIVATE")!
    .paragraphs.join(" ");
  assert.match(text, /mer än två veckor efter förfallodagen/);
  assert.ok(!/en vecka/.test(text));
  assert.ok(!/12 kap\. 43-44/.test(text), "återvinning saknar motsvarighet i nya lagen");
});
