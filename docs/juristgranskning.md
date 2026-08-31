# Juristgranskning — förgranskning av klausultext och lagvalsmotor

**Version:** 2 (källverifierad omgång)
**Datum:** 2026-08-31
**Granskat:** `src/lib/legal/clauses.ts`, `src/lib/legal/regime.ts`,
`src/lib/legal/review.ts`, `src/lib/pdf/agreement.ts`, `src/app/villkor/page.tsx`
**Metod:** maskinell förgranskning mot författningstext hämtad i sin helhet från
Riksdagens öppna data under körningen.

> Denna rapport ersätter version 1 (2026-08-30). Version 1 skrevs utan tillgång
> till någon författningstext. Den här versionen är skriven med lagtexten
> framför sig, och flera av version 1:s slutsatser ändras därför — se avsnitt 2
> och de fynd som är märkta **Omvärderat** eller **Avfärdat**.

---

## 1. Sammanfattning

### 1.1 Det enskilt viktigaste fyndet

**Lagen (2012:978) om uthyrning av egen bostad är upphävd sedan den 1 juli 2026
och ersatt av privatuthyrningslagen (2026:772).** Tjänsten bygger hela sin
privatuthyrningsregim — lagval, uppsägningstider, besittningsskydd,
hyressättning, varningstexter och den lagtext som skrivs in i avtalet — på en
lag som inte längre gäller för nya avtal.

Källa, övergångsbestämmelserna till privatuthyrningslagen (2026:772):

> 1. Denna lag träder i kraft den 1 juli 2026.
> 2. Genom lagen upphävs lagen (2012:978) om uthyrning av egen bostad.
> 3. Den upphävda lagen gäller dock fortfarande för avtal som har ingåtts enligt
>    den lagen.

Och 12 kap. 1 c § jordabalken, i lydelse enligt SFS 2026:773 (i kraft 1 juli 2026):

> Detta kapitel gäller inte för avtal om hyra som omfattas av
> privatuthyrningslagen (2026:000), om inte annat anges i den lagen.

Punkt 3 räddar avtal som redan är ingångna. Den räddar inte en generator som
skapar nya avtal i dag. Varje avtal tjänsten producerar under grenen
`PRIVATE_2012_978` anger uttryckligen fel tillämplig lag i sin första
sakklausul, och återger sedan uppsägningstider och hyressättningsregler som är
materiellt ändrade.

Detta är ett lanseringsblockerande fynd (F47) som drar med sig F48–F58.

### 1.2 Siffror

| Mått | Antal |
|---|---|
| Klausuler i registret | 33 |
| Bedömda `OK` | 6 |
| Bedömda `Anmärkning` | 13 |
| Bedömda `Fel` | 14 |
| Bedömda `Kan inte bedömas` | 0 |

| Fynd per allvarlighetsgrad | Antal |
|---|---|
| Blockerande | 1 |
| Hög | 16 |
| Medel | 22 |
| Låg | 19 |
| **Summa fynd** | **58** |

| Verifieringsläge | Antal fynd |
|---|---|
| Verifierad mot författningstext | 34 |
| Verifierad mot praxis/förarbete/sekundärkälla | 3 |
| Kan inte verifieras mot källa (kodlogik, språk, bedömningsfråga) | 21 |

Fynden fördelar sig på lagvalet (F1–F3, F47–F52), uppsägning (F4–F12, F50, F53),
besittningsskydd (F13–F16), förverkande (F17–F18, F54), hyra och kostnader
(F19–F23, F51, F57), övriga klausuler (F24–F33, F55, F58), varningarna
(F34–F35), ansvarsfriskrivningen (F36–F41, F56) och bilagorna (F42–F46).

### 1.3 De sex tyngsta fynden

1. **F47 — Blockerande.** `PRIVATE_2012_978` bygger på upphävd lag.
   Privatuthyrningslagen (2026:772) gäller sedan 1 juli 2026.
2. **F51 — Hög.** Hyressättningsprincipen under privatregimen är avskaffad. Koden
   säger dessutom att hyresnämnden *inte* beslutar om återbetalning av redan
   betald hyra. Enligt 2 kap. 6 § tredje stycket privatuthyrningslagen är det
   numera precis tvärtom: sänks hyran för förfluten tid **ska** hyresvärden
   förpliktas att betala tillbaka, med ränta.
3. **F50 — Hög.** Uppsägningstiderna under privatregimen (hyresgäst en månad,
   hyresvärd tre månader, båda får säga upp bestämd tid i förtid) är gamla
   lagens. Nya lagen ger tre månader åt båda hållen och ger hyresvärden **ingen**
   rätt att säga upp ett tidsbestämt avtal i förtid annat än på grunderna i
   6 kap. 3 §.
4. **F13 — Hög. Bekräftat mot lagtext.** `rooms === 1 && furnished !== 'none'`
   likställs med "möblerat rum" i 12 kap. 45 § första stycket 2 JB. En möblerad
   etta är en lägenhet, inte ett möblerat rum. Avtalet talar då om för en
   hyresgäst med fullt besittningsskydd att skyddet saknas i nio månader.
5. **F17 — Hög. Bekräftat och skärpt mot lagtext.** `C-FORFEITURE` utelämnar
   rättelse- och uppmaningsmomenten, ringa-ventilen i 12 kap. 42 § femte stycket
   och underrättelsen till socialnämnden i tredje stycket.
6. **F22 — Hög. Bekräftat och skärpt mot lagtext.** `C-COSTS` tillåter rörliga
   driftskostnadsposter (bredband, TV, tvättstuga, sophämtning) som ligger helt
   utanför den uttömmande uppräkningen i 12 kap. 19 § första stycket. Påföljden
   enligt 19 § femte stycket är att hela hyran i stället ska utgå med ett skäligt
   belopp — alltså att den avtalade hyran sätts ur spel.

### 1.4 Vad som håller

Följande stod sig mot författningstexten och bör inte röras:

- **Uppsägningstiderna vid bestämd tid under JB12** (`jbFixedTermNotice`) — en dag
  vid högst två veckor, en vecka vid högst tre månader, tre månader däröver.
  Ordagrant 12 kap. 4 § andra stycket 1–3.
- **Hyresgästens tvingande tremånadersuppsägning under JB12**
  (`tenantStatutoryThreeMonths`, `C-NOTICE-TENANT-STATUTORY`) — 12 kap. 5 § första
  stycket säger "alltid", alltså även vid bestämd tid, och påståendet att rätten
  inte kan avtalas bort följer av 12 kap. 1 d §.
- **Tjugofyramånadersgränsen vid andrahandsupplåtelse** — 12 kap. 45 § första
  stycket 1 säger "två år i följd".
- **Femtonprocentspåslaget vid andrahandsuthyrning av hyresrätt** — finns
  faktiskt i 12 kap. 55 § fjärde stycket, och lagrummet i `C-RENT-JB` är alltså
  rätt (se dock F21 om ordet "omkring").
- **Straffbarheten i `W-RENT-CRIMINAL`** — 12 kap. 65 c § finns och lyder som
  varningen antyder (se dock F34 om rekvisitet "utan behövligt samtycke").
- **Avgränsningen av nio-månadersregeln till JB12** — privatuthyrningslagens
  6 kap. 1 § låter tidsbestämda avtal upphöra vid hyrestidens slut utan
  motsvarande regel, så avgränsningen är riktig.
- **Kravet på särskilt upprättad handling och hyresnämndens godkännande vid
  avstående från besittningsskydd** (`C-TENURE-INFO`) — 12 kap. 45 a § första
  stycket.
- **Att avståendehandlingen är en egen handling och inte ett avsnitt i avtalet**
  (`src/lib/pdf/agreement.ts`) — samma lagrum.

Testsviten kördes: **57 tester, samtliga gröna.** Inget test har ändrats.

---

## 2. Verifieringsläge — vad som gick att läsa den här gången

Version 1 av rapporten inleddes med raden "Ingen paragraf i denna rapport har
kunnat läsas i sin författningstext". Det gäller inte längre. Följande hämtades i
sin helhet under körningen och ligger till grund för varje citat i rapporten:

| Källa | URL | Status | Omfång |
|---|---|---|---|
| Jordabalk (1970:994), ändrad t.o.m. SFS **2026:1498** | `data.riksdagen.se/dokument/sfs-1970-994.html` | HTTP 200 | 457 732 byte, 12 kap. läst i sin helhet |
| Lag (2012:978) om uthyrning av egen bostad, ändrad t.o.m. SFS 2021:1102 | `data.riksdagen.se/dokument/sfs-2012-978.html` | HTTP 200 | 5 251 byte, hela lagen läst |
| **Privatuthyrningslag (2026:772)** | `data.riksdagen.se/dokument/sfs-2026-772.html` | HTTP 200 | 31 736 byte, hela lagen läst |
| Lag (1994:1512) om avtalsvillkor i konsumentförhållanden | `data.riksdagen.se/dokument/sfs-1994-1512.html` | HTTP 200 | hela lagen läst |

Privatuthyrningslagen hämtades först efter att 12 kap. 1 c § jordabalken visade
sig hänvisa till en lag koden inte känner till. Den var alltså inte planerad, och
det är just den hämtningen som avslöjade F47.

