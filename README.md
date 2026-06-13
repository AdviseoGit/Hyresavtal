# Hyresavtal MVP

Next.js-app som genererar ett juridiskt korrekt **utkast till hyresavtal** (bostad)
från ett guidat formulär. Avtalet byggs som PDF (pdf-lib) och grundas i bestämmelserna
i 12 kap. jordabalken (hyreslagen).

## Teknik
- Next.js 14 (App Router) + TypeScript + Tailwind
- pdf-lib för PDF-generering (deterministiskt, ingen LLM)
- Juridisk grund i `src/data/legal_database.json` (9 klausuler ur JB 12 kap)

## Utveckling
```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Struktur
- `src/app/page.tsx` – landningssida + formulär
- `src/components/AgreementForm.tsx` – guidat 3-stegsformulär (kräver godkända villkor)
- `src/app/api/generate-agreement/route.ts` – bygger PDF:en utifrån formulärdata + klausuler
- `src/app/villkor/page.tsx` – användarvillkor & ansvarsfriskrivning
- `src/data/legal_database.json` – klausuldatabas (JB 12 kap)

## Ansvarsfriskrivning
Tjänsten skapar ett utkast och utgör inte juridisk rådgivning. Se `/villkor`.
Bygg-tooling ligger medvetet under `dependencies` (inte `devDependencies`)
eftersom Railway bygger med `NODE_ENV=production`, vilket annars hoppar över devDeps.
