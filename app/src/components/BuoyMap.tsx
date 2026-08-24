"use client";

import type { BuoyData } from "@/hooks/useOceanSense";
import { Map, MapMarker, MarkerContent, MarkerPopup, MapControls } from "@/components/ui/map";

// Centro y zoom inicial para ver todo el litoral peruano
// MapLibre usa [longitude, latitude] (orden inverso al de Leaflet)
const PERU_CENTER: [number, number] = [-78.8, -9.5];
const ZOOM = 5.4;

interface BuoyMapProps {
  buoys: BuoyData[];
}

function BuoyMarker({ buoy }: { buoy: BuoyData }) {
  const active = buoy.isActive;

  return (
    <MapMarker longitude={buoy.longitude} latitude={buoy.latitude}>
      <MarkerContent>
        <div className="relative h-[22px] w-[22px]">
          {active && (
            <span
              className="absolute inset-0 animate-ping rounded-full"
              style={{ background: "var(--turquoise-light)", opacity: 0.45 }}
            />
          )}
          <span
            className="absolute inset-0 flex items-center justify-center rounded-full text-[10px]"
            style={{
              background: active ? "var(--turquoise-light)" : "var(--muted-foreground)",
              border: `2.5px solid ${active ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.3)"}`,
              boxShadow: active ? "0 0 12px rgba(157,230,222,0.6)" : "none",
            }}
          >
            {active ? "🛟" : ""}
          </span>
        </div>
      </MarkerContent>

      <MarkerPopup
        className="!max-w-none !rounded-none !border !border-[rgba(100,200,195,0.25)] !bg-[var(--surface)] !p-0 !shadow-[0_12px_40px_rgba(0,0,0,0.7)]"
      >
        <div style={{ width: 230, padding: 16, fontFamily: "var(--font-sans)" }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "var(--foreground)",
                letterSpacing: "0.02em",
              }}
            >
              {buoy.buoyId}
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: active ? "var(--turquoise-light)" : "var(--muted-foreground)",
              }}
            >
              {active ? "● Activa" : "○ Inactiva"}
            </span>
          </div>

          <p style={{ fontSize: 11, color: "var(--muted-foreground)", margin: "0 0 12px", lineHeight: 1.4 }}>
            📍 {buoy.locationName}
            <br />
            <span style={{ color: "rgba(143,163,188,0.65)" }}>
              {buoy.latitude.toFixed(4)}°, {buoy.longitude.toFixed(4)}°
            </span>
          </p>

          <div className="grid grid-cols-2" style={{ gap: 8 }}>
            <div style={{ background: "var(--surface-2)", padding: 8 }}>
              <p style={{ fontSize: 10, color: "var(--muted-foreground)", margin: "0 0 2px" }}>Lecturas</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: "var(--foreground)", margin: 0 }}>
                {buoy.totalReadings.toLocaleString()}
              </p>
            </div>
            <div style={{ background: "var(--surface-2)", padding: 8 }}>
              <p style={{ fontSize: 10, color: "var(--muted-foreground)", margin: "0 0 2px" }}>USDC pendiente</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: "var(--sand)", margin: 0 }}>
                ${buoy.unclaimedUsdc.toFixed(4)}
              </p>
            </div>
            <div className="col-span-2" style={{ background: "var(--surface-2)", padding: 8 }}>
              <p style={{ fontSize: 10, color: "var(--muted-foreground)", margin: "0 0 2px" }}>Recompensas totales</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#4ade80", margin: 0 }}>
                ${buoy.totalRewards.toFixed(4)} USDC
              </p>
            </div>
          </div>
        </div>
      </MarkerPopup>
    </MapMarker>
  );
}

export default function BuoyMap({ buoys }: BuoyMapProps) {
  return (
    <Map
      theme="dark"
      center={PERU_CENTER}
      zoom={ZOOM}
      className="h-full w-full"
    >
      {buoys.map((buoy) => (
        <BuoyMarker key={buoy.buoyId} buoy={buoy} />
      ))}
      <MapControls position="bottom-right" showZoom showLocate />
    </Map>
  );
}
