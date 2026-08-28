"use client";

import { BooleanField, RadioField } from "../fields";
import { RegimeBox, StepIntro, type StepProps } from "./common";

/** Steg 1 — här avgörs lagvalet (§4.1, §7). */
export default function BasicsStep({ ctl, a, ctx }: StepProps) {
  const showOrdinal =
    a.landlordIsBusiness === false &&
    (a.landlordTitle === "owner_freehold" || a.landlordTitle === "condominium");

  const answeredAll =
    a.propertyType !== "" &&
    a.landlordTitle !== "" &&
    a.landlordIsBusiness !== null &&
    a.purpose !== "" &&
    (!showOrdinal || a.privateRentalOrdinal !== "");

  return (
    <div className="space-y-6">
      <StepIntro title="Grunduppgifter">
        Svaren här avgör vilken lag som gäller för avtalet, och därmed uppsägningstider,
        besittningsskydd och hur hyran får sättas.
      </StepIntro>

      <RadioField
        ctl={ctl}
        name="propertyType"
        label="Vad hyr du ut?"
        required
        options={[
          { value: "apartment", label: "Lägenhet" },
          { value: "house", label: "Villa eller radhus" },
          { value: "room_in_own_home", label: "Rum i bostad du själv bor i" },
          { value: "holiday_home", label: "Fritidshus" },
        ]}
      />

      <RadioField
        ctl={ctl}
        name="landlordTitle"
        label="Hur förfogar du över bostaden?"
        required
        options={[
          { value: "owner_freehold", label: "Jag äger fastigheten", description: "Villa, radhus eller ägarlägenhet" },
          { value: "condominium", label: "Jag äger en bostadsrätt" },
          { value: "first_hand_lease", label: "Jag har själv hyresrätt", description: "Du hyr ut i andra hand" },
          { value: "second_hand", label: "Jag hyr själv i andra hand", description: "Du hyr ut i tredje hand" },
        ]}
      />

      <BooleanField
        ctl={ctl}
        name="landlordIsBusiness"
        label="Hyr du ut inom ramen för näringsverksamhet?"
        required
        hint="Med näringsverksamhet menas yrkesmässig uthyrning, t.ex. som fastighetsbolag eller med flera bostäder i uthyrningsverksamhet."
        yesLabel="Ja, uthyrningen sker i näringsverksamhet"
        noLabel="Nej, jag hyr ut privat"
      />

      <RadioField
        ctl={ctl}
        name="purpose"
        label="Vad ska bostaden användas till?"
        required
        options={[
          { value: "permanent", label: "Permanentboende", description: "Hyresgästen ska bo i bostaden" },
          { value: "leisure", label: "Fritidsändamål", description: "Bostaden hyrs ut som fritidsbostad" },
        ]}
      />

      {showOrdinal && (
        <RadioField
          ctl={ctl}
          name="privateRentalOrdinal"
          label="Hyr du ut fler än en bostad privat just nu?"
          required
          hint="Lagen om uthyrning av egen bostad gäller bara den första upplåtelsen."
          options={[
            { value: "first", label: "Nej, detta är den enda bostaden jag hyr ut" },
            { value: "additional", label: "Ja, jag hyr redan ut en annan bostad privat" },
          ]}
        />
      )}

      {answeredAll && <RegimeBox ctx={ctx} />}
    </div>
  );
}
