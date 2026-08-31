# Ombyggnad till privatuthyrningslagen (2026:772)

**Status:** steg 1–6 nedan är genomförda 2026-08-31 (motorn, datamodellen och testerna).
Steg 7 — klausultexterna — återstår och kräver jurist. Generatorn är fortsatt pausad.
**Källa:** SFS 2026:772 i dess lydelse på riksdagen.se, hämtad 2026-08-31, samt 12 kap.
jordabalken i lydelse enligt SFS 2026:773.
**Föranleds av:** `docs/juristgranskning.md` fynd A1/F47.

Generatorn är pausad genom `src/lib/service-status.ts` tills den här ombyggnaden är
gjord och granskad.

---

## 1. Vad som hänt

Lagen (2012:978) om uthyrning av egen bostad upphävdes den 1 juli 2026 genom
privatuthyrningslagen (2026:772), övergångsbestämmelse 2. Den gamla lagen gäller
enligt punkt 3 fortfarande för avtal som *ingåtts* enligt den — alltså för
befintliga avtal, men inte för något avtal tjänsten skapar i dag.

Reservvägen är stängd i lagtexten. 12 kap. 1 c § jordabalken, i lydelse enligt
SFS 2026:773:

> Detta kapitel gäller inte för avtal om hyra som omfattas av privatuthyrningslagen,
> om inte annat anges i den lagen.

Att tills vidare rendera privatuthyrningsfallen som hyreslagsavtal är därför inte en
försiktig mellanväg utan ett nytt fel.

Privatuthyrningslagen är sju kapitel egen materiell reglering, inte en omnumrering av
den gamla treparagraflagen som hänvisade vidare till 12 kap. Det mesta som den gamla
lagen lämnade till jordabalken regleras nu i lagen själv.

---

## 2. Regimbestämningen — den största enskilda ändringen

Koden ställer i dag två frågor som inte längre är lagens frågor.

**`landlordIsBusiness` ("utanför näringsverksamhet").** Gamla 1 § avgränsade mot
näringsverksamhet. Nya 1 kap. 1 § avgränsar i stället efter vem uthyraren är:

> Denna lag gäller avtal genom vilka en fysisk person eller ett dödsbo mot ersättning
> upplåter hus eller delar av hus till någon annan för nyttjande.

Testet är alltså **fysisk person eller dödsbo**, inte frånvaro av näringsverksamhet.
En fysisk person som hyr ut i näringsverksamhet faller inte längre ut på den grunden —
men kan fångas av undantaget för fler än två lägenheter nedan.

**`privateRentalOrdinal` ("första eller ytterligare upplåtelse").** Gamla 1 § sa att
lagen gällde "endast den första upplåtelsen". Den regeln finns inte kvar. Nya 1 kap. 3 §:

> Lagen gäller inte om
> 1. hyresvärden regelmässigt hyr ut fler än två lägenheter som inte utgör del av
>    hyresvärdens bostad,
> 2. hyresvärden innehar lägenheten med hyresrätt, eller
> 3. upplåtelsen avser fritidsändamål.
>
> Om ett hyresavtal är undantaget från lagens tillämpningsområde enligt första stycket
> 1 eller 2, gäller det även om de förhållanden som anges där ändras.

Tröskeln är alltså **regelmässigt fler än två** lägenheter, och bara sådana som inte
utgör del av värdens egen bostad. Det är en helt annan fråga än "är detta din första
uthyrning?". Fältet `privateRentalOrdinal` kan inte översättas — det måste ersättas av
en ny fråga, och gamla svar kan inte migreras.

Andra stycket är värt att notera i gränssnittet: undantaget enligt punkt 1 eller 2 är
bestående. Ett avtal som ingicks utanför lagen förblir utanför den även om värden
senare minskar sitt innehav.

**Konsekvens för `resolveRegimeDecision`:** hela beslutstabellen skrivs om. Nya indata
som behövs, och som ingen fråga i formuläret ställer i dag:

- Är hyresvärden fysisk person eller dödsbo? (1 kap. 1 §)
- Hyr hyresvärden regelmässigt ut fler än två lägenheter som inte är del av den egna
  bostaden? (1 kap. 3 § 1)
- Innehar hyresvärden lägenheten med hyresrätt? (1 kap. 3 § 2 — motsvarar dagens
  andrahandsfall och kan härledas ur `landlordTitle`)
