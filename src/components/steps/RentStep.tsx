"use client";

import type { CostMode, OtherCostItem } from "../../lib/types";
import { totalRent } from "../../lib/types";
import { formatMoney } from "../../lib/format";
import { NumberField, RadioField, SelectField, TextField, inputClass } from "../fields";
import { InfoBox, RepeatableList, StepIntro, WarningList, type StepProps } from "./common";

const COST_MODES: { value: CostMode; label: string }[] = [
  { value: "included", label: "Ingår i hyran" },
  { value: "separate_actual", label: "Separat, faktisk kostnad" },
  { value: "separate_fixed", label: "Separat, fast belopp" },
  { value: "tenant_own_contract", label: "Eget abonnemang" },
];

const COSTS = [
  ["costHeating", "Värme"],
  ["costWater", "Vatten och varmvatten"],
  ["costElectricity", "Hushållsel"],
  ["costBroadband", "Bredband"],
  ["costTv", "TV"],
  ["costLaundry", "Tvättstuga"],
  ["costWaste", "Sophämtning"],
] as const;

/** Steg 5 — hyra och kostnader (§5.5). El är eget fält: den vanligaste tvistefrågan. */
export default function RentStep({ ctl, a, ctx }: StepProps) {
  return (
    <div className="space-y-6">
      <StepIntro title="Hyra och kostnader">
        Hyran sätts enligt {ctx.rentRule.clauseId === "C-RENT-PRIVATE" ? "kostnadsprincipen" : "bruksvärdesprincipen"}.
      </StepIntro>

      <InfoBox title="Så får hyran sättas i ditt fall">
        <p>{ctx.rentRule.principle}</p>
        <p className="text-xs text-sky-800">Lagrum: {ctx.rentRule.legalBasis}</p>
      </InfoBox>

      <WarningList warnings={ctx.warnings.filter((w) => w.step === 5)} />

      <div className="grid sm:grid-cols-2 gap-3">
        <NumberField ctl={ctl} name="baseRent" label="Grundhyra" required suffix="kr/mån" min={0} />
        {a.furnished !== "none" && a.furnished !== "" && (
          <NumberField ctl={ctl} name="furnishingSurcharge" label="Möbleringstillägg" suffix="kr/mån" min={0} />
        )}
        {a.hasParking && <NumberField ctl={ctl} name="parkingFee" label="Avgift för parkering" suffix="kr/mån" min={0} />}
      </div>

      <div className="rounded-lg border bg-gray-50 px-4 py-3">
        <p className="text-sm text-gray-600">Total månadshyra</p>
        <p className="text-xl font-semibold text-gray-900">{formatMoney(totalRent(a))}</p>
      </div>

      <RadioField
        ctl={ctl}
        name="paymentDueRule"
        label="När ska hyran betalas?"
        required
        options={[
          { value: "last_weekday_of_prior_month", label: "Sista vardagen i månaden före" },
          { value: "first_of_month", label: "Den första i varje månad" },
          { value: "custom", label: "Annat" },
        ]}
      />
      {a.paymentDueRule === "custom" && (
        <TextField ctl={ctl} name="paymentDueCustom" label="Beskriv förfallodagen" required />
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        <SelectField
          ctl={ctl}
          name="paymentMethod"
          label="Betalsätt"
          required
          options={[
            { value: "bankgiro", label: "Bankgiro" },
            { value: "plusgiro", label: "Plusgiro" },
            { value: "bank_account", label: "Bankkonto" },
            { value: "swish", label: "Swish" },
          ]}
        />
        <TextField
          ctl={ctl}
          name="paymentReference"
          label="Konto- eller betalningsnummer"
          required
          hint="Dit hyran ska betalas."
        />
      </div>

      <RadioField
        ctl={ctl}
        name="lateInterest"
        label="Dröjsmålsränta vid sen betalning"
        required
        options={[
          { value: "statutory", label: "Enligt räntelagen", description: "Referensränta plus åtta procentenheter" },
          { value: "none", label: "Ingen dröjsmålsränta" },
        ]}
      />

      <RadioField
        ctl={ctl}
        name="rentAdjustment"
        label="Hur kan hyran ändras under hyrestiden?"
        required
        options={[
          { value: "none", label: "Hyran är fast" },
          { value: "annual_negotiation", label: "Årlig förhandling mellan parterna" },
          { value: "index", label: "Indexuppräkning" },
        ]}
      />
      {a.rentAdjustment === "index" && (
        <TextField ctl={ctl} name="rentAdjustmentIndex" label="Vilket index?" required hint="T.ex. konsumentprisindex (KPI)." />
      )}

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-800">Driftskostnader</h3>
        <p className="text-xs text-gray-600">
          Ange för varje post om den ingår i hyran eller betalas separat. Otydlighet om el är den
          vanligaste tvistefrågan mellan hyresvärd och hyresgäst.
        </p>
        <div className="space-y-3">
          {COSTS.map(([key, label]) => (
            <div key={key} className="grid sm:grid-cols-[1fr_auto] gap-3 items-end">
              <SelectField
                ctl={ctl}
                name={`${key}.mode`}
                label={label}
                options={COST_MODES}
                placeholder="Välj hur kostnaden hanteras"
              />
              {a[key].mode === "separate_fixed" && (
                <NumberField ctl={ctl} name={`${key}.amount`} label="Belopp" suffix="kr/mån" min={0} />
              )}
            </div>
          ))}
        </div>

        <RepeatableList
          title="Övrig kostnad"
          items={a.costOther}
          addLabel="+ Lägg till annan kostnad"
          onAdd={() =>
            ctl.set("costOther", [...a.costOther, { label: "", mode: "included" } as OtherCostItem])
          }
          onRemove={(i) => ctl.set("costOther", a.costOther.filter((_, index) => index !== i))}
          renderItem={(i) => (
            <div className="space-y-3">
              <TextField ctl={ctl} name={`costOther.${i}.label`} label="Vad avser kostnaden?" required />
              <label className="block text-sm font-medium text-gray-800" htmlFor={`costOther-${i}-mode`}>
                Hantering
              </label>
              <select
                id={`costOther-${i}-mode`}
                className={inputClass}
                value={a.costOther[i].mode}
                onChange={(e) => ctl.set(`costOther.${i}.mode`, e.target.value)}
              >
                {COST_MODES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              {a.costOther[i].mode === "separate_fixed" && (
                <NumberField ctl={ctl} name={`costOther.${i}.amount`} label="Belopp" suffix="kr/mån" min={0} />
              )}
            </div>
          )}
        />
      </section>
    </div>
  );
}
