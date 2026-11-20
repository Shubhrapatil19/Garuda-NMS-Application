"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import dbData from "../../data/db.json";

export interface AlertItem {
  id: string;
  severity: "critical" | "warning" | "info";
  device: string;
  message: string;
  timestamp: string;
}

export interface RecentAlertsCardProps {
  alerts?: AlertItem[];
  onViewAll?: () => void;
  className?: string;
}

const defaultAlerts: AlertItem[] = [
  {
    id: "alt-1",
    severity: "critical",
    device: "Core-Router-03",
    message: "Device Offline",
    timestamp: "2 min ago",
  },
  {
    id: "alt-2",
    severity: "warning",
    device: "Firewall-01",
    message: "High CPU utilization",
    timestamp: "5 min ago",
  },
  {
    id: "alt-3",
    severity: "warning",
    device: "Switch-14",
    message: "Polling failure",
    timestamp: "12 min ago",
  },
  {
    id: "alt-4",
    severity: "info",
    device: "Router-22",
    message: "Device onboarded",
    timestamp: "24 min ago",
  },
];

export const RecentAlertsCard: React.FC<RecentAlertsCardProps> = ({
  alerts,
  onViewAll,
  className = "",
}) => {
  const resolvedAlerts: AlertItem[] =
    alerts || ((dbData.dashboard as any).recentAlerts as AlertItem[]) || defaultAlerts;

  return (
    <div
      className={`bg-white dark:bg-[#081220] rounded-2xl border border-slate-200/80 dark:border-[#14233a] p-5 sm:p-6 shadow-xs flex flex-col justify-between transition-all hover:shadow-md ${className}`}
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Recent Alerts &amp; Events
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Latest correlated operational anomalies
            </p>
          </div>
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 transition-colors cursor-pointer select-none shrink-0 group"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Alerts Stack */}
        <div className="flex flex-col gap-2.5 my-4">
          {resolvedAlerts.map((alert: AlertItem) => (
            <div
              key={alert.id}
              className="flex items-center justify-between gap-3 p-2 rounded-xl transition-colors hover:bg-slate-50/80 dark:hover:bg-[#0e1b2f]/70 cursor-default"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Severity Badge */}
                <span
                  className={`w-18 text-center py-1 rounded-full text-[11px] font-semibold shrink-0 select-none ${
                    alert.severity === "critical"
                      ? "bg-rose-50 text-rose-600 border border-rose-200/80 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/30"
                      : alert.severity === "warning"
                      ? "bg-amber-50 text-amber-600 border border-amber-200/80 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30"
                      : "bg-blue-50 text-blue-600 border border-blue-200/80 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30"
                  }`}
                >
                  {alert.severity === "critical"
                    ? "Critical"
                    : alert.severity === "warning"
                    ? "Warning"
                    : "Info"}
                </span>

                {/* Device & Description */}
                <div className="min-w-0 flex flex-col">
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                    {alert.device}
                  </span>
                  <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                    {alert.message}
                  </span>
                </div>
              </div>

              {/* Timestamp */}
              <span className="text-xs text-slate-400 dark:text-slate-500 font-mono shrink-0 select-none">
                {alert.timestamp}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentAlertsCard;