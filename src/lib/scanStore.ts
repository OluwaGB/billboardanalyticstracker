import type { ScanEvent } from "./types";
import { billboards } from "./data";

const STORAGE_KEY = "ooh_scan_events";

// Generate realistic seeded historical data
function generateSeededData(): ScanEvent[] {
  const events: ScanEvent[] = [];
  const now = new Date();

  // Weather options
  const weathers = ["Sunny", "Partly Cloudy", "Cloudy", "Light Rain", "Hot & Humid", "Clear"];
  const trafficLevels: ScanEvent["trafficLevel"][] = ["low", "moderate", "high", "gridlock"];

  billboards.forEach((bb) => {
    // 30 days of historical data
    for (let day = 29; day >= 0; day--) {
      const date = new Date(now);
      date.setDate(date.getDate() - day);

      // Peak hours: 7-9am (morning rush), 12-2pm (lunch), 5-8pm (evening rush)
      const peakHours = [7, 8, 12, 13, 17, 18, 19, 20];
      const normalHours = [6, 9, 10, 11, 14, 15, 16, 21];

      // More scans on weekdays + for high-traffic billboards
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const trafficMultiplier = bb.dailyTraffic / 150000;
      const baseScans = isWeekend ? 3 : 7;

      // Peak hour scans
      peakHours.forEach((hour) => {
        const scansThisHour = Math.floor((baseScans + Math.random() * 5) * trafficMultiplier);
        for (let i = 0; i < scansThisHour; i++) {
          const scanDate = new Date(date);
          scanDate.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
          const isBot = Math.random() < 0.05;
          const isDuplicate = !isBot && Math.random() < 0.08;
          const isConversion = !isBot && !isDuplicate && Math.random() < 0.18;
          events.push({
            id: `seeded-${bb.id}-${day}-${hour}-${i}`,
            billboardId: bb.id,
            timestamp: scanDate.toISOString(),
            isConversion,
            source: "seeded",
            isBot,
            isDuplicate,
            weather: weathers[Math.floor(Math.random() * weathers.length)],
            trafficLevel: trafficLevels[hour >= 17 && hour <= 20 ? 3 : hour >= 7 && hour <= 9 ? 2 : Math.floor(Math.random() * 3)],
          });
        }
      });

      // Normal hour scans
      normalHours.forEach((hour) => {
        const scansThisHour = Math.floor((1 + Math.random() * 2) * trafficMultiplier);
        for (let i = 0; i < scansThisHour; i++) {
          const scanDate = new Date(date);
          scanDate.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
          const isBot = Math.random() < 0.04;
          events.push({
            id: `seeded-${bb.id}-${day}-${hour}-n${i}`,
            billboardId: bb.id,
            timestamp: scanDate.toISOString(),
            isConversion: !isBot && Math.random() < 0.12,
            source: "seeded",
            isBot,
            isDuplicate: false,
            weather: weathers[Math.floor(Math.random() * weathers.length)],
            trafficLevel: trafficLevels[Math.floor(Math.random() * 3)],
          });
        }
      });
    }
  });

  return events;
}

export function getScanEvents(): ScanEvent[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (_) {
    // ignore
  }
  // Seed on first load
  const seeded = generateSeededData();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
}

export function detectDeviceType(ua: string = navigator.userAgent): string {
  if (/iphone/i.test(ua)) return "iPhone";
  if (/ipad/i.test(ua)) return "iPad";
  if (/android.*mobile/i.test(ua)) return "Android Phone";
  if (/android/i.test(ua)) return "Android Tablet";
  if (/windows phone/i.test(ua)) return "Windows Phone";
  if (/macintosh|mac os x/i.test(ua)) return "Mac";
  if (/windows/i.test(ua)) return "Windows PC";
  if (/linux/i.test(ua)) return "Linux";
  return "Unknown Device";
}

