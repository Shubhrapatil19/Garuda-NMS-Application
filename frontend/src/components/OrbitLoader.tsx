import React from "react";

export interface OrbitLoaderProps {
  compact?: boolean;
  text?: string;
  subtext?: string | null;
  fullScreen?: boolean;
  className?: string;
}

/**
 * Full-screen or Container Orbit Loader for initial application loading or major view transitions
 */
export const OrbitLoader: React.FC<OrbitLoaderProps> = ({
  compact = false,
  text = "Syncing Garuda Telemetry...",
  subtext = "Polling regional collectors & underlay telemetry",
  fullScreen = false,
  className = "",
}) => {
  if (compact) {
    return (
      <div
        className={`inline-flex items-center space-x-2.5 py-1 px-3 bg-white/80 rounded-full border border-blue-100 shadow-sm backdrop-blur-sm animate-fade-in ${className}`}
        role="status"
        aria-label="Loading"
      >
        <div className="relative w-4 h-4 flex items-center justify-center shrink-0">
          <div className="absolute inset-0 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin" />
          <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-network-pulse" />
        </div>
        <span className="text-xs font-medium text-slate-600 tracking-wide select-none">
          {text}
        </span>
      </div>
    );
  }

  const loaderBody = (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 space-y-5 animate-fade-in ${className}`}
      role="status"
      aria-label="Loading"
    >
      <div className="relative w-20 h-20 flex items-center justify-center select-none">
        {/* Outer Orbit Ring */}
        <div className="absolute inset-0 rounded-full border border-dashed border-blue-300 animate-orbit opacity-75" />

        {/* Orbiting Satellite Node 1 */}
        <div className="absolute inset-0 animate-orbit">
          <div className="absolute w-2.5 h-2.5 rounded-full bg-blue-600 shadow-md shadow-blue-400 -top-1 left-1/2 -translate-x-1/2" />
        </div>

        {/* Counter Orbit Ring */}
        <div className="absolute inset-2 rounded-full border border-blue-200 animate-orbit-reverse" />

        {/* Orbiting Satellite Node 2 */}
        <div className="absolute inset-2 animate-orbit-reverse">
          <div className="absolute w-2 h-2 rounded-full bg-emerald-500 shadow-sm -bottom-1 left-1/2 -translate-x-1/2" />
        </div>

        {/* Center Pulse Core */}
        <div className="relative w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <img
            src="/garuda-logo.png"
            alt="Garuda"
            className="w-5 h-5 object-contain brightness-0 invert"
            onError={(e) => {
              e.currentTarget.src = "/Logo.png";
            }}
          />
        </div>

        {/* Radar ping */}
        <div className="absolute inset-0 rounded-full border border-blue-500/40 animate-ping-once pointer-events-none" />
      </div>

      <div className="text-center space-y-1">
        <p className="text-sm font-semibold text-slate-800 tracking-wide">{text}</p>
        {subtext && <p className="text-xs text-slate-500">{subtext}</p>}
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm animate-fade-in p-4">
        <div className="bg-white/95 rounded-2xl border border-slate-200/90 shadow-2xl">
          {loaderBody}
        </div>
      </div>
    );
  }

  return loaderBody;
};

export interface NetworkPulseLoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Network Pulse Loader
 */
export const NetworkPulseLoader: React.FC<NetworkPulseLoaderProps> = ({
  size = "md",
  className = "",
}) => {
  const dim =
    size === "sm" ? "w-4 h-4" : size === "lg" ? "w-10 h-10" : "w-6 h-6";
  return (
    <div
      className={`relative ${dim} flex items-center justify-center ${className}`}
      role="status"
      aria-label="Loading"
    >
      <div className="absolute inset-0 rounded-full bg-blue-400/20 animate-ping-once" />
      <div className="w-2/3 h-2/3 rounded-full bg-blue-500 animate-network-pulse" />
    </div>
  );
};

export interface SkeletonChartProps {
  className?: string;
}

/**
 * Shimmering Skeleton for Chart Cards
 */
export const SkeletonChart: React.FC<SkeletonChartProps> = ({ className = "" }) => (
  <div
    className={`w-full bg-white rounded-xl border border-slate-200/80 p-5 shadow-card space-y-4 animate-pulse ${className}`}
    role="status"
    aria-label="Loading chart data"
  >
    <div className="flex justify-between items-center">
      <div className="h-5 w-40 bg-slate-200 rounded" />
      <div className="h-7 w-24 bg-slate-100 rounded" />
    </div>
    <div className="h-48 w-full bg-slate-100/70 rounded-lg flex items-end p-4 space-x-3">
      <div className="h-1/3 flex-1 bg-slate-200/80 rounded-t" />
      <div className="h-2/3 flex-1 bg-slate-200/80 rounded-t" />
      <div className="h-1/2 flex-1 bg-slate-200/80 rounded-t" />
      <div className="h-3/4 flex-1 bg-slate-200/80 rounded-t" />
      <div className="h-2/5 flex-1 bg-slate-200/80 rounded-t" />
      <div className="h-4/5 flex-1 bg-slate-200/80 rounded-t" />
    </div>
    <div className="flex justify-between pt-2">
      <div className="h-3 w-16 bg-slate-200 rounded" />
      <div className="h-3 w-16 bg-slate-200 rounded" />
      <div className="h-3 w-16 bg-slate-200 rounded" />
    </div>
  </div>
);

export interface SkeletonTableProps {
  rows?: number;
  className?: string;
}

/**
 * Shimmering Skeleton for Tables
 */
export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 5,
  className = "",
}) => (
  <div
    className={`w-full bg-white rounded-xl border border-slate-200/80 p-5 shadow-card space-y-4 animate-pulse ${className}`}
    role="status"
    aria-label="Loading table data"
  >
    <div className="flex justify-between">
      <div className="h-5 w-48 bg-slate-200 rounded" />
      <div className="h-8 w-32 bg-slate-100 rounded" />
    </div>
    <div className="space-y-3 pt-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center space-x-4 py-2 border-b border-slate-100 last:border-0"
        >
          <div className="h-4 w-1/5 bg-slate-200 rounded" />
          <div className="h-4 w-1/4 bg-slate-100 rounded" />
          <div className="h-4 w-1/6 bg-slate-100 rounded" />
          <div className="h-4 w-1/6 bg-slate-100 rounded" />
          <div className="h-4 w-1/6 bg-slate-100 rounded" />
        </div>
      ))}
    </div>
  </div>
);

export default OrbitLoader;
