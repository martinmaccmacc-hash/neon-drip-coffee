"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart-store";
import { AddressSearch, type ParsedAddress } from "./address-search";

type RoastPref = "LIGHT" | "MEDIUM" | "DARK" | null;
type GrindPref = "WHOLE_BEAN" | "ESPRESSO" | "FILTER" | "FRENCH_PRESS" | "MOKA";

const ROAST_OPTIONS: { value: RoastPref; label: string }[] = [
  { value: null, label: "Sorpresa del barista" },
  { value: "LIGHT", label: "Tostado claro" },
  { value: "MEDIUM", label: "Tostado medio" },
  { value: "DARK", label: "Tostado oscuro" },
];

const GRIND_OPTIONS: { value: GrindPref; label: string }[] = [
  { value: "WHOLE_BEAN", label: "Grano entero" },
  { value: "ESPRESSO", label: "Molido - Espresso" },
  { value: "FILTER", label: "Molido - Filtro" },
  { value: "FRENCH_PRESS", label: "Molido - Prensa francesa" },
  { value: "MOKA", label: "Molido - Moka" },
];

export function SubscribeForm({
  plan,
}: {
  plan: { id: string; name: string; price: number; frequencyLabel: string };
}) {
  const router = useRouter();
  const setSubscription = useCartStore((s) => s.setSubscription);

  const [roastPreference, setRoastPreference] = useState<RoastPref>(null);
  const [grindPreference, setGrindPreference] =
    useState<GrindPref>("WHOLE_BEAN");
  const [address, setAddress] = useState({
    street: "",
    number: "",
    city: "",
    state: "",
    zipCode: "",
  });
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Cuando el usuario elige una sugerencia del buscador, autocompletamos
  // los 5 campos de siempre — pero los dejamos editables igual, por si
  // Mapbox no tiene el dato exacto para esa dirección puntual.
  function handleAddressSelect(parsed: ParsedAddress) {
    setAddress({
      street: parsed.street,
      number: parsed.number,
      city: parsed.city,
      state: parsed.state,
      zipCode: parsed.zipCode,
    });
    setCoordinates({ lat: parsed.latitude, lng: parsed.longitude });
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSubscription({
      planId: plan.id,
      planName: plan.name,
      frequencyLabel: plan.frequencyLabel,
      price: plan.price,
      roastPreference,
      grindPreference,
      address: {
        ...address,
        latitude: coordinates?.lat,
        longitude: coordinates?.lng,
      },
    });

    router.push("/checkout");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-xl border border-line bg-surface p-6"
    >
      <div>
        <label className="mb-2 block font-mono text-xs text-dim">
          Preferencia de tostado
        </label>
        <div className="flex flex-wrap gap-2">
          {ROAST_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => setRoastPreference(opt.value)}
              className={`rounded-full border px-3 py-1 font-mono text-xs transition-colors ${
                roastPreference === opt.value
                  ? "border-neon-cyan bg-neon-cyan/10 text-neon-cyan"
                  : "border-line text-dim hover:border-neon-cyan/50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block font-mono text-xs text-dim">
          Molienda
        </label>
        <select
          value={grindPreference}
          onChange={(e) => setGrindPreference(e.target.value as GrindPref)}
          className="w-full rounded-lg border border-line bg-void px-3 py-2 text-sm text-ink outline-none focus:border-neon-cyan"
        >
          {GRIND_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="border-t border-line pt-5">
        <p className="mb-3 font-mono text-xs text-dim">Dirección de envío</p>

        <AddressSearch onSelect={handleAddressSelect} />

        <p className="mb-2 mt-4 font-mono text-xs text-dim">
          Revisá y completá si hace falta:
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <AddressField
              label="Calle"
              value={address.street}
              onChange={(v) => setAddress({ ...address, street: v })}
            />
          </div>
          <AddressField
            label="Número"
            value={address.number}
            onChange={(v) => setAddress({ ...address, number: v })}
          />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <AddressField
            label="Ciudad"
            value={address.city}
            onChange={(v) => setAddress({ ...address, city: v })}
          />
          <AddressField
            label="Departamento"
            value={address.state}
            onChange={(v) => setAddress({ ...address, state: v })}
          />
        </div>
        <div className="mt-3">
          <AddressField
            label="Código postal"
            value={address.zipCode}
            onChange={(v) => setAddress({ ...address, zipCode: v })}
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-neon-purple py-3 font-mono text-sm font-semibold uppercase tracking-wide text-void transition-transform hover:scale-[1.02] hover:bg-neon-pink"
      >
        Agregar suscripción al carrito
      </button>
    </form>
  );
}

function AddressField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block font-mono text-xs text-dim">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="w-full rounded-lg border border-line bg-void px-3 py-2 text-sm text-ink outline-none focus:border-neon-cyan"
      />
    </div>
  );
}
