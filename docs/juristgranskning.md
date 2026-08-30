# Juristgranskning — förgranskning av avtalstexten

**Granskningsobjekt:** `src/lib/legal/clauses.ts`, `src/lib/legal/regime.ts`,
`src/app/villkor/page.tsx`, `src/lib/pdf/agreement.ts`
**Referensdokument:** kravspecifikation v1 (`SPEC_1.md`, daterad 2026-08-20) — läst som
partens påstående, inte som facit
**Datum för granskningen:** 2026-08-30
**Granskningsomgång:** ingen — samtliga 33 klausuler har tomt `review`-objekt

---

## 1. Sammanfattning

| Mått | Antal |
|---|---|
| Klausuler i registret | 33 |
| Bedömda `OK` | 7 |
| Bedömda `Anmärkning` | 14 |
| Bedömda `Fel` | 10 |
| Bedömda `Kan inte bedömas` | 2 |

| Fynd per allvarlighetsgrad | Antal |
|---|---|
| Hög | 10 |
| Medel | 21 |
| Låg | 15 |
| **Summa fynd** | **46** |

Fynden fördelar sig på klausulregistret (F1–F33), varningssystemet (F34–F35),
ansvarsfriskrivningen (F36–F41) och bilagorna (F42–F46).

De fem tyngsta fynden, i prioriteringsordning:

1. **F13** — `rooms === 1 && furnished !== 'none'` likställer en möblerad etta med
   "möblerat rum" i 12 kap. 45 § första stycket 2 JB. Avtalet talar då om för en
   hyresgäst med fullt besittningsskydd att skyddet saknas i nio månader.
2. **F17** — `C-FORFEITURE` räknar upp förverkandegrunder utan rättelse- och
   tillsägelsemomentet och utan ringa-ventilen i 12 kap. 42 §.
3. **F8** — `C-NOTICE-FORM` återger rekommenderat brev-presumtionen i 12 kap. 8 §
   symmetriskt och utan villkor. Den gäller inte i alla de fall klausulen påstår.
4. **F7** — nio-månadersregeln i 12 kap. 3 § andra stycket prövas mot den avtalade
   *hyrestiden* i stället för mot hur länge *hyresförhållandet* varat. Vid
   `auto_renew_same` faller uppsägningsplikten bort helt.
5. **F36** — ansvarsfriskrivningen i `/villkor` §5 friskriver från fel i själva
   dokumentet. Det är precis den lydelse specens §12.5 pekar ut som sannolikt
   ohållbar mot konsument, och den är oförändrad.

Registret innehåller också ett antal klausuler som håller: `C-SHARED-AREAS`,
`C-CONSENT-GIVEN`, `C-TERM-INDEFINITE`, `C-LATE-INTEREST`, `C-INSURANCE`,
`C-DISPUTE` och `C-SIGNATURES`. Lagvalstabellen i 4.2, uppsägningstiderna i båda
regimerna och avgränsningen av nio-månadersregeln till JB12 är i sina grunddrag
riktiga — se avsnitt 3.

---

## 2. Verifieringsläge — vad som faktiskt kontrollerats mot källa

**Ingen paragraf i denna rapport har kunnat läsas i sin författningstext.**

Nätåtkomsten i den här körningen släpper inte igenom någon av de källor som
publicerar lagtext. Följande domäner svarade `403` på CONNECT genom egress-proxyn,
både via `curl` och via WebFetch:

`lagen.nu`, `www.riksdagen.se`, `data.riksdagen.se`, `rkrattsbaser.gov.se`,
`svenskforfattningssamling.se`, `www.notisum.se`, `www.hyresnamnden.se`,
`www.boverket.se`, `www.lagar.se`, `www.sjobodar.se`, `sv.wikisource.org`.

Endast websökning fungerade. Den returnerar en sammanfattning som en språkmodell
skrivit utifrån sekundärkällor (Lawline, Familjens jurist, Bostadsrätterna,
propositioner, uppsatser) — inte författningstext. Sådana träffar markeras nedan
**[sek]** och ska betraktas som en indikation, inte som en kontroll. Lagrum utan
markering, eller markerade **[ej kontrollerat]**, bygger enbart på modellens minne
och koden själv och **måste** slås upp av en människa.

### 2.1 Lagrum jag kunnat styrka på sekundärnivå [sek]

| Lagrum | Vad källan sade | Bäring |
|---|---|---|
| 12 kap. 1 § femte stycket JB | förbehåll som strider mot kapitlet är utan verkan mot hyresgästen om inte annat anges | grund för hela tvingandeanalysen |
| 12 kap. 4 § första stycket JB | bostadslägenhet: månadsskifte närmast efter tre månader | `JB_INDEFINITE` stämmer |
| 12 kap. 4 § andra stycket JB | längst två veckor → 1 dag, > 2 veckor–3 mån → 1 vecka, > 3 mån → 3 månader | `jbFixedTermNotice` stämmer |
| 12 kap. 5 § JB | hyresgästen får alltid säga upp till månadsskifte tidigast tre månader bort, även vid bestämd tid | `C-NOTICE-TENANT-STATUTORY` stämmer i sak |
| 12 kap. 8 § JB | skriftlighet krävs först när hyresförhållandet varat > 3 mån i följd; muntlig uppsägning från hyresgästen duger med skriftligt erkännande; rekommenderat brev-presumtionen gäller inte vid förtida uppsägning enligt 42 § eller uppsägning enligt 58 § och förutsätter hemvist i landet | grund för F8 |
| 12 kap. 19 § JB | indexklausul för bostad kräver bestämd hyrestid om minst tre år, annars utan verkan | grund för F19 |
| 12 kap. 20 § JB | dispositiv förfallodag "sista vardagen före varje kalendermånads början"; högst en månads förskott för bostadslägenhet | stöder `paymentDueRule`-defaulten och W-PREPAID |
| 12 kap. 42 § JB | olovlig andrahandsupplåtelse, vanvård och störningar förutsätter att rättelse inte sker efter tillsägelse; hyresrätten är inte förverkad om det som ligger hyresgästen till last är av ringa betydelse | grund för F17 |
| 12 kap. 45 § första stycket JB | p. 1 andrahandsupplåtelse av lägenhet **i dess helhet**, < 2 år; p. 2 möblerat rum eller lägenhet för fritidsändamål, < 9 mån; p. 3 del av upplåtarens egen bostad. "Möblerat rum" beskrevs som bostad som hyrs möblerad och **inte** kan anses vara en bostadslägenhet i vanlig mening, dvs. utan eget kök/kokvrå och sanitetsutrymme | grund för F13, F14, F15 |
| 12 kap. 45 a § JB | huvudregel: hyresnämndens godkännande; undantagen ligger i samma stycke; nämnden godkänner normalt bara avstående som upphör inom fyra år från tillträdet; kravet på särskilt upprättad handling tillämpas strikt och handlingen måste vara skild från hyresavtalet | grund för F42 |
| 3 § lagen (2012:978) | hyresgäst en månad, hyresvärd tre månader, båda till månadsskifte | `PRIVATE_TENANT` / `PRIVATE_LANDLORD` stämmer |
| 2 § lagen (2012:978) | villkor som är till nackdel för hyresgästen är utan verkan | grund för tvingandeanalysen under privatuthyrningslagen |

### 2.2 Lagrum jag **inte** kunnat kontrollera mot någon källa [ej kontrollerat]

Dessa åberopas i koden eller i rapporten men har inte kunnat verifieras i den här
körningen. De ska slås upp innan något beslutas på dem:

- **12 kap. 3 § andra stycket JB** (nio-månadersregeln) — själva regeln bekräftas
  indirekt av flera sekundärkällor, men lydelsen och styckesindelningen är inte läst.
- **12 kap. 15 § JB** (hyresvärdens underhållsskyldighet).
- **12 kap. 24 § JB** (hyresgästens vårdplikt och culparekvisitet) — hela F21 och F22
  hänger på att 24 § kräver vållande/vårdslöshet. Kontrollera lydelsen.
- **12 kap. 26 § JB** (tillträde, "nödvändig tillsyn", visningsskyldighet, varsel).
- **12 kap. 39–40 §§ JB** (andrahandsupplåtelse och hyresnämndens tillstånd).
- **12 kap. 41 § JB** (rätten att inrymma utomstående).
- **12 kap. 43–44 §§ JB** (uppsägningsfrist respektive återvinning, underrättelse till
  socialnämnden, treveckorsfristen).
- **12 kap. 46 § JB** (förlängningsrätten).
- **12 kap. 55 § JB** (bruksvärde och andrahandstaket) samt frågan om 15-procentspåslaget
  är lag eller praxis.
- **Straffbestämmelsen om oskälig andrahandshyra** — jag vet inte paragrafnumret och
  gissar det inte. `W-RENT-CRIMINAL` anger inget lagrum alls; ett bör läggas till när
  numret är kontrollerat.
- **1 § lagen (2012:978)**, inklusive tredje stycket om att 12 kap. JB gäller
  subsidiärt, och andra stycket om att lagen bara gäller den första upplåtelsen.
- **3 a § lagen (2012:978)** — se F2. Sekundärkällorna är motstridiga.
- **4 § lagen (2012:978)** (kostnadsbaserad hyra, ingen retroaktiv återbetalning).
- **6 § räntelagen (1975:635)** — referensränta + åtta procentenheter. Inte kontrollerad,
  men klausulen är den enda i registret jag inte har någon invändning mot i sak.
- **7 kap. 10–11 §§ bostadsrättslagen** (styrelsens samtycke, hyresnämndens tillstånd).
- **Lagen (1994:1512) om avtalsvillkor i konsumentförhållanden** och **36 § avtalslagen** —
  avsnitt 8 bygger på dessa utan att lydelsen kontrollerats.

---

## 3. Vad som stämmer

