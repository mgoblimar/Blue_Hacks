"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map, { Marker, NavigationControl, Popup, type MapLayerMouseEvent, type MapRef } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import { CAT_CFG } from "../constants";
import { useTheme } from "../ThemeProvider";
import { MapPin } from "../types";

const MAP_STYLES = {
  dark: "https://tiles.openfreemap.org/styles/dark",
  light: "https://tiles.openfreemap.org/styles/bright",
} as const;

const PITCH_PRESETS = [
  { label: "2D", pitch: 0, icon: "⊡" },
  { label: "30°", pitch: 30, icon: "◫" },
  { label: "3D", pitch: 60, icon: "◇" },
] as const;

type LeafletReportMapProps = {
  pins: MapPin[];
  selectedCoords: { lat: number; lng: number } | null;
  onPickLocation: (locationText: string, coords: { lat: number; lng: number }) => void;
};

export function LeafletReportMap({ pins, selectedCoords, onPickLocation }: LeafletReportMapProps) {
  const center = useMemo(() => ({ lat: 14.5818, lng: 120.9873 }), []);
  const mapRef = useRef<MapRef | null>(null);
  const [activePopupIndex, setActivePopupIndex] = useState<number | null>(null);
  const activePin = activePopupIndex !== null ? pins[activePopupIndex] : null;
  const { theme } = useTheme();
  const [activePitch, setActivePitch] = useState(60);
  const buildingsAddedRef = useRef(false);

  useEffect(() => {
    if (!selectedCoords) return;
    mapRef.current?.flyTo({
      center: [selectedCoords.lng, selectedCoords.lat],
      zoom: Math.max(mapRef.current.getZoom(), 17),
      duration: 700,
      essential: true,
    });
  }, [selectedCoords]);

  function handleMapClick(event: MapLayerMouseEvent) {
    const lat = Number(event.lngLat.lat.toFixed(5));
    const lng = Number(event.lngLat.lng.toFixed(5));
    onPickLocation(`${lat}, ${lng}`, { lat, lng });
  }

  const add3DBuildings = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map || !map.isStyleLoaded()) return;

    const buildingLayerId = "3d-buildings";
    if (map.getLayer(buildingLayerId)) return;

    const style = map.getStyle();
    const layers = style.layers ?? [];
    if (layers.length === 0) return;

    // Find the existing vector tile source from the style
    const sources = style.sources ?? {};
    let vectorSourceId: string | null = null;
    for (const [id, src] of Object.entries(sources)) {
      if ((src as { type: string }).type === "vector") {
        vectorSourceId = id;
        break;
      }
    }
    if (!vectorSourceId) return;

    // Insert below the first symbol layer so buildings don't cover labels
    const labelLayerId = layers.find((layer) => {
      if (layer.type !== "symbol") return false;
      const layout = (layer as { layout?: Record<string, unknown> }).layout;
      return Boolean(layout && layout["text-field"]);
    })?.id;

    // Hide the flat building layer from the style so our 3D one is visible
    if (map.getLayer("building")) {
      map.setLayoutProperty("building", "visibility", "none");
    }

    const isDark = document.documentElement.getAttribute("data-theme") !== "light";

    map.addLayer(
      {
        id: buildingLayerId,
        source: vectorSourceId,
        "source-layer": "building",
        type: "fill-extrusion",
        minzoom: 14,
        paint: {
          "fill-extrusion-color": [
            "interpolate",
            ["linear"],
            ["get", "render_height"],
            0,
            isDark ? "#5c6494" : "#c8cad0",
            3,
            isDark ? "#6b78b8" : "#b0b8cc",
            8,
            isDark ? "#7e90e6" : "#8fa0e0",
            20,
            isDark ? "#8cb8ff" : "#7b97ff",
          ],
          "fill-extrusion-height": [
            "interpolate",
            ["linear"],
            ["zoom"],
            14,
            0,
            15.05,
            ["*", ["coalesce", ["get", "render_height"], 5], 12],
          ],
          "fill-extrusion-base": [
            "interpolate",
            ["linear"],
            ["zoom"],
            14,
            0,
            15.05,
            ["*", ["coalesce", ["get", "render_min_height"], 0], 12],
          ],
          "fill-extrusion-opacity": isDark ? 0.9 : 0.65,
        },
      },
      labelLayerId,
    );
    buildingsAddedRef.current = true;
  }, []);

  function handleStyleLoad() {
    buildingsAddedRef.current = false;
    const map = mapRef.current?.getMap();
    if (!map) return;
    if (map.getLayer("3d-buildings")) {
      map.removeLayer("3d-buildings");
    }
    // Wait for style to fully load before adding buildings
    if (map.isStyleLoaded()) {
      add3DBuildings();
    } else {
      map.once("idle", () => add3DBuildings());
    }
  }

  function handlePitchChange(pitch: number) {
    setActivePitch(pitch);
    mapRef.current?.easeTo({
      pitch,
      bearing: pitch === 0 ? 0 : -20,
      duration: 600,
    });
  }

  return (
    <div className="maplibre-map">
      <Map
        ref={mapRef}
        mapLib={maplibregl}
        initialViewState={{
          latitude: center.lat,
          longitude: center.lng,
          zoom: 17,
          pitch: 60,
          bearing: -20,
        }}
        mapStyle={MAP_STYLES[theme]}
        style={{ width: "100%", height: "100%" }}
        canvasContextAttributes={{ antialias: true }}
        onClick={handleMapClick}
        onLoad={() => add3DBuildings()}
        onStyleData={handleStyleLoad}
      >
        <NavigationControl position="top-left" showCompass />

        <div className="map-view-controls">
          {PITCH_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className={`map-view-btn ${activePitch === preset.pitch ? "active" : ""}`}
              onClick={() => handlePitchChange(preset.pitch)}
              title={`${preset.label} view`}
            >
              <span className="map-view-icon">{preset.icon}</span>
              <span className="map-view-label">{preset.label}</span>
            </button>
          ))}
        </div>

        {selectedCoords ? (
          <Marker latitude={selectedCoords.lat} longitude={selectedCoords.lng} anchor="center">
            <div className="maplibre-selected-pin" title="Selected location">📍</div>
          </Marker>
        ) : null}
        {pins.map((pin, idx) => {
          const cfg = CAT_CFG[pin.cat];
          return (
            <Marker key={`${pin.cat}-${pin.label}-${idx}`} latitude={pin.lat} longitude={pin.lng} anchor="center">
              <button
                type="button"
                className="maplibre-marker"
                style={{ background: cfg.color }}
                title={`${cfg.label} · ${pin.label}`}
                onClick={(event) => {
                  event.stopPropagation();
                  setActivePopupIndex(idx);
                }}
              >
                {cfg.emoji}
              </button>
            </Marker>
          );
        })}

        {activePin ? (
          <Popup
            latitude={activePin.lat}
            longitude={activePin.lng}
            closeOnClick={false}
            onClose={() => setActivePopupIndex(null)}
            anchor="top"
            offset={18}
          >
            <div className="maplibre-popup-body">
              <div><strong>{CAT_CFG[activePin.cat].label}</strong></div>
              <div>{activePin.label}</div>
              <div className="maplibre-popup-sev">{activePin.sev.toUpperCase()}</div>
            </div>
          </Popup>
        ) : null}
      </Map>
    </div>
  );
}
