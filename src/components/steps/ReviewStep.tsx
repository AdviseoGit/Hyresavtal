"use client";

import Link from "next/link";

import { formatAddress, formatDate, formatMoney, tenantNames } from "../../lib/format";
import { totalRent } from "../../lib/types";
import { describeNotice } from "../../lib/legal/regime";
import { CheckboxField, DateField, NumberField, TextField } from "../fields";
import { RegimeBox, StepIntro, WarningList, type StepProps } from "./common";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-2 border-b last:border-0 grid sm:grid-cols-[200px_1fr] gap-1">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900">{value}</dd>
    </div>
  );
}

/** Steg 10 — granska och signera (§7). Alla varningar samlas här. */
export default function ReviewStep({ ctl, a, ctx }: StepProps) {
  const blocking = ctx.warnings.filter((w) => w.level === "blocking");

  const documents = [
    "Hyresavtal",
    a.inspectionOnMoveIn || a.inspectionOnMoveOut ? "Bilaga: besiktningsprotokoll" : null,
    a.furnished !== "none" && a.furnished !== "" ? "Bilaga: inventarielista" : null,
    a.keys.length > 0 ? "Bilaga: nyckelkvittens" : null,
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-6">
      <StepIntro title="Granska och signera">
        Kontrollera uppgifterna innan avtalet skapas.
      </StepIntro>

      <RegimeBox ctx={ctx} />

      <WarningList warnings={ctx.warnings} />

      <section>
        <h3 className="text-sm font-semibold text-gray-800 mb-2">Sammanfattning</h3>
        <dl className="rounded-lg border px-4 divide-y-0">
          <Row label="Hyresvärd" value={a.landlordName || "—"} />
          <Row label="Hyresgäst" value={tenantNames(a)} />
          <Row label="Hyresobjekt" value={formatAddress(a.objectAddress)} />
          <Row label="Omfattning" value={`${a.rooms ?? "—"} rum, ${a.areaSqm ?? "—"} kvm`} />
          <Row label="Total månadshyra" value={formatMoney(totalRent(a))} />
          <Row
            label="Hyrestid"
            value={
              a.contractType === "fixed"
                ? `${formatDate(a.startDate)} – ${formatDate(a.endDate)}`
                : `Från ${formatDate(a.startDate)}, tills vidare`
            }
          />
          <Row label="Uppsägning, hyresvärd" value={describeNotice(ctx.noticePeriods.landlord)} />
          <Row label="Uppsägning, hyresgäst" value={describeNotice(ctx.noticePeriods.tenant)} />
          <Row label="Deposition" value={a.depositAmount ? formatMoney(a.depositAmount) : "Ingen"} />
        </dl>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-gray-800 mb-2">Detta skapas</h3>
        <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
          {documents.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
        <p className="text-xs text-gray-500 mt-2">
          Handlingarna laddas ner som en sammanslagen PDF.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-800">Underskrift</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <TextField ctl={ctl} name="signingPlace" label="Ort" required />
          <DateField ctl={ctl} name="signingDate" label="Datum" required />
        </div>
        <NumberField
          ctl={ctl}
          name="copies"
          label="Antal exemplar"
          required
          min={1}
          hint="Ett exemplar per part är brukligt."
        />
      </section>

      {blocking.length > 0 && (
        <CheckboxField
          ctl={ctl}
          name="acknowledgeConsentRisk"
          label="Jag har läst varningen om samtycke och förstår risken med att hyra ut utan tillstånd."
        />
      )}

      {ctx.securityOfTenure.status === "arises_after" && (
        <CheckboxField
          ctl={ctl}
          name="acknowledgeTenureWaiver"
          label="Jag förstår att ett avstående från besittningsskydd kräver en särskilt upprättad handling och normalt hyresnämndens godkännande."
        />
      )}

      <CheckboxField
        ctl={ctl}
        name="acknowledgeDraft"
        label="Jag förstår att detta är ett utkast som inte utgör juridisk rådgivning och att jag själv ansvarar för att granska och anpassa det."
      />
      <p className="text-xs text-gray-500">
        Se{" "}
        <Link href="/villkor" className="underline">
          villkor &amp; ansvarsfriskrivning
        </Link>{" "}
        och{" "}
        <Link href="/integritetspolicy" className="underline">
          integritetspolicy
        </Link>
        .
      </p>
    </div>
  );
}
