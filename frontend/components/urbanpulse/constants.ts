import { CategoryConfig, CategoryKey, FeedItem, MapPin, ReportItem, SimulationScenario, WeatherSnapshot } from "./types";

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

export const INITIAL_WEATHER: WeatherSnapshot = {
  temperature: 32,
  rainProbability: 45,
  aqi: 68,
  wind: 12,
  pollCount: 0,
  lastPolledAt: Date.now(),
};

export const LIVE_SCENARIOS: SimulationScenario[] = [
  {
    cat: "waste",
    sub: "Plastic Waste",
    loc: "P. Gil near PGH Gate",
    sev: "moderate",
    lat: 14.5825,
    lng: 120.9893,
    desc: "Scattered plastic bags near the drainage canal.",
  },
  {
    cat: "flood",
    sub: "Clogged Drain",
    loc: "P. Faura / Taft Ave",
    sev: "critical",
    lat: 14.5809,
    lng: 120.9867,
    desc: "Drain completely blocked, water starting to pool.",
  },
  {
    cat: "obstruction",
    sub: "Vendor Stall",
    loc: "P. Gil midpoint",
    sev: "moderate",
    lat: 14.5818,
    lng: 120.988,
    desc: "Vendor blocking 60% of sidewalk near UPM gate.",
  },
  {
    cat: "streetlight",
    sub: "Dark Stretch",
    loc: "P. Faura near Robinson's",
    sev: "critical",
    lat: 14.5835,
    lng: 120.9858,
    desc: "Three consecutive lights non-functional. Safety risk.",
  },
  {
    cat: "waste",
    sub: "Overflow Bin",
    loc: "Taft Ave Underpass",
    sev: "critical",
    lat: 14.5801,
    lng: 120.985,
    desc: "Municipal bin overflowing since yesterday morning.",
  },
  {
    cat: "flood",
    sub: "Standing Water",
    loc: "P. Gil / MH del Pilar",
    sev: "moderate",
    lat: 14.583,
    lng: 120.986,
    desc: "Standing water 3cm deep after earlier rain.",
  },
];

export function makeReportId(): string {
  return `RPT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export function severityColor(sev: ReportItem["sev"]): string {
  if (sev === "low") return "#3aefb8";
  if (sev === "critical") return "#ff4e42";
  return "#f5c518";
}
