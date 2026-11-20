"use client";

import React, { useState } from "react";
import dbData from "../../data/db.json";

export interface MethodItem {
  id: string;
  name: string;
  devices: string;
  successRate: string;
}

export interface DataCollectionMethodsData {
  activePipelines?: number;
  totalMonitored?: number;
  footerNote?: string;
  methods?: MethodItem[];
}

export interface DataCollectionMethodsCardProps {
  data?: DataCollectionMethodsData;
  className?: string;
}

const defaultMethods: MethodItem[] = [
  { id: "snmp", name: "SNMP", devices: "126 Devices", successRate: "99.2%" },
  { id: "api", name: "API", devices: "54 Devices", successRate: "98.8%" },
  { id: "syslog", name: "SYSLOG", devices: "32 Devices", successRate: "99.8%" },
  { id: "push", name: "PUSH", devices: "21 Devices", successRate: "97.9%" },
  { id: "pull", name: "PULL", devices: "15 Devices", successRate: "96.7%" },
];

export const DataCollectionMethodsCard: React.FC<DataCollectionMethodsCardProps> = ({
  data,
  className = "",
}) => {
  const [selectedMethodId, setSelectedMethodId] = useState<string>("push");

  const resolvedData = data || ((dbData.dashboard as any).dataCollectionMethods as DataCollectionMethodsData);
  const methods: MethodItem[] = resolvedData?.methods || defaultMethods;
  const activePipelines = resolvedData?.activePipelines ?? 5;
  const totalMonitored = resolvedData?.totalMonitored ?? 248;
  const footerNote =
    resolvedData?.footerNote || "High-speed 64-bit IF-MIB counters enabled";

  return (
    <div
      className={`bg-white dark:bg-[#081220] rounded-2xl border border-slate-200/80 dark:border-[#14233a] p-5 sm:p-6 shadow-xs flex flex-col justify-between transition-all hover:shadow-md ${className}`}
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Data Collection Methods
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Protocol distribution and telemetry pipeline efficiency
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 select-none shrink-0">
            {activePipelines} Active Pipelines
          </span>
        </div>

        {/* 5 Pipeline Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-3.5 my-4">
          {methods.map((method: MethodItem) => {
            const isSelected = selectedMethodId === method.id;
            return (
              <div
                key={method.id}
                onClick={() => setSelectedMethodId(method.id)}
                className={`rounded-xl p-3.5 sm:p-4 transition-all cursor-pointer flex flex-col justify-between select-none ${
                  isSelected
                    ? "border-2 border-blue-400 dark:border-blue-500 bg-white dark:bg-[#0c182b] shadow-xs ring-2 ring-blue-50 dark:ring-blue-950/40"
                    : "border border-slate-200/80 dark:border-[#162740] bg-white dark:bg-[#091322] hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-2xs"
                }`}
              >
                <div>
                  <span className="block text-xs sm:text-[13px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    {method.name}
                  </span>
                  <span className="block text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-1">
                    {method.devices}
                  </span>
                </div>

                <div className="mt-3.5 flex items-center text-xs">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {method.successRate}
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 ml-1 font-normal">
                    Success
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-100 dark:border-[#14233a] pt-3.5 mt-auto flex items-center justify-between text-xs select-none">
        <span className="text-slate-400 dark:text-slate-500 font-normal">
          {footerNote}
        </span>
        <span className="font-bold text-slate-900 dark:text-white">
          Total Monitored: {totalMonitored} Devices
        </span>
      </div>
    </div>
  );
};

export default DataCollectionMethodsCard;