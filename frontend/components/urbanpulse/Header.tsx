import { Button } from "@/components/ui/button";
import { ViewMode } from "./types";

type HeaderProps = {
  view: ViewMode;
  onChangeView: (view: ViewMode) => void;
  totalReports: number;
  simulationRunning: boolean;
  onToggleSimulation: () => void;
};

export function Header({ view, onChangeView, totalReports, simulationRunning, onToggleSimulation }: HeaderProps) {
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
        <div className="report-counter">
          Total: <span>{totalReports}</span>
        </div>
        <button type="button" className={`sim-toggle ${simulationRunning ? "running" : ""}`} onClick={onToggleSimulation}>
          <div className="sim-toggle-dot" />
          <span>{simulationRunning ? "STOP SIM" : "START LIVE SIM"}</span>
        </button>
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
