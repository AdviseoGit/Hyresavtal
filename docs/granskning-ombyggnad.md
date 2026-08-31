# Granskning av ombyggnaden till privatuthyrningslagen (commit `eeb23c4`)

**Granskare:** oberoende maskinell förgranskning (adversariell hållning)
**Datum:** 2026-08-31
**Granskat:** `src/lib/legal/regime.ts`, `src/lib/legal/clauses.ts`,
`src/lib/types.ts`, `src/lib/validation.ts`, `src/components/steps/TermStep.tsx`,
`src/components/steps/common.tsx`, `src/lib/service-status.ts`,
`tests/regime.test.ts`, `docs/ombyggnad-privatuthyrningslagen.md`
**Facit:** SFS 2026:772 och SFS 1970:994 (12 kap. i lydelse enligt SFS 2026:773
m.fl.), båda hämtade i sin helhet från Riksdagens öppna data under körningen.
Varje slutsats nedan är förankrad i ett citat ur den texten. Där lagtexten inte
räcker står det uttryckligen att frågan inte kan avgöras här.

---

## 1. Sammanfattning

| Allvarlighetsgrad | Antal |
|---|---|
| Hög | 4 |
| Medel | 11 |
| Låg | 7 |
| **Summa** | **22** |

**Håller ombyggnaden?** Motorns *materiella* slutsatser håller. Jag har försökt
falsifiera regimbestämningen, uppsägningstiderna och besittningsskyddet mot
författningstexten och lyckats inte: 1 kap. 1 och 3 §§ är rätt lästa, 6 kap. 1–2 §§
ger de tre månader koden anger, och slutsatsen att det inte finns något
besittningsskydd att åberopa står sig efter en genomgång av hela lagen.

Men ombyggnaden är **inte färdig i den utsträckning `docs/ombyggnad-privatuthyrningslagen.md`
påstår**, och det är det allvarligaste fyndet. Dokumentet skriver att
"klausulerna citerar nu rätt lag i sin `legalBasis`". Commiten ändrade två sådana
rader. Fem klausuler som renderas under den nya regimen citerar fortfarande 12 kap.
jordabalken — ett kapitel som enligt 12 kap. 1 c § uttryckligen inte gäller för de
avtalen. Därtill innehåller hyresregeln ett påstående om att nyttighetslistan är
uttömmande som lagtextens ord *såsom* inte bär.

Slutsats: motorn är materiellt korrekt, statusbeskrivningen är det inte, och
spärren i `service-status.ts` får inte lyftas på ombyggnadsdokumentets ord.

---

## 2. Fynd

### F1 — Nyttighetslistan i 2 kap. 1 § andra stycket är exemplifierande, inte uttömmande (Hög)

`resolveRentRule` i `src/lib/legal/regime.ts` skriver in i avtalet:

> "Ersättning som motsvarar förbrukningen får avtalas särskilt för uppvärmning,
> nedkylning, varmvatten, el och avgifter för vatten och avlopp — **men inte för
> andra nyttigheter**."

Lagtexten, 2 kap. 1 § andra stycket privatuthyrningslagen (2026:772):

> "Parterna får, trots att hyran ska vara bestämd till beloppet, avtala om att
> ersättning för nyttigheter **såsom** kostnader för lägenhetens uppvärmning,
> nedkylning, förseende med varmvatten eller el eller avgifter för vatten och
> avlopp ska betalas med ett belopp som motsvarar kostnaden för förbrukningen."

Ordet *såsom* inleder en exemplifiering. Jämför den motsvarande regeln i
12 kap. 19 § första stycket jordabalken, som räknar upp samma nyttigheter **utan**
*såsom*:

> "Detta gäller dock inte ersättning för kostnader som hänför sig till lägenhetens
> uppvärmning, nedkylning, förseende med varmvatten eller elektrisk ström eller
> avgifter för vatten och avlopp"

Lagstiftaren har alltså aktivt lagt till ett exemplifierande ord i den nya lagen.
Kodens kategoriska "men inte för andra nyttigheter" saknar stöd i den lydelsen.

Det som faktiskt begränsar är i stället rekvisitet i samma stycke: ersättningen ska
betalas "med ett belopp som motsvarar kostnaden för **förbrukningen**". En nyttighet
som inte förbrukas mätbart (fast bredbandsavgift, tvättstuga, sophämtning) faller
därför sannolikt utanför — men på den grunden, inte på att listan är stängd.
Skillnaden är praktisk: en förbrukningsmätt nyttighet utanför uppräkningen kan vara
tillåten.

**Ska ändras:** `src/lib/legal/regime.ts`, `resolveRentRule`, PRIVATE-grenens
`principle`. Ersätt "men inte för andra nyttigheter" med en formulering som binder
vid förbrukningsrekvisitet, t.ex. "…och för andra nyttigheter vars ersättning
motsvarar den faktiska förbrukningen". Samma rättelse i
`docs/ombyggnad-privatuthyrningslagen.md` § 5, som kallar listan "uttömmande".
Om produkten ändå vill hålla en snäv linje ska det stå att det är ett **val**, inte
vad lagen kräver.

---

### F2 — `C-NOTICE-TENANT-STATUTORY` citerar 12 kap. 5 § JB under privatuthyrningsregimen (Hög)

`src/lib/legal/clauses.ts` rad 397:

```
legalBasis: "12 kap. 5 § jordabalken",
condition: (_a, ctx) => ctx.noticePeriods.tenantStatutoryThreeMonths,
```

