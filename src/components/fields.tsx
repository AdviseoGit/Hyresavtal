"use client";

/**
 * Formulärprimitiver med kopplade etiketter och aria-attribut (§10).
 * Placeholder används aldrig som enda etikett — det är ett WCAG-fel.
 */

import { useId, type ReactNode } from "react";

import type { Errors } from "../lib/validation";
import { getPath } from "../lib/path";

export interface FormCtl {
  answers: unknown;
  errors: Errors;
  /** Visa fel först när fältet lämnats eller steget validerats. */
  isTouched: (field: string) => boolean;
  touch: (field: string) => void;
  set: (path: string, value: unknown) => void;
}

export const inputClass =
  "w-full p-2.5 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-brand/40 disabled:bg-gray-50";
const errorClass = "border-red-500 focus:ring-red-300";

function useFieldIds(name: string) {
  const uid = useId();
  const id = `${name.replace(/\./g, "-")}-${uid}`;
  return { id, errorId: `${id}-error`, hintId: `${id}-hint` };
}

interface BaseProps {
  ctl: FormCtl;
  name: string;
  label: string;
  hint?: string;
  required?: boolean;
}

function Wrapper({
  id,
  label,
  hint,
  hintId,
  errorId,
  error,
  required,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  hintId: string;
  errorId: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-gray-800">
        {label}
        {required && <span className="text-gray-400"> *</span>}
      </label>
      {hint && (
        <p id={hintId} className="text-xs text-gray-500">
          {hint}
        </p>
      )}
      {children}
      {error && (
        <p id={errorId} role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function useField(ctl: FormCtl, name: string) {
  const error = ctl.isTouched(name) ? ctl.errors[name] : undefined;
  const value = getPath(ctl.answers, name);
  return { error, value };
}

export function TextField({
  ctl,
  name,
  label,
  hint,
  required,
  type = "text",
  placeholder,
  autoComplete,
}: BaseProps & { type?: string; placeholder?: string; autoComplete?: string }) {
  const { id, errorId, hintId } = useFieldIds(name);
  const { error, value } = useField(ctl, name);
  return (
    <Wrapper id={id} label={label} hint={hint} hintId={hintId} errorId={errorId} error={error} required={required}>
      <input
        id={id}
        name={name}
        type={type}
        lang="sv-SE"
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={(value as string) ?? ""}
        onChange={(e) => ctl.set(name, e.target.value)}
        onBlur={() => ctl.touch(name)}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined}
        className={`${inputClass} ${error ? errorClass : ""}`}
      />
    </Wrapper>
  );
}

export function NumberField({
  ctl,
  name,
  label,
  hint,
  required,
  suffix,
  min,
  max,
  step = 1,
}: BaseProps & { suffix?: string; min?: number; max?: number; step?: number }) {
  const { id, errorId, hintId } = useFieldIds(name);
  const { error, value } = useField(ctl, name);
  return (
    <Wrapper id={id} label={label} hint={hint} hintId={hintId} errorId={errorId} error={error} required={required}>
      <div className="flex items-center gap-2">
        <input
          id={id}
          name={name}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          step={step}
          value={value === null || value === undefined ? "" : String(value)}
          onChange={(e) => ctl.set(name, e.target.value === "" ? null : Number(e.target.value))}
          onBlur={() => ctl.touch(name)}
          aria-invalid={error ? true : undefined}
          aria-describedby={[hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined}
          className={`${inputClass} ${error ? errorClass : ""}`}
        />
        {suffix && <span className="text-sm text-gray-500 whitespace-nowrap">{suffix}</span>}
      </div>
    </Wrapper>
  );
}

export function DateField({ ctl, name, label, hint, required }: BaseProps) {
  return <TextField ctl={ctl} name={name} label={label} hint={hint ?? "ÅÅÅÅ-MM-DD"} required={required} type="date" />;
}

export interface Option<T extends string = string> {
  value: T;
  label: string;
  description?: string;
}

export function SelectField({
  ctl,
  name,
  label,
  hint,
  required,
  options,
  placeholder = "Välj…",
}: BaseProps & { options: Option[]; placeholder?: string }) {
  const { id, errorId, hintId } = useFieldIds(name);
  const { error, value } = useField(ctl, name);
  return (
    <Wrapper id={id} label={label} hint={hint} hintId={hintId} errorId={errorId} error={error} required={required}>
      <select
        id={id}
        name={name}
        value={(value as string) ?? ""}
        onChange={(e) => ctl.set(name, e.target.value)}
        onBlur={() => ctl.touch(name)}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined}
        className={`${inputClass} ${error ? errorClass : ""}`}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Wrapper>
  );
}

export function RadioField({
  ctl,
  name,
  label,
  hint,
  required,
  options,
}: BaseProps & { options: Option[] }) {
  const { id, errorId, hintId } = useFieldIds(name);
  const { error, value } = useField(ctl, name);
  return (
    <fieldset
      className="space-y-2"
      aria-invalid={error ? true : undefined}
      aria-describedby={[hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined}
    >
      <legend className="text-sm font-medium text-gray-800">
        {label}
        {required && <span className="text-gray-400"> *</span>}
      </legend>
      {hint && (
        <p id={hintId} className="text-xs text-gray-500">
          {hint}
        </p>
      )}
      <div className="space-y-2">
        {options.map((o) => (
          <label
            key={o.value}
            htmlFor={`${id}-${o.value}`}
            className={`flex gap-3 items-start p-3 border rounded-md cursor-pointer ${
              value === o.value ? "border-brand bg-brand/5" : "bg-white"
            }`}
          >
            <input
              id={`${id}-${o.value}`}
              type="radio"
              name={id}
              value={o.value}
              checked={value === o.value}
              onChange={() => {
                ctl.set(name, o.value);
                ctl.touch(name);
              }}
              className="mt-1"
            />
            <span>
              <span className="block text-sm font-medium text-gray-900">{o.label}</span>
              {o.description && <span className="block text-xs text-gray-600">{o.description}</span>}
            </span>
          </label>
        ))}
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </fieldset>
  );
}

/** Ja/nej som radiogrupp — booleskt värde, null tills användaren svarat. */
export function BooleanField({
  ctl,
  name,
  label,
  hint,
  required,
  yesLabel = "Ja",
  noLabel = "Nej",
  yesDescription,
  noDescription,
}: BaseProps & {
  yesLabel?: string;
  noLabel?: string;
  yesDescription?: string;
  noDescription?: string;
}) {
  const { id, errorId, hintId } = useFieldIds(name);
  const { error, value } = useField(ctl, name);
  const options = [
    { value: "true", label: yesLabel, description: yesDescription },
    { value: "false", label: noLabel, description: noDescription },
  ];
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-gray-800">
        {label}
        {required && <span className="text-gray-400"> *</span>}
      </legend>
      {hint && (
        <p id={hintId} className="text-xs text-gray-500">
          {hint}
        </p>
      )}
      <div className="space-y-2">
        {options.map((o) => (
          <label
            key={o.value}
            htmlFor={`${id}-${o.value}`}
            className={`flex gap-3 items-start p-3 border rounded-md cursor-pointer ${
              String(value) === o.value ? "border-brand bg-brand/5" : "bg-white"
            }`}
          >
            <input
              id={`${id}-${o.value}`}
              type="radio"
              name={id}
              checked={String(value) === o.value}
              onChange={() => {
                ctl.set(name, o.value === "true");
                ctl.touch(name);
              }}
              aria-describedby={error ? errorId : undefined}
              className="mt-1"
            />
            <span>
              <span className="block text-sm font-medium text-gray-900">{o.label}</span>
              {o.description && <span className="block text-xs text-gray-600">{o.description}</span>}
            </span>
          </label>
        ))}
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </fieldset>
  );
}

export function CheckboxField({
  ctl,
  name,
  label,
  hint,
}: Omit<BaseProps, "required"> & { label: string }) {
  const { id, errorId, hintId } = useFieldIds(name);
  const { error, value } = useField(ctl, name);
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="flex items-start gap-2 text-sm text-gray-800">
        <input
          id={id}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => {
            ctl.set(name, e.target.checked);
            ctl.touch(name);
          }}
          aria-describedby={[hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined}
          className="mt-0.5"
        />
        <span>{label}</span>
      </label>
      {hint && (
        <p id={hintId} className="text-xs text-gray-500 ml-6">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs text-red-600 ml-6">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextareaField({ ctl, name, label, hint, rows = 3 }: BaseProps & { rows?: number }) {
  const { id, errorId, hintId } = useFieldIds(name);
  const { error, value } = useField(ctl, name);
  return (
    <Wrapper id={id} label={label} hint={hint} hintId={hintId} errorId={errorId} error={error}>
      <textarea
        id={id}
        name={name}
        rows={rows}
        value={(value as string) ?? ""}
        onChange={(e) => ctl.set(name, e.target.value)}
        onBlur={() => ctl.touch(name)}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined}
        className={`${inputClass} ${error ? errorClass : ""}`}
      />
    </Wrapper>
  );
}

export function AddressFields({
  ctl,
  name,
  label,
}: {
  ctl: FormCtl;
  name: string;
  label: string;
}) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-gray-800 mb-1">{label}</legend>
      <TextField ctl={ctl} name={`${name}.street`} label="Gatuadress" required autoComplete="street-address" />
      <div className="grid sm:grid-cols-2 gap-3">
        <TextField ctl={ctl} name={`${name}.postalCode`} label="Postnummer" required placeholder="111 22" />
        <TextField ctl={ctl} name={`${name}.city`} label="Ort" required />
      </div>
    </fieldset>
  );
}
