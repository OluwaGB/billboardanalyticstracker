
## Billboard QR Analytics System — Final Year Project

### Overview
A dark-themed, publicly accessible web application that simulates Nigeria's Out-of-Home (OOH) advertising analytics. Each billboard has a unique QR code; when scanned, it logs an engagement event. A real-time dashboard visualizes all scan data, campaign performance, and enriched metrics (traffic, weather context).

---

### Pages & Structure

#### 1. Landing Page (Home)
- Hero section introducing the platform: **"OOH Analytics — Nigeria's Billboard Intelligence Platform"**
- Brief description of how the QR tracking system works
- Call-to-action button leading to the Dashboard
- Stats strip showing totals: Total Billboards, Total Scans, Active Campaigns, Cities Covered

#### 2. Billboards Page
- A grid of billboard cards, each representing a real Nigerian location (e.g. Third Mainland Bridge, Lekki-Epe Expressway, Abuja Airport Road)
- Each card shows: Billboard name, location, current campaign name, a generated QR code, and a "Scan Simulation" button
- The QR code links to a unique tracking URL (e.g. `/scan/billboard-001`)
- Clicking the QR code or "Simulate Scan" button logs a scan event and shows a confirmation

#### 3. Scan Landing Page (`/scan/:id`)
- This is the page a real user would land on after scanning a QR code from a physical billboard
- Shows the advertiser's campaign message (e.g. a product ad)
- Automatically logs the scan with timestamp, billboard ID, simulated location data
- Has a "Visit Advertiser Website" button that counts as a conversion

#### 4. Analytics Dashboard
- **Summary KPI Cards** at the top: Total Scans Today, Total Conversions, Top Performing Billboard, Scan-to-Conversion Rate
- **Line/Area Chart**: Scans over time (hourly/daily toggle)
- **Bar Chart**: Scans per billboard/location — highlights top performers like Third Mainland Bridge
- **Map-style Billboard Table**: List of all billboards with their scan counts, conversion rates, and status
- **Traffic & Weather Enrichment Panel**: Shows simulated contextual data (e.g. "High traffic on Third Mainland Bridge at 8AM correlates with 3x scan spike")
- **Campaign Performance Table**: Campaign name, billboard, scans, conversions, cost-per-scan estimate
- Filter controls: by date range, city (Lagos / Abuja), campaign

#### 5. Individual Billboard Detail Page
- Drill-down page for each billboard
- Shows that billboard's QR code, scan history chart, conversion funnel, and enrichment data
- Campaign info: advertiser name, campaign dates, creative description

---

### Data Strategy (Mix of Demo + Real)
- **Real data**: Actual QR scan events logged when the "Simulate Scan" button is clicked or the `/scan/:id` URL is visited — stored in-browser (localStorage) or via Supabase
- **Demo/seeded data**: Pre-loaded historical scan data for all billboards to make the dashboard look rich from day one — realistic Nigerian traffic patterns, peak hours (morning/evening rush), and weather context
- Bot/duplicate filtering logic shown in the UI as a "data quality" metric

---

### Design Style
- **Dark theme** throughout — deep navy/charcoal backgrounds
- Vibrant accent colors: electric blue for primary actions, green for positive metrics, amber for alerts
- Nigerian context woven in: city names, route names (Third Mainland Bridge, Victoria Island, Wuse II), ARCON/LASAA compliance badge
- Clean chart typography using Recharts (already installed)
- Mobile-responsive layout

---

### Key Features Summary
1. QR code generation per billboard
2. Scan event logging (real clicks + seeded historical data)
3. Real-time updating dashboard with charts
4. Traffic & weather context enrichment (simulated)
5. Conversion tracking (scan → landing page → advertiser click)
6. ARCON/LASAA compliance mention in footer/about section
7. Data quality panel (bot filtering, deduplication metrics)
