/**
 * Driftspärr för avtalsgenereringen.
 *
 * Spärren stoppar all avtalsgenerering. Den användes 2026-08-31 när det
 * upptäcktes att lagvalsmotorn byggde på den upphävda lagen (2012:978), och
 * släpptes samma dag när motorn byggts om till privatuthyrningslagen
 * (2026:772).
 *
 * Sätt PAUSED till true igen om avtalstexten visar sig vila på fel lagrum, om
 * ett fynd av grad hög står oåtgärdat, eller om en lagändring gör registret
 * inaktuellt. Motiveringen nedan ska då skrivas om så att den beskriver det
 * som faktiskt gäller — en osann pausmotivering är värre än ingen.
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
  "Vi har tillfälligt stängt av möjligheten att skapa nya avtal. Det gör vi när avtalstexten " +
  "behöver ses över mot gällande rätt, hellre än att lämna ut dokument vi inte kan stå för.";

export const PAUSE_EXISTING_DOCS =
  "Har du redan skapat ett avtal här kan uppgifterna om tillämplig lag, uppsägningstid och hyra " +
  "behöva kontrolleras. Låt en jurist eller hyresnämnden titta på det innan du förlitar dig på innehållet.";

/** Svarstext till API-klienter när spärren är aktiv. */
export const PAUSE_API_MESSAGE =
  "Avtalsgenereringen är pausad medan avtalstexten ses över mot gällande rätt.";
