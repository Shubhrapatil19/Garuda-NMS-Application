"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
import { CarrierSite } from "@/data/sitesData";
import Topology3DCanvas from "./Topology3DCanvas";

interface SiteTopologyDetailViewProps {
  site: CarrierSite;
  onBack: () => void;
}

export const SiteTopologyDetailView: React.FC<SiteTopologyDetailViewProps> = ({
  site,
  onBack,
}) => {
  const getStatusBadge = (status: CarrierSite["status"]) => {
    switch (status) {
      case "online":
        return {
          label: "Online",
          badgeClass:
            "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-800/60",
          dotClass: "bg-emerald-500",
        };
      case "warning":
        return {
          label: "Warning",
          badgeClass:
            "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200/80 dark:border-amber-800/60",
          dotClass: "bg-amber-500",
        };
      case "offline":
        return {
          label: "Offline",
          badgeClass:
            "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200/80 dark:border-rose-800/60",
          dotClass: "bg-rose-500",
        };
      default:
        return {
          label: status,
          badgeClass:
            "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
          dotClass: "bg-slate-400",
        };
    }
  };

  const statusInfo = getStatusBadge(site.status);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ─── Breadcrumbs & Top Navigation Bar ─── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 text-sm sm:text-base flex-wrap">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/90 dark:border-[#14233a] bg-white dark:bg-[#081220] hover:bg-slate-50 dark:hover:bg-[#0f1d32] text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm transition-all shadow-2xs group"
          >
            <ArrowLeft
              size={14}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            <span>All Sites</span>
          </button>

          <span className="text-slate-300 dark:text-slate-700">/</span>

          <span className="font-bold text-slate-900 dark:text-white">
            {site.name}
          </span>

          <span className="font-mono text-xs sm:text-sm text-slate-400 dark:text-slate-500 font-normal">
            ({site.serviceId})
          </span>
        </div>

        {/* Status Pill Badge */}
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shrink-0 ${statusInfo.badgeClass}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`} />
          {statusInfo.label}
        </span>
      </div>

      {/* ─── Top Row: Carrier Site Profile & 3D Network Topology ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Carrier Site Profile Card */}
        <div className="lg:col-span-5 bg-white dark:bg-[#081220] rounded-2xl border border-slate-200/80 dark:border-[#14233a] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            {/* Header */}
            <div>
              <span className="text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 uppercase">
                CARRIER SITE PROFILE
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
                {site.name}
              </h2>
              <p className="text-xs font-mono text-slate-400 dark:text-slate-500 mt-0.5">
                Service ID: {site.serviceId}
              </p>
            </div>

            {/* Key-Value Details */}
            <div className="mt-6 space-y-3.5 text-xs sm:text-sm divide-y divide-slate-100 dark:divide-[#14233a]">
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-500 dark:text-slate-400">
                  Site Status:
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusInfo.badgeClass}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`}
                  />
                  {statusInfo.label}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3">
                <span className="text-slate-500 dark:text-slate-400">
                  Location:
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">
                  {site.fullLocation || site.location}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3">
                <span className="text-slate-500 dark:text-slate-400">
                  Primary Router:
                </span>
                <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {site.primaryRouter}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3">
                <span className="text-slate-500 dark:text-slate-400">
                  Hardware Model:
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {site.hardwareModel}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3">
                <span className="text-slate-500 dark:text-slate-400">
                  Device/CPE Count:
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {site.deviceCpeCount} Devices
                </span>
              </div>

              <div className="flex items-center justify-between pt-3">
                <span className="text-slate-500 dark:text-slate-400">
                  Underlay Count:
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {site.underlayCount} Underlays
                </span>
              </div>
            </div>
          </div>

          {/* Topology Correlation Logic Callout Box */}
          <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-[#060c16] border border-slate-100 dark:border-[#14233a]">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              TOPOLOGY CORRELATION LOGIC
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {site.correlationLogic}
            </p>
          </div>
        </div>

        {/* Right: 3D Network Topology Card */}
        <div className="lg:col-span-7 flex flex-col">
          <Topology3DCanvas site={site} />
        </div>
      </div>

      {/* ─── Bottom Section: Network & Service Information ─── */}
      <div className="bg-white dark:bg-[#081220] rounded-2xl border border-slate-200/80 dark:border-[#14233a] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-[#14233a] pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Network &amp; Service Information
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Detailed circuit terminations, interface mappings, and telemetry parameters for {site.name}
            </p>
          </div>

          <div className="font-mono text-xs text-slate-600 dark:text-slate-300 px-3 py-1 rounded-lg bg-slate-100 dark:bg-[#0c1a2d] border border-slate-200/80 dark:border-[#1e324d] self-start sm:self-auto">
            Router: {site.primaryRouter}
          </div>
        </div>

        {/* Circuits Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {site.circuits.map((circuit) => {
            const isCircuitOnline = circuit.status === "online";
            const isCircuitWarning = circuit.status === "warning";

            return (
              <div
                key={circuit.name}
                className="bg-white dark:bg-[#07111e] rounded-xl border border-slate-200/80 dark:border-[#14233a] p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Top row */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-[#14233a] pb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          circuit.dotColor === "blue"
                            ? "bg-blue-500"
                            : circuit.dotColor === "purple"
                            ? "bg-purple-500"
                            : circuit.dotColor === "amber"
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                      />
                      <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                        {circuit.name}
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        isCircuitOnline
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60"
                          : isCircuitWarning
                          ? "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60"
                          : "bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isCircuitOnline
                            ? "bg-emerald-500"
                            : isCircuitWarning
                            ? "bg-amber-500"
                            : "bg-rose-500"
                        }`}
                      />
                      {isCircuitOnline
                        ? "Online"
                        : isCircuitWarning
                        ? "Warning"
                        : "Offline"}
                    </span>
                  </div>

                  {/* Middle specs */}
                  <div className="mt-3.5 space-y-2 text-xs sm:text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">
                        IP Address:
                      </span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                        {circuit.ipAddress}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">
                        Interface:
                      </span>
                      <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">
                        {circuit.interface}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">
                        Configured CIR:
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {circuit.configuredCIR}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-100 dark:border-[#14233a] pt-3 mt-4 text-xs text-slate-400 dark:text-slate-500">
                  Connected Nodes: {circuit.connectedNodes}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SiteTopologyDetailView;

