"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Server,
  CheckCircle2,
  OctagonAlert,
  BellRing,
  Clock,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import KpiCard, { KpiCardProps } from "./KpiCard";
import CountUp, { CountUpProps } from "./CountUp";
import dbData from "../../data/db.json";

export { KpiCard } from "./KpiCard";
export { CountUp } from "./CountUp";
export type {
  KpiCardProps,
  KpiCardBadge,
  KpiCardFooter,
  KpiCardVariant,
} from "./KpiCard";
export type { CountUpProps } from "./CountUp";

export interface OverviewMetricData {
  totalDevices?: {
    count?: number;
    change?: string;
    linkText?: string;
  };
  onlineDevices?: {
    count?: number;
    healthyRate?: string;
    icmpReachable?: boolean;
    coreStatus?: string;
  };
  offlineDevices?: {
    count?: number;
    recovered?: string;
    circuitStatus?: string;
    triageStatus?: string;
  };
  activeAlerts?: {
    count?: number;
    changeVsLastHr?: string;
    linkText?: string;
  };
}

export interface EngineStatusInfo {
  name?: string;
  status?: string;
  lastPoll?: string;
  monitoredNodes?: number | string;
}

export interface OverviewMetricsProps {
  total?: number;
  online?: number;
  offline?: number;
  alerts?: number;
  warning?: number;
}

