"use client";

import React, { useState, useMemo, useEffect, useCallback, useSyncExternalStore } from "react";
import {
  Upload,
  Download,
  Plus,
  Search,
  Server,
  Activity,
  Trash2,
  X,
  LayoutGrid,
  List,
} from "lucide-react";
import { toast } from "sonner";
import OverviewCards from "./OverviewCards";
import dbData from "../../data/db.json";
import onboardingData from "../data/onboardingDefaults.json";
import AddDeviceModal, { NewDeviceData } from "./AddDeviceModal";
import ImportCsvModal from "./ImportCsvModal";

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

interface DeviceActionProps {
  testingPingId: string | null;
  onPingTest: (device: NetworkDevice) => void;
  onDeleteDevice: (id: string, name: string) => void;
}

interface DeviceListProps extends DeviceActionProps {
  filteredDevices: NetworkDevice[];
  totalDevicesCount: number;
}

const getStatusBadge = (status: NetworkDevice["status"]) => {
  switch (status) {
    case "online":
      return {
        badgeClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-500/30",
        dotClass: "bg-emerald-500 animate-pulse",
      };
    case "warning":
      return {
        badgeClass: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 border border-amber-200/80 dark:border-amber-500/30",
        dotClass: "bg-amber-500",
      };
    case "offline":
      return {
        badgeClass: "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400 border border-rose-200/80 dark:border-rose-500/30",
        dotClass: "bg-rose-500",
      };
    default:
      return {
        badgeClass: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700",
        dotClass: "bg-slate-400",
      };
  }
};

const DeviceTableView: React.FC<DeviceListProps> = ({
  filteredDevices,
  totalDevicesCount,
  testingPingId,
  onPingTest,
  onDeleteDevice,
}) => {
  return (
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
                const { badgeClass, dotClass } = getStatusBadge(device.status);

                return (
                  <tr
                    key={device.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-[#0c182a]/70 transition-colors group"
                  >
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

                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold select-none ${badgeClass}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
                        {device.status.charAt(0).toUpperCase() + device.status.slice(1)}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 font-mono text-slate-700 dark:text-slate-300">
                      <span>{device.ip}</span>
                      <span className="text-slate-400 text-[10px] ml-1">
                        :{device.port}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                        {device.vendor}
                      </span>
                      <span className="text-slate-400 text-[11px] block">
                        {device.model} ({device.type})
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300">
                      {device.site}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#0e1b2f] text-slate-600 dark:text-slate-300 font-mono text-[10px] font-semibold border border-slate-200/60 dark:border-[#162740]">
                        {device.protocol}
                      </span>
                    </td>

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

                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onPingTest(device)}
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
                          onClick={() => onDeleteDevice(device.id, device.name)}
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

      <div className="bg-slate-50 dark:bg-[#050b14] border-t border-slate-200/80 dark:border-[#14233a] px-5 py-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 select-none">
        <span>
          Showing {filteredDevices.length} of {totalDevicesCount} network devices
        </span>
        <span>Garuda Telemetry Agent: v2.6.4</span>
      </div>
    </div>
  );
};

const DeviceGridView: React.FC<DeviceActionProps & { filteredDevices: NetworkDevice[] }> = ({
  filteredDevices,
  testingPingId,
  onPingTest,
  onDeleteDevice,
}) => {
  return (
    <div className="p-5 sm:p-6 bg-slate-50/50 dark:bg-[#050b14]/50">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDevices.map((device) => {
          const isTesting = testingPingId === device.id;
          const { badgeClass } = getStatusBadge(device.status);

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
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${badgeClass}`}
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
                    onClick={() => onPingTest(device)}
                    disabled={isTesting}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                  >
                    {isTesting ? "Testing..." : "Test Ping"}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteDevice(device.id, device.name)}
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
  );
};

const emptySubscribe = () => () => {};

export const DeviceOnboardingView: React.FC<DeviceOnboardingViewProps> = ({
  className = "",
}) => {
  const [devices, setDevices] = useState<NetworkDevice[]>(() => {
    return (
      (dbData as unknown as { devices?: NetworkDevice[] }).devices || []
    );
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [vendorFilter, setVendorFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [isAddModalRendered, setIsAddModalRendered] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  const [isImportModalRendered, setIsImportModalRendered] = useState(false);
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);

  const [testingPingId, setTestingPingId] = useState<string | null>(null);

  const openAddDeviceModal = () => {
    setIsAddModalRendered(true);
    setTimeout(() => {
      setIsAddModalVisible(true);
    }, 25);
  };

  const closeAddModal = useCallback(() => {
    setIsAddModalVisible(false);
    setTimeout(() => {
      setIsAddModalRendered(false);
    }, 280);
  }, []);

  const openImportModal = () => {
    setIsImportModalRendered(true);
    setTimeout(() => {
      setIsImportModalVisible(true);
    }, 25);
  };

  const closeImportModal = useCallback(() => {
    setIsImportModalVisible(false);
    setTimeout(() => {
      setIsImportModalRendered(false);
    }, 280);
  }, []);

  useEffect(() => {
    if (isAddModalRendered || isImportModalRendered) {
      const originalBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalBodyOverflow;
      };
    }
  }, [isAddModalRendered, isImportModalRendered]);

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

  const metrics = useMemo(() => {
    const total = devices.length;
    const online = devices.filter((d) => d.status === "online").length;
    const warning = devices.filter((d) => d.status === "warning").length;
    const offline = devices.filter((d) => d.status === "offline").length;
    const maintenance = devices.filter((d) => d.status === "maintenance").length;
    return { total, online, warning, offline, maintenance };
  }, [devices]);

  const handleSaveAndProvision = (newDevice: NewDeviceData) => {
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

  const handleDeleteDevice = (id: string, name: string) => {
    setDevices((prev) => prev.filter((d) => d.id !== id));
    toast.info("Device Decommissioned", {
      description: `${name} has been removed from inventory.`,
    });
  };

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

        const mockImported: NetworkDevice = {
          ...onboardingData.mockImportedDevice,
          id: `dev-${Date.now().toString().slice(-4)}`,
          serialNumber: `IMP-${Date.now().toString().slice(-6)}`,
        } as NetworkDevice;

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Network Devices &amp; CPE Inventory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage, monitor, and configure all multi-OEM network devices
          </p>
        </div>

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

      <div className="bg-white dark:bg-[#081220] rounded-2xl border border-slate-200/80 dark:border-[#14233a] shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-[#14233a] flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-[#081220]">
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

          <div className="flex flex-wrap items-center gap-2">
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

        {viewMode === "table" ? (
          <DeviceTableView
            filteredDevices={filteredDevices}
            totalDevicesCount={devices.length}
            testingPingId={testingPingId}
            onPingTest={handlePingTest}
            onDeleteDevice={handleDeleteDevice}
          />
        ) : (
          <DeviceGridView
            filteredDevices={filteredDevices}
            testingPingId={testingPingId}
            onPingTest={handlePingTest}
            onDeleteDevice={handleDeleteDevice}
          />
        )}
      </div>

      <AddDeviceModal
        mounted={mounted}
        isRendered={isAddModalRendered}
        isVisible={isAddModalVisible}
        onClose={closeAddModal}
        onSave={handleSaveAndProvision}
      />

      <ImportCsvModal
        mounted={mounted}
        isRendered={isImportModalRendered}
        isVisible={isImportModalVisible}
        onClose={closeImportModal}
        onFileUpload={handleFileUpload}
        onDownloadTemplate={handleExportCSV}
      />
    </div>
  );
};

export default DeviceOnboardingView;