Detta är inte ett godkännande, men det som håller ska inte tas om.

- **Beslutstabellen (4.2).** Ordningen `näringsverksamhet → hyresrätt i andra hand →
  fritidsändamål → inte första upplåtelsen → privatuthyrningslagen` motsvarar
  strukturen i 1 § lagen (2012:978). Att `propertyType === 'holiday_home'` *inte* i sig
  styr regimvalet, utan bara `purpose === 'leisure'`, är riktigt — lagen knyter an till
  ändamålet, inte byggnadstypen. `room_in_own_home` hålls korrekt utanför regimvalet och
  slår i stället ut besittningsskyddet separat, precis som specens implementationsnot säger.
- **Uppsägningstiderna, båda regimerna.** `PRIVATE_TENANT` = 1 månad till månadsskifte,
  `PRIVATE_LANDLORD` = 3 månader till månadsskifte, `JB_INDEFINITE` = 3 månader till
  månadsskifte för båda parter, och trappan 1 dag / 1 vecka / 3 månader för JB12 på
  bestämd tid. Samtliga fyra stämmer mot [sek]-källorna för 3 § lagen (2012:978) och
  12 kap. 4 §. Att 3 § tillämpas även på avtal med bestämd tid, så att båda parter kan
  säga upp i förtid, är riktigt.
- **Att 12 kap. 5 § inte flaggas under privatuthyrningslagen.** `tenantStatutoryThreeMonths`
  sätts till `false` för `PRIVATE_2012_978`, och det är rätt slutsats — men av ett annat
  skäl än koden antyder. Hyresgästens rätt enligt 3 § är *bättre* (en månad) än 12 kap. 5 §
  (tre månader), och 3 § är därför "annat föreskrivet" i den mening 1 § tredje stycket
  lagen (2012:978) avser. Att generera en klausul om en tremånadersrätt vore direkt
  vilseledande. Skriv ned resonemanget som kodkommentar — i dag står det bara `false`.
- **Att nio-månadersregeln bara gäller JB12.** `requiresNoticeToEnd` kräver
  `regime === 'JB12'`. Riktigt: 3 § lagen (2012:978) säger att avtal på bestämd tid
  upphör vid hyrestidens slut, vilket tränger undan 12 kap. 3 § andra stycket.
- **Att bilagorna är egna handlingar.** `generateDocuments` bygger fyra separata PDF:er
  och bakar aldrig in avståendet från besittningsskydd som ett avsnitt i huvudavtalet.
  Det är rätt hanterat enligt formkravet i 12 kap. 45 a §.
- **Granskningsgrinden.** `assertClausesReviewed()` kastar i API-routen så länge någon
  klausul saknar `reviewedBy` / `reviewedAt` / `reviewVersion === "v1"`. Alla 33 saknar
  det i dag, vilket är den korrekta statusen. **Rör inte fälten.**

---

## 4. Klausultabell

| # | Klausul-id | Bedömning | Fynd |
|---|---|---|---|
| 1 | `C-PARTIES` | Anmärkning | F30 |
| 2 | `C-JOINT-LIABILITY` | Anmärkning | F28 |
| 3 | `C-OBJECT` | Anmärkning | F30 |
| 4 | `C-SHARED-AREAS` | OK | — |
| 5 | `C-FURNISHING` | Anmärkning | F29 |
| 6 | `C-LEGAL-REGIME` | **Fel** | F1 |
| 7 | `C-CONSENT-PENDING` | **Fel** | F24, F25 |
| 8 | `C-CONSENT-GIVEN` | OK | — |
| 9 | `C-TERM-INDEFINITE` | OK | — |
| 10 | `C-TERM-FIXED` | **Fel** | F7 |
| 11 | `C-TERM-FIXED-9M` | Anmärkning | F7, F9 |
| 12 | `C-NOTICE` | Anmärkning | F4, F5, F6, F10 |
| 13 | `C-NOTICE-TENANT-STATUTORY` | Anmärkning | F5 |
| 14 | `C-NOTICE-FORM` | **Fel** | F8 |
| 15 | `C-TENURE-NONE` | Kan inte bedömas | F2 |
| 16 | `C-TENURE-INFO` | **Fel** | F13, F14, F15, F16 |
| 17 | `C-RENT-PRIVATE` | Kan inte bedömas | F20 |
| 18 | `C-RENT-JB` | Anmärkning | F21 |
| 19 | `C-RENT-ADJUST` | **Fel** | F19 |
| 20 | `C-PAYMENT` | Anmärkning | F23 |
| 21 | `C-LATE-INTEREST` | OK | — |
| 22 | `C-COSTS` | Anmärkning | F22 |
| 23 | `C-DEPOSIT` | Anmärkning | F30 |
| 24 | `C-INSPECTION` | **Fel** | F27 |
| 25 | `C-KEYS` | **Fel** | F32 |
| 26 | `C-MAINTENANCE` | **Fel** | F31 |
| 27 | `C-ACCESS` | Anmärkning | F33 |
| 28 | `C-RULES` | Anmärkning | F26 |
| 29 | `C-INSURANCE` | OK | — |
| 30 | `C-SUBLET-BAN` | Anmärkning | F18 |
| 31 | `C-FORFEITURE` | **Fel** | F17 |
| 32 | `C-DISPUTE` | OK | — |
| 33 | `C-SIGNATURES` | OK | — |

---

## 5. Fynd — lagval och regimblandning

### F1 — `C-LEGAL-REGIME` döljer att 12 kap. JB gäller subsidiärt

**Allvarlighetsgrad:** Hög
**Fil:** `src/lib/legal/clauses.ts:321-330`, samma problem i `src/lib/pdf/agreement.ts:31`

Klausulen skriver "På detta avtal tillämpas {{regimeName}}", vilket under
`PRIVATE_2012_978` blir "På detta avtal tillämpas lagen (2012:978) om uthyrning av egen
bostad" — punkt. Men avtalet innehåller i samma dokument sex klausuler som bygger på
12 kap. jordabalken och som renderas under båda regimerna: `C-NOTICE-FORM` (8 §),
`C-MAINTENANCE` (24 §), `C-ACCESS` (26 §), `C-SUBLET-BAN` (39 §), `C-FORFEITURE` (42 §)
och `C-TERM-FIXED-9M` (3 §, dock bara JB12).

Det är inte fel att generera dem — 12 kap. gäller subsidiärt enligt 1 § tredje stycket
lagen (2012:978) [ej kontrollerat] — men läsaren får inte veta att kapitlet alls
tillämpas. En hyresgäst som vill förstå sin ställning enligt förverkandeklausulen blir
hänvisad till fel lag.

**Lagrum som talar emot:** 1 § tredje stycket lagen (2012:978) om uthyrning av egen
bostad [ej kontrollerat].

**Textförslag** (första stycket, endast under `PRIVATE_2012_978`):

> På detta avtal tillämpas lagen (2012:978) om uthyrning av egen bostad. {{regimeExplanation}}
> I den mån den lagen inte reglerar en fråga gäller i stället 12 kap. jordabalken
> (hyreslagen). De klausuler i detta avtal som anger ett lagrum ur 12 kap. jordabalken
> bygger på det förhållandet.

Motsvarande rad i `renderAgreement` ("Detta avtal regleras av …") behöver samma tillägg.

### F2 — Lagrummet "3 a § lagen (2012:978)" kunde inte verifieras

**Allvarlighetsgrad:** Hög (som verifieringslucka)
**Fil:** `src/lib/legal/regime.ts:252-258`, renderas i `C-TENURE-NONE`

Koden anger `3 a § lagen (2012:978)` som grund för att hyresgästen inte har rätt till
förlängning. Sekundärkällorna motsäger varandra: en beskriver att rätten till
förlängning saknas enligt **3 §** och att **3 a §** (införd 1 januari 2022 genom
prop. 2020/21:201) i stället handlar om att hyresgästen inte har rätt till *nytt*
hyresavtal enligt 12 kap. 46 a § JB. En annan beskriver 3 a § som besittningsskyddsregeln.

Jag gissar inte. Det här lagrummet trycks i varje avtal som genereras under
privatuthyrningslagen och måste slås upp i författningstexten innan något beslutas.

**Lagrum att kontrollera:** 3 § och 3 a § lagen (2012:978), i lydelse efter SFS 2021:1102/1103.

**Åtgärd:** slå upp båda paragraferna, sätt rätt hänvisning i
`resolveSecurityOfTenure`, och lägg till en `legalBasis` på `C-TENURE-NONE` som i dag
saknar sådan (den ärver texten via `{{tenureLegalBasis}}` men har ingen egen
`legalBasis`-rad i PDF-noten).

### F3 — `privateRentalOrdinal` ställer en annan fråga än den koden svarar på

**Allvarlighetsgrad:** Medel
**Fil:** `src/lib/legal/regime.ts:143-150`

Specens §4.1 formulerar UI-frågan som "Hyr du ut fler än en bostad privat **just nu**?",
medan `reason`-texten i koden lyder "Detta är inte den första bostaden du hyr ut privat".
Det är inte samma sak. En uthyrare som hyrt ut tidigare men bara har en pågående
upplåtelse svarar olika på de två frågorna, och lagvalet blir olika.

**Lagrum:** 1 § andra stycket lagen (2012:978) — "Om fler än en lägenhet upplåts, gäller
lagen endast den första upplåtelsen" [ej kontrollerat]. Ordet *upplåts* talar för att det
är samtidiga upplåtelser som avses, men det behöver kontrolleras mot förarbetena.

**Textförslag** (`reason` för regel 4):

> Du har mer än en pågående privat uthyrning. Lagen om uthyrning av egen bostad gäller
> bara den först ingångna av dem; för detta avtal gäller därför 12 kap. jordabalken.

---

## 6. Fynd — uppsägningstider och uppsägningsform

