/**
 * Driftspärr för avtalsgenereringen.
 *
 * Tjänstens lagvalsmotor bygger på lagen (2012:978) om uthyrning av egen
 * bostad. Den lagen upphävdes den 1 juli 2026 genom privatuthyrningslagen
 * (2026:772), och 12 kap. 1 c § jordabalken i lydelse enligt SFS 2026:773
 * undantar uttryckligen privatuthyrningsavtal från hyreslagen. Det finns
 * därför ingen korrekt regim att falla tillbaka på för de fallen, och
 * generatorn får inte producera fler avtal förrän den byggts om.
 *
 * Spärren ligger i kod och inte i en miljövariabel med avsikt: den ska inte
 * kunna släckas av misstag genom en ändring i Railway. Slå på tjänsten igen
 * genom att sätta PAUSED till false, vilket bör göras i samma ändring som
 * ombyggnaden — inte före.
 *
 * Se docs/juristgranskning.md (fynd A1/F47) och docs/atgardslista.md.
 */

export const PAUSED = false;

export const PAUSE_HEADING = "Avtalsgenereringen är pausad";

export const PAUSE_BODY =
  "Reglerna för privatuthyrning ändrades den 1 juli 2026. Lagen om uthyrning av egen bostad " +
  "ersattes av privatuthyrningslagen, som bland annat ger andra uppsägningstider och en annan " +
  "rätt till återbetalning av hyra. Tjänsten är byggd på den gamla lagen och skulle därför skapa " +
  "avtal med felaktiga hänvisningar. Vi har stängt av genereringen tills den är ombyggd och granskad " +
  "av jurist.";

export const PAUSE_EXISTING_DOCS =
  "Har du redan skapat ett avtal här och ingått det efter den 1 juli 2026 kan uppgifterna om " +
  "tillämplig lag, uppsägningstid och hyra vara felaktiga. Låt en jurist eller hyresnämnden titta på det " +
  "innan du förlitar dig på innehållet.";

/** Svarstext till API-klienter när spärren är aktiv. */
export const PAUSE_API_MESSAGE =
  "Avtalsgenereringen är pausad: tjänsten bygger på lagen (2012:978) om uthyrning av egen bostad, " +
  "som upphävdes den 1 juli 2026 genom privatuthyrningslagen (2026:772).";
