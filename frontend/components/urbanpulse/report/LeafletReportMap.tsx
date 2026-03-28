"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Map, { Marker, NavigationControl, Popup, type MapLayerMouseEvent, type MapRef } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import { CAT_CFG } from "../constants";
import { MapPin } from "../types";

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

  function add3DBuildings() {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const buildingLayerId = "3d-buildings";
    const buildingSourceId = "openfreemap";
    if (map.getLayer(buildingLayerId)) return;

    const layers = map.getStyle().layers ?? [];

    const labelLayerId = layers.find((layer) => {
      if (layer.type !== "symbol") return false;
      const layout = (layer as { layout?: Record<string, unknown> }).layout;
      return Boolean(layout && layout["text-field"]);
    })?.id;

    if (!map.getSource(buildingSourceId)) {
      map.addSource(buildingSourceId, {
        type: "vector",
        url: "https://tiles.openfreemap.org/planet",
      });
    }

    map.addLayer(
      {
        id: buildingLayerId,
        source: buildingSourceId,
        "source-layer": "building",
        type: "fill-extrusion",
        minzoom: 15,
        filter: ["!=", ["get", "hide_3d"], true],
        paint: {
          "fill-extrusion-color": [
            "interpolate",
            ["linear"],
            ["get", "render_height"],
            0,
            "lightgray",
            200,
            "royalblue",
            400,
            "lightblue",
          ],
          "fill-extrusion-height": [
            "interpolate",
            ["linear"],
            ["zoom"],
            15,
            0,
            16,
            ["*", ["coalesce", ["get", "render_height"], 0], 1.8],
          ],
          "fill-extrusion-base": [
            "case",
            [">=", ["zoom"], 16],
            ["*", ["coalesce", ["get", "render_min_height"], 0], 1.2],
            0,
          ],
          "fill-extrusion-opacity": 0.6,
        },
      },
      labelLayerId,
    );
  }

  function handleMapLoad() {
    add3DBuildings();
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
          pitch: 62,
          bearing: -20,
        }}
        mapStyle="https://tiles.openfreemap.org/styles/bright"
        style={{ width: "100%", height: "100%" }}
        canvasContextAttributes={{ antialias: true }}
        onClick={handleMapClick}
        onLoad={handleMapLoad}
        onStyleData={add3DBuildings}
      >
        <NavigationControl position="top-left" showCompass />
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
