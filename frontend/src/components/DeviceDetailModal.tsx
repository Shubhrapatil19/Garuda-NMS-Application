"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Server, Loader2, AlertTriangle, Save, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  deviceService,
  DeviceDetailProfile,
  NetworkDevice,
} from "@/services/deviceService";

export interface DeviceDetailModalProps {
  deviceId: string | null;
  onClose: () => void;
  onUpdated: (updated: NetworkDevice) => void;
}

export const DeviceDetailModal: React.FC<Readonly<DeviceDetailModalProps>> = ({
  deviceId,
  onClose,
  onUpdated,
}) => {
  const [profile, setProfile] = useState<DeviceDetailProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [name, setName] = useState("");
  const [type, setType] = useState("Router");
  const [location, setLocation] = useState("");
  const [environment, setEnvironment] = useState("Production");
  const [status, setStatus] = useState("Online");
  const [pollingMethod, setPollingMethod] = useState("SNMP");
  const [snmpCommunity, setSnmpCommunity] = useState("");
  const [pollingFrequency, setPollingFrequency] = useState("60");

  const fetchDetail = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const detail = await deviceService.getDeviceById(id);
      setProfile(detail);
      setName(detail.name || "");
      setType(detail.type || "Router");
      setLocation(detail.location || "");
      setEnvironment(detail.environment || "Production");
      setStatus(detail.status || "Online");
      setPollingMethod(detail.pollingMethod || "SNMP");
      setSnmpCommunity(detail.snmpCommunity || "public_garuda_ro");
      setPollingFrequency(String(detail.pollingFrequencySec || 60));
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to load device profile.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!deviceId) return;
    let isMounted = true;
    const timer = setTimeout(() => {
      if (isMounted) {
        void fetchDetail(deviceId);
      }
    }, 0);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [deviceId]);

  useEffect(() => {
    if (!deviceId) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSaving) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deviceId, isSaving, onClose]);

  if (typeof document === "undefined" || !deviceId) return null;

  const handleSave = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim() || !location.trim()) {
      toast.error("Validation error", {
        description: "Device name and location are required.",
      });
      return;
    }

    setIsSaving(true);
    try {
      const updated = await deviceService.updateDevice(deviceId, {
        name: name.trim(),
        type: type.trim() || undefined,
        location: location.trim(),
        environment: environment.trim() || undefined,
        status: status.trim() || undefined,
        pollingMethod: pollingMethod.trim() || undefined,
        snmpCommunity: snmpCommunity.trim() || undefined,
        pollingFrequency: Number.parseInt(pollingFrequency, 10) || 60,
      });

      toast.success("Device Updated", {
        description: `${updated.name} parameters updated successfully.`,
      });
      onUpdated(updated);
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to update device parameters.";
      toast.error("Update Failed", { description: msg });
    } finally {
      setIsSaving(false);
    }
  };

  return createPortal(
    <div
      aria-modal="true"
      className="fixed inset-0 z-99999 flex items-center justify-center p-3 sm:p-4 select-none overflow-hidden"
    >
      <button
        type="button"
        aria-label="Close modal backdrop"
        tabIndex={-1}
        onClick={() => !isSaving && onClose()}
        className="fixed inset-0 bg-slate-950/65 dark:bg-black/80 backdrop-blur-md transition-opacity cursor-pointer border-0 p-0"
      />

      <div className="relative bg-white dark:bg-[#081220] border border-slate-200/90 dark:border-[#14233a] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100 z-10">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-[#14233a] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-[#0e1b2f] border border-blue-100 dark:border-[#162740] flex items-center justify-center text-blue-600 dark:text-sky-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Device Profile &amp; Parameters
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {profile ? `${profile.ip} · ${profile.oem}` : `ID: ${deviceId}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <span className="text-sm font-medium">Loading device profile...</span>
            </div>
          ) : error ? (
            <div className="py-10 flex flex-col items-center justify-center gap-2.5 text-center">
              <AlertTriangle className="w-7 h-7 text-rose-500" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Unable to Load Device Profile
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                {error}
              </p>
              <button
                type="button"
                onClick={() => fetchDetail(deviceId)}
                className="mt-2 px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : profile ? (
            <form id="edit-device-form" onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    DEVICE NAME *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#060b14] border border-slate-200 dark:border-[#1a283c] rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    LOCATION / SITE *
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#060b14] border border-slate-200 dark:border-[#1a283c] rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    DEVICE TYPE
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#060b14] border border-slate-200 dark:border-[#1a283c] rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Router">Router</option>
                    <option value="Core Router">Core Router</option>
                    <option value="Edge Router">Edge Router</option>
                    <option value="Switch">Switch</option>
                    <option value="L3 Switch">L3 Switch</option>
                    <option value="Access Switch">Access Switch</option>
                    <option value="Firewall">Firewall</option>
                    <option value="Load Balancer">Load Balancer</option>
                    <option value="CPE Gateway">CPE Gateway</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    STATUS
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#060b14] border border-slate-200 dark:border-[#1a283c] rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Online">Online</option>
                    <option value="Warning">Warning</option>
                    <option value="Offline">Offline</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    ENVIRONMENT
                  </label>
                  <select
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#060b14] border border-slate-200 dark:border-[#1a283c] rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Production">Production</option>
                    <option value="Staging">Staging</option>
                    <option value="DR Node">DR Node</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    POLLING METHOD
                  </label>
                  <select
                    value={pollingMethod}
                    onChange={(e) => setPollingMethod(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#060b14] border border-slate-200 dark:border-[#1a283c] rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="SNMP">SNMP</option>
                    <option value="REST API">REST API</option>
                    <option value="Syslog">Syslog</option>
                    <option value="Push">Push</option>
                    <option value="Pull">Pull</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    SNMP COMMUNITY
                  </label>
                  <input
                    type="text"
                    value={snmpCommunity}
                    onChange={(e) => setSnmpCommunity(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#060b14] border border-slate-200 dark:border-[#1a283c] rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    POLLING INTERVAL (SEC)
                  </label>
                  <input
                    type="number"
                    min={10}
                    value={pollingFrequency}
                    onChange={(e) => setPollingFrequency(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#060b14] border border-slate-200 dark:border-[#1a283c] rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 dark:bg-[#060b14] border border-slate-200 dark:border-[#1a283c] p-4 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-blue-600 dark:text-sky-400 uppercase tracking-wider text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Telemetry &amp; Credential Profile</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-slate-600 dark:text-slate-400">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Hostname</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">{profile.hostname}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Mgmt Socket</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">
                      {profile.managementIp}:{profile.managementPort}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Protocol</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">{profile.protocol}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">SNMP Version</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">{profile.snmpVersion}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Auth Method</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">{profile.authMethod}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Health</span>
                    <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      {profile.healthPercentage ?? 100}%
                    </span>
                  </div>
                </div>
              </div>
            </form>
          ) : null}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 dark:border-[#14233a] bg-slate-50/70 dark:bg-[#060e1a]/70 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-[#1b283d] bg-white dark:bg-[#091220]/70 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all cursor-pointer"
          >
            Cancel
          </button>
          {profile && (
            <button
              type="submit"
              form="edit-device-form"
              disabled={isSaving || isLoading}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-sky-500 dark:hover:bg-sky-600 shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DeviceDetailModal;

