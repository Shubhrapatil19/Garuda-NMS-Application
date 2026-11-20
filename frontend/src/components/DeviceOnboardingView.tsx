"use client";

import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Upload,
  Download,
  Plus,
  Search,
  Server,
  ShieldAlert,
  ShieldCheck,
  Activity,
  Trash2,
  X,
  FileSpreadsheet,
  Check,
  ChevronRight,
  ChevronDown,
  Loader2,
  LayoutGrid,
  List, 
} from "lucide-react";
import { toast } from "sonner";
import OverviewCards from "./OverviewCards";
import dbData from "../../data/db.json";

export interface NetworkDevice {
  id: string;
  name: string;
  hostname: string;
  ip: string;
  port: number;
  vendor: string;
  model: string;
  type: string;
  site: string;
  status: "online" | "warning" | "offline" | "maintenance";
  protocol: string;
  uptime: string;
  latency: string;
  lastSeen: string;
  serialNumber: string;
}

interface DeviceOnboardingViewProps {
  onBackToDashboard?: () => void;
  className?: string;
}

const VENDORS = [
  { id: "Cisco", code: "CI", name: "Cisco", defaultModel: "Catalyst 8300" },
  { id: "Fortinet", code: "FO", name: "Fortinet", defaultModel: "FortiGate 600E" },
  { id: "Juniper", code: "JU", name: "Juniper", defaultModel: "MX960" },
  { id: "Meraki", code: "ME", name: "Meraki", defaultModel: "MX250" },
  { id: "Other", code: "OT", name: "Other", defaultModel: "Gen-3 Enterprise" },
];

const DEFAULT_NEW_DEVICE = {
  name: "DEL-EDGE-NEW-001",
  alias: "",
  description: "Primary enterprise edge device",
  ip: "10.20.4.61",
  group: "IZOSDWANPRIME",
  vendor: "Fortinet",
  model: "FortiGate 600E",
  type: "Edge Router",
  site: "Delhi PoP",
  snmpCapable: true,
  snmpVersion: "v2c",
  port: "161",
  readCommunity: "••••••••••",
  writeCommunity: "••••••••••",
  testOid: ".1.3.6.1.2.1.1.1.0",
  protocol: "SNMP v2c",
  pollingInterval: "60s",
  snmpUser: "garuda_agent",
  authProto: "SHA-256",
  authKey: "GarudaAuthSecure2026",
  privProto: "AES-128",
  privKey: "GarudaPrivSecure2026",
  cpuThreshold: "80%",
  memThreshold: "85%",
  latencyThreshold: "50 ms",
  polledBy: "AUTO (Nearest Node)",
  pollingFrequency: "5 minutes / 300s",
  prefer64BitCounters: true,
  ipInterfaceCorrelation: true,
  autoDiscoverTraps: true,
  enableConcurrentPolling: true,
  enableInterfaceDiscovery: true,
  enableBgpDiscovery: true,
  enableSensors: true,
  serialNumber: "FG600ETK190-DEL",
};

