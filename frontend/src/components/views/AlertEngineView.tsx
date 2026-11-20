"use client";

import React, { useState } from "react";
import {
  Bell,
  AlertOctagon,
  AlertTriangle,
  Info,
  CheckCircle2,
  Search,
  Filter,
  Check,
  RotateCw,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import KpiCard, { KpiCardProps } from "@/components/KpiCard";
import PageHeader from "@/components/PageHeader";
import AlertRuleBuilderModal, { AlertRuleData } from "@/components/AlertRuleBuilderModal";

interface IncidentAlert {
  id: string;
  severity: "critical" | "warning" | "info";
  device: string;
  ip: string;
  site: string;
  message: string;
  timestamp: string;
  status: "active" | "acknowledged" | "resolved";
  assignedTo?: string;
}

const INITIAL_ALERTS: IncidentAlert[] = [
  { id: "alt-101", severity: "critical", device: "Core-Router-03", ip: "10.20.1.1", site: "Delhi DC", message: "BGP Session Down (Peer 10.20.1.2 unreachable)", timestamp: "2m ago", status: "active" },
  { id: "alt-102", severity: "critical", device: "Firewall-Cluster-01", ip: "10.20.1.10", site: "Delhi DC", message: "CPU Utilization > 98% (Threat Engine Spike)", timestamp: "5m ago", status: "active" },
  { id: "alt-103", severity: "critical", device: "MAA-Edge-GW-01", ip: "10.40.1.5", site: "Chennai Hub", message: "Subsea Circuit Packet Drop > 18%", timestamp: "9m ago", status: "active" },
  { id: "alt-104", severity: "critical", device: "BOM-Switch-44", ip: "10.30.2.14", site: "Mumbai Edge", message: "Power Supply Fault (PSU-2 failed)", timestamp: "14m ago", status: "acknowledged", assignedTo: "Jayesh N." },
  { id: "alt-105", severity: "warning", device: "BLR-Agg-Switch-12", ip: "10.50.1.8", site: "Bengaluru NOC", message: "SNMP Polling Timeout (Retry count: 3)", timestamp: "18m ago", status: "active" },
  { id: "alt-106", severity: "warning", device: "FRA-Transit-01", ip: "192.168.10.4", site: "Frankfurt Hub", message: "High Interface Bandwidth > 89%", timestamp: "24m ago", status: "active" },
  { id: "alt-107", severity: "warning", device: "DXB-Core-02", ip: "10.60.1.2", site: "Dubai Gateway", message: "Memory Threshold Warning (> 82%)", timestamp: "32m ago", status: "active" },
  { id: "alt-108", severity: "info", device: "DEL-Access-22", ip: "10.20.4.15", site: "Delhi DC", message: "Device successfully onboarded & provisioned", timestamp: "45m ago", status: "resolved" },
  { id: "alt-109", severity: "info", device: "BLR-NOC-HUB-01", ip: "10.50.1.1", site: "Bengaluru NOC", message: "Routine IF-MIB 64-bit Counter Refresh OK", timestamp: "1h ago", status: "resolved" },
];

export default function AlertEngineView() {
  const [alerts, setAlerts] = useState<IncidentAlert[]>(INITIAL_ALERTS);
  const [filterSeverity, setFilterSeverity] = useState<"all" | "critical" | "warning" | "info">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateRuleOpen, setIsCreateRuleOpen] = useState(false);

  const handleSaveRule = (ruleData: AlertRuleData) => {
    toast.success("Rule Activated", {
      description: `${ruleData.ruleName} is now active in the correlation pipeline.`,
    });
  };

  const filteredAlerts = alerts.filter((a) => {
    const matchesSeverity = filterSeverity === "all" || a.severity === filterSeverity;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      a.device.toLowerCase().includes(q) ||
      a.message.toLowerCase().includes(q) ||
      a.site.toLowerCase().includes(q) ||
      a.ip.includes(q);
    return matchesSeverity && matchesQuery;
  });

  const handleAcknowledge = (id: string, device: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "acknowledged", assignedTo: "Jayesh N." } : a))
    );
    toast.info("Alert Acknowledged", {
      description: `Incident on ${device} assigned to your triage queue.`,
    });
  };

  const handleResolve = (id: string, device: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "resolved" } : a))
    );
    toast.success("Incident Resolved", {
      description: `Anomaly on ${device} marked as resolved.`,
    });
  };

  const activeCount = alerts.filter((a) => a.status === "active").length;
  const criticalCount = alerts.filter((a) => a.severity === "critical").length;
  const warningCount = alerts.filter((a) => a.severity === "warning").length;
  const infoCount = alerts.filter((a) => a.severity === "info").length;

  const kpiCards: KpiCardProps[] = [
    {
      id: "active-incidents",
      title: "Active Incidents",
      value: activeCount,
      countUpDelay: 0,
      countUpDuration: 1200,
      icon: <Bell size={18} />,
      variant: "rose",
      badge: {
        text: "Needs Action",
        variant: "rose",
      },
      footer: (
        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-[#14233a] text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>Garuda Triage AI</span>
          <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Correlated
          </span>
        </div>
      ),
    },
    {
      id: "critical-severity",
      title: "Critical Severity",
      value: criticalCount,
      valueColor: "text-rose-600 dark:text-rose-400",
      countUpDelay: 120,
      countUpDuration: 1200,
      icon: <AlertOctagon size={18} />,
      variant: "rose",
      badge: {
        text: "Immediate",
        variant: "rose",
      },
      footer: (
        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-[#14233a] text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>Impact Level</span>
          <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Circuit Drops
          </span>
        </div>
      ),
    },
    {
      id: "warning-alarms",
      title: "Warning Alarms",
      value: warningCount,
      valueColor: "text-amber-600 dark:text-amber-400",
      countUpDelay: 240,
      countUpDuration: 1200,
      icon: <AlertTriangle size={18} />,
      variant: "amber",
      badge: {
        text: "Thresholds",
        variant: "amber",
      },
      footer: (
        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-[#14233a] text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>Resource Telemetry</span>
          <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            CPU &amp; Memory
          </span>
        </div>
      ),
    },
    {
      id: "resolved-today",
      title: "Resolved Today",
      value: 19,
      valueColor: "text-emerald-600 dark:text-emerald-400",
      countUpDelay: 360,
      countUpDuration: 1200,
      icon: <CheckCircle2 size={18} />,
      variant: "emerald",
      badge: {
        text: "MTTR 8.4m",
        variant: "emerald",
      },
      footer: (
        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-[#14233a] text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>Resolution Rate</span>
          <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            94% Mitigated
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* ─── Top Section Header (Identical to Dashboard Network Operations Overview) ─── */}
      <PageHeader
        title="Alert Engine & Incident Center"
        subtitle="Real-time triage, severity routing, and active circuit anomalies"
        lastPoll="Just now"
        monitoredNodes={248}
        pillLabel="Monitored Nodes"
        actions={
          <button
            type="button"
            onClick={() => setIsCreateRuleOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 shadow-md shadow-blue-500/25 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Rule</span>
          </button>
        }
      />

      {/* ─── 4 Standard KPI Cards Grid ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, idx) => (
          <KpiCard
            key={card.id || card.title}
            {...card}
            enableCountUp={false}
            countUpDelay={card.countUpDelay ?? idx * 120}
            className={`animate-fade-in ${card.className || ""}`}
            style={{
              animationDelay: `${idx * 80}ms`,
              animationFillMode: "both",
              ...(card.style || {}),
            }}
          />
        ))}
      </div>

      {/* Controls & Filter Bar */}
      <div className="bg-white dark:bg-[#081220] rounded-2xl border border-slate-200/80 dark:border-[#14233a] p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Severity Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-[#060b13] rounded-xl self-stretch sm:self-auto overflow-x-auto">
          {(["all", "critical", "warning", "info"] as const).map((sev) => (
            <button
              key={sev}
              type="button"
              onClick={() => setFilterSeverity(sev)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer whitespace-nowrap ${filterSeverity === sev
                ? "bg-white dark:bg-[#0d223f] text-slate-900 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
            >
              {sev === "all" ? `All Alerts (${alerts.length})` : `${sev} (${alerts.filter((a) => a.severity === sev).length})`}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search device, IP, message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#060b13] border border-slate-200 dark:border-[#1a283c] text-xs text-slate-700 dark:text-slate-200 placeholder-slate-400 outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Incident Alerts List */}
      <div className="bg-white dark:bg-[#081220] rounded-2xl border border-slate-200/80 dark:border-[#14233a] overflow-hidden shadow-xs">
        <div className="divide-y divide-slate-100 dark:divide-[#14233a]">
          {filteredAlerts.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              No anomalies found matching current filters.
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-4 sm:p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-[#0c1e38]/40 transition-colors"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 mt-0.5 ${alert.severity === "critical"
                      ? "bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/30"
                      : alert.severity === "warning"
                        ? "bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30"
                        : "bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30"
                      }`}
                  >
                    {alert.severity}
                  </span>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {alert.device}
                      </span>
                      <span className="font-mono text-xs text-slate-400">({alert.ip})</span>
                      <span className="text-xs text-slate-400">· {alert.site}</span>
                      <span className="text-xs text-slate-400 font-mono">· {alert.timestamp}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                      {alert.message}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                  {alert.status === "active" && (
                    <button
                      type="button"
                      onClick={() => handleAcknowledge(alert.id, alert.device)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                      Acknowledge
                    </button>
                  )}

                  {alert.status === "acknowledged" && (
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium px-2 py-1 bg-blue-50 dark:bg-blue-950/40 rounded-lg border border-blue-200/60 dark:border-blue-900/60">
                      Assigned: {alert.assignedTo}
                    </span>
                  )}

                  {alert.status !== "resolved" ? (
                    <button
                      type="button"
                      onClick={() => handleResolve(alert.id, alert.device)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Resolve</span>
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Resolved
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ─── Alert Rule Builder Modal ─── */}
      <AlertRuleBuilderModal
        isOpen={isCreateRuleOpen}
        onClose={() => setIsCreateRuleOpen(false)}
        onSave={handleSaveRule}
      />
    </div>
  );
}

