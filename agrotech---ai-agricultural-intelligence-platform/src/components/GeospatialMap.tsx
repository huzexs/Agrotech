import React, { useEffect, useRef } from "react";
import L from "leaflet";
import { RegionalOutbreakData, CropDiagnosis } from "../types";

interface GeospatialMapProps {
  outbreaks: RegionalOutbreakData[];
  diagnoses: CropDiagnosis[];
  selectedCrop?: string;
  selectedSeverity?: string;
  onSelectLocation?: (locationName: string) => void;
}

export const GeospatialMap: React.FC<GeospatialMapProps> = ({
  outbreaks,
  diagnoses,
  selectedCrop,
  selectedSeverity,
  onSelectLocation
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet Map centered on Nigeria (approx lat 9.0820, lng 8.6753)
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [9.082, 7.85],
        zoom: 6,
        minZoom: 5,
        maxZoom: 14,
        zoomControl: true,
        scrollWheelZoom: true
      });

      // CARTO Dark Matter style for immersive dark theme
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;
      markersLayerRef.current = L.layerGroup().addTo(map);
    }

    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    // Clear previous markers
    markersGroup.clearLayers();

    // Fix default Leaflet icon paths
    const iconRetinaUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
    const iconUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
    const shadowUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";
    L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

    // 1. Plot regional outbreak risk zones (Circles)
    outbreaks.forEach((outbreak) => {
      const color =
        outbreak.riskLevel === "Severe"
          ? "#dc2626"
          : outbreak.riskLevel === "High"
          ? "#ea580c"
          : outbreak.riskLevel === "Moderate"
          ? "#ca8a04"
          : "#16a34a";

      const radius = 22000 + outbreak.totalOutbreaks * 250;

      const circle = L.circle([outbreak.lat, outbreak.lng], {
        color: color,
        fillColor: color,
        fillOpacity: 0.28,
        weight: 2,
        radius: radius
      });

      const popupContent = `
        <div style="font-family: system-ui, sans-serif; padding: 4px; min-width: 200px; color: #f1f5f9;">
          <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: ${color}; margin-bottom: 2px;">
            ${outbreak.riskLevel} Risk Alert Zone
          </div>
          <h4 style="margin: 0 0 6px 0; font-size: 15px; font-weight: 700; color: #f8fafc;">
            ${outbreak.state} State (${outbreak.zone})
          </h4>
          <div style="font-size: 12px; color: #94a3b8; line-height: 1.4;">
            <div><strong style="color: #cbd5e1;">Dominant Pest/Disease:</strong> ${outbreak.dominantDisease}</div>
            <div><strong style="color: #cbd5e1;">Crops at Risk:</strong> ${outbreak.primaryCropAtRisk}</div>
            <div><strong style="color: #cbd5e1;">Reported Incidents:</strong> ${outbreak.totalOutbreaks}</div>
            <div><strong style="color: #cbd5e1;">Est. Yield Loss:</strong> <span style="color: #f87171; font-weight: 600;">${outbreak.estimatedLossPercent}%</span></div>
          </div>
        </div>
      `;

      circle.bindPopup(popupContent);
      circle.on("click", () => {
        if (onSelectLocation) onSelectLocation(outbreak.state);
      });
      markersGroup.addLayer(circle);
    });

    // 2. Plot specific Farmer GPS Diagnosis Reports (Interactive Pin Markers)
    const filteredDiagnoses = diagnoses.filter((diag) => {
      if (selectedCrop && selectedCrop !== "All" && diag.cropType !== selectedCrop) {
        return false;
      }
      if (selectedSeverity && selectedSeverity !== "All" && diag.severity_level !== selectedSeverity) {
        return false;
      }
      return true;
    });

    filteredDiagnoses.forEach((diag) => {
      if (!diag.coordinates?.latitude || !diag.coordinates?.longitude) return;

      const severityBadgeColor =
        diag.severity_level === "Critical"
          ? "#ef4444"
          : diag.severity_level === "Medium"
          ? "#f97316"
          : "#22c55e";

      // Custom pulse HTML marker
      const customIcon = L.divIcon({
        className: "custom-leaflet-marker",
        html: `
          <div style="
            width: 24px;
            height: 24px;
            background: ${severityBadgeColor};
            border: 2px solid #0f172a;
            border-radius: 50%;
            box-shadow: 0 4px 10px rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 10px;
            font-weight: 800;
          ">
            !
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12]
      });

      const marker = L.marker([diag.coordinates.latitude, diag.coordinates.longitude], {
        icon: customIcon
      });

      const diagPopup = `
        <div style="font-family: system-ui, sans-serif; padding: 4px; min-width: 230px; color: #f1f5f9;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 10px; padding: 2px 6px; background: ${severityBadgeColor}; color: white; border-radius: 4px; font-weight: 700;">
              ${diag.severity_level} Severity
            </span>
            <span style="font-size: 11px; color: #94a3b8;">${diag.cropType}</span>
          </div>
          <h4 style="margin: 4px 0; font-size: 14px; font-weight: 700; color: #f8fafc;">
            ${diag.disease_name}
          </h4>
          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">
            Reported by: <strong style="color: #cbd5e1;">${diag.farmerName}</strong> • ${diag.coordinates.state}
          </div>
          <div style="font-size: 11px; background: #020617; padding: 6px 8px; border-radius: 8px; border: 1px solid #1e293b; color: #94a3b8;">
            <strong style="color: #e2e8f0;">AI Confidence:</strong> ${diag.confidence_score.toFixed(1)}%<br/>
            <strong style="color: #e2e8f0;">Status:</strong> ${diag.verifiedByOfficer ? "Verified by Extension Officer" : "Pending Field Check"}
          </div>
        </div>
      `;

      marker.bindPopup(diagPopup);
      markersGroup.addLayer(marker);
    });

    // Invalidate size on window resize
    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [outbreaks, diagnoses, selectedCrop, selectedSeverity, onSelectLocation]);

  return (
    <div className="relative w-full h-[450px] lg:h-[540px] rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-slate-950">
      <div id="leaflet-map-canvas" ref={mapContainerRef} className="w-full h-full z-0" />
      
      {/* Map Legend Overlay */}
      <div className="absolute top-3 right-3 bg-slate-900/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl shadow-xl border border-slate-800 z-[1000] text-xs space-y-1.5 pointer-events-auto text-slate-200">
        <div className="font-semibold text-slate-200 pb-1.5 border-b border-slate-800 flex items-center justify-between gap-3">
          <span>National Outbreak Map</span>
          <span className="text-[10px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-1.5 py-0.5 rounded font-bold">Live GPS</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-red-500/30"></span>
          <span className="text-slate-400">Critical / Severe (25-35% loss risk)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-500/30"></span>
          <span className="text-slate-400">Moderate Alert (15-24% loss risk)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30"></span>
          <span className="text-slate-400">Low / Monitored (&lt;15% loss risk)</span>
        </div>
        <div className="pt-1 text-[10px] text-slate-500 border-t border-slate-800">
          *Circles = Regional alert clusters | Pins = Farmer GPS field scans
        </div>
      </div>
    </div>
  );
};