### F4 — `{{noticeLegalBasis}}` anger bara hyresvärdens lagrum

**Allvarlighetsgrad:** Medel
**Fil:** `src/lib/legal/clauses.ts:208`, `383-392`

`noticeLegalBasis` sätts till `ctx.noticePeriods.landlord.legalBasis`, men meningen i
`C-NOTICE` lyder "Uppsägningstiderna följer {{noticeLegalBasis}}" — plural. Under JB12
tillsvidare är hyresvärdens grund 12 kap. 4 § första stycket medan hyresgästens
tvingande rätt följer av 12 kap. 5 §. Under `PRIVATE_2012_978` med avtalad förlängning
blir strängen dessutom "3 § lagen (2012:978) om uthyrning av egen bostad, avtalad
förlängning", vilket ger meningen "Uppsägningstiderna följer 3 § lagen (2012:978) om
uthyrning av egen bostad, avtalad förlängning." — ogrammatiskt och missvisande, eftersom
förlängningen är avtalad och inte följer av lagen.

**Textförslag:** dela upp i två platshållare och skriv ut båda:

> Hyresvärden kan säga upp avtalet {{noticeLandlord}}. Detta följer av {{noticeLegalBasisLandlord}}.
> Hyresgästen kan säga upp avtalet {{noticeTenant}}. Detta följer av {{noticeLegalBasisTenant}}.

och låt `applyExtendedNotice` sätta ett eget fält (`extended: true`) i stället för att
skriva in ", avtalad förlängning" i lagrumssträngen. Lägg i så fall till en mening:
"Parterna har avtalat om längre uppsägningstid för hyresvärden än vad lagen kräver."

### F5 — `C-NOTICE` och `C-NOTICE-TENANT-STATUTORY` motsäger varandra vid korta hyrestider

**Allvarlighetsgrad:** Medel
**Fil:** `src/lib/legal/regime.ts:218-227`, `src/lib/legal/clauses.ts:383-402`

Vid JB12 och bestämd tid sätts `tenantStatutoryThreeMonths: true` oavsett hyrestidens
längd. Ett avtal på två veckor genererar då både:

- `C-NOTICE`: "Hyresgästen kan säga upp avtalet senast en dag före hyrestidens utgång."
- `C-NOTICE-TENANT-STATUTORY`: "Hyresgästen har alltid rätt att säga upp avtalet till det
  månadsskifte som inträffar tidigast tre månader från uppsägningen …"

De två sakerna är inte oförenliga i juridisk mening — 12 kap. 4 § andra stycket handlar
om uppsägning *till hyrestidens utgång* och 5 § om en självständig rätt att säga upp *i
förtid* — men avtalet förklarar inte skillnaden, och för ett tvåveckorsavtal framstår
tremånadersrätten som meningslös.

**Textförslag** (`C-NOTICE-TENANT-STATUTORY`, nytt inledande led):

> Utöver vad som anges ovan om uppsägning till hyrestidens utgång gäller följande.
> Hyresgästen har alltid rätt att säga upp avtalet i förtid, till det månadsskifte som
> inträffar tidigast tre månader från uppsägningen, även om avtalet löper på bestämd tid.
> Denna rätt kan inte avtalas bort och gäller även om avtalet i övrigt föreskriver en
> kortare eller längre uppsägningstid.

### F6 — Hyresvärdens uppsägningsrätt vid bestämd tid framställs som fri

**Allvarlighetsgrad:** Medel
**Fil:** `src/lib/legal/regime.ts:218-227`

För JB12 + bestämd tid får hyresvärden samma `NoticePeriod` som hyresgästen, och
`C-NOTICE` skriver "Hyresvärden kan säga upp avtalet senast tre månader före hyrestidens
utgång." Formuleringen är korrekt så länge man läser den som uppsägning *till*
hyrestidens utgång, men i ett dokument som en privatperson läser kan den lätt uppfattas
som en rätt att när som helst säga upp med tre månaders varsel. Under JB12 har
hyresvärden ingen sådan rätt vid bestämd tid, och om hyresgästen har besittningsskydd
krävs dessutom förlängningstvist enligt 12 kap. 46 § [ej kontrollerat].

**Textförslag** (nytt stycke i `C-NOTICE`, bara vid `contractType === 'fixed'` och JB12):

> Hyresvärden kan inte säga upp avtalet till upphörande före hyrestidens utgång annat än
> om hyresrätten är förverkad. Uppsägningen ovan avser uppsägning till hyrestidens utgång.

### F7 — Nio-månadersregeln prövas mot hyrestiden, inte mot hyresförhållandet

**Allvarlighetsgrad:** Hög
**Fil:** `src/lib/legal/regime.ts:443-444`, klausulerna `C-TERM-FIXED` och `C-TERM-FIXED-9M`

`requiresNoticeToEnd` beräknas som `exceedsMonths(start, end, 9)`, alltså enbart utifrån
den avtalade hyrestidens längd. 12 kap. 3 § andra stycket knyter an till att
**hyresförhållandet varat** mer än nio månader i följd — inte till hyrestidens längd i
det enskilda avtalet. Skillnaden är etablerad och har praktiska konsekvenser:

- `fixedTermRenewal === 'auto_renew_same'` med sex månaders hyrestid ger efter en
  förlängning ett hyresförhållande på tolv månader. Koden genererar då varken
  `C-TERM-FIXED-9M` eller varningen `W-FIXED-9M`, och `C-TERM-FIXED` säger i stället
  "Om avtalet inte sägs upp förlängs det med en tid som motsvarar den ursprungliga
  hyrestiden" — utan att nämna att avtalet från och med den andra perioden måste sägas
  upp för att upphöra.
- Ett nytt avtal mellan samma parter om samma lägenhet räknas in i hyresförhållandet.
  Formuläret frågar inte om tidigare hyresförhållande, så uppgiften finns inte.

Dessutom motsäger `C-TERM-FIXED` och `C-TERM-FIXED-9M` varandra när `fixedTermRenewal`
är `'ends'` och hyrestiden överstiger nio månader: den ena säger "Avtalet förlängs inte
automatiskt", den andra "Avtalet måste sägas upp för att upphöra att gälla".

**Lagrum som talar emot:** 12 kap. 3 § andra stycket jordabalken [ej kontrollerat].

**Textförslag** (`renewalText`, `auto_renew_same`):

> Om avtalet inte sägs upp förlängs det med en tid som motsvarar den ursprungliga
> hyrestiden. När hyresförhållandet har varat mer än nio månader i följd upphör avtalet
> inte längre automatiskt vid en hyrestids utgång, utan måste sägas upp för att upphöra
> att gälla.

**Textförslag** (`C-TERM-FIXED-9M`, ersätter hela brödtexten):

> Avtalet upphör inte automatiskt vid hyrestidens utgång när hyresförhållandet har varat
> mer än nio månader i följd. Från den tidpunkten måste avtalet sägas upp för att
> upphöra att gälla. Vid beräkningen räknas hela den tid parterna har haft ett
> hyresförhållande om denna lägenhet, även tid enligt tidigare avtal.

**Kodåtgärd som en människa måste ta ställning till:** låt `requiresNoticeToEnd` också
bli sann när `fixedTermRenewal !== 'ends'` och hyrestiden × 2 överstiger nio månader, och
lägg till ett fält för tidigare hyresförhållande mellan parterna.

### F8 — `C-NOTICE-FORM` återger 12 kap. 8 § fel i tre avseenden

**Allvarlighetsgrad:** Hög
**Fil:** `src/lib/legal/clauses.ts:404-413`

Klausulen lyder i dag:

> En uppsägning ska vara skriftlig. Uppsägningen ska delges motparten. Skriftlig
> uppsägning som sänds i rekommenderat brev till motpartens senast kända adress anses ha
> skett när brevet lämnades in för postbefordran.

Tre problem, alla mot 12 kap. 8 § [sek]:

1. **Skriftlighetskravet är villkorat.** Det gäller när hyresförhållandet har varat
   längre än tre månader i följd vid den tidpunkt uppsägningen sker. Klausulen gör det
   ovillkorligt. Ett strängare formkrav än lagens kan i sig vara till hyresgästens
   nackdel — en hyresgäst som sagt upp muntligt riskerar att få höra att uppsägningen är
   ogiltig enligt avtalet.
2. **Undantaget för hyresgästens muntliga uppsägning saknas.** Hyresgästen får säga upp
   muntligt om hyresvärden lämnar ett skriftligt erkännande av uppsägningen.
3. **Rekommenderat brev-presumtionen återges symmetriskt och ovillkorligt.** Enligt
   källan förutsätter den att mottagaren har hemvist i landet, och den gäller inte vid
   förtida uppsägning enligt 42 § eller uppsägning enligt 58 §. Det här är den farligaste
   delen: en hyresvärd som läser klausulen kan tro att ett rekommenderat brev räcker för
   att förverka och avsluta hyresförhållandet, vilket det inte gör.

**Textförslag:**

> En uppsägning ska vara skriftlig om hyresförhållandet har varat längre än tre månader i
> följd vid den tidpunkt till vilken uppsägningen sker. Säger hyresgästen upp avtalet får
> uppsägningen dock vara muntlig om hyresvärden lämnar ett skriftligt erkännande av den.
> Parterna är ändå överens om att alltid använda skriftlig form.
>
> En skriftlig uppsägning ska delges motparten. Sänds uppsägningen i rekommenderat brev
> till mottagarens vanliga adress anses den i vissa fall ha skett när brevet lämnades in
> för postbefordran. Den regeln gäller inte i alla situationer — bland annat inte vid
> uppsägning i förtid på grund av att hyresrätten är förverkad. I sådana fall måste
> uppsägningen delges enligt vad som föreskrivs i 12 kap. 8 § jordabalken.
>
> Parterna ska underrätta varandra om ändrade kontaktuppgifter.

