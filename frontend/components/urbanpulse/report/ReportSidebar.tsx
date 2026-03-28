import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CAT_CFG, EMPTY_REPORT_MESSAGE } from "../constants";
import { CategoryKey, ReportItem, SeverityKey, SidebarTab } from "../types";

type ReportSidebarProps = {
  tab: SidebarTab;
  onChangeTab: (tab: SidebarTab) => void;
  selectedCat: CategoryKey | null;
  selectedSev: SeverityKey | null;
  selectedSubs: string[];
  locationText: string;
  description: string;
  charCount: number;
  previewSrc: string | null;
  reports: ReportItem[];
  onPhotoUpload: (file: File | null) => void;
  onSetLocation: (location: string) => void;
  onUseCurrentLocation: () => void;
  onSelectCat: (cat: CategoryKey) => void;
  onToggleSub: (sub: string) => void;
  onSelectSev: (sev: SeverityKey) => void;
  onSetDescription: (value: string) => void;
  onSubmit: () => void;
};

export function ReportSidebar({
  tab,
  onChangeTab,
  selectedCat,
  selectedSev,
  selectedSubs,
  locationText,
  description,
  charCount,
  previewSrc,
  reports,
  onPhotoUpload,
  onSetLocation,
  onUseCurrentLocation,
  onSelectCat,
  onToggleSub,
  onSelectSev,
  onSetDescription,
  onSubmit,
}: ReportSidebarProps) {
  return (
    <aside className="sidebar">
      <div className="tab-bar">
        <div className={`tab ${tab === "new" ? "active" : ""}`} onClick={() => onChangeTab("new")}>
          New Report
        </div>
        <div className={`tab ${tab === "history" ? "active" : ""}`} onClick={() => onChangeTab("history")}>
          My Reports
        </div>
      </div>

      <div className={`tab-content ${tab === "new" ? "active" : ""}`}>
        <div className="sidebar-section">
          <div className="sec-label">① Upload Photo <span className="required">*</span></div>
          <label className="upload-zone" id="drop-zone">
            <input type="file" accept="image/*" onChange={(event) => onPhotoUpload(event.target.files?.[0] ?? null)} />
            <div className="camera-icon">📷</div>
            <div className="upload-hint">
              <strong>Tap to upload</strong> or drag & drop
              <br />
              <span>JPEG · PNG · HEIC - max 10 MB</span>
            </div>
            {previewSrc ? (
              <Image
                id="preview-img"
                className="show"
                alt="Selected report image"
                src={previewSrc}
                width={320}
                height={180}
                unoptimized
              />
            ) : null}
          </label>
          <div className="loc-row">
            <Input
              className="loc-input"
              value={locationText}
              onChange={(event) => onSetLocation(event.target.value)}
              placeholder="📍 Location (auto or manual)"
            />
            <Button variant="ghost" size="icon" className="loc-btn" onClick={onUseCurrentLocation} title="Use GPS">
              ⌖
            </Button>
          </div>
        </div>

        <div className="sidebar-section">
          <div className="sec-label">② Problem Category <span className="required">*</span></div>
          <div className="cat-grid">
            {(Object.keys(CAT_CFG) as CategoryKey[]).map((cat) => (
              <div
                className={`cat-card ${selectedCat === cat ? "sel" : ""}`}
                data-cat={cat}
                key={cat}
                onClick={() => onSelectCat(cat)}
              >
                <span className="cat-emoji">{CAT_CFG[cat].emoji}</span>
                <span className="cat-name">{CAT_CFG[cat].label}</span>
                <span className="cat-desc">{CAT_CFG[cat].description}</span>
              </div>
            ))}
          </div>

          {selectedCat ? (
            <div id="sub-section" className="sub-section-active">
              <div className="sec-label sec-label-tight">Sub-type</div>
              <div className="sub-grid" id="sub-grid">
                {CAT_CFG[selectedCat].subs.map((sub) => (
                  <Button
                    key={sub}
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={`sub-tag ${selectedSubs.includes(sub) ? "sel" : ""}`}
                    onClick={() => onToggleSub(sub)}
                  >
                    {sub}
                  </Button>
                ))}
              </div>
              <div className="ctx-prompt" dangerouslySetInnerHTML={{ __html: CAT_CFG[selectedCat].ctx }} />
            </div>
          ) : null}
        </div>

        <div className="sidebar-section">
          <div className="sec-label">③ Severity</div>
          <div className="sev-row">
            <Button variant="outline" size="sm" className={`sev-btn s1 ${selectedSev === "low" ? "sel" : ""}`} onClick={() => onSelectSev("low")}>🟢 Low</Button>
            <Button variant="outline" size="sm" className={`sev-btn s2 ${selectedSev === "moderate" ? "sel" : ""}`} onClick={() => onSelectSev("moderate")}>🟡 Moderate</Button>
            <Button variant="outline" size="sm" className={`sev-btn s3 ${selectedSev === "critical" ? "sel" : ""}`} onClick={() => onSelectSev("critical")}>🔴 Critical</Button>
          </div>
        </div>

        <div className="sidebar-section">
          <div className="sec-label">④ Description</div>
          <Textarea
            className="desc-area"
            maxLength={280}
            value={description}
            onChange={(event) => onSetDescription(event.target.value)}
            placeholder="When did you notice this? How long has it been here? Is it worsening?"
          />
          <div className="char-ct">{charCount}/280</div>
        </div>

        <div className="sidebar-section sidebar-last">
          <Button className="submit-btn" onClick={onSubmit}>Submit Report →</Button>
          <p className="submit-note">Shared with Manila LGU and UPM administration</p>
        </div>
      </div>

      <div className={`tab-content ${tab === "history" ? "active" : ""}`}>
        <div className="sidebar-section sidebar-last">
          <div className="sec-label history-label">Your Submissions</div>
          <div id="history-list">
            {reports.length === 0 ? (
              <p className="history-empty">{EMPTY_REPORT_MESSAGE}</p>
            ) : (
              reports.map((report) => {
                const cfg = CAT_CFG[report.cat];
                return (
                  <Card className="history-item" style={{ borderLeftColor: cfg.color }} key={report.id}>
                    <div className="history-head">
                      <span className="history-cat" style={{ color: cfg.color }}>
                        {cfg.emoji} {cfg.label}
                      </span>
                      <span className="history-id">{report.id}</span>
                    </div>
                    <div className="history-loc">📍 {report.loc}</div>
                    {report.subs.length > 0 ? <div className="history-subs">{report.subs.join(" · ")}</div> : null}
                    <div className="history-sev-wrap">
                      <Badge className="history-sev">{report.sev.toUpperCase()}</Badge>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
