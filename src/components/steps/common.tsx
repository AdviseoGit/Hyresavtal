"use client";

import type { ReactNode } from "react";

import type { AnswerSet } from "../../lib/types";
import type { LegalContext, LegalWarning } from "../../lib/legal/regime";
import type { FormCtl } from "../fields";

export interface StepProps {
  ctl: FormCtl;
  a: AnswerSet;
  ctx: LegalContext;
}

export function StepIntro({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="mb-5">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {children && <p className="mt-1 text-sm text-gray-600">{children}</p>}
    </div>
  );
}

export function InfoBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
      <p className="font-semibold">{title}</p>
      <div className="mt-1 space-y-1">{children}</div>
    </div>
  );
}

const WARNING_STYLE: Record<string, string> = {
  blocking: "border-red-300 bg-red-50 text-red-900",
  high: "border-amber-300 bg-amber-50 text-amber-900",
  medium: "border-amber-200 bg-amber-50 text-amber-900",
  info: "border-gray-200 bg-gray-50 text-gray-700",
};

const WARNING_TITLE: Record<string, string> = {
  blocking: "Viktigt",
  high: "Observera",
  medium: "Observera",
  info: "Information",
};

export function WarningList({ warnings }: { warnings: LegalWarning[] }) {
  if (warnings.length === 0) return null;
  return (
    <div className="space-y-3">
      {warnings.map((w) => (
        <div key={w.id + w.text} role={w.level === "blocking" ? "alert" : undefined} className={`rounded-lg border px-4 py-3 text-sm ${WARNING_STYLE[w.level]}`}>
          <p className="font-semibold">{WARNING_TITLE[w.level]}</p>
          <p className="mt-0.5">{w.text}</p>
        </div>
      ))}
    </div>
  );
}

/** Ruta som visar vilken lag som gäller — tjänstens huvudsakliga värde (§7). */
export function RegimeBox({ ctx }: { ctx: LegalContext }) {
  const tenure =
    ctx.securityOfTenure.status === "none"
      ? "Hyresgästen har inte besittningsskydd."
      : ctx.securityOfTenure.status === "arises_after"
      ? `Besittningsskydd uppstår efter ${ctx.securityOfTenure.months} månader.`
      : "Hyresgästen har besittningsskydd.";

  return (
    <div className="rounded-lg border-2 border-brand bg-brand/5 px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand">Tillämplig lag</p>
      <p className="mt-1 text-base font-semibold text-gray-900">
        Ditt avtal följer {ctx.regimeName}
      </p>
      <p className="mt-1 text-sm text-gray-700">{ctx.regimeExplanation}</p>
      <dl className="mt-3 grid sm:grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-gray-500">Uppsägningstid, hyresvärd</dt>
          <dd className="font-medium text-gray-900">
            {ctx.noticePeriods.landlord.months
              ? `${ctx.noticePeriods.landlord.months} mån`
              : ctx.noticePeriods.landlord.weeks
              ? `${ctx.noticePeriods.landlord.weeks} v`
              : `${ctx.noticePeriods.landlord.days} dag`}
          </dd>
        </div>
        <div>
          <dt className="text-gray-500">Uppsägningstid, hyresgäst</dt>
          <dd className="font-medium text-gray-900">
            {ctx.noticePeriods.tenant.months
              ? `${ctx.noticePeriods.tenant.months} mån`
              : ctx.noticePeriods.tenant.weeks
              ? `${ctx.noticePeriods.tenant.weeks} v`
              : `${ctx.noticePeriods.tenant.days} dag`}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-gray-500">Besittningsskydd</dt>
          <dd className="font-medium text-gray-900">{tenure}</dd>
        </div>
      </dl>
    </div>
  );
}

export function RepeatableList({
  title,
  items,
  onAdd,
  addLabel,
  onRemove,
  renderItem,
  max,
}: {
  title: string;
  items: unknown[];
  onAdd: () => void;
  addLabel: string;
  onRemove: (index: number) => void;
  renderItem: (index: number) => ReactNode;
  max?: number;
}) {
  return (
    <div className="space-y-4">
      {items.map((_, i) => (
        <div key={i} className="rounded-lg border p-4 space-y-3 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">
              {title} {items.length > 1 ? i + 1 : ""}
            </h3>
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="text-xs text-red-600 underline"
              >
                Ta bort
              </button>
            )}
          </div>
          {renderItem(i)}
        </div>
      ))}
      {(max === undefined || items.length < max) && (
        <button
          type="button"
          onClick={onAdd}
          className="text-sm text-brand underline font-medium"
        >
          {addLabel}
        </button>
      )}
    </div>
  );
}
