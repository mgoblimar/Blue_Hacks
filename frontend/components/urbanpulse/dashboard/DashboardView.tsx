import { Fragment } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CategoryDonutChart } from "../charts/CategoryDonutChart";
import { StackedTrendChart } from "../charts/StackedTrendChart";

type DashboardViewProps = {
  kpiTotal: number;
  kpiCritical: number;
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HEATMAP_DATA = [
  [1, 2, 4, 6, 5, 3, 2, 1, 0],
  [2, 4, 8, 12, 10, 7, 5, 3, 1],
  [1, 3, 6, 9, 8, 5, 4, 2, 1],
  [2, 5, 9, 14, 11, 8, 6, 3, 1],
  [3, 7, 12, 18, 15, 11, 8, 4, 2],
  [2, 4, 7, 10, 9, 6, 5, 3, 1],
  [1, 2, 3, 5, 4, 3, 2, 1, 0],
];

export function DashboardView({ kpiTotal, kpiCritical }: DashboardViewProps) {
  const maxV = Math.max(...HEATMAP_DATA.flat());

  return (
    <div className="view dashboard active-view" id="view-dashboard">
      <div className="dash-header">
        <div>
          <div className="dash-title">Community Scorecard</div>
          <div className="dash-sub">PEDRO GIL · PADRE FAURA CORRIDOR - ERMITA, MANILA</div>
        </div>
        <div className="date-badge">
          {new Date().toLocaleDateString("en-PH", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </div>
      </div>

      <div className="kpi-grid">
        <Card className="kpi waste-k">
          <div className="kpi-label">Total Reports (Week)</div>
          <div className="kpi-val">{kpiTotal}</div>
          <div className="kpi-delta up">↑ 23 vs last week</div>
        </Card>
        <Card className="kpi obs-k">
          <div className="kpi-label">Avg. Clearance Time</div>
          <div className="kpi-val">18h</div>
          <div className="kpi-delta dn">↓ 4h improvement</div>
        </Card>
        <Card className="kpi sl-k">
          <div className="kpi-label">Critical Unresolved</div>
          <div className="kpi-val kpi-critical">{kpiCritical}</div>
          <div className="kpi-delta up">↑ 3 since yesterday</div>
        </Card>
        <Card className="kpi fl-k">
          <div className="kpi-label">Corridor Health Score</div>
          <div className="kpi-val kpi-score">64<span>/100</span></div>
          <div className="kpi-delta dn">↑ 6 pts this month</div>
        </Card>
      </div>

      <div className="chart-row row-2">
        <Card className="panel">
          <CardHeader className="px-0 pb-0">
            <div className="panel-title">7-Day Report Trend</div>
            <div className="panel-sub">Daily volume by category</div>
          </CardHeader>
          <CardContent className="px-0">
          <div className="leg">
            <span className="leg-item"><span className="leg-dot" style={{ background: "#ff7d3b" }} />Waste</span>
            <span className="leg-item"><span className="leg-dot" style={{ background: "#f5c518" }} />Obstruction</span>
            <span className="leg-item"><span className="leg-dot" style={{ background: "#3aefb8" }} />Streetlight</span>
            <span className="leg-item"><span className="leg-dot" style={{ background: "#4da6ff" }} />Flood</span>
          </div>
          <div className="chart-box h200"><StackedTrendChart /></div>
          </CardContent>
        </Card>
        <Card className="panel">
          <CardHeader className="px-0 pb-0">
            <div className="panel-title">Reports by Category</div>
            <div className="panel-sub">This week · all severities</div>
          </CardHeader>
          <CardContent className="px-0">
          <div className="chart-box h200">
            <CategoryDonutChart
              labels={["Waste", "Obstruction", "Streetlight", "Flooding"]}
              values={[62, 39, 28, 18]}
              colors={["#ff7d3b", "#f5c518", "#3aefb8", "#4da6ff"]}
            />
          </div>
          </CardContent>
        </Card>
      </div>

      <div className="chart-row row-3">
        <Card className="panel">
          <div className="panel-title">Report Density Heatmap</div>
          <div className="panel-sub">Hour × Day - darker = more reports</div>
          <div className="hm-wrap">
            <div className="hm-grid">
              <div />
              {["6a", "8a", "10a", "12p", "2p", "4p", "6p", "8p", "10p"].map((hour) => (
                <div className="hm-head" key={hour}>{hour}</div>
              ))}
              {DAYS.map((day, dayIndex) => (
                <Fragment key={day}>
                  <div className="hm-label" key={`${day}-label`}>{day}</div>
                  {HEATMAP_DATA[dayIndex].map((value, idx) => {
                    const intensity = value / maxV;
                    const alpha = 0.08 + intensity * 0.82;
                    const r = Math.round(77 + intensity * (255 - 77));
                    const g = Math.round(166 + intensity * (125 - 166));
                    const b = Math.round(255 + intensity * (59 - 255));

                    return (
                      <div
                        className="hm-cell"
                        key={`${day}-${idx}`}
                        style={{ background: `rgba(${r},${g},${b},${alpha.toFixed(2)})` }}
                        title={`${value} reports`}
                      />
                    );
                  })}
                </Fragment>
              ))}
            </div>
          </div>
        </Card>

        <Card className="panel">
          <div className="panel-title">Waste Clearance Rate</div>
          <div className="panel-sub">% resolved within 24h</div>
          <div className="clearance-stack">
            {[
              ["Food waste", "88%", "8h", "#ff7d3b"],
              ["Plastic", "70%", "14h", "#e86020"],
              ["Overflow bin", "50%", "22h", "#c04818"],
              ["Const. debris", "28%", "40h+", "#903010"],
              ["Hazardous", "15%", "52h+", "#601808"],
            ].map(([name, width, value, color]) => (
              <div className="cl-row" key={name}>
                <span className="cl-name">{name}</span>
                <div className="cl-track">
                  <div className="cl-fill" style={{ width, background: color }} />
                </div>
                <span className="cl-val">{value}</span>
              </div>
            ))}
          </div>
          <p className="small-note">Bar = % cleared within 24h. Shorter = slower response.</p>
        </Card>

        <Card className="panel">
          <div className="panel-title">Top Hotspots</div>
          <div className="panel-sub">By report count · this week</div>
          <div className="hotspot-list">
            {[
              ["01", "PGH Gate area", "100%", 34],
              ["02", "Taft / P. Faura", "76%", 26],
              ["03", "P. Gil midpoint", "59%", 20],
              ["04", "Robinson's area", "44%", 15],
              ["05", "Taft underpass", "35%", 12],
              ["06", "P. Faura / MH del P.", "29%", 10],
            ].map(([rank, name, width, value]) => (
              <div className="hs-row" key={rank}>
                <span className="hs-rank">{rank}</span>
                <span className="hs-name">{name}</span>
                <div className="hs-track"><div className="hs-fill" style={{ width }} /></div>
                <span className="hs-val">{value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="chart-row row-3">
        <Card className="panel">
          <div className="panel-title">⚡ Predictive Alerts</div>
          <div className="panel-sub">AI-generated · next 24 hours</div>
          <div className="alert-list">
            <div className="alert danger"><span className="alert-icon">🌊</span><div><div className="alert-title">Flood risk: P. Faura / Taft</div><div className="alert-meta">3 clogged drain reports + rain forecast 4 PM</div></div></div>
            <div className="alert warn"><span className="alert-icon">🗑️</span><div><div className="alert-title">Waste spike expected Friday PM</div><div className="alert-meta">Historical pattern on Pedro Gil - alert sent to barangay</div></div></div>
            <div className="alert warn"><span className="alert-icon">💡</span><div><div className="alert-title">Dark stretch: P. Gil 1100-1200</div><div className="alert-meta">4 open streetlight reports, 2 days unresolved</div></div></div>
            <div className="alert info"><span className="alert-icon">⚡</span><div><div className="alert-title">Energy peak day tomorrow</div><div className="alert-meta">Heatwave forecast - pre-cool UPM buildings advised</div></div></div>
          </div>
        </Card>

        <Card className="panel">
          <div className="panel-title">Severity Breakdown</div>
          <div className="panel-sub">All open reports</div>
          <div className="chart-box h160">
            <CategoryDonutChart labels={["Low", "Moderate", "Critical"]} values={[45, 68, 34]} colors={["#3aefb8", "#f5c518", "#ff4e42"]} cutout="60%" />
          </div>
          <div className="resolution-box">
            <div className="resolution-head">
              <span>Resolution rate</span>
              <span className="resolution-value">68%</span>
            </div>
            <Progress value={68} className="resolution-track" indicatorClassName="resolution-fill" />
          </div>
        </Card>

        <Card className="panel">
          <div className="panel-title">SDG Alignment</div>
          <div className="panel-sub">Sustainable development goals</div>
          <div className="sdg-list">
            {[
              ["SDG 7 - Clean Energy", "7", "42%", "42 streetlight reports tracked", "#ffd600"],
              ["SDG 11 - Sustainable Cities", "11", "71%", "71 obstruction + flood reports", "#fd9d24"],
              ["SDG 12 - Responsible Production", "12", "55%", "55 waste reports this month", "#bf8b2e"],
              ["SDG 13 - Climate Action", "13", "28%", "28 flood / drain reports flagged", "#3f9142"],
            ].map(([title, badge, width, meta, color]) => (
              <div key={title}>
                <div className="sdg-top">
                  <span className="sdg-title">{title}</span>
                  <Badge className="sdg" style={{ color, borderColor: `${color}66`, background: `${color}22` }}>
                    {badge}
                  </Badge>
                </div>
                <Progress value={Number(String(width).replace("%", ""))} className="sdg-track" indicatorClassName="sdg-fill" />
                <div className="sdg-meta">{meta}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