### F9 — `C-TERM-FIXED-9M` talar om avsedd hyrestid, lagen om förfluten tid

**Allvarlighetsgrad:** Låg
**Fil:** `src/lib/legal/clauses.ts:379-380`

"Eftersom hyresförhållandet **avses vara** längre än nio månader i följd" — lagen
knyter an till att hyresförhållandet **har varat** mer än nio månader. Skillnaden spelar
roll när avtalet sägs upp i förtid. Åtgärdas av textförslaget under F7.

### F10 — `describeNotice` säger "tidigast" även där lagen säger "närmast efter"

**Allvarlighetsgrad:** Låg
**Fil:** `src/lib/legal/regime.ts:465-481`

12 kap. 4 § första stycket använder "vid det månadsskifte som inträffar närmast efter tre
månader från uppsägningen" [sek]. 3 § lagen (2012:978) använder "tidigast efter" [sek].
`describeNotice` skriver "tidigast" i båda fallen. Praktiskt samma resultat, men
avtalstext bör följa den lag som citeras. Låt `NoticePeriod` bära en `phrasing`-variant.

### F11 — `applyExtendedNotice` tappar tyst avtalad förlängning vid dagar och veckor

**Allvarlighetsgrad:** Medel
**Fil:** `src/lib/legal/regime.ts:197-200`

Funktionen returnerar oförändrad period när `landlord.months` saknas. Vid JB12 + bestämd
tid ≤ 3 månader är perioden uttryckt i dagar eller veckor, och ett ifyllt
`noticeExtendedTenant` får då ingen effekt alls — utan att användaren får veta det.
Antingen ska fältet döljas i de fallen, eller så ska förlängningen konverteras till
månader. Fältnamnet `noticeExtendedTenant` för något som förlänger *hyresvärdens*
uppsägningstid är dessutom missvisande; överväg `noticeExtendedLandlordForTenantBenefit`
eller motsvarande.

### F12 — Kodkommentaren anger fel stycke i 12 kap. 1 §

**Allvarlighetsgrad:** Låg
**Fil:** `src/lib/legal/regime.ts:192-193`

Kommentaren skriver "12 kap. 1 § sjätte stycket JB". Sekundärkällan anger **femte**
stycket [sek]. Kommentaren renderas inte, men den styr framtida läsning av koden.
Kontrollera och rätta.

---

## 7. Fynd — besittningsskydd

### F13 — "Möblerat rum" tolkas som möblerad etta

**Allvarlighetsgrad:** Hög
**Fil:** `src/lib/legal/regime.ts:242-246`

```
return a.furnished !== "none" && a.furnished !== "" && a.rooms === 1;
```

Detta gör varje möblerad enrumslägenhet till ett "möblerat rum" enligt 12 kap. 45 §
första stycket 2 JB. Enligt sekundärkällan avser p. 2 en bostad som hyrs möblerad och
som **inte kan anses vara en bostadslägenhet i vanlig mening** — alltså en bostad utan
eget kök eller kokvrå och utan egna sanitetsutrymmen. En möblerad etta med eget kök och
badrum är en bostadslägenhet, inte ett möblerat rum, och hyresgästen har fullt
besittningsskydd från dag ett.

Konsekvensen i det genererade avtalet är konkret och till hyresgästens nackdel:
`C-TENURE-INFO` skriver då "Vid möblerat rum eller bostad för fritidsändamål uppstår
besittningsskydd först när hyresförhållandet varat längre än nio månader i följd" i ett
avtal där besittningsskyddet redan gäller. Ett sådant villkor är utan verkan mot
hyresgästen enligt 12 kap. 1 § femte stycket [sek], men skadan består i att hyresgästen
tror något annat och flyttar frivilligt.

**Lagrum som talar emot:** 12 kap. 45 § första stycket 2 jordabalken [sek].

**Kodförslag:** `rooms === 1` är fel diskriminant. Det som avgör är om bostaden saknar
eget kök/kokvrå och egna sanitetsutrymmen. Modellen har redan `propertyType ===
'room_in_own_home'` för det vanligaste fallet; för övriga behövs en ny fråga, t.ex.
`hasOwnKitchenAndBath: boolean`, och villkoret bör bli:

```
furnished !== 'none' && hasOwnKitchenAndBath === false
```

Fram tills en sådan fråga finns bör funktionen hellre falla tillbaka på `full`
besittningsskydd — det är det säkra felet.

**Textförslag** (`C-TENURE-INFO`, om regeln behålls i någon form):

> Denna upplåtelse avser ett möblerat rum, dvs. en bostad utan eget kök och egna
> sanitetsutrymmen. För sådana upplåtelser gäller reglerna om rätt till förlängning först
> när hyresförhållandet har varat längre än nio månader i följd. Avser upplåtelsen en
> bostadslägenhet med eget kök och badrum gäller rätten till förlängning från början,
> även om lägenheten hyrs ut möblerad.

### F14 — `holiday_home` behandlas som fritidsändamål oavsett användning

**Allvarlighetsgrad:** Medel
**Fil:** `src/lib/legal/regime.ts:244`

```
if (a.propertyType === "holiday_home" || a.purpose === "leisure") return true;
```

12 kap. 45 § första stycket 2 talar om "lägenhet för fritidsändamål" [sek] — ändamålet,
inte byggnadstypen. Ett fritidshus som hyrs ut för permanentboende (vilket koden själv
tillåter: `purpose === 'permanent'`) är inte en lägenhet för fritidsändamål. Fallet
uppstår i praktiken när regimen är JB12 av annan anledning, t.ex. näringsverksamhet eller
`privateRentalOrdinal === 'additional'`, och hyresgästen förlorar då nio månaders
besittningsskydd på fel grund.

**Kodförslag:** ta bort `a.propertyType === "holiday_home"` ur villkoret och behåll bara
`a.purpose === "leisure"`. Lagvalsmotorn gör redan rätt distinktion i `resolveRegimeDecision`
— besittningsskyddsfunktionen bör göra samma.

### F15 — 24-månadersregeln tillämpas även när bara en del av lägenheten upplåts

**Allvarlighetsgrad:** Medel
**Fil:** `src/lib/legal/regime.ts:238-240`, `268-276`

`isSublet` returnerar sant för `first_hand_lease` och `second_hand` utan hänsyn till om
upplåtelsen avser lägenheten i dess helhet. Enligt sekundärkällan avser 12 kap. 45 §
första stycket 1 upplåtelse av en bostadslägenhet **i dess helhet** i andra hand till
annan för självständigt brukande [sek]. En förstahandshyresgäst som hyr ut ett rum utan
att själv bo kvar faller varken under p. 1 (inte hela lägenheten) eller p. 3 (inte del av
upplåtarens egen bostad).

**Kodförslag:** villkora `isSublet` på att `propertyType !== 'room_in_own_home'` *och* att
upplåtelsen avser hela bostaden. Det senare finns inte som fält i dag.

### F16 — Bostadsrätt i andra hand under JB12 får `full` besittningsskydd

**Allvarlighetsgrad:** Medel — och en fråga för en människa
**Fil:** `src/lib/legal/regime.ts:238-240`

`isSublet` täcker inte `landlordTitle === 'condominium'`. En bostadsrättshavare som hyr ut
i andra hand och som hamnar i JB12 (t.ex. andra pågående uthyrningen, eller
näringsverksamhet) får därför `full` i koden. Om 12 kap. 45 § första stycket 1 omfattar
även andrahandsupplåtelse av bostadsrätt — vilket är den gängse uppfattningen men som jag
inte har kunnat verifiera — ska fallet i stället ge `arises_after: 24`.

Att notera: 12 kap. 45 a § pekar enligt sekundärkällan uttryckligen ut "bostadsrättslägenhet
som upplåts i andra hand" som ett av undantagsfallen från kravet på hyresnämndens
godkännande [sek], vilket talar för att lagstiftaren betraktar sådana upplåtelser som
andrahandsupplåtelser i kapitlets mening. Men det är ett indicium, inte ett svar.

**Åtgärd:** ställningstagande krävs — se avsnitt 10, fråga 3.

---

## 8. Fynd — förverkande

### F17 — `C-FORFEITURE` utelämnar rättelse, tillsägelse och ringa-ventilen

**Allvarlighetsgrad:** Hög
**Fil:** `src/lib/legal/clauses.ts:580-589`

Nuvarande lydelse:

> Hyresrätten är förverkad och hyresvärden har rätt att säga upp avtalet i förtid bland
> annat om hyresgästen dröjer med att betala hyran mer än en vecka efter förfallodagen,
> utan behövligt samtycke upplåter lägenheten i andra hand, vanvårdar lägenheten eller
> utsätter omgivningen för störningar.

Fyra invändningar mot 12 kap. 42 § [sek]:

1. **Olovlig andrahandsupplåtelse förverkar inte omedelbart.** Enligt källan krävs att
   hyresgästen inte efter tillsägelse utan dröjsmål antingen vidtar rättelse eller söker
   tillstånd och får ansökan beviljad. Klausulen utelämnar hela det momentet.
2. **Vanvård och störningar förverkar inte heller omedelbart.** Också där krävs att
   rättelse inte sker efter tillsägelse. Undantag gäller vid särskilt allvarliga
   störningar — men klausulen skriver den strängare regeln som huvudregel.
3. **Ringa-ventilen saknas helt.** Hyresrätten är inte förverkad om det som ligger
   hyresgästen till last är av ringa betydelse [sek]. Det är den enskilt viktigaste
   begränsningen för en privatperson som betalat hyran några dagar för sent.
4. **"Bland annat" är för vagt** för en uppräkning som ligger till grund för att någon
   ska förlora sin bostad. Antingen räknas grunderna upp fullständigt, eller så hänvisar
   klausulen enbart till paragrafen.

