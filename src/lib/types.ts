// Types for the Billboard QR Analytics System

export interface Billboard {
  id: string;
  name: string;
  location: string;
  city: "Lagos" | "Abuja";
  coordinates: { lat: number; lng: number };
  campaign: Campaign;
  status: "active" | "inactive" | "maintenance";
  size: string;
  dailyTraffic: number; // estimated vehicles/pedestrians per day
  installedDate: string;
}

export interface Campaign {
  id: string;
  name: string;
  advertiser: string;
  product: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: number; // NGN
  targetUrl: string;
  creative: string; // tagline / ad copy
}

export interface ScanEvent {
  id: string;
  billboardId: string;
  timestamp: string;
  isConversion: boolean; // whether user clicked the advertiser link
  source: "qr" | "simulation" | "seeded";
  userAgent?: string;
  deviceType?: string; // e.g. "iPhone", "Android", "Desktop"
  isBot: boolean;
  isDuplicate: boolean;
  weather?: string;
  trafficLevel?: "low" | "moderate" | "high" | "gridlock";
}

export interface BillboardStats {
  billboardId: string;
  totalScans: number;
  validScans: number;
  conversions: number;
  conversionRate: number;
  scansToday: number;
  costPerScan: number;
}