export function logScanEvent(
  billboardId: string,
  source: "qr" | "simulation",
  isConversion = false
): ScanEvent {
  const events = getScanEvents();
  const newEvent: ScanEvent = {
    id: `real-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    billboardId,
    timestamp: new Date().toISOString(),
    isConversion,
    source,
    userAgent: navigator.userAgent,
    deviceType: detectDeviceType(),
    isBot: false,
    isDuplicate: false,
    weather: ["Sunny", "Partly Cloudy", "Cloudy", "Hot & Humid"][Math.floor(Math.random() * 4)],
    trafficLevel: ["low", "moderate", "high"][Math.floor(Math.random() * 3)] as ScanEvent["trafficLevel"],
  };
  events.push(newEvent);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  return newEvent;
}

export function logConversion(billboardId: string): void {
  const events = getScanEvents();
  // Find most recent scan for this billboard without conversion
  const idx = [...events].reverse().findIndex(
    (e) => e.billboardId === billboardId && !e.isConversion && !e.isBot
  );
  if (idx !== -1) {
    const realIdx = events.length - 1 - idx;
    events[realIdx].isConversion = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }
}

export function getBillboardStats(billboardId: string, events?: ScanEvent[]) {
  const allEvents = events || getScanEvents();
  const billboardEvents = allEvents.filter((e) => e.billboardId === billboardId);
  const validScans = billboardEvents.filter((e) => !e.isBot && !e.isDuplicate);
  const conversions = validScans.filter((e) => e.isConversion);

  const today = new Date().toDateString();
  const scansToday = validScans.filter(
    (e) => new Date(e.timestamp).toDateString() === today
  ).length;

  const bb = billboards.find((b) => b.id === billboardId);
  const totalBudget = bb?.campaign.budget || 0;
  const costPerScan = validScans.length > 0 ? totalBudget / validScans.length : 0;

  return {
    billboardId,
    totalScans: billboardEvents.length,
    validScans: validScans.length,
    conversions: conversions.length,
    conversionRate: validScans.length > 0 ? (conversions.length / validScans.length) * 100 : 0,
    scansToday,
    costPerScan,
  };
}

export function getHourlyScanData(billboardId?: string, daysBack = 1) {
  const events = getScanEvents();
  const filtered = billboardId
    ? events.filter((e) => e.billboardId === billboardId && !e.isBot)
    : events.filter((e) => !e.isBot);

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysBack);

  const recent = filtered.filter((e) => new Date(e.timestamp) >= cutoff);

  const hourlyMap: Record<string, number> = {};
  for (let h = 0; h < 24; h++) {
    hourlyMap[`${h}:00`] = 0;
  }

  recent.forEach((e) => {
    const hour = new Date(e.timestamp).getHours();
    hourlyMap[`${hour}:00`] = (hourlyMap[`${hour}:00`] || 0) + 1;
  });

  return Object.entries(hourlyMap).map(([hour, scans]) => ({ hour, scans }));
}

export function getDailyScanData(billboardId?: string) {
  const events = getScanEvents();
  const filtered = billboardId
    ? events.filter((e) => e.billboardId === billboardId && !e.isBot)
    : events.filter((e) => !e.isBot);

  const dailyMap: Record<string, { scans: number; conversions: number }> = {};

  // Last 30 days
  for (let d = 29; d >= 0; d--) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    const key = date.toLocaleDateString("en-NG", { month: "short", day: "numeric" });
    dailyMap[key] = { scans: 0, conversions: 0 };
  }

  filtered.forEach((e) => {
    const key = new Date(e.timestamp).toLocaleDateString("en-NG", { month: "short", day: "numeric" });
    if (dailyMap[key]) {
      dailyMap[key].scans++;
      if (e.isConversion) dailyMap[key].conversions++;
    }
  });

  return Object.entries(dailyMap).map(([date, data]) => ({ date, ...data }));
}

export function getRecentRealScans(billboardId: string, limit = 10) {
  const events = getScanEvents();
  return events
    .filter((e) => e.billboardId === billboardId && e.source !== "seeded" && !e.isBot)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

export function getDeviceBreakdown(billboardId?: string) {
  const events = getScanEvents();
  const relevant = (billboardId
    ? events.filter((e) => e.billboardId === billboardId)
    : events
  ).filter((e) => !e.isBot && e.source !== "seeded");

  const counts: Record<string, number> = {};
  relevant.forEach((e) => {
    const d = e.deviceType || "Unknown";
    counts[d] = (counts[d] || 0) + 1;
  });
  return Object.entries(counts).map(([device, count]) => ({ device, count }));
}
