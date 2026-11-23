"use client";

import React, { useState, useMemo, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  RefreshCw,
  ChevronDown,
  Search,
  X,
} from "lucide-react";
import { CARRIER_SITES, CarrierSite, SiteCircuit } from "@/data/sitesData";
import cpeInventoryData from "@/data/cpeInventory.json";

const getCpeStatusBadgeClass = (status: "online" | "warning" | "offline") => {
  if (status === "online") {
    return "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60";
  }
  if (status === "warning") {
    return "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/60";
  }
  return "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800/60";
};

const getCpeStatusDotClass = (status: string) => {
  if (status === "online") return "bg-emerald-500";
  if (status === "warning") return "bg-amber-500";
  return "bg-rose-500";
};

const getCpuProgressColor = (cpu: number) => {
  if (cpu > 80) return "bg-rose-500";
  if (cpu > 60) return "bg-amber-500";
  return "bg-blue-600";
};

const getSlaStatusBadgeClass = (status: "healthy" | "warning" | "breached") => {
  if (status === "healthy") {
    return "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60";
  }
  if (status === "warning") {
    return "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/60";
  }
  return "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800/60";
};

type TabType = "bandwidth" | "cpe" | "sla";

interface TelemetryPoint {
  time: string;
  displayTime: string;
  rx: number; // in Mbps
  tx: number; // in Mbps
}

interface CpeInventoryItem {
  name: string;
  deviceId: string;
  associatedSite: string;
  siteId: string;
  region: string;
  ipAddress: string;
  underlay: string;
  status: "online" | "warning" | "offline";
  cpu: number;
  memory: number;
  lastSeen: string;
  model: string;
  temperature: string;
}

interface SlaServiceItem {
  serviceId: string;
  siteName: string;
  underlay: string;
  slaTarget: string;
  actualAvailability: number;
  avgLatency: string;
  avgJitter: string;
  packetLoss: string;
  slaStatus: "healthy" | "warning" | "breached";
  lastUpdated: string;
}

