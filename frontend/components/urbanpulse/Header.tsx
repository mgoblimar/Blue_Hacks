import { Button } from "@/components/ui/button";
import { useTheme } from "./ThemeProvider";
import { CAT_CFG } from "./constants";
import { CategoryKey, FeedItem, SeverityKey, ViewMode } from "./types";

type HeaderProps = {
  view: ViewMode;
  onChangeView: (view: ViewMode) => void;
  simulationRunning: boolean;
  onToggleSimulation: () => void;
  stats: { total: number; critical: number; resolved: number };
  weather: { temperature: number; rainProbability: number; aqi: number; wind: number; pollCount: number };
};

export function Header({ view, onChangeView, simulationRunning, onToggleSimulation, stats, weather }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

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
        <button type="button" className={`sim-toggle ${simulationRunning ? "running" : ""}`} onClick={onToggleSimulation}>
          <div className="sim-toggle-dot" />
          <span>{simulationRunning ? "STOP SIM" : "START LIVE SIM"}</span>
        </button>
        <button type="button" className="theme-toggle" onClick={toggleTheme} title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
        <Button variant="ghost" size="sm" className={`nav-btn ${view === "report" ? "active" : ""}`} onClick={() => onChangeView("report")}>
          Report
        </Button>
        <Button variant="ghost" size="sm" className={`nav-btn ${view === "dashboard" ? "active" : ""}`} onClick={() => onChangeView("dashboard")}>
          Dashboard
        </Button>
      </div>

      <div className="header-info-bar">
        <div className="hib-stats">
          <div className="hib-pill">
            <span className="hib-num">{stats.total}</span>
            <span className="hib-lbl">Reports</span>
          </div>
          <div className="hib-pill">
            <span className="hib-num hib-critical">{stats.critical}</span>
            <span className="hib-lbl">Critical</span>
          </div>
          <div className="hib-pill">
            <span className="hib-num hib-resolved">{stats.resolved}</span>
            <span className="hib-lbl">Resolved</span>
          </div>
        </div>

        <div className="hib-weather">
          <span className="hib-w-item"><span className="hib-w-val">{Math.round(weather.temperature)}°C</span> temp</span>
          <span className="hib-w-item"><span className="hib-w-val hib-w-rain">{Math.round(weather.rainProbability)}%</span> rain</span>
          <span className="hib-w-item"><span className="hib-w-val">{Math.round(weather.aqi)}</span> AQI</span>
          <span className="hib-w-item"><span className="hib-w-val">{Math.round(weather.wind)}</span> km/h</span>
        </div>

        <div className="hib-legend">
          {(Object.keys(CAT_CFG) as CategoryKey[]).map((key) => (
            <span className="hib-legend-item" key={key}>
              <span className="hib-legend-dot" style={{ background: CAT_CFG[key].color }} />
              {CAT_CFG[key].label}
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}