- Avser upplåtelsen fritidsändamål? (1 kap. 3 § 3 — motsvarar dagens `purpose`)

Frågan om bostadsändamål finns kvar men har fått annan lydelse: 1 kap. 1 § andra
stycket kräver att lägenheten upplåtits "för att helt eller till inte oväsentlig del
användas som bostad".

---

## 3. Uppsägningstider

| Fall | Gammal lag | Ny lag |
|---|---|---|
| Tills vidare, hyresgästen säger upp | 1 månad (3 § 2 st) | **3 månader** (6 kap. 2 §) |
| Tills vidare, hyresvärden säger upp | 3 månader (3 § 2 st) | **3 månader** (6 kap. 2 §) |
| Bestämd tid, hyresgästen | fick sägas upp i förtid | **alltid 3 månader** (6 kap. 1 § 2 st) |
| Bestämd tid, hyresvärden | fick sägas upp i förtid | **ingen sådan rätt** — endast förtida uppsägning enligt 6 kap. 3 § |

Två saker att lyfta. Hyresgästens uppsägningstid **tredubblas**, från en månad till
tre. Och hyresvärdens rätt att säga upp ett tidsbestämt avtal i förtid är borta;
6 kap. 1 § ger den rätten uttryckligen bara åt hyresgästen. Dagens avtalstext ger den
åt båda och är alltså felaktig i det ledet. Enligt 1 kap. 4 § är villkor till
hyresgästens nackdel utan verkan mot hyresgästen.

Uppsägningen räknas i båda fallen till "ett månadsskifte som inträffar tidigast tre
månader från uppsägningen" — samma konstruktion som koden redan har för JB, så
`addMonths`-hjälparen kan återanvändas.

---

## 4. Besittningsskydd

Gamla lagen sa uttryckligen i 3 § tredje stycket att hyresgästen inte har rätt till
förlängning, och 3 a § stängde 12 kap. 46 a § jordabalken.

**Nya lagen innehåller ingen förlängningsbestämmelse alls.** Resultatet blir detsamma —
ingen förlängningsrätt — men grunden är en annan: det finns ingen sådan rätt att åberopa,
och 12 kap. jordabalken med sitt besittningsskydd är undantaget enligt 1 c §.

Det betyder att `resolveSecurityOfTenure` kan behålla utfallet `none` för regimen, men
att **lagrumshänvisningen inte får stå kvar**. Klausulen `C-TENURE-NONE` citerar i dag
en upphävd paragraf.

`FEATURE_TENURE_WAIVER` (avstående från besittningsskydd) rör bara JB-grenen och
påverkas inte, men den är fortfarande avstängd i väntan på granskning.

---

## 5. Hyran

Här har det tillkommit mer än det försvunnit.

**Bestämd till beloppet, med en exemplifierande lista på undantag** (2 kap. 1 § andra
stycket): ersättning som motsvarar förbrukningen får avtalas för "nyttigheter **såsom**
kostnader för lägenhetens uppvärmning, nedkylning, förseende med varmvatten eller el
eller avgifter för vatten och avlopp".

*Rättelse (2026-08-31):* en tidigare lydelse av det här avsnittet kallade listan
uttömmande och drog slutsatsen att bredband, tv, tvättstuga och sopor inte får
debiteras efter förbrukning. Det är fel. Ordet **såsom** gör uppräkningen
exemplifierande — jämför 12 kap. 19 § jordabalken, som räknar upp samma poster **utan**
det ordet. Det som begränsar är **förbrukningsrekvisitet**: ersättningen ska motsvara
kostnaden för förbrukningen, så en fast schablon för sådana poster är inte ett giltigt
undantag. Påföljden vid avvikelse är enligt tredje stycket att hyran ska betalas med
**ett skäligt belopp** — inte att villkoret bara stryks.

**Indexklausuler är nu tillåtna** (2 kap. 4 §), vilket de inte var för bostäder
tidigare. Villkoren: skriftligt meddelande till motparten, underlag på begäran, ny hyra
tidigast vid månadsskifte en månad efter meddelandet, och den tidigare hyran måste ha
gällt minst ett år. Det här är en ny funktion tjänsten skulle kunna erbjuda, men den
kräver eget gränssnitt och egen klausul — förslag: håll den utanför första ombyggnaden.

