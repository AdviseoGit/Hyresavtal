# Åtgärdslista — beslut som behöver fattas av jurist

**Underlag:** `docs/juristgranskning.md` (version 2, källverifierad 2026-08-31)
**Produkt:** Hyresavtal.nu — en webbtjänst som genererar utkast till hyresavtal för
bostad utifrån ett frågeformulär. Avtalet byggs av 33 klausuler som väljs och
formuleras automatiskt utifrån svaren, plus en lagvalsmotor som avgör vilken lag
som ska tillämpas.
**Status i dag:** Ingen klausul är juristgranskad. Bygget stoppas av en spärr i
`src/lib/legal/review.ts` som bara kan förbigås med en miljövariabel.

Den här listan går att beta av utan att läsa koden. Varje punkt anger vad som ska
beslutas, vilket alternativ förgranskningen föreslår, och vad som händer i koden om
förslaget antas. Punkterna är sorterade så att de kan tas i ordning i ett möte.

---

## A. Sakfel som måste rättas före lansering

### A1. Tjänsten bygger på en upphävd lag

**Vad som ska beslutas:** Om lansering ska skjutas upp tills privatuthyrningslagen
(2026:772) är implementerad, eller om produkten kan gå ut på något annat sätt.

Lagen (2012:978) om uthyrning av egen bostad upphävdes den 1 juli 2026 genom
privatuthyrningslagen (2026:772). Den gamla lagen gäller enligt övergångsbestämmelse
3 fortfarande för avtal som *ingåtts* enligt den — men inte för nya avtal. Samtidigt
säger 12 kap. 1 c § jordabalken, i lydelse enligt SFS 2026:773, att 12 kap. inte
gäller för avtal som omfattas av privatuthyrningslagen. Tjänsten känner inte till
den nya lagen. Varje avtal som i dag genereras för en privatperson som hyr ut sin
egen bostad anger fel tillämplig lag i avtalets sjätte klausul och återger sedan
uppsägningstider, hyressättningsregler och förverkandegrunder som är materiellt
ändrade.

**Föreslaget alternativ:** Skjut upp lansering. Den nya lagen är en helt ny
lagstruktur (7 kapitel), inte en omnumrering, och kan inte lappas in i den befintliga
grenen. Att tills vidare skicka alla privatuthyrningsfall till 12 kap. jordabalken är
sämre än att inte generera avtalet alls — det kapitlet gäller uttryckligen inte för
dem.

**Vad som händer i koden:** `src/lib/legal/regime.ts` — regimen `PRIVATE_2012_978`
byggs om från grunden: beslutstabellen (`resolveRegimeDecision`), uppsägningstiderna
(`PRIVATE_TENANT`, `PRIVATE_LANDLORD`), besittningsskyddet
(`resolveSecurityOfTenure`) och hyressättningen (`resolveRentRule`). I
`src/lib/legal/clauses.ts` berörs `C-LEGAL-REGIME`, `C-RENT-PRIVATE`,
`C-TENURE-NONE`, `C-NOTICE`, `C-NOTICE-FORM`, `C-FORFEITURE`, `C-MAINTENANCE` och
`C-SUBLET-BAN`. I `src/app/villkor/page.tsx` berörs §1 och §4 samt sidans metadata.
Testsviten (57 gröna tester) behöver skrivas om för den nya regimen.

---

### A2. Avtalet säger att hyresnämnden inte kan besluta om återbetalning. Numera är det tvärtom.

**Vad som ska beslutas:** Ny lydelse för hyresklausulen under privatuthyrning.

Avtalet skriver i dag: "Hyresnämnden kan sätta ned hyran för tiden framåt, men
beslutar inte om återbetalning av redan betald hyra." Det var riktigt under den
gamla lagen. Enligt 2 kap. 6 § tredje stycket privatuthyrningslagen ska hyresvärden
numera, om hyran sänks för förfluten tid, förpliktas att betala tillbaka det som
tagits emot för mycket **jämte ränta**. Avtalet avråder alltså hyresgästen från att
ta tillvara en rätt hon faktiskt har.

