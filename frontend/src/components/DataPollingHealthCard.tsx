"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import { ChevronDown, Check } from "lucide-react";
import CountUp from "./CountUp";
import dbData from "../../data/db.json";

export interface PollingTrendPoint {
  time: string;
  latency: number;
}

export interface DataPollingHealthData {
  pollingRequests?: string;
  successful?: string;
  failed?: string;
  averageLatency?: string;
  trend?: PollingTrendPoint[];
}

export interface DataPollingHealthCardProps {
  data?: DataPollingHealthData;
  aggregatedWindow?: string;
  globalSuccessRate?: string;
  className?: string;
}

const METHODS = [
  "All (Default)",
  "SNMP",
  "API",
  "Syslog",
  "Push",
  "Pull",
];

export const DataPollingHealthCard: React.FC<DataPollingHealthCardProps> = ({
  data = dbData.dashboard.dataPollingHealth,
  aggregatedWindow = "24 Hours",
  globalSuccessRate = "99.1%",
  className = "",
}) => {
  const [selectedMethod, setSelectedMethod] = useState("All (Default)");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [animationFinished, setAnimationFinished] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    time: string;
    latency: number;
    index: number;
  } | null>(null);

  const rawId = useId();
  const clipId = `pollingClip-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const gradientId = `pollingGrad-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Once line drawing completes, unset clipping so all hover triggers have zero boundaries
    const timer = setTimeout(() => {
      setAnimationFinished(true);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const pollingRequests = data?.pollingRequests || "1.24M";
  const successful = data?.successful || "1.21M";
  const failed = data?.failed || "30.2K";
  const averageLatency = data?.averageLatency || "184 ms";

  const trendPoints =
    data?.trend && data.trend.length > 0
      ? data.trend
      : [
          { time: "00:00", latency: 162 },
          { time: "03:00", latency: 184 },
          { time: "06:00", latency: 145 },
          { time: "08:30", latency: 98 },
          { time: "10:30", latency: 132 },
          { time: "12:00", latency: 156 },
          { time: "14:30", latency: 178 },
          { time: "16:30", latency: 142 },
          { time: "19:00", latency: 194 },
          { time: "22:00", latency: 175 },
        ];

  // SVG Chart Geometry
  const width = 500;
  const height = 125;
  const paddingX = 12;
  const paddingYTop = 15;
  const paddingYBottom = 15;

  const chartInnerWidth = width - paddingX * 2;
  const chartInnerHeight = height - paddingYTop - paddingYBottom;

  const latencies = trendPoints.map((p) => p.latency);
  const minLatency = Math.min(...latencies, 80);
  const maxLatency = Math.max(...latencies, 210);
  const latencyRange = maxLatency - minLatency || 1;

  // Map each trend point to SVG coordinate (x, y)
  const coords = trendPoints.map((p, idx) => {
    const x = paddingX + (idx / (trendPoints.length - 1)) * chartInnerWidth;
    const normalizedY = (p.latency - minLatency) / latencyRange;
    const y = paddingYTop + (1 - normalizedY) * chartInnerHeight;
    return { x, y, time: p.time, latency: p.latency, index: idx };
  });

  // Calculate total Euclidean distance along the line for exact stroke-dashoffset drawing
  const totalLineLength = Math.ceil(
    coords.reduce((sum, c, i) => {
      if (i === 0) return 0;
      const prev = coords[i - 1];
      return sum + Math.hypot(c.x - prev.x, c.y - prev.y);
    }, 0)
  );
  const strokeDash = totalLineLength + 25;

  // Polyline string: "x1,y1 x2,y2 ..."
  const linePoints = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");

  // Closed area polygon for gradient fill: start at bottom-left, points, down to bottom-right
  const firstCoord = coords[0];
  const lastCoord = coords[coords.length - 1];
  const areaPoints = `${firstCoord.x},${height} ${linePoints} ${lastCoord.x},${height}`;

  // Parse numeric average latency for CountUp
  const avgLatencyNum = parseInt(averageLatency.replace(/[^0-9]/g, ""), 10) || 184;

  return (
    <div
      className={`bg-white dark:bg-[#081220] rounded-2xl border border-slate-200/80 dark:border-[#14233a] p-5 sm:p-6 shadow-xs flex flex-col justify-between transition-all hover:shadow-md ${className}`}
    >
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Data Polling Health
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Success rate and collection latency across pollers
            </p>
          </div>

          {/* Method Filter Dropdown */}
          <div className="relative self-start sm:self-auto" ref={dropdownRef}>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Method:</span>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-[#0e1b2f] hover:bg-slate-100 dark:hover:bg-[#13233c] border border-slate-200/80 dark:border-[#162740] transition-all cursor-pointer shadow-2xs select-none"
              >
                <span>{selectedMethod}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-400 transition-transform duration-200 ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-44 rounded-xl bg-white dark:bg-[#0b1626] border border-slate-200/90 dark:border-[#162740] shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-150">
                {METHODS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setSelectedMethod(m);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors ${
                      selectedMethod === m
                        ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#0e1b2f]"
                    }`}
                  >
                    <span>{m}</span>
                    {selectedMethod === m && (
                      <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 4 Metric Summary Bar */}
        <div className="rounded-xl bg-slate-50/70 dark:bg-[#0b1626]/70 border border-slate-100/90 dark:border-[#162740] p-3 sm:p-4 my-4 select-none">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="min-w-0">
              <span className="block text-[10px] sm:text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate" title="POLLING REQUESTS">
                POLLING REQUESTS
              </span>
              <span className="block text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-1 truncate">
                {pollingRequests}
              </span>
            </div>
            <div className="min-w-0">
              <span className="block text-[10px] sm:text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate" title="SUCCESSFUL">
                SUCCESSFUL
              </span>
              <span className="block text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 truncate">
                {successful}
              </span>
            </div>
            <div className="min-w-0">
              <span className="block text-[10px] sm:text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate" title="FAILED">
                FAILED
              </span>
              <span className="block text-lg sm:text-xl font-bold text-rose-500 dark:text-rose-400 mt-1 truncate">
                {failed}
              </span>
            </div>
            <div className="min-w-0">
              <span className="block text-[10px] sm:text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate" title="AVERAGE LATENCY">
                AVERAGE LATENCY
              </span>
              <span className="block text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400 mt-1 truncate">
                <CountUp value={avgLatencyNum} duration={1300} delay={100} suffix=" ms" />
              </span>
            </div>
          </div>
        </div>

        {/* Trend Area / Line Chart with Left-to-Right Completion Animation */}
        <div className="relative mt-2 mb-1 select-none">
          {/* Tooltip on Hover */}
          {hoveredPoint && (
            <div
              className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 px-2.5 py-1.5 rounded-lg bg-slate-900 dark:bg-black text-white text-[11px] shadow-lg border border-slate-800 dark:border-slate-700 transition-all duration-75 flex items-center gap-2 whitespace-nowrap"
              style={{
                left: `${(hoveredPoint.x / width) * 100}%`,
                top: `${(hoveredPoint.y / height) * 100}%`,
              }}
            >
              <span className="text-slate-300 font-mono">{hoveredPoint.time}</span>
              <span className="w-1 h-1 rounded-full bg-slate-500" />
              <span className="font-bold text-blue-400">
                {hoveredPoint.latency} ms
              </span>
            </div>
          )}

          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-28 sm:h-32 overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <style>{`
                @keyframes drawTrendPath {
                  0% {
                    stroke-dashoffset: ${strokeDash};
                  }
                  100% {
                    stroke-dashoffset: 0;
                  }
                }
                .animate-trend-line-draw {
                  stroke-dasharray: ${strokeDash};
                  stroke-dashoffset: ${strokeDash};
                  animation: drawTrendPath 1.5s cubic-bezier(0.25, 1, 0.5, 1) 0.1s forwards;
                }

                @keyframes unrollChartClip {
                  0% {
                    width: 0px;
                  }
                  100% {
                    width: ${width}px;
                  }
                }
                .animate-chart-unroll {
                  width: 0px;
                  animation: unrollChartClip 1.5s cubic-bezier(0.25, 1, 0.5, 1) 0.1s forwards;
                }

                @keyframes popTrendDot {
                  0% {
                    opacity: 0;
                    transform: scale(0);
                  }
                  65% {
                    opacity: 1;
                    transform: scale(1.4);
                  }
                  100% {
                    opacity: 1;
                    transform: scale(1);
                  }
                }
                .animate-trend-dot-pop {
                  opacity: 0;
                  animation: popTrendDot 320ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                  transform-box: fill-box;
                  transform-origin: center;
                }
              `}</style>

              <linearGradient
                id={gradientId}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
              </linearGradient>

              {/* Clip path that completes from start to end (left to right) */}
              <clipPath id={clipId}>
                <rect
                  x="0"
                  y="0"
                  height={height}
                  className="animate-chart-unroll"
                />
              </clipPath>
            </defs>

            {/* Subtle horizontal grid lines (revealed from start to end) */}
            <g clipPath={animationFinished ? undefined : `url(#${clipId})`}>
              <line
                x1="0"
                y1={paddingYTop}
                x2={width}
                y2={paddingYTop}
                className="stroke-slate-100 dark:stroke-slate-800/80"
                strokeDasharray="4 4"
              />
              <line
                x1="0"
                y1={paddingYTop + chartInnerHeight * 0.5}
                x2={width}
                y2={paddingYTop + chartInnerHeight * 0.5}
                className="stroke-slate-100 dark:stroke-slate-800/80"
                strokeDasharray="4 4"
              />
              <line
                x1="0"
                y1={paddingYTop + chartInnerHeight}
                x2={width}
                y2={paddingYTop + chartInnerHeight}
                className="stroke-slate-100 dark:stroke-slate-800/80"
                strokeDasharray="4 4"
              />

              {/* Area Fill Gradient unrolling behind the advancing line */}
              <polygon
                points={areaPoints}
                fill={`url(#${gradientId})`}
              />
            </g>

            {/* Blue Trend Line completing start to end */}
            <polyline
              points={linePoints}
              fill="none"
              stroke="#2563eb"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={animationFinished ? "" : "animate-trend-line-draw"}
            />

            {/* Interactive Data Point Dots popping in sync as the line reaches each coordinate */}
            {coords.map((c) => {
              const isHovered = hoveredPoint?.index === c.index;
              const xRatio = (c.x - coords[0].x) / (coords[coords.length - 1].x - coords[0].x);
              const dotDelay = Math.round(100 + xRatio * 1350);

              return (
                <g
                  key={c.index}
                  className={`cursor-pointer ${animationFinished ? "" : "animate-trend-dot-pop"}`}
                  style={
                    animationFinished
                      ? undefined
                      : {
                          animationDelay: `${dotDelay}ms`,
                          animationFillMode: "both",
                        }
                  }
                >
                  {/* Invisible larger hit target for hover */}
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r={12}
                    fill="transparent"
                    onMouseEnter={() => setHoveredPoint(c)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  {/* Visual Node */}
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r={isHovered ? 4.5 : 3}
                    fill="#2563eb"
                    stroke="#ffffff"
                    strokeWidth={isHovered ? 2.5 : 1.5}
                    className="transition-all duration-150"
                  />
                </g>
              );
            })}
          </svg>

          {/* X-Axis Time Labels */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-1 px-1">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>22:00</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-100 dark:border-[#14233a] pt-3.5 mt-auto flex items-center justify-between text-xs select-none">
        <span className="text-slate-400 dark:text-slate-500 font-normal">
          Aggregated window: {aggregatedWindow}
        </span>
        <span className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors cursor-pointer">
          Global Success Rate: {globalSuccessRate}
        </span>
      </div>
    </div>
  );
};

export default DataPollingHealthCard;
