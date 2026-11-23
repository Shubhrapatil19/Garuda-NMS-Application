"use client";

import React, { useState, useEffect, useId } from "react";
import CountUp from "./CountUp";

export interface StatusBreakdownItem {
  label: string;
  count: number;
  percentage: number;
  color: string;
}

export interface DeviceHealthData {
  monitoredAssets?: number;
  operationalRate?: string;
  breakdown?: StatusBreakdownItem[];
}

export interface DeviceHealthCardProps {
  data?: DeviceHealthData;
  monitoredAssets?: number;
  className?: string;
}

export const DeviceHealthCard: React.FC<DeviceHealthCardProps> = ({
  data,
  monitoredAssets: monitoredAssetsProp,
  className = "",
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [animationFinished, setAnimationFinished] = useState(false);
  const [hasCountedUp, setHasCountedUp] = useState(false);
  const rawId = useId();
  const maskId = `donutSweepMask-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  useEffect(() => {
    // Unset mask after animation completes and mark initial count-up complete
    const timer = setTimeout(() => {
      setAnimationFinished(true);
      setHasCountedUp(true);
    }, 1600);
    return () => clearTimeout(timer);
  }, []);

  const breakdown = data?.breakdown || [
    { label: "Online", count: 231, percentage: 88.5, color: "#10b981" },
    { label: "Warning", count: 9, percentage: 3.5, color: "#f59e0b" },
    { label: "Offline", count: 17, percentage: 6.5, color: "#ef4444" },
    { label: "Maintenance", count: 4, percentage: 1.5, color: "#64748b" },
  ];

  // Total devices counted in breakdown
  const totalCount = breakdown.reduce((sum, item) => sum + item.count, 0);
  const activeItem = hoveredIndex !== null ? breakdown[hoveredIndex] : null;

  // Exact Donut Geometry (matches reference image with flat radial cut boundaries)
  const size = 180;
  const center = size / 2; // 90
  const rOuter = 82;
  const rInner = 58;
  const midR = (rOuter + rInner) / 2; // 70
  const ringWidth = rOuter - rInner; // 24
  const circumference = Math.round(2 * Math.PI * midR); // ~440

  // Helper to generate precise SVG donut sector path (flat radial cuts, seamless ring)
  const describeDonutArc = (
    cx: number,
    cy: number,
    innerR: number,
    outerR: number,
    startAngleDeg: number,
    endAngleDeg: number
  ): string => {
    // Top 12 o'clock corresponds to -90 degrees in SVG coordinates
    const startRad = ((startAngleDeg - 90) * Math.PI) / 180;
    const endRad = ((endAngleDeg - 90) * Math.PI) / 180;

    const x1Outer = cx + outerR * Math.cos(startRad);
    const y1Outer = cy + outerR * Math.sin(startRad);
    const x2Outer = cx + outerR * Math.cos(endRad);
    const y2Outer = cy + outerR * Math.sin(endRad);

    const x1Inner = cx + innerR * Math.cos(endRad);
    const y1Inner = cy + innerR * Math.sin(endRad);
    const x2Inner = cx + innerR * Math.cos(startRad);
    const y2Inner = cy + innerR * Math.sin(startRad);

    const largeArcFlag = endAngleDeg - startAngleDeg > 180 ? 1 : 0;

    return [
      `M ${x1Outer.toFixed(3)} ${y1Outer.toFixed(3)}`,
      `A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${x2Outer.toFixed(3)} ${y2Outer.toFixed(3)}`,
      `L ${x1Inner.toFixed(3)} ${y1Inner.toFixed(3)}`,
      `A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${x2Inner.toFixed(3)} ${y2Inner.toFixed(3)}`,
      "Z",
    ].join(" ");
  };

  // Pre-calculate sectors with exact angles without mutating outer render variables
  const sectors = breakdown.map((item, index) => {
    const startAngle = breakdown
      .slice(0, index)
      .reduce((sum, prev) => sum + (prev.percentage / 100) * 360, 0);
    const sweepAngle = (item.percentage / 100) * 360;
    const endAngle = startAngle + sweepAngle;

    return {
      ...item,
      pathData: describeDonutArc(center, center, rInner, rOuter, startAngle, endAngle),
      hoverPathData: describeDonutArc(center, center, rInner - 1, rOuter + 2, startAngle, endAngle),
    };
  });

  const monitoredAssets = monitoredAssetsProp ?? data?.monitoredAssets ?? 261;
  const operationalRate = data?.operationalRate ?? "98.2% Operational";

  const renderCenterCount = () => {
    if (activeItem) {
      return activeItem.count;
    }
    if (!hasCountedUp) {
      return (
        <CountUp
          value={totalCount}
          duration={1300}
          delay={100}
          onComplete={() => setHasCountedUp(true)}
        />
      );
    }
    return totalCount;
  };

  return (
    <div
      className={`bg-white dark:bg-[#081220] rounded-2xl border border-slate-200/80 dark:border-[#14233a] p-5 sm:p-6 shadow-xs flex flex-col justify-between transition-all hover:shadow-md ${className}`}
    >
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Device Health
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Real-time status across {monitoredAssets} monitored assets
            </p>
          </div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-[#0e1b2f] border border-slate-200/70 dark:border-[#162740] select-none shrink-0">
            Total: {monitoredAssets}
          </span>
        </div>

        {/* Donut & Legend Container */}
        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4 sm:gap-6 my-4 sm:my-5">
          {/* Donut SVG with Initial 0 to 100% Circle Sweep Completion Animation */}
          <div className="relative w-40 h-40 sm:w-44 sm:h-44 shrink-0 flex items-center justify-center">
            <svg
              className="w-full h-full select-none"
              viewBox={`0 0 ${size} ${size}`}
              role="img"
              aria-label="Device Health Breakdown Donut Chart"
            >
              <title>Device Health Breakdown Donut Chart</title>
              <defs>
                <style>{`
                  @keyframes donutCompleteSweep {
                    0% {
                      stroke-dashoffset: ${circumference};
                    }
                    100% {
                      stroke-dashoffset: 0;
                    }
                  }
                  .animate-donut-circle-sweep {
                    stroke-dasharray: ${circumference};
                    stroke-dashoffset: ${circumference};
                    animation: donutCompleteSweep 1.4s cubic-bezier(0.25, 1, 0.5, 1) 0.1s forwards;
                    transform: rotate(-90deg);
                    transform-origin: ${center}px ${center}px;
                  }
                `}</style>
                <mask id={maskId}>
                  <circle
                    cx={center}
                    cy={center}
                    r={midR}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth={ringWidth + 14}
                    strokeLinecap="round"
                    className="animate-donut-circle-sweep"
                  />
                </mask>
              </defs>

              {/* Slices masked during initial circle sweep completion animation */}
              <g mask={animationFinished ? undefined : `url(#${maskId})`}>
                {sectors.map((slice, idx) => {
                  const isHovered = hoveredIndex === idx;
                  return (
                    <path
                      key={slice.label}
                      d={isHovered ? slice.hoverPathData : slice.pathData}
                      fill={slice.color}
                      className="cursor-pointer transition-all duration-150 ease-out"
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      style={{
                        opacity: hoveredIndex !== null && !isHovered ? 0.75 : 1,
                        filter: isHovered
                          ? `drop-shadow(0 0 6px ${slice.color}aa)`
                          : "none",
                      }}
                    />
                  );
                })}
              </g>
            </svg>

            {/* Center Content with single initial CountUp animation */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none">
              <span className="text-[28px] sm:text-[32px] font-bold text-[#0f172a] dark:text-white tracking-tight leading-none transition-all duration-150">
                {renderCenterCount()}
              </span>
              <span className="text-[11px] font-bold text-[#64748b] dark:text-slate-400 uppercase tracking-wider mt-1 transition-all duration-150">
                {activeItem ? activeItem.label : "DEVICES"}
              </span>
            </div>
          </div>

          {/* Breakdown Legend List with Staggered Entrance */}
          <div className="flex-1 w-full flex flex-col gap-1.5">
            {breakdown.map((item, idx) => {
              const isHovered = hoveredIndex === idx;
              return (
                <div
                  key={item.label}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`flex items-center justify-between py-1.5 px-2.5 rounded-lg transition-colors cursor-pointer animate-fade-in ${
                    isHovered
                      ? "bg-slate-50 dark:bg-[#0e1b2f]"
                      : "hover:bg-slate-50/60 dark:hover:bg-[#0e1b2f]/50"
                  }`}
                  style={{
                    animationDelay: `${idx * 80 + 100}ms`,
                    animationFillMode: "both",
                  }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 transition-transform duration-200"
                      style={{
                        backgroundColor: item.color,
                        transform: isHovered ? "scale(1.3)" : "scale(1)",
                      }}
                    />
                    <span
                      className={`text-xs sm:text-sm font-medium transition-colors truncate ${
                        isHovered
                          ? "text-slate-900 dark:text-white font-semibold"
                          : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                  <div className="flex items-center text-xs sm:text-sm shrink-0 ml-2">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {item.count}
                    </span>
                    <span className="text-slate-400 dark:text-slate-500 text-xs ml-1 font-normal whitespace-nowrap">
                      ({item.percentage}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-100 dark:border-[#14233a] pt-3.5 mt-auto flex items-center justify-between text-xs select-none">
        <span className="text-slate-400 dark:text-slate-500 font-normal">
          Hover slices to inspect count
        </span>
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
          {operationalRate}
        </span>
      </div>
    </div>
  );
};

export default DeviceHealthCard;