`tenantStatutoryThreeMonths` sätts till `true` i **båda** regimerna
(`resolveNoticePeriods`, alla tre returgrenar). Klausulen renderas alltså i ett
privatuthyrningsavtal med ett lagrum ur ett kapitel som enligt 12 kap. 1 c §
jordabalken inte gäller:

> "Detta kapitel gäller inte för avtal om hyra som omfattas av
> privatuthyrningslagen, om inte annat anges i den lagen."

Rätt lagrum för regimen är 6 kap. 1 § andra stycket (bestämd tid) respektive
6 kap. 2 § (tills vidare) privatuthyrningslagen.

Samma fel finns hårdkodat i gränssnittet, `src/components/steps/TermStep.tsx` rad
52–56, som ovillkorligt skriver "enligt 12 kap. 5 § jordabalken" så snart flaggan är
satt. Den filen rördes inte alls av `eeb23c4`.

**Ska ändras:** flytta lagrummet från klausulens statiska `legalBasis` till
`ctx.noticePeriods.tenant.legalBasis`, eller dela klausulen i en per regim. I
`TermStep.tsx` ska texten läsa lagrummet ur kontexten i stället för att ha det
inskrivet.

---

### F3 — Fyra klausuler till renderas under den nya regimen med hyreslagens lagrum (Hög)

Samtliga har `condition: always` och saknar regimvillkor:

| Klausul | Anger | Motsvarighet i 2026:772 |
|---|---|---|
| `C-NOTICE-FORM` | 12 kap. 8 § JB | 6 kap. 7–9 §§ |
| `C-MAINTENANCE` | 12 kap. 24 § JB | 4 kap. 2–4 §§ |
| `C-SUBLET-BAN` | 12 kap. 39 § JB | 5 kap. 2 och 3 §§ |
| `C-FORFEITURE` | 12 kap. 42 § JB | 6 kap. 3–6 §§ |

Skillnaderna är materiella, inte kosmetiska:

