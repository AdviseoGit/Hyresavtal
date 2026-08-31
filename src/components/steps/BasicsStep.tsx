"use client";

import { BooleanField, RadioField } from "../fields";
import { RegimeBox, StepIntro, type StepProps } from "./common";

/** Steg 1 — här avgörs lagvalet (§4.1, §7). */
export default function BasicsStep({ ctl, a, ctx }: StepProps) {
  // 1 kap. 3 § första stycket 1 prövas bara när lagen annars skulle kunna gälla:
  // hyresvärden är fysisk person eller dödsbo och innehar inte med hyresrätt.
  const showRentsMoreThanTwo =
    (a.landlordEntity === "natural_person" || a.landlordEntity === "estate") &&
    (a.landlordTitle === "owner_freehold" || a.landlordTitle === "condominium");

  const answeredAll =
    a.propertyType !== "" &&
    a.landlordTitle !== "" &&
    a.landlordEntity !== "" &&
    a.purpose !== "" &&
    (!showRentsMoreThanTwo || a.landlordRentsMoreThanTwo !== null);

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

      <RadioField
        ctl={ctl}
        name="landlordEntity"
        label="Vem är hyresvärd i avtalet?"
        required
        hint="Privatuthyrningslagen gäller bara när en fysisk person eller ett dödsbo hyr ut (1 kap. 1 §)."
        options={[
          { value: "natural_person", label: "En privatperson", description: "Du hyr ut i eget namn" },
          { value: "estate", label: "Ett dödsbo" },
          {
            value: "legal_entity",
            label: "Ett företag eller en annan juridisk person",
            description: "Aktiebolag, handelsbolag, förening eller stiftelse",
          },
        ]}
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

      {showRentsMoreThanTwo && (
        <BooleanField
          ctl={ctl}
          name="landlordRentsMoreThanTwo"
          label="Hyr du regelmässigt ut fler än två bostäder som inte är del av din egen bostad?"
          required
          hint="Privatuthyrningslagen gäller inte den som regelmässigt hyr ut fler än två lägenheter som inte utgör del av den egna bostaden (1 kap. 3 § första stycket 1). Rum i din egen bostad räknas inte in."
          yesLabel="Ja, fler än två"
          noLabel="Nej, högst två"
        />
      )}

      {answeredAll && <RegimeBox ctx={ctx} />}
    </div>
  );
}
