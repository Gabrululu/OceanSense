"use client";

import { useEffect, useRef } from "react";
import type { BuoyData } from "@/hooks/useOceanSense";

// Centro y zoom inicial para ver todo el litoral peruano
const PERU_CENTER: [number, number] = [-9.5, -78.8];
const ZOOM = 6;

interface BuoyMapProps {
  buoys: BuoyData[];
}

/** Inyecta estilos globales una sola vez */
function injectStyles() {
  if (document.getElementById("buoymap-styles")) return;
  const s = document.createElement("style");
  s.id = "buoymap-styles";
  s.textContent = `
    @keyframes buoy-ping {
      0%   { transform: scale(1);   opacity: 0.75; }
      70%  { transform: scale(2.8); opacity: 0;    }
      100% { transform: scale(2.8); opacity: 0;    }
    }
    .buoy-ping {
      animation: buoy-ping 1.8s ease-out infinite;
    }
    /* Popup dark theme */
    .leaflet-popup-content-wrapper {
      background: #0f172a !important;
      border: 1px solid rgba(34,211,238,0.2) !important;
      border-radius: 14px !important;
      box-shadow: 0 12px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(34,211,238,0.05) !important;
      color: #e2e8f0 !important;
      padding: 0 !important;
    }
    .leaflet-popup-content {
      margin: 0 !important;
    }
    .leaflet-popup-tip-container { display: none !important; }
    .leaflet-popup-close-button {
      color: #475569 !important;
      font-size: 18px !important;
      top: 8px !important;
      right: 10px !important;
    }
    .leaflet-popup-close-button:hover { color: #94a3b8 !important; }
    /* Remove default Leaflet gray background */
    .leaflet-container { background: #020617 !important; }
    /* Attribution dark */
    .leaflet-control-attribution {
      background: rgba(2,6,23,0.8) !important;
      color: #475569 !important;
      font-size: 10px !important;
    }
    .leaflet-control-attribution a { color: #64748b !important; }
    /* Zoom controls dark */
    .leaflet-control-zoom a {
      background: #0f172a !important;
      color: #94a3b8 !important;
      border-color: #1e293b !important;
    }
    .leaflet-control-zoom a:hover {
      background: #1e293b !important;
      color: #e2e8f0 !important;
    }
  `;
  document.head.appendChild(s);
}

function buildMarkerHtml(buoy: BuoyData): string {
  const active = buoy.isActive;
  const color  = active ? "#22d3ee" : "#475569";
  const glow   = active ? "0 0 12px rgba(34,211,238,0.6)" : "none";

  return `
    <div style="position:relative;width:22px;height:22px;cursor:pointer">
      ${active ? `
        <div class="buoy-ping" style="
          position:absolute;inset:0;border-radius:50%;
          background:${color};opacity:0.5;
        "></div>
      ` : ""}
      <div style="
        position:absolute;inset:0;border-radius:50%;
        background:${color};
        border:2.5px solid ${active ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.3)"};
        box-shadow:${glow};
        display:flex;align-items:center;justify-content:center;
        font-size:10px;
      ">
        ${active ? "🛟" : ""}
      </div>
    </div>`;
}

function buildPopupHtml(buoy: BuoyData): string {
  const statusColor = buoy.isActive ? "#22d3ee" : "#64748b";
  const statusLabel = buoy.isActive ? "● Activa" : "○ Inactiva";
  const lat  = buoy.latitude.toFixed(4);
  const lng  = buoy.longitude.toFixed(4);

  return `
    <div style="font-family:ui-sans-serif,system-ui,sans-serif;width:230px;padding:16px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
        <span style="font-size:13px;font-weight:700;color:#f1f5f9;letter-spacing:0.02em">
          ${buoy.buoyId}
        </span>
        <span style="font-size:11px;font-weight:600;color:${statusColor}">${statusLabel}</span>
      </div>
      <p style="font-size:11px;color:#64748b;margin:0 0 12px;line-height:1.4">
        📍 ${buoy.locationName}<br>
        <span style="color:#334155">${lat}°, ${lng}°</span>
      </p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <div style="background:#1e293b;border-radius:8px;padding:8px">
          <p style="font-size:10px;color:#64748b;margin:0 0 2px">Lecturas</p>
          <p style="font-size:15px;font-weight:700;color:#f1f5f9;margin:0">
            ${buoy.totalReadings.toLocaleString()}
          </p>
        </div>
        <div style="background:#1e293b;border-radius:8px;padding:8px">
          <p style="font-size:10px;color:#64748b;margin:0 0 2px">USDC pendiente</p>
          <p style="font-size:15px;font-weight:700;color:#eab308;margin:0">
            $${buoy.unclaimedUsdc.toFixed(4)}
          </p>
        </div>
        <div style="grid-column:span 2;background:#1e293b;border-radius:8px;padding:8px">
          <p style="font-size:10px;color:#64748b;margin:0 0 2px">Recompensas totales</p>
          <p style="font-size:14px;font-weight:600;color:#4ade80;margin:0">
            $${buoy.totalRewards.toFixed(4)} USDC
          </p>
        </div>
      </div>
    </div>`;
}

export default function BuoyMap({ buoys }: BuoyMapProps) {
  const mapRef      = useRef<HTMLDivElement>(null);
  const mapInst     = useRef<any>(null);
  const markersRef  = useRef<any[]>([]);
  const canceledRef = useRef(false);

  // Inicializar mapa
  useEffect(() => {
    if (!mapRef.current || mapInst.current) return;
    canceledRef.current = false;

    import("leaflet").then((L) => {
      if (canceledRef.current || !mapRef.current) return;

      injectStyles();

      delete (L.Icon.Default.prototype as any)._getIconUrl;

      const container = mapRef.current as any;
      if (container._leaflet_id) container._leaflet_id = undefined;

      const map = L.map(mapRef.current, {
        zoomControl: true,
        attributionControl: true,
      }).setView(PERU_CENTER, ZOOM);

      // CartoDB Dark Matter — sin API key, tema oscuro perfecto
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '© <a href="https://carto.com/">CARTO</a> © <a href="https://www.openstreetmap.org/copyright">OSM</a>',
          subdomains: "abcd",
          maxZoom: 19,
        }
      ).addTo(map);

      mapInst.current = map;

      // Forzar recálculo de tamaño tras el primer render
      requestAnimationFrame(() => map.invalidateSize());
    });

    return () => {
      canceledRef.current = true;
      mapInst.current?.remove();
      mapInst.current = null;
    };
  }, []);

  // Actualizar marcadores
  useEffect(() => {
    if (!mapInst.current) return;

    import("leaflet").then((L) => {
      if (!mapInst.current) return;

      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      buoys.forEach((buoy) => {
        const icon = L.divIcon({
          className: "",
          html: buildMarkerHtml(buoy),
          iconSize:   [22, 22],
          iconAnchor: [11, 11],
          popupAnchor: [0, -14],
        });

        const marker = L.marker([buoy.latitude, buoy.longitude], { icon })
          .bindPopup(buildPopupHtml(buoy), { maxWidth: 260 })
          .addTo(mapInst.current);

        markersRef.current.push(marker);
      });
    });
  }, [buoys]);

  return <div ref={mapRef} className="h-full w-full" />;
}
