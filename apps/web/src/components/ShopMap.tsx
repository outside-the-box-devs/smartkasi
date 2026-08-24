'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default icon (leaflet's images not bundled by default in Next)
const icon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function ShopMap({ shops }: { shops: Array<{ id: string; name: string; lat: number; lng: number; township: string | null; licence_status: string }> }) {
  const center: [number, number] = shops.length ? [shops[0].lat, shops[0].lng] : [-26.2461, 27.9212];

  // Teal marker for verified shops — colors from theme tokens, not raw hex.
  const tealIcon = new L.DivIcon({
    html: `<div style="background:var(--color-success);width:14px;height:14px;border-radius:9999px;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>`,
    className: '',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });

  const amberIcon = new L.DivIcon({
    html: `<div style="background:var(--color-warning);width:14px;height:14px;border-radius:9999px;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>`,
    className: '',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });

  return (
    <div style={{ height: 320, borderRadius: 'var(--radius-container)', overflow: 'hidden', border: '1px solid var(--color-border)' } as any}>
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors — Township tiles'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {shops.map((s) => (
          <Marker
            key={s.id}
            position={[s.lat, s.lng]}
            icon={s.licence_status === 'verified' ? tealIcon : amberIcon}
          >
            <Popup>
              <strong>{s.name}</strong>
              <br />
              {s.township ?? 'Soweto'} • {s.licence_status}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
