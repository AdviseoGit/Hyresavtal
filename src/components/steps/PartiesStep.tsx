"use client";

import { emptyTenant, MAX_TENANTS } from "../../lib/types";
import { AddressFields, TextField } from "../fields";
import { RepeatableList, StepIntro, type StepProps } from "./common";

/** Steg 3 — parterna (§5.3). Hyresgäster är en lista: par som hyr ihop är normalfallet. */
export default function PartiesStep({ ctl, a }: StepProps) {
  return (
    <div className="space-y-8">
      <StepIntro title="Parterna">
        Uppgifterna används i avtalet och stannar i din webbläsare tills du skapar PDF:en.
      </StepIntro>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-800">Hyresvärd</h3>
        <TextField ctl={ctl} name="landlordName" label="Namn eller företag" required autoComplete="name" />
        <TextField
          ctl={ctl}
          name="landlordIdNumber"
          label="Person- eller organisationsnummer"
          required
          hint="ÅÅÅÅMMDD-NNNN eller NNNNNN-NNNN."
        />
        <AddressFields ctl={ctl} name="landlordAddress" label="Adress" />
        <div className="grid sm:grid-cols-2 gap-3">
          <TextField ctl={ctl} name="landlordEmail" label="E-post" required type="email" autoComplete="email" />
          <TextField ctl={ctl} name="landlordPhone" label="Telefon" required type="tel" autoComplete="tel" />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-800">
          Hyresgäster ({a.tenants.length} av högst {MAX_TENANTS})
        </h3>
        <p className="text-xs text-gray-600">
          Vid fler än en hyresgäst skrivs en klausul om solidariskt betalningsansvar in i avtalet.
        </p>
        <RepeatableList
          title="Hyresgäst"
          items={a.tenants}
          max={MAX_TENANTS}
          addLabel="+ Lägg till hyresgäst"
          onAdd={() => ctl.set("tenants", [...a.tenants, emptyTenant()])}
          onRemove={(i) => ctl.set("tenants", a.tenants.filter((_, index) => index !== i))}
          renderItem={(i) => (
            <div className="space-y-3">
              <TextField ctl={ctl} name={`tenants.${i}.name`} label="Namn" required />
              <TextField ctl={ctl} name={`tenants.${i}.idNumber`} label="Personnummer" required />
              <div className="grid sm:grid-cols-2 gap-3">
                <TextField ctl={ctl} name={`tenants.${i}.email`} label="E-post" required type="email" />
                <TextField ctl={ctl} name={`tenants.${i}.phone`} label="Telefon" required type="tel" />
              </div>
              <AddressFields ctl={ctl} name={`tenants.${i}.currentAddress`} label="Nuvarande adress" />
            </div>
          )}
        />
      </section>
    </div>
  );
}
