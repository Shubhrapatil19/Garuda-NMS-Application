"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Bell,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Search,
  Plus,
  Loader2,
  RotateCw,
  Activity,
  Sliders,
  ShieldCheck,
  Zap,
  Ticket,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import KpiCard, { KpiCardProps } from "@/components/KpiCard";
import PageHeader from "@/components/PageHeader";
import AlertRuleBuilderModal from "@/components/AlertRuleBuilderModal";
import {
  alertService,
  AlertEvent,
  ActiveAlertRule,
  AlertKpiMetrics,
} from "@/services/alertService";

export const getSeverityBadge = (severity: string): React.JSX.Element => {
  const sev = severity.toLowerCase();
  if (sev === "critical") {
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/40">
        Critical
      </span>
    );
  }
  if (sev === "warning") {
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/40">
        Warning
      </span>
    );
  }
  if (sev === "info") {
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/40">
        Info
      </span>
    );
  }
  return (
    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700">
      {severity || "Low"}
    </span>
  );
};

export const getLifecycleStatusBadge = (status: string): React.JSX.Element => {
  const st = status.toUpperCase();
  if (st === "ACKNOWLEDGED") {
    return (
      <span className="px-2.5 py-1 rounded text-[11px] font-bold tracking-wider uppercase bg-[#fef3c7] text-[#b45309] dark:bg-[#452807] dark:text-[#fde68a]">
        ACKNOWLEDGED
      </span>
    );
  }
  if (st === "IN_PROGRESS" || st === "IN PROGRESS") {
    return (
      <span className="px-2.5 py-1 rounded text-[11px] font-bold tracking-wider uppercase bg-[#dbeafe] text-[#1d4ed8] dark:bg-[#172554] dark:text-[#93c5fd]">
        IN_PROGRESS
      </span>
    );
  }
  if (st === "OPEN" || st === "ACTIVE") {
    return (
      <span className="px-2.5 py-1 rounded text-[11px] font-bold tracking-wider uppercase bg-[#ffe4e6] text-[#be123c] dark:bg-[#4c0519] dark:text-[#fecdd3]">
        OPEN
      </span>
    );
  }
  return (
    <span className="px-2.5 py-1 rounded text-[11px] font-bold tracking-wider uppercase bg-[#dcfce7] text-[#15803d] dark:bg-[#052e16] dark:text-[#86efac]">
      RESOLVED
    </span>
  );
};