Konsekvensen är att klausulen ger hyresvärden ett mer långtgående intryck av
förverkanderätt än lagen medger. Ett villkor som utvidgar förverkandegrunderna är utan
verkan mot hyresgästen enligt 12 kap. 1 § femte stycket [sek], men avtalstexten styr
parternas beteende långt innan någon domstol ser den.

**Textförslag:**

> Hyresrätten kan förverkas och hyresvärden få rätt att säga upp avtalet i förtid i de
> fall som anges i 12 kap. 42 § jordabalken. För en bostadslägenhet gäller det bland
> annat om hyresgästen dröjer med att betala hyran mer än en vecka efter förfallodagen.
>
> I flera av de övriga fallen — bland annat om lägenheten upplåts i andra hand utan
> behövligt samtycke eller tillstånd, om lägenheten vanvårdas eller om omgivningen utsätts
> för störningar — är hyresrätten förverkad först om hyresgästen inte utan dröjsmål vidtar
> rättelse efter tillsägelse från hyresvärden. Vid särskilt allvarliga störningar gäller
> inte kravet på tillsägelse.
>
> Hyresrätten är inte förverkad om det som ligger hyresgästen till last är av ringa
> betydelse.
>
> Även om hyresrätten är förverkad kan hyresgästen i vissa fall återvinna den, bland annat
> genom att betala hyran inom den frist som anges i 12 kap. 44 § jordabalken. Hyresvärden
> ska då först ha lämnat hyresgästen den underrättelse och gjort den anmälan till
> socialnämnden som paragrafen kräver.

### F18 — `C-SUBLET-BAN` nämner inte hyresgästens rätt till tillstånd

**Allvarlighetsgrad:** Medel
**Fil:** `src/lib/legal/clauses.ts:570-578`

Klausulen ställer upp ett absolut förbud mot vidareuthyrning och citerar 12 kap. 39 §.
Den nämner inte 12 kap. 40 §, som ger en bostadshyresgäst rätt att få hyresnämndens
tillstånd om hyresvärden vägrar utan befogad anledning [ej kontrollerat]. Ett villkor som
utesluter den rätten är utan verkan mot hyresgästen.

**Textförslag** (nytt andra stycke):

> Vägrar hyresvärden samtycke kan hyresgästen ansöka om hyresnämndens tillstånd till
> andrahandsupplåtelsen enligt 12 kap. 40 § jordabalken. Detta villkor inskränker inte
> den rätten.

Lägg till `12 kap. 39–40 §§ jordabalken` som `legalBasis`.

---

## 9. Fynd — hyra, kostnader och betalning

### F19 — `C-RENT-ADJUST` genererar indexklausul utan treårsvillkoret

**Allvarlighetsgrad:** Hög
**Fil:** `src/lib/legal/clauses.ts:456-464`

Klausulen genereras när `rentAdjustment !== 'none'` och skriver att hyran kan ändras
"med utgångspunkt i {{rentAdjustmentIndex}}", utan någon begränsning. Enligt
sekundärkällan kräver 12 kap. 19 § att hyran för bostadslägenheter är till beloppet
bestämd i avtalet, och en indexklausul gäller bara om hyresavtalet är träffat för bestämd
tid som är **minst tre år** [sek]. Tjänstens typfall — tillsvidareavtal eller bestämd tid
om sex till tolv månader — uppfyller aldrig det kravet, och den genererade indexklausulen
är då utan verkan.

Klausulen saknar dessutom `legalBasis` helt.

Under `PRIVATE_2012_978` tillkommer att hyran i alla händelser är begränsad av 4 §
(kostnadsbaserad), vilket klausulen inte heller nämner.

**Textförslag:**

> Hyran kan ändras under hyrestiden genom överenskommelse mellan parterna. En höjning
> gäller tidigast från och med den månad som infaller närmast efter det att hyresgästen
> underrättats skriftligen.
>
> Hyran för en bostadslägenhet ska enligt 12 kap. 19 § jordabalken vara bestämd till
> belopp i avtalet. En klausul om att hyran ska räknas upp enligt index gäller endast om
> avtalet är träffat för bestämd tid om minst tre år. Detta avtal innehåller därför ingen
> indexuppräkning. [alternativt, när hyrestiden faktiskt är minst tre år:] Eftersom
> avtalet är träffat för bestämd tid om minst tre år har parterna avtalat att hyran räknas
> om enligt {{rentAdjustmentIndex}}.
>
> Tvingande bestämmelser om hyressättning gäller framför detta villkor.

**Kodåtgärd:** `rentAdjustment === 'index'` bör blockeras eller varnas för när
`contractType !== 'fixed'` eller hyrestiden understiger tre år. Det saknas i dag helt.

### F20 — `C-RENT-PRIVATE` kan inte bedömas utan att 4 § läses

**Allvarlighetsgrad:** Medel (verifieringslucka)
**Fil:** `src/lib/legal/regime.ts:296-303`

Principtexten — påtagligt över kapitalkostnad plus driftskostnader, skälig
avkastningsränta på marknadsvärdet, hyresnämnden sänker bara framåt utan retroaktiv
återbetalning — motsvarar min uppfattning om 4 § lagen (2012:978), men jag har inte
kunnat läsa paragrafen. Eftersom detta är den enskilt viktigaste ekonomiska upplysningen
i avtalet för den vanligaste användaren bör lydelsen jämföras ord för ord.

Det som särskilt bör kontrolleras: uttrycket "skälig avkastningsränta" och påståendet att
hyresnämnden inte kan besluta om återbetalning.

### F21 — 15-procentspåslaget presenteras som om det följde av 12 kap. 55 §

**Allvarlighetsgrad:** Låg
**Fil:** `src/lib/legal/regime.ts:305-311`

`C-RENT-JB` anger `legalBasis: "12 kap. 55 § jordabalken"` och skriver in
"med tillägg om högst omkring 15 procent om lägenheten hyrs ut möblerad". Specen anger
själv att siffran är praxis (§4.5). Att ange ett praxisbaserat riktvärde under ett
lagrum ger den en auktoritet den inte har, och siffran ändras med praxis.

**Textförslag:**

> Hyran bestäms enligt bruksvärdesprincipen i 12 kap. 55 § jordabalken. Vid
> andrahandsupplåtelse av en hyresrätt utgör förstahandshyran utgångspunkt. Enligt
> hyresnämndernas praxis godtas därutöver normalt ett påslag för möblering om storleksordningen
> 10–15 procent samt ersättning för faktiska kostnader för el, bredband och liknande.
> Praxis kan ändras; siffran är inte fastställd i lag.

Lägg också till ett lagrum i `W-RENT-CRIMINAL` när paragrafnumret för straffbestämmelsen
är kontrollerat — se avsnitt 2.2.

### F22 — `C-COSTS` tillåter rörliga poster utanför undantaget i 12 kap. 19 §

**Allvarlighetsgrad:** Medel
**Fil:** `src/lib/legal/clauses.ts:486-492`, `src/lib/types.ts:283-290`

`separate_actual` kan väljas för samtliga poster, inklusive bredband, TV, tvättstuga och
sophämtning. Enligt sekundärkällan kräver 12 kap. 19 § att hyran är till beloppet bestämd,
med undantag bland annat för uppvärmning, varmvatten, el och vatten/avlopp [sek].
Bredband, TV, tvättstuga och sophämtning nämns inte i det undantaget. En klausul som gör
dem rörliga kan därför vara utan verkan i den delen.

`tenant_own_contract` är en annan sak — då är det inte hyra utan hyresgästens egen
kostnad — och är oproblematiskt.

**Åtgärd:** begränsa `separate_actual` till värme, varmvatten, el och VA, och låt övriga
poster bara kunna vara `included`, `separate_fixed` eller `tenant_own_contract`. Lägg till
`legalBasis: "12 kap. 19 § jordabalken"` på `C-COSTS`.

### F23 — `paymentDueCustom` kan sätta förfallodagen tidigare än lagen medger

**Allvarlighetsgrad:** Låg
**Fil:** `src/lib/legal/clauses.ts:103-112`, `466-474`

`paymentDueRule === 'custom'` är fri text och interpoleras rakt in i avtalet. En användare
kan skriva "senast den 15 i månaden före" och därmed avtala om mer än en månads förskott,
vilket enligt sekundärkällan strider mot 12 kap. 20 § för bostadslägenhet [sek]. Fältet
saknar helt validering.

Vidare: `prepaidRentMonths` finns i datamodellen och genererar en varning (`W-PREPAID`),
men **ingen klausul**. Ett avtal där hyresgästen betalat förskottshyra får alltså ingen
avtalstext om vad som händer med förskottet vid avflyttning. Det är samma brist som
specen §5.7 påtalar för depositionen.

---

## 10. Fynd — övriga klausuler

### F24 — `C-CONSENT-PENDING` ger hyresvärden en frånträdesrätt med omedelbar verkan

**Allvarlighetsgrad:** Hög
**Fil:** `src/lib/legal/clauses.ts:332-344`

> Om samtycke eller tillstånd inte lämnas har vardera parten rätt att frånträda avtalet
> med omedelbar verkan, varvid erlagd hyra för tid efter frånträdandet återbetalas.

Villkoret ger hyresvärden en rätt att avsluta ett bostadshyresavtal utan uppsägningstid
och utanför förverkandereglerna. Under JB12 kringgår det både uppsägningstiden i 12 kap.
4 § och, för en hyresgäst med besittningsskydd, hela förlängningsprövningen i 46 §. Under
`PRIVATE_2012_978` kringgår det hyresvärdens tremånadersfrist i 3 §. I båda fallen är
villkoret till hyresgästens nackdel och därmed utan verkan mot denne — 12 kap. 1 § femte
stycket [sek] respektive 2 § lagen (2012:978) [sek].