**Hyresprövning** (2 kap. 5 §): hyresgästen kan ansöka hos hyresnämnden, och
jämförelsenormen är hyran för lägenheter som hyrs ut **enligt denna lag** — inte
allmänt bruksvärde. Tröskeln är att hyran är "väsentligt högre".

**Återbetalning** (2 kap. 6 § tredje stycket): sänks hyran för förfluten tid ska
hyresvärden förpliktas betala tillbaka det överskjutande jämte ränta enligt räntelagen.
Dagens avtalstext påstår motsatsen. Se fynd A2 i åtgärdslistan.

**Betalningsordning** (2 kap. 2 §): hyran betalas i förskott före varje kalendermånads
början, senast sista vardagen i månaden dessförinnan om inget annat avtalats. Enligt
2 kap. 3 § ska betalning ske via bank eller liknande betalningsförmedlare om inget
annat avtalats. Formulärets fält för förfallodag och betalsätt bör stämmas av mot detta.

---

## 6. Förtida uppsägning — egen reglering, inte 12 kap. 42 § JB

6 kap. 3 § räknar upp nio grunder. Skillnader som slår mot dagens `C-FORFEITURE`:

- **Hyresdröjsmål: mer än två veckor** efter förfallodagen (punkt 1). Dagens klausul
  anger en vecka.
- **Rättelse före uppsägning** (6 kap. 5 §): rättar sig hyresgästen innan uppsägning
  skett enligt punkterna 1 eller 3–7 upphör grunden. Undantag för särskilt allvarlig
  bristande skötsamhet och särskilt allvarliga störningar.
- **Ringa-ventil** (3 § sista stycket): ingen uppsägningsrätt om det som ligger
  hyresgästen till last är av ringa betydelse.
- **Tidsfrister** (6 kap. 6 §): uppsägning enligt punkterna 2, 8 och 9 ska göras inom
  sex månader från kännedom, med särskild regel vid rättsligt förfarande om brottslighet.
  Försittande frist släcker rätten.
- **Skadestånd** (6 kap. 4 §) vid uppsägning enligt 3 §.

Termen "förverkande" används inte i den nya lagen; den talar om hyresvärdens rätt att
säga upp avtalet i förtid. Klausulrubriken bör följa med.

---

## 7. Uppsägningens form

6 kap. 7–10 §§ ersätter 12 kap. 8 § jordabalken för den här regimen:

- Skriftlig uppsägning. Muntlig godtas **bara** när hyresgästen säger upp och
  hyresvärden lämnar skriftligt erkännande (7 §).
- Uppsägning har skett när den som söks för uppsägningen tagit emot den (7 §).
- Har mottagaren angett en **elektronisk adress** anses uppsägning skedd när den
  skickats dit; för den med hemvist i Sverige gäller också rekommenderat brev (8 §).
- Kungörelse i Post- och Inrikes Tidningar i de fall 9 § anger.

Notera att presumtionen i 8 § här är symmetrisk och gäller "den som söks för
uppsägning", och att den elektroniska adressen är ny jämfört med jordabalken. Dagens
`C-NOTICE-FORM` bygger på JB och måste skrivas om för regimen.

---

## 8. Övrigt som nu ligger i lagen i stället för i jordabalken

| Ämne | Nytt lagrum |
|---|---|
| Lägenhetens skick, avhjälpande, hyresavdrag, skadestånd | 3 kap. 1–6 §§ |
| Vårdplikt och ansvar för skada | 4 kap. 2–3 §§ |
| Informationsskyldighet vid skada | 4 kap. 4 § |
| Bristande skötsamhet och störningar | 4 kap. 5–6 §§ |
| Hyresvärdens tillträde | 4 kap. 7 § (hänvisar till 12 kap. 26 § JB) |
| Överlåtelse, andrahand, inneboende | 5 kap. 1–4 §§ |
| Avflyttning, kl. 12.00 dagen efter | 6 kap. 12 § |
| Preskription, två år | 7 kap. 1 § |

Culpakravet i 4 kap. 3 § är värt särskild uppmärksamhet: hyresgästen ansvarar för skada
genom eget vållande och för vissa andras vårdslöshet, men för brandskada som hyresgästen
inte själv vållat endast vid brist i den omsorg och tillsyn som rimligen kan krävas.
Dagens vårdpliktsklausul bygger på 12 kap. 24 § jordabalken.

---

## 9. Föreslagen ordning för implementationen

