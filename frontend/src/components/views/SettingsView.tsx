"use client";

import React, { useState } from "react";
import { Server, Sliders, Bell, ChevronDown, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SettingsView() {
  const [counterMode, setCounterMode] = useState("Prefer 64-bit HC Counters (RFC 2233)");
  const [pollingCadence, setPollingCadence] = useState("60");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Configuration Saved", {
        description: "Poller thresholds and ITSM dispatch parameters updated successfully.",
      });
    }, 450);
  };

  return (
    <div className="space-y-6 w-full">
      {/* ─── Header: Title & Description ─── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          System &amp; Poller Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure regional poller worker clusters, ITSM dispatch channels, and default collection policies
        </p>
      </div>

      {/* ─── Section 1: Distributed Poller Clusters (NetReport Olio) ─── */}
      <div className="bg-white dark:bg-[#081426] rounded-2xl border border-slate-200/80 dark:border-[#14233a] p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-2.5">
            <Server className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <h2 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
              Distributed Poller Clusters (NetReport Olio)
            </h2>
          </div>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-xs sm:text-sm">
            All 3 Regional Clusters Healthy
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* Cluster 1 */}
          <div className="rounded-xl border border-slate-200/90 dark:border-[#1b2b40] p-4 bg-white dark:bg-[#071120] hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                INP44POPAS01A
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Region: India West (Mumbai DC)
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">
              Load: 38% (126 Nodes)
            </p>
          </div>

          {/* Cluster 2 */}
          <div className="rounded-xl border border-slate-200/90 dark:border-[#1b2b40] p-4 bg-white dark:bg-[#071120] hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                INP44POPAS02B
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Region: India West (Pune POP)
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">
              Load: 29% (88 Nodes)
            </p>
          </div>

          {/* Cluster 3 */}
          <div className="rounded-xl border border-slate-200/90 dark:border-[#1b2b40] p-4 bg-white dark:bg-[#071120] hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                UKL78NFCM01A
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Region: UK London Gateway
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">
              Load: 14% (34 Nodes)
            </p>
          </div>
        </div>
      </div>

      {/* ─── Section 2: Default Polling & Telemetry Thresholds ─── */}
      <div className="bg-white dark:bg-[#081426] rounded-2xl border border-slate-200/80 dark:border-[#14233a] p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4">
          <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <h2 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
            Default Polling &amp; Telemetry Thresholds
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
              High-Speed IF-MIB Counter Mode
            </label>
            <div className="relative">
              <select
                value={counterMode}
                onChange={(e) => setCounterMode(e.target.value)}
                className="w-full appearance-none bg-white dark:bg-[#060b13] border border-slate-200/90 dark:border-[#1a283c] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium cursor-pointer outline-none focus:border-blue-500 transition-colors pr-10"
              >
                <option value="Prefer 64-bit HC Counters (RFC 2233)">
                  Prefer 64-bit HC Counters (RFC 2233)
                </option>
                <option value="Fallback to 32-bit Standard Counters (RFC 1213)">
                  Fallback to 32-bit Standard Counters (RFC 1213)
                </option>
                <option value="Force 64-bit High-Capacity Counters Only">
                  Force 64-bit High-Capacity Counters Only
                </option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
              Default Polling Cadence (Seconds)
            </label>
            <input
              type="number"
              value={pollingCadence}
              onChange={(e) => setPollingCadence(e.target.value)}
              className="w-full bg-white dark:bg-[#060b13] border border-slate-200/90 dark:border-[#1a283c] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* ─── Section 3: ITSM & Incident Webhook Integration ─── */}
      <div className="bg-white dark:bg-[#081426] rounded-2xl border border-slate-200/80 dark:border-[#14233a] p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4">
          <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <h2 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
            ITSM &amp; Incident Webhook Integration
          </h2>
        </div>

        <div className="space-y-4 pt-1">
          {/* ServiceNow ITSM Connector */}
          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-[#14233a]">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                ServiceNow ITSM Connector
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Auto-create CSP incidents upon Hard Breach
              </p>
            </div>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-xs sm:text-sm">
              Active (OAuth2)
            </span>
          </div>

          {/* Jira Service Management */}
          <div className="flex items-center justify-between py-2">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Jira Service Management
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Bi-directional state sync with NOC queue
              </p>
            </div>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-xs sm:text-sm">
              Active
            </span>
          </div>
        </div>
      </div>

      {/* ─── Bottom Actions: Save Configuration Button ─── */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 shadow-md shadow-blue-500/25 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-75"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Saving Configuration...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
