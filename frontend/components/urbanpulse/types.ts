export type ViewMode = "report" | "dashboard";
export type SidebarTab = "new" | "history";

export type CategoryKey = "waste" | "obstruction" | "streetlight" | "flood";
export type SeverityKey = "low" | "moderate" | "critical";

export type CategoryConfig = {
  color: string;
  emoji: string;
  subs: string[];
  ctx: string;
  label: string;
  description: string;
};

export type ReportItem = {
  id: string;
  cat: CategoryKey;
  loc: string;
  desc: string;
  sev: SeverityKey;
  subs: string[];
  createdAt: number;
  imageUrl?: string;
};

export type FeedItem = {
  cat: CategoryKey;
  location: string;
  timeLabel: string;
  sev?: SeverityKey;
  createdAt?: number;
};

export type MapPin = {
  cat: CategoryKey;
  label: string;
  sev: SeverityKey;
  lat: number;
  lng: number;
};

export type WeatherSnapshot = {
  temperature: number;
  rainProbability: number;
  aqi: number;
  wind: number;
  pollCount: number;
  lastPolledAt: number;
};

export type SimulationScenario = {
  cat: CategoryKey;
  sub: string;
  loc: string;
  sev: SeverityKey;
  lat: number;
  lng: number;
  desc: string;
};

export type ToastVariant = "danger" | "warn" | "info" | "success";

export type ToastNotice = {
  id: string;
  variant: ToastVariant;
  title: string;
  message: string;
  rule?: string;
};

export type ConsoleTag = "SIM" | "PRED" | "API" | "ALERT" | "CLR";

export type ConsoleEntry = {
  id: string;
  timestamp: number;
  tag: ConsoleTag;
  message: string;
};
