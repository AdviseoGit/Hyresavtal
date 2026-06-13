"use client";

import { useState } from "react";

interface FormData {
  landlordName?: string;
  landlordOrgNr?: string;
  landlordAddress?: string;
  tenantName?: string;
  tenantPersonNr?: string;
  tenantAddress?: string;
  propertyAddress?: string;
  propertyDescription?: string;
  roomsAndArea?: string;
  rentAmount?: string;
  rentPaymentDate?: string;
  deposit?: string;
  inkluderarVarme?: string;
  contractType?: "tillsvidare" | "bestämd_tid";
  startDate?: string;
  endDate?: string;
}

const input =
  "w-full p-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand/40";

export default function AgreementForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    contractType: "tillsvidare",
    inkluderarVarme: "ja",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  const totalSteps = 3;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/generate-agreement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Kunde inte skapa avtalet. Försök igen.");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "hyresavtal.pdf";
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

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 sm:p-8 border rounded-xl shadow-sm bg-white"
    >
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span className="font-semibold text-gray-700">Steg {step} av {totalSteps}</span>
          <span>
            {step === 1 ? "Parterna" : step === 2 ? "Hyresobjektet" : "Hyra & avtalstid"}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-brand h-2 rounded-full transition-all"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {step === 1 && (
        <fieldset className="space-y-3">
          <legend className="text-lg font-semibold mb-3">Om parterna</legend>
          <input name="landlordName" value={formData.landlordName ?? ""} onChange={handleChange} placeholder="Hyresvärdens namn / företag" className={input} />
          <input name="landlordOrgNr" value={formData.landlordOrgNr ?? ""} onChange={handleChange} placeholder="Hyresvärdens person-/org.nr (valfritt)" className={input} />
          <input name="landlordAddress" value={formData.landlordAddress ?? ""} onChange={handleChange} placeholder="Hyresvärdens adress" className={input} />
          <hr className="my-2" />
          <input name="tenantName" value={formData.tenantName ?? ""} onChange={handleChange} placeholder="Hyresgästens namn" className={input} />
          <input name="tenantPersonNr" value={formData.tenantPersonNr ?? ""} onChange={handleChange} placeholder="Hyresgästens personnummer (valfritt)" className={input} />
          <input name="tenantAddress" value={formData.tenantAddress ?? ""} onChange={handleChange} placeholder="Hyresgästens nuvarande adress" className={input} />
        </fieldset>
      )}

      {step === 2 && (
        <fieldset className="space-y-3">
          <legend className="text-lg font-semibold mb-3">Om hyresobjektet</legend>
          <input name="propertyAddress" value={formData.propertyAddress ?? ""} onChange={handleChange} placeholder="Uthyrningsobjektets adress" className={input} />
          <input name="roomsAndArea" value={formData.roomsAndArea ?? ""} onChange={handleChange} placeholder="Antal rum och yta (t.ex. 2 rok, 56 kvm)" className={input} />
          <textarea name="propertyDescription" value={formData.propertyDescription ?? ""} onChange={handleChange} placeholder="Ev. beskrivning (möblerat, förråd, p-plats m.m.)" className={input} rows={3} />
          <label className="block text-sm text-gray-600 mt-2">Ingår värme och vatten i hyran?</label>
          <select name="inkluderarVarme" value={formData.inkluderarVarme} onChange={handleChange} className={input}>
            <option value="ja">Ja, värme och vatten ingår</option>
            <option value="nej">Nej, betalas separat</option>
          </select>
        </fieldset>
      )}

      {step === 3 && (
        <fieldset className="space-y-3">
          <legend className="text-lg font-semibold mb-3">Hyra och avtalstid</legend>
          <input type="number" name="rentAmount" value={formData.rentAmount ?? ""} onChange={handleChange} placeholder="Månadshyra (SEK)" className={input} />
          <input name="rentPaymentDate" value={formData.rentPaymentDate ?? ""} onChange={handleChange} placeholder="Förfallodag, t.ex. 'sista vardagen i månaden'" className={input} />
          <input type="number" name="deposit" value={formData.deposit ?? ""} onChange={handleChange} placeholder="Deposition (SEK, valfritt)" className={input} />
          <label className="block text-sm text-gray-600 mt-2">Avtalstyp</label>
          <select name="contractType" value={formData.contractType} onChange={handleChange} className={input}>
            <option value="tillsvidare">Tillsvidare (löpande)</option>
            <option value="bestämd_tid">Bestämd tid</option>
          </select>
          <label className="block text-sm text-gray-600 mt-2">Tillträdesdag</label>
          <input type="date" name="startDate" value={formData.startDate ?? ""} onChange={handleChange} className={input} />
          {formData.contractType === "bestämd_tid" && (
            <>
              <label className="block text-sm text-gray-600 mt-2">Slutdatum</label>
              <input type="date" name="endDate" value={formData.endDate ?? ""} onChange={handleChange} className={input} />
            </>
          )}
        </fieldset>
      )}

      {step === totalSteps && (
        <label className="flex items-start gap-2 mt-6 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-0.5"
          />
          <span>
            Jag förstår att detta är ett <strong>utkast</strong> som inte utgör juridisk
            rådgivning, att jag själv ansvarar för att granska och anpassa det, och jag
            godkänner{" "}
            <a href="/villkor" target="_blank" rel="noopener noreferrer" className="text-brand underline">
              villkoren &amp; ansvarsfriskrivningen
            </a>
            .
          </span>
        </label>
      )}

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 1}
          className="px-4 py-2 rounded-md bg-gray-100 border disabled:opacity-50"
        >
          Föregående
        </button>
        {step < totalSteps ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            className="px-5 py-2 rounded-md bg-brand text-white hover:bg-brand-dark"
          >
            Nästa
          </button>
        ) : (
          <button
            type="submit"
            disabled={loading || !accepted}
            title={!accepted ? "Godkänn villkoren för att fortsätta" : undefined}
            className="px-5 py-2 rounded-md bg-brand text-white hover:bg-brand-dark disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Skapar avtal…" : "Skapa & ladda ner PDF"}
          </button>
        )}
      </div>
    </form>
  );
}
