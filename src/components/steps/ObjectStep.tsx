"use client";

import { AddressFields, CheckboxField, NumberField, RadioField, TextField, TextareaField } from "../fields";
import { StepIntro, type StepProps } from "./common";

/** Steg 4 — hyresobjektet (§5.4). Rum och yta är egna fält, inte fritext (B5). */
export default function ObjectStep({ ctl, a }: StepProps) {
  return (
    <div className="space-y-6">
      <StepIntro title="Hyresobjektet">Beskriv bostaden som hyrs ut.</StepIntro>

      <AddressFields ctl={ctl} name="objectAddress" label="Bostadens adress" />

      {a.propertyType === "apartment" && (
        <TextField
          ctl={ctl}
          name="apartmentNumber"
          label="Lägenhetsnummer"
          hint="Fyrsiffrigt nummer enligt lägenhetsregistret, t.ex. 1101."
        />
      )}
      {a.landlordTitle === "owner_freehold" && (
        <TextField ctl={ctl} name="propertyDesignation" label="Fastighetsbeteckning" />
      )}

      <div className="grid sm:grid-cols-3 gap-3">
        <NumberField ctl={ctl} name="rooms" label="Antal rum" required min={1} max={20} />
        <NumberField ctl={ctl} name="areaSqm" label="Yta" required suffix="kvm" min={5} max={1000} />
        <TextField ctl={ctl} name="floor" label="Våningsplan" />
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-gray-800">Vad ingår i upplåtelsen?</legend>
        <CheckboxField ctl={ctl} name="hasBalcony" label="Balkong eller uteplats" />
        <CheckboxField ctl={ctl} name="hasStorage" label="Förråd" />
        <CheckboxField ctl={ctl} name="hasParking" label="Parkering eller garage" />
      </fieldset>

      {a.hasParking && (
        <TextField ctl={ctl} name="parkingDetails" label="Uppgifter om parkeringen" hint="T.ex. platsnummer eller garageplats." />
      )}

      <RadioField
        ctl={ctl}
        name="furnished"
        label="Möbleringsgrad"
        required
        hint="Möblerad bostad kräver en inventarielista och kan påverka hyran."
        options={[
          { value: "none", label: "Omöblerad" },
          { value: "partial", label: "Delvis möblerad" },
          { value: "full", label: "Fullt möblerad" },
        ]}
      />

      {a.propertyType === "room_in_own_home" && (
        <TextareaField
          ctl={ctl}
          name="sharedAreas"
          label="Vilka utrymmen delas?"
          hint="T.ex. kök, badrum och vardagsrum."
        />
      )}

      <TextareaField ctl={ctl} name="objectDescription" label="Övrig beskrivning" hint="Frivilligt." />
    </div>
  );
}
