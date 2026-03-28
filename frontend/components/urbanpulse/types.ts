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
};

export type FeedItem = {
  cat: CategoryKey;
  location: string;
  timeLabel: string;
};

export type MapPin = {
  cat: CategoryKey;
  label: string;
  sev: SeverityKey;
  lat: number;
  lng: number;
};
