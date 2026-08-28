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

test("T1 (lagen om uthyrning av egen bostad) ger förväntad klausullista", () => {
  assert.deepEqual(ids(T1), [
    "C-PARTIES",
    "C-OBJECT",
    "C-LEGAL-REGIME",
    "C-CONSENT-GIVEN",
    "C-TERM-INDEFINITE",
    "C-NOTICE",
    "C-NOTICE-FORM",
    "C-TENURE-NONE",
    "C-RENT-PRIVATE",
    "C-PAYMENT",
    "C-LATE-INTEREST",
    "C-COSTS",
    "C-INSPECTION",
    "C-KEYS",
    "C-MAINTENANCE",
    "C-ACCESS",
    "C-RULES",
    "C-INSURANCE",
    "C-SUBLET-BAN",
    "C-FORFEITURE",
    "C-DISPUTE",
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
  assert.match(t1, /tidigast en månad/);
  assert.match(t1, /lagen \(2012:978\)/);
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
