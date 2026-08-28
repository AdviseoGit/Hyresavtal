"use client";

import type { DepositDeduction } from "../../lib/types";
import { depositMonthsEquivalent } from "../../lib/validation";
import { CheckboxField, NumberField } from "../fields";
import { StepIntro, WarningList, type StepProps } from "./common";

const DEDUCTIONS: { value: DepositDeduction; label: string }[] = [
  { value: "unpaid_rent", label: "Obetald hyra" },
  { value: "damage_beyond_wear", label: "Skador utöver normalt slitage" },
  { value: "cleaning", label: "Kostnad för städning" },
  { value: "missing_keys", label: "Saknade nycklar" },
];

/** Steg 7 — deposition (§5.7). Beloppet ensamt är värdelöst utan villkor. */
export default function DepositStep({ ctl, a, ctx }: StepProps) {
  const months = depositMonthsEquivalent(a);
  const hasDeposit = (a.depositAmount ?? 0) > 0;

  const toggle = (value: DepositDeduction, checked: boolean) => {
    const next = checked
      ? [...a.depositDeductions, value]
      : a.depositDeductions.filter((d) => d !== value);
    ctl.set("depositDeductions", next);
  };

  return (
    <div className="space-y-6">
      <StepIntro title="Deposition och säkerhet">
        Utan villkor om återbetalningstid och avräkningsgrunder fyller depositionen ingen funktion.
      </StepIntro>

      <NumberField ctl={ctl} name="depositAmount" label="Deposition" suffix="kr" min={0} hint="Lämna tomt om ingen deposition tas ut." />

      {months !== null && (
        <p className="text-sm text-gray-600">
          Motsvarar {months.toFixed(1).replace(".", ",")} månadshyror.
        </p>
      )}

      {hasDeposit && (
        <>
          <NumberField
            ctl={ctl}
            name="depositReturnDays"
            label="Depositionen återbetalas inom"
            suffix="dagar efter avflyttning"
            required
            min={0}
          />
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-gray-800">
              Vad får dras av från depositionen? <span className="text-gray-400">*</span>
            </legend>
            {DEDUCTIONS.map((d) => (
              <label key={d.value} className="flex items-start gap-2 text-sm text-gray-800">
                <input
                  type="checkbox"
                  checked={a.depositDeductions.includes(d.value)}
                  onChange={(e) => toggle(d.value, e.target.checked)}
                  className="mt-0.5"
                />
                <span>{d.label}</span>
              </label>
            ))}
            {ctl.isTouched("depositDeductions") && ctl.errors.depositDeductions && (
              <p role="alert" className="text-xs text-red-600">
                {ctl.errors.depositDeductions}
              </p>
            )}
          </fieldset>
        </>
      )}

      <NumberField
        ctl={ctl}
        name="prepaidRentMonths"
        label="Förskottsbetald hyra"
        suffix="månader"
        min={0}
        hint="Förskottshyra utöver en månad kan strida mot 12 kap. 20 § jordabalken."
      />

      <CheckboxField
        ctl={ctl}
        name="inspectionOnMoveIn"
        label="Bostaden ska besiktigas vid tillträdet"
      />
      <CheckboxField
        ctl={ctl}
        name="inspectionOnMoveOut"
        label="Bostaden ska besiktigas vid avflyttningen"
      />

      <WarningList warnings={ctx.warnings.filter((w) => w.step === 7)} />
    </div>
  );
}