Hyresgästens motsvarande rätt är däremot oproblematisk, eftersom den är till hyresgästens
förmån.

**Textförslag:**

> Upplåtelsen förutsätter samtycke från bostadsrättsföreningens styrelse respektive
> tillstånd från hyresvärden eller hyresnämnden. Sådant samtycke eller tillstånd är enligt
> parternas uppgift ännu inte lämnat.
>
> Om samtycke eller tillstånd inte lämnas har hyresgästen rätt att frånträda avtalet med
> omedelbar verkan, varvid hyra som betalats för tid efter frånträdandet återbetalas.
> Hyresvärden kan i sådant fall säga upp avtalet med den uppsägningstid som anges i detta
> avtal. Hyresvärden kan inte avsluta avtalet i förtid på annan grund än vad som följer av
> lag.
>
> Hänvisning till hyresnämndens beslut, i förekommande fall: {{rentTribunalPermit}}.

Lägg till `legalBasis: "7 kap. 10–11 §§ bostadsrättslagen (1991:614) samt 12 kap. 39–40 §§
jordabalken"` — klausulen saknar lagrum i dag.

### F25 — `C-CONSENT-PENDING` påstår något om ett obesvarat fält

**Allvarlighetsgrad:** Låg
**Fil:** `src/lib/legal/clauses.ts:335-338`

Villkoret är `boardConsentObtained !== "yes"`, vilket är sant också när fältet är tomt
(`""`). Klausulen skriver då kategoriskt "Sådant samtycke eller tillstånd är ännu inte
lämnat" om något användaren inte tagit ställning till. Textförslaget under F24 mildrar
detta ("enligt parternas uppgift"), men villkoret bör ändå ändras till en uttrycklig
uppräkning av `"no"` och `"applied"`, med separat hantering av tomt värde.

### F26 — `C-RULES` sätter ett absolut tak för antalet boende

**Allvarlighetsgrad:** Medel
**Fil:** `src/lib/legal/clauses.ts:549-559`

"Lägenheten får bebos av högst {{maxOccupants}} personer" är ett ovillkorligt tak.
12 kap. 41 § ger hyresgästen rätt att inrymma utomstående personer om det inte kan medföra
men för hyresvärden [ej kontrollerat]. Ett villkor som helt utesluter den rätten — t.ex.
hindrar hyresgästen från att låta en partner eller ett barn flytta in — är sannolikt utan
verkan i den delen.

Två språkliga fel i samma klausul: `{{maxOccupants}}` blir "—" när fältet är tomt
("får bebos av högst — personer"), och `{{quietHours}}` har defaultvärdet "22.00-07.00"
vilket ger "iaktta tystnad mellan 22.00-07.00 och i övrigt …".

**Textförslag:**

> Lägenheten är avsedd att bebos av {{maxOccupants}} personer. Hyresgästen får inrymma
> utomstående i lägenheten i den utsträckning det inte medför men för hyresvärden.
>
> {{smokingText}} {{petsText}}
>
> Hyresgästen ska iaktta tystnad under tiden {{quietHours}} och i övrigt se till att de
> som bor i omgivningen inte utsätts för störningar.

### F27 — `C-INSPECTION` påstår besiktning vid båda tillfällena oavsett vad som valts

**Allvarlighetsgrad:** Medel
**Fil:** `src/lib/legal/clauses.ts:504-513`

Villkoret är `inspectionOnMoveIn || inspectionOnMoveOut`, men brödtexten säger alltid
"besiktigas gemensamt av parterna vid tillträdet **och** vid avflyttningen". Väljer
användaren bara avflyttningsbesiktning får avtalet ändå en förpliktelse om
tillträdesbesiktning som ingen kommer att fullgöra. Bilagan
`bilaga-besiktningsprotokoll.pdf` har på samma sätt alltid två underskriftsblock.

**Kodförslag:** dela i två klausuler, eller bygg meningen av de valda tillfällena:

> Lägenheten besiktigas gemensamt av parterna {{inspectionOccasions}}. Resultatet
> antecknas i ett besiktningsprotokoll som undertecknas av båda parter och bifogas detta
> avtal.

där `inspectionOccasions` blir "vid tillträdet", "vid avflyttningen" eller "vid tillträdet
och vid avflyttningen".

### F28 — `C-JOINT-LIABILITY` reglerar delad uppsägning oklart

**Allvarlighetsgrad:** Låg — och en fråga för en människa
**Fil:** `src/lib/legal/clauses.ts:279-288`

> En uppsägning från en av hyresgästerna gäller endast den hyresgästen om parterna inte
> kommer överens om annat.

Meningen svarar inte på det som faktiskt blir tvistigt: om den avflyttande hyresgästen
befrias från det solidariska ansvaret för framtida hyra, och om de kvarvarande
hyresgästerna får behålla lägenheten på oförändrade villkor. Den kan dessutom komma i
konflikt med hyresgästernas gemensamma rätt enligt 12 kap. 5 § att säga upp avtalet —
en enskild medhyresgäst kan inte ensam avsluta ett gemensamt hyresavtal.

**Textförslag:**

> Hyresgästerna svarar solidariskt för samtliga förpliktelser enligt detta avtal.
> Hyresvärden har rätt att kräva hela hyran och övriga belopp av vilken som helst av
> hyresgästerna.
>
> Avtalet sägs upp gemensamt av samtliga hyresgäster. Vill en av hyresgästerna träda ut ur
> avtalet krävs en skriftlig överenskommelse mellan samtliga hyresgäster och hyresvärden.
> Utan en sådan överenskommelse kvarstår den solidariska betalningsskyldigheten.

### F29 — `C-FURNISHING` hänvisar till en bilaga som kan vara tom

**Allvarlighetsgrad:** Låg
**Fil:** `src/lib/legal/clauses.ts:310-319`, `src/lib/pdf/agreement.ts:123-146`

Klausulen skriver att möbleringen "framgår av bifogad inventarielista", men bilagan
genereras även när `inventoryItems` är tom och skriver då "Inga inventarier har angetts."
Ett avtal som hänvisar till en tom förteckning är sämre än inget — det flyttar bevisbördan
åt ett håll ingen avsett. Antingen ska inventarielistan vara obligatorisk när
`furnished !== 'none'` (specen §5.8 säger "krävs om furnished !== 'none'", men koden
kräver det inte), eller så ska klausulen ändras.

### F30 — Platshållare som ger "—" mitt i en mening

**Allvarlighetsgrad:** Låg
**Fil:** `src/lib/format.ts:11-24`, `src/lib/legal/clauses.ts:143-262`

`formatMoney`, `formatAmount` och `formatDate` returnerar `"—"` för tomma värden, och
`templateValues` gör samma för de flesta strängfält. Följden är meningar som:

| Klausul | Resultat vid tomt fält |
|---|---|
| `C-OBJECT` | "lägenhetsnummer —, fastighetsbeteckning —" (alltid för villa respektive bostadsrätt, eftersom fälten är villkorade i UI) |
| `C-OBJECT` | ett eget stycke som bara innehåller "—" när `objectDescription` är tom |
| `C-KEYS` | "dock högst — om belopp angetts" |
| `C-DEPOSIT` | "återbetalas inom — dagar" |
| `C-ACCESS` | "underrätta hyresgästen minst — dagar i förväg" |
| `C-RULES` | "får bebos av högst — personer" |
| `C-PARTIES` | "E-post —, telefon —" |

`"—"` är rimligt i en tabell men inte i löpande avtalstext. **Kodförslag:** låt
`interpolate` stödja villkorliga segment, t.ex. `{{?keyReplacementCost: dock högst
{{keyReplacementCost}}}}`, så att hela satsen faller bort när värdet saknas. Alternativt:
låt `templateValues` returnera tom sträng för fält som används inuti meningar och behåll
`"—"` bara i uppräkningar. `C-OBJECT` bör dessutom bygga sin första mening av de fält som
faktiskt är ifyllda.

### F31 — `maintenanceText` gör hyresgästen strikt ansvarig

**Allvarlighetsgrad:** Medel
**Fil:** `src/lib/legal/clauses.ts:133-137`

