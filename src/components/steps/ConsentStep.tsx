"use client";

import { DateField, RadioField, TextField } from "../fields";
import { StepIntro, WarningList, type StepProps } from "./common";

/** Steg 2 — samtycke och tillstånd (§5.2). Hoppas över för villaägare. */
export default function ConsentStep({ ctl, a, ctx }: StepProps) {
  const needsLandlordConsent =
    a.landlordTitle === "first_hand_lease" || a.landlordTitle === "second_hand";

  return (
    <div className="space-y-6">
      <StepIntro title="Samtycke och tillstånd">
        Uthyrningen kräver att någon annan godkänner den. Utan godkännande riskerar du din egen
        bostad.
      </StepIntro>

      {a.landlordTitle === "condominium" && (
        <>
          <RadioField
            ctl={ctl}
            name="boardConsentObtained"
            label="Har bostadsrättsföreningens styrelse samtyckt till uthyrningen?"
            required
            hint="7 kap. 10-11 §§ bostadsrättslagen. Om styrelsen nekar kan du ansöka om tillstånd hos hyresnämnden."
            options={[
              { value: "yes", label: "Ja, samtycke är lämnat" },
              { value: "applied", label: "Ansökan är inlämnad men inte beviljad" },
              { value: "no", label: "Nej" },
            ]}
          />
          {a.boardConsentObtained === "yes" && (
            <div className="grid sm:grid-cols-2 gap-3">
              <DateField ctl={ctl} name="boardConsentDate" label="Datum för samtycket" />
              <TextField ctl={ctl} name="boardConsentRef" label="Protokoll- eller ärendenummer" />
            </div>
          )}
        </>
      )}

      {needsLandlordConsent && (
        <RadioField
          ctl={ctl}
          name="landlordConsentObtained"
          label="Har din hyresvärd lämnat tillstånd till uthyrningen?"
          required
          hint="12 kap. 39-40 §§ jordabalken. Om hyresvärden nekar kan hyresnämnden lämna tillstånd."
          options={[
            { value: "yes", label: "Ja, tillstånd är lämnat" },
            { value: "applied", label: "Ansökan är inlämnad men inte beviljad" },
            { value: "no", label: "Nej" },
          ]}
        />
      )}

      {(a.boardConsentObtained === "no" ||
        a.boardConsentObtained === "applied" ||
        a.landlordConsentObtained === "no" ||
        a.landlordConsentObtained === "applied") && (
        <TextField
          ctl={ctl}
          name="rentTribunalPermit"
          label="Hyresnämndens beslut, om sådant finns"
          hint="Ärendenummer eller datum för beslutet."
        />
      )}

      <WarningList warnings={ctx.warnings.filter((w) => w.step === 2)} />
    </div>
  );
}