Samtidigt är hela hyressättningsmodellen utbytt: den kostnadsbaserade prövningen
(kapitalkostnad som skälig avkastningsränta på marknadsvärdet plus driftskostnader)
är avskaffad och ersatt av en marknadsjämförelse mot andra privatuthyrda lägenheter
enligt 2 kap. 5 §.

**Föreslaget alternativ:** Skriv om klausulen enligt förslaget i F51 i
granskningsrapporten — marknadsjämförelsen som prövningsnorm, och den nya
återbetalningsskyldigheten uttryckligen med.

**Vad som händer i koden:** `src/lib/legal/regime.ts`, `resolveRentRule` — hela
`principle`-texten för `C-RENT-PRIVATE` byts, och `legalBasis` går från "4 § lagen
(2012:978)" till "2 kap. 5–6 §§ privatuthyrningslagen (2026:772)". Klausulen
`C-RENT-PRIVATE` i `src/lib/legal/clauses.ts` får samma nya lagrum.

---

### A3. Uppsägningstiderna vid privatuthyrning är fel, och hyresvärden ges en rätt hon inte har

**Vad som ska beslutas:** Vilka uppsägningstider avtalet ska ange, och om en förlängd
uppsägningstid för hyresvärden fortfarande ska erbjudas.

Avtalet anger i dag en månad för hyresgästen och tre månader för hyresvärden, båda
till månadsskifte. Enligt 6 kap. 2 § privatuthyrningslagen gäller **tre månader för
båda parter** vid tillsvidareavtal — paragrafen skiljer inte på parterna. Vid
tidsbestämda avtal ger 6 kap. 1 § andra stycket **bara hyresgästen** rätt att säga
upp i förtid, med tre månader. Hyresvärden har ingen sådan rätt alls; hennes enda väg
ur ett tidsbestämt avtal i förtid är förverkandegrunderna i 6 kap. 3 §. Avtalet ger
henne i dag en generell rätt att säga upp med tre månaders varsel.

En delfråga: den gamla lagen sa uttryckligen att en längre uppsägningstid fick
avtalas. Den brasklappen finns inte i 6 kap. 2 §. Att förlänga hyresvärdens
uppsägningstid är till hyresgästens fördel och bör hålla enligt 1 kap. 4 §, men
stödet är inte längre uttryckligt.

**Föreslaget alternativ:** Sätt tre månader för båda parter vid tillsvidareavtal.
Ta bort hyresvärdens uppsägningsrätt vid bestämd tid helt, och ersätt den med en
upplysning om 6 kap. 3 §. Behåll möjligheten att avtala om längre uppsägningstid för
hyresvärden, men bara efter uttryckligt ställningstagande i den här punkten.

**Vad som händer i koden:** `src/lib/legal/regime.ts` — `PRIVATE_TENANT` och
`PRIVATE_LANDLORD` får nya värden, `resolveNoticePeriods` måste börja skilja på
`contractType` även i privatgrenen, och `tenantStatutoryThreeMonths` ska sättas till
`true` (i dag hårdkodad `false`). Klausulen `C-NOTICE` och den villkorade klausulen
`C-NOTICE-TENANT-STATUTORY` berörs. Funktionen `applyExtendedNotice` behålls eller
tas bort beroende på beslutet.

---

### A4. En möblerad etta behandlas som ett "möblerat rum"

**Vad som ska beslutas:** Hur regeln om möblerat rum ska avgränsas, eller om den ska
tas bort.

12 kap. 45 § första stycket 2 jordabalken undantar "ett möblerat rum eller en
lägenhet för fritidsändamål" från besittningsskydd, om hyresförhållandet upphör innan
det varat längre än nio månader. Koden avgör detta med regeln "bostaden har ett rum
och är helt eller delvis möblerad". En självständig enrumslägenhet med eget kök och
badrum är en lägenhet, inte ett rum — lagen använder båda orden i samma mening. En
hyresgäst med fullt besittningsskydd får därför i sitt avtal läsa att skyddet saknas
under de nio första månaderna.

