"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DashboardView } from "@/components/urbanpulse/dashboard/DashboardView";
import { Header } from "@/components/urbanpulse/Header";
import { DEMO_PINS, INITIAL_FEED, INITIAL_WEATHER, LIVE_SCENARIOS, makeReportId } from "@/components/urbanpulse/constants";
import { MapPanel } from "@/components/urbanpulse/report/MapPanel";
import { ReportSidebar } from "@/components/urbanpulse/report/ReportSidebar";
import { SuccessModal } from "@/components/urbanpulse/SuccessModal";
import { ToastStack } from "@/components/urbanpulse/ToastStack";
import { CategoryKey, ConsoleEntry, FeedItem, MapPin, ReportItem, SeverityKey, SidebarTab, ToastNotice, ViewMode } from "@/components/urbanpulse/types";
import { uploadReportImage } from "@/lib/uploadImage";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Home() {
  const [view, setView] = useState<ViewMode>("report");
  const [tab, setTab] = useState<SidebarTab>("new");
  const [selectedCat, setSelectedCat] = useState<CategoryKey | null>(null);
  const [selectedSev, setSelectedSev] = useState<SeverityKey | null>(null);
  const [selectedSubs, setSelectedSubs] = useState<string[]>([]);
  const [locationText, setLocationText] = useState("");
  const [description, setDescription] = useState("");
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [pins, setPins] = useState<MapPin[]>(DEMO_PINS);
  const [feed, setFeed] = useState<FeedItem[]>(INITIAL_FEED);
  const [weather, setWeather] = useState(INITIAL_WEATHER);
  const [simRunning, setSimRunning] = useState(false);
  const [consoleEntries, setConsoleEntries] = useState<ConsoleEntry[]>([
    {
      id: "boot-api",
      timestamp: 1,
      tag: "API",
      message: "WeatherPoller initialized - backend endpoint connected",
    },
    {
      id: "boot-pred",
      timestamp: 2,
      tag: "PRED",
      message: "IFTTT Engine armed - 4 rules loaded",
    },
  ]);
  const [toasts, setToasts] = useState<ToastNotice[]>([]);
  const [alertsFired, setAlertsFired] = useState(0);
  const [pendingCoords, setPendingCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastReportId, setLastReportId] = useState("RPT-00000");
  const simIntervalRef = useRef<number | null>(null);
  const scenarioIndexRef = useRef(0);
  const firedRulesRef = useRef({ flood: false, waste: false, dark: false, energy: false });

  const criticalCount = useMemo(() => pins.filter((pin) => pin.sev === "critical").length, [pins]);

  const createToast = useCallback((variant: ToastNotice["variant"], title: string, message: string, rule?: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, variant, title, message, rule }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 5500);
  }, []);

  function dismissToast(id: string) {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }

  const pushConsole = useCallback((tag: ConsoleEntry["tag"], message: string) => {
    setConsoleEntries((prev) => {
      const next = [...prev, { id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, timestamp: Date.now(), tag, message }];
      return next.slice(-60);
    });
  }, []);

  const addReport = useCallback((report: ReportItem, coords: { lat: number; lng: number }, isSimulated: boolean) => {
    setReports((prev) => [report, ...prev]);
    setPins((prev) => [{ cat: report.cat, label: report.loc, sev: report.sev, lat: coords.lat, lng: coords.lng }, ...prev]);
    setFeed((prev) => [{ cat: report.cat, location: report.loc, timeLabel: "just now", sev: report.sev, createdAt: report.createdAt }, ...prev].slice(0, 8));
    setLastReportId(report.id);
    if (isSimulated) {
      pushConsole("SIM", `Report ${report.id}: [${report.cat}] ${report.loc}`);
    }
  }, [pushConsole]);

  function handlePhotoUpload(file: File | null) {
    if (!file) {
      setPreviewSrc(null);
      setPhotoFile(null);
      return;
    }

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        setPreviewSrc(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  }

  function handleSelectCategory(cat: CategoryKey) {
    setSelectedCat(cat);
    setSelectedSubs([]);
  }

  function handleToggleSub(sub: string) {
    setSelectedSubs((prev) => (prev.includes(sub) ? prev.filter((item) => item !== sub) : [...prev, sub]));
  }

  async function handleSubmitReport() {
    if (!selectedCat) {
      window.alert("Please select a problem category.");
      return;
    }

    setSubmitting(true);

    const reportId = makeReportId();
    let imageUrl: string | undefined;

    if (photoFile) {
      const url = await uploadReportImage(photoFile, reportId);
      if (url) imageUrl = url;
    }

    const report: ReportItem = {
      id: reportId,
      cat: selectedCat,
      loc: locationText || "Pedro Gil / Padre Faura Corridor",
      desc: description,
      sev: selectedSev ?? "moderate",
      subs: selectedSubs,
      createdAt: Date.now(),
      imageUrl,
    };

    const coords = pendingCoords ?? {
      lat: 14.5818 + (Math.random() - 0.5) * 0.004,
      lng: 120.9873 + (Math.random() - 0.5) * 0.004,
    };

    // POST to backend (fire-and-forget, don't block UI)
    fetch(`${API_URL}/api/reports`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: report.id,
        category: report.cat,
        subcategories: report.subs,
        severity: report.sev,
        locationText: report.loc,
        latitude: coords.lat,
        longitude: coords.lng,
        description: report.desc,
        imageUrl: report.imageUrl ?? null,
      }),
    }).catch(() => {/* backend may not be running */});

    addReport(report, coords, false);
    setShowSuccess(true);
    createToast("success", "Report Submitted", `${report.id} has been added to the live map.`);
    pushConsole("SIM", `Manual report ${report.id}: [${report.cat}] ${report.loc}`);

    setSelectedCat(null);
    setSelectedSev(null);
    setSelectedSubs([]);
    setLocationText("");
    setDescription("");
    setPreviewSrc(null);
    setPhotoFile(null);
    setPendingCoords(null);
    setSubmitting(false);
    setTab("history");
  }

  function handlePickLocation(label: string, coords: { lat: number; lng: number }) {
    setLocationText(label);
    setPendingCoords(coords);
  }

  function handleUseCurrentLocation() {
    if (!navigator.geolocation) {
      window.alert("Geolocation is not supported in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(5));
        const lng = Number(position.coords.longitude.toFixed(5));
        setLocationText(`${lat}, ${lng}`);
        setPendingCoords({ lat, lng });
      },
      () => {
        window.alert("Unable to retrieve your current location. Please allow location permission.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    );
  }

  function toggleSimulation() {
    setSimRunning((prev) => {
      const next = !prev;
      if (!next) {
        pushConsole("SIM", "Live simulation paused");
      }
      return next;
    });
  }

  const floodCount = useMemo(() => pins.filter((pin) => pin.cat === "flood").length, [pins]);
  const wasteCount = useMemo(() => pins.filter((pin) => pin.cat === "waste").length, [pins]);
  const streetlightCount = useMemo(() => pins.filter((pin) => pin.cat === "streetlight").length, [pins]);

  const ruleProgress = useMemo(
    () => ({
      flood: Math.round(Math.min(100, (floodCount / 3) * 50 + (weather.rainProbability / 70) * 50)),
      waste: Math.round(Math.min(100, (wasteCount / 5) * 100)),
      dark: Math.round(Math.min(100, (streetlightCount / 2) * 100)),
      energy: Math.round(Math.min(100, ((weather.temperature - 28) / 6) * 100)),
    }),
    [floodCount, wasteCount, streetlightCount, weather.rainProbability, weather.temperature],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      createToast("info", "UrbanPulse Manila Ready", "All systems are online. Start Live Sim to auto-generate corridor reports.");
    }, 200);
    return () => window.clearTimeout(timer);
  }, [createToast]);

  // Weather polling - try backend API first, fall back to synthetic
  useEffect(() => {
    let cancelled = false;

    async function fetchWeather() {
      try {
        const res = await fetch(`${API_URL}/api/weather`);
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        if (cancelled) return;
        setWeather((prev) => ({
          temperature: data.temperature ?? prev.temperature,
          rainProbability: data.rainProbability ?? prev.rainProbability,
          aqi: data.aqi ?? prev.aqi,
          wind: data.wind ?? prev.wind,
          pollCount: prev.pollCount + 1,
          lastPolledAt: Date.now(),
        }));
        pushConsole(
          "API",
          `Weather API: temp=${Math.round(data.temperature)}°C, rain=${Math.round(data.rainProbability)}%, AQI=${Math.round(data.aqi ?? 0)}`,
        );
      } catch {
        // Fallback to synthetic weather
        if (cancelled) return;
        setWeather((prev) => {
          const next = {
            temperature: Math.max(29, Math.min(38, prev.temperature + (Math.random() - 0.38) * 1.2)),
            rainProbability: Math.max(10, Math.min(95, prev.rainProbability + (Math.random() - 0.4) * 8)),
            aqi: Math.max(40, Math.min(160, prev.aqi + (Math.random() - 0.5) * 6)),
            wind: Math.max(5, Math.min(35, prev.wind + (Math.random() - 0.5) * 3)),
            pollCount: prev.pollCount + 1,
            lastPolledAt: Date.now(),
          };
          pushConsole(
            "API",
            `WeatherPoller #${next.pollCount}: temp=${Math.round(next.temperature)}°C, rain=${Math.round(next.rainProbability)}%, AQI=${Math.round(next.aqi)}`,
          );
          return next;
        });
      }
    }

    fetchWeather();
    const interval = window.setInterval(fetchWeather, 12000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [pushConsole]);

  useEffect(() => {
    if (!simRunning) {
      if (simIntervalRef.current) {
        window.clearInterval(simIntervalRef.current);
        simIntervalRef.current = null;
      }
      return;
    }

    const generateSimReport = () => {
      const scenario = LIVE_SCENARIOS[scenarioIndexRef.current % LIVE_SCENARIOS.length];
      scenarioIndexRef.current += 1;

      const report: ReportItem = {
        id: `SIM-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
        cat: scenario.cat,
        loc: scenario.loc,
        desc: scenario.desc,
        sev: scenario.sev,
        subs: [scenario.sub],
        createdAt: Date.now(),
      };

      const coords = {
        lat: Number((scenario.lat + (Math.random() - 0.5) * 0.0012).toFixed(6)),
        lng: Number((scenario.lng + (Math.random() - 0.5) * 0.0012).toFixed(6)),
      };

      addReport(report, coords, true);
    };

    const bootTimer = window.setTimeout(() => {
      createToast("success", "Live Simulation Active", "Generating reports every 8-12 seconds across the corridor.");
      pushConsole("SIM", "Live simulation started - generating reports every 8-12s");
    }, 0);
    generateSimReport();
    simIntervalRef.current = window.setInterval(generateSimReport, 9000 + Math.random() * 3000);

    return () => {
      window.clearTimeout(bootTimer);
      if (simIntervalRef.current) {
        window.clearInterval(simIntervalRef.current);
        simIntervalRef.current = null;
      }
    };
  }, [addReport, createToast, pushConsole, simRunning]);

  useEffect(() => {
    const checks: Array<{
      key: keyof typeof firedRulesRef.current;
      progress: number;
      variant: ToastNotice["variant"];
      title: string;
      message: string;
      rule: string;
    }> = [
      {
        key: "flood",
        progress: ruleProgress.flood,
        variant: "danger",
        title: "Flood Risk Activated",
        message: `Drain reports + rain probability crossed threshold (${Math.round(weather.rainProbability)}%).`,
        rule: "flood-drain-combo",
      },
      {
        key: "waste",
        progress: ruleProgress.waste,
        variant: "warn",
        title: "Waste Spike Predicted",
        message: "High waste density detected. Barangay dispatch suggested.",
        rule: "waste-spike-pattern",
      },
      {
        key: "dark",
        progress: ruleProgress.dark,
        variant: "warn",
        title: "Dark Stretch Safety Alert",
        message: "Streetlight incidents indicate a potential safety hotspot.",
        rule: "dark-stretch-safety",
      },
      {
        key: "energy",
        progress: ruleProgress.energy,
        variant: "info",
        title: "Energy Demand Response",
        message: `Heat threshold reached at ${Math.round(weather.temperature)}°C.`,
        rule: "energy-demand-response",
      },
    ];

    checks.forEach((item) => {
      if (item.progress >= 100 && !firedRulesRef.current[item.key]) {
        firedRulesRef.current[item.key] = true;
        setAlertsFired((prev) => prev + 1);
        createToast(item.variant, item.title, item.message, item.rule);
        pushConsole("ALERT", `${item.title} - ${item.rule}`);
      }
      if (item.progress < 90 && firedRulesRef.current[item.key]) {
        firedRulesRef.current[item.key] = false;
      }
    });
  }, [createToast, pushConsole, ruleProgress, weather.rainProbability, weather.temperature]);

  useEffect(() => {
    const ticker = window.setInterval(() => {
      setFeed((prev) =>
        prev.map((item) => {
          if (item.createdAt) {
            return { ...item, timeLabel: formatTimeLabel(item.createdAt) };
          }
          if (item.timeLabel === "just now") {
            return { ...item, timeLabel: "1m ago" };
          }
          const mins = Number.parseInt(item.timeLabel, 10);
          if (Number.isFinite(mins)) {
            return { ...item, timeLabel: `${Math.min(mins + 1, 59)}m ago` };
          }
          return item;
        }),
      );
    }, 60000);

    return () => window.clearInterval(ticker);
  }, []);

  return (
    <>
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
      <Header
        view={view}
        onChangeView={setView}
        simulationRunning={simRunning}
        onToggleSimulation={toggleSimulation}
        stats={{
          total: pins.length,
          critical: criticalCount,
          resolved: Math.max(0, Math.floor(pins.length * 0.25)),
        }}
        weather={weather}
      />

      {view === "report" ? (
        <div className="view report active-view" id="view-report">
          <ReportSidebar
            tab={tab}
            onChangeTab={setTab}
            selectedCat={selectedCat}
            selectedSev={selectedSev}
            selectedSubs={selectedSubs}
            locationText={locationText}
            description={description}
            charCount={description.length}
            previewSrc={previewSrc}
            reports={reports}
            submitting={submitting}
            onPhotoUpload={handlePhotoUpload}
            onSetLocation={setLocationText}
            onUseCurrentLocation={handleUseCurrentLocation}
            onSelectCat={handleSelectCategory}
            onToggleSub={handleToggleSub}
            onSelectSev={setSelectedSev}
            onSetDescription={setDescription}
            onSubmit={handleSubmitReport}
          />
          <MapPanel
            onPickLocation={handlePickLocation}
            selectedCoords={pendingCoords}
            feed={feed}
            pins={pins}
          />
        </div>
      ) : (
        <DashboardView
          kpiTotal={147 + reports.length}
          kpiCritical={12 + criticalCount}
          weather={{ temperature: weather.temperature, rainProbability: weather.rainProbability }}
          alertsFired={alertsFired}
          ruleProgress={ruleProgress}
          consoleEntries={consoleEntries}
        />
      )}

      <SuccessModal show={showSuccess} reportId={lastReportId} onClose={() => setShowSuccess(false)} />
    </>
  );
}

function formatTimeLabel(createdAt: number): string {
  const diff = Date.now() - createdAt;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ago`;
}
