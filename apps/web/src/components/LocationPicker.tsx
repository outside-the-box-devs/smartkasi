'use client';

// LocationPicker — users should never have to know what latitude/longitude are.
// They search a street address (OpenStreetMap / Nominatim via leaflet-geosearch,
// MIT-licensed), or press "Use my current location" and the browser + Nominatim
// reverse geocoding fill everything in. A small draggable map lets them nudge
// the pin, and an advanced section still exposes raw coordinates.

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { Typeahead } from '@astryxdesign/core/Typeahead';
import type { SearchableItem, SearchSource } from '@astryxdesign/core/Typeahead';
import { TypeaheadItem } from '@astryxdesign/core/Typeahead';
import { Button } from '@astryxdesign/core/Button';
import { IconButton } from '@astryxdesign/core/IconButton';
import { VStack, HStack } from '@astryxdesign/core/Stack';
import { Heading, Text } from '@astryxdesign/core/Text';
import { NumberInput } from '@astryxdesign/core/NumberInput';
import { Collapsible } from '@astryxdesign/core/Collapsible';
import { ArrowsPointingOutIcon } from '@heroicons/react/24/outline';

/** What the picker hands back to the form. Address fields arrive when known;
 *  pin drags send coordinates only. */
export interface PickedLocation {
  lat: number;
  lng: number;
  address_line?: string;
  township?: string;
  city?: string;
  province?: string;
}

interface AddressItem extends SearchableItem<{ detail: string }> {
  lat: number;
  lng: number;
  address_line: string;
  township: string;
  city: string;
  province: string;
}

const provider = new OpenStreetMapProvider({
  params: {
    addressdetails: 1,
    countrycodes: 'za',
    'accept-language': 'en',
  },
});

/** Nominatim structured address → SmartKasi shop fields. */
function splitAddress(addr: Record<string, string> | undefined, fallback: string) {
  const street = [addr?.house_number, addr?.road].filter(Boolean).join(' ');
  const township =
    addr?.suburb ?? addr?.neighbourhood ?? addr?.city_district ?? addr?.quarter ?? '';
  const city = addr?.city ?? addr?.town ?? addr?.village ?? addr?.municipality ?? '';
  const province = addr?.state ?? '';
  return {
    address_line: street || fallback.split(',')[0] || '',
    township,
    city: city || province, // rural addresses sometimes only have the province
    province,
  };
}

/** "1423 Vilakazi St, Orlando West, Soweto, GP, 1804, South Africa" → short label + detail. */
function shortenLabel(displayName: string): { label: string; description: string } {
  const parts = displayName.split(', ').filter(Boolean);
  const label = parts.slice(0, 2).join(', ');
  const description = parts.slice(2, -1).join(', '); // drop country tail
  return { label, description };
}

const addressSource: SearchSource<AddressItem> = {
  async search(query) {
    if (query.trim().length < 3) return [];
    try {
      const results = await provider.search({ query: query.trim() });
      return results.slice(0, 6).map((r) => {
        const { label, description } = shortenLabel(r.label);
        const raw = r.raw as unknown as Record<string, unknown>;
        return {
          id: String(raw.place_id ?? `${r.x},${r.y}`),
          label,
          auxiliaryData: { detail: description },
          lat: r.y,
          lng: r.x,
          ...splitAddress(raw.address as Record<string, string> | undefined, r.label),
        };
      });
    } catch {
      return [];
    }
  },
  bootstrap() {
    return [];
  },
};

async function reverseGeocode(lat: number, lng: number) {
  const url =
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2` +
    `&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error('reverse failed');
  const json = (await res.json()) as Record<string, unknown>;
  return splitAddress(json.address as Record<string, string> | undefined, String(json.display_name ?? ''));
}

function friendlyGeoError(err: GeolocationPositionError): string {
  if (err.code === err.PERMISSION_DENIED) {
    return 'Location permission is off for this site — search for your address above instead.';
  }
  return "Couldn't get your location. Check that location services are on, or type your address above.";
}