export const DeviceOnboardingView: React.FC<DeviceOnboardingViewProps> = ({
  onBackToDashboard,
  className = "",
}) => {
  // Initial device list from dbData or defaults
  const [devices, setDevices] = useState<NetworkDevice[]>(() => {
    return (
      ((dbData as any).devices as NetworkDevice[]) || [
        {
          id: "dev-01",
          name: "Core-Router-01",
          hostname: "cr01.blr.garuda.io",
          ip: "10.24.1.1",
          port: 161,
          vendor: "Cisco",
          model: "ASR 9010",
          type: "Core Router",
          site: "Bengaluru Hub",
          status: "online",
          protocol: "SNMP v3",
          uptime: "99.98%",
          latency: "12 ms",
          lastSeen: "Just now",
          serialNumber: "FOC2419L23X",
        },
        {
          id: "dev-02",
          name: "Core-Router-02",
          hostname: "cr02.bom.garuda.io",
          ip: "10.24.2.1",
          port: 161,
          vendor: "Juniper",
          model: "MX960",
          type: "Core Router",
          site: "Mumbai DC",
          status: "online",
          protocol: "gNMI",
          uptime: "99.95%",
          latency: "16 ms",
          lastSeen: "Just now",
          serialNumber: "JN1188392AF",
        },
        {
          id: "dev-03",
          name: "Core-Router-03",
          hostname: "cr03.del.garuda.io",
          ip: "10.24.3.1",
          port: 161,
          vendor: "Cisco",
          model: "ASR 9904",
          type: "Core Router",
          site: "Delhi PoP",
          status: "offline",
          protocol: "SNMP v3",
          uptime: "94.20%",
          latency: "--",
          lastSeen: "2 min ago",
          serialNumber: "FOC2441M11B",
        },
        {
          id: "dev-04",
          name: "Firewall-01",
          hostname: "fw01.blr.garuda.io",
          ip: "10.24.1.254",
          port: 443,
          vendor: "Fortinet",
          model: "FortiGate 600E",
          type: "Firewall",
          site: "Bengaluru Hub",
          status: "warning",
          protocol: "API",
          uptime: "98.70%",
          latency: "28 ms",
          lastSeen: "5 min ago",
          serialNumber: "FG600ETK190",
        },
        {
          id: "dev-05",
          name: "Switch-14",
          hostname: "sw14.maa.garuda.io",
          ip: "10.24.4.14",
          port: 161,
          vendor: "Arista",
          model: "7280R3",
          type: "L3 Switch",
          site: "Chennai Edge",
          status: "warning",
          protocol: "SNMP v2c",
          uptime: "97.40%",
          latency: "42 ms",
          lastSeen: "12 min ago",
          serialNumber: "SSB20491029",
        },
        {
          id: "dev-06",
          name: "Router-22",
          hostname: "rt22.sin.garuda.io",
          ip: "10.24.5.22",
          port: 161,
          vendor: "Cisco",
          model: "Catalyst 8300",
          type: "Edge Router",
          site: "Singapore DC",
          status: "online",
          protocol: "Syslog",
          uptime: "100.0%",
          latency: "38 ms",
          lastSeen: "Just now",
          serialNumber: "FOC2601K44E",
        },
        {
          id: "dev-07",
          name: "CPE-Gateway-08",
          hostname: "cpe08.jkt.garuda.io",
          ip: "10.24.6.8",
          port: 8728,
          vendor: "MikroTik",
          model: "CCR2004-16G",
          type: "CPE Gateway",
          site: "Jakarta Hub",
          status: "online",
          protocol: "API",
          uptime: "99.91%",
          latency: "45 ms",
          lastSeen: "Just now",
          serialNumber: "HE908721BC4",
        },
        {
          id: "dev-08",
          name: "Edge-Switch-02",
          hostname: "esw02.dxb.garuda.io",
          ip: "10.24.7.2",
          port: 161,
          vendor: "Cisco",
          model: "Catalyst 9300",
          type: "Access Switch",
          site: "Dubai Hub",
          status: "maintenance",
          protocol: "SNMP v3",
          uptime: "96.50%",
          latency: "--",
          lastSeen: "1 hr ago",
          serialNumber: "FOC2219J78A",
        },
      ]
    );
  });

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [vendorFilter, setVendorFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Modal States with Smooth Enter/Exit Lifecycle
  const [mounted, setMounted] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddModalRendered, setIsAddModalRendered] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isImportModalRendered, setIsImportModalRendered] = useState(false);
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);

  const [testingPingId, setTestingPingId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Wizard Step State for Add Device (1: Identity, 2: Protocol, 3: Discovery, 4: Test & Save)
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);
  const [slideDirection, setSlideDirection] = useState<"forward" | "backward">("forward");

  const changeStep = (targetStep: 1 | 2 | 3 | 4) => {
    setSlideDirection(targetStep >= wizardStep ? "forward" : "backward");
    setWizardStep(targetStep);
  };

  // Diagnostic Test States for Step 4
  const [isDiagnosticRunning, setIsDiagnosticRunning] = useState(false);
  const [diagnosticCompleted, setDiagnosticCompleted] = useState(false);
  const [diagnosticLogs, setDiagnosticLogs] = useState<string[]>([]);

  // New Device Form State initialized to match Figma design
  const [newDevice, setNewDevice] = useState(DEFAULT_NEW_DEVICE);

  const openAddDeviceModal = () => {
    setSlideDirection("forward");
    setWizardStep(1);
    setIsDiagnosticRunning(false);
    setDiagnosticCompleted(false);
    setDiagnosticLogs([]);
    setNewDevice(DEFAULT_NEW_DEVICE);
    setIsAddModalOpen(true);
    setIsAddModalRendered(true);
    setTimeout(() => {
      setIsAddModalVisible(true);
    }, 25);
  };

  const closeAddModal = useCallback(() => {
    setIsAddModalVisible(false);
    setTimeout(() => {
      setIsAddModalOpen(false);
      setIsAddModalRendered(false);
    }, 280);
  }, []);

  const openImportModal = () => {
    setIsImportModalOpen(true);
    setIsImportModalRendered(true);
    setTimeout(() => {
      setIsImportModalVisible(true);
    }, 25);
  };

  const closeImportModal = useCallback(() => {
    setIsImportModalVisible(false);
    setTimeout(() => {
      setIsImportModalOpen(false);
      setIsImportModalRendered(false);
    }, 280);
  }, []);

  // Prevent background scrolling when modals are open
  useEffect(() => {
    if (isAddModalRendered || isImportModalRendered) {
      const originalBodyOverflow = document.body.style.overflow;
      const viewport = document.querySelector(".dashboard-viewport") as HTMLElement | null;
      const originalViewportOverflow = viewport ? viewport.style.overflow : "";

      document.body.style.overflow = "hidden";
      if (viewport) {
        viewport.style.overflow = "hidden";
      }

      return () => {
        document.body.style.overflow = originalBodyOverflow;
        if (viewport) {
          viewport.style.overflow = originalViewportOverflow;
        }
      };
    }
  }, [isAddModalRendered, isImportModalRendered]);

  // Close modals on Escape key press with smooth exit animation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isAddModalVisible) closeAddModal();
        if (isImportModalVisible) closeImportModal();
      }
    };
    if (isAddModalRendered || isImportModalRendered) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAddModalRendered, isImportModalRendered, isAddModalVisible, isImportModalVisible, closeAddModal, closeImportModal]);

  // Filtered devices list
  const filteredDevices = useMemo(() => {
    return devices.filter((d) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.hostname.toLowerCase().includes(q) ||
        d.ip.toLowerCase().includes(q) ||
        d.vendor.toLowerCase().includes(q) ||
        d.site.toLowerCase().includes(q) ||
        d.serialNumber.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "all" || d.status === statusFilter;
      const matchesVendor =
        vendorFilter === "all" || d.vendor.toLowerCase() === vendorFilter.toLowerCase();
      const matchesType =
        typeFilter === "all" || d.type.toLowerCase() === typeFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesVendor && matchesType;
    });
  }, [devices, searchQuery, statusFilter, vendorFilter, typeFilter]);

  // Status Metrics
  const metrics = useMemo(() => {
    const total = devices.length;
    const online = devices.filter((d) => d.status === "online").length;
    const warning = devices.filter((d) => d.status === "warning").length;
    const offline = devices.filter((d) => d.status === "offline").length;
    const maintenance = devices.filter((d) => d.status === "maintenance").length;
    return { total, online, warning, offline, maintenance };
  }, [devices]);

  // Diagnostic Pre-Flight Test simulation
  const runDiagnosticTest = () => {
    setIsDiagnosticRunning(true);
    setTimeout(() => {
      setIsDiagnosticRunning(false);
      setDiagnosticCompleted(true);
      toast.success("Pre-flight checks passed", {
        description: `Successfully reached ${newDevice.ip} via ${newDevice.protocol}.`,
      });
    }, 700);
  };

  // Handle Save & Provision Final Device
  const handleSaveAndProvision = () => {
    if (!newDevice.name.trim() || !newDevice.ip.trim()) {
      toast.error("Validation error", {
        description: "Device Name and Management IP are required.",
      });
      return;
    }

    const created: NetworkDevice = {
      id: `dev-${Date.now().toString().slice(-4)}`,
      name: newDevice.name.trim(),
      hostname: `${newDevice.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.garuda.io`,
      ip: newDevice.ip.trim(),
      port: Number.parseInt(newDevice.port) || 161,
      vendor: newDevice.vendor,
      model: newDevice.model.trim() || "Gen-3 Enterprise",
      type: newDevice.type,
      site: newDevice.site,
      status: "online",
      protocol: newDevice.protocol,
      uptime: "100.0%",
      latency: `${Math.floor(8 + Math.random() * 16)} ms`,
      lastSeen: "Just now",
      serialNumber:
        newDevice.serialNumber.trim() ||
        `GAR-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
    };

    setDevices((prev) => [created, ...prev]);
    closeAddModal();
    toast.success("Device Onboarded Successfully", {
      description: `${created.name} (${created.ip}) registered in ${created.site}.`,
    });
  };

  // Handle Test Ping Connection
  const handlePingTest = (device: NetworkDevice) => {
    setTestingPingId(device.id);
    setTimeout(() => {
      setTestingPingId(null);
      if (device.status === "offline") {
        toast.error("ICMP Ping Timeout", {
          description: `No response from ${device.ip} (Destination unreachable).`,
        });
      } else {
        toast.success("Ping Response Confirmed", {
          description: `Echo reply from ${device.ip} in ${device.latency || "14ms"} (0% packet loss).`,
        });
      }
    }, 600);
  };

  // Handle Export CSV
  const handleExportCSV = () => {
    const headers = [
      "Device Name",
      "Hostname",
      "IP Address",
      "Port",
      "Vendor",
      "Model",
      "Type",
      "Site",
      "Status",
      "Protocol",
      "Uptime",
      "Latency",
      "Serial Number",
    ];

    const rows = filteredDevices.map((d) => [
      `"${d.name}"`,
      `"${d.hostname}"`,
      `"${d.ip}"`,
      d.port,
      `"${d.vendor}"`,
      `"${d.model}"`,
      `"${d.type}"`,
      `"${d.site}"`,
      `"${d.status}"`,
      `"${d.protocol}"`,
      `"${d.uptime}"`,
      `"${d.latency}"`,
      `"${d.serialNumber}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `garuda_network_inventory_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("CSV Export Generated", {
      description: `Exported ${filteredDevices.length} devices to CSV.`,
    });
  };

  // Handle Delete Device
  const handleDeleteDevice = (id: string, name: string) => {
    setDevices((prev) => prev.filter((d) => d.id !== id));
    toast.info("Device Decommissioned", {
      description: `${name} has been removed from inventory.`,
    });
  };

  // File Upload Ref for Import
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length <= 1) {
          toast.error("Empty CSV file", {
            description: "Please provide a valid CSV containing device entries.",
          });
          return;
        }

        // Simple mock parse or import
        const mockImported: NetworkDevice = {
          id: `dev-${Date.now().toString().slice(-4)}`,
          name: "Imported-Edge-Switch",
          hostname: "sw-import.blr.garuda.io",
          ip: "10.24.9.11",
          port: 161,
          vendor: "Arista",
          model: "7050SX3",
          type: "L3 Switch",
          site: "Bengaluru Hub",
          status: "online",
          protocol: "SNMP v3",
          uptime: "100.0%",
          latency: "14 ms",
          lastSeen: "Just now",
          serialNumber: `IMP-${Date.now().toString().slice(-6)}`,
        };

        setDevices((prev) => [mockImported, ...prev]);
        closeImportModal();
        toast.success("CSV Import Completed", {
          description: `Successfully parsed and onboarded ${lines.length - 1} records from ${file.name}.`,
        });
      } catch {
        toast.error("Failed to parse CSV file");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className={`w-full space-y-6 ${className}`}>
      {/* ─── Top Section Header (Identical structure to Network Operations Overview) ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Network Devices &amp; CPE Inventory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage, monitor, and configure all multi-OEM network devices
          </p>
        </div>

        {/* Action Buttons & Status Pill */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={openImportModal}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#081220] hover:bg-slate-50 dark:hover:bg-[#0e1b2f] border border-slate-200/90 dark:border-[#14233a] shadow-2xs transition-all cursor-pointer active:scale-[0.98]"
          >
            <Upload className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Import CSV</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#081220] hover:bg-slate-50 dark:hover:bg-[#0e1b2f] border border-slate-200/90 dark:border-[#14233a] shadow-2xs transition-all cursor-pointer active:scale-[0.98]"
          >
            <Download className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={openAddDeviceModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all cursor-pointer active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-3" />
            <span>Add Device</span>
          </button>
        </div>
      </div>

      {/* ─── 4 KPI Cards Grid (Modular Reusable Component) ─── */}
      <OverviewCards
        showHeader={false}
        enableCountUp={false}
        total={metrics.total}
        online={metrics.online}
        offline={metrics.offline}
        alerts={metrics.warning}
        activeCard={
          statusFilter === "online"
            ? "online"
            : statusFilter === "offline"
            ? "offline"
            : undefined
        }
        onCardClick={(cardId) => {
          if (cardId === "online-devices") {
            setStatusFilter((prev) => (prev === "online" ? "all" : "online"));
          } else if (cardId === "offline-devices") {
            setStatusFilter((prev) => (prev === "offline" ? "all" : "offline"));
          } else if (cardId === "total-devices") {
            setStatusFilter("all");
          }
        }}
      />

      {/* ─── Device Inventory Master Card (Search, Filters & Data Presentation) ─── */}
      <div className="bg-white dark:bg-[#081220] rounded-2xl border border-slate-200/80 dark:border-[#14233a] shadow-xs overflow-hidden">
        {/* Toolbar: Search, Filters & View Toggle */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-[#14233a] flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-[#081220]">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by device name, IP, serial, site..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#050b14] border border-slate-200 dark:border-[#162740] rounded-xl pl-10 pr-3.5 py-2 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 dark:bg-[#050b14] border border-slate-200 dark:border-[#162740] rounded-xl px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="online">Online</option>
              <option value="warning">Warning</option>
              <option value="offline">Offline</option>
              <option value="maintenance">Maintenance</option>
            </select>

            {/* Vendor Filter */}
            <select
              value={vendorFilter}
              onChange={(e) => setVendorFilter(e.target.value)}
              className="bg-slate-50 dark:bg-[#050b14] border border-slate-200 dark:border-[#162740] rounded-xl px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All Vendors</option>
              <option value="cisco">Cisco</option>
              <option value="juniper">Juniper</option>
              <option value="arista">Arista</option>
              <option value="fortinet">Fortinet</option>
              <option value="mikrotik">MikroTik</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-50 dark:bg-[#050b14] border border-slate-200 dark:border-[#162740] rounded-xl px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="core router">Core Router</option>
              <option value="edge router">Edge Router</option>
              <option value="l3 switch">L3 Switch</option>
              <option value="firewall">Firewall</option>
              <option value="cpe gateway">CPE Gateway</option>
              <option value="access switch">Access Switch</option>
            </select>

            {/* View Toggle */}
            <div className="border border-slate-200 dark:border-[#162740] rounded-xl flex items-center p-0.5 bg-slate-50 dark:bg-[#050b14]">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === "table"
                    ? "bg-white dark:bg-[#0e1b2f] text-blue-600 dark:text-blue-400 shadow-2xs font-bold"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                }`}
                title="Table view"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-[#0e1b2f] text-blue-600 dark:text-blue-400 shadow-2xs font-bold"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                }`}
                title="Grid cards view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ─── Device Inventory Presentation ─── */}
        {viewMode === "table" ? (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 dark:bg-[#050b14] border-b border-slate-200/80 dark:border-[#14233a] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider select-none">
                  <tr>
                    <th className="px-5 py-3.5">Device / Hostname</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">IP &amp; Port</th>
                    <th className="px-4 py-3.5">Vendor &amp; Model</th>
                    <th className="px-4 py-3.5">Site / Region</th>
                    <th className="px-4 py-3.5">Telemetry Protocol</th>
                    <th className="px-4 py-3.5">Latency</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#14233a]">
                  {filteredDevices.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                        <Server className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                          No devices match your search or filter
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Try resetting filters or click &quot;Add Device&quot; to register a new node.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredDevices.map((device) => {
                      const isTesting = testingPingId === device.id;
                      return (
                        <tr
                          key={device.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-[#0c182a]/70 transition-colors group"
                        >
                          {/* Device & Hostname */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#0e1b2f] border border-slate-200 dark:border-[#162740] flex items-center justify-center shrink-0">
                                <Server className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                              </div>
                              <div className="min-w-0">
                                <span className="font-bold text-slate-900 dark:text-white block truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                  {device.name}
                                </span>
                                <span className="text-[11px] text-slate-400 font-mono block truncate">
                                  {device.hostname}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Status Badge */}
                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold select-none ${
                                device.status === "online"
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-500/30"
                                  : device.status === "warning"
                                  ? "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 border border-amber-200/80 dark:border-amber-500/30"
                                  : device.status === "offline"
                                  ? "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400 border border-rose-200/80 dark:border-rose-500/30"
                                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  device.status === "online"
                                    ? "bg-emerald-500 animate-pulse"
                                    : device.status === "warning"
                                    ? "bg-amber-500"
                                    : device.status === "offline"
                                    ? "bg-rose-500"
                                    : "bg-slate-400"
                                }`}
                              />
                              {device.status.charAt(0).toUpperCase() + device.status.slice(1)}
                            </span>
                          </td>

                          {/* IP & Port */}
                          <td className="px-4 py-3.5 font-mono text-slate-700 dark:text-slate-300">
                            <span>{device.ip}</span>
                            <span className="text-slate-400 text-[10px] ml-1">
                              :{device.port}
                            </span>
                          </td>

                          {/* Vendor & Model */}
                          <td className="px-4 py-3.5">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                              {device.vendor}
                            </span>
                            <span className="text-slate-400 text-[11px] block">
                              {device.model} ({device.type})
                            </span>
                          </td>

                          {/* Site */}
                          <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300">
                            {device.site}
                          </td>

                          {/* Protocol */}
                          <td className="px-4 py-3.5">
                            <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#0e1b2f] text-slate-600 dark:text-slate-300 font-mono text-[10px] font-semibold border border-slate-200/60 dark:border-[#162740]">
                              {device.protocol}
                            </span>
                          </td>

                          {/* Latency */}
                          <td className="px-4 py-3.5">
                            <span
                              className={`font-mono text-xs font-semibold ${
                                device.status === "offline"
                                  ? "text-slate-400"
                                  : "text-emerald-600 dark:text-emerald-400"
                              }`}
                            >
                              {device.latency}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-3.5 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handlePingTest(device)}
                                disabled={isTesting}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200/70 dark:border-blue-900/60 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors cursor-pointer flex items-center gap-1"
                                title="Test ICMP ping reachability"
                              >
                                <Activity
                                  className={`w-3 h-3 ${isTesting ? "animate-spin" : ""}`}
                                />
                                <span>{isTesting ? "Pinging..." : "Ping"}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteDevice(device.id, device.name)}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                                title="Decommission device"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer Summary */}
            <div className="bg-slate-50 dark:bg-[#050b14] border-t border-slate-200/80 dark:border-[#14233a] px-5 py-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 select-none">
              <span>
                Showing {filteredDevices.length} of {devices.length} network devices
              </span>
              <span>Garuda Telemetry Agent: v2.6.4</span>
            </div>
          </div>
        ) : (
          /* Grid Card View */
          <div className="p-5 sm:p-6 bg-slate-50/50 dark:bg-[#050b14]/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDevices.map((device) => {
                const isTesting = testingPingId === device.id;
                return (
                  <div
                    key={device.id}
                    className="bg-white dark:bg-[#081220] rounded-2xl border border-slate-200/80 dark:border-[#14233a] p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#0e1b2f] border border-slate-200 dark:border-[#162740] flex items-center justify-center">
                            <Server className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                              {device.name}
                            </h4>
                            <span className="text-xs text-slate-400 font-mono">
                              {device.ip}:{device.port}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            device.status === "online"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30"
                              : device.status === "warning"
                              ? "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30"
                              : device.status === "offline"
                              ? "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {device.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-[#14233a] pt-3">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Vendor / Model:</span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {device.vendor} {device.model}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Site / Region:</span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {device.site}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Protocol:</span>
                          <span className="font-mono text-slate-800 dark:text-slate-200">
                            {device.protocol}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Latency:</span>
                          <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                            {device.latency}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 dark:border-[#14233a] pt-3 mt-4 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-mono">
                        SN: {device.serialNumber}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handlePingTest(device)}
                          disabled={isTesting}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                        >
                          {isTesting ? "Testing..." : "Test Ping"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDevice(device.id, device.name)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════
          ADD DEVICE MODAL / WIZARD (Adaptive Light & Dark Theme)
          ════════════════════════════════════════════════════ */}
      {mounted && isAddModalRendered && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 select-none overflow-hidden"
        >
          {/* Animated Backdrop */}
          <div
            onClick={closeAddModal}
            className={`fixed inset-0 bg-slate-950/65 dark:bg-black/80 transition-all duration-300 ease-out cursor-pointer ${
              isAddModalVisible
                ? "opacity-100 backdrop-blur-md"
                : "opacity-0 backdrop-blur-none"
            }`}
          />

          {/* Animated Modal Card with Consistent 660px Height */}
          <div
            onClick={(e) => e.stopPropagation()}
            className={`relative bg-white dark:bg-[#081220] border border-slate-200/90 dark:border-[#14233a] rounded-2xl shadow-2xl w-full max-w-3xl h-165 max-h-[90vh] flex flex-col justify-between overflow-hidden text-slate-900 dark:text-slate-100 z-10 transition-all duration-300 ease-out transform ${
              isAddModalVisible
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 translate-y-4"
            }`}
          >
            {/* Modal Header */}
            <div className="px-6 pt-5 sm:pt-6 pb-3 flex items-start justify-between shrink-0">
              <div>
                <span className="text-[11px] font-bold text-blue-600 dark:text-sky-400 uppercase tracking-widest block mb-1">
                  DEVICE ONBOARDING
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Add a new network device
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Configure identity, polling, and discovery settings.
                </p>
              </div>
              <button
                type="button"
                onClick={closeAddModal}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Navigation with Connected Track Lines */}
            <div className="px-6 py-3 border-y border-slate-100 dark:border-[#14233a] bg-slate-50/60 dark:bg-[#060e1a]/60 flex items-center justify-between shrink-0 select-none overflow-x-auto">
              {/* Step 1 */}
              <div
                onClick={() => changeStep(1)}
                className="flex items-center gap-2.5 cursor-pointer shrink-0"
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                    wizardStep === 1
                      ? "bg-blue-600 dark:bg-sky-500 text-white shadow-sm shadow-blue-500/30"
                      : wizardStep > 1
                      ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/30"
                      : "border border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800/40"
                  }`}
                >
                  {wizardStep > 1 ? <Check className="w-3.5 h-3.5 stroke-3" /> : "1"}
                </div>
                <div className="flex flex-col">
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider leading-tight ${
                      wizardStep === 1
                        ? "text-blue-600 dark:text-sky-400"
                        : wizardStep > 1
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    STEP 1
                  </span>
                  <span
                    className={`text-xs font-semibold leading-tight ${
                      wizardStep === 1
                        ? "text-slate-900 dark:text-white"
                        : wizardStep > 1
                        ? "text-slate-700 dark:text-slate-300"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    Device Identity
                  </span>
                </div>
              </div>

              {/* Connecting Line 1-2 */}
              <div
                className={`h-0.5 flex-1 mx-2 sm:mx-3 transition-colors ${
                  wizardStep > 1
                    ? "bg-emerald-500"
                    : wizardStep === 1
                    ? "bg-blue-600/30 dark:bg-sky-500/30"
                    : "bg-slate-200 dark:bg-slate-800"
                }`}
              />

              {/* Step 2 */}
              <div
                onClick={() => {
                  if (newDevice.name.trim() && newDevice.ip.trim()) changeStep(2);
                }}
                className={`flex items-center gap-2.5 cursor-pointer shrink-0 ${
                  !newDevice.name.trim() || !newDevice.ip.trim()
                    ? "opacity-60 cursor-not-allowed"
                    : ""
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                    wizardStep === 2
                      ? "bg-blue-600 dark:bg-sky-500 text-white shadow-sm shadow-blue-500/30"
                      : wizardStep > 2
                      ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/30"
                      : "border border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800/40"
                  }`}
                >
                  {wizardStep > 2 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : "2"}
                </div>
                <div className="flex flex-col">
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider leading-tight ${
                      wizardStep === 2
                        ? "text-blue-600 dark:text-sky-400"
                        : wizardStep > 2
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    STEP 2
                  </span>
                  <span
                    className={`text-xs font-semibold leading-tight ${
                      wizardStep === 2
                        ? "text-slate-900 dark:text-white"
                        : wizardStep > 2
                        ? "text-slate-700 dark:text-slate-300"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    Protocol & Polling
                  </span>
                </div>
              </div>

              {/* Connecting Line 2-3 */}
              <div
                className={`h-0.5 flex-1 mx-2 sm:mx-3 transition-colors ${
                  wizardStep > 2
                    ? "bg-emerald-500"
                    : wizardStep === 2
                    ? "bg-blue-600/30 dark:bg-sky-500/30"
                    : "bg-slate-200 dark:bg-slate-800"
                }`}
              />

              {/* Step 3 */}
              <div
                onClick={() => {
                  if (newDevice.name.trim() && newDevice.ip.trim()) changeStep(3);
                }}
                className={`flex items-center gap-2.5 cursor-pointer shrink-0 ${
                  !newDevice.name.trim() || !newDevice.ip.trim()
                    ? "opacity-60 cursor-not-allowed"
                    : ""
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                    wizardStep === 3
                      ? "bg-blue-600 dark:bg-sky-500 text-white shadow-sm shadow-blue-500/30"
                      : wizardStep > 3
                      ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/30"
                      : "border border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800/40"
                  }`}
                >
                  {wizardStep > 3 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : "3"}
                </div>
                <div className="flex flex-col">
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider leading-tight ${
                      wizardStep === 3
                        ? "text-blue-600 dark:text-sky-400"
                        : wizardStep > 3
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    STEP 3
                  </span>
                  <span
                    className={`text-xs font-semibold leading-tight ${
                      wizardStep === 3
                        ? "text-slate-900 dark:text-white"
                        : wizardStep > 3
                        ? "text-slate-700 dark:text-slate-300"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    Discovery & Thresholds
                  </span>
                </div>
              </div>

              {/* Connecting Line 3-4 */}
              <div
                className={`h-0.5 flex-1 mx-2 sm:mx-3 transition-colors ${
                  wizardStep > 3
                    ? "bg-emerald-500"
                    : wizardStep === 3
                    ? "bg-blue-600/30 dark:bg-sky-500/30"
                    : "bg-slate-200 dark:bg-slate-800"
                }`}
              />

              {/* Step 4 */}
              <div
                onClick={() => {
                  if (newDevice.name.trim() && newDevice.ip.trim()) changeStep(4);
                }}
                className={`flex items-center gap-2.5 cursor-pointer shrink-0 ${
                  !newDevice.name.trim() || !newDevice.ip.trim()
                    ? "opacity-60 cursor-not-allowed"
                    : ""
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                    wizardStep === 4
                      ? "bg-blue-600 dark:bg-sky-500 text-white shadow-sm shadow-blue-500/30"
                      : "border border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800/40"
                  }`}
                >
                  4
                </div>
                <div className="flex flex-col">
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider leading-tight ${
                      wizardStep === 4
                        ? "text-blue-600 dark:text-sky-400"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    STEP 4
                  </span>
                  <span
                    className={`text-xs font-semibold leading-tight ${
                      wizardStep === 4
                        ? "text-slate-900 dark:text-white"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    Test & Save
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Body: Multi-Step Forms */}
            <div className="flex-1 px-6 py-4 overflow-y-auto min-h-0">
              {/* ─── STEP 1: DEVICE IDENTITY ─── */}
              {wizardStep === 1 && (
                <div
                  key="step-1"
                  className={`${
                    slideDirection === "forward"
                      ? "animate-wizard-slide-forward"
                      : "animate-wizard-slide-backward"
                  } space-y-4 py-1`}
                >
                  {/* Row 1: DEVICE NAME & ALTERNATE NAME / ALIAS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        DEVICE NAME *
                      </label>
                      <input
                        type="text"
                        value={newDevice.name}
                        onChange={(e) =>
                          setNewDevice({ ...newDevice, name: e.target.value })
                        }
                        placeholder="DEL-EDGE-NEW-001"
                        className="w-full bg-slate-50 dark:bg-[#060b14] border border-slate-200 dark:border-[#1a283c] rounded-xl px-4 py-2.5 sm:py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-[#060b14] focus:border-blue-500 dark:focus:border-sky-500 focus:ring-2 focus:ring-blue-500/15 dark:focus:ring-sky-500/30 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        ALTERNATE NAME / ALIAS
                      </label>
                      <input
                        type="text"
                        value={newDevice.alias}
                        onChange={(e) =>
                          setNewDevice({ ...newDevice, alias: e.target.value })
                        }
                        placeholder="e.g. Delhi Edge Primary"
                        className="w-full bg-slate-50 dark:bg-[#060b14] border border-slate-200 dark:border-[#1a283c] rounded-xl px-4 py-2.5 sm:py-3 text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-[#060b14] focus:border-blue-500 dark:focus:border-sky-500 focus:ring-2 focus:ring-blue-500/15 dark:focus:ring-sky-500/30 transition-all"
                      />
                    </div>
                  </div>

                  {/* Row 2: DESCRIPTION */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      DESCRIPTION
                    </label>
                    <input
                      type="text"
                      value={newDevice.description}
                      onChange={(e) =>
                        setNewDevice({ ...newDevice, description: e.target.value })
                      }
                      placeholder="Primary enterprise edge device"
                      className="w-full bg-slate-50 dark:bg-[#060b14] border border-slate-200 dark:border-[#1a283c] rounded-xl px-4 py-2.5 sm:py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-[#060b14] focus:border-blue-500 dark:focus:border-sky-500 focus:ring-2 focus:ring-blue-500/15 dark:focus:ring-sky-500/30 transition-all"
                    />
                  </div>

                  {/* Row 3: MANAGEMENT IP ADDRESS & DEVICE GROUP */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        MANAGEMENT IP ADDRESS *
                      </label>
                      <input
                        type="text"
                        value={newDevice.ip}
                        onChange={(e) =>
                          setNewDevice({ ...newDevice, ip: e.target.value })
                        }
                        placeholder="10.20.4.61"
                        className="w-full bg-slate-50 dark:bg-[#060b14] border border-slate-200 dark:border-[#1a283c] rounded-xl px-4 py-2.5 sm:py-3 text-sm text-slate-900 dark:text-white font-mono placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-[#060b14] focus:border-blue-500 dark:focus:border-sky-500 focus:ring-2 focus:ring-blue-500/15 dark:focus:ring-sky-500/30 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        DEVICE GROUP
                      </label>
                      <div className="relative">
                        <select
                          value={newDevice.group}
                          onChange={(e) =>
                            setNewDevice({ ...newDevice, group: e.target.value })
                          }
                          className="w-full appearance-none bg-slate-50 dark:bg-[#060b14] border border-slate-200 dark:border-[#1a283c] rounded-xl px-4 py-2.5 sm:py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-[#060b14] focus:border-blue-500 dark:focus:border-sky-500 focus:ring-2 focus:ring-blue-500/15 dark:focus:ring-sky-500/30 cursor-pointer pr-10 transition-all"
                        >
                          <option value="IZOSDWANPRIME">IZOSDWANPRIME</option>
                          <option value="CORE_BACKBONE">CORE_BACKBONE</option>
                          <option value="EDGE_GATEWAYS">EDGE_GATEWAYS</option>
                          <option value="CAMPUS_SWITCHES">CAMPUS_SWITCHES</option>
                          <option value="DC_FABRIC">DC_FABRIC</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Row 4: OEM VENDOR (5 Tiles matching Figma) */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      OEM VENDOR
                    </label>
                    <div className="grid grid-cols-5 gap-2.5 sm:gap-3">
                      {VENDORS.map((v) => {
                        const isSelected =
                          newDevice.vendor.toLowerCase() === v.name.toLowerCase();
                        return (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() =>
                              setNewDevice({
                                ...newDevice,
                                vendor: v.name,
                                model: v.defaultModel,
                              })
                            }
                            className={`py-3 px-2 sm:px-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              isSelected
                                ? "bg-blue-50/80 dark:bg-[#081324] border-2 border-blue-600 dark:border-[#0099ff] text-blue-900 dark:text-white shadow-sm shadow-blue-500/10"
                                : "bg-slate-50 dark:bg-[#060b14] border border-slate-200 dark:border-[#18263a] text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-[#0c1422]"
                            }`}
                          >
                            <span
                              className={`w-9 h-6 rounded flex items-center justify-center text-[11px] font-bold tracking-tight ${
                                isSelected
                                  ? "bg-blue-600 text-white dark:bg-[#101928] dark:text-sky-300 dark:border dark:border-[#1e2d44]"
                                  : "bg-slate-200 dark:bg-[#0e1624] text-slate-600 dark:text-slate-400 border border-slate-300/60 dark:border-[#18263a]"
                              }`}
                            >
                              {v.code}
                            </span>
                            <span className="text-xs font-semibold">{v.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ─── STEP 2: PROTOCOL & POLLING ─── */}
              {wizardStep === 2 && (
                <div
                  key="step-2"
                  className={`${
                    slideDirection === "forward"
                      ? "animate-wizard-slide-forward"
                      : "animate-wizard-slide-backward"
                  } space-y-4 py-1`}
                >
                  {/* SNMP Capable Toggle Card */}
                  <div className="bg-slate-50 dark:bg-[#060b14] border border-slate-200 dark:border-[#1a283c] rounded-xl px-4 py-3.5 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">SNMP Capable</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Enable SNMP polling for this device
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={newDevice.snmpCapable}
                      onClick={() =>
                        setNewDevice({
                          ...newDevice,
                          snmpCapable: !newDevice.snmpCapable,
                        })
                      }
                      className={`w-12 h-6 rounded-full transition-colors flex items-center px-0.5 cursor-pointer ${
                        newDevice.snmpCapable ? "bg-blue-600 dark:bg-sky-500" : "bg-slate-300 dark:bg-slate-700"
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                          newDevice.snmpCapable ? "translate-x-6" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Row 1: SNMP VERSION & SNMP PORT */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        SNMP VERSION
                      </label>
                      <div className="relative">
                        <select
                          value={newDevice.snmpVersion}
                          onChange={(e) =>
                            setNewDevice({
                              ...newDevice,
                              snmpVersion: e.target.value,
                              protocol: `SNMP ${e.target.value}`,
                            })
                          }
                          className="w-full appearance-none bg-slate-50 dark:bg-[#060b14] border border-slate-200 dark:border-[#1a283c] rounded-xl px-4 py-2.5 sm:py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-[#060b14] focus:border-blue-500 dark:focus:border-sky-500 focus:ring-2 focus:ring-blue-500/15 dark:focus:ring-sky-500/30 cursor-pointer pr-10 transition-all"
                        >
                          <option value="v2c">v2c</option>
                          <option value="v3">v3</option>
                          <option value="v1">v1</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        SNMP PORT
                      </label>
                      <input
                        type="text"
                        value={newDevice.port}
                        onChange={(e) =>
                          setNewDevice({ ...newDevice, port: e.target.value })
                        }
                        placeholder="161"
                        className="w-full bg-slate-50 dark:bg-[#060b14] border border-slate-200 dark:border-[#1a283c] rounded-xl px-4 py-2.5 sm:py-3 text-sm text-slate-900 dark:text-white font-mono placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-[#060b14] focus:border-blue-500 dark:focus:border-sky-500 focus:ring-2 focus:ring-blue-500/15 dark:focus:ring-sky-500/30 transition-all"
                      />
                    </div>
                  </div>

                  {/* Row 2: READ COMMUNITY & WRITE COMMUNITY */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        READ COMMUNITY
                      </label>
                      <input
                        type="password"
                        value={newDevice.readCommunity}
                        onChange={(e) =>
                          setNewDevice({
                            ...newDevice,
                            readCommunity: e.target.value,
                          })
                        }
                        placeholder="••••••••••"
                        className="w-full bg-slate-50 dark:bg-[#060b14] border border-slate-200 dark:border-[#1a283c] rounded-xl px-4 py-2.5 sm:py-3 text-sm text-slate-900 dark:text-white font-mono tracking-widest placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-[#060b14] focus:border-blue-500 dark:focus:border-sky-500 focus:ring-2 focus:ring-blue-500/15 dark:focus:ring-sky-500/30 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        WRITE COMMUNITY
                      </label>
                      <input
                        type="password"
                        value={newDevice.writeCommunity}
                        onChange={(e) =>
                          setNewDevice({
                            ...newDevice,
                            writeCommunity: e.target.value,
                          })
                        }
                        placeholder="••••••••••"
                        className="w-full bg-slate-50 dark:bg-[#060b14] border border-slate-200 dark:border-[#1a283c] rounded-xl px-4 py-2.5 sm:py-3 text-sm text-slate-900 dark:text-white font-mono tracking-widest placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-[#060b14] focus:border-blue-500 dark:focus:border-sky-500 focus:ring-2 focus:ring-blue-500/15 dark:focus:ring-sky-500/30 transition-all"
                      />
                    </div>
                  </div>

                  {/* Row 3: TEST OID · SYSDESCR */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      TEST OID · SYSDESCR
                    </label>
                    <input
                      type="text"
                      value={newDevice.testOid}
                      onChange={(e) =>
                        setNewDevice({ ...newDevice, testOid: e.target.value })
                      }
                      placeholder=".1.3.6.1.2.1.1.1.0"
                      className="w-full bg-slate-50 dark:bg-[#060b14] border border-slate-200 dark:border-[#1a283c] rounded-xl px-4 py-2.5 sm:py-3 text-sm text-slate-900 dark:text-white font-mono placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-[#060b14] focus:border-blue-500 dark:focus:border-sky-500 focus:ring-2 focus:ring-blue-500/15 dark:focus:ring-sky-500/30 transition-all"
                    />
                  </div>

                  {/* Optional SNMP v3 Configuration when v3 is selected */}
                  {newDevice.snmpVersion === "v3" && (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#060b14] border border-slate-200 dark:border-[#1a283c] space-y-3 mt-2">
                      <div className="text-xs font-bold text-blue-600 dark:text-sky-400 flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>SNMP v3 USM Security Configuration</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                            SECURITY USERNAME
                          </label>
                          <input
                            type="text"
                            value={newDevice.snmpUser}
                            onChange={(e) =>
                              setNewDevice({ ...newDevice, snmpUser: e.target.value })
                            }
                            className="w-full bg-white dark:bg-[#0b1320] border border-slate-200 dark:border-[#1c2c44] rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                            AUTH PROTOCOL
                          </label>
                          <select
                            value={newDevice.authProto}
                            onChange={(e) =>
                              setNewDevice({ ...newDevice, authProto: e.target.value })
                            }
                            className="w-full bg-white dark:bg-[#0b1320] border border-slate-200 dark:border-[#1c2c44] rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white cursor-pointer focus:outline-none focus:border-blue-500"
                          >
                            <option value="SHA-256">SHA-256 (Recommended)</option>
                            <option value="SHA-1">SHA-1</option>
                            <option value="MD5">MD5</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                            PRIVACY CIPHER
                          </label>
                          <select
                            value={newDevice.privProto}
                            onChange={(e) =>
                              setNewDevice({ ...newDevice, privProto: e.target.value })
                            }
                            className="w-full bg-white dark:bg-[#0b1320] border border-slate-200 dark:border-[#1c2c44] rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white cursor-pointer focus:outline-none focus:border-blue-500"
                          >
                            <option value="AES-128">AES-128 (Secure)</option>
                            <option value="AES-256">AES-256</option>
                            <option value="DES">DES</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                            AUTH PASSPHRASE
                          </label>
                          <input
                            type="password"
                            value={newDevice.authKey}
                            onChange={(e) =>
                              setNewDevice({ ...newDevice, authKey: e.target.value })
                            }
                            className="w-full bg-white dark:bg-[#0b1320] border border-slate-200 dark:border-[#1c2c44] rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                            PRIVACY PASSPHRASE
                          </label>
                          <input
                            type="password"
                            value={newDevice.privKey}
                            onChange={(e) =>
                              setNewDevice({ ...newDevice, privKey: e.target.value })
                            }
                            className="w-full bg-white dark:bg-[#0b1320] border border-slate-200 dark:border-[#1c2c44] rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ─── STEP 3: DISCOVERY & THRESHOLDS ─── */}
              {wizardStep === 3 && (
                <div
                  key="step-3"
                  className={`${
                    slideDirection === "forward"
                      ? "animate-wizard-slide-forward"
                      : "animate-wizard-slide-backward"
                  } space-y-4 py-1`}
                >
                  {/* Row 1: Polled By & Polling Frequency Dropdowns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        POLLED BY
                      </label>
                      <div className="relative">
                        <select
                          value={newDevice.polledBy || "AUTO (Nearest Node)"}
                          onChange={(e) =>
                            setNewDevice({ ...newDevice, polledBy: e.target.value })
                          }
                          className="w-full appearance-none bg-slate-50 dark:bg-[#070e1a] border border-slate-200 dark:border-[#1a2942] rounded-xl px-4 py-2.5 sm:py-3 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-[#070e1a] focus:border-blue-500 dark:focus:border-sky-500 cursor-pointer pr-10 transition-colors"
                        >
                          <option value="AUTO (Nearest Node)">AUTO (Nearest Node)</option>
                          <option value="INP44NFCM01A">INP44NFCM01A</option>
                          <option value="UKL78NFCM01A">UKL78NFCM01A</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        POLLING FREQUENCY
                      </label>
                      <div className="relative">
                        <select
                          value={newDevice.pollingFrequency || "5 minutes / 300s"}
                          onChange={(e) =>
                            setNewDevice({
                              ...newDevice,
                              pollingFrequency: e.target.value,
                            })
                          }
                          className="w-full appearance-none bg-slate-50 dark:bg-[#070e1a] border border-slate-200 dark:border-[#1a2942] rounded-xl px-4 py-2.5 sm:py-3 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-[#070e1a] focus:border-blue-500 dark:focus:border-sky-500 cursor-pointer pr-10 transition-colors"
                        >
                          <option value="1 minute / 60s">1 minute / 60s</option>
                          <option value="2 minutes / 120s">2 minutes / 120s</option>
                          <option value="5 minutes / 300s">5 minutes / 300s</option>
                          <option value="10 minutes / 600s">10 minutes / 600s</option>
                          <option value="15 minutes / 900s">15 minutes / 900s</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Advanced discovery */}
                  <div className="pt-1">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-200 mb-3">
                      Advanced discovery
                    </h4>
                    <div className="space-y-3">
                      {/* Prefer 64-bit Counters (RFC 2233 HC) */}
                      <div
                        onClick={() =>
                          setNewDevice({
                            ...newDevice,
                            prefer64BitCounters: !newDevice.prefer64BitCounters,
                          })
                        }
                        className="bg-slate-50 dark:bg-[#070e1a] border border-slate-200 dark:border-[#1a2942] rounded-xl px-4 sm:px-5 py-3.5 flex items-center justify-between cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100/60 dark:hover:bg-[#0c1422] transition-colors select-none"
                      >
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-200">
                          Prefer 64-bit Counters (RFC 2233 HC)
                        </span>
                        <div
                          className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 shrink-0 ${
                            newDevice.prefer64BitCounters
                              ? "bg-blue-600 dark:bg-sky-500"
                              : "bg-slate-300 dark:bg-slate-700"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                              newDevice.prefer64BitCounters
                                ? "translate-x-5"
                                : "translate-x-0"
                            }`}
                          />
                        </div>
                      </div>

                      {/* IP / Interface Correlation */}
                      <div
                        onClick={() =>
                          setNewDevice({
                            ...newDevice,
                            ipInterfaceCorrelation: !newDevice.ipInterfaceCorrelation,
                          })
                        }
                        className="bg-slate-50 dark:bg-[#070e1a] border border-slate-200 dark:border-[#1a2942] rounded-xl px-4 sm:px-5 py-3.5 flex items-center justify-between cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100/60 dark:hover:bg-[#0c1422] transition-colors select-none"
                      >
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-200">
                          IP / Interface Correlation
                        </span>
                        <div
                          className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 shrink-0 ${
                            newDevice.ipInterfaceCorrelation
                              ? "bg-blue-600 dark:bg-sky-500"
                              : "bg-slate-300 dark:bg-slate-700"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                              newDevice.ipInterfaceCorrelation
                                ? "translate-x-5"
                                : "translate-x-0"
                            }`}
                          />
                        </div>
                      </div>

                      {/* Auto-discover Trap Destinations */}
                      <div
                        onClick={() =>
                          setNewDevice({
                            ...newDevice,
                            autoDiscoverTraps: !newDevice.autoDiscoverTraps,
                          })
                        }
                        className="bg-slate-50 dark:bg-[#070e1a] border border-slate-200 dark:border-[#1a2942] rounded-xl px-4 sm:px-5 py-3.5 flex items-center justify-between cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100/60 dark:hover:bg-[#0c1422] transition-colors select-none"
                      >
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-200">
                          Auto-discover Trap Destinations
                        </span>
                        <div
                          className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 shrink-0 ${
                            newDevice.autoDiscoverTraps
                              ? "bg-blue-600 dark:bg-sky-500"
                              : "bg-slate-300 dark:bg-slate-700"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                              newDevice.autoDiscoverTraps
                                ? "translate-x-5"
                                : "translate-x-0"
                            }`}
                          />
                        </div>
                      </div>

                      {/* Enable concurrent polling */}
                      <div
                        onClick={() =>
                          setNewDevice({
                            ...newDevice,
                            enableConcurrentPolling: !newDevice.enableConcurrentPolling,
                          })
                        }
                        className="bg-slate-50 dark:bg-[#070e1a] border border-slate-200 dark:border-[#1a2942] rounded-xl px-4 sm:px-5 py-3.5 flex items-center justify-between cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100/60 dark:hover:bg-[#0c1422] transition-colors select-none"
                      >
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-200">
                          Enable concurrent polling
                        </span>
                        <div
                          className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 shrink-0 ${
                            newDevice.enableConcurrentPolling
                              ? "bg-blue-600 dark:bg-sky-500"
                              : "bg-slate-300 dark:bg-slate-700"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                              newDevice.enableConcurrentPolling
                                ? "translate-x-5"
                                : "translate-x-0"
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── STEP 4: TEST & SAVE ─── */}
              {wizardStep === 4 && (
                <div
                  key="step-4"
                  className={`${
                    slideDirection === "forward"
                      ? "animate-wizard-slide-forward"
                      : "animate-wizard-slide-backward"
                  } space-y-4 py-1`}
                >
                  {/* Pre-flight connectivity check Header Card */}
                  <div className="bg-slate-50 dark:bg-[#070e1a] border border-slate-200 dark:border-[#1a2942] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-blue-100/80 dark:bg-[#091527] border border-blue-200 dark:border-[#182c49] flex items-center justify-center text-blue-600 dark:text-sky-400 shrink-0">
                        <Activity className="w-5 h-5 stroke-[2.2]" />
                      </div>
                      <div>
                        <h4 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                          Pre-flight connectivity check
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Validate ICMP reachability, SNMP credentials, and MIB access before onboarding.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={runDiagnosticTest}
                      disabled={isDiagnosticRunning}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-sky-500 dark:hover:bg-sky-600 shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98] shrink-0 self-start sm:self-auto"
                    >
                      {isDiagnosticRunning && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>
                        {isDiagnosticRunning
                          ? "Running..."
                          : diagnosticCompleted
                          ? "Run Again"
                          : "Run Check"}
                      </span>
                    </button>
                  </div>

                  {/* Connectivity Test Terminal Card */}
                  <div className="bg-slate-950 dark:bg-[#050a14] border border-slate-800 dark:border-[#16253c] rounded-xl overflow-hidden font-mono text-xs sm:text-[13px] h-[265px] flex flex-col shadow-inner">
                    {/* Console Header Bar */}
                    <div className="px-5 py-2.5 border-b border-slate-800 dark:border-[#142032] flex items-center justify-between bg-slate-900/90 dark:bg-[#040810]/80 shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                        <span className="text-[11px] font-semibold tracking-wider text-slate-400 ml-2">
                          CONNECTIVITY TEST
                        </span>
                      </div>
                      {diagnosticCompleted && (
                        <div className="text-[11px] font-semibold tracking-wider text-[#10b981]">
                          {isDiagnosticRunning ? "RUNNING CHECKS..." : "ALL CHECKS PASSED"}
                        </div>
                      )}
                    </div>

                    {/* Console Body Content */}
                    <div className="p-5 sm:p-6 leading-relaxed flex-1 overflow-y-auto">
                      {!diagnosticCompleted && !isDiagnosticRunning ? (
                        <div className="text-sky-400 font-mono text-xs sm:text-[13px] font-medium">
                          Ready. Run the check to validate device connectivity.
                        </div>
                      ) : isDiagnosticRunning ? (
                        <div className="text-sky-400 flex items-center gap-2 font-mono text-xs sm:text-[13px]">
                          <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                          <span>Testing socket connectivity & SNMP credentials...</span>
                        </div>
                      ) : (
                        <div className="space-y-3.5 sm:space-y-4">
                          {/* Check 1: ICMP */}
                          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6">
                            <div className="w-56 shrink-0 flex items-center gap-2.5 text-white font-medium">
                              <span className="text-emerald-400 font-bold">✓</span>
                              <span>ICMP Reachable</span>
                            </div>
                            <div className="flex items-center gap-6 text-slate-300">
                              <span>RTT 14ms</span>
                              <span>Packet loss 0%</span>
                            </div>
                          </div>

                          {/* Check 2: UDP Port */}
                          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6">
                            <div className="w-56 shrink-0 flex items-center gap-2.5 text-white font-medium">
                              <span className="text-emerald-400 font-bold">✓</span>
                              <span>UDP/161 Available</span>
                            </div>
                            <div className="text-slate-300">
                              Response 22ms
                            </div>
                          </div>

                          {/* Check 3: Community */}
                          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6">
                            <div className="w-56 shrink-0 flex items-center gap-2.5 text-white font-medium">
                              <span className="text-emerald-400 font-bold">✓</span>
                              <span>Community Validated</span>
                            </div>
                            <div className="text-slate-300">
                              Read access granted
                            </div>
                          </div>

                          {/* Check 4: MIB-II Query */}
                          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6">
                            <div className="w-56 shrink-0 flex items-center gap-2.5 text-white font-medium">
                              <span className="text-emerald-400 font-bold">✓</span>
                              <span>MIB-II Query</span>
                            </div>
                            <div className="space-y-1 text-slate-300">
                              <div>SysName: TAH-IND-DELHI-001</div>
                              <div>SysDescr: FortiOS v7.2.4</div>
                            </div>
                          </div>

                          {/* Completion status text */}
                          <div className="pt-2 text-slate-400">
                            Pre-flight check completed successfully.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Bar */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-[#14233a] bg-slate-50/70 dark:bg-[#060e1a]/70 flex items-center justify-between shrink-0">
              <div>
                {wizardStep === 1 ? (
                  <button
                    type="button"
                    onClick={closeAddModal}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-[#1b283d] bg-white dark:bg-[#091220]/70 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      changeStep(Math.max(1, wizardStep - 1) as 1 | 2 | 3 | 4)
                    }
                    className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-[#1b283d] bg-white dark:bg-[#091220]/70 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
                  >
                    Back
                  </button>
                )}
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                Step {wizardStep} of 4
              </div>

              <div>
                {wizardStep < 4 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (!newDevice.name.trim() || !newDevice.ip.trim()) {
                        toast.error("Validation error", {
                          description:
                            "Device Name and Management IP are required.",
                        });
                        return;
                      }
                      changeStep(Math.min(4, wizardStep + 1) as 1 | 2 | 3 | 4);
                    }}
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-sky-500 dark:hover:bg-sky-600 shadow-md shadow-blue-500/25 transition-all cursor-pointer active:scale-[0.98]"
                  >
                    <span>Continue</span>
                    <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSaveAndProvision}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-sky-500 dark:hover:bg-sky-600 shadow-lg shadow-blue-500/25 transition-all cursor-pointer active:scale-[0.98]"
                  >
                    <span>Complete Onboarding</span>
                    <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ════════════════════════════════════════════════════
          IMPORT CSV MODAL
          ════════════════════════════════════════════════════ */}
      {mounted && isImportModalRendered && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-99999 flex items-center justify-center p-4 select-none overflow-hidden"
        >
          {/* Animated Backdrop */}
          <div
            onClick={closeImportModal}
            className={`fixed inset-0 bg-slate-950/65 dark:bg-black/80 transition-all duration-300 ease-out cursor-pointer ${
              isImportModalVisible
                ? "opacity-100 backdrop-blur-md"
                : "opacity-0 backdrop-blur-none"
            }`}
          />

          {/* Animated Modal Card */}
          <div
            onClick={(e) => e.stopPropagation()}
            className={`relative bg-white dark:bg-[#081220] rounded-2xl border border-slate-200/90 dark:border-[#14233a] shadow-2xl w-full max-w-lg overflow-hidden text-slate-900 dark:text-slate-100 z-10 transition-all duration-300 ease-out transform ${
              isImportModalVisible
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 translate-y-4"
            }`}
          >
            <div className="bg-white dark:bg-[#081220] border-b border-slate-100 dark:border-[#14233a] p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-blue-600 dark:text-sky-400 uppercase tracking-widest block mb-1">
                  BATCH INGESTION
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Import Devices via CSV</h3>
              </div>
              <button
                type="button"
                onClick={closeImportModal}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 bg-white dark:bg-[#081220]">
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-sky-500 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-[#0b1626]/50 hover:bg-blue-50/30 dark:hover:bg-sky-950/20 group"
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-sky-950/60 text-blue-600 dark:text-sky-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Click to select CSV file
                </h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Supports .csv with headers: Name, IP, Vendor, Model, Site, Protocol
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="text-slate-400 dark:text-slate-500">Max file size: 10 MB</span>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleExportCSV();
                  }}
                  className="text-blue-600 dark:text-sky-400 font-medium hover:underline"
                >
                  Download template.csv
                </a>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default DeviceOnboardingView;
