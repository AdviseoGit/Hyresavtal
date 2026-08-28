/**
 * §13, sista stycket: dokumentet ska bära rätt lagreferens och rätt
 * uppsägningstid. Texten läses ur den genererade PDF:en i stället för via
 * webbläsare — samma påstående, utan beroende av en E2E-runner.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { inflateSync } from "node:zlib";

import { generateCompletePdf } from "../src/lib/pdf/agreement";
import { resolveLegalContext } from "../src/lib/legal/regime";
import { T1, T3 } from "./fixtures";

/** Plockar ut textinnehållet ur PDF:ens komprimerade strömmar. */
function extractPdfText(bytes: Uint8Array): string {
  const buf = Buffer.from(bytes);
  let out = "";
  let index = 0;
  for (;;) {
    const start = buf.indexOf("stream", index);
    if (start === -1) break;
    const end = buf.indexOf("endstream", start);
    if (end === -1) break;
    let from = start + "stream".length;
    while (buf[from] === 0x0d || buf[from] === 0x0a) from++;
    const chunk = buf.subarray(from, end);
    try {
      out += inflateSync(chunk).toString("latin1");
    } catch {
      out += chunk.toString("latin1");
    }
    index = end + "endstream".length;
  }
  return decodeStrings(out);
}

/** pdf-lib skriver texten som hexsträngar: <48454A> Tj. */
function decodeStrings(content: string): string {
  const hex = content.replace(/<([0-9A-Fa-f\s]+)>\s*Tj/g, (_m, body: string) =>
    Buffer.from(body.replace(/\s+/g, ""), "hex").toString("latin1")
  );
  return hex.replace(/\(((?:\\.|[^\\)])*)\)\s*Tj/g, (_m, body: string) => body.replace(/\\(.)/g, "$1"));
}

async function textFor(a: typeof T1): Promise<string> {
  return extractPdfText(await generateCompletePdf(a, resolveLegalContext(a)));
}

test("T1: dokumentet anger lagen om uthyrning av egen bostad och en månads uppsägningstid", async () => {
  const text = await textFor(T1);
  assert.match(text, /lagen \(2012:978\)/);
  assert.match(text, /tidigast en m/);
  assert.ok(!/12 kap\. 4 §/.test(text), "JB-uppsägningstiden ska inte förekomma");
});

test("T3: dokumentet anger jordabalken och tre månaders uppsägningstid", async () => {
  const text = await textFor(T3);
  assert.match(text, /regleras av 12 kap\. jordabalken/);
  assert.match(text, /tidigast 3 m/);
  assert.ok(!/regleras av lagen \(2012:978\)/.test(text));
});

test("bilagorna följer med i den kompletta PDF:en", async () => {
  const text = await textFor(T1);
  assert.match(text, /BESIKTNINGSPROTOKOLL/);
  assert.match(text, /NYCKELKVITTENS/);
});

test("sidfoten har sidnumrering och paraferingsrad", async () => {
  const text = await textFor(T1);
  assert.match(text, /sida 1 av/);
  assert.match(text, /Parafering/);
});
