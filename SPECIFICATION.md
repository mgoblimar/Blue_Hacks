# UrbanPulse Manila — Implementation Specification

## 1. Report Timestamps
- Add `reportTime` (ISO timestamp) to every `ReportItem`
- Display in report history: formatted as "Mar 28, 2:45 PM" (local timezone)
- Show in report feed items: "2m ago", "14m ago" (relative time; refresh every 60s)
- Store `createdAt` in milliseconds; format on display only

## 2. Supabase Bucket Integration for Images
- Create Supabase project + storage bucket `report-images`
- Bucket policy: public read, authenticated write
- Upload flow:
  - On photo selection → upload to bucket with path `reports/{reportId}/{filename}`
  - Store returned `bucket_url` in report metadata
  - Keep preview in-app during form editing
- Display logic:
  - Show uploaded image in report history card
  - Show in report detail view (if implemented)
  - Show in simulated reports (use a default placeholder image or generated URL)
- Simulated reports: generate dummy image URL or reference a stock image location

## 3. Remove "Total: reports" Counter from Header
- Delete `.report-counter` and associated logic from Header
- Simplify header right section layout

## 4. Move Map Info & Legend to Header
- Relocate map-info block (Pedro Gil · Padre Faura + ERMITA, MANILA) → header subtitle area or dedicated section
- Relocate map legend (Map Key with color dots) → collapsible or static header block
- Map overlay toggle becomes: show/hide map detail info
- Header should display category colors and labels at all times for quick reference

## 5. Weather API on Backend
- Backend service (Python FastAPI or similar):
  - Endpoint: `GET /api/weather` or `GET /api/weather/current`
  - Request: optional `lat`, `lng` (default: 14.5818, 120.9873)
  - Response JSON:
    ```json
    {
      "temperature": 32,
      "rainProbability": 45,
      "aqi": 68,
      "wind": 12,
      "humidity": 75,
      "condition": "Partly Cloudy",
      "lastUpdate": "2026-03-28T14:30:00Z",
      "source": "OpenWeatherMap|WeatherAPI|etc"
    }
    ```
  - Integration: call from frontend on mount and every 12s (replace synthetic polling)
  - Credentials: store API key in backend `.env`, not exposed to frontend

## 6. Color Coding by Severity
- Update CSS and component logic:
  - `low` severity → **Green** (`#3aefb8` or `#22c55e`)
  - `moderate` severity → **Yellow** (`#f5c518` or `#eab308`)
  - `critical` severity → **Red** (`#ff4e42` or `#ef4444`)
- Apply colors to:
  - Category cards (when selected by severity filter, if added)
  - Severity buttons (`.sev-btn`)
  - History item badges
  - Map markers
  - Feed item left border
  - KPI cards (border-top)
  - Alert icons (small dot indicator)
  - Rule card progress bar colors

## 7. Database Schema (Expected)
Reports table:
```
- id: UUID (primary key)
- userId: UUID (foreign key → users)
- category: enum(waste, obstruction, streetlight, flood)
- severity: enum(low, moderate, critical)
- location: string
- coordinates: {lat, lng}
- description: text
- imageUrl: string (Supabase bucket URL)
- subtypes: string[] (JSON array)
- status: enum(open, in_progress, resolved)
- createdAt: timestamp
- resolvedAt: timestamp (nullable)
- reportedBy: string (e.g., "student_human_sensor")
- isSimulated: boolean
```

## 8. Frontend Update Summary
- `types.ts`: add `imageUrl` and `reportedAt` to `ReportItem`
- `page.tsx`: integrate real weather API calls instead of synthetic
- `Header.tsx`: remove report counter; restructure to include map legend/info
- `MapPanel.tsx`: remove map-info, map-legend from overlay (move to header)
- `ReportSidebar.tsx`: upload image → Supabase; store URL in metadata
- `globals.css`: update color vars for severity (green/yellow/red)
- `constants.ts`: update color mappings
- Report history items: display photo thumbnail and timestamp

## 9. Backend Setup Summary
- Create API service (FastAPI/Django/Node.js)
- Weather endpoint with external API integration
- Image handling: accept upload, validate, store in Supabase
- Environment: `.env` with API keys (OpenWeatherMap, Supabase)
- CORS: allow requests from frontend domain

## 10. Testing Checklist
- [ ] Timestamps display correctly in local timezone
- [ ] Images upload to Supabase and are retrievable
- [ ] Simulated reports include placeholder images
- [ ] Weather data updates every 12 seconds from backend
- [ ] Header displays map legend and info without overlay crowding
- [ ] Color coding: low=green, moderate=yellow, critical=red across UI
- [ ] Report counter removed from header
- [ ] App builds and runs without errors

---

## Execution Order (Recommended)
1. Update Supabase project + bucket config
2. Create backend weather endpoint
3. Update types and constants (color mappings)
4. Refactor header layout (remove counter, add legend)
5. Wire Supabase image upload in report sidebar
6. Replace synthetic weather with real API calls
7. Test end-to-end; style color adjustments