export const getComponentTypeBadge = (type: string): React.JSX.Element => {
  return (
    <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 dark:bg-[#0c182a] dark:text-slate-300">
      {type}
    </span>
  );
};

interface AlertActionCellProps {
  alert: AlertEvent;
  onAcknowledge: (id: string, eventId: string) => void;
  onResolve: (id: string, eventId: string) => void;
}

const AlertActionCell: React.FC<Readonly<AlertActionCellProps>> = ({
  alert,
  onAcknowledge,
  onResolve,
}) => {
  const isResolved = alert.lifecycleStatus.toUpperCase() === "RESOLVED";
  const isOpen =
    alert.lifecycleStatus.toUpperCase() === "OPEN" ||
    alert.lifecycleStatus.toUpperCase() === "ACTIVE";

  if (isResolved) {
    return (
      <div className="flex items-center justify-end">
        <span className="h-7 px-2 inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 dark:text-slate-500 whitespace-nowrap">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>Action Performed</span>
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-2 flex-nowrap whitespace-nowrap">
      {isOpen && (
        <button
          type="button"
          onClick={() => onAcknowledge(alert.id, alert.eventId)}
          className="h-7 px-3 inline-flex items-center justify-center text-xs font-semibold rounded-md border border-slate-200 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-[#0c182a] dark:hover:bg-[#12233f] text-slate-700 dark:text-slate-200 shadow-2xs hover:shadow-xs transition-all cursor-pointer active:scale-95"
        >
          Ack
        </button>
      )}
      <button
        type="button"
        onClick={() => onResolve(alert.id, alert.eventId)}
        className="h-7 px-3 inline-flex items-center justify-center text-xs font-semibold rounded-md border border-emerald-500/30 dark:border-emerald-700/50 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 shadow-2xs hover:shadow-xs transition-all cursor-pointer active:scale-95"
      >
        Resolve
      </button>
    </div>
  );
};

export default function AlertEngineView() {
  const [alerts, setAlerts] = useState<AlertEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Summary KPI Metrics state (GET /api/v1/alerts/kpi)
  const [kpiMetrics, setKpiMetrics] = useState<AlertKpiMetrics | null>(null);
  const [, setIsLoadingKpi] = useState<boolean>(true);

  // Active Alert Rules state (GET /api/v1/alerts/rules)
  const [rules, setRules] = useState<ActiveAlertRule[]>([]);
  const [isLoadingRules, setIsLoadingRules] = useState<boolean>(true);
  const [rulesError, setRulesError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"triage" | "rules">("triage");

  // Filters matching Swagger parameters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterSeverity, setFilterSeverity] = useState("All");
  const [filterTimeRange, setFilterTimeRange] = useState("All");

  const [isCreateRuleOpen, setIsCreateRuleOpen] = useState(false);

  const fetchKpi = useCallback(async () => {
    setIsLoadingKpi(true);
    try {
      const data = await alertService.getKpiMetrics();
      setKpiMetrics(data);
    } catch {
      // Gracefully retain existing state on error
    } finally {
      setIsLoadingKpi(false);
    }
  }, []);

  const fetchAlerts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await alertService.getAlerts({
        search: searchQuery,
        type: filterType,
        severity: filterSeverity,
        timeRange: filterTimeRange,
      });
      setAlerts(data);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Unable to retrieve alert events from the server.";
      setError(msg);
      setAlerts([]); // Zero dummy data on error
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, filterType, filterSeverity, filterTimeRange]);

  const fetchRules = useCallback(async () => {
    setIsLoadingRules(true);
    setRulesError(null);
    try {
      const data = await alertService.getRules();
      setRules(data);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Unable to retrieve active alert rules from the server.";
      setRulesError(msg);
      setRules([]); // Zero dummy data on error
    } finally {
      setIsLoadingRules(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAlerts();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchAlerts]);

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      if (isMounted) {
        fetchRules();
        fetchKpi();
      }
    }, 0);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [fetchRules, fetchKpi]);

  const handleSyncAll = async () => {
    await Promise.allSettled([fetchAlerts(), fetchRules(), fetchKpi()]);
    toast.info("Refreshed", {
      description: "Alert events, active rules, and summary KPI metrics synchronized.",
    });
  };

  const handleAcknowledge = (id: string, eventId: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, lifecycleStatus: "ACKNOWLEDGED" } : a
      )
    );
    toast.info("Alert Acknowledged", {
      description: `Event ${eventId} has been assigned and status set to ACKNOWLEDGED.`,
    });
  };

  const handleResolve = (id: string, eventId: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, lifecycleStatus: "RESOLVED" } : a
      )
    );
    toast.success("Event Resolved", {
      description: `Event ${eventId} has been marked as RESOLVED.`,
    });
  };

  const activeAlertsCount = kpiMetrics?.activeAlerts ?? 0;
  const criticalAlarmsCount = kpiMetrics?.criticalAlarms ?? 0;
  const openTicketsCount = kpiMetrics?.openTickets ?? 0;
  const suppressedCount = kpiMetrics?.suppressedCount ?? 0;

  const rulesKpiCards: KpiCardProps[] = [
    {
      id: "total-rules",
      title: "Configured Rules",
      value: rules.length,
      countUpDelay: 0,
      countUpDuration: 1200,
      icon: <Sliders size={18} />,
      variant: "blue",
      badge: {
        text: rules.length > 0 ? "Engine Loaded" : "Zero Rules",
        variant: rules.length > 0 ? "blue" : "slate",
      },
      footer: (
        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-[#14233a] text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>Engine Pipeline</span>
          <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Configured
          </span>
        </div>
      ),
    },
    {
      id: "active-automations",
      title: "Running Automations",
      value: rules.filter((r) => r.status.toUpperCase() === "ACTIVE").length,
      valueColor: "text-emerald-600 dark:text-emerald-400",
      countUpDelay: 120,
      countUpDuration: 1200,
      icon: <ShieldCheck size={18} />,
      variant: "emerald",
      badge: {
        text: "Autonomous",
        variant: "emerald",
      },
      footer: (
        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-[#14233a] text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>Escalation Engine</span>
          <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Live Polling
          </span>
        </div>
      ),
    },
    {
      id: "monitored-metrics",
      title: "Monitored Metrics",
      value: new Set(rules.map((r) => r.metricName).filter(Boolean)).size,
      valueColor: "text-indigo-600 dark:text-indigo-400",
      countUpDelay: 240,
      countUpDuration: 1200,
      icon: <Activity size={18} />,
      variant: "indigo",
      badge: {
        text: "Telemetry Types",
        variant: "indigo",
      },
      footer: (
        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-[#14233a] text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>Telemetry Sources</span>
          <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            Correlated
          </span>
        </div>
      ),
    },
    {
      id: "action-triggers",
      title: "Action Webhooks",
      value: rules.filter((r) => r.actionAutomation && r.actionAutomation !== "—").length,
      valueColor: "text-amber-600 dark:text-amber-400",
      countUpDelay: 360,
      countUpDuration: 1200,
      icon: <Zap size={18} />,
      variant: "amber",
      badge: {
        text: "ITSM / Webhooks",
        variant: "amber",
      },
      footer: (
        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-[#14233a] text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>Ticket Dispatch</span>
          <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Active
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* ─── Top Section Header ─── */}
      <PageHeader
        title="Alert Engine & Incident Center"
        subtitle="Real-time triage, severity routing, and automated correlation pipeline"
        lastPoll="Just now"
        monitoredNodes={activeTab === "triage" ? alerts.length : rules.length}
        pillLabel={activeTab === "triage" ? "Matched Events" : "Active Rules"}
        actions={
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleSyncAll}
              disabled={isLoading || isLoadingRules}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#081220] border border-slate-200 dark:border-[#14233a] hover:bg-slate-50 dark:hover:bg-[#0c182a] transition-all cursor-pointer disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoading || isLoadingRules ? "animate-spin" : ""}`} />
              <span>Sync</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCreateRuleOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 shadow-md shadow-blue-500/25 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Rule</span>
            </button>
          </div>
        }
      />

      {/* ─── Engine View Switcher Tabs ─── */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-[#14233a] pb-1">
        <button
          type="button"
          onClick={() => setActiveTab("triage")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "triage"
              ? "bg-blue-600 text-white shadow-sm shadow-blue-500/25"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#0c182a]"
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Event Triage Grid</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              activeTab === "triage"
                ? "bg-white/20 text-white"
                : "bg-slate-200 dark:bg-[#162744] text-slate-700 dark:text-slate-300"
            }`}
          >
            {alerts.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("rules")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "rules"
              ? "bg-blue-600 text-white shadow-sm shadow-blue-500/25"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#0c182a]"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Active Alert Rules</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              activeTab === "rules"
                ? "bg-white/20 text-white"
                : "bg-slate-200 dark:bg-[#162744] text-slate-700 dark:text-slate-300"
            }`}
          >
            {rules.length}
          </span>
        </button>
      </div>

      {activeTab === "triage" ? (
        <>
          {/* ─── Summary KPI Metrics Cards (GET /api/v1/alerts/kpi) ─── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: ACTIVE ALERTS (WARNING/SOFT) */}
            <div className="bg-white dark:bg-[#081220] rounded-2xl border border-slate-200/80 dark:border-[#14233a] p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    ACTIVE ALERTS
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 block mt-0.5">
                    (WARNING/SOFT)
                  </span>
                </div>
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 dark:text-amber-400 flex items-center justify-center border border-amber-200/60 dark:border-amber-800/40 shrink-0">
                  <Bell className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-3 flex items-baseline justify-between gap-2">
                <span className="text-3xl font-extrabold text-[#d97706] dark:text-amber-400 tracking-tight font-sans">
                  {activeAlertsCount}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40 shrink-0">
                  <TrendingDown className="w-3 h-3 text-emerald-500" />
                  <span>-4% vs last hour</span>
                </span>
              </div>

              <div className="mt-2 text-xs text-slate-400 dark:text-slate-500 truncate">
                Soft threshold breaches
              </div>
            </div>

            {/* Card 2: CRITICAL ALARMS (HARD/URGENT) */}
            <div className="bg-white dark:bg-[#081220] rounded-2xl border border-slate-200/80 dark:border-[#14233a] p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    CRITICAL ALARMS
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 block mt-0.5">
                    (HARD/URGENT)
                  </span>
                </div>
                <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 dark:text-rose-400 flex items-center justify-center border border-rose-200/60 dark:border-rose-800/40 shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-3 flex items-baseline justify-between gap-2">
                <span className="text-3xl font-extrabold text-[#e11d48] dark:text-rose-400 tracking-tight font-sans">
                  {criticalAlarmsCount}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-600 border border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/40 shrink-0">
                  <TrendingUp className="w-3 h-3 text-rose-500" />
                  <span>+2 new</span>
                </span>
              </div>

              <div className="mt-2 text-xs text-slate-400 dark:text-slate-500 truncate">
                Sustained outage conditions
              </div>
            </div>

            {/* Card 3: OPEN TICKETS (ITSM LINKED) */}
            <div className="bg-white dark:bg-[#081220] rounded-2xl border border-slate-200/80 dark:border-[#14233a] p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    OPEN TICKETS (ITSM LINKED)
                  </span>
                </div>
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-500 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/40 shrink-0">
                  <Ticket className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-3 flex items-baseline justify-between gap-2">
                <span className="text-3xl font-extrabold text-[#2563eb] dark:text-blue-400 tracking-tight font-sans">
                  {openTicketsCount}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200/60 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 shrink-0">
                  Stable
                </span>
              </div>

              <div className="mt-2 text-xs text-slate-400 dark:text-slate-500 truncate">
                Jira &amp; ServiceNow webhooks
              </div>
            </div>

            {/* Card 4: SUPPRESSED / FLAPPING */}
            <div className="bg-white dark:bg-[#081220] rounded-2xl border border-slate-200/80 dark:border-[#14233a] p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    SUPPRESSED / FLAPPING
                  </span>
                </div>
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 flex items-center justify-center border border-slate-200/60 dark:border-slate-700/60 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-3 flex items-baseline justify-between gap-2">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-sans">
                  {suppressedCount}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-600 border border-indigo-200/60 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/40 shrink-0">
                  Deduplication active
                </span>
              </div>

              <div className="mt-2 text-xs text-slate-400 dark:text-slate-500 truncate">
                Hysteresis dampening
              </div>
            </div>
          </div>

          {/* ─── Controls & Filter Bar (Matching Swagger API parameters) ─── */}
          <div className="bg-white dark:bg-[#081220] rounded-2xl border border-slate-200/80 dark:border-[#14233a] p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-56">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="alert-search-input"
                type="text"
                placeholder="Search keyword (Device, Rule, Event ID)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9.5 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-[#060b13] border border-slate-200 dark:border-[#1a283c] text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Component Type */}
              <div className="flex items-center gap-1.5">
                <label htmlFor="filter-type-select" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Type:
                </label>
                <select
                  id="filter-type-select"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#060b13] border border-slate-200 dark:border-[#1a283c] text-xs font-medium text-slate-700 dark:text-slate-200 outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="All">All Types</option>
                  <option value="Alerts">Alerts</option>
                  <option value="Alarms">Alarms</option>
                  <option value="Tickets">Tickets</option>
                </select>
              </div>

              {/* Severity */}
              <div className="flex items-center gap-1.5">
                <label htmlFor="filter-severity-select" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Severity:
                </label>
                <select
                  id="filter-severity-select"
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#060b13] border border-slate-200 dark:border-[#1a283c] text-xs font-medium text-slate-700 dark:text-slate-200 outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="All">All Severities</option>
                  <option value="Critical">Critical</option>
                  <option value="Warning">Warning</option>
                  <option value="Info">Info</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              {/* Time Range */}
              <div className="flex items-center gap-1.5">
                <label htmlFor="filter-timerange-select" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Time:
                </label>
                <select
                  id="filter-timerange-select"
                  value={filterTimeRange}
                  onChange={(e) => setFilterTimeRange(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#060b13] border border-slate-200 dark:border-[#1a283c] text-xs font-medium text-slate-700 dark:text-slate-200 outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="All">All Time</option>
                  <option value="Last 1 hour">Last 1 hour</option>
                  <option value="Last 24 hours">Last 24 hours</option>
                  <option value="Last 7 days">Last 7 days</option>
                </select>
              </div>
            </div>
          </div>

      {/* ─── Event Triage Data Grid (Exact layout from user specification) ─── */}
      <div className="bg-white dark:bg-[#081220] rounded-2xl border border-slate-200/80 dark:border-[#14233a] overflow-hidden shadow-xs">
        {/* Table Card Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 dark:border-[#14233a] flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white dark:bg-[#081220]">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Event Triage Data Grid ({alerts.length} Matched)
          </h3>
          <span className="text-xs font-mono text-slate-400 dark:text-slate-500 tracking-tight">
            State Machine: Automated RCA Pipeline
          </span>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto [scrollbar-width:thin]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-[#14233a] text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-[#060b13]/50">
                <th className="py-3 px-3 sm:px-4 whitespace-nowrap">EVENT ID</th>
                <th className="py-3 px-3 sm:px-4 whitespace-nowrap">TIMESTAMP</th>
                <th className="py-3 px-2.5 sm:px-3 whitespace-nowrap">TYPE</th>
                <th className="py-3 px-2.5 sm:px-3 whitespace-nowrap">SEVERITY</th>
                <th className="py-3 px-3 sm:px-4 whitespace-nowrap">SOURCE DEVICE</th>
                <th className="py-3 px-3 sm:px-4">RULE / TRIGGER SOURCE</th>
                <th className="py-3 px-2.5 sm:px-3 whitespace-nowrap">STATUS</th>
                <th className="py-3 px-3 sm:px-4 text-right whitespace-nowrap">ACTIONS</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-[#14233a]">
              {/* 1. Loading State */}
              {isLoading && (
                <tr>
                  <td colSpan={8} className="py-14 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                      <span className="text-sm font-medium">Fetching real-time alert events...</span>
                    </div>
                  </td>
                </tr>
              )}

              {/* 2. Error State */}
              {!isLoading && error && (
                <tr>
                  <td colSpan={8} className="py-14 text-center">
                    <div className="flex flex-col items-center justify-center gap-2.5 text-slate-500 dark:text-slate-400 px-4">
                      <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                        <AlertOctagon className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        Unable to Load Alert Events
                      </p>
                      <p className="text-xs text-slate-400 max-w-md">
                        {error}
                      </p>
                      <button
                        type="button"
                        onClick={fetchAlerts}
                        className="mt-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>Retry Connection</span>
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {/* 3. Empty State (Zero Dummy Data) */}
              {!isLoading && !error && alerts.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-14 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-400 px-4">
                      <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <Bell className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        No Alert Events Found
                      </p>
                      <p className="text-xs text-slate-400 max-w-md">
                        There are currently no alert events returned by the server matching the specified filters.
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {/* 4. Data Rows */}
              {!isLoading &&
                !error &&
                alerts.map((alert) => (
                  <tr
                    key={alert.id || alert.eventId}
                    className="hover:bg-slate-50/60 dark:hover:bg-[#0c1e38]/30 transition-colors"
                  >
                    {/* EVENT ID */}
                    <td className="py-3 px-3 sm:px-4 font-mono text-xs font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {alert.eventId}
                    </td>

                    {/* TIMESTAMP */}
                    <td className="py-3 px-3 sm:px-4 font-mono text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {alert.timestamp}
                    </td>

                    {/* COMPONENT TYPE */}
                    <td className="py-3 px-2.5 sm:px-3 whitespace-nowrap">
                      {getComponentTypeBadge(alert.componentType)}
                    </td>

                    {/* SEVERITY */}
                    <td className="py-3 px-2.5 sm:px-3 whitespace-nowrap">
                      {getSeverityBadge(alert.severity)}
                    </td>

                    {/* SOURCE DEVICE */}
                    <td className="py-3 px-3 sm:px-4 font-bold text-xs text-slate-900 dark:text-white whitespace-nowrap">
                      {alert.sourceDevice}
                    </td>

                    {/* RULE / TRIGGER SOURCE */}
                    <td
                      className="py-3 px-3 sm:px-4 text-xs text-slate-600 dark:text-slate-300 max-w-xs md:max-w-sm truncate"
                      title={alert.ruleTriggerSource}
                    >
                      {alert.ruleTriggerSource}
                    </td>

                    {/* LIFECYCLE STATUS */}
                    <td className="py-3 px-2.5 sm:px-3 whitespace-nowrap">
                      {getLifecycleStatusBadge(alert.lifecycleStatus)}
                    </td>

                    {/* ACTIONS */}
                    <td className="py-3 px-3 sm:px-4 text-right whitespace-nowrap">
                      <AlertActionCell
                        alert={alert}
                        onAcknowledge={handleAcknowledge}
                        onResolve={handleResolve}
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
        </>
      ) : (
        <>
          {/* ─── Active Alert Rules KPI Summary ─── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {rulesKpiCards.map((card, idx) => (
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

          {/* ─── Active Alert Rules Data Grid (GET /api/v1/alerts/rules) ─── */}
          <div className="bg-white dark:bg-[#081220] rounded-2xl border border-slate-200/80 dark:border-[#14233a] overflow-hidden shadow-xs">
            {/* Table Card Header */}
            <div className="px-6 py-4.5 border-b border-slate-100 dark:border-[#14233a] flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white dark:bg-[#081220]">
              <div className="flex items-center gap-2.5">
                <Sliders className="w-4 h-4 text-blue-500" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Active Alert Rules ({rules.length} Configured)
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400 dark:text-slate-500 tracking-tight">
                Engine State: Autonomous Metric Trigger &amp; Escalation Pipeline
              </span>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto [scrollbar-width:thin]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-[#14233a] text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-[#060b13]/50">
                    <th className="py-3 px-3 sm:px-4 whitespace-nowrap">RULE NAME</th>
                    <th className="py-3 px-3 sm:px-4 whitespace-nowrap">MONITORED METRIC</th>
                    <th className="py-3 px-3 sm:px-4">TRIGGER CONDITION</th>
                    <th className="py-3 px-3 sm:px-4">ESCALATION THRESHOLD</th>
                    <th className="py-3 px-3 sm:px-4">ACTION AUTOMATION</th>
                    <th className="py-3 px-3 sm:px-4 text-center whitespace-nowrap">STATUS</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-[#14233a]">
                  {/* 1. Loading State */}
                  {isLoadingRules && (
                    <tr>
                      <td colSpan={6} className="py-14 text-center">
                        <div className="flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
                          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                          <span className="text-sm font-medium">Fetching active alert rules from engine...</span>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* 2. Error State */}
                  {!isLoadingRules && rulesError && (
                    <tr>
                      <td colSpan={6} className="py-12 px-4 text-center">
                        <div className="flex flex-col items-center justify-center gap-2 max-w-md mx-auto">
                          <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 border border-rose-200 dark:border-rose-800 flex items-center justify-center mb-1">
                            <AlertTriangle className="w-5 h-5" />
                          </div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                            Failed to retrieve alert rules
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {rulesError}
                          </p>
                          <button
                            type="button"
                            onClick={fetchRules}
                            className="mt-3 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors cursor-pointer"
                          >
                            Retry Fetch
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* 3. Empty State (Zero Dummy Data) */}
                  {!isLoadingRules && !rulesError && rules.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-14 text-center">
                        <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto text-slate-400">
                          <Sliders className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-1" />
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            No Active Rules Configured
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            No escalation or automation rules found in the engine.
                          </p>
                          <button
                            type="button"
                            onClick={() => setIsCreateRuleOpen(true)}
                            className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all cursor-pointer shadow-sm"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Create New Rule</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* 4. Populated Rules Rows */}
                  {!isLoadingRules &&
                    !rulesError &&
                    rules.map((rule) => (
                      <tr
                        key={rule.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-[#0c1e38]/40 transition-colors text-xs"
                      >
                        {/* RULE NAME */}
                        <td className="py-3 px-3 sm:px-4">
                          <div className="flex flex-col min-w-40">
                            <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-[13px]">
                              {rule.ruleName}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 truncate max-w-48 mt-0.5">
                              ID: {rule.id}
                            </span>
                          </div>
                        </td>

                        {/* MONITORED METRIC */}
                        <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-blue-50 text-blue-700 border border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/40">
                            {rule.metricName}
                          </span>
                        </td>

                        {/* TRIGGER CONDITION */}
                        <td className="py-3 px-3 sm:px-4 text-slate-700 dark:text-slate-300 max-w-xs">
                          <span className="line-clamp-2" title={rule.triggerCondition}>
                            {rule.triggerCondition}
                          </span>
                        </td>

                        {/* ESCALATION THRESHOLD */}
                        <td className="py-3 px-3 sm:px-4 text-slate-600 dark:text-slate-400 max-w-xs">
                          <span className="line-clamp-2" title={rule.escalationThreshold}>
                            {rule.escalationThreshold}
                          </span>
                        </td>

                        {/* ACTION AUTOMATION */}
                        <td className="py-3 px-3 sm:px-4 text-slate-700 dark:text-slate-300 max-w-xs">
                          <span className="line-clamp-2" title={rule.actionAutomation}>
                            {rule.actionAutomation}
                          </span>
                        </td>

                        {/* STATUS */}
                        <td className="py-3 px-3 sm:px-4 text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {rule.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ─── Alert Rule Builder Modal ─── */}
      <AlertRuleBuilderModal
        isOpen={isCreateRuleOpen}
        onClose={() => setIsCreateRuleOpen(false)}
        onSave={async () => {
          await Promise.allSettled([fetchRules(), fetchAlerts()]);
          setActiveTab("rules");
        }}
      />
    </div>
  );
}
