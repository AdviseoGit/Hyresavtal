# Hyresavtal.nu

Next.js-app som skapar ett **utkast till hyresavtal** för bostad från ett guidat
formulär i tio steg. Tjänsten avgör först vilken lag som gäller för uthyrningen och
bygger avtalet därefter.

Implementerad enligt kravspecifikation v1 (2026-08-20). Paragrafhänvisningar nedan
avser den specifikationen.

## Varför lagvalet är kärnan

När en privatperson hyr ut sin egen bostad gäller oftast **lagen (2012:978) om
uthyrning av egen bostad** — inte 12 kap. jordabalken. Skillnaden är stor: en månads
uppsägningstid för hyresgästen i stället för tre, inget besittningsskydd, och en
kostnadsbaserad hyra i stället för bruksvärdesprincipen. Lagvalet avgörs i steg 1 och
styr sedan uppsägningstider, besittningsskydd, hyresklausul, varningar och vilka steg
som visas.

## Arkitektur (§3)

```
AnswerSet (src/lib/types.ts)
        ↓
resolveLegalContext()      src/lib/legal/regime.ts   — ren funktion, tungt testad
        ↓
LegalContext { regime, noticePeriods, securityOfTenure, rentRule, warnings[] }
        ↓
buildClauses()             src/lib/legal/clauses.ts  — avtalet som Clause[]
        ↓
renderAgreement()          src/lib/pdf/agreement.ts  — PDF + bilagor
```

`regime.ts` och `clauses.ts` har inga React-beroenden och körs i Node under test.
UI läser resultatet, aldrig tvärtom.

## Utveckling

```bash
npm install
npm run dev                                  # http://localhost:3000
npm test                                     # 57 tester, inkl. acceptansfallen T1-T10
ALLOW_UNREVIEWED_CLAUSES=1 npm run build     # se granskningsgrinden nedan
```

## Granskningsgrind (§12)

Ingen klausultext får renderas i produktion innan en jurist granskat den.
Granskningsstatus ligger som metadata per klausul i `src/lib/legal/clauses.ts`
(`reviewedBy`, `reviewedAt`, `reviewVersion`). `npm run build` avbryts om något är
ogranskat, och API:et svarar 503. Sätt `ALLOW_UNREVIEWED_CLAUSES=1` för utveckling,
förhandsvisning och själva granskningsarbetet — aldrig i produktion.

```bash
npm run check:legal-review
```

## Miljövariabler

Se `.env.example`. `NEXT_PUBLIC_SITE_*` fyller i personuppgiftsansvarig, org.nr och
kontaktuppgift i sidfot, villkor och integritetspolicy (§11); saknade värden visas som
"uppgift saknas" i stället för att tyst utelämnas. `FEATURE_TENURE_WAIVER` styr bilagan
om avstående från besittningsskydd och är av tills juridiken granskats (4.4).

## Struktur

- `src/lib/types.ts` – datamodellen (§5)
- `src/lib/legal/regime.ts` – lagvalsmotorn, uppsägningstider, besittningsskydd, varningar (§4, §9)
- `src/lib/legal/clauses.ts` – klausulregistret med villkor, lagrum och granskningsstatus (§8.2)
- `src/lib/legal/review.ts` – granskningsgrinden (§12)
- `src/lib/validation.ts` – validering per fält och steg (§6)
- `src/lib/steps.ts` – flödet och vilka steg som visas (§7)
- `src/lib/draft.ts` – utkast i localStorage, 30 dagars TTL (§7, §11)
- `src/lib/pdf/` – A4-layout och dokumentgenerering med bilagor (§8.4)
- `src/components/` – formuläret, stegen och fältprimitiverna
- `src/app/api/generate-agreement/route.ts` – validerar, renderar och returnerar PDF utan lagring
- `src/data/legal_database.json` – ursprunglig klausuldatabas ur JB 12 kap. Klausultexten
  bor numera i klausulregistret; filen behålls som källmaterial.

## Kvar att göra

- **Juristgranskning (§12).** Ingen klausultext är granskad. Beslutstabellen (4.2),
  uppsägningstiderna (4.3), besittningsskyddet (4.4) och ansvarsfriskrivningen behöver
  gås igenom innan produktion.
- Hyreskalkylator med marknadsvärde (4.5) — medvetet uppskjuten till v2.
- `auto_renew_indefinite`: övergången från bestämd tid till tillsvidare byter
  uppsägningsregim och hanteras i v2 (§15).

## Ansvarsfriskrivning

Tjänsten skapar ett utkast och utgör inte juridisk rådgivning. Se `/villkor` och
`/integritetspolicy`. Bygg-tooling ligger medvetet under `dependencies` (inte
`devDependencies`) eftersom Railway bygger med `NODE_ENV=production`, vilket annars
hoppar över devDeps.
