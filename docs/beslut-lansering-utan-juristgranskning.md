# Beslut: lansering utan juristgranskning

**Datum:** 2026-08-31
**Beslutsfattare:** uppdragsgivaren (Adivseo AB)
**Berör:** kravspecifikation v1 §12, som kräver granskning av verksam jurist
innan klausultext går till produktion.

---

## Beslutet

Tjänsten lanseras med **maskinellt granskad** avtalstext. Ingen verksam jurist
har läst klausulerna. Beslutet fattades efter att invändningen framförts två
gånger, och är uppdragsgivarens att fatta.

Kravspecifikationens §12 är därmed **inte uppfylld**. Detta dokument finns för
att den avvikelsen ska vara skriven, daterad och sökbar — inte bortglömd.

## Hur det är genomfört i koden

Granskningsgrinden i `src/lib/legal/review.ts` är **inte** avstängd. Den
uppfylls i stället med granskningsposter som bär sin egen art:

```
reviewedBy:    "Maskinell granskning (Claude Opus 5) — ej verksam jurist"
reviewedAt:    "2026-08-31"
reviewVersion: "v1"
reviewKind:    "machine"
```

Fältet `reviewKind` skiljer `"machine"` från `"lawyer"`. `reviewStatus()`
redovisar båda talen separat, och bygggrinden skriver ut hur många klausuler
som saknar juristgranskning vid varje bygge. Skillnaden går alltså inte
förlorad, och en senare juristgranskning byter arten till `"lawyer"` klausul
för klausul.

`ALLOW_UNREVIEWED_CLAUSES` ska tas bort ur Railway. Grinden passerar nu på
egna meriter, och variabeln skulle bara dölja framtida ogranskade klausuler.

## Vad användaren får veta

Klausulen `C-DISCLAIMER` ligger sist i varje genererat avtal, före
underskrifterna, och säger att texten är maskinellt framtagen, maskinellt
kontrollerad mot lagtext och inte granskad av verksam jurist. Samma upplysning
står i rutan på förstasidan.

Den är formulerad som en **upplysning om ursprung**, inte som en
ansvarsfriskrivning. Fynd F36 i `docs/juristgranskning.md` pekar ut att en
friskrivning för fel i själva dokumentet sannolikt är utan verkan mot konsument
enligt avtalsvillkorslagen. Enligt 1 kap. 4 § privatuthyrningslagen är villkor
till hyresgästens nackdel dessutom utan verkan oavsett lydelse. En sann
upplysning bär längre än ett undantag som inte håller.

## Vad granskningen faktiskt omfattat

Tre pass, alla maskinella:

| Pass | Omfattning | Utfall |
|---|---|---|
| 1 (2026-08-30) | klausultext | 46 fynd — men **utan nätåtkomst**, ingen paragraf lästes i författningstext |
| 2 (2026-08-31) | klausultext, källverifierad | missade lagen var upphävd i pass 1; 8 av 10 tidigare `Fel` stod sig, 12 nya fynd |
| 3 (2026-08-31) | ombyggnaden, adversariellt | 22 fynd, varav 4 höga och 2 regressioner införda samma dag |

Rapporterna ligger i `docs/juristgranskning.md`, `docs/atgardslista.md` och
`docs/granskning-ombyggnad.md`.

## Kända kvarvarande fynd

De fyra höga fynden från pass 3 är åtgärdade. **Arton fynd av grad medel och
låg är inte åtgärdade** vid lanseringen. Bland dem:

- Tomt formulär ger regimen `PRIVATE_2026_772` med en positiv motivering som
  skrivs in i avtalet.
- `holiday_home` utlöser fritidsundantaget ensamt, utan att `purpose` prövas.
- Ett hyresbelopp om 0 kr godtas, trots att 1 kap. 1 § kräver upplåtelse "mot
  ersättning".
- 1 kap. 3 § andra stycket (undantagets bestående verkan) är inte modellerat.
- Nio namngivna luckor i testsviten.

Se `docs/granskning-ombyggnad.md` för fullständig förteckning.

## Observation om felfrekvensen

Värd att notera för den som senare läser det här: antalet fynd hade inte planat
ut när lanseringsbeslutet fattades. Pass 1 missade att den tillämpliga lagen var
upphävd. Pass 3 fann två fel i kod som pass 2 hade passerat. Ytterligare pass
kan förväntas hitta mer.

---

*Detta dokument beskriver ett affärsbeslut och dess tekniska genomförande. Det
utgör inte juridisk rådgivning.*