1. **Ny regimidentitet.** `PRIVATE_2012_978` → `PRIVATE_2026_772` i `LegalRegime`,
   `REGIME_META` och alla klausulvillkor. Inga textändringar i detta steg.
2. **Ny datamodell för regimfrågorna.** Ersätt `privateRentalOrdinal` och omtolka
   `landlordIsBusiness`. Gamla utkast i `localStorage` måste hanteras — förslag: släng
   sparade utkast vars regimfält inte längre går att tolka, hellre än att gissa.
3. **`resolveRegimeDecision`** mot 1 kap. 1 och 3 §§, med tester som speglar varje punkt
   i 3 § första stycket och det bestående undantaget i andra stycket.
4. **`resolveNoticePeriods`** mot 6 kap. 1–2 §§, inklusive att hyresvärden saknar rätt
   att säga upp bestämd tid i förtid.
5. **`resolveSecurityOfTenure`** — behåll `none`, byt grund och hänvisning.
6. **`resolveRentRule`** mot 2 kap. 1, 5 och 6 §§, inklusive den uttömmande
   nyttighetslistan och påföljden skäligt belopp.
7. **Klausultexterna.** Här slutar det jag kan avgöra. Se åtgärdslistan.
8. **Testsviten.** Acceptanskriterierna i SPEC §13 (T1–T10) utgår från den gamla lagen
   och måste skrivas om innan de kan användas som grind.

Steg 1–6 följer av lagtexten och är **genomförda**. Motorn avgör numera lagvalet enligt
1 kap. 1 och 3 §§, ger tre månader åt båda parter enligt 6 kap. 2 §, markerar att hyresvärden
saknar uppsägningsrätt vid bestämd tid enligt 6 kap. 1 §, och citerar 2 kap. för hyran.
Testsviten är omskriven och gröna 61/61.

Steg 7 — klausulernas brödtext — kräver jurist och är inte påbörjat.

*Rättelse (2026-08-31):* en tidigare lydelse påstod här att "klausulerna citerar nu rätt
lag i sin `legalBasis`". Det är en överdrift. Commiten ändrade **två** sådana rader.
En adversariell granskning (`docs/granskning-ombyggnad.md`) fann att minst fem klausuler
fortfarande citerar hyreslagen även när privatuthyrningslagen är tillämplig:
`C-NOTICE-TENANT-STATUTORY` (12 kap. 5 §), `C-NOTICE-FORM` (12 kap. 8 §),
`C-MAINTENANCE` (12 kap. 24 §), `C-SUBLET-BAN` (12 kap. 39 §) och `C-FORFEITURE`
(12 kap. 42 §, som dessutom anger en veckas dröjsmålsfrist där 6 kap. 3 § 1 säger två).
Deras `condition` är regimneutral. `TermStep.tsx` skriver dessutom hårdkodat
"enligt 12 kap. 5 § jordabalken" i gränssnittet.

Det här är en operativ risk, eftersom spärren i `service-status.ts` är tänkt att lyftas
"i samma ändring som ombyggnaden". Ombyggnaden är inte klar förrän dessa klausuler är
regimuppdelade. Granskningsgrinden i §12 hindrar dem från att renderas så länge den är på.

---

## 10. Frågor som inte kan avgöras ur lagtexten

1. **"Regelmässigt fler än två lägenheter"** — var går gränsen för regelmässighet, och
   räknas lägenheter som hyrs ut enligt andra lagar in i de två? Kräver förarbeten eller
   praxis.
2. **"Till inte oväsentlig del användas som bostad"** — samma tröskel som gamla lagens
   bostadslägenhetsbegrepp, eller inte?
3. **Övergångsbestämmelse 3** — tjänsten skapar bara nya avtal, men bör den kunna
   hantera att en användare vill förnya ett avtal som ingicks före den 1 juli 2026?
   Just nu ställs frågan inte.
4. **Indexklausuler** (2 kap. 4 §) — ska tjänsten erbjuda dem alls?
5. Om produkten ska kunna generera avtal för lägenheter som faller **utanför** lagen
   (fler än två lägenheter, hyresrätt i andra hand, fritidsändamål) gäller 12 kap.
   jordabalken, och den grenens egna fynd i granskningsrapporten kvarstår oberoende av
   den här ombyggnaden.

---

*Maskinellt framtagen kartläggning mot författningstext. Utgör inte juridisk rådgivning
och ersätter inte den granskning kravspecifikationen §12 kräver.*