Upphävandet av 2012:978 bekräftades dessutom mot en oberoende källa utanför
författningstexten:
[Sveriges Domstolar, "Nya regler för hyra och bostadsrätt sommaren 2026"](https://www.domstol.se/amnen/hyra-bostadsratt-och-arrende/nya-regler-for-hyra-och-bostadsratt-sommaren-2026/)
och
[Privatuthyrningslag (2026:772), Sveriges riksdag](https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/privatuthyrningslag-2026772_sfs-2026-772/).

### 2.1 Vad som fortfarande inte kunnat verifieras

- **Ingen hyresnämndspraxis och inga förarbeten har lästs.** Där ett fynd vilar på
  hur en paragraf tillämpas snarare än vad den säger — särskilt F13 (vad "möblerat
  rum" omfattar), F15 (vad "självständigt brukande" omfattar) och F16 (om
  bostadsrätt i andra hand träffas av 12 kap. 45 § första stycket 1) — är
  verifieringsläget lägre och det står i respektive fynd.
- **Oskälighetsbedömningen i F36** kan inte avgöras ur lagtext. Lagen (1994:1512)
  hänvisar i 11 § tillbaka till 36 § avtalslagen och innehåller ingen katalog över
  oskäliga villkor; den katalogen finns i bilagan till direktiv 93/13/EEG, som
  inte lästs. Fyndet är därför verifierat till sin rättsliga ram men inte till sin
  slutsats.
- **Rent kodlogiska och språkliga fynd** (F11, F25, F27, F29, F30, F45, F46) har
  inget lagrum att verifieras mot och är märkta därefter.
- **`SPEC_1.md` finns inte i repot.** Kodkommentarernas hänvisningar till
  specparagrafer har alltså inte kunnat läsas mot specen. De har genomgående
  behandlats som påståenden, i enlighet med rolldefinitionen.

---

## 3. Klausultabell

| # | Klausul-id | Bedömning | Fynd |
|---|---|---|---|
| 1 | `C-PARTIES` | Anmärkning | F30 |
| 2 | `C-JOINT-LIABILITY` | Anmärkning | F28 |
| 3 | `C-OBJECT` | Anmärkning | F30 |
| 4 | `C-SHARED-AREAS` | OK | — |
| 5 | `C-FURNISHING` | Anmärkning | F29 |
| 6 | `C-LEGAL-REGIME` | **Fel** | F47, F1 |
| 7 | `C-CONSENT-PENDING` | **Fel** | F24, F25 |
| 8 | `C-CONSENT-GIVEN` | OK | — |
| 9 | `C-TERM-INDEFINITE` | OK | — |
| 10 | `C-TERM-FIXED` | **Fel** | F7, F50 |
| 11 | `C-TERM-FIXED-9M` | Anmärkning | F7, F9 |
| 12 | `C-NOTICE` | **Fel** | F50, F6, F4, F10 |
| 13 | `C-NOTICE-TENANT-STATUTORY` | Anmärkning | F5, F50 |
| 14 | `C-NOTICE-FORM` | **Fel** | F8, F53 |
| 15 | `C-TENURE-NONE` | **Fel** | F2, F47 |
| 16 | `C-TENURE-INFO` | **Fel** | F13, F14, F15, F16 |
| 17 | `C-RENT-PRIVATE` | **Fel** | F51, F47 |
| 18 | `C-RENT-JB` | Anmärkning | F21 |
| 19 | `C-RENT-ADJUST` | **Fel** | F19, F57 |
| 20 | `C-PAYMENT` | Anmärkning | F23 |
| 21 | `C-LATE-INTEREST` | OK | — |
| 22 | `C-COSTS` | **Fel** | F22 |
| 23 | `C-DEPOSIT` | Anmärkning | F30 |
| 24 | `C-INSPECTION` | **Fel** | F27 |
| 25 | `C-KEYS` | **Fel** | F32 |
| 26 | `C-MAINTENANCE` | **Fel** | F31, F55 |
| 27 | `C-ACCESS` | Anmärkning | F33 |
| 28 | `C-RULES` | Anmärkning | F26 |
| 29 | `C-INSURANCE` | OK | — |
| 30 | `C-SUBLET-BAN` | Anmärkning | F18, F55 |
| 31 | `C-FORFEITURE` | **Fel** | F17, F54 |
| 32 | `C-DISPUTE` | Anmärkning | F58 |
| 33 | `C-SIGNATURES` | OK | — |

Ändringar mot version 1: `C-NOTICE`, `C-COSTS`, `C-TENURE-NONE` och
`C-RENT-PRIVATE` går från `Anmärkning`/`Kan inte bedömas` till `Fel` sedan
lagtexten kunnat läsas. Inga klausuler har flyttats åt andra hållet.

---

## 4. Fynd — lagvalet och den upphävda lagen

### F47 — `PRIVATE_2012_978` bygger på en upphävd lag

**Allvarlighetsgrad:** Blockerande
**Verifieringsläge:** Verifierad mot författningstext
**Fil:** `src/lib/legal/regime.ts` (hela `PRIVATE_2012_978`-grenen),
`src/lib/legal/clauses.ts:C-LEGAL-REGIME`, `C-RENT-PRIVATE`, `C-TENURE-NONE`,
`src/app/villkor/page.tsx` §1

Lagtext, övergångsbestämmelserna till privatuthyrningslagen (2026:772):

> 2. Genom lagen upphävs lagen (2012:978) om uthyrning av egen bostad.
> 3. Den upphävda lagen gäller dock fortfarande för avtal som har ingåtts enligt
>    den lagen.

Lagtext, 12 kap. 1 c § jordabalken (SFS 2026:773, i kraft 1 juli 2026):

> Detta kapitel gäller inte för avtal om hyra som omfattas av
> privatuthyrningslagen (2026:000), om inte annat anges i den lagen.

Två konsekvenser, båda allvarliga:

1. Varje avtal som genereras i dag under `PRIVATE_2012_978` anger i klausul
   `C-LEGAL-REGIME` att "På detta avtal tillämpas lagen (2012:978) om uthyrning av
   egen bostad" — en lag som inte gäller för avtalet. Klausulen anger dessutom i
   sin `legalBasis` "1 § lagen (2012:978) … samt 12 kap. jordabalken".
2. Den subsidiaritet som 2012:978 1 § andra stycket byggde på —
   "Bestämmelserna i 12 kap. jordabalken gäller, om inte något annat har
   föreskrivits i denna lag" — **finns inte i den nya lagen**. Privatuthyrningslagen
   är en fristående lag med bara ett fåtal uttryckliga återhänvisningar till
   jordabalken (4 kap. 7 § om tillträde → 12 kap. 26 §, 6 kap. 13 § om övergiven
   lägenhet → 12 kap. 27 §, 7 kap. 3 § om utmätning och konkurs → 12 kap. 29–31 §§).
   Alla klausuler som i dag genereras med `condition: always` och ett
   jordabalkslagrum är därför fel lagrum under privatregimen — se F53, F54, F55.

**Textförslag** för `C-LEGAL-REGIME` under den nya regimen:

> På detta avtal tillämpas privatuthyrningslagen (2026:772). {{regimeExplanation}}
>
> 12 kap. jordabalken gäller inte för avtalet, utom i de frågor där
> privatuthyrningslagen uttryckligen hänvisar dit.
>
> Avtalsvillkor som i jämförelse med privatuthyrningslagen är till nackdel för
> hyresgästen är utan verkan mot hyresgästen, om inte annat anges i lagen
> (1 kap. 4 §).

**Kodåtgärd:** byt regimnamnet `PRIVATE_2012_978` till något som inte kodar in
ett SFS-nummer, uppdatera `REGIME_META`, och behåll den gamla regimen bara om
tjänsten ska kunna generera avtal med tillträde före 1 juli 2026 — vilket den
enligt övergångsbestämmelsen punkt 3 inte kan, eftersom avtalet måste ha
*ingåtts* dessförinnan.

### F48 — Beslutstabellens rad 4 prövar "första upplåtelsen", lagen prövar "fler än två"

**Allvarlighetsgrad:** Hög
**Verifieringsläge:** Verifierad mot författningstext
**Fil:** `src/lib/legal/regime.ts`, `resolveRegimeDecision` rad 4

Koden skickar användaren till JB12 så snart `privateRentalOrdinal === "additional"`,
med motiveringen "Lagen om uthyrning av egen bostad gäller bara den första
upplåtelsen". Det var riktigt enligt 1 § tredje meningen i den upphävda lagen:

> Om fler än en lägenhet upplåts, gäller lagen endast den första upplåtelsen.

Den regeln finns inte kvar. 1 kap. 3 § första stycket privatuthyrningslagen:

> Lagen gäller inte om
> 1. hyresvärden regelmässigt hyr ut fler än två lägenheter som inte utgör del av
>    hyresvärdens bostad,
> 2. hyresvärden innehar lägenheten med hyresrätt, eller
> 3. upplåtelsen avser fritidsändamål.
>
> Om ett hyresavtal är undantaget från lagens tillämpningsområde enligt första
> stycket 1 eller 2, gäller det även om de förhållanden som anges där ändras.

Tröskeln har alltså flyttats från *andra* uthyrningen till *tredje*, och
kvalificerats med "regelmässigt" och med undantaget för lägenheter som utgör del
av hyresvärdens bostad. Den som hyr ut sin andra lägenhet får i dag ett avtal
under fel lag, med fel uppsägningstider och fel hyressättningsregel.

Punkt 2 i stycket är dessutom en **fixeringsregel** som saknar motsvarighet i koden:
har avtalet en gång fallit utanför lagen på grund av 1 eller 2, ligger det kvar
utanför även om förhållandena ändras. `resolveRegimeDecision` räknar om regimen
från de aktuella svaren varje gång.

**Kodåtgärd:** ersätt fältet `privateRentalOrdinal` med en fråga om antalet
lägenheter som hyrs ut regelmässigt och som inte utgör del av den egna bostaden,
med tröskeln vid fler än två.

### F49 — Beslutstabellens rad 1 prövar näringsverksamhet, lagen prövar personen

**Allvarlighetsgrad:** Medel
**Verifieringsläge:** Verifierad mot författningstext
**Fil:** `src/lib/legal/regime.ts`, `resolveRegimeDecision` rad 1

Koden frågar `landlordIsBusiness`. Det speglade 2012:978 1 §: "genom vilket någon
**utanför näringsverksamhet** upplåter en bostadslägenhet". Det kriteriet är
utbytt. 1 kap. 1 § första stycket privatuthyrningslagen:

> Denna lag gäller avtal genom vilka **en fysisk person eller ett dödsbo** mot
> ersättning upplåter hus eller delar av hus till någon annan för nyttjande.

Avgränsningen mot yrkesmässig uthyrning ligger numera i 1 kap. 3 § första stycket 1
(fler än två lägenheter), inte i ett näringsverksamhetsrekvisit. En privatperson
som bedriver viss näringsverksamhet men hyr ut högst två lägenheter faller alltså
numera **inom** lagen, medan koden skickar honom till JB12. Omvänt faller ett
aktiebolag utanför lagen redan på 1 kap. 1 §, oavsett antal lägenheter.

**Kodåtgärd:** rad 1 bör pröva om hyresvärden är en juridisk person (annan än ett
dödsbo). Frågan i formuläret behöver formuleras om.

### F50 — Uppsägningstiderna under privatregimen är den upphävda lagens

**Allvarlighetsgrad:** Hög
**Verifieringsläge:** Verifierad mot författningstext
**Fil:** `src/lib/legal/regime.ts`, `PRIVATE_TENANT`, `PRIVATE_LANDLORD`,
`resolveNoticePeriods`; `src/lib/legal/clauses.ts:C-NOTICE`

Koden ger under privatregimen hyresgästen **en månad** och hyresvärden **tre
månader**, båda till månadsskifte, med lagrummet "3 § lagen (2012:978)". Det var
riktigt enligt den upphävda lagens 3 § andra stycket. Nya lagen säger något annat.

6 kap. 2 § privatuthyrningslagen, avtal som gäller tills vidare:

> Ett hyresavtal som gäller tills vidare får sägas upp att upphöra att gälla vid
> ett månadsskifte som inträffar tidigast tre månader från uppsägningen.

Paragrafen skiljer **inte** på parterna. Båda har tre månader.

6 kap. 1 § privatuthyrningslagen, avtal på bestämd tid:

> Ett hyresavtal som gäller för bestämd tid upphör att gälla vid hyrestidens slut.
>
> Hyresgästen får alltid säga upp avtalet att upphöra att gälla vid ett
> månadsskifte som inträffar tidigast tre månader från uppsägningen.

Endast **hyresgästen** får säga upp ett tidsbestämt avtal i förtid. Den gamla
lagens 3 § första stycket sista mening — "Ett sådant avtal får även sägas upp till
upphörande före denna tidpunkt", som gällde båda parter — är borta. Hyresvärdens
enda väg ur ett tidsbestämt avtal i förtid är numera förverkandegrunderna i
6 kap. 3 §.

Koden ger i dag hyresvärden en generell rätt att säga upp också ett tidsbestämt
privatuthyrningsavtal med tre månaders varsel. Den rätten finns inte, och
klausulen `C-NOTICE` skriver in den i avtalet.

Tre följdanmärkningar:

- `tenantStatutoryThreeMonths` är hårdkodad till `false` under privatregimen.
  Den ska numera vara `true`: hyresgästens tremånadersrätt vid bestämd tid följer
  direkt av 6 kap. 1 § andra stycket och kan inte avtalas bort (1 kap. 4 §).
- Ettmånadsvillkoret för hyresgästen är i sig **giltigt** som avtalsvillkor,
  eftersom det är till hyresgästens fördel och 1 kap. 4 § bara sätter villkor till
  hyresgästens nackdel ur spel. Men avtalet presenterar det som lag, vilket det
  inte är, och hyresvärden kan mycket väl vilja välja bort det.
- `applyExtendedNotice` bygger på att en längre uppsägningstid får avtalas. Den
  gamla lagens 3 § andra stycket sa uttryckligen "om inte en längre uppsägningstid
  har avtalats". Den brasklappen finns **inte** i 6 kap. 2 § privatuthyrningslagen.
  Om en förlängd uppsägningstid för hyresvärden fortfarande är tillåten får avgöras
  av 1 kap. 4 § — den är till hyresgästens fördel och bör hålla — men stödet är
  inte längre uttryckligt. **Detta bör en människa ta ställning till.**

### F51 — Hyressättningsprincipen under privatregimen är avskaffad, och återbetalningspåståendet är omvänt

**Allvarlighetsgrad:** Hög
**Verifieringsläge:** Verifierad mot författningstext
**Fil:** `src/lib/legal/regime.ts`, `resolveRentRule`;
`src/lib/legal/clauses.ts:C-RENT-PRIVATE`

Koden skriver in i avtalet:

> Hyran är kostnadsbaserad. Den får inte påtagligt överstiga summan av
> kapitalkostnaden — en skälig avkastningsränta på bostadens marknadsvärde — och
> driftskostnaderna. Hyresnämnden kan sätta ned hyran för tiden framåt, men
> beslutar inte om återbetalning av redan betald hyra.

Meningarna motsvarar 4 § andra stycket i den upphävda lagen, som verkligen lyder:

> Vid en tvist om hyran ska hyresnämnden, om inte en högre hyra följer av en
> prövning enligt 12 kap. 55 § jordabalken, fastställa den till ett belopp som inte
> påtagligt överstiger kapitalkostnaden och driftskostnaderna för bostaden.
> Kapitalkostnaden beräknas som en skälig avkastningsränta på bostadens
> marknadsvärde.

Den modellen finns inte kvar. 2 kap. 5 § andra stycket privatuthyrningslagen:

> Om hyran för lägenheten är väsentligt högre än den hyra som i allmänhet tas ut
> när liknande eller i motsvarande omfattning efterfrågade lägenheter hyrs ut
> enligt denna lag, ska hyresnämnden fastställa den till ett belopp som är skäligt
> vid en jämförelse med i första hand hyran för sådana lägenheter.

Prövningen är alltså en **marknadsjämförelse mot andra privatuthyrda lägenheter**,
inte en kostnadskalkyl. Varken "kapitalkostnad", "avkastningsränta" eller
"marknadsvärde" förekommer i den nya lagen.

Allvarligast är sista meningen i klausulen. 2 kap. 6 § privatuthyrningslagen:

> Den nya hyran ska gälla från dagen för ansökan hos hyresnämnden om inte
> hyresnämnden beslutar att den ska gälla från en annan tidpunkt.
>
> **Om hyran sänks för förfluten tid, ska hyresvärden samtidigt förpliktas att till
> hyresgästen betala tillbaka det som han eller hon till följd av beslutet har
> tagit emot för mycket och ränta på beloppet.** Räntan ska beräknas enligt 5 §
> räntelagen (1975:635) för tiden från dagen för beloppets mottagande till dess
> beslutet fått laga kraft och enligt 6 § räntelagen för tiden därefter.

Avtalet upplyser alltså hyresgästen om att någon återbetalning inte kan komma i
fråga, i ett läge där lagen tvärtom ålägger hyresvärden att betala tillbaka med
ränta. Det är den upplysning i hela dokumentet som är mest ägnad att avhålla en
hyresgäst från att ta tillvara sin rätt.

**Textförslag:**

> Hyran uppgår till {{totalRent}} per månad, varav grundhyra {{baseRent}}.
>
> Hyresgästen kan enligt 2 kap. 5 § privatuthyrningslagen ansöka hos hyresnämnden
> om ändring av hyran. Är hyran väsentligt högre än den hyra som i allmänhet tas ut
> när liknande lägenheter hyrs ut privat, fastställer nämnden den till ett skäligt
> belopp vid en jämförelse med sådana lägenheter.
>
> Den nya hyran gäller från dagen för ansökan hos hyresnämnden, om nämnden inte
> beslutar annat. Sänks hyran för förfluten tid ska hyresvärden betala tillbaka det
> som tagits emot för mycket, med ränta enligt 2 kap. 6 § tredje stycket
> privatuthyrningslagen.

### F52 — 12 kap. 1 § jordabalken är omnumrerad; kodkommentaren pekar på ett stycke som inte finns

**Allvarlighetsgrad:** Medel
**Verifieringsläge:** Verifierad mot författningstext
**Fil:** `src/lib/legal/regime.ts`, kommentaren över `applyExtendedNotice`
(bekräftar och ersätter version 1:s F12)

Kommentaren hänvisar till "12 kap. 1 § sjätte stycket JB". Genom SFS 2026:773
(i kraft 1 juli 2026) har 12 kap. 1 § delats upp. Den tvingande bestämmelsen är
numera en egen paragraf, 12 kap. 1 d §:

> Avtalsvillkor som strider mot en bestämmelse i detta kapitel är utan verkan mot
> hyresgästen eller den som har rätt att träda i hans eller hennes ställe, om inte
> annat anges.

Vidare: definitionen av bostadslägenhet ligger nu i 1 b §, undantaget för
privatuthyrningsavtal i 1 c §, och blockhyresreglerna i 1 e–1 f §§. Version 1 av
rapporten noterade att kommentaren angav fel *stycke*; rätt svar är att paragrafen
inte längre har det stycket alls.

Samma omnumrering träffar version 1:s F24, som hänvisade till "12 kap. 1 § femte
stycket". Rätt lagrum är 12 kap. 1 d §.

### F1 — `C-LEGAL-REGIME` beskriver ett subsidiaritetsförhållande som inte längre finns

**Allvarlighetsgrad:** Hög
**Verifieringsläge:** Verifierad mot författningstext — **Omvärderat**
**Fil:** `src/lib/legal/clauses.ts`, `C-LEGAL-REGIME`

Version 1 anmärkte att klausulen *döljer* att 12 kap. JB gäller subsidiärt under
privatregimen. Med lagtexten framför sig är förhållandet det motsatta.

Under den upphävda lagen fanns subsidiariteten (1 § andra stycket: "Bestämmelserna
i 12 kap. jordabalken gäller, om inte något annat har föreskrivits i denna lag").
Under privatuthyrningslagen finns den inte. 12 kap. 1 c § jordabalken säger
uttryckligen att kapitlet **inte gäller** för avtal som omfattas av
privatuthyrningslagen.

Klausulens `legalBasis` — "1 § lagen (2012:978) om uthyrning av egen bostad samt
12 kap. jordabalken" — är alltså fel på båda leden: fel lag, och en
jordabalkshänvisning som numera är utesluten.

Klausulens andra stycke ("Avtalsvillkor som är mindre förmånliga för hyresgästen än
vad som följer av tvingande bestämmelser i tillämplig lag är utan verkan") **håller**
i sak, med stöd av 1 kap. 4 § privatuthyrningslagen respektive 12 kap. 1 d §
jordabalken. Formuleringen "utan verkan" bör dock skärpas till lagens "utan verkan
**mot hyresgästen**" — villkoret är inte ogiltigt i förhållande till hyresvärden.

### F2 — `3 a § lagen (2012:978)` var fel lagrum redan i den upphävda lagen

**Allvarlighetsgrad:** Hög
**Verifieringsläge:** Verifierad mot författningstext — **Omvärderat** (version 1:
"kan inte verifieras")
**Fil:** `src/lib/legal/regime.ts`, `resolveSecurityOfTenure`, privatgrenen

Koden anger `legalBasis: "3 a § lagen (2012:978) om uthyrning av egen bostad"` för
påståendet att hyresgästen saknar rätt till förlängning. 3 a § i den lagen lyder i
sin helhet:

> Hyresgästen har inte rätt till ett nytt hyresavtal enligt 12 kap. 46 a §
> jordabalken. Lag (2021:1102).

12 kap. 46 a § jordabalken handlar om något helt annat:

> Om hyresavtalet förfaller på grund av att lägenheten blir så förstörd att den inte
> kan användas som bostad har hyresgästen, om det är skäligt, rätt att bli erbjuden
> ett nytt hyresavtal när en lägenhet blir tillgänglig för upplåtelse.

Regeln om utebliven förlängningsrätt låg i **3 § tredje stycket**:

> Hyresgästen har inte rätt till förlängning av hyresavtalet, om parterna inte
> avtalar något annat.

Lagrummet i koden pekade alltså på undantaget för förstörd lägenhet i stället för
på besittningsskyddet. Fyndet är numera i huvudsak historiskt: under
privatuthyrningslagen finns ingen förlängningsrätt alls att hänvisa till, och
lagrummet ska bytas ut mot lagens systematik (6 kap. privatuthyrningslagen reglerar
upphörande uttömmande och innehåller ingen förlängningsrätt).

**Textförslag** för `C-TENURE-NONE` under privatregimen:

> Privatuthyrningslagen ger inte hyresgästen någon rätt till förlängning av
> hyresavtalet. Avtalet upphör därför när hyrestiden löper ut eller när det sägs upp
> enligt 6 kap. privatuthyrningslagen, utan prövning av förlängningsfrågan.

### F3 — `privateRentalOrdinal` ställer en annan fråga än den koden svarar på

**Allvarlighetsgrad:** Medel
**Verifieringsläge:** Kan inte verifieras (formulärformulering, inte lagrum)
**Fil:** `src/lib/legal/regime.ts`, `resolveRegimeDecision` rad 4

Fältet uppgår i F48 och bör tas bort tillsammans med den regeln.

---

## 5. Fynd — uppsägningstider och uppsägningsform

### F7 — Nio-månadersregeln prövas mot hyrestiden, inte mot hyresförhållandet

**Allvarlighetsgrad:** Hög
**Verifieringsläge:** Verifierad mot författningstext — **Bekräftat**
**Fil:** `src/lib/legal/regime.ts`, `resolveLegalContext`, `requiresNoticeToEnd`

12 kap. 3 § andra stycket jordabalken:

> Hyresavtal kan även ingås för bestämd tid. Sådana avtal upphör att gälla vid
> hyrestidens utgång, om inte annat har avtalats. **Har hyresförhållandet varat mer
> än nio månader i följd, skall dock avtalet alltid sägas upp för att upphöra att
> gälla.**

Lagen prövar hur länge **hyresförhållandet** har varat. Koden prövar den avtalade
hyrestiden:

```
requiresNoticeToEnd =
  regime === "JB12" && isFixed && !!start && !!end && exceedsMonths(start, end, 9);
```

Det ger rätt svar i det enkla fallet (en avtalad hyrestid över nio månader innebär
att hyresförhållandet varat över nio månader vid hyrestidens utgång) men **fel svar
vid förlängning**. Med `fixedTermRenewal === "auto_renew_same"` och en ursprunglig
hyrestid om sex månader har hyresförhållandet efter den första förlängningen varat
tolv månader. Uppsägningsplikten har då inträtt enligt 3 § andra stycket, men
`requiresNoticeToEnd` är fortfarande `false`: klausulen `C-TERM-FIXED-9M` genereras
inte, varningen `W-FIXED-9M` visas inte, och avtalet upplyser tvärtom om att det
"förlängs med en tid som motsvarar den ursprungliga hyrestiden" om det inte sägs
upp — utan att nämna att uppsägning nu är obligatorisk för att det ska upphöra.

Klausulen `C-TERM-FIXED` säger heller aldrig vad som händer när uppsägning uteblir.
12 kap. 3 § tredje stycket:

> Ett hyresavtal, som är ingånget för bestämd tid, anses förlängt på obestämd tid.
> 1. om avtalet saknar bestämmelser om verkan av utebliven uppsägning och inte sägs
>    upp till hyrestidens utgång trots att uppsägning skall ske, eller
> 2. om hyresgästen, trots att avtalet upphört att gälla utan uppsägning, fortsatt
>    att använda lägenheten en månad efter hyrestidens utgång utan att hyresvärden
>    anmodat honom att flytta.

Punkt 2 är särskilt relevant: den träffar även avtal där uppsägning *inte* krävdes.
En hyresvärd som låter hyresgästen bo kvar en månad efter hyrestidens utgång utan
att anmoda avflyttning får ett tillsvidareavtal — med full uppsägningstid och,
vid JB12, besittningsskydd.

**Kodåtgärd:** `requiresNoticeToEnd` bör beräknas på hyresförhållandets sammanlagda
längd, dvs. `startDate` till slutet av den **förlängda** perioden när
`fixedTermRenewal !== "none"`. Ett minimum är att sätta `requiresNoticeToEnd = true`
så snart `fixedTermRenewal === "auto_renew_same"` och den samlade tiden efter första
förlängningen överstiger nio månader.

**Textförslag** för `C-TERM-FIXED`, tredje stycket:

> Om avtalet inte sägs upp och hyresgästen bor kvar mer än en månad efter
> hyrestidens utgång utan att hyresvärden anmodat hyresgästen att flytta, anses
> avtalet förlängt på obestämd tid (12 kap. 3 § tredje stycket jordabalken).

### F8 — `C-NOTICE-FORM` återger 12 kap. 8 § fel — men inte på det sätt version 1 påstod

**Allvarlighetsgrad:** Hög
**Verifieringsläge:** Verifierad mot författningstext — **Delvis avfärdat, delvis
bekräftat**
**Fil:** `src/lib/legal/clauses.ts`, `C-NOTICE-FORM`

Klausulen lyder:

> En uppsägning ska vara skriftlig. Uppsägningen ska delges motparten. Skriftlig
> uppsägning som sänds i rekommenderat brev till motpartens senast kända adress
> anses ha skett när brevet lämnades in för postbefordran.

12 kap. 8 § första stycket:

> En uppsägning skall vara skriftlig, **om hyresförhållandet har varat längre än tre
> månader i följd** vid den tidpunkt till vilken uppsägningen sker. Uppsägningen får
> dock, utom i fall som avses i 58 a §, vara muntlig, om det är hyresgästen som säger
> upp avtalet för upphörande och hyresvärden lämnar ett skriftligt erkännande av
> uppsägningen.

12 kap. 8 § fjärde stycket:

> Har den som söks för uppsägning **hemvist här i landet** och är det **inte fråga om
> en uppsägning i förtid enligt 42 §** eller en sådan uppsägning som avses i 58 §, får
> uppsägningen sändas i rekommenderat brev. Uppsägningen anses då ha skett när den
> har avlämnats för postbefordran under den söktes vanliga adress. Har hyresgästen
> lämnat hyresvärden uppgift om en adress, under vilken meddelanden till honom skall
> sändas, anses den som hans vanliga adress. I annat fall anses den uthyrda
> lägenhetens adress som hyresgästens vanliga adress.

**Vad version 1 hade fel om.** Version 1 anmärkte att klausulen återger presumtionen
"symmetriskt". Lagtexten är symmetrisk: fjärde stycket talar om "den som söks för
uppsägning", vilket kan vara endera parten. Den delen av fyndet faller.

**Vad som står sig, och som är det egentliga felet.** Presumtionen är **villkorad**,
och klausulen återger den ovillkorat:

1. Den gäller inte om den som söks saknar hemvist i Sverige — då krävs kungörelse
   enligt femte stycket.
2. Den gäller **inte vid uppsägning i förtid enligt 42 §**, alltså inte i just det
   läge där en hyresvärd är mest angelägen att kunna åberopa den. Det är den
   allvarligaste utelämningen: en hyresvärd som förverkandesäger upp per
   rekommenderat brev och förlitar sig på avtalets lydelse har inte sagt upp giltigt.
3. Skriftlighetskravet gäller bara när hyresförhållandet varat mer än tre månader,
   och hyresgästen får säga upp muntligt mot skriftligt erkännande.
4. Huvudregeln är **delgivning** enligt 8 kap. 8 § andra och tredje styckena;
   rekommenderat brev är ett alternativ, inte en beskrivning av delgivningen. Att
   klausulen skriver "senast kända adress" i stället för lagens "vanliga adress"
   med dess definitionsordning är en ytterligare avvikelse.

**Textförslag:**

> En uppsägning ska vara skriftlig. Har hyresförhållandet varat högst tre månader
> får hyresgästen säga upp avtalet muntligen, om hyresvärden lämnar ett skriftligt
> erkännande av uppsägningen.
>
> En skriftlig uppsägning ska delges den som söks för uppsägningen. Har mottagaren
> hemvist i Sverige får uppsägningen i stället sändas i rekommenderat brev till
> mottagarens vanliga adress; uppsägningen anses då ha skett när brevet lämnades in
> för postbefordran. Detta gäller dock inte vid uppsägning i förtid på grund av
> förverkande.
>
> Parterna ska underrätta varandra om ändrade kontaktuppgifter. Har hyresgästen
> uppgett en adress för meddelanden gäller den som hyresgästens vanliga adress; i
> annat fall gäller lägenhetens adress.

### F53 — `C-NOTICE-FORM` genereras även under privatregimen, där 12 kap. 8 § inte gäller

**Allvarlighetsgrad:** Hög
**Verifieringsläge:** Verifierad mot författningstext
**Fil:** `src/lib/legal/clauses.ts`, `C-NOTICE-FORM` (`condition: always`)

Under privatuthyrningslagen gäller inte 12 kap. jordabalken (1 c §), och
uppsägningsformen regleras i stället i 6 kap. 7–9 §§, med ett moment som helt
saknas i avtalet: **den elektroniska adressen.**

6 kap. 7 §:

> En uppsägning ska vara skriftlig. Uppsägningen får dock vara muntlig, om det är
> hyresgästen som säger upp hyresavtalet och hyresvärden lämnar ett skriftligt
> erkännande av uppsägningen.
>
> En uppsägning har skett när den som söks för uppsägningen har tagit emot den.

6 kap. 8 §:

> Om den som söks för uppsägning har angett en elektronisk adress som meddelanden
> till honom eller henne med anledning av hyresavtalet kan skickas till, ska
> uppsägning anses ha skett när uppsägningen har skickats till den adressen.
>
> Om den som söks för uppsägning har hemvist i Sverige, ska uppsägning också anses
> ha skett när ett rekommenderat brev med uppsägningen, adresserat till den söktes
> vanliga adress, har lämnats in för postbefordran.

Skillnaderna mot avtalets text: skriftlighetskravet är ovillkorat (ingen
tremånadersgräns), huvudregeln är **mottagandet** och inte delgivning, det finns
inget undantag för förtida uppsägning, och e-postadress som parten uppgett räcker.
Eftersom avtalet har ett fält för `landlordEmail` och `tenant.email` är det sista
en praktiskt viktig upplysning som avtalet i dag inte ger.

**Kodåtgärd:** dela klausulen i `C-NOTICE-FORM-JB` och `C-NOTICE-FORM-PRIVATE` med
`condition` på `ctx.regime`.

### F4 — `{{noticeLegalBasis}}` anger bara hyresvärdens lagrum

**Allvarlighetsgrad:** Låg
**Verifieringsläge:** Kan inte verifieras (kodlogik)
**Fil:** `src/lib/legal/clauses.ts`, `templateValues`

`noticeLegalBasis: ctx.noticePeriods.landlord.legalBasis`. I dag är de två
lagrummen identiska i alla regimer utom när `applyExtendedNotice` lägger till
", avtalad förlängning" på hyresvärdens — och då står det i avtalet att *båda*
parters uppsägningstider följer en avtalad förlängning, vilket är fel. Bör
renderas som två separata lagrum.

### F5 — `C-NOTICE` och `C-NOTICE-TENANT-STATUTORY` motsäger varandra vid korta hyrestider

**Allvarlighetsgrad:** Medel
**Verifieringsläge:** Verifierad mot författningstext — **Bekräftat**
**Fil:** `src/lib/legal/clauses.ts`; `src/lib/legal/regime.ts`, `jbFixedTermNotice`

Vid en JB12-hyrestid om två månader får hyresgästen enligt `C-NOTICE` läsa att
avtalet kan sägas upp "senast en vecka före hyrestidens utgång", och två klausuler
senare att hyresgästen "alltid" har tre månaders uppsägningstid. Båda är riktiga —
12 kap. 4 § andra stycket 2 respektive 12 kap. 5 § första stycket — men de svarar
på olika frågor (uppsägning **till** hyrestidens utgång respektive uppsägning **i
förtid**) och avtalet gör inte den skillnaden. Vid korta hyrestider blir
tremånadersrätten dessutom praktiskt meningslös och riskerar att uppfattas som en
skyldighet.

**Textförslag** (tillägg sist i `C-NOTICE-TENANT-STATUTORY`):

> Denna rätt avser uppsägning i förtid och gäller vid sidan av vad som ovan angetts
> om uppsägning till hyrestidens utgång. Är den återstående hyrestiden kortare än
> tre månader upphör avtalet vid hyrestidens utgång.

### F6 — Hyresvärdens uppsägningsrätt vid bestämd tid framställs som fri

**Allvarlighetsgrad:** Medel
**Verifieringsläge:** Verifierad mot författningstext — **Bekräftat**
**Fil:** `src/lib/legal/clauses.ts`, `C-NOTICE`

12 kap. 4 § andra stycket inleds "**Skall** ett hyresavtal för bestämd tid sägas upp
för att upphöra att gälla…". Paragrafen anger uppsägningstiden för att avsluta
avtalet **vid hyrestidens utgång** — den ger ingen rätt att avsluta ett tidsbestämt
avtal i förtid. Under JB12 kan hyresvärden avsluta i förtid bara vid förverkande
(42 §) eller enligt 6 §. Under privatregimen inte alls (se F50).

Klausulens formulering "Hyresvärden kan säga upp avtalet senast tre månader före
hyrestidens utgång" är i sig riktig, men läses lätt som en fri uppsägningsrätt.
Ett förtydligande stycke bör läggas till.

### F9 — `C-TERM-FIXED-9M` talar om avsedd hyrestid, lagen om förfluten tid

**Allvarlighetsgrad:** Låg
**Verifieringsläge:** Verifierad mot författningstext — **Bekräftat**

Klausulen skriver "Eftersom hyresförhållandet **avses vara** längre än nio
månader"; 3 § andra stycket kräver att det **har varat** mer än nio månader i
följd. Skillnaden märks först om avtalet avslutas i förtid. Byt till "Eftersom
hyresförhållandet kommer att ha varat mer än nio månader i följd vid hyrestidens
utgång".

### F10 — `describeNotice` säger "tidigast" även där lagen säger "närmast efter"

**Allvarlighetsgrad:** Låg
**Verifieringsläge:** Verifierad mot författningstext — **Bekräftat**
**Fil:** `src/lib/legal/regime.ts`, `describeNotice`

Båda formuleringarna finns i lagen, men i olika paragrafer, och koden använder fel
i ett fall. 12 kap. 4 § första stycket 1 (tillsvidareavtal): "vid det månadsskifte
som inträffar **närmast efter** tre månader från uppsägningen". 12 kap. 5 § första
stycket (hyresgästens rätt) och 6 kap. 2 § privatuthyrningslagen: "**tidigast**".

"Närmast efter" fixerar upphörandedagen; "tidigast" tillåter en senare dag.
`describeNotice` renderar alltid "tidigast", vilket för `JB_INDEFINITE` avviker från
lagtexten. Låt `NoticePeriod` bära ett fält som skiljer de två.

### F11 — `applyExtendedNotice` tappar tyst avtalad förlängning vid dagar och veckor

**Allvarlighetsgrad:** Låg
**Verifieringsläge:** Kan inte verifieras (kodlogik)

`if (!extended || !landlord.months || ...) return landlord;` — en avtalad
förlängning ignoreras utan spår när grundperioden uttrycks i dagar eller veckor
(kort hyrestid under JB12). Antingen normalisera till månader eller avvisa
inmatningen i valideringen.

### F12 — Se F52

Uppgår i F52.

---

## 6. Fynd — besittningsskydd

### F13 — "Möblerat rum" tolkas som möblerad etta

**Allvarlighetsgrad:** Hög
**Verifieringsläge:** Verifierad mot författningstext (rekvisitets **omfattning**
vilar dock på tolkning — se nedan) — **Bekräftat**
**Fil:** `src/lib/legal/regime.ts`, `isFurnishedRoomOrLeisure`

12 kap. 45 § första stycket 2 jordabalken:

> Bestämmelserna i 46–52 §§ gäller vid upplåtelser av bostadslägenheter, om inte
> […]
> 2. hyresavtalet i annat fall än som sägs i 1 avser **ett möblerat rum** eller en
>    lägenhet för fritidsändamål och hyresförhållandet upphör innan det har varat
>    längre än nio månader i följd,

Koden:

```
return a.furnished !== "none" && a.furnished !== "" && a.rooms === 1;
```

Lagtexten skiljer genomgående på "rum" och "lägenhet" — samma punkt använder båda
orden i samma mening, och 12 kap. 1 § definierar "lägenhet" som ett hus eller en del
av ett hus som upplåts genom avtalet. En självständig enrumslägenhet med eget kök
och egen hygienutrymme är en lägenhet, inte ett rum. Kodens villkor fångar därför
en stor och vanlig grupp — den möblerade ettan — och berövar den hyresgästen den
upplysning om besittningsskydd hon har rätt till.

Villkoret är dessutom vidare än nödvändigt åt två håll: `furnished === "partial"`
räcker (lagen talar om ett *möblerat* rum), och `rooms === 1` säger ingenting om
huruvida upplåtelsen avser ett rum eller en lägenhet.

**Var gränsen exakt går kan jag inte avgöra ur lagtexten** — det kräver
hyresnämndspraxis, som inte lästs. Men att en möblerad etta faller **utanför**
punkt 2 följer redan av att lagen använder två olika ord.

**Kodåtgärd:** knyt villkoret till `propertyType`/upplåtelsens art, inte till
rumsantalet. Ett möblerat rum är i praktiken `room_in_own_home` eller motsvarande
upplåtelse av ett rum utan självständigt hushåll — och `room_in_own_home` fångas
redan av punkt 3, som är förmånligare för hyresvärden (inget besittningsskydd alls,
inte bara efter nio månader). Sannolikt bör grenen antingen tas bort eller villkoras
av ett eget formulärfält "upplåtelsen avser ett möblerat rum, inte en självständig
lägenhet". **Detta är ett ställningstagande för en människa.**

### F14 — `holiday_home` behandlas som fritidsändamål oavsett användning

**Allvarlighetsgrad:** Medel
**Verifieringsläge:** Verifierad mot författningstext — **Bekräftat**

`isFurnishedRoomOrLeisure` returnerar `true` redan på `propertyType === "holiday_home"`.
45 § första stycket 2 talar om "en lägenhet **för fritidsändamål**" — ändamålet med
upplåtelsen, inte byggnadstypen. Ett fritidshus som hyrs ut för permanentboende är
inte en lägenhet för fritidsändamål. Samma sak i 1 kap. 3 § första stycket 3
privatuthyrningslagen ("upplåtelsen avser fritidsändamål").

Koden har redan fältet `purpose`. Villkoret bör bygga på det ensamt.

### F15 — 24-månadersregeln tillämpas även när bara en del av lägenheten upplåts

**Allvarlighetsgrad:** Medel
**Verifieringsläge:** Verifierad mot författningstext (rekvisitet "självständigt
brukande" vilar på tolkning) — **Bekräftat**

45 § första stycket 1 kräver upplåtelse "i andra hand till annan för **självständigt
brukande**". `isSublet()` prövar bara `landlordTitle` och tar ingen hänsyn till om
upplåtelsen avser hela lägenheten eller ett rum. Vägledning finns i 12 kap. 39 §
andra stycket:

> Om det är fråga om en bostadslägenhet som hyresgästen inte använder som bostad i
> beaktansvärd utsträckning, ska en upplåtelse av lägenheten eller en del av den
> alltid anses vara för självständigt brukande.

Motsatsvis: bor förstahandshyresgästen kvar är en upplåtelse av ett rum normalt
**inte** för självständigt brukande, utan ett inneboendeförhållande enligt 41 §.
Då gäller inte punkt 1, och den upplysning avtalet ger om tvåårsgränsen är fel.

### F16 — Bostadsrätt i andra hand under JB12 får `full` besittningsskydd

**Allvarlighetsgrad:** Medel
**Verifieringsläge:** Verifierad mot författningstext (systematiskt argument) —
**Bekräftat**

`isSublet()` omfattar bara `first_hand_lease` och `second_hand`. En
bostadsrättshavare som hyr ut under JB12 (t.ex. sin tredje lägenhet, eller för
fritidsändamål) faller i `full`-grenen och får i avtalet läsa att hyresgästen har
fullt besittningsskydd från dag ett.

45 § första stycket 1 talar om "upplåtelse av en lägenhet i andra hand" utan att
begränsa sig till hyresrätt. Att bostadsrätt omfattas stöds av 45 a § första
stycket 2 b, som uttryckligen räknar med att en hyresvärd vid andrahandsupplåtelse
kan inneha lägenheten med bostadsrätt:

> b) i fråga om en bostadslägenhet som upplåts i andra hand, hyresvärden ska bosätta
> sig i lägenheten eller, **när hyresvärden innehar lägenheten med bostadsrätt**,
> bosätta sig i den eller överlåta bostadsrätten,

Om bostadsrättsuthyrning inte vore "upplåtelse i andra hand" i 12 kap:s mening vore
den meningen obegriplig. Slutsatsen bör ändå bekräftas av en människa mot praxis.

---

## 7. Fynd — förverkande

### F17 — `C-FORFEITURE` utelämnar rättelse, uppmaning, ringa-ventilen och socialnämnden

**Allvarlighetsgrad:** Hög
**Verifieringsläge:** Verifierad mot författningstext — **Bekräftat och skärpt**
**Fil:** `src/lib/legal/clauses.ts`, `C-FORFEITURE`

Klausulen lyder:

> Hyresrätten är förverkad och hyresvärden har rätt att säga upp avtalet i förtid
> bland annat om hyresgästen dröjer med att betala hyran mer än en vecka efter
> förfallodagen, utan behövligt samtycke upplåter lägenheten i andra hand,
> vanvårdar lägenheten eller utsätter omgivningen för störningar.

Fyra av lagens moment saknas.

**1. Rättelse efter uppmaning.** 12 kap. 42 § första stycket 9:

> 9. om lägenheten vanvårdas på något annat sätt eller hyresgästen […] gör sig
>    skyldig till bristande skötsamhet eller störningar i boendet eller inte håller
>    den tillsyn som krävs enligt 25 b § **och rättelse inte görs utan dröjsmål
>    efter uppmaning**,

Både vanvård och störningar — de två grunder klausulen räknar upp vid sidan av
hyra och andrahandsupplåtelse — förutsätter alltså att hyresvärden först har
uppmanat till rättelse. Klausulen framställer dem som omedelbart verkande.

**2. Giltig ursäkt vid andrahandsupplåtelse.** 42 § första stycket 3 slutar "…**och
inte kan visa någon giltig ursäkt**". Även det saknas.

**3. Ringa-ventilen.** 42 § femte stycket:

> Hyresrätten är inte förverkad om det som ligger hyresgästen till last är av ringa
> betydelse. Detsamma gäller om ett förverkande är oskäligt med hänsyn till att det
> som ligger hyresgästen till last har sin grund i att en närstående eller tidigare
> närstående har utsatt hyresgästen eller någon i hyresgästens hushåll för brott.

Andra meningen — våldsutsatthetsventilen — saknas helt i avtalet och i version 1 av
rapporten.

**4. Underrättelse till socialnämnden.** 42 § tredje stycket:

> Ett hyresavtal som gäller bostadslägenhet får inte sägas upp enligt första stycket
> 9 på grund av bristande skötsamhet eller störningar i boendet förrän socialnämnden
> underrättats enligt 25 a §.

Klausulens avslutning — "rätt att återvinna hyresrätten enligt 12 kap. 43–44 §§" —
är dessutom oprecis: 43 § handlar om **rättelse och tidsfrister**, inte återvinning.
Återvinningsregeln är 44 §, och den är procedurbunden (tre veckor från delgiven
underrättelse, med meddelande till socialnämnden).

**Textförslag:**

> Hyresrätten kan förverkas och hyresvärden få rätt att säga upp avtalet i förtid,
> bland annat om hyresgästen dröjer med att betala hyran mer än en vecka efter
> förfallodagen, utan behövligt samtycke upplåter lägenheten i andra hand och inte
> kan visa någon giltig ursäkt, eller vanvårdar lägenheten, brister i skötsamhet
> eller utsätter omgivningen för störningar och inte gör rättelse utan dröjsmål
> efter uppmaning från hyresvärden.
>
> Hyresrätten är inte förverkad om det som ligger hyresgästen till last är av ringa
> betydelse, eller om ett förverkande vore oskäligt med hänsyn till att det som
> ligger hyresgästen till last har sin grund i att en närstående utsatt hyresgästen
> eller någon i hushållet för brott (12 kap. 42 § femte stycket jordabalken).
>
> Vid uppsägning på grund av bristande skötsamhet eller störningar i boendet ska
> hyresvärden först underrätta socialnämnden (12 kap. 25 a och 42 §§ jordabalken).
>
> Har avtalet sagts upp på grund av dröjsmål med hyran får hyresgästen behålla
> lägenheten om hyran betalas inom tre veckor från det att hyresgästen delgetts
> underrättelse om detta (12 kap. 44 § jordabalken).

### F54 — `C-FORFEITURE` genereras även under privatregimen, med fel grunder

**Allvarlighetsgrad:** Hög
**Verifieringsläge:** Verifierad mot författningstext
**Fil:** `src/lib/legal/clauses.ts`, `C-FORFEITURE` (`condition: always`,
`legalBasis: "12 kap. 42 § jordabalken"`)

Under privatuthyrningslagen gäller 6 kap. 3 §, som skiljer sig i flera avseenden.
Först och främst betalningsfristen:

> Hyresvärden har rätt att säga upp avtalet till att omedelbart upphöra, om
> 1. hyresgästen dröjer med att betala hyran mer än **två veckor** efter
>    förfallodagen,

Avtalet anger **en vecka**. Det är ett villkor till hyresgästens nackdel och därmed
utan verkan enligt 1 kap. 4 § — men hyresgästen som läser sitt avtal tror att hon
har halva den tid hon faktiskt har.

Vidare: rättelsemomenten är inbyggda direkt i punkterna 3–7, ringa-ventilen finns i
tredje stycket ("Hyresvärden har inte rätt att säga upp avtalet i förtid om det som
ligger hyresgästen till last är av ringa betydelse"), rättelse före uppsägning
befriar enligt 5 §, och 6 § inför uppsägningsfrister om sex månader som saknar
motsvarighet i avtalet. Det finns däremot **ingen återvinningsregel motsvarande
12 kap. 44 §** — hänvisningen i avtalets sista mening är alltså rakt av fel under
privatregimen.

**Kodåtgärd:** dela i `C-FORFEITURE-JB` och `C-FORFEITURE-PRIVATE`.

### F18 — `C-SUBLET-BAN` nämner inte hyresgästens rätt till tillstånd

**Allvarlighetsgrad:** Låg
**Verifieringsläge:** Verifierad mot författningstext — **Bekräftat**

Klausulen förbjuder andrahandsupplåtelse utan skriftligt samtycke och stannar där.
12 kap. 40 § första stycket:

> En hyresgäst får hyra ut eller på något annat sätt upplåta lägenheten i andra hand
> till någon annan för självständigt brukande, om hyresnämnden lämnar tillstånd till
> det.

Rätten att gå till hyresnämnden när samtycke vägras är tvingande (1 d §) och kan
inte avtalas bort. Klausulen bör nämna den. Under privatregimen finns **ingen**
motsvarande tillståndsväg — 5 kap. 2 § privatuthyrningslagen kräver samtycke utan
undantag — vilket gör att klausulen behöver skilja på regimerna (se F55).

---

## 8. Fynd — hyra, driftskostnader och betalning

### F19 — `C-RENT-ADJUST`: rätt slutsats, fel lagrum — och strängare än version 1 trodde

**Allvarlighetsgrad:** Hög
**Verifieringsläge:** Verifierad mot författningstext — **Omvärderat**
**Fil:** `src/lib/legal/clauses.ts`, `C-RENT-ADJUST`

Version 1 skrev att en indexklausul enligt 12 kap. 19 § gäller "bara om hyresavtalet
är träffat för bestämd tid som är minst tre år". **Det är fel lagrum.**
Treårsregeln står i 19 § **tredje** stycket, som inleds:

> **Hyran för lokaler** ska också vara till beloppet bestämd i avtalet till den del
> den inte omfattar ersättning som avses i första stycket andra meningen. Trots detta
> gäller dock förbehåll i avtalet om att hyran ska utgå med ett belopp som står i
> visst förhållande till hyresgästens rörelseintäkter […] Om avtalet är träffat för
> bestämd tid och hyrestiden är minst tre år, gäller dessutom förbehåll om att hyran
> ska utgå med belopp som bestäms enligt en annan beräkningsgrund än som nu har
> angetts.

Det är en lokalregel. För bostadslägenheter gäller första stycket, och där finns
**ingen** indexöppning över huvud taget:

> Hyran för bostadslägenheter ska vara till beloppet bestämd i hyresavtalet eller,
> om avtalet innehåller förhandlingsklausul enligt hyresförhandlingslagen (1978:304),
> i förhandlingsöverenskommelse.

Slutsatsen i version 1 — att den genererade indexklausulen är utan verkan — står
alltså kvar, men av en strängare anledning: en indexklausul för en bostadslägenhet
under JB12 är aldrig giltig, oavsett hyrestidens längd. Version 1:s alternativa
textförslag ("alternativt, när hyrestiden faktiskt är minst tre år: … har parterna
avtalat att hyran räknas om enligt {{rentAdjustmentIndex}}") ska **inte** användas.

Påföljden är kännbar. 19 § femte stycket:

> Har avtal träffats i strid med första, tredje eller fjärde stycket, ska hyran utgå
> med ett belopp som är skäligt med hänsyn främst till parternas avsikter och övriga
> förhållanden när avtalet träffades.

Det är inte bara indexklausulen som faller — hela den avtalade hyran ersätts av en
skälighetsbedömning.

**Det finns däremot en laglig väg, som koden inte erbjuder.** 19 § andra stycket:

> I fråga om bostadslägenheter som hyrs ut i andra hand eller som upplåtaren innehar
> med bostadsrätt får det trots första stycket avtalas att hyran ska anknytas till
> den hyra, årsavgift eller avgift för andrahandsupplåtelse som upplåtaren betalar.

Det är precis tjänstens typfall. En anknytningsklausul är det korrekta alternativet
till indexklausulen för andrahandsuthyrning och bostadsrätt.

**Textförslag** (JB12, andrahand eller bostadsrätt):

> Hyran är bestämd till belopp enligt ovan. Ändras den hyra, årsavgift eller avgift
> för andrahandsupplåtelse som hyresvärden själv betalar för lägenheten, ändras
> hyran i motsvarande mån. Detta följer av 12 kap. 19 § andra stycket jordabalken.
> Hyresvärden ska underrätta hyresgästen skriftligen om ändringen, som gäller
> tidigast från den månad som infaller närmast efter underrättelsen.

**Textförslag** (JB12 i övrigt):

> Hyran för en bostadslägenhet ska enligt 12 kap. 19 § första stycket jordabalken
> vara bestämd till belopp i avtalet. Hyran kan därför ändras endast genom en ny
> överenskommelse mellan parterna eller efter prövning i hyresnämnden enligt
> 12 kap. 54 och 55 §§ jordabalken.

**Kodåtgärd:** `rentAdjustment === "index"` bör blockeras i valideringen under JB12
och ersättas av ett anknytningsalternativ när `landlordTitle` är
`first_hand_lease`, `second_hand` eller `condominium`.

### F57 — `C-RENT-ADJUST` saknar privatuthyrningslagens indexvillkor

**Allvarlighetsgrad:** Medel
**Verifieringsläge:** Verifierad mot författningstext

Under privatregimen är index däremot uttryckligen tillåtet — men villkorat.
2 kap. 4 § privatuthyrningslagen:

> Parterna får avtala om att hyran ska kunna ändras enligt ett index.
>
> Den part som vill att hyran ska ändras enligt ett indexvillkor ska skriftligen
> meddela motparten detta. Om motparten begär det ska parten ge honom eller henne
> ett underlag som visar hur hyresändringen beräknats.
>
> Den nya hyran börjar gälla vid det månadsskifte som inträffar tidigast en månad
> efter att ett meddelande enligt andra stycket har skickats. **Den tidigare hyran
> måste dock ha gällt i minst ett år.**

Tre moment saknas i klausulen: rätten till beräkningsunderlag på begäran, att
ändringen träder i kraft vid ett **månadsskifte** (klausulen skriver "den månad som
infaller närmast efter"), och ettårsregeln. Klausulen saknar dessutom `legalBasis`
helt.

### F20 — `C-RENT-PRIVATE`: lagtexten är nu läst — se F51

**Allvarlighetsgrad:** — (uppgår i F51)
**Verifieringsläge:** Verifierad mot författningstext — **Löst**

Version 1 kunde inte läsa 4 § lagen (2012:978) och lämnade klausulen som "kan inte
bedömas". Paragrafen är nu läst, och principtexten återger den **korrekt** — men
lagen är upphävd. Se F51.

### F21 — Femtonprocentspåslaget: lagrummet stämmer, ordet "omkring" gör det inte

**Allvarlighetsgrad:** Låg
**Verifieringsläge:** Verifierad mot författningstext — **Delvis avfärdat**
**Fil:** `src/lib/legal/regime.ts`, `resolveRentRule`

Version 1 anmärkte att påslaget presenteras "som om det följde av 12 kap. 55 §".
Det gör det. 12 kap. 55 § fjärde stycket:

> Vid en prövning enligt första stycket i fråga om en lägenhet som upplåts i andra
> hand ska en hyra som överstiger den hyra som hyresvärden betalar, med tillägg för
> möbler, utrustning och andra nyttigheter, aldrig anses som skälig. […] **Ett
> tillägg för möbler och annan utrustning som ingår i upplåtelsen får inte överstiga
> 15 procent av den hyra som hyresvärden betalar.** Tillägg för andra nyttigheter som
> ingår i upplåtelsen får inte överstiga hyresvärdens kostnader för dem.

Lagrummet i `C-RENT-JB` är alltså rätt. Vad som ska rättas är två formuleringar:

- "högst **omkring** 15 procent" — lagen sätter ett exakt tak. Ta bort "omkring".
- Taket räknas på **den hyra hyresvärden betalar**, inte på den nya hyran. Kodens
  formulering är tvetydig.
- "faktisk ersättning för el, bredband och liknande kostnader" bör följa lagens
  ord: tillägg för andra nyttigheter får inte överstiga hyresvärdens kostnader
  för dem.

Ett moment saknas också helt: 55 § fjärde stycket andra meningen om proportionerlig
andel när bara en del av lägenheten upplåts.

### F22 — `C-COSTS` tillåter rörliga poster utanför den uttömmande uppräkningen i 12 kap. 19 §

**Allvarlighetsgrad:** Hög
**Verifieringsläge:** Verifierad mot författningstext — **Bekräftat och skärpt**
**Fil:** `src/lib/legal/clauses.ts`, `C-COSTS`, `describeCost`, `COST_MODE_LABEL`

12 kap. 19 § första stycket:

> Hyran för bostadslägenheter ska vara till beloppet bestämd i hyresavtalet […]
> Detta gäller dock inte ersättning för kostnader som hänför sig till lägenhetens
> **uppvärmning, nedkylning, förseende med varmvatten eller elektrisk ström eller
> avgifter för vatten och avlopp**
>
> 1. om hyresavtalet innehåller förhandlingsklausul och beräkningsgrunden för
>    ersättningens storlek har fastställts genom en förhandlingsöverenskommelse […],
> 2. om lägenheten är belägen i ett en- eller tvåfamiljshus eller inom en
>    ägarlägenhetsfastighet, eller
> 3. i fråga om avgifter för vatten och avlopp, om avgiften påförs hyresgästen efter
>    individuell mätning.

Uppräkningen är uttömmande, och den gäller bara i de tre uppräknade fallen. Koden
erbjuder däremot läget `separate_actual` ("betalas separat efter faktisk kostnad")
för **samtliga** poster i `COST_LABEL`, alltså också:

| Post i koden | Ryms i 19 § första stycket andra meningen? |
|---|---|
| `costHeating` (Värme) | Ja — men bara i fall 1–3 |
| `costWater` (Vatten och varmvatten) | Ja — men bara i fall 1–3 |
| `costElectricity` (Hushållsel) | Ja — men bara i fall 1–3 |
| `costBroadband` (Bredband) | **Nej** |
| `costTv` (TV) | **Nej** |
| `costLaundry` (Tvättstuga) | **Nej** |
| `costWaste` (Sophämtning) | **Nej** |
| `costOther` (fritext) | Kan inte bedömas maskinellt |

Påföljden står i 19 § femte stycket: hela hyran ska då i stället utgå med ett
skäligt belopp. Det är därför inte ett formfel utan ett fynd som kan sätta den
avtalade hyran ur spel — skälet till att `C-COSTS` här flyttas från `Anmärkning`
till `Fel`.

`separate_fixed` (fast belopp per månad) är däremot oproblematiskt: beloppet är då
bestämt i avtalet. Det är också `tenant_own_contract`, eftersom hyresgästens eget
abonnemang inte är hyra.

**Under privatregimen är läget det motsatta.** 2 kap. 1 § andra stycket
privatuthyrningslagen:

> Parterna får, trots att hyran ska vara bestämd till beloppet, avtala om att
> ersättning för nyttigheter **såsom** kostnader för lägenhetens uppvärmning,
> nedkylning, förseende med varmvatten eller el eller avgifter för vatten och avlopp
> ska betalas med ett belopp som motsvarar kostnaden för förbrukningen.

Ordet "såsom" gör uppräkningen exemplifierande, och några villkor motsvarande
punkterna 1–3 finns inte. Rörlig ersättning är alltså tillåten där.

**Kodåtgärd:** begränsa `separate_actual` under JB12 till värme, kyla, varmvatten,
el och VA, och bara när `propertyType` är en- eller tvåfamiljshus/ägarlägenhet
(eller, för VA, vid individuell mätning). Lämna det öppet under privatregimen.

### F23 — `paymentDueCustom` kan sätta förfallodagen tidigare än lagen medger

**Allvarlighetsgrad:** Medel
**Verifieringsläge:** Verifierad mot författningstext — **Bekräftat**
**Fil:** `src/lib/legal/clauses.ts`, `paymentDueText`

12 kap. 20 § första stycket:

> Om avtal inte har ingåtts om tiden för betalning av hyra i pengar, ska hyran
> betalas senast sista vardagen före varje kalendermånads början […] **För
> bostadslägenhet får dock den hyra som avser en annan kalendermånad än den första
> betalas senast sista vardagen före månadens början, även om tidigare förfallodag
> har avtalats.**

Andra meningen är tvingande och räddar hyresgästen oavsett vad som avtalats. Men
`paymentDueRule === "custom"` skriver in `paymentDueCustom` ordagrant och utan
kontroll, och en hyresvärd kan alltså få in "den 20:e i månaden före" i sitt avtal.
Villkoret saknar verkan, men avtalet ser ut att ge hyresvärden en rätt hon inte har
— och en förverkandeuppsägning enligt 42 § första stycket 1 räknad från den
avtalade dagen skulle vara ogrundad.

Standardläget i koden ("senast sista vardagen i månaden före den kalendermånad hyran
avser") stämmer med lagen, och `first_of_month` är förmånligare för hyresgästen och
alltså i sin ordning.

**Textförslag** (tillägg i `C-PAYMENT`):

> För en bostadslägenhet får hyra som avser en annan kalendermånad än den första
> alltid betalas senast sista vardagen före månadens början, även om en tidigare
> förfallodag har avtalats (12 kap. 20 § första stycket jordabalken).

---

## 9. Fynd — övriga klausuler

### F24 — `C-CONSENT-PENDING` ger hyresvärden en frånträdesrätt med omedelbar verkan

**Allvarlighetsgrad:** Hög
**Verifieringsläge:** Verifierad mot författningstext — **Bekräftat, med rättat
lagrum**
**Fil:** `src/lib/legal/clauses.ts`, `C-CONSENT-PENDING`

> Om samtycke eller tillstånd inte lämnas har vardera parten rätt att frånträda
> avtalet med omedelbar verkan […]

Villkoret ger hyresvärden en rätt att avsluta ett bostadshyresavtal utan
uppsägningstid och utanför förverkandereglerna. Under JB12 kringgår det både 4 §
och, för en hyresgäst med besittningsskydd, hela förlängningsprövningen i 46 §. Det
är utan verkan mot hyresgästen enligt 12 kap. **1 d §** (version 1 angav
"1 § femte stycket", som inte längre finns — se F52):

> Avtalsvillkor som strider mot en bestämmelse i detta kapitel är utan verkan mot
> hyresgästen eller den som har rätt att träda i hans eller hennes ställe, om inte
> annat anges.

Under privatregimen motsvaras det av 1 kap. 4 § privatuthyrningslagen, och
kringgåendet gäller 6 kap. 1–3 §§. Hyresgästens motsvarande rätt är oproblematisk,
eftersom den är till hyresgästens förmån.

**Textförslag:**

> Upplåtelsen förutsätter samtycke från bostadsrättsföreningens styrelse respektive
> tillstånd från hyresvärden eller hyresnämnden. Sådant samtycke eller tillstånd är
> enligt parternas uppgift ännu inte lämnat.
>
> Om samtycke eller tillstånd inte lämnas har hyresgästen rätt att frånträda avtalet
> med omedelbar verkan, varvid hyra som betalats för tid efter frånträdandet
> återbetalas. Hyresvärden kan i sådant fall säga upp avtalet med den uppsägningstid
> som anges i detta avtal, men kan inte avsluta avtalet i förtid på annan grund än
> vad som följer av lag.
>
> Hänvisning till hyresnämndens beslut, i förekommande fall: {{rentTribunalPermit}}.

Klausulen saknar `legalBasis`. Lämpligt tillägg: `7 kap. 10–11 §§ bostadsrättslagen
(1991:614) samt 12 kap. 39–40 §§ jordabalken` — **bostadsrättslagens paragrafnummer
har inte kunnat verifieras i denna körning och måste kontrolleras innan de skrivs in.**

### F25 — `C-CONSENT-PENDING` påstår något om ett obesvarat fält

**Allvarlighetsgrad:** Låg
**Verifieringsläge:** Kan inte verifieras (kodlogik)

Villkoret `boardConsentObtained !== "yes"` är sant också för tomt värde. Klausulen
skriver då kategoriskt "Sådant samtycke eller tillstånd är ännu inte lämnat" om
något användaren inte tagit ställning till. Ändra villkoret till en uttrycklig
uppräkning av `"no"` och `"applied"`.

### F26 — `C-RULES` sätter ett absolut tak för antalet boende

**Allvarlighetsgrad:** Medel
**Verifieringsläge:** Verifierad mot författningstext — **Bekräftat**

"Lägenheten får bebos av högst {{maxOccupants}} personer." Lagen känner inget
sifferbestämt tak. 12 kap. 41 § (JB12):

> Hyresgästen får inte inrymma utomstående personer i lägenheten i en utsträckning
> som hyresvärden inte skäligen ska behöva godta. Vid bedömningen ska det särskilt
> beaktas
> - om det bor fler personer i lägenheten än vad den är anpassad för […]

Motsvarande skälighetsbedömning finns i 5 kap. 3 § privatuthyrningslagen. Ett tak
kan inte hindra hyresgästen från att låta en partner eller ett barn flytta in, och
klausulen bör formuleras som en utgångspunkt, inte som ett förbud.

### F27 — `C-INSPECTION` påstår besiktning vid båda tillfällena oavsett vad som valts

**Allvarlighetsgrad:** Medel
**Verifieringsläge:** Kan inte verifieras (kodlogik)

Villkoret är `inspectionOnMoveIn || inspectionOnMoveOut`, men brödtexten säger
alltid "vid tillträdet **och** vid avflyttningen". Bygg meningen av de valda
tillfällena, eller dela i två klausuler. Bilagan har på samma sätt alltid två
underskriftsblock.

### F28 — `C-JOINT-LIABILITY` reglerar delad uppsägning oklart

**Allvarlighetsgrad:** Medel
**Verifieringsläge:** Verifierad mot författningstext (delvis)

> En uppsägning från en av hyresgästerna gäller endast den hyresgästen om parterna
> inte kommer överens om annat.

Meningen svarar inte på det som blir tvistigt: om den avflyttande hyresgästen
befrias från det solidariska ansvaret för framtida hyra. 12 kap. 47 § första stycket
visar dessutom att lagen ser saken annorlunda — en uppsägning av en medhyresgäst
påverkar hela avtalet, och medhyresgästens skydd är en **rätt till förlängning för
egen del**, inte att uppsägningen bara skulle gälla den ene:

> Om lägenheten har hyrts gemensamt av flera som inte gemensamt har rätt till
> förlängning av hyresavtalet på grund av att en av dem sagt upp hyresavtalet […] är
> en medhyresgäst berättigad att få hyresavtalet förlängt för egen del, om
> hyresvärden skäligen kan godta honom eller henne som hyresgäst.

Klausulens lydelse är alltså inte bara oklar utan missvisande.

**Textförslag:**

> Hyresgästerna svarar solidariskt för samtliga förpliktelser enligt detta avtal.
> Hyresvärden har rätt att kräva hela hyran och övriga belopp av vilken som helst av
> hyresgästerna.
>
> Avtalet sägs upp gemensamt av samtliga hyresgäster. Säger en av hyresgästerna upp
> avtalet upphör det i förhållande till samtliga, om inte annat följer av lag eller
> av en skriftlig överenskommelse mellan samtliga hyresgäster och hyresvärden. Utan
> en sådan överenskommelse kvarstår den solidariska betalningsskyldigheten.

### F29 — `C-FURNISHING` hänvisar till en bilaga som kan vara tom

**Allvarlighetsgrad:** Låg
**Verifieringsläge:** Kan inte verifieras (kodlogik)

Bilagan genereras även när `inventoryItems` är tom och skriver då "Inga inventarier
har angetts." Ett avtal som hänvisar till en tom förteckning flyttar bevisbördan åt
ett håll ingen avsett. Testsviten innehåller `möblerad bostad kräver inventarielista`,
så valideringen finns — men klausulen bör ändå inte hänvisa till en tom bilaga.

### F30 — Platshållare som ger "—" mitt i en mening

**Allvarlighetsgrad:** Låg
**Verifieringsläge:** Kan inte verifieras (språk/kodlogik)

| Klausul | Resultat vid tomt fält |
|---|---|
| `C-OBJECT` | "lägenhetsnummer —, fastighetsbeteckning —" |
| `C-OBJECT` | ett eget stycke som bara innehåller "—" när `objectDescription` är tom |
| `C-KEYS` | "dock högst — om belopp angetts" |
| `C-DEPOSIT` | "återbetalas inom — dagar" |
| `C-ACCESS` | "underrätta hyresgästen minst — dagar i förväg" |
| `C-RULES` | "får bebos av högst — personer" |
| `C-PARTIES` | "E-post —, telefon —" |

Låt `interpolate` stödja villkorliga segment så att hela satsen faller bort när
värdet saknas, eller låt `templateValues` returnera tom sträng för fält som används
inuti meningar och behåll `"—"` bara i uppräkningar.

### F31 — `maintenanceText` gör hyresgästen strikt ansvarig, och lagrummet är ofullständigt

**Allvarlighetsgrad:** Medel
**Verifieringsläge:** Verifierad mot författningstext — **Bekräftat**

Standardalternativet skriver att hyresgästen svarar "för skador som hyresgästen,
någon i hyresgästens hushåll eller besökare **orsakat**". 12 kap. 24 § första
stycket bygger på culpa:

> Hyresgästen skall under hyrestiden väl vårda lägenheten med vad därtill hör. Han är
> skyldig att ersätta all skada som uppkommer **genom hans vållande eller genom
> vårdslöshet eller försummelse** av någon som hör till hans hushåll eller gästar
> honom eller av annan som han inrymt i lägenheten eller som där utför arbete för hans
> räkning. **För brandskada som han själv icke vållat är han dock ansvarig endast om
> han brustit i den omsorg och tillsyn som han bort iakttaga.**

Två fel: ordet "orsakat" gör ansvaret strikt (klausulens *andra* stycke återger
däremot culparegeln korrekt — de två styckena säger alltså olika saker), och
brandskadeundantaget i tredje meningen saknas helt.

Lagrummet är dessutom ofullständigt: klausulens första mening handlar om
hyresvärdens underhållsskyldighet, som följer av 12 kap. 15 §:

> Under hyrestiden ska hyresvärden hålla lägenheten i sådant skick som anges i 9 §
> första stycket, om inte något annat har avtalats eller följer av andra stycket.
>
> Om lägenheten helt eller delvis är uthyrd till bostad, ska hyresvärden i
> bostadsdelen med skäliga tidsmellanrum ombesörja tapetsering, målning och andra
> sedvanliga reparationer med anledning av lägenhetens försämring genom ålder och
> bruk.

**Textförslag** (delat ansvar):

> Hyresvärden svarar för lägenhetens skick och ska med skäliga tidsmellanrum
> ombesörja tapetsering, målning och andra sedvanliga reparationer med anledning av
> lägenhetens försämring genom ålder och bruk (12 kap. 15 § jordabalken).
>
> Hyresgästen ska väl vårda lägenheten med vad därtill hör och svarar för skada som
> uppkommer genom hyresgästens vållande eller genom vårdslöshet eller försummelse av
> någon som hör till hyresgästens hushåll, gästar hyresgästen eller utför arbete i
> lägenheten för hyresgästens räkning. För brandskada som hyresgästen inte själv
> vållat svarar hyresgästen endast om hyresgästen brustit i den omsorg och tillsyn
> som bort iakttas.

`legalBasis` bör bli `12 kap. 15 och 24 §§ jordabalken`.

### F55 — `C-MAINTENANCE`, `C-SUBLET-BAN` och `C-ACCESS` anger jordabalkslagrum även under privatregimen

**Allvarlighetsgrad:** Medel
**Verifieringsläge:** Verifierad mot författningstext

Samtliga tre har `condition: always` och ett jordabalkslagrum i `legalBasis`, men
12 kap. gäller inte under privatuthyrningslagen (1 c §). Motsvarigheterna:

| Klausul | Kodens lagrum | Under privatuthyrningslagen |
|---|---|---|
| `C-MAINTENANCE` | 12 kap. 24 § JB | 3 kap. 1 § (skick), 4 kap. 2–4 §§ (vård, skada, information) |
| `C-SUBLET-BAN` | 12 kap. 39 § JB | 5 kap. 2 § (andra hand), 5 kap. 3 § (inneboende) |
| `C-ACCESS` | 12 kap. 26 § JB | **Rätt lagrum** — 4 kap. 7 § hänvisar uttryckligen dit |

`C-ACCESS` är alltså det enda av de tre där jordabalkshänvisningen håller, tack vare
4 kap. 7 § privatuthyrningslagen: "I fråga om hyresvärdens tillträde till lägenheten
tillämpas 12 kap. 26 § jordabalken."

Sakinnehållet skiljer sig också. 4 kap. 3 § privatuthyrningslagen räknar upp
inneboende och besökare separat, och 3 kap. 1 § gör lägenhetens skick till en
avtalsfråga i första hand ("Lägenhetens skick ska vid tillträdet stämma överens med
det som följer av parternas avtal") — vilket ger hyresvärden ett större utrymme än
12 kap. 9 och 15 §§, och som avtalet därför bör spegla.

### F32 — `C-KEYS` lägger strikt ansvar för låsbyte på hyresgästen

**Allvarlighetsgrad:** Medel
**Verifieringsläge:** Verifierad mot författningstext — **Bekräftat**

"Vid förlorad nyckel svarar hyresgästen för kostnaden för ersättningsnyckel och, om
låsbyte krävs, för denna kostnad" — ansvaret inträder oavsett vållande. Samma
invändning som F31: 12 kap. 24 § första stycket bygger på vållande respektive
vårdslöshet eller försummelse, och 4 kap. 3 § privatuthyrningslagen på "vållande"
och "vårdslöshet eller försummelse".

Beloppsbegränsningen försvinner dessutom när den behövs: "dock högst
{{keyReplacementCost}} om belopp angetts" blir "dock högst — om belopp angetts" när
inget belopp finns, alltså ingen begränsning alls, formulerad som om det fanns en.

**Textförslag:**

> Samtliga nycklar ska återlämnas senast vid hyrestidens slut. Förlorar hyresgästen
> en nyckel ska hyresgästen genast underrätta hyresvärden. Hyresgästen svarar för
> kostnaden för ersättningsnyckel och, om låsbyte behövs, för den kostnaden, i den
> mån förlusten beror på hyresgästens vållande eller vårdslöshet. [Om belopp
> angetts:] Hyresgästens ansvar är begränsat till {{keyReplacementCost}}.
>
> Hyresgästen får inte låta tillverka extra nycklar utan hyresvärdens medgivande.

### F33 — `C-ACCESS` återger 12 kap. 26 § ofullständigt och kan sätta för kort varsel

**Allvarlighetsgrad:** Medel
**Verifieringsläge:** Verifierad mot författningstext — **Bekräftat och skärpt**

12 kap. 26 § första och tredje styckena:

> Hyresvärden har på begäran rätt att utan uppskov få tillträde till lägenheten för
> att utöva **nödvändig tillsyn** av lägenheten eller hur den används, eller utföra
> förbättringsarbeten som inte kan skjutas upp utan skada. När lägenheten är ledig
> till uthyrning, är hyresgästen skyldig att låta den **visas på lämplig tid**.
>
> Efter tillsägelse **minst en månad i förväg** får hyresvärden i lägenheten låta
> utföra mindre brådskande förbättringsarbeten som inte vållar väsentligt hinder
> eller men i nyttjanderätten. Sådana arbeten får dock inte utföras utan
> hyresgästens medgivande under den sista månad som hyresförhållandet består.

Klausulen nämner varken den nödvändiga tillsynen eller visningsskyldigheten, och —
allvarligare — den låter `accessNotice` (ett fritt antal dagar) gälla för "annat
tillträde, exempelvis besiktning eller visning". Lagen kräver **en månad** för
mindre brådskande förbättringsarbeten. Ett avtal som anger t.ex. två dagar ger
hyresvärden en rätt hon inte har; villkoret är utan verkan enligt 1 d § men
avtalet ser ut att bära det.

Klausulen missar också hyresgästens rätt enligt 26 § tredje stycket att säga upp
avtalet inom en vecka när hyresvärden vill utföra annat arbete, och rätten till
ersättning enligt fjärde stycket. Paragrafen ändrades senast genom SFS 2026:844.

### F58 — `C-DISPUTE` övervärderar hyresnämndens behörighet under privatregimen

**Allvarlighetsgrad:** Låg
**Verifieringsläge:** Verifierad mot författningstext

Klausulen är i sig försiktigt formulerad ("i den mån frågan hör till nämndens
behörighet") och håller därför. Men det är värt att notera att behörigheten har
krympt. Den upphävda lagens 4 § gav rätt att ansöka om ändring av
**hyresvillkoren** generellt. Privatuthyrningslagen ger bara en prövningsrätt, och
bara för hyran: 2 kap. 5 § ("Om hyresgästen vill att hyran ska ändras…"), och
7 kap. 4–5 §§ reglerar överklagande enbart i "en tvist om hyra enligt 2 kap. 5 §".
Övriga villkorstvister hör till allmän domstol. En upplysning om det vore till
nytta för båda parter.

---

## 10. Fynd — varningssystemet

### F34 — `W-CONSENT` och `C-CONSENT-PENDING` täcker olika fall, och `W-RENT-CRIMINAL` saknar ett rekvisit

**Allvarlighetsgrad:** Medel
**Verifieringsläge:** Verifierad mot författningstext (delvis)

`W-CONSENT` kräver `boardConsentObtained !== ""` medan `C-CONSENT-PENDING` inte gör
det, och `W-CONSENT` utelämnar `second_hand` som `C-CONSENT-PENDING` tar med. De
två bör ha samma villkor.

`W-RENT-CRIMINAL` säger "Att ta ut oskäligt hög hyra vid andrahandsuthyrning av en
hyresrätt kan vara straffbart." 12 kap. 65 c §:

> En hyresgäst som upplåter en bostadslägenhet i andra hand för självständigt
> brukande **utan behövligt samtycke** av hyresvärden eller tillstånd av
> hyresnämnden, **och** tar emot en hyra för upplåtelsen som inte är skälig enligt
> 55 § fjärde stycket, döms till böter eller fängelse i högst två år. I ringa fall
> ska det inte dömas till ansvar.

Straffbarheten förutsätter alltså **båda** rekvisiten. Ordet "kan" räddar varningen
formellt, men den bör nämna samtyckesrekvisitet — annars framstår en tillåten
andrahandsuthyrning med något för hög hyra som brottslig.

### F35 — `W-TENURE` ärver felet i nio- och tjugofyramånadersberäkningen

**Allvarlighetsgrad:** Medel
**Verifieringsläge:** Verifierad mot författningstext (via F13–F16)

`W-TENURE` bygger på `tenure.months` från `resolveSecurityOfTenure` och blir
därmed fel i exakt de fall F13, F14 och F16 pekar ut. Varningen jämför dessutom
`durationMonths` (den avtalade tiden) med `tenure.months`, medan 45 § första
stycket 1 och 2 båda talar om hur länge **hyresförhållandet** har varat — samma
begreppsförväxling som i F7.

---

## 11. Fynd — ansvarsfriskrivningen (`src/app/villkor/page.tsx`)

### F36 — §5 friskriver från fel i själva dokumentet

**Allvarlighetsgrad:** Hög
**Verifieringsläge:** Verifierad mot författningstext till sin **ram**; slutsatsen
om oskälighet **kan inte verifieras** — **Bekräftat med reservation**

§5 lyder:

> I den utsträckning som tillåts enligt tvingande lag friskriver vi oss från allt
> ansvar för direkta och indirekta skador […] Detta omfattar – utan begränsning –
> **ansvar för fel eller brister i ett dokument**, för att ett villkor visar sig
> ogiltigt eller olämpligt […]

Villkoret friskriver alltså från fel i just den prestation tjänsten tillhandahåller.
Den rättsliga ramen är verifierad. 11 § lagen (1994:1512) om avtalsvillkor i
konsumentförhållanden:

> För avtalsvillkor som inte har varit föremål för individuell förhandling gäller
> 36 § första stycket lagen (1915:218) om avtal och andra rättshandlingar på
> förmögenhetsrättens område med följande begränsningar.
>
> Omständigheter som inträffat efter det att avtalet ingåtts får inte beaktas till
> konsumentens nackdel på så sätt att ett avtalsvillkor som annars vore att anse som
> oskäligt inte kan åsidosättas eller jämkas.
>
> Jämkas ett avtalsvillkor eller lämnas det utan avseende, skall, om villkoret
> strider mot god sed och medför en betydande obalans till konsumentens nackdel,
> avtalet gälla utan andra ändringar, om konsumenten begär det […]

Och 12 §:

> Om inte annat visas, anses ett avtalsvillkor inte ha varit föremål för individuell
> förhandling.

Standardvillkoren på `/villkor` är alltså per presumtion icke individuellt
förhandlade och prövas mot 36 § avtalslagen med AVLK:s skärpningar.

**Vad jag inte kan avgöra.** Svensk lag innehåller ingen katalog över typiskt
oskäliga villkor — den finns i bilagan till direktiv 93/13/EEG, som inte lästs i
denna körning. Om just denna friskrivning är oskälig är därför en bedömningsfråga
som kräver en människa. Två omständigheter talar för att den är det: den träffar
kärnprestationen, och den är formulerad utan begränsning. En omständighet talar emot
och bör vägas in: **jag har inte funnit någon betalningsfunktion i kodbasen**, och en
vederlagsfri tjänst bedöms annorlunda än en betald.

**Textförslag** (försiktigare lydelse som behåller skyddet där det håller):

> Tjänsten tillhandahålls kostnadsfritt och i befintligt skick. Vårt ansvar för
> skada som uppkommer genom användningen av Tjänsten eller ett genererat dokument är
> begränsat till vad som följer av tvingande lag. Vi ansvarar inte för indirekt skada
> såsom utebliven vinst, för att en part bryter mot avtalet eller mot lag, eller för
> följder av att de uppgifter du lämnat är oriktiga eller ofullständiga.
>
> Vi tar däremot inte undan vårt ansvar vid uppsåt eller grov vårdslöshet, och inte
> heller det ansvar som annars följer av tvingande konsumenträttsliga regler.

### F56 — §1 anger en upphävd lag som tjänstens rättsliga grund

**Allvarlighetsgrad:** Hög
**Verifieringsläge:** Verifierad mot författningstext

§1 lyder:

> Tjänsten avgör utifrån dina svar om **lagen (2012:978) om uthyrning av egen bostad**
> eller 12 kap. jordabalken (hyreslagen) är tillämplig, och bygger utkastet på den
> lagen samt vanligt förekommande standardvillkor.

Det är ett publikt påstående om vad tjänsten gör, och det är sedan 1 juli 2026 fel.
Samma sak i §4 ("hyreslagen och lagen om uthyrning av egen bostad") och i
`metadata.description`. Detta är den del av F47 som är synlig för användaren utan
att hon genererar ett avtal, och den bör rättas i samma ändring som resten.

### F37 — §2 friskriver från riktighet medan sajten marknadsför lagenlighet

**Allvarlighetsgrad:** Medel
**Verifieringsläge:** Kan inte verifieras (marknadsföringsrättslig bedömning)

§2 säger att inga garantier lämnas för att dokumentet är "korrekt, fullständigt,
aktuellt eller lämpligt", medan §1 och `metadata.description` säger att utkasten är
"grundade i Hyreslagen". Spänningen mellan de två bör lösas av en människa,
lämpligen tillsammans med en genomgång av startsidans formuleringar mot
marknadsföringslagen.

### F38 — §7 ger ensidig rätt att ändra villkoren

**Allvarlighetsgrad:** Låg
**Verifieringsläge:** Kan inte verifieras (bedömningsfråga)

"Vi kan uppdatera dessa villkor. Den version som gäller är den som publiceras här
vid tidpunkten för din användning." Ensidiga ändringsklausuler utan
underrättelseskyldighet är ett typexempel på villkor som prövas enligt 36 §
avtalslagen. Villkoret är dock oskadligt i praktiken här, eftersom varje användning
är en avslutad engångshändelse.

### F39 — §1 gör godkännandet till en biprodukt

**Allvarlighetsgrad:** Låg
**Verifieringsläge:** Kan inte verifieras (bedömningsfråga)

"Genom att skapa ett dokument med Tjänsten godkänner du villkoren i sin helhet." Ett
aktivt godkännandemoment i flödet är att föredra framför ett konkludent.
`ConsentStep.tsx` finns i kodbasen och kan bära det.

### F40 — Ingen information om tvistlösning utanför domstol

**Allvarlighetsgrad:** Låg
**Verifieringsläge:** Kan inte verifieras (kräver kontroll mot lagen om alternativ
tvistlösning i konsumentförhållanden, som inte lästs)

Villkoren nämner varken ARN eller EU:s tvistlösningsplattform. Om tjänsten
tillhandahålls kostnadsfritt kan informationsplikten falla bort — det bör en
människa avgöra.

### F41 — Operatörsnamnet ser felstavat ut men är verifierat

**Allvarlighetsgrad:** Ingen — **Avfärdat**
**Verifieringsläge:** Verifierad mot extern källa i koden

Version 1 anmärkte att "Adivseo AB" sannolikt är en felstavning. Kommentaren i
`src/data/site.ts` redovisar att stavningen är verifierad mot EU-kommissionens
VIES-register 2026-08-31 på org.nr 559312-5437. Fyndet faller. **Rätta inte
stavningen.**

---

## 12. Fynd — bilagorna (`src/lib/pdf/agreement.ts`)

### F42 — Avståendehandlingen påstår en fyraårsgräns som bara gäller ett av tre fall

**Allvarlighetsgrad:** Medel
**Verifieringsläge:** Verifierad mot författningstext — **Bekräftat och preciserat**

Handlingen skriver: "Överenskommelsen avser tiden från tillträdesdagen och gäller
högst fyra år." 12 kap. 45 a § första stycket:

> Om hyresvärden och hyresgästen i en särskilt upprättad handling har kommit överens
> om att hyresrätten inte ska vara förenad med rätt till förlängning, gäller
> överenskommelsen om den har godkänts av hyresnämnden. I följande fall gäller
> överenskommelsen även utan sådant godkännande:
>
> 1. Överenskommelsen träffas efter det att hyresförhållandet har inletts och avser
>    en hyresrätt som är förenad med rätt till förlängning.
> 2. Överenskommelsen träffas **för en tid om högst fyra år** från det att
>    hyresförhållandet inleds och innebörden […] är att hyresgästen inte ska ha rätt
>    till förlängning, om
>    a) […] hyresvärden ska bosätta sig i lägenheten eller överlåta huset,
>    b) i fråga om en bostadslägenhet som upplåts i andra hand, hyresvärden ska
>       bosätta sig i lägenheten eller, när hyresvärden innehar lägenheten med
>       bostadsrätt, bosätta sig i den eller överlåta bostadsrätten, eller
>    c) […]
> 3. Överenskommelsen träffas för en tid om högst ett år […]

Fyraårsgränsen hör alltså till punkt 2 och gäller inte en nämndgodkänd
överenskommelse enligt första meningen, inte punkt 1, och inte punkt 3 (som har ett
**ett**-årstak). Handlingen anger den som om den vore generell.

Punkt 2 förutsätter dessutom ett kvalificerat skäl — att hyresvärden ska bosätta sig
i lägenheten eller överlåta den. Handlingen frågar aldrig efter det skälet och kan
alltså inte veta om undantaget är tillämpligt.

### F44 — Avståendehandlingen saknar det formulär lagen kräver

**Allvarlighetsgrad:** Medel
**Verifieringsläge:** Verifierad mot författningstext — **Bekräftat och skärpt**

12 kap. 45 a § sista stycket:

> Regeringen eller den myndighet som regeringen bestämmer fastställer **formulär till
> överenskommelser som avses i första stycket 2**.

Den genererade handlingen är inte det fastställda formuläret. Den skulle alltså
brista i formalia i **precis det fall** där hyresnämndens godkännande inte behövs —
det enda fall där handlingen skulle kunna ha ett självständigt värde. Den saknar
också det samtycke från make eller sambo som andra stycket kräver:

> Om en make eller en sambo som inte har del i hyresrätten hade sin bostad i
> lägenheten när överenskommelsen träffades, gäller överenskommelsen mot den maken
> eller den sambon endast om han eller hon har godtagit den.

Handlingen ligger bakom `FEATURE_TENURE_WAIVER`, vilket är rätt. **Flaggan bör inte
slås på.**

### F43 — Avståendehandlingen genereras inte i det fall den behövs mest

**Allvarlighetsgrad:** Medel
**Verifieringsläge:** Kan inte verifieras (kodlogik)

`if (FEATURE_TENURE_WAIVER && ctx.securityOfTenure.status === "arises_after")`.
Handlingen genereras alltså bara när besittningsskyddet uppstår efter en tid — och
inte när `status === "full"`, som är det enda fall där ett avstående har verklig
betydelse. Villkoret är omvänt.

### F45 — Besiktningsprotokollet saknar mätarställningar och har fasta rumsrader

**Allvarlighetsgrad:** Låg
**Verifieringsläge:** Kan inte verifieras (utformningsfråga)

Rumslistan är hårdkodad (`Hall`, `Vardagsrum`, `Kök`, …) oavsett `rooms`, och
protokollet saknar rader för mätarställningar — vilket blir kännbart när
driftskostnader ska avräknas efter faktisk förbrukning (jfr F22 och 12 kap. 19 §
fjärde stycket om individuell mätning).

### F46 — Inventarielistan och nyckelkvittensen saknar datum

**Allvarlighetsgrad:** Låg
**Verifieringsläge:** Kan inte verifieras (utformningsfråga)

Båda bilagorna har underskriftsrader utan datumfält. En kvittens utan datum är svag
bevisning om när nycklarna faktiskt lämnades eller återlämnades.

---

## 13. Frågor som kräver en människas ställningstagande

1. **Ska tjänsten över huvud taget lanseras innan privatuthyrningslagen (2026:772)
   är implementerad?** Rekommendationen i denna rapport är nej. Alternativet — att
   tills vidare skicka alla privatuthyrningsfall till JB12 — är sämre än att inte
   generera avtalet alls, eftersom JB12 inte gäller för de avtalen (1 c §).

2. **Var går gränsen för "möblerat rum" i 12 kap. 45 § första stycket 2?** (F13)
   Rapporten kan visa att en möblerad etta faller utanför, men inte var gränsen går.
   Kräver hyresnämndspraxis.

3. **Omfattar 12 kap. 45 § första stycket 1 en bostadsrätt som hyrs ut i andra
   hand?** (F16) Systematiken i 45 a § första stycket 2 b talar starkt för det, men
   slutsatsen bör bekräftas mot praxis.

4. **Får hyresvärdens uppsägningstid förlängas genom avtal under
   privatuthyrningslagen?** (F50) Den upphävda lagens 3 § sa uttryckligen ja.
   6 kap. 2 § i den nya lagen är tyst. Frågan avgörs av 1 kap. 4 § och behöver ett
   ställningstagande innan `applyExtendedNotice` behålls.

5. **Ska tjänsten stödja `rentAdjustment === "index"` alls?** (F19, F57) Under JB12
   är svaret sannolikt nej för bostadslägenheter. Under privatuthyrningslagen är
   svaret ja, men med villkoren i 2 kap. 4 §. Antingen delas alternativet per regim
   eller tas bort.

6. **Är ansvarsfriskrivningen i `/villkor` §5 oskälig?** (F36) Bedömningsfråga som
   inte kan avgöras ur lagtext. Beror bland annat på om tjänsten är kostnadsfri —
   vilket bör bekräftas, eftersom rapporten bygger på att ingen betalningsfunktion
   påträffats i koden.

7. **Vilka paragrafer i bostadsrättslagen (1991:614) ska `C-CONSENT-PENDING`
   hänvisa till?** (F24) Bostadsrättslagen har inte hämtats i denna körning.
   Paragrafnumren måste kontrolleras innan de skrivs in — de får inte gissas.

8. **Ska `FEATURE_TENURE_WAIVER` finnas kvar?** (F42–F44) Handlingen är inte det
   formulär lagen kräver och kan inte veta om undantaget är tillämpligt. Alternativ:
   ta bort funktionen, eller ersätt den med en hänvisning till hyresnämndens
   fastställda formulär.

9. **Hur ska tjänsten hantera avtal som ingicks före 1 juli 2026?** Punkt 3 i
   övergångsbestämmelserna håller den gamla lagen vid liv för dem. En generator som
   bara skapar nya avtal behöver inte det — men om tjänsten någon gång ska kunna
   producera tilläggsavtal till äldre avtal behöver båda regimerna finnas kvar.

10. **`reviewedBy`, `reviewedAt` och `reviewVersion` är tomma för samtliga 33
    klausuler.** Denna rapport fyller dem inte i och föreslår dem inte ifyllda. Det
    är den granskande juristens beslut, klausul för klausul.

---

## 14. Ordning jag skulle åtgärda i

**Före allt annat**
1. F47 — implementera privatuthyrningslagen (2026:772), med F48–F58 som följdposter.
2. F56 — rätta lagangivelsen på `/villkor` och i sidmetadata.

**Sakfel som måste rättas före lansering**
3. F51 — hyressättning och återbetalningsskyldigheten.
4. F50 — uppsägningstiderna under privatregimen.
5. F13 — "möblerat rum".
6. F17 och F54 — förverkandeklausulen i båda regimerna.
7. F22 — driftskostnadsposterna mot 12 kap. 19 §.
8. F19 — indexklausulen.
9. F8 och F53 — uppsägningsformen i båda regimerna.
10. F7 — nio-månadersregeln.
11. F24 — frånträdesrätten.

**Därefter**
12. F2, F14, F15, F16, F21, F23, F26, F31, F32, F33, F34, F35, F55.
13. F36–F40 — ansvarsfriskrivningen, som ett paket.
14. F42–F44 — avståendehandlingen, eller beslut att ta bort den.
15. Resterande låggradiga fynd.

---

*Denna rapport är maskinellt framtagen. Den utgör inte juridisk rådgivning och är
inte den juristgranskning som kravspecifikationen §12 kräver. Ingen klausultext har
ändrats och ingen granskningsstatus har satts — fälten `reviewedBy`, `reviewedAt`
och `reviewVersion` i `src/lib/legal/clauses.ts` är orörda och ska fyllas i av en
människa.*
