"use client";

import { describeNotice } from "../../lib/legal/regime";
import { DateField, NumberField, RadioField } from "../fields";
import { InfoBox, StepIntro, WarningList, type StepProps } from "./common";

/** Steg 6 — avtalstid (§5.6). Uppsägningstiderna beräknas, de matas inte in. */
export default function TermStep({ ctl, a, ctx }: StepProps) {
  return (
    <div className="space-y-6">
      <StepIntro title="Avtalstid och uppsägning">
        Uppsägningstiderna följer av lagen och räknas ut åt dig.
      </StepIntro>

      <RadioField
        ctl={ctl}
        name="contractType"
        label="Avtalstyp"
        required
        options={[
          { value: "indefinite", label: "Tills vidare", description: "Löper till dess någon säger upp avtalet" },
          { value: "fixed", label: "Bestämd tid", description: "Löper till ett bestämt slutdatum" },
        ]}
      />

      <div className="grid sm:grid-cols-2 gap-3">
        <DateField ctl={ctl} name="startDate" label="Tillträdesdag" required />
        {a.contractType === "fixed" && <DateField ctl={ctl} name="endDate" label="Sista hyresdag" required />}
      </div>

      {a.contractType === "fixed" && (
        <RadioField
          ctl={ctl}
          name="fixedTermRenewal"
          label="Vad händer när hyrestiden löper ut?"
          required
          options={[
            { value: "ends", label: "Avtalet upphör" },
            { value: "auto_renew_same", label: "Avtalet förlängs med lika lång tid" },
            { value: "auto_renew_indefinite", label: "Avtalet övergår till att gälla tills vidare" },
          ]}
        />
      )}

      <InfoBox title="Uppsägningstider enligt lag">
        <p>
          <strong>Hyresvärden</strong> kan säga upp avtalet {describeNotice(ctx.noticePeriods.landlord)}.
        </p>
        <p>
          <strong>Hyresgästen</strong> kan säga upp avtalet {describeNotice(ctx.noticePeriods.tenant)}.
        </p>
        {ctx.noticePeriods.tenantStatutoryThreeMonths && (
          <p>
            Hyresgästen har dessutom alltid rätt att säga upp avtalet till månadsskifte tidigast tre
            månader bort, enligt{" "}
            {ctx.regime === "JB12"
              ? "12 kap. 5 § jordabalken"
              : "6 kap. 1 § andra stycket privatuthyrningslagen"}
            . Den rätten kan inte avtalas bort.
          </p>
        )}
        <p className="text-xs text-sky-800">Lagrum: {ctx.noticePeriods.landlord.legalBasis}</p>
      </InfoBox>

      <NumberField
        ctl={ctl}
        name="noticeExtendedLandlord"
        label="Längre uppsägningstid för hyresvärden (frivilligt)"
        suffix="månader"
        min={0}
        hint="Uppsägningstiden får bara förlängas till hyresgästens fördel. En kortare tid än lagens minimum är utan verkan."
      />

      <div className="rounded-lg border bg-gray-50 px-4 py-3 text-sm">
        <p className="font-medium text-gray-900">Besittningsskydd</p>
        <p className="text-gray-700 mt-0.5">{ctx.securityOfTenure.reason}</p>
        <p className="text-xs text-gray-500 mt-1">Lagrum: {ctx.securityOfTenure.legalBasis}</p>
      </div>

      <WarningList warnings={ctx.warnings.filter((w) => w.step === 6)} />
    </div>
  );
}