export default function LocationPicker({
  lat,
  lng,
  onChange,
}: {
  lat: number;
  lng: number;
  onChange: (loc: Partial<PickedLocation>) => void;
}) {
  const [selected, setSelected] = useState<AddressItem | null>(null);
  const [locating, setLocating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);

  // Escape closes the maximized map.
  useEffect(() => {
    if (!isMaximized) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMaximized(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isMaximized]);

  function pick(item: AddressItem | null) {
    setSelected(item);
    setNotice(null);
    if (!item) return;
    onChange({
      lat: item.lat,
      lng: item.lng,
      address_line: item.address_line,
      township: item.township || undefined,
      city: item.city || undefined,
      province: item.province || undefined,
    });
  }

  function useMyLocation() {
    setLocating(true);
    setNotice(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          let address: Partial<PickedLocation> = {};
          try {
            address = await reverseGeocode(latitude, longitude);
          } catch {
            // Coordinates alone are still useful; address fields stay as typed.
          }
          setSelected(null);
          onChange({ lat: latitude, lng: longitude, ...address });
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        setNotice(friendlyGeoError(err));
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60_000 },
    );
  }

  const pinIcon = useMemo(
    () =>
      new L.Icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      }),
    [],
  );

  const frameStyle: CSSProperties = {
    position: 'relative',
    height: 220,
    borderRadius: 'var(--radius-container)',
    overflow: 'hidden',
    border: '1px solid var(--color-border)',
  };

  return (
    <VStack gap={3}>
      <Typeahead<AddressItem>
        label="Find your shop's location"
        description="Start typing the street name — we'll find the map coordinates for you."
        placeholder="e.g. Vilakazi Street, Orlando West"
        searchSource={addressSource}
        value={selected}
        onChange={pick}
        debounceMs={400}
        maxMenuItems={6}
        emptySearchResultsText="No streets matched — try a nearby landmark"
        renderItem={(item) => (
          <TypeaheadItem item={item} description={item.auxiliaryData?.detail} />
        )}
        width="100%"
      />

      <HStack gap={2} style={{ flexWrap: 'wrap', alignItems: 'center' }}>
        <Button
          size="sm"
          variant="secondary"
          label={locating ? 'Finding you…' : 'Use my current location'}
          onClick={useMyLocation}
          isLoading={locating}
          isDisabled={locating}
        />
        <Text type="supporting">or drag the pin below</Text>
      </HStack>

      {notice && (
        <Text type="supporting" style={{ color: 'var(--color-warning)' }}>
          {notice}
        </Text>
      )}

      <div style={frameStyle}>
        <PinMap lat={lat} lng={lng} onChange={onChange} pinIcon={pinIcon} />
        <div
          style={
            {
              position: 'absolute',
              top: 'var(--spacing-2)',
              right: 'var(--spacing-2)',
              zIndex: 500,
            } as CSSProperties
          }
        >
          <IconButton
            label="Maximize map"
            tooltip="Bigger map"
            variant="secondary"
            size="sm"
            elevation="low"
            icon={<ArrowsPointingOutIcon style={{ width: 16, height: 16 }} />}
            onClick={() => setIsMaximized(true)}
          />
        </div>
      </div>

      {isMaximized && (
        <div
          style={
            {
              position: 'fixed',
              inset: 0,
              zIndex: 1100,
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-3)',
              padding: 'var(--spacing-5)',
              backgroundColor: 'var(--color-background-body)',
            } as CSSProperties
          }
        >
          <HStack gap={3} style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <VStack gap={1}>
              <Heading level={3}>Drop your pin precisely</Heading>
              <Text type="body" color="secondary">
                Tap anywhere to move the pin, or drag it — then press Done.
              </Text>
            </VStack>
            <Button
              variant="primary"
              label="Done"
              onClick={() => setIsMaximized(false)}
            />
          </HStack>
          <div
            style={
              {
                flex: 1,
                minHeight: 0,
                borderRadius: 'var(--radius-container)',
                overflow: 'hidden',
                border: '1px solid var(--color-border)',
              } as CSSProperties
            }
          >
            <PinMap
              lat={lat}
              lng={lng}
              onChange={onChange}
              pinIcon={pinIcon}
              scrollWheelZoom
            />
          </div>
        </div>
      )}

      <Collapsible trigger="Adjust pin position manually" defaultIsOpen={false}>
        <VStack gap={3} style={{ paddingTop: 'var(--spacing-3)' }}>
          <Text type="supporting">
            For precision only — most owners never need this.
          </Text>
          <HStack gap={3}>
            <NumberInput
              label="Latitude"
              value={lat}
              onChange={(v) => onChange({ lat: v })}
              step={0.0001}
              min={-34.9}
              max={-22.1}
            />
            <NumberInput
              label="Longitude"
              value={lng}
              onChange={(v) => onChange({ lng: v })}
              step={0.0001}
              min={16.4}
              max={33.0}
            />
          </HStack>
        </VStack>
      </Collapsible>
    </VStack>
  );
}

/** The draggable-pin map — shared by the inline preview and the maximized view. */
function PinMap({
  lat,
  lng,
  onChange,
  pinIcon,
  scrollWheelZoom = false,
}: {
  lat: number;
  lng: number;
  onChange: (loc: Partial<PickedLocation>) => void;
  pinIcon: L.Icon;
  scrollWheelZoom?: boolean;
}) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={16}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={scrollWheelZoom}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker
        position={[lat, lng]}
        icon={pinIcon}
        draggable
        eventHandlers={{
          dragend: (e) => {
            const p = (e.target as L.Marker).getLatLng();
            onChange({ lat: p.lat, lng: p.lng });
          },
        }}
      />
      <ClickSetter onSet={(la, ln) => onChange({ lat: la, lng: ln })} />
      <Recenter lat={lat} lng={lng} />
    </MapContainer>
  );
}

function ClickSetter({ onSet }: { onSet: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onSet(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/** Follow external coordinate changes (search result, geolocation). */
function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
}
