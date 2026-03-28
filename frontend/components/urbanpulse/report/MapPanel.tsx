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
};

export function MapPanel({ onPickLocation, selectedCoords, stats, feed, pins }: MapPanelProps) {
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
            <div className="map-info-sub">ERMITA, MANILA - DEMO MAP VIEW</div>
          </div>
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