Det andra ledet — "för fritidsändamål" — avgörs i koden av byggnadstypen
(`fritidshus`) i stället för av ändamålet med upplåtelsen. Ett fritidshus som hyrs ut
för permanentboende är inte en lägenhet för fritidsändamål.

**Föreslaget alternativ:** Ta bort rumsantalet som kriterium. Antingen slopa grenen
helt — upplåtelse av ett rum i upplåtarens egen bostad fångas redan av 45 § första
stycket 3, som är förmånligare för hyresvärden — eller ersätt den med en uttrycklig
fråga i formuläret: "avser upplåtelsen ett möblerat rum, inte en självständig
lägenhet?". Låt fritidsändamålet avgöras enbart av ändamålsfrågan.

**Vad som händer i koden:** `src/lib/legal/regime.ts`, funktionen
`isFurnishedRoomOrLeisure`. Påverkar klausulerna `C-TENURE-INFO` och
`C-TENURE-NONE`, varningen `W-TENURE`, och om ett nytt formulärfält väljs även
`src/lib/types.ts` och `src/components/steps/ObjectStep.tsx`.

---

### A5. Förverkandeklausulen utelämnar hyresgästens skyddsregler

**Vad som ska beslutas:** Ny lydelse för förverkandeklausulen, i två versioner (en
per lag).

