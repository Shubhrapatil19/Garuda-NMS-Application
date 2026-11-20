"use client";

import React from "react";
import {
  Server,
  Network,
  Radio,
  Layers,
  Building2,
} from "lucide-react";
import KpiCard from "@/components/KpiCard";

export default function SummaryView() {
  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* ─── Header ─── */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Executive Summary View
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          High-level operational health, mean time to repair (MTTR), and trouble ticket bifurcation
        </p>
      </div>

      {/* ─── Top Row: 3 Dashboard-Style Executive KPI Cards ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: MONITORED SITES */}
        <KpiCard
          id="monitored-sites"
          title="Monitored Sites"
          value={634}
          enableCountUp={true}
          countUpDuration={1200}
          countUpDelay={0}
          icon={<Network size={18} />}
          variant="blue"
          badge={{
            text: "590 Online",
            variant: "emerald",
          }}
          footer={
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-[#14233a] text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                37 Partial Online
              </span>
              <span className="font-semibold text-rose-500 dark:text-rose-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                7 Offline
              </span>
            </div>
          }
        />

        {/* Card 2: CUSTOMER PREMISES HARDWARE (CPE) */}
        <KpiCard
          id="customer-premises-hardware"
          title="Customer Premises Hardware (CPE)"
          value={645}
          enableCountUp={true}
          countUpDuration={1200}
          countUpDelay={120}
          icon={<Server size={18} />}
          variant="indigo"
          badge={{
            text: "Multi-OEM Fleet",
            variant: "blue",
          }}
          footer={
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-[#14233a] text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                622 Reachable
              </span>
              <span className="font-semibold text-rose-500 dark:text-rose-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                23 Degraded
              </span>
            </div>
          }
        />

        {/* Card 3: CARRIER UNDERLAYS (CIRCUITS) */}
        <KpiCard
          id="carrier-underlays"
          title="Carrier Underlays (Circuits)"
          value={1242}
          enableCountUp={true}
          countUpDuration={1200}
          countUpDelay={240}
          icon={<Layers size={18} />}
          variant="emerald"
          badge={{
            text: "1,207 Up",
            variant: "emerald",
          }}
          footer={
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-[#14233a] text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                1,240 Tata Circuits
              </span>
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                2 BYON Circuits
              </span>
            </div>
          }
        />
      </div>

      {/* ─── Middle Section: Outage Timeline Card ─── */}
      <div className="bg-white dark:bg-[#081220] rounded-2xl border border-slate-200/80 dark:border-[#14233a] p-6 shadow-2xs space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Outage Engine &amp; Service Availability Timeline
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              NetReport correlation engine tracking MTTR and event-free availability
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs">
              Event-Free: 99.88%
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/60 font-mono shadow-2xs">
              MTTR: 24m 18s
            </span>
          </div>
        </div>

        {/* Outage Progress Bar Container */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-600 dark:text-slate-400">
              Rolling 24-Hour Outage Timeline
            </span>
            <span className="font-mono text-slate-500 dark:text-slate-400 text-[11px]">
              Total Outage Time: 1h 42m across entire fleet
            </span>
          </div>

          {/* Continuous Multi-Color Bar */}
          <div className="h-3.5 w-full rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800 shadow-inner">
            {/* 00:00 to ~08:00 (Event-free Green) */}
            <div
              className="h-full bg-emerald-500 transition-all hover:opacity-90"
              style={{ width: "33%" }}
              title="Operational State: Optimal (00:00 - 08:00)"
            />
            {/* ~08:00 Degradation (Amber) */}
            <div
              className="h-full bg-amber-500 transition-all hover:opacity-90"
              style={{ width: "3%" }}
              title="Service Degradation: Nagpur Circuit Flapping (08:00 - 08:45)"
            />
            {/* ~08:45 to ~17:30 (Green) */}
            <div
              className="h-full bg-emerald-500 transition-all hover:opacity-90"
              style={{ width: "38%" }}
              title="Operational State: Optimal (08:45 - 17:30)"
            />
            {/* ~17:30 to 18:00 Outage (Red) */}
            <div
              className="h-full bg-rose-500 transition-all hover:opacity-90"
              style={{ width: "2.5%" }}
              title="Carrier Outage: Subsea Fiber Cut (17:30 - 18:05)"
            />
            {/* 18:05 to 24:00 (Green) */}
            <div
              className="h-full bg-emerald-500 transition-all hover:opacity-90"
              style={{ width: "23.5%" }}
              title="Operational State: Optimal (18:05 - Current)"
            />
          </div>

          {/* Time Labels */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 dark:text-slate-500 pt-1">
            <span>00:00 (Start)</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>24:00 (Current)</span>
          </div>
        </div>
      </div>

      {/* ─── Bottom Row: Two Cards Side-by-Side ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
        {/* Left Card: ITSM Ticket Bifurcation */}
        <div className="bg-white dark:bg-[#081220] rounded-2xl border border-slate-200/80 dark:border-[#14233a] p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight">
                ITSM Ticket Bifurcation
              </h3>
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                Total: 70 Tickets (30 Days)
              </span>
            </div>

            {/* 2x2 Grid of Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
              {/* Open Tickets */}
              <div className="bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100/90 dark:border-blue-900/40 rounded-xl p-4 flex flex-col justify-between">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Open Tickets
                </span>
                <span className="text-3xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-2">
                  12
                </span>
              </div>

              {/* Work In Progress (WIP) */}
              <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100/90 dark:border-amber-900/40 rounded-xl p-4 flex flex-col justify-between">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Work In Progress (WIP)
                </span>
                <span className="text-3xl font-bold font-mono text-amber-500 dark:text-amber-400 mt-2">
                  6
                </span>
              </div>

              {/* Pending With Customer (PWC) */}
              <div className="bg-purple-50/60 dark:bg-purple-950/20 border border-purple-100/90 dark:border-purple-900/40 rounded-xl p-4 flex flex-col justify-between">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Pending With Customer (PWC)
                </span>
                <span className="text-3xl font-bold font-mono text-purple-600 dark:text-purple-400 mt-2">
                  4
                </span>
              </div>

              {/* Resolved Tickets */}
              <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100/90 dark:border-emerald-900/40 rounded-xl p-4 flex flex-col justify-between">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Resolved Tickets
                </span>
                <span className="text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-2">
                  48
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Top Network Applications */}
        <div className="bg-white dark:bg-[#081220] rounded-2xl border border-slate-200/80 dark:border-[#14233a] p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight">
                Top Network Applications
              </h3>
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                NetFlow / NBAR Telemetry
              </span>
            </div>

            {/* List of Applications with Progress Bars */}
            <div className="space-y-4 mt-5">
              {/* App 1: Enterprise HTTPS / TLS */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    Enterprise HTTPS / TLS
                  </span>
                  <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">
                    48.2% (2.89 Gbps)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-600 dark:bg-blue-500 transition-all"
                    style={{ width: "48.2%" }}
                  />
                </div>
              </div>

              {/* App 2: Microsoft 365 & Teams RTP */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    Microsoft 365 &amp; Teams RTP
                  </span>
                  <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">
                    24.5% (1.47 Gbps)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500 transition-all"
                    style={{ width: "24.5%" }}
                  />
                </div>
              </div>

              {/* App 3: Database / Oracle SQL+Net */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    Database / Oracle SQL+Net
                  </span>
                  <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">
                    14.1% (846 Mbps)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-slate-400 dark:bg-slate-500 transition-all"
                    style={{ width: "14.1%" }}
                  />
                </div>
              </div>

              {/* App 4: VPN IPSec ESP Traffic */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    VPN IPSec ESP Traffic
                  </span>
                  <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">
                    13.2% (792 Mbps)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-500 dark:bg-amber-400 transition-all"
                    style={{ width: "13.2%" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
