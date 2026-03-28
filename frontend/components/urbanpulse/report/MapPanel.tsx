"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CAT_CFG } from "../constants";
import { FeedItem, MapPin } from "../types";

const LeafletReportMap = dynamic(() => import("./LeafletReportMap").then((module) => module.LeafletReportMap), {
  ssr: false,
});

type MapPanelProps = {
  onPickLocation: (label: string, coords: { lat: number; lng: number }) => void;
  selectedCoords: { lat: number; lng: number } | null;
  stats: {
    total: number;
    critical: number;
    resolved: number;
  };
  feed: FeedItem[];
  pins: MapPin[];
  weather: {
    temperature: number;
    rainProbability: number;
    aqi: number;
    wind: number;
    pollCount: number;
  };
};

export function MapPanel({ onPickLocation, selectedCoords, stats, feed, pins, weather }: MapPanelProps) {
  const [showTopInfo, setShowTopInfo] = useState(true);

  return (
    <div className="map-area">
      <div id="map">
        <LeafletReportMap pins={pins} selectedCoords={selectedCoords} onPickLocation={onPickLocation} />
        <div className="map-overlay-toggle-wrap">
          <Button
            variant="outline"
            size="sm"
            className="map-overlay-toggle"
            onClick={() => setShowTopInfo((prev) => !prev)}
          >
            {showTopInfo ? "Hide map info" : "Show map info"}
          </Button>
        </div>

        <div className={`map-overlay ${showTopInfo ? "" : "map-overlay-hidden"}`}>
          <div className="map-info">
            <div className="map-info-title">Pedro Gil · Padre Faura</div>
            <div className="map-info-sub">ERMITA, MANILA - 3D STREET VIEW</div>
          </div>
          <div className="map-overlay-right">
            <div className="stats-pills">
              <div className="s-pill">
                <div className="s-num">{stats.total}</div>
                <div className="s-lbl">Reports</div>
              </div>
              <div className="s-pill">
                <div className="s-num critical">{stats.critical}</div>
                <div className="s-lbl">Critical</div>
              </div>
              <div className="s-pill">
                <div className="s-num resolved">{stats.resolved}</div>
                <div className="s-lbl">Resolved</div>
              </div>
            </div>
            <div className="weather-widget">
              <div className="w-title">📡 Weather API - Ermita, Manila</div>
              <div className="w-row">
                <div className="w-item">
                  <div className="w-val w-temp">{Math.round(weather.temperature)}°C</div>
                  <div className="w-lbl">Temp</div>
                </div>
                <div className="w-item">
                  <div className="w-val w-rain">{Math.round(weather.rainProbability)}%</div>
                  <div className="w-lbl">Rain Prob</div>
                </div>
                <div className="w-item">
                  <div className="w-val w-aqi">{Math.round(weather.aqi)}</div>
                  <div className="w-lbl">AQI</div>
                </div>
                <div className="w-item">
                  <div className="w-val">{Math.round(weather.wind)}</div>
                  <div className="w-lbl">km/h</div>
                </div>
              </div>
              <div className="w-poll">
                <div className="w-poll-dot" />
                API polled - poll #{weather.pollCount}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="feed-area">
        <div className="feed-title">Recent Reports</div>
        <div className="feed-list" id="feed-list">
          {feed.map((item, idx) => (
            <div className={`feed-item ${item.cat}`} key={`${item.location}-${idx}`}>
              <span className="fi-emoji">{CAT_CFG[item.cat].emoji}</span>
              <div className="fi-content">
                <div className="fi-cat" style={{ color: CAT_CFG[item.cat].color }}>
                  {CAT_CFG[item.cat].label}
                </div>
                <div className="fi-loc">📍 {item.location}</div>
              </div>
              <div className="fi-time">{item.timeLabel}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="map-legend">
        <div className="ml-title">Map Key</div>
        {Object.entries(CAT_CFG).map(([key, cfg]) => (
          <div className="ml-item" key={key}>
            <div className="ml-dot" style={{ background: cfg.color }} />
            {cfg.label}
          </div>
        ))}
      </div>
    </div>
  );
}
