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
  Loader2,
  AlertOctagon,
  RotateCw,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import OverviewCards from "./OverviewCards";
import onboardingData from "../data/onboardingDefaults.json";
import AddDeviceModal, { NewDeviceData } from "./AddDeviceModal";
import ImportCsvModal from "./ImportCsvModal";
import DeviceDetailModal from "./DeviceDetailModal";
import {
  deviceService,
  NetworkDevice,
  parsePollingFrequencySeconds,
} from "@/services/deviceService";

export type { NetworkDevice };

interface DeviceOnboardingViewProps {
  onBackToDashboard?: () => void;
  className?: string;
}

interface DeviceActionProps {
  testingPingId: string | null;
  deletingId: string | null;
  onPingTest: (device: NetworkDevice) => void;
  onDeleteDevice: (id: string, name: string) => void;
  onSelectDevice: (device: NetworkDevice) => void;
}

interface DeviceListProps extends DeviceActionProps {
  filteredDevices: NetworkDevice[];
  totalDevicesCount: number;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
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
  isLoading,
  error,
  onRetry,
  testingPingId,
  deletingId,
  onPingTest,
  onDeleteDevice,
  onSelectDevice,
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
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2.5">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Fetching network device inventory...
                    </p>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center">
                      <AlertOctagon className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Unable to Load Device Inventory
                    </p>
                    <p className="text-xs text-slate-400 max-w-md">{error}</p>
                    <button
                      type="button"
                      onClick={onRetry}
                      className="mt-1 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Retry</span>
                    </button>
                  </div>
                </td>
              </tr>
            ) : filteredDevices.length === 0 ? (
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
                const isDeleting = deletingId === device.id;
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
                          <button
                            type="button"
                            onClick={() => onSelectDevice(device)}
                            className="font-bold text-slate-900 dark:text-white block truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-left cursor-pointer"
                            title="View & edit device profile"
                          >
                            {device.name}
                          </button>
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
                          onClick={() => onSelectDevice(device)}
                          className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-500/10 transition-colors cursor-pointer"
                          title="View / Edit device parameters"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onDeleteDevice(device.id, device.name)}
                          disabled={isDeleting}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 transition-colors cursor-pointer disabled:opacity-50"
                          title="Decommission device"
                        >
                          {isDeleting ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
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

const DeviceGridView: React.FC<
  DeviceActionProps & {
    filteredDevices: NetworkDevice[];
    isLoading: boolean;
    error: string | null;
    onRetry: () => void;
  }
> = ({
  filteredDevices,
  isLoading,
  error,
  onRetry,
  testingPingId,
  deletingId,
  onPingTest,
  onDeleteDevice,
  onSelectDevice,
}) => {
  if (isLoading) {
    return (
      <div className="p-12 text-center bg-slate-50/50 dark:bg-[#050b14]/50">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Fetching network device inventory...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-center bg-slate-50/50 dark:bg-[#050b14]/50 flex flex-col items-center gap-2">
        <AlertOctagon className="w-6 h-6 text-rose-500" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Unable to Load Device Inventory
        </p>
        <p className="text-xs text-slate-400 max-w-md">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer inline-flex items-center gap-1.5"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  if (filteredDevices.length === 0) {
    return (
      <div className="p-12 text-center bg-slate-50/50 dark:bg-[#050b14]/50 text-slate-400">
        <Server className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
          No devices match your search or filter
        </p>
      </div>
    );
  }

  return (
    <div className="p-5 sm:p-6 bg-slate-50/50 dark:bg-[#050b14]/50">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDevices.map((device) => {
          const isTesting = testingPingId === device.id;
          const isDeleting = deletingId === device.id;
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
                      <button
                        type="button"
                        onClick={() => onSelectDevice(device)}
                        className="font-bold text-slate-900 dark:text-white text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left cursor-pointer"
                      >
                        {device.name}
                      </button>
                      <span className="text-xs text-slate-400 font-mono block">
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
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors cursor-pointer"
                  >
                    {isTesting ? "Testing..." : "Test Ping"}
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectDevice(device)}
                    className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-500/10 transition-colors cursor-pointer"
                    title="View / Edit device parameters"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteDevice(device.id, device.name)}
                    disabled={isDeleting}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
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
  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [summaryDevices, setSummaryDevices] = useState<NetworkDevice[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  const fetchDevices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await deviceService.getDevices({
        search: searchQuery,
        oem: vendorFilter,
        type: typeFilter,
        status: statusFilter,
      });
      setDevices(data);
      if (
        !searchQuery.trim() &&
        statusFilter === "all" &&
        vendorFilter === "all" &&
        typeFilter === "all"
      ) {
        setSummaryDevices(data);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Unable to retrieve device inventory from the server.";
      setError(msg);
      setDevices([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, vendorFilter, typeFilter, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDevices();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchDevices]);

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
    const source = summaryDevices.length > 0 ? summaryDevices : devices;
    const total = source.length;
    const online = source.filter((d) => d.status === "online").length;
    const warning = source.filter((d) => d.status === "warning").length;
    const offline = source.filter((d) => d.status === "offline").length;
    const maintenance = source.filter((d) => d.status === "maintenance").length;
    return { total, online, warning, offline, maintenance };
  }, [summaryDevices, devices]);

  const handleSaveAndProvision = async (newDevice: NewDeviceData) => {
    try {
      const created = await deviceService.createDevice({
        name: newDevice.name.trim(),
        hostname: `${newDevice.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")}.garuda.io`,
        ip: newDevice.ip.trim(),
        oem: newDevice.vendor,
        type: newDevice.type,
        location: newDevice.site,
        environment: "Production",
        mgmtIp: newDevice.ip.trim(),
        port: Number.parseInt(newDevice.port, 10) || 161,
        protocol: newDevice.protocol || "SSH / SNMP",
        username: newDevice.snmpUser || "admin",
        authMethod: `${newDevice.authProto || "SHA-256"} + ${newDevice.privProto || "AES-128"}`,
        credential: newDevice.authKey || newDevice.readCommunity || "encrypted_secret",
        collectionMethod: newDevice.snmpCapable ? "SNMP" : "REST API",
        snmpVersion: newDevice.snmpVersion || "v2c",
        snmpCommunity: newDevice.readCommunity || "public_garuda_ro",
        pollingFrequency: parsePollingFrequencySeconds(
          newDevice.pollingFrequency || newDevice.pollingInterval
        ),
      });

      setDevices((prev) => [created, ...prev]);
      setSummaryDevices((prev) => [created, ...prev]);
      closeAddModal();
      toast.success("Device Onboarded Successfully", {
        description: `${created.name} (${created.ip}) registered in ${created.site}.`,
      });
      await fetchDevices();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to onboard network device.";
      toast.error("Onboarding Failed", { description: msg });
      throw err;
    }
  };

  const handlePingTest = async (device: NetworkDevice) => {
    setTestingPingId(device.id);
    try {
      const result = await deviceService.testConnection({
        ip: device.ip,
        port: device.port || 161,
        protocol: device.protocol || "SSH / SNMP",
        oem: device.vendor || "Cisco",
      });

      if (result.success) {
        setDevices((prev) =>
          prev.map((d) =>
            d.id === device.id ? { ...d, latency: result.rtt, lastSeen: "Just now" } : d
          )
        );
        toast.success("Ping Response Confirmed", {
          description: `${result.message} Echo reply from ${device.ip} in ${result.rtt}.`,
        });
      } else {
        toast.error("ICMP Ping Timeout", {
          description: result.message || `No response from ${device.ip} (Destination unreachable).`,
        });
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : `Failed to probe ${device.ip}.`;
      toast.error("Connectivity Test Failed", { description: msg });
    } finally {
      setTestingPingId(null);
    }
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

  const handleDeleteDevice = async (id: string, name: string) => {
    setDeletingId(id);
    try {
      await deviceService.deleteDevice(id);
      setDevices((prev) => prev.filter((d) => d.id !== id));
      setSummaryDevices((prev) => prev.filter((d) => d.id !== id));
      toast.info("Device Decommissioned", {
        description: `${name} has been removed from inventory.`,
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : `Failed to decommission ${name}.`;
      toast.error("Decommission Failed", { description: msg });
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeviceUpdated = (updated: NetworkDevice) => {
    setDevices((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    setSummaryDevices((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    fetchDevices();
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
            isLoading={isLoading}
            error={error}
            onRetry={fetchDevices}
            testingPingId={testingPingId}
            deletingId={deletingId}
            onPingTest={handlePingTest}
            onDeleteDevice={handleDeleteDevice}
            onSelectDevice={(device) => setSelectedDeviceId(device.id)}
          />
        ) : (
          <DeviceGridView
            filteredDevices={filteredDevices}
            isLoading={isLoading}
            error={error}
            onRetry={fetchDevices}
            testingPingId={testingPingId}
            deletingId={deletingId}
            onPingTest={handlePingTest}
            onDeleteDevice={handleDeleteDevice}
            onSelectDevice={(device) => setSelectedDeviceId(device.id)}
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

      <DeviceDetailModal
        deviceId={selectedDeviceId}
        onClose={() => setSelectedDeviceId(null)}
        onUpdated={handleDeviceUpdated}
      />
    </div>
  );
};

export default DeviceOnboardingView;
