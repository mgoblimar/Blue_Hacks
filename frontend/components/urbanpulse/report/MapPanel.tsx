"use client";

import dynamic from "next/dynamic";
import { CAT_CFG, severityColor } from "../constants";
import { FeedItem, MapPin } from "../types";

const LeafletReportMap = dynamic(() => import("./LeafletReportMap").then((module) => module.LeafletReportMap), {
  ssr: false,
});

type MapPanelProps = {
  onPickLocation: (label: string, coords: { lat: number; lng: number }) => void;
  selectedCoords: { lat: number; lng: number } | null;
  feed: FeedItem[];
  pins: MapPin[];
};

export function MapPanel({ onPickLocation, selectedCoords, feed, pins }: MapPanelProps) {
  return (
    <div className="map-area">
      <div id="map">
        <LeafletReportMap pins={pins} selectedCoords={selectedCoords} onPickLocation={onPickLocation} />
      </div>

      <div className="feed-area">
        <div className="feed-title">Recent Reports</div>
        <div className="feed-list" id="feed-list">
          {feed.map((item, idx) => (
            <div
              className={`feed-item ${item.cat}`}
              key={`${item.location}-${idx}`}
              style={item.sev ? { borderLeftColor: severityColor(item.sev) } : undefined}
            >
              <span className="fi-emoji">{CAT_CFG[item.cat].emoji}</span>
              <div className="fi-content">
                <div className="fi-cat" style={{ color: CAT_CFG[item.cat].color }}>
                  {CAT_CFG[item.cat].label}
                </div>
                <div className="fi-loc">{item.location}</div>
              </div>
              <div className="fi-time">{item.timeLabel}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