Klausulen räknar upp förverkandegrunderna men utelämnar fyra moment som lagen
kräver: att vanvård och störningar först kräver **uppmaning om rättelse**
(12 kap. 42 § första stycket 9), att otillåten andrahandsupplåtelse förutsätter att
hyresgästen **inte kan visa giltig ursäkt** (punkt 3), ringa-ventilen i femte
stycket ("Hyresrätten är inte förverkad om det som ligger hyresgästen till last är av
ringa betydelse") tillsammans med den nya ventilen för hyresgäster som utsatts för
brott av närstående, samt att **socialnämnden** ska underrättas före uppsägning på
grund av störningar (tredje stycket). Avslutningen hänvisar dessutom till "12 kap.
43–44 §§" som återvinningsregler; 43 § handlar om rättelse och tidsfrister, inte om
återvinning.

Under privatuthyrningslagen gäller i stället 6 kap. 3 §, där betalningsfristen är
**två veckor** och inte en. Avtalet anger en vecka, alltså halva den tid hyresgästen
faktiskt har. Någon återvinningsregel motsvarande 12 kap. 44 § finns inte alls i den
nya lagen.

**Föreslaget alternativ:** Dela klausulen i två — en per lag — och skriv in
rättelsemomentet, ringa-ventilen och socialnämndsunderrättelsen i
jordabalksversionen. Färdigt textförslag finns under F17 i granskningsrapporten.

**Vad som händer i koden:** `src/lib/legal/clauses.ts`, klausulen `C-FORFEITURE`
ersätts av `C-FORFEITURE-JB` och `C-FORFEITURE-PRIVATE` med villkor på regimen.

---

### A6. Driftskostnadsklausulen kan sätta hela den avtalade hyran ur spel

**Vad som ska beslutas:** Vilka driftskostnadsposter som ska få debiteras rörligt.

Enligt 12 kap. 19 § första stycket ska hyran för en bostadslägenhet vara "till
beloppet bestämd i hyresavtalet". Undantaget är uttömmande och omfattar bara
uppvärmning, nedkylning, varmvatten, elektrisk ström och avgifter för vatten och
avlopp — och bara i tre uppräknade fall, varav det praktiskt viktigaste är att
lägenheten ligger i ett en- eller tvåfamiljshus eller är en ägarlägenhet. Tjänsten
låter användaren välja "betalas separat efter faktisk kostnad" för samtliga poster,
inklusive **bredband, TV, tvättstuga och sophämtning**, som inte ryms i undantaget.

Påföljden står i 19 § femte stycket: har avtal träffats i strid med bestämmelsen ska
hyran i stället utgå med ett skäligt belopp. Det är alltså inte bara den enskilda
posten som faller, utan hela den avtalade hyran som ersätts av en
skälighetsbedömning.

Under privatuthyrningslagen är läget det motsatta: 2 kap. 1 § andra stycket tillåter
rörlig ersättning för nyttigheter "såsom" de uppräknade, alltså en exemplifierande
uppräkning utan villkor.

**Föreslaget alternativ:** Begränsa alternativet "efter faktisk kostnad" under
jordabalken till värme, kyla, varmvatten, el och VA, och bara när bostaden är ett
en- eller tvåfamiljshus eller en ägarlägenhet. Lämna alternativet öppet under
privatuthyrningslagen. Alternativet "fast belopp per månad" är oproblematiskt under
båda lagarna och kan användas som utväg.

**Vad som händer i koden:** `src/lib/legal/clauses.ts`, klausulen `C-COSTS` och
hjälpfunktionen `describeCost`; valideringen i `src/lib/validation.ts` och
formulärsteget `src/components/steps/RentStep.tsx`.

---

### A7. Indexklausulen är ogiltig under jordabalken — och ofullständig under den nya lagen

**Vad som ska beslutas:** Om tjänsten ska erbjuda indexuppräkning alls, och i så fall
under vilken lag.

Klausulen genereras i dag så snart användaren väljer någon form av hyresjustering,
utan begränsning och utan angivet lagrum. För en bostadslägenhet under jordabalken
finns **ingen** indexöppning — 12 kap. 19 § första stycket kräver att hyran är bestämd
till belopp, och den treårsregel som ibland åberopas i sammanhanget står i tredje
stycket och gäller **lokaler**, inte bostäder. (Detta rättar ett fel i version 1 av
granskningsrapporten, som angav treårsregeln som en bostadsregel.)

Det finns däremot en laglig väg som tjänsten inte erbjuder. Enligt 19 § andra stycket
får hyran vid andrahandsuthyrning och vid uthyrning av en bostadsrätt knytas till den
hyra, årsavgift eller andrahandsavgift som upplåtaren själv betalar — vilket är
tjänstens vanligaste fall.

Under privatuthyrningslagen är index uttryckligen tillåtet enligt 2 kap. 4 §, men med
tre villkor som klausulen saknar: skriftligt meddelande, rätt till
beräkningsunderlag på begäran, och att den tidigare hyran måste ha gällt i minst ett
år.

**Föreslaget alternativ:** Ta bort indexalternativet under jordabalken och ersätt det
med en anknytningsklausul enligt 19 § andra stycket för andrahand och bostadsrätt.
Behåll index under privatuthyrningslagen, med de tre villkoren inskrivna.

**Vad som händer i koden:** `src/lib/legal/clauses.ts`, klausulen `C-RENT-ADJUST`
delas per regim och får ett `legalBasis` (saknas i dag). Valideringen i
`src/lib/validation.ts` behöver blockera indexvalet under jordabalken.

---

### A8. Uppsägningsklausulen om form och delgivning är fel i båda lagarna

**Vad som ska beslutas:** Ny lydelse, i två versioner.

Klausulen säger att en uppsägning ska vara skriftlig, ska delges motparten, och att
ett rekommenderat brev anses ha kommit fram när det lämnades in för postbefordran.
Presumtionen om rekommenderat brev i 12 kap. 8 § fjärde stycket är dock **villkorad**
på två sätt som klausulen utelämnar: mottagaren måste ha hemvist i Sverige, och den
gäller **inte vid uppsägning i förtid på grund av förverkande**. Det är den
allvarligaste bristen — en hyresvärd som förverkandesäger upp per rekommenderat brev
och litar på avtalets lydelse har inte sagt upp giltigt. Skriftlighetskravet gäller
dessutom bara när hyresförhållandet varat mer än tre månader.

Under privatuthyrningslagen gäller 6 kap. 7–8 §§ i stället, med ett moment som helt
saknas i avtalet: har mottagaren angett en **elektronisk adress** för meddelanden om
hyresavtalet anses uppsägningen ha skett när den skickats dit. Formuläret samlar redan
in e-postadresser för båda parter, så detta är en praktiskt viktig upplysning.

**Föreslaget alternativ:** Dela klausulen per lag och skriv in villkoren.
Färdiga textförslag finns under F8 och F53 i granskningsrapporten.

**Vad som händer i koden:** `src/lib/legal/clauses.ts`, klausulen `C-NOTICE-FORM`
delas i två med villkor på regimen.

---

### A9. Nio-månadersregeln mäter fel sak

**Vad som ska beslutas:** Inget rättsligt ställningstagande — men bekräfta läsningen.

12 kap. 3 § andra stycket säger att ett tidsbestämt avtal alltid måste sägas upp för
att upphöra "har hyresförhållandet varat mer än nio månader i följd". Koden prövar i
stället den **avtalade hyrestiden**. Skillnaden slår igenom vid automatisk förlängning:
ett sexmånadersavtal som förlängs med sex månader ger ett hyresförhållande på tolv
månader, och uppsägningsplikten har då inträtt — men tjänsten genererar varken
klausulen eller varningen om det. Avtalet upplyser i stället om att det förlängs
automatiskt, utan att nämna att det numera måste sägas upp för att upphöra.

**Föreslaget alternativ:** Beräkna på hyresförhållandets sammanlagda längd inklusive
förlängningar. Lägg samtidigt till en upplysning om 12 kap. 3 § tredje stycket 2:
låter hyresvärden hyresgästen bo kvar en månad efter hyrestidens utgång utan att
anmoda avflyttning, övergår avtalet till att gälla tills vidare.

**Vad som händer i koden:** `src/lib/legal/regime.ts`, beräkningen av
`requiresNoticeToEnd` i `resolveLegalContext`. Påverkar klausulerna `C-TERM-FIXED`
och `C-TERM-FIXED-9M` samt varningen `W-FIXED-9M`.

---

### A10. Villkorsklausulen ger hyresvärden en rätt att avsluta avtalet på dagen

**Vad som ska beslutas:** Om hyresvärdens frånträdesrätt ska tas bort.

När samtycke från bostadsrättsföreningen eller tillstånd från hyresvärden saknas
skriver avtalet in att "vardera parten" får frånträda med omedelbar verkan om
samtycke inte lämnas. För hyresgästen är det oproblematiskt. För hyresvärden innebär
det en rätt att avsluta ett bostadshyresavtal utan uppsägningstid och utanför
förverkandereglerna — vilket kringgår uppsägningstiden i 12 kap. 4 § och, för en
hyresgäst med besittningsskydd, hela förlängningsprövningen i 46 §. Villkoret är utan
verkan mot hyresgästen enligt 12 kap. 1 d § respektive 1 kap. 4 §
privatuthyrningslagen, men står kvar i dokumentet som om det gällde.

Klausulen saknar dessutom lagrum. Ett tillägg bör hänvisa till bostadsrättslagen
(1991:614) — **men de paragrafnumren har inte kunnat kontrolleras och får inte
skrivas in ogranskade.**

**Föreslaget alternativ:** Behåll hyresgästens frånträdesrätt, ta bort hyresvärdens
och ersätt den med en hänvisning till avtalets ordinarie uppsägningsregler. Färdigt
textförslag finns under F24.

**Vad som händer i koden:** `src/lib/legal/clauses.ts`, klausulen
`C-CONSENT-PENDING` — brödtexten och ett nytt `legalBasis`.

---

## B. Frågor som bara kräver ett ställningstagande

### B1. Är ansvarsfriskrivningen på `/villkor` §5 hållbar mot konsument?

Villkoret friskriver uttryckligen från "ansvar för fel eller brister i ett dokument"
— alltså från fel i just den prestation tjänsten levererar. Standardvillkor som inte
förhandlats individuellt prövas enligt 11 § lagen (1994:1512) mot 36 § avtalslagen,
och enligt 12 § presumeras de vara icke förhandlade. Om villkoret är oskäligt kan
inte avgöras ur lagtexten — den katalog som brukar åberopas finns i bilagan till
direktiv 93/13/EEG, som inte lästs.

En omständighet bör vägas in: **ingen betalningsfunktion har påträffats i kodbasen.**
Om tjänsten är kostnadsfri bedöms friskrivningen annorlunda än om den är betald. Detta
behöver bekräftas.

Ett försiktigare alternativ finns under F36 i granskningsrapporten. Berör
`src/app/villkor/page.tsx` §5.

### B2. Ska tjänsten fortsätta stödja avstående från besittningsskydd?

Funktionen ligger bakom en avstängd funktionsflagga (`FEATURE_TENURE_WAIVER`) och
genererar en separat handling, vilket är rätt ordning. Men handlingen har tre
problem: den påstår att överenskommelsen "gäller högst fyra år", vilket bara gäller
ett av tre fall i 12 kap. 45 a §; den är inte det **formulär som regeringen fastställer**
enligt paragrafens sista stycke, och skulle därför brista i formalia i precis det fall
där hyresnämndens godkännande inte behövs; och den frågar aldrig efter det skäl
(hyresvärden ska bosätta sig i lägenheten eller överlåta den) som undantaget kräver.
Den saknar också det samtycke från make eller sambo som andra stycket kräver.

Dessutom är villkoret för att generera handlingen omvänt: den skapas bara när
besittningsskyddet uppstår efter en tid, inte när hyresgästen har fullt
besittningsskydd — vilket är det enda fall där ett avstående har verklig betydelse.

**Föreslaget alternativ:** Låt flaggan förbli avstängd. Ersätt funktionen med en
hänvisning till hyresnämndens fastställda formulär. Berör
`src/lib/pdf/agreement.ts`, funktionen `renderTenureWaiver`.

### B3. Vilket kriterium ska avgöra om hyresvärden faller inom privatuthyrningslagen?

Två frågor i formuläret bygger på kriterier som inte längre finns. Tjänsten frågar om
uthyrningen sker "inom näringsverksamhet" — nya lagens 1 kap. 1 § frågar i stället om
hyresvärden är en fysisk person eller ett dödsbo. Och tjänsten frågar om detta är den
"första" privata uthyrningen — den regeln är ersatt av en gräns vid **fler än två**
lägenheter som hyrs ut regelmässigt och som inte utgör del av den egna bostaden
(1 kap. 3 § första stycket 1).

Det finns också en fixeringsregel som saknas helt: har ett avtal en gång fallit
utanför lagen på grund av antalet lägenheter eller för att hyresvärden innehar
lägenheten med hyresrätt, ligger det kvar utanför även om förhållandena ändras.

**Föreslaget alternativ:** Formulera om båda frågorna enligt lagens nya kriterier.
Berör `src/lib/legal/regime.ts` (`resolveRegimeDecision`), `src/lib/types.ts` och
`src/components/steps/BasicsStep.tsx`.

### B4. Får hyresvärdens uppsägningstid förlängas genom avtal?

Se A3. Den gamla lagen sa uttryckligen ja; den nya är tyst. Ett kort
ställningstagande räcker.

### B5. Omfattas en bostadsrätt som hyrs ut i andra hand av tvåårsregeln?

12 kap. 45 § första stycket 1 ger besittningsskydd vid andrahandsupplåtelse först
efter två år. Koden tillämpar regeln bara när hyresvärden själv är hyresgäst, inte
när hon är bostadsrättshavare — och ger då hyresgästen besked om fullt
besittningsskydd från dag ett. Att bostadsrätt omfattas stöds av 45 a § första
stycket 2 b, som uttryckligen talar om en hyresvärd som "innehar lägenheten med
bostadsrätt" vid andrahandsupplåtelse. Slutsatsen bör ändå bekräftas mot praxis.

Berör `src/lib/legal/regime.ts`, funktionen `isSublet`.

### B6. Granskningsstatus per klausul

Fälten `reviewedBy`, `reviewedAt` och `reviewVersion` är tomma för samtliga 33
klausuler och spärrar bygget. Denna förgranskning har inte fyllt i dem och föreslår
dem inte ifyllda — det är ett beslut som ska fattas klausul för klausul av den
granskande juristen. Fälten finns i `src/lib/legal/clauses.ts`, och kravet på
version definieras i `src/lib/legal/review.ts` (`REQUIRED_REVIEW_VERSION = "v1"`).

---

## C. Kan vänta till v2

### C1. Språkliga och redaktionella brister

Sju klausuler renderar ett tankstreck mitt i en mening när ett fält är tomt — "får
bebos av högst — personer", "återbetalas inom — dagar", "dock högst — om belopp
angetts". Det sista är särskilt olyckligt eftersom beloppsbegränsningen försvinner
just när den behövs, formulerad som om den fanns. Rent redaktionellt, men syns i varje
avtal med ofullständiga uppgifter.

### C2. Culpakravet i underhålls- och nyckelklausulerna

Underhållsklausulen säger att hyresgästen svarar för skador som hushållet eller
besökare "orsakat", medan 12 kap. 24 § kräver vållande eller vårdslöshet — vilket
klausulens *nästa* stycke återger korrekt. Samma sak i nyckelklausulen, där ansvaret
för låsbyte inträder oavsett vållande. Brandskadeundantaget i 24 § första stycket
tredje meningen saknas helt. Villkoren är utan verkan i den del de går längre än
lagen, men bör ändå rättas.

### C3. Tillträdesklausulen kan ange ett kortare varsel än lagen

Klausulen låter användaren välja antalet dagars varsel för "annat tillträde,
exempelvis besiktning eller visning". För mindre brådskande förbättringsarbeten
kräver 12 kap. 26 § tredje stycket **en månad**. Klausulen nämner heller inte
hyresvärdens rätt till tillträde för nödvändig tillsyn, hyresgästens skyldighet att
låta lägenheten visas när den är ledig till uthyrning, eller hyresgästens rätt att
säga upp avtalet inom en vecka när hyresvärden vill utföra annat arbete.

### C4. Besiktningsklausulen påstår mer än användaren valt

Villkoret genererar klausulen om användaren valt besiktning vid tillträde **eller**
avflyttning, men texten säger alltid "vid tillträdet och vid avflyttningen". Samma sak
i bilagan, som alltid har två underskriftsblock. Bilagan saknar dessutom rader för
mätarställningar, vilket blir kännbart när driftskostnader ska avräknas efter faktisk
förbrukning. Inventarielistan och nyckelkvittensen saknar datumfält vid
underskrifterna.

### C5. Klausulen om solidariskt ansvar

Meningen "En uppsägning från en av hyresgästerna gäller endast den hyresgästen" är
missvisande. 12 kap. 47 § första stycket visar att en medhyresgästs skydd är en
**rätt till förlängning för egen del**, inte att uppsägningen bara skulle gälla den
ene. Klausulen svarar heller inte på det som faktiskt blir tvistigt: om den
avflyttande hyresgästen befrias från det solidariska ansvaret för framtida hyra.

### C6. Klausulen om ordningsregler sätter ett absolut tak för antalet boende

Lagen känner inget sifferbestämt tak — 12 kap. 41 § och 5 kap. 3 §
privatuthyrningslagen bygger båda på en skälighetsbedömning. Ett tak kan inte hindra
hyresgästen från att låta en partner eller ett barn flytta in.

### C7. Varningen om straffbar överhyra saknar ett rekvisit

12 kap. 65 c § kräver **både** att andrahandsupplåtelsen sker utan behövligt samtycke
**och** att hyran är oskälig. Varningen nämner bara det senare, vilket får en tillåten
andrahandsuthyrning med något för hög hyra att framstå som brottslig. Ordet "kan"
räddar varningen formellt.

### C8. Övriga textbrister i användarvillkoren

§2 friskriver från riktighet medan §1 och sidans metadata marknadsför att utkasten är
"grundade i Hyreslagen". §7 ger ensidig rätt att ändra villkoren utan
underrättelseskyldighet. §1 gör godkännandet konkludent trots att flödet redan har ett
samtyckessteg. Ingen information lämnas om tvistlösning utanför domstol.

**Notera:** operatörsnamnet "Adivseo AB" ser felstavat ut men är verifierat mot
EU-kommissionens VIES-register på org.nr 559312-5437. **Rätta det inte.**

---

*Underlaget är maskinellt framtaget och utgör inte juridisk rådgivning eller den
juristgranskning som kravspecifikationen §12 kräver. Ingen klausultext har ändrats
och ingen granskningsstatus har satts.*