Standardalternativet skriver att "Hyresgästen svarar … för skador som hyresgästen, någon i
hyresgästens hushåll eller besökare **orsakat**". Ordet "orsakat" gör ansvaret strikt.
12 kap. 24 § bygger på vållande respektive vårdslöshet eller försummelse [ej kontrollerat]
— vilket klausulens *andra* stycke för övrigt återger korrekt ("genom hyresgästens vållande
eller vårdslöshet"). De två styckena säger alltså olika saker i samma klausul.

Klausulen anger dessutom bara 12 kap. 24 § som lagrum, trots att första stycket handlar om
hyresvärdens underhållsskyldighet, som följer av 12 kap. 15 § [ej kontrollerat].

**Textförslag** (`standard_split`):

> Hyresvärden svarar för lägenhetens skick och för underhåll enligt 12 kap. 15 §
> jordabalken. Hyresgästen svarar för löpande skötsel och för skada som uppkommit genom
> hyresgästens vållande eller genom vårdslöshet eller försummelse av någon som hör till
> hyresgästens hushåll, som gästar hyresgästen eller som annars vistas i lägenheten med
> hyresgästens medgivande.

`legalBasis` bör bli `12 kap. 15 och 24 §§ jordabalken`.

### F32 — `C-KEYS` lägger strikt ansvar för låsbyte på hyresgästen

**Allvarlighetsgrad:** Medel
**Fil:** `src/lib/legal/clauses.ts:515-524`

"Vid förlorad nyckel svarar hyresgästen för kostnaden för ersättningsnyckel och, om
låsbyte krävs, för denna kostnad" — ansvaret inträder oavsett vållande. Samma invändning
som F31: 12 kap. 24 § bygger på culpa. En nyckel som stjäls vid ett inbrott hos
hyresgästen är inte utan vidare hyresgästens ansvar.

Dessutom är beloppsbegränsningen konstruerad så att den försvinner när den behövs:
"dock högst {{keyReplacementCost}} om belopp angetts" blir "dock högst — om belopp
angetts" när inget belopp finns — alltså ingen begränsning alls, formulerad som om det
fanns en.

**Textförslag:**

> Samtliga nycklar ska återlämnas senast vid hyrestidens slut. Förlorar hyresgästen en
> nyckel ska hyresgästen genast underrätta hyresvärden. Hyresgästen svarar för kostnaden
> för ersättningsnyckel och, om låsbyte behövs, för den kostnaden, i den mån förlusten
> beror på hyresgästens vållande eller vårdslöshet. [om belopp angetts:] Hyresgästens
> ansvar är begränsat till {{keyReplacementCost}}.
>
> Hyresgästen får inte låta tillverka extra nycklar utan hyresvärdens medgivande.

### F33 — `C-ACCESS` återger 12 kap. 26 § ofullständigt

**Allvarlighetsgrad:** Låg
**Fil:** `src/lib/legal/clauses.ts:538-547`

Klausulen nämner brådskande arbete men inte hyresvärdens rätt till tillträde för
nödvändig tillsyn, och inte hyresgästens skyldighet att låta lägenheten visas när den är
ledig för uthyrning [ej kontrollerat]. Varselregeln "minst {{accessNotice}} dagar i
förväg" är dessutom avtalad, inte lagfäst, vilket bör framgå eftersom klausulen citerar
26 § som lagrum. Lagen har egna, delvis längre, varselregler för vissa arbeten som
klausulen inte kan avtala bort.

---

## 11. Fynd — varningssystemet

### F34 — `W-CONSENT` och `C-CONSENT-PENDING` täcker olika fall

**Allvarlighetsgrad:** Medel
**Fil:** `src/lib/legal/regime.ts:332-345` jämfört med `src/lib/legal/clauses.ts:335-338`

| | Klausulen | Varningen |
|---|---|---|
| `condominium` utan samtycke | ✓ | ✓ (men inte vid tomt fält) |
| `first_hand_lease` utan tillstånd | ✓ | ✓ (men inte vid tomt fält) |
| `second_hand` utan tillstånd | ✓ | **✗** |

En tredjehandsuthyrare får alltså villkorsklausulen i avtalet men aldrig den blockerande
varningen — trots att risken att förstahands- eller andrahandskontraktet förverkas är
densamma. Specens §9 anger `W-CONSENT` som blockerande varning som kräver aktiv
bekräftelse innan PDF genereras; här släpps fallet igenom.

Varningen triggar dessutom på `'applied'` (ansökan inlämnad) med texten "samtycke saknas",
vilket är onödigt hårt formulerat för ett fall där användaren gjort rätt.

### F35 — `W-TENURE` ärver felet i nio-/tjugofyramånadersberäkningen

**Allvarlighetsgrad:** Låg
**Fil:** `src/lib/legal/regime.ts:345-352`

`durationMonths > tenure.months` bygger på samma hyrestidsberäkning som F7 kritiserar. Vid
`auto_renew_same` med en period under gränsen visas ingen varning, trots att gränsen
passeras vid förlängningen. Åtgärdas tillsammans med F7.

---

## 12. Fynd — ansvarsfriskrivningen (`/villkor`)

Rättslig ram: lagen (1994:1512) om avtalsvillkor i konsumentförhållanden och 36 §
avtalslagen [ej kontrollerat]. Användaren är typiskt en privatperson som hyr ut sin
bostad, alltså konsument i förhållande till tjänsteleverantören.

### F36 — §5 friskriver från fel i själva dokumentet

**Allvarlighetsgrad:** Hög
**Fil:** `src/app/villkor/page.tsx:72-84`

> … friskriver vi oss från allt ansvar för direkta och indirekta skador … Detta omfattar
> – utan begränsning – ansvar för fel eller brister i ett dokument, för att ett villkor
> visar sig ogiltigt eller olämpligt …

Detta är en total friskrivning från fel i den enda prestation tjänsten levererar. Ett
sådant villkor är typiskt sett ett av de tydligaste exemplen på oskälighet i
konsumentförhållanden. Inledningen "I den utsträckning som tillåts enligt tvingande lag"
och reservationen i det efterföljande stycket räddar det inte: de gör villkoret oklart
snarare än skäligt, och oklara villkor tolkas till konsumentens förmån.

Specen §12.5 pekar ut exakt denna punkt: "dagens lydelse friskriver från 'dokumentets
innehåll', vilket sannolikt inte håller mot konsument enligt avtalsvillkorslagen. Låt
jurist skriva om." Lydelsen är oförändrad.

**Textförslag** (utgångspunkt, ska skrivas om av jurist):

> **5. Ansvarsbegränsning**
>
> Tjänsten är kostnadsfri och tillhandahålls som ett hjälpmedel för att ta fram ett utkast.
> Vi ansvarar inte för indirekt skada, såsom utebliven vinst, förlorad besparing eller
> följdskada, som kan uppstå vid användning av Tjänsten.
>
> Vårt ansvar för direkt skada är begränsat till vad som följer av lag. Vi ansvarar dock
> alltid för skada som vi orsakat uppsåtligen eller genom grov vårdslöshet, och vi
> friskriver oss inte från ansvar som enligt tvingande konsumentskyddande lagstiftning inte
> kan begränsas.
>
> Ett genererat dokument är ett utkast. Det ersätter inte en bedömning av de omständigheter
> som gäller i ditt fall, och det kan behöva ändras eller kompletteras.

Låt jurist ta ställning till om en beloppsbegränsning över huvud taget är meningsfull i en
gratistjänst, och om §2 ("inga garantier") behöver skrivas om i samma veva.

### F37 — §2 friskriver från riktighet medan sajten marknadsför lagenlighet

**Allvarlighetsgrad:** Medel
**Fil:** `src/app/villkor/page.tsx:46-53` jämfört med metabeskrivningen på rad 6-9

Metabeskrivningen säger att tjänsten "genererar utkast till hyresavtal grundade i
Hyreslagen" medan §2 friskriver från att dokumentet är "korrekt, fullständigt, aktuellt
eller lämpligt". Spänningen mellan marknadsföring och villkor är i sig en
marknadsföringsrättslig risk, och den gör §5 svagare: ett villkor som motsäger de
utfästelser konsumenten mötte innan avtalet ingicks väger lätt.

Metabeskrivningen bör dessutom rättas i samma veva som specens §8.3 kräver — den nämner
"Hyreslagen" trots att majoriteten av avtalen genereras under privatuthyrningslagen.

### F38 — §7 ger ensidig rätt att ändra villkoren

**Allvarlighetsgrad:** Medel
**Fil:** `src/app/villkor/page.tsx:93-97`

"Vi kan uppdatera dessa villkor. Den version som gäller är den som publiceras här vid
tidpunkten för din användning." Ensidiga ändringsklausuler utan saklig grund och utan
underrättelse räknas typiskt till de villkor som kan angripas i konsumentförhållanden.
För en engångsanvändning är effekten liten, men lydelsen bör knytas till användningstillfället:

> Vi kan komma att uppdatera dessa villkor. De villkor som gäller för din användning är de
> som var publicerade när du använde Tjänsten. Vi tillämpar inte ändringar retroaktivt.

### F39 — §1 gör godkännandet till en biprodukt

**Allvarlighetsgrad:** Medel
**Fil:** `src/app/villkor/page.tsx:29-32`

"Genom att skapa ett dokument med Tjänsten godkänner du villkoren i sin helhet." Villkoren
blir därmed bindande utan att användaren behöver se dem. Särskilt tyngande villkor — och
en total ansvarsfriskrivning är ett sådant — måste bringas till motpartens kännedom före
avtalsslutet för att bli del av avtalet.

`acknowledgeDraft`-kryssrutan finns redan i datamodellen (§5.10). Låt den uttryckligen
avse godkännande av villkoren, med länk, i stället för att villkoren accepteras genom
handling.

### F40 — Ingen information om tvistlösning utanför domstol

**Allvarlighetsgrad:** Låg
**Fil:** `src/app/villkor/page.tsx:99-100`

§8 anger bara att svensk rätt tillämpas. Det saknas uppgift om Allmänna reklamationsnämnden
och om EU-kommissionens plattform för tvistlösning online. Om skyldigheten enligt lagen
(2015:671) om alternativ tvistlösning i konsumentförhållanden gäller för en kostnadsfri
tjänst är en fråga jag inte kunnat avgöra [ej kontrollerat] — men uppgiften kostar
ingenting att lägga till.

### F41 — Operatörsnamnet är sannolikt felstavat

**Allvarlighetsgrad:** Låg
**Fil:** `src/data/site.ts:12`

`operator` har defaultvärdet `"Adivseo AB"`. Kontaktadressen är `simon@adviseo.se` och
`SITE.address` pekar på Mölndal. Sannolikt ska det stå "Adviseo AB". Namnet visas i
villkorsfoten som den näringsidkare som tillhandahåller tjänsten, och identifieringsuppgifterna
enligt e-handelslagen ska vara riktiga. Kontrollera mot registreringsbeviset.

---

## 13. Fynd — bilagorna (`src/lib/pdf/agreement.ts`)

### F42 — Avståendehandlingen förutsätter ett undantag som sannolikt inte är tillämpligt

**Allvarlighetsgrad:** Hög
**Fil:** `src/lib/pdf/agreement.ts:182-206`

Bilagan skriver:

> Parterna är överens om att hyresgästen avstår från sitt besittningsskydd enligt 12 kap.
> 45 a § jordabalken. Överenskommelsen avser tiden från tillträdesdagen och gäller högst
> fyra år.
>
> En sådan överenskommelse gäller som huvudregel först sedan hyresnämnden godkänt den.
> Godkännande behövs inte i de undantagsfall som anges i 12 kap. 45 a § andra stycket
> jordabalken.

Två problem:

1. **Undantagets tidsvillkor.** Enligt sekundärkällan förutsätter undantaget att
   överenskommelsen träffas **efter det att hyresförhållandet har inletts** [sek]. Bilagan
   genereras som en handling att underteckna tillsammans med hyresavtalet, alltså före
   tillträdet, och undantaget är då inte tillämpligt. Handlingen ger intryck av att
   godkännande kanske inte behövs i just detta fall, när det i den föreslagna ordningen
   alltid behövs.
2. **Styckehänvisningen.** Källan anger att både huvudregeln och undantagen ligger i
   **första** stycket. Koden skriver "andra stycket". Kontrollera.

**Textförslag:**

> Parterna är överens om att hyresrätten inte ska vara förenad med rätt till förlängning.
> Överenskommelsen avser tiden från och med {{startDate}} och gäller längst fyra år från
> det att hyresförhållandet inleddes.
>
> En sådan överenskommelse gäller enligt 12 kap. 45 a § jordabalken först sedan
> hyresnämnden godkänt den. Undantag från kravet på godkännande gäller endast i vissa fall
> och förutsätter bland annat att överenskommelsen träffas efter det att hyresförhållandet
> har inletts. Undertecknas denna handling i samband med hyresavtalet krävs därför
> hyresnämndens godkännande.
>
> Skäl för överenskommelsen: ________________________________________

### F43 — Avståendehandlingen genereras inte i det fall den behövs mest

**Allvarlighetsgrad:** Medel
**Fil:** `src/lib/pdf/agreement.ts:235`

Villkoret är `ctx.securityOfTenure.status === "arises_after"`. Vid `status === "full"` —
den ordinära JB12-uthyrningen, där hyresgästen har besittningsskydd från början —
genereras ingen handling alls. Det är precis där ett avstående har praktisk betydelse.
Omvänt genereras handlingen vid `arises_after` även när avtalstiden är kortare än gränsen,
alltså när besittningsskyddet aldrig hinner uppstå och avståendet är onödigt.

Handlingen ligger bakom `FEATURE_TENURE_WAIVER`, så ingenting läcker i dag. Villkoret bör
ändå rättas innan flaggan slås på.

### F44 — Avståendehandlingen saknar formalia

**Allvarlighetsgrad:** Medel
**Fil:** `src/lib/pdf/agreement.ts:182-206`

Kravet på "särskilt upprättad handling" tillämpas enligt sekundärkällan strikt [sek].
Handlingen saknar i dag:

- ort och datum för undertecknandet (`ruledPair` har bara namnrutor),
- uttrycklig identifiering av vilket hyresavtal den hör till (parternas person-/org.nr,
  avtalsdatum),
- skäl för avståendet, vilket hyresnämnden normalt behöver för att kunna pröva ansökan,
- en rad om att handlingen ska ges in till hyresnämnden och av vem.

Lägg till dessa fält innan flaggan slås på.

### F45 — Besiktningsprotokollet saknar mätarställningar och har fasta rumsrader

**Allvarlighetsgrad:** Låg
**Fil:** `src/lib/pdf/agreement.ts:95-110`

Radlistan är hårdkodad till Hall, Vardagsrum, Kök, Sovrum, Badrum, Balkong/uteplats,
Förråd, Övrigt. För `propertyType === 'room_in_own_home'` är de flesta raderna irrelevanta,
för en villa är de för få. Framför allt saknas rader för mätarställning el och vatten vid
tillträde och avflyttning — specen §5.5 utpekar el som "vanligaste tvistefrågan", och
kostnadsläget `separate_actual` förutsätter en avläst startpunkt som avtalet aldrig
dokumenterar.

### F46 — Inventarielistan och nyckelkvittensen saknar datum

**Allvarlighetsgrad:** Låg
**Fil:** `src/lib/pdf/agreement.ts:123-176`

Båda bilagorna kvitteras med `ruledPair("Hyresvärd", "Hyresgäst")` utan datumrad.
Nyckelkvittensen har visserligen kolumnen "Återlämnad (datum)" per nyckeltyp, men ingen
plats för datum vid själva kvittenstillfället. En kvittens utan datum är svag som bevis,
vilket är hela poängen med handlingen. Inventarielistan bör dessutom, liksom
besiktningsprotokollet, ange hyresobjektets adress *och* parternas namn — i dag anges bara
adress och möbleringsgrad.

---

## 14. Frågor som kräver en människas ställningstagande

1. **Paragrafnumret för avsaknaden av besittningsskydd under privatuthyrningslagen (F2).**
   Är det 3 § sista stycket eller 3 a § lagen (2012:978) som säger att hyresgästen inte har
   rätt till förlängning, och vad reglerar den andra av dem? Sekundärkällorna motsäger
   varandra och jag har inte kunnat läsa lagtexten. Lagrummet trycks i varje avtal under
   den regimen.

2. **Innebörden av "möblerat rum" i 12 kap. 45 § första stycket 2 (F13).** Jag har en
   sekundärkälla som säger att uttrycket kräver att bostaden inte kan anses vara en
   bostadslägenhet i vanlig mening. Är det den korrekta avgränsningen, och räcker "eget
   kök/kokvrå och egna sanitetsutrymmen" som frågeställning i formuläret? Om ja: `rooms ===
   1` ska bort och en ny fråga in.

3. **Omfattas andrahandsupplåtelse av bostadsrätt av 12 kap. 45 § första stycket 1 (F16)?**
   Avgör om en bostadsrätt som hyrs ut i andra hand under JB12 ska ge `arises_after: 24`
   eller `full`. Utfallet står i varje sådant avtal.

4. **Hur ska nio-månadersregeln beräknas i en generator som inte känner till parternas
   historik (F7)?** Alternativen är (a) fråga om tidigare hyresförhållande mellan parterna,
   (b) alltid generera klausulen vid `auto_renew_same` och `auto_renew_indefinite`, eller
   (c) alltid generera en informationsklausul om regeln oavsett hyrestid. Jag lutar åt (c)
   plus (a), men det är ett avvägande.

5. **Ska tjänsten över huvud taget erbjuda `rentAdjustment === 'index'` (F19)?** Om
   treårskravet i 12 kap. 19 § stämmer blir alternativet meningslöst för tjänstens typfall,
   och ett alternativ som bara kan generera ogiltiga villkor bör tas bort snarare än
   varnas för.

6. **Hur långt kan avtalstexten avvika från lagen till hyresgästens *förmån* (F8)?**
   Klausulen om skriftlig uppsägning är strängare än 12 kap. 8 §. Är ett avtalat formkrav
   som binder också hyresgästen till hyresgästens nackdel, eller är det ett tillåtet
   ordningsvillkor? Samma fråga uppkommer för `landlordAccessNotice`.

7. **Ansvarsfriskrivningens utformning (F36).** Specens §12.5 kräver att en jurist skriver
   om §5. Mitt textförslag är en utgångspunkt, inte en färdig lydelse. Ta samtidigt
   ställning till om §2 ("inga garantier") behöver skrivas om och om tjänsten ska ange ARN
   som tvistlösningsorgan.

8. **Vilka driftskostnadsposter får vara rörliga (F22)?** Undantaget i 12 kap. 19 § behöver
   läsas i original innan `separate_actual` begränsas i UI — jag vet inte om tvättstuga och
   sophämtning ryms i "avgifter för vatten och avlopp" eller inte.

9. **Konsekvensen av att `C-FORFEITURE` genereras även under privatuthyrningslagen (F1,
   F17).** Gäller 12 kap. 42 § oförändrat under lagen (2012:978), eller finns avvikelser i
   den lagen som gör uppräkningen missvisande? Beror på lydelsen av 1 § tredje stycket.

10. **Granskningsordningen.** Registret har 33 klausuler och samtliga är ogranskade. Om
    granskningen ska ske i omgångar bör `REQUIRED_REVIEW_VERSION` och `reviewVersion`
    hanteras så att en delvis granskad uppsättning inte kan gå till produktion. Jag har
    inte rört granskningsmetadata och föreslår inga ifyllda värden — de fylls i av en
    människa.

---

## 15. Ordning jag skulle åtgärda i

1. F13, F14, F15 — besittningsskyddsberäkningen. Fel här skriver in fel i varje avtal och
   är dessutom lätta att rätta i koden.
2. F17, F8 — förverkande och uppsägningsform. Två klausuler, båda helt omskrivna.
3. F7 — nio-månadersregeln. Kräver ett produktbeslut (fråga 4) innan koden ändras.
4. F1, F2 — lagvalsklausulen och det ogranskade lagrummet.
5. F36 — ansvarsfriskrivningen. Kan gå parallellt, den rör inte klausulmotorn.
6. F19, F22, F24, F31, F32, F26, F27 — resterande tvingandeproblem.
7. F30 — platshållarmekaniken. En kodändring som lyfter ett tiotal anmärkningar samtidigt.
8. F42–F46 — bilagorna, innan `FEATURE_TENURE_WAIVER` slås på.

---

*Denna rapport är maskinellt framtagen. Den utgör inte juridisk rådgivning och är inte den
juristgranskning som kravspecifikationens §12 kräver. Ingen del av avtalstexten är genom
denna rapport godkänd, granskad eller klar för produktion. Lagrum har inte kunnat
kontrolleras mot författningstext i denna körning — se avsnitt 2 för vad som faktiskt
verifierats och mot vilken sorts källa. Granskningsmetadata (`reviewedBy`, `reviewedAt`,
`reviewVersion`) har inte ändrats och ska fyllas i av en verksam jurist.*
