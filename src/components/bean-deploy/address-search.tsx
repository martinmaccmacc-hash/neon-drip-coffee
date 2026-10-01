"use client";

import { useEffect, useRef, useState } from "react";

type MapboxFeature = {
  id: string;
  place_name: string;
  text: string;
  address?: string;
  center: [number, number]; // [lng, lat]
  context?: { id: string; text: string }[];
};

export type ParsedAddress = {
  street: string;
  number: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
};

// Extrae los campos de dirección del array `context` de Mapbox
function parseFeature(feature: MapboxFeature): ParsedAddress {
  const context = feature.context ?? [];
  const find = (prefix: string) =>
    context.find((c) => c.id.startsWith(prefix))?.text ?? "";

  return {
    street: feature.text ?? "",
    number: feature.address ?? "",
    city: find("place") || find("locality"),
    state: find("region"),
    zipCode: find("postcode"),
    latitude: feature.center[1],
    longitude: feature.center[0],
  };
}

export function AddressSearch({
  onSelect,
}: {
  onSelect: (address: ParsedAddress) => void;
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<MapboxFeature[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [preview, setPreview] = useState<{ lat: number; lng: number } | null>(
    null
  );

  // Con menos de 4 caracteres no se muestran sugerencias
  const visibleSuggestions = query.trim().length < 4 ? [] : suggestions;

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce de 350 ms para no consultar Mapbox en cada tecla
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 4) return;

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            query
          )}.json?access_token=${token}&country=uy&types=address&limit=5&language=es`
        );
        const data = await res.json();
        setSuggestions(data.features ?? []);
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function handleSelect(feature: MapboxFeature) {
    const parsed = parseFeature(feature);
    setPreview({ lat: parsed.latitude, lng: parsed.longitude });
    setSuggestions([]);
    setQuery(feature.place_name);
    onSelect(parsed);
  }

  // Mapa estático de Mapbox para confirmar la ubicación
  const staticMapUrl = preview
    ? `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/pin-s+ec4899(${preview.lng},${preview.lat})/${preview.lng},${preview.lat},15,0/400x200@2x?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
    : null;

  return (
    <div>
      <label
        htmlFor="address-search"
        className="mb-1 block font-mono text-xs text-dim"
      >
        Buscar dirección
      </label>
      <div className="relative">
        <input
          id="address-search"
          autoComplete="street-address"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ej: Bvar. Artigas 1234, Montevideo"
          className="w-full rounded-lg border border-line bg-void px-3 py-2 text-sm text-ink outline-none focus:border-neon-cyan"
        />

        {visibleSuggestions.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full rounded-lg border border-line bg-surface shadow-lg">
            {visibleSuggestions.map((feature) => (
              <li key={feature.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(feature)}
                  className="w-full px-3 py-2 text-left font-mono text-xs text-dim hover:bg-void hover:text-ink"
                >
                  {feature.place_name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {isSearching && (
        <p className="mt-1 font-mono text-xs text-dim">Buscando...</p>
      )}

      {staticMapUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={staticMapUrl}
          alt="Vista previa de la dirección seleccionada"
          className="mt-3 w-full rounded-lg border border-line"
        />
      )}
    </div>
  );
}
