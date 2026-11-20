"use client";

import React from "react";
import { MapPin, ChevronRight } from "lucide-react";
import { CarrierSite } from "@/data/sitesData";

export type { CarrierSite } from "@/data/sitesData";

export interface SiteInsightCardProps {
  site: CarrierSite;
  onInspectTopology?: (site: CarrierSite) => void;
  onClick?: (site: CarrierSite) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const SiteInsightCard: React.FC<SiteInsightCardProps> = ({
  site,
  onInspectTopology,
  onClick,
  className = "",
  style,
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

  const handleInspectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onInspectTopology) {
      onInspectTopology(site);
    } else if (onClick) {
      onClick(site);
    }
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick(site);
    } else if (onInspectTopology) {
      onInspectTopology(site);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      style={style}
      className={`group relative bg-white dark:bg-[#081220] rounded-2xl border border-slate-200/80 dark:border-[#14233a] p-5 
        shadow-[0_2px_12px_rgba(0,0,0,0.03)] 
        hover:shadow-[0_8px_24px_rgba(0,0,0,0.07)] 
        hover:border-slate-300 dark:hover:border-slate-700/80 
        transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between cursor-pointer ${className}`}
    >
      <div>
        {/* Top Header: Site Name & Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h4 className="text-base sm:text-[17px] font-bold text-slate-900 dark:text-white tracking-tight truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {site.name}
            </h4>
            <p className="text-xs font-mono text-slate-400 dark:text-slate-500 mt-0.5 tracking-wider font-medium truncate">
              {site.serviceId}
            </p>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border shrink-0 ${statusInfo.badgeClass}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`} />
            {statusInfo.label}
          </span>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-100 dark:border-[#14233a] my-4" />

        {/* Middle Two-Column Info: Location & Devices/Underlays */}
        <div className="grid grid-cols-2 gap-4">
          <div className="min-w-0">
            <span className="block text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 font-normal mb-1.5">
              Location
            </span>
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
              <MapPin
                size={14}
                className="text-slate-400 dark:text-slate-500 shrink-0"
              />
              <span className="truncate">{site.location}</span>
            </div>
          </div>

          <div className="min-w-0">
            <span className="block text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 font-normal mb-1.5">
              Devices &amp; Underlays
            </span>
            <div className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
              {site.devicesAndUnderlaysText ||
                `${site.deviceCpeCount ?? site.devicesCount ?? 2} Device(s) • ${site.underlayCount ?? site.underlaysCount ?? 2} Underlay`}
            </div>
          </div>
        </div>
      </div>

      <div>
        {/* Divider */}
        <div className="border-t border-slate-100 dark:border-[#14233a] pt-3.5 mt-4" />

        {/* Footer Action */}
        <div
          onClick={handleInspectClick}
          className="flex items-center justify-between text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors group/link"
        >
          <span>Inspect site topology</span>
          <ChevronRight
            size={15}
            className="group-hover/link:translate-x-0.5 transition-transform shrink-0"
          />
        </div>
      </div>
    </div>
  );
};

export default SiteInsightCard;
