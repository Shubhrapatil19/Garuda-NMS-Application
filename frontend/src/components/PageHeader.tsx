"use client";

import React from "react";
import { Clock } from "lucide-react";
import CountUp from "./CountUp";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  lastPoll?: string;
  monitoredNodes?: number | string;
  pillLabel?: string;
  showPill?: boolean;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  lastPoll = "Just now",
  monitoredNodes = 248,
  pillLabel = "Monitored Nodes",
  showPill = true,
  actions,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 ${className}`}
    >
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {subtitle}
          </p>
        )}
      </div>

      {actions ? (
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {actions}
        </div>
      ) : showPill ? (
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#081220] border border-slate-200/90 dark:border-[#14233a] shadow-xs text-xs self-start sm:self-auto shrink-0 select-none">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            <span>Last Poll: {lastPoll}</span>
          </div>
          <span className="w-px h-3.5 bg-slate-200 dark:bg-slate-700" />
          <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
            <CountUp value={monitoredNodes} duration={1200} delay={100} />
            <span>{pillLabel}</span>
          </span>
        </div>
      ) : null}
    </div>
  );
};

export default PageHeader;
