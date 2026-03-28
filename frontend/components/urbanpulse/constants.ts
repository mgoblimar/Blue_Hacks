import { CategoryConfig, CategoryKey, FeedItem, MapPin, ReportItem } from "./types";

export const CAT_CFG: Record<CategoryKey, CategoryConfig> = {
  waste: {
    color: "#ff7d3b",
    emoji: "🗑️",
    subs: ["Plastic Waste", "Food Waste", "Construction Debris", "Hazardous", "Overflow Bin"],
    ctx: "<strong>Waste Tips:</strong> Note if waste is near a drainage canal - this contributes to flooding risk. Recurring locations help predict collection schedules.",
    label: "Waste",
    description: "Garbage, litter, dumping",
  },
  obstruction: {
    color: "#f5c518",
    emoji: "🚧",
    subs: ["Vendor Stall", "Parked Vehicle", "Fallen Tree", "Construction", "Broken Pavement"],
    ctx: "<strong>Obstruction Tips:</strong> Indicate if the blockage affects PWD or wheelchair access. Recurring obstructions help plan clearance routes.",
    label: "Obstruction",
    description: "Blocked sidewalks, vendors",
  },
  streetlight: {
    color: "#3aefb8",
    emoji: "💡",
    subs: ["Broken Bulb", "Flickering", "Dark Stretch", "Vandalized", "Pole Damage"],
    ctx: "<strong>Streetlight Tips:</strong> Dark stretches correlate with higher incidents at night. Time-stamping helps Meralco scheduling.",
    label: "Streetlight",
    description: "Broken or missing lights",
  },
  flood: {
    color: "#4da6ff",
    emoji: "🌊",
    subs: ["Clogged Drain", "Standing Water", "Rising Level", "Debris in Canal", "Broken Manhole"],
    ctx: "<strong>Flood Tips:</strong> Clogged drain + incoming rain = predictable flooding. Your report may trigger an automated alert to DPWH.",
    label: "Flooding",
    description: "Clogged drains, standing water",
  },
};

export const DEMO_PINS: MapPin[] = [
  { cat: "waste", label: "P. Gil near PGH Gate", sev: "critical", lat: 14.5825, lng: 120.9893 },
  { cat: "obstruction", label: "P. Faura / Taft Ave", sev: "moderate", lat: 14.5809, lng: 120.9867 },
  { cat: "streetlight", label: "P. Gil Midpoint", sev: "low", lat: 14.5818, lng: 120.988 },
  { cat: "flood", label: "P. Faura near Robinson's", sev: "moderate", lat: 14.5835, lng: 120.9858 },
  { cat: "waste", label: "Taft Ave Underpass", sev: "moderate", lat: 14.5801, lng: 120.985 },
];

export const INITIAL_FEED: FeedItem[] = [
  { cat: "obstruction", location: "P. Gil near PGH Gate", timeLabel: "2m ago" },
  { cat: "waste", location: "P. Faura / Taft Ave", timeLabel: "14m ago" },
];

export const EMPTY_REPORT_MESSAGE = "No reports yet.";

export function makeReportId(): string {
  return `RPT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export function severityColor(sev: ReportItem["sev"]): string {
  if (sev === "low") return "#3aefb8";
  if (sev === "critical") return "#ff4e42";
  return "#f5c518";
}
