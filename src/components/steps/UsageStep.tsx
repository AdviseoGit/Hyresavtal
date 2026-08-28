"use client";

import { BooleanField, CheckboxField, NumberField, RadioField, TextField } from "../fields";
import { StepIntro, type StepProps } from "./common";

/** Steg 9 — nyttjande och ordningsregler (§5.9). */
export default function UsageStep({ ctl }: StepProps) {
  return (
    <div className="space-y-6">
      <StepIntro title="Nyttjande och ordningsregler">
        Vad som gäller under hyrestiden.
      </StepIntro>

      <NumberField ctl={ctl} name="maxOccupants" label="Högsta antal boende" required min={1} />

      <BooleanField
        ctl={ctl}
        name="smokingAllowed"
        label="Är rökning tillåten i bostaden?"
        required
        yesLabel="Ja"
        noLabel="Nej"
      />

      <RadioField
        ctl={ctl}
        name="petsAllowed"
        label="Får hyresgästen ha husdjur?"
        required
        options={[
          { value: "yes", label: "Ja" },
          { value: "no", label: "Nej" },
          { value: "by_agreement", label: "Efter överenskommelse" },
        ]}
      />

      <BooleanField
        ctl={ctl}
        name="sublettingAllowed"
        label="Får hyresgästen hyra ut vidare?"
        required
        hint="Ett nej täcker även korttidsuthyrning genom förmedlingstjänster."
        yesLabel="Ja, med hyresvärdens samtycke i varje enskilt fall"
        noLabel="Nej, vidareuthyrning är inte tillåten"
      />

      <TextField ctl={ctl} name="quietHours" label="Tider för nattro" hint="T.ex. 22.00-07.00." />

      <BooleanField
        ctl={ctl}
        name="tenantInsuranceRequired"
        label="Krävs hemförsäkring av hyresgästen?"
        required
        yesLabel="Ja"
        noLabel="Nej"
      />

      <RadioField
        ctl={ctl}
        name="maintenanceResponsibility"
        label="Hur fördelas underhållet?"
        required
        options={[
          { value: "standard_split", label: "Sedvanlig fördelning", description: "Hyresvärden svarar för skicket, hyresgästen för skötsel och egna skador" },
          { value: "landlord_all", label: "Hyresvärden svarar för allt underhåll" },
        ]}
      />

      <NumberField
        ctl={ctl}
        name="landlordAccessNotice"
        label="Varsel innan hyresvärden får tillträde"
        suffix="dagar"
        required
        min={0}
        hint="Vid brådskande arbete har hyresvärden rätt till tillträde utan uppskov (12 kap. 26 § jordabalken)."
      />

      <CheckboxField
        ctl={ctl}
        name="houseRulesAttached"
        label="Föreningens eller fastighetsägarens ordningsregler bifogas avtalet"
      />
    </div>
  );
}
