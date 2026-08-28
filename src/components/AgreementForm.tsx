"use client";

/**
 * Guidat flöde i tio steg (§7). Lagvalet avgörs i steg 1 och styr resten:
 * synliga steg, uppsägningstider, klausuler och varningar.
 */

import { useEffect, useMemo, useRef, useState } from "react";

import { createEmptyAnswerSet, type AnswerSet } from "../lib/types";
import { agreementFileName } from "../lib/format";
import { resolveLegalContext } from "../lib/legal/regime";
import { clearDraft, loadDraft, saveDraft } from "../lib/draft";
import { setPath } from "../lib/path";
import { visibleSteps, type StepId } from "../lib/steps";
import { validateStep, type Errors } from "../lib/validation";
import type { FormCtl } from "./fields";
import BasicsStep from "./steps/BasicsStep";
import ConsentStep from "./steps/ConsentStep";
import PartiesStep from "./steps/PartiesStep";
import ObjectStep from "./steps/ObjectStep";
import RentStep from "./steps/RentStep";
import TermStep from "./steps/TermStep";
import DepositStep from "./steps/DepositStep";
import ConditionStep from "./steps/ConditionStep";
import UsageStep from "./steps/UsageStep";
import ReviewStep from "./steps/ReviewStep";
import type { StepProps } from "./steps/common";

const STEP_COMPONENTS: Record<StepId, (p: StepProps) => JSX.Element> = {
  basics: BasicsStep,
  consent: ConsentStep,
  parties: PartiesStep,
  object: ObjectStep,
  rent: RentStep,
  term: TermStep,
  deposit: DepositStep,
  condition: ConditionStep,
  usage: UsageStep,
  review: ReviewStep,
};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function AgreementForm() {
  const [answers, setAnswers] = useState<AnswerSet>(createEmptyAnswerSet);
  const [stepIdx, setStepIdx] = useState(0);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restored, setRestored] = useState(false);
  const headingRef = useRef<HTMLDivElement>(null);

  // Utkastet ligger bara i webbläsaren (§11).
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setAnswers(draft);
      setRestored(true);
    }
  }, []);

  const steps = useMemo(() => visibleSteps(answers), [answers]);
  const current = steps[Math.min(stepIdx, steps.length - 1)];
  const ctx = useMemo(() => resolveLegalContext(answers), [answers]);
  const errors: Errors = useMemo(() => validateStep(current.id, answers), [current.id, answers]);

  const ctl: FormCtl = {
    answers,
    errors,
    isTouched: (field) => Boolean(touched[field]),
    touch: (field) => setTouched((t) => ({ ...t, [field]: true })),
    set: (path, value) => {
      setAnswers((prev) => setPath(prev, path, value));
      setError(null);
    },
  };

  const goTo = (index: number) => {
    setStepIdx(index);
    window.requestAnimationFrame(() => headingRef.current?.focus());
  };

  const next = () => {
    const stepErrors = validateStep(current.id, answers);
    if (Object.keys(stepErrors).length > 0) {
      setTouched((t) => ({ ...t, ...Object.fromEntries(Object.keys(stepErrors).map((k) => [k, true])) }));
      window.requestAnimationFrame(() => {
        const el = document.querySelector<HTMLElement>('[aria-invalid="true"], [role="alert"]');
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
        el?.focus?.();
      });
      return;
    }

    const nextIndex = Math.min(stepIdx + 1, steps.length - 1);
    // Rimliga standardvärden när användaren når sista steget.
    if (steps[nextIndex].id === "review") {
      setAnswers((prev) => ({
        ...prev,
        copies: prev.copies ?? prev.tenants.length + 1,
        signingDate: prev.signingDate || today(),
      }));
    }
    saveDraft(answers);
    goTo(nextIndex);
  };

  const previous = () => goTo(Math.max(stepIdx - 1, 0));

  const reset = () => {
    clearDraft();
    setAnswers(createEmptyAnswerSet());
    setTouched({});
    setRestored(false);
    goTo(0);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const stepErrors = validateStep("review", answers);
    if (Object.keys(stepErrors).length > 0) {
      setTouched((t) => ({ ...t, ...Object.fromEntries(Object.keys(stepErrors).map((k) => [k, true])) }));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/generate-agreement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Kunde inte skapa avtalet. Försök igen.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = agreementFileName(answers, "-komplett");
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Något gick fel.");
    } finally {
      setLoading(false);
    }
  };

  const StepComponent = STEP_COMPONENTS[current.id];
  const isLast = current.id === "review";
  const blockingUnacknowledged =
    ctx.warnings.some((w) => w.level === "blocking") && !answers.acknowledgeConsentRisk;

  return (
    <form onSubmit={submit} className="p-6 sm:p-8 border rounded-xl shadow-sm bg-white">
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span className="font-semibold text-gray-700">
            Steg {stepIdx + 1} av {steps.length}
          </span>
          <span>{current.title}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2" role="progressbar" aria-valuenow={stepIdx + 1} aria-valuemin={1} aria-valuemax={steps.length} aria-label="Förlopp">
          <div
            className="bg-brand h-2 rounded-full transition-all"
            style={{ width: `${((stepIdx + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {restored && (
        <div className="mb-5 rounded-lg border bg-gray-50 px-4 py-3 text-sm text-gray-700 flex items-start justify-between gap-3">
          <span>Ett sparat utkast från den här webbläsaren har återställts.</span>
          <button type="button" onClick={reset} className="underline whitespace-nowrap">
            Börja om
          </button>
        </div>
      )}

      <div ref={headingRef} tabIndex={-1} className="outline-none">
        <StepComponent ctl={ctl} a={answers} ctx={ctx} />
      </div>

      {error && (
        <p role="alert" className="mt-5 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3 justify-between items-center mt-8">
        <button
          type="button"
          onClick={previous}
          disabled={stepIdx === 0}
          className="px-4 py-2 rounded-md bg-gray-100 border disabled:opacity-50"
        >
          Föregående
        </button>

        {!isLast ? (
          <button
            type="button"
            onClick={next}
            className="px-5 py-2 rounded-md bg-brand text-white hover:bg-brand-dark"
          >
            Nästa
          </button>
        ) : (
          <button
            type="submit"
            disabled={loading || !answers.acknowledgeDraft || blockingUnacknowledged}
            title={
              blockingUnacknowledged
                ? "Bekräfta varningen om samtycke för att fortsätta"
                : !answers.acknowledgeDraft
                ? "Godkänn villkoren för att fortsätta"
                : undefined
            }
            className="px-5 py-2 rounded-md bg-brand text-white hover:bg-brand-dark disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Skapar avtal…" : "Skapa & ladda ner PDF"}
          </button>
        )}
      </div>

      <div className="mt-6 pt-4 border-t text-xs text-gray-500 flex flex-wrap gap-3 justify-between">
        <span>Dina svar sparas lokalt i din webbläsare i 30 dagar och skickas aldrig till någon server förrän du skapar PDF:en.</span>
        <button type="button" onClick={reset} className="underline whitespace-nowrap">
          Rensa mina uppgifter
        </button>
      </div>
    </form>
  );
}
