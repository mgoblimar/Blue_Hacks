"use client";

import { useMemo, useState } from "react";
import { DashboardView } from "@/components/urbanpulse/dashboard/DashboardView";
import { Header } from "@/components/urbanpulse/Header";
import { DEMO_PINS, INITIAL_FEED, makeReportId } from "@/components/urbanpulse/constants";
import { MapPanel } from "@/components/urbanpulse/report/MapPanel";
import { ReportSidebar } from "@/components/urbanpulse/report/ReportSidebar";
import { SuccessModal } from "@/components/urbanpulse/SuccessModal";
import { CategoryKey, FeedItem, MapPin, ReportItem, SeverityKey, SidebarTab, ViewMode } from "@/components/urbanpulse/types";

export default function Home() {
  const [view, setView] = useState<ViewMode>("report");
  const [tab, setTab] = useState<SidebarTab>("new");
  const [selectedCat, setSelectedCat] = useState<CategoryKey | null>(null);
  const [selectedSev, setSelectedSev] = useState<SeverityKey | null>(null);
  const [selectedSubs, setSelectedSubs] = useState<string[]>([]);
  const [locationText, setLocationText] = useState("");
  const [description, setDescription] = useState("");
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [pins, setPins] = useState<MapPin[]>(DEMO_PINS);
  const [feed, setFeed] = useState<FeedItem[]>(INITIAL_FEED);
  const [pendingCoords, setPendingCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastReportId, setLastReportId] = useState("RPT-00000");

  const criticalCount = useMemo(() => pins.filter((pin) => pin.sev === "critical").length, [pins]);

  function handlePhotoUpload(file: File | null) {
    if (!file) {
      setPreviewSrc(null);
      return;
    }

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

  function handleSubmitReport() {
    if (!selectedCat) {
      window.alert("Please select a problem category.");
      return;
    }

    const report: ReportItem = {
      id: makeReportId(),
      cat: selectedCat,
      loc: locationText || "Pedro Gil / Padre Faura Corridor",
      desc: description,
      sev: selectedSev ?? "moderate",
      subs: selectedSubs,
      createdAt: Date.now(),
    };

    const coords = pendingCoords ?? {
      lat: 14.5818 + (Math.random() - 0.5) * 0.004,
      lng: 120.9873 + (Math.random() - 0.5) * 0.004,
    };

    setReports((prev) => [report, ...prev]);
    setPins((prev) => [{ cat: report.cat, label: report.loc, sev: report.sev, lat: coords.lat, lng: coords.lng }, ...prev]);
    setFeed((prev) => [{ cat: report.cat, location: report.loc, timeLabel: "just now" }, ...prev].slice(0, 6));
    setLastReportId(report.id);
    setShowSuccess(true);

    setSelectedCat(null);
    setSelectedSev(null);
    setSelectedSubs([]);
    setLocationText("");
    setDescription("");
    setPreviewSrc(null);
    setPendingCoords(null);
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

  return (
    <>
      <Header view={view} onChangeView={setView} />

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
            stats={{
              total: pins.length,
              critical: criticalCount,
              resolved: Math.max(0, Math.floor(pins.length * 0.25)),
            }}
            feed={feed}
            pins={pins}
          />
        </div>
      ) : (
        <DashboardView kpiTotal={147 + reports.length} kpiCritical={12 + criticalCount} />
      )}

      <SuccessModal show={showSuccess} reportId={lastReportId} onClose={() => setShowSuccess(false)} />
    </>
  );
}