**`C-FORFEITURE`** skriver "dröjer med att betala hyran mer än **en vecka** efter
förfallodagen". Det är rätt enligt 12 kap. 42 § första stycket 1 jordabalken
("om hyresgästen, när det gäller en bostadslägenhet, dröjer med att betala hyran mer
än en vecka efter förfallodagen"), men fel enligt 6 kap. 3 § första stycket 1
privatuthyrningslagen:

> "1. hyresgästen dröjer med att betala hyran **mer än två veckor** efter
> förfallodagen,"

Klausulen lovar dessutom hyresgästen att denne "i vissa fall [har] rätt att
återvinna hyresrätten enligt 12 kap. 43–44 §§ jordabalken". Någon motsvarighet till
återvinningsregeln i 12 kap. 44 § finns inte i privatuthyrningslagen. 6 kap. 5 §
ger bara rättelse **innan** uppsägning skett:

> "Om hyresgästen rättar sig innan hyresavtalet sagts upp med stöd av 3 § första
> stycket 1 eller 3–7, har hyresvärden inte längre rätt att säga upp hyresavtalet
> på den grunden."

Avtalet utlovar alltså ett skydd hyresgästen inte har. Termen "förverkande" används
inte heller i den nya lagen.

**`C-NOTICE-FORM`** påstår ovillkorligt att rekommenderat brev anses ha kommit fram
när det lämnades in för postbefordran. Både 12 kap. 8 § fjärde stycket JB och
6 kap. 8 § andra stycket 2026:772 villkorar det med att mottagaren har hemvist i
Sverige — "Om den som söks för uppsägning har hemvist i Sverige, ska uppsägning
också anses ha skett när ett rekommenderat brev med uppsägningen … har lämnats in
för postbefordran." Klausulen är alltså felaktig i **båda** grenarna. Den missar
dessutom den nya elektroniska adressen i 6 kap. 8 § första stycket.

**`C-MAINTENANCE`** återger inte brandskadeundantaget i 4 kap. 3 § tredje stycket:

> "Hyresgästen är dock endast ansvarig för brandskada som han eller hon själv inte
> vållat, om hyresgästen brustit i den omsorg och tillsyn som rimligen kan krävas."

**`C-SUBLET-BAN`** missar att 5 kap. 3 § andra stycket ger hyresvärden en
samtyckesrätt även för **inneboende** när lägenheten utgör del av hyresvärdens
bostad — precis det fall `propertyType === "room_in_own_home"` beskriver:

> "Om lägenheten utgör del av hyresvärdens bostad, får hyresgästen inte ha
> inneboende utan hyresvärdens samtycke."

**Ska ändras:** `src/lib/legal/clauses.ts`. Antingen regimvillkora klausulerna i par
(en PRIVATE-variant och en JB12-variant, som redan gjorts för hyran), eller flytta
lagrummet till en funktion av `ctx.regime`. Brödtexten kräver jurist (steg 7).

---

### F4 — Ombyggnadsdokumentet påstår att klausulernas lagrum är rättade. Det är de inte. (Hög)

`docs/ombyggnad-privatuthyrningslagen.md` § 9:

> "Klausulerna citerar nu rätt lag i sin `legalBasis`, men själva texterna är
> fortfarande skrivna mot den upphävda lagen och mot 12 kap. jordabalken."

`git show eeb23c4 -- src/lib/legal/clauses.ts` ändrar exakt två `legalBasis`-rader
(`C-LEGAL-REGIME` och `C-RENT-PRIVATE`). F2 och F3 räknar upp fem klausuler som
fortfarande citerar hyreslagen och som renderas under den nya regimen.

Detta är ett dokumentationsfel med operativ risk: spärren i `service-status.ts` är
avsedd att lyftas "i samma ändring som ombyggnaden", och den som läser § 9 kan tro
att bara brödtexten återstår.

**Ska ändras:** `docs/ombyggnad-privatuthyrningslagen.md` § 9 — skriv att
klausulregistrets lagrum **inte** är genomgångna, och räkna upp de fem klausulerna.

---

### F5 — Ogrammatisk och självmotsägande mening i `C-NOTICE` vid bestämd tid under den nya lagen (Medel)

`C-NOTICE` bygger meningen "Hyresvärden kan säga upp avtalet {{noticeLandlord}}."
`{{noticeLandlord}}` fylls av `describeNotice`, som vid `unavailable` returnerar
hela meningen "Avtalet upphör vid hyrestidens slut. Hyresvärden kan inte säga upp
ett tidsbestämt avtal i förtid…". Resultatet i avtalet blir:

> "Hyresvärden kan säga upp avtalet Avtalet upphör vid hyrestidens slut.
> Hyresvärden kan inte säga upp ett tidsbestämt avtal i förtid, annat än på någon av
> grunderna i 6 kap. 3 §."

Meningen påstår först raka motsatsen till vad den sedan förnekar. `unavailable`
infördes av `eeb23c4`; klausulmallen anpassades inte.

**Ska ändras:** `src/lib/legal/clauses.ts`, `C-NOTICE` — separat brödtextgren när
`ctx.noticePeriods.landlord.unavailable` är satt.

---

### F6 — `RegimeBox` renderar "undefined dag" när hyresvärden saknar uppsägningsrätt (Medel)

`src/components/steps/common.tsx` rad 81–85:

```
{ctx.noticePeriods.landlord.months ? `${...} mån`
  : ctx.noticePeriods.landlord.weeks ? `${...} v`
  : `${ctx.noticePeriods.landlord.days} dag`}
```

`PRIVATE_LANDLORD_FIXED` har varken `months`, `weeks` eller `days`. Rutan "Tillämplig
lag" visar då **"undefined dag"** som hyresvärdens uppsägningstid — vilket dessutom
läses som att det finns en uppsägningstid. Ren regression från `eeb23c4`, som lade
till `unavailable` men bara uppdaterade `describeNotice`.

**Ska ändras:** `src/components/steps/common.tsx` — hantera `unavailable` före
sifferfallen (t.ex. "Ingen uppsägningsrätt i förtid").

---

### F7 — Påståendet att hyresvärden bara kan säga upp enligt 6 kap. 3 § är inte uttömmande (Medel)

`PRIVATE_LANDLORD_FIXED.unavailable.reason` i `regime.ts`:

> "Hyresvärden kan inte säga upp ett tidsbestämt avtal i förtid, **annat än på någon
> av grunderna i 6 kap. 3 §**."

Texten skrivs in i avtalet via `describeNotice`. Den missar 7 kap. 3 § andra stycket
privatuthyrningslagen:

> "Om hyresgästen försätts i konkurs, tillämpas 12 kap. 31 § första, andra och
> fjärde styckena jordabalken."

12 kap. 31 § andra stycket jordabalken:

> "Har lägenheten ej tillträtts när konkursen inträffar och har ej hyresvärden sådan
> säkerhet för att avtalet fullgörs att han skäligen kan nöja sig, får hyresvärden
> säga upp avtalet om han ej erhåller sådan säkerhet inom en vecka efter anfordran."

Det är en uppsägningsrätt för hyresvärden som gäller oberoende av avtalsform.

I samma riktning, till hyresgästens fördel: 7 kap. 3 § första stycket tillämpar
12 kap. 29 och 30 §§ JB (utmätning respektive hyresvärdens konkurs före
tillträdesdagen), och 3 kap. 5 § ger hyresgästen rätt att säga upp med omedelbar
verkan vid väsentlig brist som inte avhjälps. Ingen av dem modelleras.

**Ska ändras:** `src/lib/legal/regime.ts` — komplettera `reason` med "eller enligt
7 kap. 3 §", eller stryk ordet som gör uppräkningen sluten.

---

### F8 — Påföljden i 2 kap. 1 § tredje stycket saknas i hyresregeln (Medel)

`docs/ombyggnad-privatuthyrningslagen.md` steg 6 säger att `resolveRentRule` byggts
om "inklusive den uttömmande nyttighetslistan och **påföljden skäligt belopp**".
`principle`-texten i koden nämner beloppsbestämdhet, nyttighetslistan,
hyresnämndsprövningen och återbetalningen — men inte påföljden.

2 kap. 1 § tredje stycket:

> "Om parterna inte har kommit överens om hyrans storlek eller överenskommelsen
> strider mot första eller andra stycket, ska hyran betalas med ett skäligt belopp.
> Vid bedömningen ska parternas avsikter och övriga förhållanden när avtalet ingicks
> särskilt beaktas."

Det är den praktiskt viktigaste följden av att bryta mot regeln, och den skiljer sig
från den intuitiva förväntningen att bara villkoret stryks.

**Ska ändras:** `src/lib/legal/regime.ts`, `resolveRentRule` — lägg till påföljden.

---

### F9 — Rekvisitet "mot ersättning" i 1 kap. 1 § prövas inte (Medel)

1 kap. 1 § första stycket:

> "Denna lag gäller avtal genom vilka en fysisk person eller ett dödsbo **mot
> ersättning** upplåter hus eller delar av hus till någon annan för nyttjande."

12 kap. 1 § första stycket jordabalken har samma rekvisit ("upplåts till nyttjande
mot ersättning"). `validateAmount` i `src/lib/validation.ts` rad 139–145 godtar
`0` (endast `value < 0` avvisas), och `resolveRegimeDecision` tittar aldrig på
hyran. Ett avtal med 0 kr i hyra får därför ändå klausulen "På detta avtal tillämpas
privatuthyrningslagen (2026:772)" — trots att varken den lagen eller 12 kap. JB då
är tillämplig; det är ett lån av bostad, inte ett hyresavtal.

**Ska ändras:** `src/lib/validation.ts` — kräv `baseRent > 0` (eller att någon
ersättning alls avtalats), alternativt en blockerande varning i `resolveWarnings`.

---

### F10 — Obesvarade regimfrågor ger tyst utfallet "privatuthyrningslagen gäller" (Medel)

`resolveRegimeDecision` är byggd som fyra diskvalificerande frågor och en
fallthrough. Ett tomt `AnswerSet` (`landlordEntity: ""`, `purpose: ""`,
`landlordTitle: ""`, `landlordRentsMoreThanTwo: null`) passerar alla fyra och
returnerar regel 5 med motiveringen:

> "En fysisk person eller ett dödsbo hyr ut en bostad för permanentboende, utanför
> undantagen i 1 kap. 3 §."

Motorn påstår alltså positivt något som ingen har svarat på. Det spelar roll därför
att `RegimeBox` visas redan i steg 1 medan svaren fylls i, och att `reason` skrivs
ordagrant in i avtalet via `C-LEGAL-REGIME` (`{{regimeExplanation}}`).

1 kap. 1 § är formulerad som ett positivt tillämpningsvillkor ("Denna lag gäller
avtal genom vilka en fysisk person eller ett dödsbo…"), inte som en presumtion.
Frånvaro av ett diskvalificerande svar är inte samma sak som att villkoret är
uppfyllt.

**Ska ändras:** `src/lib/legal/regime.ts` — låt `RegimeDecision` kunna vara
obestämd (t.ex. ett `pending`-fält) tills `landlordEntity`, `landlordTitle` och
`purpose` är besvarade, och låt `RegimeBox` visa det i stället för ett påstående.
`validateStep` fångar det redan innan generering, men inte innan texten visas.

---

### F11 — `isFurnishedRoomOrLeisure` är för vid mot 12 kap. 45 § första stycket 2 (Medel, JB12-grenen)

```
if (a.propertyType === "holiday_home" || a.purpose === "leisure") return true;
return a.furnished !== "none" && a.furnished !== "" && a.rooms === 1;
```

12 kap. 45 § första stycket 2 jordabalken (lydelse enligt SFS 2026:773):

> "2. hyresavtalet i annat fall än som sägs i 1 avser ett **möblerat rum** eller en
> lägenhet **för fritidsändamål** och hyresförhållandet upphör innan det har varat
> längre än nio månader i följd,"

Två invändningar:

1. `propertyType === "holiday_home"` ensamt räcker i koden. Bestämmelsen kräver att
   lägenheten upplåts *för fritidsändamål*. Ett fritidshus som hyrs ut för
   permanentboende (`purpose: "permanent"`) är inte en lägenhet för fritidsändamål,
   och hyresgästen ska då ha fullt besittningsskydd enligt 46 §. Koden förnekar det
   i nio månader.
2. "Möblerat rum" likställs i koden med varje möblerad enrumslägenhet
   (`furnished !== "none" && rooms === 1`). Lagtexten skiljer på "ett möblerat rum"
   och "en lägenhet"; en möblerad etta är en lägenhet. Ur enbart lagtexten går det
   inte att fastställa var gränsen går — men kodens likhetstecken har inget stöd i
   ordalydelsen, och felet slår mot hyresgästen.

**Ska ändras:** `src/lib/legal/regime.ts` — kräv `purpose === "leisure"` för
fritidsledet; punkt 2 bör hänskjutas till jurist (se § 4).

---

### F12 — 15 %-taket i 12 kap. 55 § fjärde stycket är exakt, inte "omkring" (Medel, JB12-grenen)

Koden på två ställen (`resolveRentRule` för andrahandsfallet och varningen
`W-RENT-CRIMINAL`): "med tillägg om **högst omkring 15 procent**".

12 kap. 55 § fjärde stycket:

> "Ett tillägg för möbler och annan utrustning som ingår i upplåtelsen får inte
> överstiga 15 procent av den hyra som hyresvärden betalar. Tillägg för andra
> nyttigheter som ingår i upplåtelsen får inte överstiga hyresvärdens kostnader för
> dem."

Taket är en exakt procentsats av en exakt bas. "Omkring" antyder en
skälighetsmarginal som inte finns, och kan förleda en användare att lägga sig strax
över — vilket enligt 12 kap. 42 § första stycket 6 är en förverkandegrund och enligt
65 c § kan vara straffbart.

Hänvisningen bör dessutom vara till **fjärde stycket**, eftersom både 42 § 1 st 6
och 65 c § pekar dit.

**Ska ändras:** `src/lib/legal/regime.ts` (`resolveRentRule`, `resolveWarnings`) och
`src/lib/legal/clauses.ts` (`C-RENT-JB` `legalBasis`).

---

### F13 — `W-PREPAID` citerar 12 kap. 20 § JB även under den nya regimen (Medel)

`resolveWarnings` lägger varningen utan regimvillkor:

> "Förskottshyra utöver en månad kan strida mot 12 kap. 20 § jordabalken."

Under privatuthyrningslagen gäller inte det kapitlet (12 kap. 1 c §). Motsvarigheten
är 2 kap. 2 § första meningen:

> "Hyran ska betalas i förskott före varje kalendermånads början."

jämförd med 1 kap. 4 §:

> "Avtalsvillkor som i jämförelse med bestämmelserna i denna lag är till nackdel för
> hyresgästen är utan verkan mot hyresgästen, om inte annat anges i lagen."

Varningen är alltså riktig i sak men vilar på fel lag i hälften av fallen.

**Ska ändras:** `src/lib/legal/regime.ts`, `resolveWarnings` — lagrum efter regim.

---

### F14 — `W-RENT-CRIMINAL` utelämnar samtyckesrekvisitet (Medel)

Varningen utlöses för varje `landlordTitle === "first_hand_lease"` och säger att det
"kan vara straffbart" att ta ut oskälig hyra. 12 kap. 65 c § jordabalken:

> "En hyresgäst som upplåter en bostadslägenhet i andra hand för självständigt
> brukande **utan behövligt samtycke** av hyresvärden eller tillstånd av
> hyresnämnden, **och** tar emot en hyra som inte är skälig enligt 55 § fjärde
> stycket, döms till böter eller fängelse i högst två år."

Straffansvar förutsätter båda leden. Med samtycke är oskälig hyra i stället en
förverkandegrund enligt 42 § första stycket 6 och kan leda till återbetalning enligt
55 e §. Varningen slår ihop de två påföljdsspåren.

**Ska ändras:** `src/lib/legal/regime.ts`, `resolveWarnings` — skilj på fallen, eller
skriv ut båda rekvisiten.

---

### F15 — 1 kap. 3 § andra stycket modelleras inte, och det spelar roll åt andra hållet (Medel)

Uppdraget frågade om det är ett fel i en generator som bara skapar nya avtal. Svaret
är: inte för regimvalet vid avtalets ingående, men för vad avtalet påstår om
framtiden.

> "Om ett hyresavtal är undantaget från lagens tillämpningsområde enligt första
> stycket 1 eller 2, gäller det även om de förhållanden som anges där ändras."

Tre observationer:

1. Bestämmelsen omfattar **p. 1 och 2, men inte p. 3** (fritidsändamål). Ett avtal
   som undantas för att upplåtelsen avser fritidsändamål har alltså inte samma
   bestående undantag.
2. Motsatsvis säger stycket ingenting om avtal som *omfattas* av lagen. Läst e
   contrario kan ett avtal som vid ingåendet ligger inom lagen falla ut ur den om
   hyresvärden senare börjar hyra ut fler än två lägenheter. Den läsningen kan inte
   fastställas ur lagtexten ensam — se § 4 — men den är tillräckligt närliggande för
   att `C-LEGAL-REGIME` inte bör påstå tillämplig lag som ett för all framtid givet
   faktum.
3. För JB12-grenen betyder stycket att undantaget består, vilket är gynnsamt för
   förutsebarheten och är värt att skriva ut i avtalet.

**Ska ändras:** `src/lib/legal/clauses.ts`, `C-LEGAL-REGIME` — en mening om att
lagvalet bygger på förhållandena vid avtalets ingående. Ingen kodändring i motorn.

---

### F16 — 1 kap. 2 § (jord som upplåts med lägenheten) frågas inte (Låg)

> "Om avtalet även ger rätt att nyttja jord tillsammans med lägenheten, ska denna
> lag tillämpas på avtalet, om jorden ska användas för trädgårdsodling i mindre
> omfattning eller för annat ändamål än jordbruk."

12 kap. 1 § andra stycket jordabalken är parallellt formulerat. Ska jorden användas
för **jordbruk** faller avtalet alltså utanför båda regimerna och är i stället ett
arrende. Formuläret har `propertyType: "house"` och en fritextruta, men ingen fråga
som kan fånga fallet. Sannolikheten är låg (en villa med trädgård ligger tryggt inom
"trädgårdsodling i mindre omfattning"), men en uthyrd gård med betesmark hamnar fel
utan att något varnar.

**Ska ändras:** valfritt. Om det ska hanteras: en fråga i `BasicsStep` när
`propertyType === "house"`, och en femte regimregel som ger "faller utanför båda
regimerna — generera inte".

---

### F17 — Kommentaren i `applyExtendedNotice` pekar på ett stycke som inte längre finns (Medel)

`src/lib/legal/regime.ts`:

> "Längre uppsägningstid får avtalas till hyresgästens fördel (1 kap. 4 §
> privatuthyrningslagen, **12 kap. 1 § sjätte stycket JB**)."

Efter SFS 2026:773 har 12 kap. 1 § jordabalken **två** stycken (tillämpningsområdet
och jordregeln). Regeln om avvikande avtalsvillkor ligger numera i en egen paragraf,
12 kap. 1 d §:

> "Avtalsvillkor som strider mot en bestämmelse i detta kapitel är utan verkan mot
> hyresgästen eller den som har rätt att träda i hans eller hennes ställe, om inte
> annat anges. Lag (2026:773)."

Detta är precis den sortens kvarglömda hänvisning uppdraget misstänkte i JB12-grenen.
Den ligger i en kommentar, inte i renderad text, men den är fel och den styr nästa
läsares förståelse.

**Ska ändras:** `src/lib/legal/regime.ts`, kommentaren över `applyExtendedNotice`.

---

### F18 — Avtalad förlängd uppsägningstid faller tyst bort vid korta bestämda tider (Låg)

```
if (!extended || !landlord.months || extended <= landlord.months) return landlord;
```

För JB12 med bestämd tid ≤ 3 månader är `landlord.months` `undefined`
(`{ days: 1 }` eller `{ weeks: 1 }`). Villkoret `!landlord.months` slår till och en
avtalad förlängning på t.ex. 6 månader kastas utan spår. Användaren har fyllt i
fältet i `TermStep` och får ingen återkoppling. 12 kap. 4 § andra stycket inleds med
"och är inte längre uppsägningstid avtalad" — en längre avtalad tid ska alltså gälla.

**Ska ändras:** `src/lib/legal/regime.ts`, `applyExtendedNotice` — jämför i en
gemensam enhet i stället för att kräva att grundvärdet är uttryckt i månader.

---

### F19 — `resolveWarnings` räknar hyran annorlunda än `totalRent()` (Låg)

`resolveWarnings`:
```
const rent = (a.baseRent ?? 0) + (a.furnishingSurcharge ?? 0) + (a.hasParking ? a.parkingFee ?? 0 : 0);
```
`totalRent()` i `src/lib/types.ts` lägger till `furnishingSurcharge` **endast** när
`furnished !== "none"`. Tröskeln för `W-DEPOSIT-HIGH` (tre månadshyror) beräknas
alltså på ett annat belopp än det avtalet anger som hyra.

**Ska ändras:** `src/lib/legal/regime.ts` — anropa `totalRent(a)`.

---

### F20 — `service-status.ts` beskriver en motor som inte längre finns (Låg)

Filens kommentar och `PAUSE_API_MESSAGE` säger att "tjänstens lagvalsmotor bygger på
lagen (2012:978)". Efter `eeb23c4` gör den inte det. Spärren ska ligga kvar — men
motiveringen som visas för användare och API-klienter är nu felaktig, och den som
läser den kan dra slutsatsen att ombyggnaden inte är gjord.

**Ska ändras:** `src/lib/service-status.ts` — skriv om motiveringen till att
klausultexterna ännu inte är granskade (§12) och att lagrummen i registret inte är
genomgångna (F2–F4).

---

### F21 — Fältnamnet `noticeExtendedTenant` betyder hyresvärdens uppsägningstid (Låg)

Fältet läses i alla tre grenarna som argument till `applyExtendedNotice(landlord, …)`.
Etiketten i `TermStep.tsx` är korrekt ("Längre uppsägningstid för hyresvärden"), så
det finns **inget funktionellt fel** — men namnet säger motsatsen till vad fältet
gör, i den fil där lagvalet avgörs.

**Ska ändras:** `src/lib/types.ts` m.fl. — döp om till `noticeExtendedLandlord`.

---

### F22 — Testsviten bekräftar tolkningen på flera punkter i stället för att pröva den (Medel)

Vad sviten gör bra: den låser 6 kap. 2 §:s tre månader för båda parter, dödsbofallet,
`unavailable` vid bestämd tid, att `W-FIXED-9M` inte får uppstå under den nya
regimen, och trapporna i 12 kap. 4 § andra stycket med gränsvärden på båda sidor om
tre månader. Regressionstestet mellan T1 och T3 är omskrivet ärligt: det säger rent
ut att siffran inte längre skiljer och mäter i stället lagrum och besittningsskydd.

Vad som saknas — varje punkt är ett fall där koden i dag kan ha fel utan att någon
test går sönder:

1. **Tomt `AnswerSet`.** Inget test på vad ett obesvarat formulär ger. Hade det
   funnits hade F10 synts.
2. **Ordningen prövas bara i ett fall.** Testet "juridisk person slår allt" sätter
   `landlordRentsMoreThanTwo: false` och `purpose: "permanent"`, alltså ingen äkta
   krock. Ingen test kombinerar t.ex. hyresrätt + fritidsändamål och kontrollerar
   vilken `rule` som rapporteras. Eftersom alla fyra undantagen ger JB12 kan inget
   test avslöja en felaktig ordning — men `rule` och `reason` skrivs in i avtalet.
3. **1 kap. 3 § andra stycket.** Ombyggnadsdokumentets steg 3 säger att testerna ska
   spegla "det bestående undantaget i andra stycket". Det finns varken kod eller
   test för det. Kravet är avbockat utan att vara uppfyllt.
4. **`purpose: "permanent"` + `propertyType: "holiday_home"`.** Skulle ge fullt
   besittningsskydd (F11). Det enda fritidstestet sätter båda fälten samtidigt och
   kan därför inte skilja på dem.
5. **`baseRent: 0`.** Inget test på "mot ersättning" (F9).
6. **`applyExtendedNotice` mot vecko-/dagsperioder.** Testet använder bara
   tillsvidarefallet, där `months` finns. F18 är osynlig för sviten.
7. **`resolveRentRule` för PRIVATE.** Inget test alls rör `C-RENT-PRIVATE`:s
   `principle` eller `legalBasis`. F1 och F8 hade fångats av en enkel assert.
8. **Varningarnas lagrum per regim.** `W-PREPAID`-testet kontrollerar bara att
   varningen finns, inte vad den citerar (F13).
9. **`describeNotice`/`RegimeBox` vid `unavailable`.** Inget test renderar
   presentationslagret för det nya fältet, vilket är varför F5 och F6 kunde uppstå i
   samma commit som införde det.

**Ska ändras:** `tests/regime.test.ts`. Punkterna 1, 4, 5, 6 och 7 är billiga och
skyddar mot de fynd som faktiskt finns i koden i dag.

---

## 3. Vad jag kontrollerat och inte hittat fel i

Så att luckorna syns: det här är vad jag försökte men inte lyckades falsifiera.

**Utvärderingsordningen i `resolveRegimeDecision`.** Alla fyra undantagsgrenarna
returnerar `JB12`. Ordningen kan därför inte ändra regimen i någon kombination —
bara vilken `rule` och vilken `reason` som rapporteras (se F22 p. 2 och F10). Jag
gick igenom kombinationerna av `landlordEntity`, `landlordTitle`, `purpose` och
`landlordRentsMoreThanTwo` och hittade ingen där utfallet blir fel.

**Dödsbo.** 1 kap. 1 § säger "en fysisk person eller ett dödsbo". Ett dödsbo är en
juridisk person, så en tvåvärd modell hade gett fel svar. `LandlordEntity` har tre
värden och `resolveRegimeDecision` avvisar bara `legal_entity`. Rätt, och testat.

**1 kap. 3 § första stycket 2.** `landlordTitle` `first_hand_lease` och
`second_hand` är de två fall där hyresvärden innehar lägenheten med hyresrätt.
Bostadsrätt och äganderätt gör det inte. Avgränsningen är riktig.

**Bostadsrekvisitet i 1 kap. 1 § andra stycket.** "Lagen gäller endast om lägenheten
har upplåtits för att helt eller till inte oväsentlig del användas som bostad."
`Purpose` kan bara anta `permanent` eller `leisure` och `PropertyType` bara
bostadstyper, så inget icke-bostadsändamål kan nå motorn. Rekvisitet är därmed
uppfyllt av datamodellen snarare än av en kontroll — vilket är godtagbart så länge
typerna inte breddas.

**Uppsägningstiderna, 6 kap. 2 §.** "Ett hyresavtal som gäller tills vidare får sägas
upp att upphöra att gälla vid ett månadsskifte som inträffar tidigast tre månader
från uppsägningen." Bestämmelsen är symmetrisk — den säger inte vem som säger upp.
3/3 månader till månadsskifte är rätt, och `toMonthEnd: true` speglar
"månadsskifte … tidigast tre månader från uppsägningen" korrekt.

**Uppsägningstiden vid bestämd tid, 6 kap. 1 §.** "Ett hyresavtal som gäller för
bestämd tid upphör att gälla vid hyrestidens slut. Hyresgästen får alltid säga upp
avtalet att upphöra att gälla vid ett månadsskifte som inträffar tidigast tre
månader från uppsägningen." Andra stycket ger rätten uttryckligen bara åt
hyresgästen. Att modellera hyresvärden som `unavailable` i stället för med ett
månadsantal är rätt slutsats — med reservationen i F7 om att uppräkningen av
undantagen inte är sluten.

**`applyExtendedNotice`-riktningen mot 1 kap. 4 §.** Endast hyresvärdens tid
förlängs; hyresgästens lämnas orörd och en kortare avtalad tid ignoreras. Det stämmer
med "Avtalsvillkor som i jämförelse med bestämmelserna i denna lag är till nackdel
för hyresgästen är utan verkan mot hyresgästen". Etiketten i `TermStep.tsx` är
korrekt formulerad. (Namnfrågan är F21, funktionsfelet vid korta perioder är F18.)

**Besittningsskyddet `none`.** Jag läste hela 2026:772 och hittar ingen
förlängningsbestämmelse och ingen motsvarighet till 12 kap. 46 §. De enda ställen
där lagen leder tillbaka till jordabalken är 4 kap. 7 § (12 kap. 26 §, tillträde),
6 kap. 13 § (12 kap. 27 §, övergiven lägenhet) och 7 kap. 3 § (12 kap. 29–31 §§,
utmätning och konkurs) — ingen rör förlängning. Tillsammans med 12 kap. 1 c § JB
("Detta kapitel gäller inte för avtal om hyra som omfattas av privatuthyrningslagen")
är utfallet och den angivna grunden riktiga. Den upphävda lagens 3 a § behövs inte
längre och ska inte citeras.

**Niomånadersregeln.** `requiresNoticeToEnd` sätts bara i JB12-grenen.
12 kap. 3 § andra stycket ("Har hyresförhållandet varat mer än nio månader i följd,
skall dock avtalet alltid sägas upp för att upphöra att gälla") saknar motsvarighet i
2026:772, där 6 kap. 1 § första stycket låter avtalet upphöra av sig självt. Rätt.
`exceedsMonths(..., 9)` ger dessutom `false` vid exakt nio månader, vilket stämmer med
"mer än nio".

**Trapporna i `jbFixedTermNotice`.** 12 kap. 4 § andra stycket: "1. en dag i förväg om
hyrestiden är längst två veckor, 2. en vecka i förväg om hyrestiden är längre än två
veckor men längst tre månader, 3. tre månader i förväg om hyrestiden är längre än tre
månader och det är fråga om en bostadslägenhet". Kodens 1 dag / 1 vecka / 3 månader
och gränserna `<= 14` dagar respektive `!exceedsMonths(start, end, 3)` stämmer exakt.
Punkterna 4 och 5 gäller lokaler och är riktigt utelämnade.

**Punktnumreringen i 12 kap. 45 § efter SFS 2026:773.** Paragrafen ändrades, men
punkt 1 (andrahand, två år), punkt 2 (möblerat rum eller fritidsändamål, nio månader)
och punkt 3 (del av upplåtarens egen bostad) har samma nummer och samma innebörd som
koden förutsätter. Tvåårs- och niomånadersgränserna stämmer. (Vidden i punkt 2 är
F11 — numreringen är rätt.)

**Övriga JB-hänvisningar i `regime.ts` och `clauses.ts` mot 2026:773.** Jag gick
igenom 12 kap. 3, 4, 5, 8, 19, 20, 24, 26, 39, 42, 43–45, 55 och 65 c §§. Samtliga
finns kvar med oförändrade nummer, och de stycken koden stödjer sig på säger
fortfarande vad koden påstår. Det enda kvarglömda ledet från uppdelningen av 1 § är
F17.

**2 kap. 5 och 6 §§.** "Om hyran för lägenheten är väsentligt högre än den hyra som i
allmänhet tas ut när liknande eller i motsvarande omfattning efterfrågade lägenheter
hyrs ut enligt denna lag" och "Om hyran sänks för förfluten tid, ska hyresvärden
samtidigt förpliktas att till hyresgästen betala tillbaka det som han eller hon till
följd av beslutet har tagit emot för mycket och ränta på beloppet." Kodens
återgivning är korrekt, inklusive att jämförelsenormen är lägenheter som hyrs ut
enligt samma lag och inte allmänt bruksvärde. Enda utelämnandet är "eller i
motsvarande omfattning efterfrågade", som inte ändrar innebörden nämnvärt.

**Övergångsbestämmelserna.** Punkt 2 upphäver 2012:978, punkt 3 räddar bara avtal
"som har ingåtts enligt den lagen". Ombyggnadsdokumentets läsning är riktig.

---

## 4. Kräver mänskligt ställningstagande

1. **Är listan i 2 kap. 1 § andra stycket sluten?** (F1) Ordet *såsom* och jämförelsen
   med 12 kap. 19 § JB talar starkt för att den är exemplifierande. Men rekvisitet
   att ersättningen ska motsvara förbrukningen kan i praktiken ge samma resultat.
   Förarbetena avgör. Beslutet styr direkt hur tjänstens kostnadsuppdelning får se ut.
2. **Kan ett avtal falla *ur* privatuthyrningslagen?** (F15) 1 kap. 3 § andra stycket
   reglerar bara den motsatta riktningen. Om ett avtal inom lagen kan hamna utanför
   den när hyresvärden växer, bör avtalstexten och gränssnittet säga det.
3. **Var går "regelmässigt fler än två lägenheter"?** Räknas lägenheter som hyrs ut
   enligt andra lagar in? Kan inte avgöras ur lagtexten. Formuleringen i `BasicsStep`
   måste kunna besvaras av en lekman.
4. **Är en möblerad enrumslägenhet ett "möblerat rum" i 12 kap. 45 § första stycket
   2?** (F11 p. 2) Ordalydelsen skiljer på "rum" och "lägenhet". Kodens likhetstecken
   förnekar besittningsskydd i nio månader och behöver en jurists ställningstagande.
5. **Är uthyrning av en bostadsrätt "upplåtelse i andra hand" enligt 12 kap. 45 §
   första stycket 1?** `isSublet` säger nej och ger sådana hyresgäster fullt
   besittningsskydd omedelbart. Testet "ordinär andrahandsuthyrning av bostadsrätt
   (ytterligare) ger fullt besittningsskydd" låser den tolkningen. Ur enbart
   lagtexten kan jag inte avgöra frågan; 55 § fjärde stycket talar visserligen om
   "den hyra som hyresvärden betalar", vilket förutsätter en hyresrätt, men 45 § har
   inte samma begränsning. Om koden har fel överdriver avtalet hyresgästens skydd,
   vilket är en risk för användaren som är hyresvärd.
6. **Ska indexklausuler enligt 2 kap. 4 § erbjudas?** `rentAdjustment` har redan
   värdet `index` och `C-RENT-ADJUST` renderas, men klausulen nämner inget av
   villkoren i 2 kap. 4 § (skriftligt meddelande, underlag på begäran, ny hyra
   tidigast vid månadsskifte en månad efter meddelandet, tidigare hyra i minst ett
   år). Värdet `annual_negotiation` saknar dessutom motsvarighet under
   privatuthyrningslagen, där hyresförhandlingslagen inte gäller. Antingen byggs
   klausulen ut eller så spärras alternativen i den regimen.
7. **Notering, inte ett fynd:** 12 kap. 1 c § jordabalken finns i två lydelser.
   Den som gäller till och med 2026-12-31 hänvisar till "privatuthyrningslagen
   (2026:000)" — ett platshållarnummer — och den som träder i kraft 2027-01-01
   (Lag 2026:1327) skriver "(2026:772)" och lägger till ett stycke om lagen
   (2026:1326) om bosättning för vissa nyanlända invandrare. Att koden citerar
   1 c § är riktigt; den som senare kontrollerar hänvisningen bör känna till att
   SFS-numret i den nu gällande lydelsen är en uppenbar felskrivning i balken.

---

*Rapporten är maskinellt framtagen genom jämförelse mot författningstext hämtad från
Riksdagens öppna data. Den utgör inte juridisk rådgivning och är inte den
juristgranskning som kravspecifikationen §12 kräver. Ingen klausultext, ingen kod och
ingen granskningsmetadata har ändrats i samband med granskningen.*
