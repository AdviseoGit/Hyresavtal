/**
 * Bygggrind för §12: avbryter bygget om klausulregistret innehåller
 * ogranskad text. Sätt ALLOW_UNREVIEWED_CLAUSES=1 för att bygga ändå
 * (utveckling, förhandsvisning och juristgranskning).
 *
 * Körs via npm run prebuild och läser den TypeScript-kompilerade modulen.
 */

import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

execFileSync("npx", ["tsc", "-p", "tsconfig.test.json"], { stdio: "inherit" });

const { reviewStatus } = require("../.test-build/src/lib/legal/review.js");
const status = reviewStatus();

console.log(
  `Juristgranskning: ${status.reviewed}/${status.total} klausuler granskade (krav: ${status.requiredVersion}).`
);

if (status.unreviewed.length === 0) process.exit(0);

if (status.allowUnreviewed) {
  console.warn(
    `VARNING: bygger med ${status.unreviewed.length} ogranskade klausuler eftersom ALLOW_UNREVIEWED_CLAUSES=1 är satt. Detta bygge får inte gå till produktion.`
  );
  process.exit(0);
}

console.error(
  `\nBygget avbrutet: följande klausuler saknar juristgranskning enligt kravspecifikation §12:\n  ${status.unreviewed.join("\n  ")}\n\n` +
    `Sätt reviewedBy, reviewedAt och reviewVersion="${status.requiredVersion}" i src/lib/legal/clauses.ts,\n` +
    `eller kör med ALLOW_UNREVIEWED_CLAUSES=1 för ett bygge som inte går till produktion.`
);
process.exit(1);