export default function PerformanceView() {
  const pathname = usePathname();
  const router = useRouter();

  // Synchronize active tab with the URL path
  const activeTab: TabType = useMemo(() => {
    if (pathname.includes("/cpe-health") || pathname.includes("/cpe")) {
      return "cpe";
    }
    if (pathname.includes("/sla-health") || pathname.includes("/sla")) {
      return "sla";
    }
    return "bandwidth";
  }, [pathname]);

  const handleTabClick = (tab: TabType) => {
    if (tab === "cpe") {
      router.push("/performance-view/cpe-health");
    } else if (tab === "sla") {
      router.push("/performance-view/sla-health");
    } else {
      router.push("/performance-view/bandwidth-utilization");
    }
  };

  const [selectedSiteId, setSelectedSiteId] = useState<string>("west-mh03-mumbai");
  const [selectedCircuitName, setSelectedCircuitName] = useState<string>("TCL-INET1");
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("12h");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // CPE Table Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
  const [selectedRegionFilter, setSelectedRegionFilter] = useState("all");
  const [selectedCpeForDrawer, setSelectedCpeForDrawer] = useState<CpeInventoryItem | null>(null);

  // SLA Table Filters & Search
  const [slaSearchQuery, setSlaSearchQuery] = useState("");
  const [slaStatusFilter, setSlaStatusFilter] = useState("all");
  const [selectedSlaForDrawer, setSelectedSlaForDrawer] = useState<SlaServiceItem | null>(null);

  // Selected site & circuit for Bandwidth view
  const selectedSite: CarrierSite = useMemo(() => {
    return (
      CARRIER_SITES.find((s) => s.id === selectedSiteId) ||
      CARRIER_SITES[0]
    );
  }, [selectedSiteId]);

  const selectedCircuit: SiteCircuit = useMemo(() => {
    return (
      selectedSite.circuits.find((c) => c.name === selectedCircuitName) ||
      selectedSite.circuits[0]
    );
  }, [selectedSite, selectedCircuitName]);

  // Parse numeric CIR limit from configuredCIR (e.g., "6 Mbps" -> 6.0)
  const cirLimit = useMemo(() => {
    const raw = selectedCircuit?.configuredCIR || "6 Mbps";
    const num = Number.parseFloat(raw);
    return Number.isNaN(num) || num <= 0 ? 6.0 : num;
  }, [selectedCircuit]);

  // Handle Refresh simulation
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  // High-resolution 12-hour telemetry dataset matching the exact curve in user's image
  const telemetryData: TelemetryPoint[] = useMemo(() => {
    return [
      { time: "00:00", displayTime: "00:00", rx: 3.6, tx: 3.42 },
      { time: "01:00", displayTime: "01:00", rx: 4.35, tx: 3.12 },
      { time: "02:00", displayTime: "02:00", rx: 4.72, tx: 2.48 },
      { time: "03:00", displayTime: "03:00", rx: 4.3, tx: 1.88 },
      { time: "04:00", displayTime: "04:00", rx: 3.5, tx: 1.88 },
      { time: "06:00", displayTime: "06:00", rx: 2.7, tx: 2.5 },
      { time: "07:00", displayTime: "07:00", rx: 3.2, tx: 3.18 },
      { time: "08:00", displayTime: "08:00", rx: 2.85, tx: 3.46 },
      { time: "09:00", displayTime: "09:00", rx: 3.68, tx: 3.12 },
      { time: "10:00", displayTime: "10:00", rx: 4.42, tx: 2.44 },
      { time: "11:00", displayTime: "11:00", rx: 4.7, tx: 1.88 },
      { time: "11:45", displayTime: "11:45", rx: 4.22, tx: 1.88 },
    ];
  }, []);

  // Full 9 CPEs Dataset matching CARRIER_SITES and user screenshot
  const cpeInventoryList: CpeInventoryItem[] = useMemo(() => {
    return cpeInventoryData as CpeInventoryItem[];
  }, []);

  // Filtered CPE Inventory List
  const filteredCpeList = useMemo(() => {
    return cpeInventoryList.filter((item) => {
      const matchesSearch =
        searchQuery === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.deviceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.ipAddress.includes(searchQuery) ||
        item.associatedSite.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        selectedStatusFilter === "all" || item.status === selectedStatusFilter;

      const matchesRegion =
        selectedRegionFilter === "all" ||
        item.region.toLowerCase() === selectedRegionFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesRegion;
    });
  }, [cpeInventoryList, searchQuery, selectedStatusFilter, selectedRegionFilter]);

  // Aggregate Metrics for CPE Top Row Cards
  const totalCpes = cpeInventoryList.length; // 9
  const onlineCpes = cpeInventoryList.filter((c) => c.status === "online").length; // 6
  const warningCpes = cpeInventoryList.filter((c) => c.status === "warning").length; // 2
  const criticalCpes = 0; // 0
  const offlineCpes = cpeInventoryList.filter((c) => c.status === "offline").length; // 1

  // ─── SLA Service Inventory Dataset (Exact User Screenshot) ───
  const slaServiceList: SlaServiceItem[] = useMemo(() => {
    return [
      {
        serviceId: "091MUM34990A209835",
        siteName: "West-MH03-Mumbai",
        underlay: "TCL-INET1",
        slaTarget: "99.5%",
        actualAvailability: 99.98,
        avgLatency: "14.2 ms",
        avgJitter: "1.1 ms",
        packetLoss: "0.01%",
        slaStatus: "healthy",
        lastUpdated: "1 min ago",
      },
      {
        serviceId: "091MUM34990A209835",
        siteName: "West-MH03-Mumbai",
        underlay: "TCL-MPLS1",
        slaTarget: "99.5%",
        actualAvailability: 99.99,
        avgLatency: "8.5 ms",
        avgJitter: "0.8 ms",
        packetLoss: "0%",
        slaStatus: "healthy",
        lastUpdated: "1 min ago",
      },
      {
        serviceId: "091PUN34990A212236",
        siteName: "West-MH05-Pune",
        underlay: "TCL-INET1",
        slaTarget: "99.5%",
        actualAvailability: 99.95,
        avgLatency: "16.8 ms",
        avgJitter: "1.4 ms",
        packetLoss: "0.02%",
        slaStatus: "healthy",
        lastUpdated: "3 min ago",
      },
      {
        serviceId: "091NAG34990A209515",
        siteName: "West-MH07-Nagpur",
        underlay: "TCL-INET1",
        slaTarget: "99.5%",
        actualAvailability: 98.4,
        avgLatency: "82.4 ms",
        avgJitter: "9.6 ms",
        packetLoss: "2.4%",
        slaStatus: "warning",
        lastUpdated: "2 min ago",
      },
      {
        serviceId: "091NAS34990A212573",
        siteName: "West-MH09-Nashik",
        underlay: "TCL-INET1",
        slaTarget: "99.5%",
        actualAvailability: 99.88,
        avgLatency: "15.1 ms",
        avgJitter: "1.2 ms",
        packetLoss: "0.01%",
        slaStatus: "healthy",
        lastUpdated: "4 min ago",
      },
      {
        serviceId: "091AHM34990A224821",
        siteName: "West-GJ03-Ahmedabad",
        underlay: "TCL-MPLS1",
        slaTarget: "99.5%",
        actualAvailability: 99.92,
        avgLatency: "11.3 ms",
        avgJitter: "0.9 ms",
        packetLoss: "0%",
        slaStatus: "healthy",
        lastUpdated: "2 min ago",
      },
      {
        serviceId: "091VAD34990A215420",
        siteName: "West-GJ07-Vadodara",
        underlay: "TCL-INET1",
        slaTarget: "99.5%",
        actualAvailability: 97.9,
        avgLatency: "65.2 ms",
        avgJitter: "7.8 ms",
        packetLoss: "1.8%",
        slaStatus: "warning",
        lastUpdated: "1 min ago",
      },
      {
        serviceId: "091RAJ34990A213289",
        siteName: "West-GJ09-Rajkot",
        underlay: "TCL-INET1",
        slaTarget: "99.5%",
        actualAvailability: 92.4,
        avgLatency: "142.0 ms",
        avgJitter: "18.4 ms",
        packetLoss: "8.5%",
        slaStatus: "warning",
        lastUpdated: "5 min ago",
      },
      {
        serviceId: "091JAI34990A209845",
        siteName: "North-RJ03-Jaipur",
        underlay: "TCL-INET1",
        slaTarget: "99.5%",
        actualAvailability: 99.91,
        avgLatency: "18.2 ms",
        avgJitter: "1.5 ms",
        packetLoss: "0.02%",
        slaStatus: "healthy",
        lastUpdated: "1 min ago",
      },
    ];
  }, []);

  // Filtered SLA Service List
  const filteredSlaList = useMemo(() => {
    return slaServiceList.filter((item) => {
      const matchesSearch =
        slaSearchQuery === "" ||
        item.serviceId.toLowerCase().includes(slaSearchQuery.toLowerCase()) ||
        item.siteName.toLowerCase().includes(slaSearchQuery.toLowerCase()) ||
        item.underlay.toLowerCase().includes(slaSearchQuery.toLowerCase());

      const matchesStatus =
        slaStatusFilter === "all" || item.slaStatus === slaStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [slaServiceList, slaSearchQuery, slaStatusFilter]);

  // SVG Chart Dimensions for Bandwidth
  const svgWidth = 920;
  const svgHeight = 310;
  const paddingLeft = 85;
  const paddingRight = 30;
  const paddingTop = 36;
  const paddingBottom = 55;

  const chartAreaWidth = svgWidth - paddingLeft - paddingRight;
  const chartAreaHeight = svgHeight - paddingTop - paddingBottom;

  const getX = useCallback(
    (index: number) => {
      return paddingLeft + (index / (telemetryData.length - 1)) * chartAreaWidth;
    },
    [chartAreaWidth, telemetryData.length]
  );

  const getY = useCallback(
    (val: number) => {
      const clamped = Math.max(0, Math.min(cirLimit, val));
      return paddingTop + chartAreaHeight - (clamped / cirLimit) * chartAreaHeight;
    },
    [chartAreaHeight, cirLimit]
  );

  const rxPath = useMemo(() => {
    return telemetryData
      .map((pt, i) => `${i === 0 ? "M" : "L"} ${getX(i).toFixed(1)} ${getY(pt.rx).toFixed(1)}`)
      .join(" ");
  }, [telemetryData, getX, getY]);

  const txPath = useMemo(() => {
    return telemetryData
      .map((pt, i) => `${i === 0 ? "M" : "L"} ${getX(i).toFixed(1)} ${getY(pt.tx).toFixed(1)}`)
      .join(" ");
  }, [telemetryData, getX, getY]);

  const yTicks = [
    { label: `${cirLimit.toFixed(0)}M (100%)`, val: cirLimit, isLimit: true },
    { label: `${(cirLimit * 0.75).toFixed(1)}M (75%)`, val: cirLimit * 0.75, isLimit: false },
    { label: `${(cirLimit * 0.5).toFixed(1)}M (50%)`, val: cirLimit * 0.5, isLimit: false },
    { label: `${(cirLimit * 0.25).toFixed(1)}M (25%)`, val: cirLimit * 0.25, isLimit: false },
    { label: `0M`, val: 0, isLimit: false },
  ];

  const xTicks = [
    { label: "00:00", index: 0 },
    { label: "02:00", index: 2 },
    { label: "04:00", index: 4 },
    { label: "06:00", index: 5 },
    { label: "08:00", index: 7 },
    { label: "10:00", index: 9 },
    { label: "11:00", index: 10 },
  ];

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* ─── Top Header ─── */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Performance View
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Deep operational metrics, CPE resource telemetry, and carrier SLA compliance
        </p>
      </div>

      {/* ─── Tab Navigation Bar ─── */}
      <div className="flex items-center gap-8 border-b border-slate-200/80 dark:border-[#14233a] text-sm">
        <button
          type="button"
          onClick={() => handleTabClick("bandwidth")}
          className={`pb-3 font-semibold transition-all relative ${
            activeTab === "bandwidth"
              ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-500"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 border-b-2 border-transparent"
          }`}
        >
          Bandwidth Utilization
        </button>

        <button
          type="button"
          onClick={() => handleTabClick("cpe")}
          className={`pb-3 font-semibold transition-all relative ${
            activeTab === "cpe"
              ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-500"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 border-b-2 border-transparent"
          }`}
        >
          CPE Health
        </button>

        <button
          type="button"
          onClick={() => handleTabClick("sla")}
          className={`pb-3 font-semibold transition-all relative ${
            activeTab === "sla"
              ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-500"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 border-b-2 border-transparent"
          }`}
        >
          SLA Health
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════════
          TAB 1: BANDWIDTH UTILIZATION
      ══════════════════════════════════════════════════════════════════════════════ */}
      {activeTab === "bandwidth" && (
        <div className="space-y-4">
          {/* Filter Control Bar */}
          <div className="bg-white dark:bg-[#081220] rounded-2xl border border-slate-200/80 dark:border-[#14233a] p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              {/* Site Filter Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="bandwidth-site-filter"
                  className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase"
                >
                  SITE FILTER
                </label>
                <div className="relative">
                  <select
                    id="bandwidth-site-filter"
                    value={selectedSiteId}
                    onChange={(e) => {
                      setSelectedSiteId(e.target.value);
                      const newSite = CARRIER_SITES.find((s) => s.id === e.target.value);
                      if (newSite && newSite.circuits.length > 0) {
                        setSelectedCircuitName(newSite.circuits[0].name);
                      }
                    }}
                    className="appearance-none w-full sm:w-60 bg-white dark:bg-[#0b1728] border border-slate-200 dark:border-[#1e324d] rounded-xl px-3.5 py-2 pr-9 text-xs sm:text-sm font-semibold text-slate-800 dark:text-white shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                  >
                    {CARRIER_SITES.map((site) => (
                      <option key={site.id} value={site.id}>
                        {site.name} ({site.status.charAt(0).toUpperCase() + site.status.slice(1)})
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                </div>
              </div>

              {/* Device / Underlay Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="bandwidth-circuit-filter"
                  className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase"
                >
                  DEVICE / UNDERLAY
                </label>
                <div className="relative">
                  <select
                    id="bandwidth-circuit-filter"
                    value={selectedCircuitName}
                    onChange={(e) => setSelectedCircuitName(e.target.value)}
                    className="appearance-none w-full sm:w-64 bg-white dark:bg-[#0b1728] border border-slate-200 dark:border-[#1e324d] rounded-xl px-3.5 py-2 pr-9 text-xs sm:text-sm font-semibold text-slate-800 dark:text-white shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                  >
                    {selectedSite.circuits.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name} ({c.type.split(" ")[0]} {c.configuredCIR})
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                </div>
              </div>
            </div>

            {/* Right Side: Time Range & Refresh Button */}
            <div className="flex items-end sm:items-center gap-3 self-end md:self-auto">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="bandwidth-time-range"
                  className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase"
                >
                  TIME RANGE
                </label>
                <div className="relative">
                  <select
                    id="bandwidth-time-range"
                    value={selectedTimeRange}
                    onChange={(e) => setSelectedTimeRange(e.target.value)}
                    className="appearance-none bg-white dark:bg-[#0b1728] border border-slate-200 dark:border-[#1e324d] rounded-xl px-3.5 py-2 pr-9 text-xs sm:text-sm font-semibold text-slate-800 dark:text-white shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                  >
                    <option value="6h">Last 6 hours</option>
                    <option value="12h">Last 12 hours (Default)</option>
                    <option value="24h">Last 24 hours</option>
                    <option value="7d">Last 7 days</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleRefresh}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-[#1e324d] bg-white dark:bg-[#0c1a2d] hover:bg-slate-50 dark:hover:bg-[#12243e] text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs transition-all active:scale-95"
              >
                <RefreshCw
                  size={13}
                  className={`text-slate-500 ${isRefreshing ? "animate-spin text-blue-500" : ""}`}
                />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Summary / Status Info Bar Banner */}
          <div className="bg-blue-50/70 dark:bg-blue-950/25 border border-blue-100/90 dark:border-blue-900/40 rounded-xl px-4 py-2.5 flex items-center justify-between flex-wrap gap-2 text-xs sm:text-sm shadow-2xs">
            <div className="flex items-center gap-1.5 flex-wrap text-slate-700 dark:text-slate-300">
              <span className="font-bold text-slate-900 dark:text-white">
                {selectedSite.name}
              </span>
              <span className="text-slate-400 dark:text-slate-600">•</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {selectedCircuit.name}
              </span>
              <span className="text-slate-400 dark:text-slate-600">•</span>
              <span>
                Configured CIR:{" "}
                <strong className="font-bold text-slate-900 dark:text-white">
                  {selectedCircuit.configuredCIR}
                </strong>{" "}
                <span className="text-slate-400 dark:text-slate-500 text-xs font-normal">
                  (Percentage = Bandwidth / {selectedCircuit.configuredCIR} × 100)
                </span>
              </span>
            </div>

            {/* Online Traffic Flow Status Badge */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Online Traffic Flow</span>
            </span>
          </div>

          {/* Main Card: Bandwidth Telemetry Chart */}
          <div className="bg-white dark:bg-[#081220] rounded-2xl border border-slate-200/80 dark:border-[#14233a] p-5 sm:p-6 shadow-xs relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight">
                  Bandwidth Telemetry: Rx &amp; Tx vs {selectedCircuit.configuredCIR} Provisioned CIR
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  High-resolution time-series monitored over Last 12 hours
                </p>
              </div>

              <div className="flex items-center gap-5 text-xs select-none">
                <div className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
                  <span className="w-4 h-0.5 bg-blue-600 dark:bg-blue-500 inline-flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-500" />
                  </span>
                  <span>Rx (Receive)</span>
                </div>

                <div className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
                  <span className="w-4 h-0.5 bg-emerald-500 inline-flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </span>
                  <span>Tx (Transmit)</span>
                </div>

                <div className="flex items-center gap-1.5 font-medium text-rose-500/90 dark:text-rose-400/90">
                  <span className="w-4 border-b-2 border-dashed border-rose-400 dark:border-rose-500 inline-block" />
                  <span>{selectedCircuit.configuredCIR} CIR Limit</span>
                </div>
              </div>
            </div>

            {/* SVG Telemetry Canvas */}
            <div className="relative w-full overflow-x-auto">
              <svg
                role="img"
                aria-label="Bandwidth Telemetry Chart"
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-auto min-w-175 overflow-visible select-none"
                onMouseLeave={() => setHoveredPointIndex(null)}
              >
                <title>Bandwidth Telemetry Chart</title>
                {/* Horizontal Grid lines */}
                {yTicks.map((tick) => {
                  const yPos = getY(tick.val);
                  return (
                    <g key={tick.label}>
                      {tick.isLimit ? (
                        <line
                          x1={paddingLeft}
                          y1={yPos}
                          x2={svgWidth - paddingRight}
                          y2={yPos}
                          stroke="#f87171"
                          strokeDasharray="6 6"
                          strokeWidth="1.6"
                          className="opacity-90"
                        />
                      ) : (
                        <line
                          x1={paddingLeft}
                          y1={yPos}
                          x2={svgWidth - paddingRight}
                          y2={yPos}
                          stroke="rgba(226, 232, 240, 0.7)"
                          className="dark:stroke-[#15233b]"
                          strokeDasharray="4 4"
                          strokeWidth="1"
                        />
                      )}

                      <text
                        x={paddingLeft - 10}
                        y={yPos + 4}
                        textAnchor="end"
                        className={`text-[11px] font-mono select-none ${
                          tick.isLimit
                            ? "fill-rose-500 font-semibold"
                            : "fill-slate-400 dark:fill-slate-500"
                        }`}
                      >
                        {tick.label}
                      </text>
                    </g>
                  );
                })}

                {/* X-Axis Base Line */}
                <line
                  x1={paddingLeft}
                  y1={paddingTop + chartAreaHeight}
                  x2={svgWidth - paddingRight}
                  y2={paddingTop + chartAreaHeight}
                  stroke="rgba(226, 232, 240, 0.9)"
                  className="dark:stroke-[#1a2c47]"
                  strokeWidth="1"
                />

                {/* X-Axis Timestamp Labels */}
                {xTicks.map((tick) => {
                  const xPos = getX(tick.index);
                  return (
                    <text
                      key={tick.label}
                      x={xPos}
                      y={paddingTop + chartAreaHeight + 24}
                      textAnchor="middle"
                      className="text-[11px] font-mono fill-slate-400 dark:fill-slate-500 select-none"
                    >
                      {tick.label}
                    </text>
                  );
                })}

                {/* Rx Curve */}
                <path
                  d={rxPath}
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Tx Curve */}
                <path
                  d={txPath}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data Markers */}
                {telemetryData.map((pt, i) => {
                  const cx = getX(i);
                  const isHovered = hoveredPointIndex === i;
                  return (
                    <g key={`markers-${pt.time}`}>
                      <circle
                        cx={cx}
                        cy={getY(pt.rx)}
                        r={isHovered ? 5 : 3.2}
                        fill="#2563eb"
                        className="transition-all cursor-pointer"
                        stroke={isHovered ? "#ffffff" : "transparent"}
                        strokeWidth={isHovered ? 2 : 0}
                      />
                      <circle
                        cx={cx}
                        cy={getY(pt.tx)}
                        r={isHovered ? 5 : 3.2}
                        fill="#10b981"
                        className="transition-all cursor-pointer"
                        stroke={isHovered ? "#ffffff" : "transparent"}
                        strokeWidth={isHovered ? 2 : 0}
                      />
                    </g>
                  );
                })}

                {/* Hover Guideline */}
                {hoveredPointIndex !== null && (
                  <line
                    x1={getX(hoveredPointIndex)}
                    y1={paddingTop}
                    x2={getX(hoveredPointIndex)}
                    y2={paddingTop + chartAreaHeight}
                    stroke="rgba(59, 130, 246, 0.4)"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                )}

                {/* Hitboxes */}
                {telemetryData.map((pt, i) => {
                  const x = getX(i) - (chartAreaWidth / (telemetryData.length - 1)) / 2;
                  const w = chartAreaWidth / (telemetryData.length - 1);
                  return (
                    <rect
                      key={`hitbox-${pt.time}`}
                      x={Math.max(paddingLeft, x)}
                      y={paddingTop}
                      width={w}
                      height={chartAreaHeight + 30}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredPointIndex(i)}
                    />
                  );
                })}
              </svg>

              {/* Hover Tooltip Card */}
              {hoveredPointIndex !== null && (
                <div
                  style={{
                    left: `${Math.min(
                      svgWidth - 210,
                      Math.max(paddingLeft + 10, getX(hoveredPointIndex) - 95)
                    )}px`,
                    top: "40px",
                  }}
                  className="absolute z-20 pointer-events-none bg-slate-900/95 dark:bg-[#060c16]/95 backdrop-blur-md text-white border border-slate-700/80 dark:border-blue-500/40 rounded-xl p-3 shadow-2xl text-xs w-48 animate-fade-in"
                >
                  <div className="flex items-center justify-between border-b border-slate-700/60 pb-1.5 font-mono">
                    <span className="font-bold text-slate-200">
                      Time: {telemetryData[hoveredPointIndex].time}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/20 px-1.5 py-0.5 rounded">
                      NOMINAL
                    </span>
                  </div>

                  <div className="mt-2 space-y-1.5 font-mono text-[11px]">
                    <div className="flex items-center justify-between text-blue-300">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <span>Rx Receive:</span>
                      </span>
                      <span className="font-bold">
                        {telemetryData[hoveredPointIndex].rx.toFixed(2)} Mbps
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-emerald-300">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>Tx Transmit:</span>
                      </span>
                      <span className="font-bold">
                        {telemetryData[hoveredPointIndex].tx.toFixed(2)} Mbps
                      </span>
                    </div>

                    <div className="pt-1.5 border-t border-slate-700/60 flex items-center justify-between text-slate-400 text-[10px]">
                      <span>CIR Cap ({selectedCircuit.configuredCIR}):</span>
                      <span className="text-rose-400 font-bold">
                        {(
                          (telemetryData[hoveredPointIndex].rx / cirLimit) *
                          100
                        ).toFixed(1)}
                        % Peak
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════════
          TAB 2: CPE HEALTH VIEW
      ══════════════════════════════════════════════════════════════════════════════ */}
      {activeTab === "cpe" && (
        <div className="space-y-6 animate-fade-in">
          {/* Top Row: 5 Metric Counter Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            <div className="bg-white dark:bg-[#081220] rounded-2xl border border-slate-200/80 dark:border-[#14233a] p-4 sm:p-5 shadow-2xs">
              <span className="text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase block">
                TOTAL CPES
              </span>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1.5 font-mono">
                {totalCpes}
              </div>
            </div>

            <div className="bg-white dark:bg-[#081220] rounded-2xl border border-slate-200/80 dark:border-[#14233a] p-4 sm:p-5 shadow-2xs">
              <span className="text-[11px] font-bold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase block">
                ONLINE CPES
              </span>
              <div className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1.5 font-mono">
                {onlineCpes}
              </div>
            </div>

            <div className="bg-white dark:bg-[#081220] rounded-2xl border border-slate-200/80 dark:border-[#14233a] p-4 sm:p-5 shadow-2xs">
              <span className="text-[11px] font-bold tracking-wider text-amber-500 dark:text-amber-400 uppercase block">
                WARNING CPES
              </span>
              <div className="text-2xl sm:text-3xl font-bold text-amber-500 dark:text-amber-400 mt-1.5 font-mono">
                {warningCpes}
              </div>
            </div>

            <div className="bg-white dark:bg-[#081220] rounded-2xl border border-slate-200/80 dark:border-[#14233a] p-4 sm:p-5 shadow-2xs">
              <span className="text-[11px] font-bold tracking-wider text-rose-500 dark:text-rose-400 uppercase block">
                CRITICAL CPES
              </span>
              <div className="text-2xl sm:text-3xl font-bold text-rose-500 dark:text-rose-400 mt-1.5 font-mono">
                {criticalCpes}
              </div>
            </div>

            <div className="bg-white dark:bg-[#081220] rounded-2xl border border-slate-200/80 dark:border-[#14233a] p-4 sm:p-5 shadow-2xs">
              <span className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase block">
                OFFLINE CPES
              </span>
              <div className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 mt-1.5 font-mono">
                {offlineCpes}
              </div>
            </div>
          </div>

          {/* Middle Row: Donut Distribution & Historical Trend */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Donut Card */}
            <div className="lg:col-span-5 bg-white dark:bg-[#081220] rounded-2xl border border-slate-200/80 dark:border-[#14233a] p-6 shadow-2xs flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight">
                  CPE Status Distribution
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Proportion of customer premises hardware
                </p>

                <div className="flex items-center justify-center gap-8 py-5">
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg
                      role="img"
                      aria-label="Overall availability gauge chart"
                      viewBox="0 0 100 100"
                      className="w-full h-full -rotate-90"
                    >
                      <title>Overall availability gauge chart</title>
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#f1f5f9"
                        className="dark:stroke-[#14233a]"
                        strokeWidth="12"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#10b981"
                        strokeWidth="12"
                        strokeDasharray="159.2 238.8"
                        strokeDashoffset="0"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#f59e0b"
                        strokeWidth="12"
                        strokeDasharray="53.1 238.8"
                        strokeDashoffset="-159.2"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#f43f5e"
                        strokeWidth="12"
                        strokeDasharray="26.5 238.8"
                        strokeDashoffset="-212.3"
                      />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
                      <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none font-mono">
                        9
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">
                        CPES
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs font-medium">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span>Online: 6</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span>Warning: 2</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <span>Offline: 1</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-[#14233a] pt-3 text-[11px] text-slate-400 dark:text-slate-500">
                Healthy ratio: 77.8% Online
              </div>
            </div>

            {/* Trend Card */}
            <div className="lg:col-span-7 bg-white dark:bg-[#081220] rounded-2xl border border-slate-200/80 dark:border-[#14233a] p-6 shadow-2xs flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight">
                  CPE Status Trend (Last 12 Hours)
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Historical availability state fluctuations
                </p>

                <div className="py-6">
                  <svg
                    role="img"
                    aria-label="Fleet health trend curve"
                    viewBox="0 0 500 120"
                    className="w-full h-32 overflow-visible select-none"
                  >
                    <title>Fleet health trend curve</title>
                    <line x1="0" y1="20" x2="500" y2="20" stroke="rgba(241, 245, 249, 0.6)" className="dark:stroke-[#15233b]" strokeDasharray="4 4" strokeWidth="1" />
                    <line x1="0" y1="60" x2="500" y2="60" stroke="rgba(241, 245, 249, 0.6)" className="dark:stroke-[#15233b]" strokeDasharray="4 4" strokeWidth="1" />
                    <line x1="0" y1="100" x2="500" y2="100" stroke="rgba(241, 245, 249, 0.6)" className="dark:stroke-[#15233b]" strokeDasharray="4 4" strokeWidth="1" />

                    <path
                      d="M 0,38 C 120,34 220,40 320,48 C 390,52 440,36 500,32"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />

                    <path
                      d="M 0,92 C 100,90 200,88 300,86 C 400,84 450,86 500,90"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 dark:text-slate-500 pt-1">
                    <span>12h ago</span>
                    <span>8h ago</span>
                    <span>4h ago</span>
                    <span>Now</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-[#14233a] pt-3 flex items-center gap-6 text-xs font-medium">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Online CPEs Stable</span>
                </span>
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>2 Warning Devices Recovering</span>
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Table: CPE Inventory */}
          <div className="bg-white dark:bg-[#081220] rounded-2xl border border-slate-200/80 dark:border-[#14233a] p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight">
                  CPE Inventory &amp; Hardware Telemetry
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Select any row to inspect deep diagnostic drawer
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name, ID, IP..."
                    className="w-48 sm:w-56 bg-slate-50 dark:bg-[#0b1728] border border-slate-200 dark:border-[#1e324d] rounded-xl pl-9 pr-3.5 py-1.5 text-xs font-medium text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="relative">
                  <select
                    value={selectedStatusFilter}
                    onChange={(e) => setSelectedStatusFilter(e.target.value)}
                    className="appearance-none bg-slate-50 dark:bg-[#0b1728] border border-slate-200 dark:border-[#1e324d] rounded-xl px-3 py-1.5 pr-8 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="all">All Statuses</option>
                    <option value="online">Online</option>
                    <option value="warning">Warning</option>
                    <option value="offline">Offline</option>
                  </select>
                  <ChevronDown
                    size={13}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                </div>

                <div className="relative">
                  <select
                    value={selectedRegionFilter}
                    onChange={(e) => setSelectedRegionFilter(e.target.value)}
                    className="appearance-none bg-slate-50 dark:bg-[#0b1728] border border-slate-200 dark:border-[#1e324d] rounded-xl px-3 py-1.5 pr-8 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="all">All Regions</option>
                    <option value="maharashtra">Maharashtra</option>
                    <option value="gujarat">Gujarat</option>
                    <option value="rajasthan">Rajasthan</option>
                  </select>
                  <ChevronDown
                    size={13}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-[#14233a] text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-3">CPE NAME</th>
                    <th className="py-3 px-3">DEVICE ID</th>
                    <th className="py-3 px-3">ASSOCIATED SITE</th>
                    <th className="py-3 px-3">REGION</th>
                    <th className="py-3 px-3">IP ADDRESS</th>
                    <th className="py-3 px-3">UNDERLAY</th>
                    <th className="py-3 px-3">STATUS</th>
                    <th className="py-3 px-3">CPU</th>
                    <th className="py-3 px-3">MEMORY</th>
                    <th className="py-3 px-3">LAST SEEN</th>
                    <th className="py-3 px-3 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#14233a]">
                  {filteredCpeList.map((cpe) => (
                    <tr
                      key={cpe.deviceId}
                      onClick={() => setSelectedCpeForDrawer(cpe)}
                      className="hover:bg-slate-50/80 dark:hover:bg-[#0c1a2d]/60 cursor-pointer transition-colors group"
                    >
                      <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white font-mono">
                        {cpe.name}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-500 dark:text-slate-400">
                        {cpe.deviceId}
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                        {cpe.associatedSite}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300">
                        {cpe.region}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-blue-600 dark:text-blue-400 font-semibold">
                        {cpe.ipAddress}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        {cpe.underlay}
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${getCpeStatusBadgeClass(
                            cpe.status
                          )}`}
                        >
                          {cpe.status.charAt(0).toUpperCase() + cpe.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-mono font-medium text-slate-700 dark:text-slate-300">
                        <span className={cpe.cpu > 80 ? "text-rose-500 font-bold" : ""}>
                          {cpe.cpu}%
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-mono font-medium text-slate-700 dark:text-slate-300">
                        <span className={cpe.memory > 80 ? "text-amber-500 font-bold" : ""}>
                          {cpe.memory}%
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-[11px] text-slate-400 dark:text-slate-500">
                        {cpe.lastSeen}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCpeForDrawer(cpe);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 group-hover:translate-x-0.5 transition-transform"
                        >
                          <span>Drawer</span>
                          <span>&rarr;</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════════
          TAB 3: SLA HEALTH VIEW (PIXEL-PERFECT USER REFERENCE SCREENSHOT)
      ══════════════════════════════════════════════════════════════════════════════ */}
      {activeTab === "sla" && (
        <div className="space-y-6 animate-fade-in">
          {/* ─── Top Row: 5 Metric Cards ─── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {/* Card 1: OVERALL SLA COMPLIANCE */}
            <div className="bg-white dark:bg-[#081220] rounded-2xl border border-slate-200/80 dark:border-[#14233a] p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
              <span className="text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase block">
                OVERALL SLA COMPLIANCE
              </span>
              <div className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 my-1 font-mono">
                99.82%
              </div>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                Commitment: 99.50%
              </span>
            </div>

            {/* Card 2: AVERAGE LATENCY */}
            <div className="bg-white dark:bg-[#081220] rounded-2xl border border-slate-200/80 dark:border-[#14233a] p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
              <span className="text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase block">
                AVERAGE LATENCY
              </span>
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 my-1 font-mono">
                24.6 ms
              </div>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                Target: &lt; 50 ms
              </span>
            </div>

            {/* Card 3: AVERAGE JITTER */}
            <div className="bg-white dark:bg-[#081220] rounded-2xl border border-slate-200/80 dark:border-[#14233a] p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
              <span className="text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase block">
                AVERAGE JITTER
              </span>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white my-1 font-mono">
                1.8 ms
              </div>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                Target: &lt; 5 ms
              </span>
            </div>

            {/* Card 4: AVERAGE PACKET LOSS */}
            <div className="bg-white dark:bg-[#081220] rounded-2xl border border-slate-200/80 dark:border-[#14233a] p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
              <span className="text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase block">
                AVERAGE PACKET LOSS
              </span>
              <div className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 my-1 font-mono">
                0.04%
              </div>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                Target: &lt; 0.5%
              </span>
            </div>

            {/* Card 5: SERVICES AT RISK */}
            <div className="bg-white dark:bg-[#081220] rounded-2xl border border-slate-200/80 dark:border-[#14233a] p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
              <span className="text-[11px] font-bold tracking-wider text-rose-500 dark:text-rose-400 uppercase block">
                SERVICES AT RISK
              </span>
              <div className="text-2xl sm:text-3xl font-bold text-rose-500 dark:text-rose-400 my-1 font-mono">
                3
              </div>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                Breaching threshold
              </span>
            </div>
          </div>

          {/* ─── Middle Row: 3 Telemetry Chart Cards ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
            {/* Card 1: SLA Compliance Trend */}
            <div className="bg-white dark:bg-[#081220] rounded-2xl border border-slate-200/80 dark:border-[#14233a] p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight">
                  SLA Compliance Trend
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Target threshold reference at 99.5%
                </p>

                {/* SVG Curve */}
                <div className="py-6">
                  <svg
                    role="img"
                    aria-label="Target threshold curve"
                    viewBox="0 0 320 120"
                    className="w-full h-32 overflow-visible select-none"
                  >
                    <title>Target threshold curve</title>
                    {/* Target reference dashed line at 99.5% */}
                    <line
                      x1="0"
                      y1="75"
                      x2="320"
                      y2="75"
                      stroke="#f87171"
                      strokeDasharray="4 4"
                      strokeWidth="1.5"
                    />
                    <text
                      x="0"
                      y="68"
                      className="text-[10px] font-mono fill-rose-500 font-semibold"
                    >
                      Target: 99.5%
                    </text>

                    {/* Green Compliance Trend Line */}
                    <path
                      d="M 0,65 C 60,63 120,68 180,72 C 230,73 280,64 320,52"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>

                  {/* X-Axis Timestamps */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 dark:text-slate-500 pt-1">
                    <span>00:00</span>
                    <span>12:00</span>
                    <span>Now</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-slate-100 dark:border-[#14233a] pt-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Mean Compliance: 99.82% (Compliant)
              </div>
            </div>

            {/* Card 2: Latency (ms) & Jitter (ms) */}
            <div className="bg-white dark:bg-[#081220] rounded-2xl border border-slate-200/80 dark:border-[#14233a] p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight">
                  Latency (ms) &amp; Jitter (ms)
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  RTT latency vs variation jitter
                </p>

                {/* SVG Curves */}
                <div className="py-6">
                  <svg
                    role="img"
                    aria-label="Latency and jitter telemetry curve"
                    viewBox="0 0 320 120"
                    className="w-full h-32 overflow-visible select-none"
                  >
                    <title>Latency and jitter telemetry curve</title>
                    {/* Blue Latency Wave */}
                    <path
                      d="M 0,55 C 50,45 100,52 160,58 C 220,64 260,58 320,38"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />

                    {/* Purple/Violet Jitter Wave */}
                    <path
                      d="M 0,98 C 60,96 120,97 180,95 C 240,94 280,95 320,92"
                      fill="none"
                      stroke="#a855f7"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>

                  {/* X-Axis Timestamps */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 dark:text-slate-500 pt-1">
                    <span>00:00</span>
                    <span>12:00</span>
                    <span>Now</span>
                  </div>
                </div>
              </div>

              {/* Footer Legend */}
              <div className="border-t border-slate-100 dark:border-[#14233a] pt-3 flex items-center gap-5 text-xs font-medium">
                <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Latency: 24.6 ms</span>
                </span>
                <span className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span>Jitter: 1.8 ms</span>
                </span>
              </div>
            </div>

            {/* Card 3: Packet Loss Telemetry (%) */}
            <div className="bg-white dark:bg-[#081220] rounded-2xl border border-slate-200/80 dark:border-[#14233a] p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight">
                  Packet Loss Telemetry (%)
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Proportion of dropped network packets
                </p>

                {/* SVG Curve with distinct poll spike */}
                <div className="py-6">
                  <svg
                    role="img"
                    aria-label="Packet loss telemetry curve"
                    viewBox="0 0 320 120"
                    className="w-full h-32 overflow-visible select-none"
                  >
                    <title>Packet loss telemetry curve</title>
                    {/* Baseline Line with triangular spike at ~08:30 */}
                    <path
                      d="M 0,98 L 175,98 L 195,62 L 215,98 L 320,98"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  {/* X-Axis Timestamps */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 dark:text-slate-500 pt-1">
                    <span>00:00</span>
                    <span>12:00</span>
                    <span>Now</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-slate-100 dark:border-[#14233a] pt-3 text-xs text-slate-500 dark:text-slate-400">
                Peak Drop: 0.12% during 08:30 poll spike
              </div>
            </div>
          </div>

          {/* ─── Bottom Section: SLA Service Inventory Table ─── */}
          <div className="bg-white dark:bg-[#081220] rounded-2xl border border-slate-200/80 dark:border-[#14233a] p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight">
                  SLA Service Inventory
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Monitored carrier circuits with contractual availability commitments
                </p>
              </div>

              {/* Search & Filter */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={slaSearchQuery}
                    onChange={(e) => setSlaSearchQuery(e.target.value)}
                    placeholder="Search SLA service..."
                    className="w-48 sm:w-60 bg-slate-50 dark:bg-[#0b1728] border border-slate-200 dark:border-[#1e324d] rounded-xl pl-9 pr-3.5 py-1.5 text-xs font-medium text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="relative">
                  <select
                    value={slaStatusFilter}
                    onChange={(e) => setSlaStatusFilter(e.target.value)}
                    className="appearance-none bg-slate-50 dark:bg-[#0b1728] border border-slate-200 dark:border-[#1e324d] rounded-xl px-3 py-1.5 pr-8 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="all">All Statuses</option>
                    <option value="healthy">Healthy</option>
                    <option value="warning">Warning</option>
                    <option value="breached">Breached</option>
                  </select>
                  <ChevronDown
                    size={13}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-[#14233a] text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-3">SERVICE ID</th>
                    <th className="py-3 px-3">SITE NAME</th>
                    <th className="py-3 px-3">UNDERLAY</th>
                    <th className="py-3 px-3">SLA TARGET</th>
                    <th className="py-3 px-3">ACTUAL AVAILABILITY</th>
                    <th className="py-3 px-3">AVG LATENCY</th>
                    <th className="py-3 px-3">AVG JITTER</th>
                    <th className="py-3 px-3">PACKET LOSS</th>
                    <th className="py-3 px-3">SLA STATUS</th>
                    <th className="py-3 px-3 text-right">LAST UPDATED</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#14233a]">
                  {filteredSlaList.map((service, idx) => {
                    const isBelowTarget = service.actualAvailability < 99.5;
                    return (
                      <tr
                        key={`${service.serviceId}-${service.underlay}-${idx}`}
                        onClick={() => setSelectedSlaForDrawer(service)}
                        className="hover:bg-slate-50/80 dark:hover:bg-[#0c1a2d]/60 cursor-pointer transition-colors group"
                      >
                        {/* Service ID */}
                        <td className="py-3.5 px-3 font-mono font-bold text-slate-900 dark:text-white">
                          {service.serviceId}
                        </td>

                        {/* Site Name */}
                        <td className="py-3.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                          {service.siteName}
                        </td>

                        {/* Underlay */}
                        <td className="py-3.5 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                          {service.underlay}
                        </td>

                        {/* SLA Target */}
                        <td className="py-3.5 px-3 font-mono text-slate-500 dark:text-slate-400">
                          {service.slaTarget}
                        </td>

                        {/* Actual Availability */}
                        <td
                          className={`py-3.5 px-3 font-mono font-semibold ${
                            isBelowTarget
                              ? "text-rose-500 dark:text-rose-400"
                              : "text-emerald-600 dark:text-emerald-400"
                          }`}
                        >
                          {service.actualAvailability.toFixed(2)}%
                        </td>

                        {/* Avg Latency */}
                        <td className="py-3.5 px-3 font-mono text-slate-700 dark:text-slate-300">
                          {service.avgLatency}
                        </td>

                        {/* Avg Jitter */}
                        <td className="py-3.5 px-3 font-mono text-slate-700 dark:text-slate-300">
                          {service.avgJitter}
                        </td>

                        {/* Packet Loss */}
                        <td className="py-3.5 px-3 font-mono text-slate-700 dark:text-slate-300">
                          {service.packetLoss}
                        </td>

                        {/* SLA Status Badge */}
                        <td className="py-3.5 px-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${getSlaStatusBadgeClass(
                              service.slaStatus
                            )}`}
                          >
                            {service.slaStatus.charAt(0).toUpperCase() + service.slaStatus.slice(1)}
                          </span>
                        </td>

                        {/* Last Updated */}
                        <td className="py-3.5 px-3 font-mono text-[11px] text-slate-400 dark:text-slate-500 text-right">
                          {service.lastUpdated}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════════
          SLIDE-OVER SLA DIAGNOSTIC DRAWER
      ══════════════════════════════════════════════════════════════════════════════ */}
      {selectedSlaForDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-fade-in">
          <div
            className="w-full max-w-md bg-white dark:bg-[#07111e] border-l border-slate-200 dark:border-[#14233a] h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-slide-left p-6 space-y-6"
          >
            <div>
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-[#14233a] pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    SLA SERVICE AUDITOR
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5 font-mono">
                    {selectedSlaForDrawer.serviceId}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    {selectedSlaForDrawer.siteName} • {selectedSlaForDrawer.underlay}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedSlaForDrawer(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Status & Availability Gauge */}
              <div className="mt-5 p-4 rounded-xl bg-slate-50 dark:bg-[#0b1728] border border-slate-100 dark:border-[#162740] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    CONTRACT COMMITMENT
                  </span>
                  <span className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                    {selectedSlaForDrawer.slaTarget} Target
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    ACTUAL UPTIME
                  </span>
                  <span
                    className={`text-lg font-bold font-mono mt-0.5 block ${
                      selectedSlaForDrawer.actualAvailability < 99.5
                        ? "text-rose-500"
                        : "text-emerald-500"
                    }`}
                  >
                    {selectedSlaForDrawer.actualAvailability.toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* SLA Parameter Breakdown */}
              <div className="mt-6 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  CARRIER TELEMETRY SPECIFICATIONS
                </h4>
                <div className="divide-y divide-slate-100 dark:divide-[#14233a] text-xs">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-slate-400">Circuit Interface:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {selectedSlaForDrawer.underlay}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-slate-400">Round Trip Latency:</span>
                    <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">
                      {selectedSlaForDrawer.avgLatency} (Ceiling &lt; 50 ms)
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-slate-400">Jitter Variance:</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">
                      {selectedSlaForDrawer.avgJitter}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-slate-400">Packet Loss Rate:</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">
                      {selectedSlaForDrawer.packetLoss}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-slate-400">Last Telemetry Poll:</span>
                    <span className="font-mono text-slate-500">
                      {selectedSlaForDrawer.lastUpdated}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-[#14233a]">
              <button
                type="button"
                onClick={() => setSelectedSlaForDrawer(null)}
                className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-sm"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════════
          SLIDE-OVER DEEP DIAGNOSTIC DRAWER (CPE)
      ══════════════════════════════════════════════════════════════════════════════ */}
      {selectedCpeForDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-fade-in">
          <div
            className="w-full max-w-md bg-white dark:bg-[#07111e] border-l border-slate-200 dark:border-[#14233a] h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-slide-left p-6 space-y-6"
          >
            <div>
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-[#14233a] pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    CPE DIAGNOSTIC INSPECTOR
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5 font-mono">
                    {selectedCpeForDrawer.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    ID: {selectedCpeForDrawer.deviceId} • {selectedCpeForDrawer.associatedSite}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedCpeForDrawer(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-5 p-4 rounded-xl bg-slate-50 dark:bg-[#0b1728] border border-slate-100 dark:border-[#162740] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    CURRENT STATE
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1 ${getCpeStatusBadgeClass(
                      selectedCpeForDrawer.status
                    )}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${getCpeStatusDotClass(
                        selectedCpeForDrawer.status
                      )}`}
                    />
                    {selectedCpeForDrawer.status.toUpperCase()}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    LAST HEARTBEAT
                  </span>
                  <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1 block">
                    {selectedCpeForDrawer.lastSeen}
                  </span>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  REAL-TIME TELEMETRY GAUGES
                </h4>

                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="text-slate-500 dark:text-slate-400">CPU LOAD</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {selectedCpeForDrawer.cpu}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${getCpuProgressColor(
                        selectedCpeForDrawer.cpu
                      )}`}
                      style={{ width: `${selectedCpeForDrawer.cpu}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="text-slate-500 dark:text-slate-400">RAM USAGE</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {selectedCpeForDrawer.memory}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        selectedCpeForDrawer.memory > 80
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${selectedCpeForDrawer.memory}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  HARDWARE METRICS
                </h4>
                <div className="divide-y divide-slate-100 dark:divide-[#14233a] text-xs">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-slate-400">Hardware Model:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {selectedCpeForDrawer.model}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-slate-400">IP Interface:</span>
                    <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">
                      {selectedCpeForDrawer.ipAddress}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-slate-400">Circuit Termination:</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">
                      {selectedCpeForDrawer.underlay}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-slate-400">Operating Temperature:</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">
                      {selectedCpeForDrawer.temperature}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-[#14233a]">
              <button
                type="button"
                onClick={() => setSelectedCpeForDrawer(null)}
                className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-sm"
              >
                Close Diagnostic View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
