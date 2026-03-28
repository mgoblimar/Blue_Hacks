import { Button } from "@/components/ui/button";
import { ViewMode } from "./types";

type HeaderProps = {
  view: ViewMode;
  onChangeView: (view: ViewMode) => void;
};

export function Header({ view, onChangeView }: HeaderProps) {
  return (
    <header>
      <div className="logo">
        <div className="logo-mark">UP</div>
        <div>
          <div className="logo-text">UrbanPulse Manila</div>
          <div className="logo-sub">Pedro Gil · Padre Faura Corridor</div>
        </div>
      </div>
      <div className="hdr-right">
        <div className="live-badge">
          <div className="live-dot" />LIVE
        </div>
        <Button variant="ghost" size="sm" className={`nav-btn ${view === "report" ? "active" : ""}`} onClick={() => onChangeView("report")}>
          📍 Report
        </Button>
        <Button variant="ghost" size="sm" className={`nav-btn ${view === "dashboard" ? "active" : ""}`} onClick={() => onChangeView("dashboard")}>
          📊 Dashboard
        </Button>
      </div>
    </header>
  );
}