export interface OverviewCardsProps {
  overview?: OverviewMetricData;
  metrics?: OverviewMetricsProps;
  total?: number;
  online?: number;
  offline?: number;
  alerts?: number;
  engineStatus?: EngineStatusInfo;
  showHeader?: boolean;
  title?: string;
  subtitle?: string;
  activeCard?: "total" | "online" | "offline" | "alerts" | string;
  onNavigateToTab?: (tab: string) => void;
  onManageInventory?: () => void;
  onViewTriage?: () => void;
  onCardClick?: (cardId: string) => void;
  enableCountUp?: boolean;
  className?: string;
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({
  overview,
  metrics,
  total: totalProp,
  online: onlineProp,
  offline: offlineProp,
  alerts: alertsProp,
  engineStatus = dbData.dashboard.engineStatus,
  showHeader = true,
  title = "Network Operations Overview",
  subtitle = "Real-time health and performance of your network infrastructure",
  activeCard,
  onNavigateToTab,
  onManageInventory,
  onViewTriage,
  onCardClick,
  enableCountUp = true,
  className = "",
}) => {
  const router = useRouter();

  // Baseline data from db.json
  const defaultTotal = dbData.dashboard.overview.totalDevices;
  const defaultOnline = dbData.dashboard.overview.onlineDevices;
  const defaultOffline = dbData.dashboard.overview.offlineDevices;
  const defaultAlerts = dbData.dashboard.overview.activeAlerts;

  // Resolve counts dynamically from direct props, metrics object, overview object, or dbData
  const totalCount =
    totalProp ??
    metrics?.total ??
    overview?.totalDevices?.count ??
    defaultTotal.count;

  const onlineCount =
    onlineProp ??
    metrics?.online ??
    overview?.onlineDevices?.count ??
    defaultOnline.count;

  const offlineCount =
    offlineProp ??
    metrics?.offline ??
    overview?.offlineDevices?.count ??
    defaultOffline.count;

  const alertsCount =
    alertsProp ??
    metrics?.alerts ??
    metrics?.warning ??
    overview?.activeAlerts?.count ??
    defaultAlerts.count;

  const totalChange = overview?.totalDevices?.change ?? defaultTotal.change;
  const totalLinkText = overview?.totalDevices?.linkText ?? defaultTotal.linkText;

  const calculatedHealthyRate = totalCount
    ? `${((onlineCount / totalCount) * 100).toFixed(1)}% healthy`
    : defaultOnline.healthyRate;
  const onlineHealthyRate = overview?.onlineDevices?.healthyRate ?? calculatedHealthyRate;
  const onlineIcmp = overview?.onlineDevices?.icmpReachable ?? defaultOnline.icmpReachable;
  const onlineCoreStatus = overview?.onlineDevices?.coreStatus ?? defaultOnline.coreStatus;

  const offlineRecovered = overview?.offlineDevices?.recovered ?? defaultOffline.recovered;
  const offlineCircuit = overview?.offlineDevices?.circuitStatus ?? defaultOffline.circuitStatus;
  const offlineTriage = overview?.offlineDevices?.triageStatus ?? defaultOffline.triageStatus;

  const alertsChange = overview?.activeAlerts?.changeVsLastHr ?? defaultAlerts.changeVsLastHr;
  const alertsLinkText = overview?.activeAlerts?.linkText ?? defaultAlerts.linkText;

  const lastPoll = engineStatus?.lastPoll || "Just now";
  const monitoredNodes = engineStatus?.monitoredNodes || totalCount;

  // Smart routing navigation handlers with router fallback
  const handleInventoryClick = () => {
    if (onCardClick) {
      onCardClick("total-devices");
    } else if (onManageInventory) {
      onManageInventory();
    } else if (onNavigateToTab) {
      onNavigateToTab("device-onboarding");
    } else {
      router.push("/device-onboarding");
    }
  };

  const handleOnlineClick = () => {
    if (onCardClick) {
      onCardClick("online-devices");
    } else if (onManageInventory) {
      onManageInventory();
    } else if (onNavigateToTab) {
      onNavigateToTab("device-onboarding");
    } else {
      router.push("/device-onboarding");
    }
  };

  const handleOfflineClick = () => {
    if (onCardClick) {
      onCardClick("offline-devices");
    } else if (onViewTriage) {
      onViewTriage();
    } else if (onNavigateToTab) {
      onNavigateToTab("alert-engine");
    } else {
      router.push("/alert-engine");
    }
  };

  const handleTriageClick = () => {
    if (onCardClick) {
      onCardClick("active-alerts");
    } else if (onViewTriage) {
      onViewTriage();
    } else if (onNavigateToTab) {
      onNavigateToTab("alert-engine");
    } else {
      router.push("/alert-engine");
    }
  };

  const isTotalActive = activeCard === "total" || activeCard === "total-devices";
  const isOnlineActive = activeCard === "online" || activeCard === "online-devices";
  const isOfflineActive = activeCard === "offline" || activeCard === "offline-devices";
  const isAlertsActive = activeCard === "alerts" || activeCard === "active-alerts";

  // 4 KPI Cards configuration array
  const cards: KpiCardProps[] = [
    {
      id: "total-devices",
      title: "Total Devices",
      value: totalCount,
      countUpDelay: 0,
      countUpDuration: 1300,
      icon: <Server size={18} />,
      variant: "blue",
      badge: {
        text: totalChange,
        icon: <TrendingUp size={12} className="mr-1" />,
        variant: "emerald",
      },
      footer: {
        type: "link",
        text: totalLinkText || "Manage inventory",
        showArrow: true,
        onClick: handleInventoryClick,
      },
      onClick: handleInventoryClick,
      className: isTotalActive
        ? "border-2 border-blue-500/90 shadow-md shadow-blue-500/10"
        : "",
    },
    {
      id: "online-devices",
      title: "Online Devices",
      value: onlineCount,
      valueColor: "text-emerald-600 dark:text-emerald-400",
      countUpDelay: 140,
      countUpDuration: 1300,
      icon: <CheckCircle2 size={18} />,
      variant: "emerald",
      badge: {
        text: onlineHealthyRate,
        variant: "emerald",
      },
      footer: (
        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-[#14233a] text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>{onlineIcmp ? "ICMP Reachable" : "ICMP Degraded"}</span>
          <span className="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 group-hover:animate-ping" />
            {onlineCoreStatus}
          </span>
        </div>
      ),
      onClick: handleOnlineClick,
      className: isOnlineActive
        ? "border-2 border-emerald-500/90 dark:border-emerald-400 shadow-md shadow-emerald-500/10"
        : "",
    },
    {
      id: "offline-devices",
      title: "Offline Devices",
      value: offlineCount,
      valueColor: "text-rose-600 dark:text-rose-400",
      countUpDelay: 280,
      countUpDuration: 1300,
      icon: <OctagonAlert size={18} />,
      variant: "rose",
      badge: {
        text: offlineRecovered,
        icon: <TrendingDown size={12} className="mr-1" />,
        variant: "rose",
      },
      footer: (
        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-[#14233a] text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>{offlineCircuit}</span>
          <span className="font-semibold text-rose-600 dark:text-rose-400 group-hover:text-rose-700 dark:group-hover:text-rose-300 group-hover:underline transition-colors flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 group-hover:animate-ping" />
            {offlineTriage}
          </span>
        </div>
      ),
      onClick: handleOfflineClick,
      className: isOfflineActive
        ? "border-2 border-rose-500/90 shadow-md shadow-rose-500/10"
        : "",
    },
    {
      id: "active-alerts",
      title: "Active Alerts",
      value: alertsCount,
      valueColor: "text-amber-600 dark:text-amber-400",
      countUpDelay: 420,
      countUpDuration: 1300,
      icon: <BellRing size={18} />,
      variant: "amber",
      badge: {
        text: alertsChange,
        variant: "amber",
      },
      footer: {
        type: "link",
        text: alertsLinkText || "View triage center",
        showArrow: true,
        onClick: handleTriageClick,
      },
      onClick: handleTriageClick,
      className: isAlertsActive
        ? "border-2 border-amber-500/90 shadow-md shadow-amber-500/10"
        : "",
    },
  ];

  return (
    <div className={`w-full space-y-4 sm:space-y-6 ${className}`}>
      {/* ─── Top Section Header & Status Pill ─── */}
      {showHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {subtitle}
            </p>
          </div>

          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#081220] border border-slate-200/90 dark:border-[#14233a] shadow-xs text-xs self-start sm:self-auto shrink-0 select-none">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <span>Last Poll: {lastPoll}</span>
            </div>
            <span className="w-px h-3.5 bg-slate-200 dark:bg-slate-700" />
            <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
              <CountUp value={monitoredNodes} duration={1200} delay={100} />
              <span>Monitored Nodes</span>
            </span>
          </div>
        </div>
      )}

      {/* ─── 4 KPI Cards Grid (Mapped with staggered countup and entry animation) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card, idx) => (
          <KpiCard
            key={card.id || card.title}
            {...card}
            enableCountUp={enableCountUp}
            countUpDelay={card.countUpDelay ?? idx * 140}
            className={`animate-fade-in ${card.className || ""}`}
            style={{
              animationDelay: `${idx * 80}ms`,
              animationFillMode: "both",
              ...(card.style || {}),
            }}
          />
        ))}
      </div>
    </div>
  );
};

export const NetworkKpiCards = OverviewCards;
export default OverviewCards;
