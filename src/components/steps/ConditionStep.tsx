"use client";

import type { InventoryItem, KeyItem } from "../../lib/types";
import { NumberField, TextField, TextareaField } from "../fields";
import { RepeatableList, StepIntro, type StepProps } from "./common";

const KEY_TYPES = ["Lägenhetsnyckel", "Portnyckel", "Förrådsnyckel", "Postboxnyckel", "Passerbricka"];

/** Steg 8 — skick, inventarier och nycklar (§5.8). Den vanligaste tvistekällan. */
export default function ConditionStep({ ctl, a }: StepProps) {
  const furnished = a.furnished !== "none" && a.furnished !== "";

  return (
    <div className="space-y-8">
      <StepIntro title="Skick, inventarier och nycklar">
        Uppgifterna blir egna bilagor: besiktningsprotokoll, inventarielista och nyckelkvittens.
      </StepIntro>

      <TextareaField
        ctl={ctl}
        name="existingDamage"
        label="Kända brister vid tillträdet"
        hint="Skriv av det som redan är trasigt eller slitet, så slipper ni diskussionen vid avflyttning."
      />

      {furnished && (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-800">Inventarier</h3>
          {ctl.isTouched("inventoryItems") && ctl.errors.inventoryItems && (
            <p role="alert" className="text-xs text-red-600">
              {ctl.errors.inventoryItems}
            </p>
          )}
          <RepeatableList
            title="Inventarie"
            items={a.inventoryItems}
            addLabel="+ Lägg till inventarie"
            onAdd={() =>
              ctl.set("inventoryItems", [
                ...a.inventoryItems,
                { item: "", quantity: 1, condition: "" } as InventoryItem,
              ])
            }
            onRemove={(i) =>
              ctl.set("inventoryItems", a.inventoryItems.filter((_, index) => index !== i))
            }
            renderItem={(i) => (
              <div className="grid sm:grid-cols-3 gap-3">
                <TextField ctl={ctl} name={`inventoryItems.${i}.item`} label="Föremål" required />
                <NumberField ctl={ctl} name={`inventoryItems.${i}.quantity`} label="Antal" min={1} />
                <TextField ctl={ctl} name={`inventoryItems.${i}.condition`} label="Skick" />
              </div>
            )}
          />
        </section>
      )}

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-800">Nycklar</h3>
        {ctl.isTouched("keys") && ctl.errors.keys && (
          <p role="alert" className="text-xs text-red-600">
            {ctl.errors.keys}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {KEY_TYPES.filter((t) => !a.keys.some((k) => k.type === t)).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => ctl.set("keys", [...a.keys, { type: t, quantity: 1 } as KeyItem])}
              className="text-xs border rounded-full px-3 py-1 bg-white hover:bg-gray-50"
            >
              + {t}
            </button>
          ))}
        </div>
        <RepeatableList
          title="Nyckel"
          items={a.keys}
          addLabel="+ Lägg till annan nyckel"
          onAdd={() => ctl.set("keys", [...a.keys, { type: "", quantity: 1 } as KeyItem])}
          onRemove={(i) => ctl.set("keys", a.keys.filter((_, index) => index !== i))}
          renderItem={(i) => (
            <div className="grid sm:grid-cols-2 gap-3">
              <TextField ctl={ctl} name={`keys.${i}.type`} label="Nyckeltyp" required />
              <NumberField ctl={ctl} name={`keys.${i}.quantity`} label="Antal" min={1} />
            </div>
          )}
        />
        <NumberField
          ctl={ctl}
          name="keyReplacementCost"
          label="Kostnad för ersättningsnyckel"
          suffix="kr"
          min={0}
        />
      </section>
    </div>
  );
}
