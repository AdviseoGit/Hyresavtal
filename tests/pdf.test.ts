/** Rendering: dokumentet ska bära rätt lagreferens och rätt uppsägningstid (§13). */

import { test } from "node:test";
import assert from "node:assert/strict";

import { generateDocuments, generateCompletePdf } from "../src/lib/pdf/agreement";
import { resolveLegalContext } from "../src/lib/legal/regime";
import { agreementFileName } from "../src/lib/format";
import { T1, T3, T6 } from "./fixtures";

test("huvudavtal och bilagor genereras enligt svaren", async () => {
  const docs = await generateDocuments(T1, resolveLegalContext(T1));
  const parts = docs.map((d) => d.part);
  assert.deepEqual(parts, ["main", "inspection", "keys"]);
  for (const doc of docs) {
    assert.ok(doc.bytes.length > 500, `${doc.part} verkar tom`);
    assert.equal(Buffer.from(doc.bytes.slice(0, 5)).toString(), "%PDF-");
  }
});

test("möblerad bostad ger även inventarielista", async () => {
  const docs = await generateDocuments(T6, resolveLegalContext(T6));
  assert.ok(docs.some((d) => d.part === "inventory"));
});

test("avstående från besittningsskydd genereras inte utan feature-flagga", async () => {
  const docs = await generateDocuments(T3, resolveLegalContext(T3));
  assert.ok(!docs.some((d) => d.part === "tenure_waiver"));
});

test("komplett PDF slås ihop till ett dokument", async () => {
  const bytes = await generateCompletePdf(T1, resolveLegalContext(T1));
  assert.equal(Buffer.from(bytes.slice(0, 5)).toString(), "%PDF-");
});

test("filnamnet slugifieras enligt 8.4", () => {
  assert.equal(agreementFileName(T1), "hyresavtal-storgatan-1-2030-01-01.pdf");
  assert.equal(agreementFileName(T1, "-komplett"), "hyresavtal-storgatan-1-2030-01-01-komplett.pdf");
});
