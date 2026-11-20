"use client";

import React, { useState, useEffect } from "react";

// The network connectivity links, ordered from outer tree leaves converging into root (Bengaluru Hub)
const TREE_TO_ROOT_LINKS = [
  // Level 1: Outer leaves connecting inwards
  { id: "sydney-jakarta", x1: 860, y1: 375, x2: 730, y2: 370, delay: 0.1 },
  { id: "sydney-frankfurt", x1: 860, y1: 375, x2: 800, y2: 220, delay: 0.18 },
  { id: "singapore-mumbai", x1: 170, y1: 330, x2: 310, y2: 210, delay: 0.26 },
  { id: "singapore-chennai", x1: 170, y1: 330, x2: 480, y2: 380, delay: 0.34 },
  { id: "delhi-mumbai", x1: 400, y1: 75, x2: 310, y2: 210, delay: 0.42 },
  { id: "delhi-dubai", x1: 400, y1: 75, x2: 630, y2: 125, delay: 0.5 },

  // Level 2: Intermediate branches connecting
  { id: "frankfurt-dubai", x1: 800, y1: 220, x2: 630, y2: 125, delay: 0.6 },
  { id: "frankfurt-jakarta", x1: 800, y1: 220, x2: 730, y2: 370, delay: 0.7 },
  { id: "jakarta-chennai", x1: 730, y1: 370, x2: 480, y2: 380, delay: 0.8 },
  { id: "dubai-chennai", x1: 630, y1: 125, x2: 480, y2: 380, delay: 0.9 },

  // Level 3: Converging into Core Root (Bengaluru Hub)
  { id: "mumbai-bengaluru", x1: 310, y1: 210, x2: 490, y2: 260, delay: 1.05 },
  { id: "dubai-bengaluru", x1: 630, y1: 125, x2: 490, y2: 260, delay: 1.18 },
  { id: "chennai-bengaluru", x1: 480, y1: 380, x2: 490, y2: 260, delay: 1.3 },
  { id: "jakarta-bengaluru", x1: 730, y1: 370, x2: 490, y2: 260, delay: 1.42 },
];

// Reusable clean city node
interface CityNodeProps {
  top: string;
  left: string;
  label: string;
  subtext?: string;
  isHub?: boolean;
  isHubActivated?: boolean;
}

const CityNode: React.FC<CityNodeProps> = ({
  top,
  left,
  label,
  subtext,
  isHub = false,
  isHubActivated = false,
}) => (
  <div
    className={`group absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center select-none ${
      isHub ? "z-30" : "z-10"
    }`}
    style={{ top, left }}
  >
    {/* Node label placed directly above the node */}
    <span
      className={`whitespace-nowrap tracking-wide leading-none mb-1 text-[10.5px] font-medium transition-colors duration-300 ${
        isHub
          ? isHubActivated
            ? "text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]"
            : "text-slate-300"
          : "text-slate-300 group-hover:text-white"
      }`}
    >
      {label}
    </span>

    {isHub ? (
      <div className="relative flex items-center justify-center">
        {/* Clean, Precision Enterprise Hub Node */}
        <div
          className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-500 ${
            isHubActivated
              ? "border-emerald-500/60 bg-[#07192f]/80 backdrop-blur-xs"
              : "border-slate-700/50 bg-[#07192f]/50"
          }`}
        >
          <div
            className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${
              isHubActivated
                ? "bg-emerald-400 ring-2 ring-emerald-500/20"
                : "bg-slate-600"
            }`}
          />
        </div>
      </div>
    ) : (
      <div className="relative flex items-center justify-center cursor-pointer">
        {/* Precision Telemetry City Node */}
        <div className="w-4 h-4 rounded-full border border-sky-400/40 bg-[#07192f]/70 backdrop-blur-xs flex items-center justify-center transition-all duration-300 group-hover:scale-125 group-hover:border-sky-300 group-hover:shadow-[0_0_10px_rgba(56,189,248,0.5)]">
          <div className="w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.85)] group-hover:bg-sky-300" />
        </div>
      </div>
    )}

    {/* Subtext below node */}
    {subtext && (
      <span
        className={`text-[8.5px] font-mono mt-1 tracking-tight leading-none transition-colors duration-300 ${
          isHub
            ? isHubActivated
              ? "text-emerald-400/90 font-medium"
              : "text-slate-500"
            : "text-slate-400/80 group-hover:text-sky-300/90"
        }`}
      >
        {subtext}
      </span>
    )}
  </div>
);

export default function NetworkTopologyMap() {
  const [isHubActivated, setIsHubActivated] = useState(false);

  // Activate Bengaluru's pulsating glowing effect right as the connection lines finish drawing (~2.1s)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsHubActivated(true);
    }, 2100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full h-[280px] sm:h-[320px] lg:h-[300px] xl:h-[360px] 2xl:h-[400px] overflow-hidden">
      {/* ── SVG Connectivity Lines: Draws once from outer tree to root, with live data packets ── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1000 500"
        preserveAspectRatio="none"
      >
        <defs>
          <style>{`
            @keyframes maskLineDraw {
              0% { stroke-dashoffset: 1; }
              100% { stroke-dashoffset: 0; }
            }
          `}</style>

          {/* Progressive reveal masks for each line drawing from source to destination */}
          {TREE_TO_ROOT_LINKS.map((link, idx) => (
            <mask id={`connect-mask-${idx}`} key={`mask-${link.id}`}>
              <line
                x1={link.x1}
                y1={link.y1}
                x2={link.x2}
                y2={link.y2}
                stroke="white"
                strokeWidth="12"
                pathLength="1"
                strokeDasharray="1"
                strokeDashoffset="1"
                style={{
                  animation: `maskLineDraw 0.65s cubic-bezier(0.16, 1, 0.3, 1) ${link.delay}s forwards`,
                }}
              />
            </mask>
          ))}

          {/* Subtle glow filter for telemetry pulses */}
          <filter id="packetGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Dashed connectivity lines revealed sequentially from tree to root, then permanently fixed */}
        {TREE_TO_ROOT_LINKS.map((link, idx) => (
          <line
            key={link.id}
            x1={link.x1}
            y1={link.y1}
            x2={link.x2}
            y2={link.y2}
            stroke="rgba(56, 189, 248, 0.42)"
            strokeWidth="1.2"
            strokeDasharray="3 3"
            mask={isHubActivated ? undefined : `url(#connect-mask-${idx})`}
          />
        ))}

        {/* Live telemetry data packets flowing along connected lines */}
        {TREE_TO_ROOT_LINKS.map((link, idx) => (
          <circle
            key={`packet-${link.id}`}
            r="2"
            fill="#38bdf8"
            filter="url(#packetGlow)"
            className="opacity-80"
          >
            <animateMotion
              path={`M ${link.x1} ${link.y1} L ${link.x2} ${link.y2}`}
              dur={`${2.8 + (idx % 4) * 0.5}s`}
              begin={`${link.delay + 0.65}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </svg>

      {/* ── City Nodes matching exact mockup coordinates ── */}
      <CityNode top="15%" left="40%" label="Delhi" subtext="89.02Gbps" />
      <CityNode top="25%" left="63%" label="Dubai" subtext="54.12Gbps" />
      <CityNode top="42%" left="31%" label="Mumbai" subtext="120.4Gbps" />
      <CityNode top="52%" left="49%" label="Bengaluru" subtext="Active Hub" isHub />
      <CityNode top="44%" left="80%" label="Frankfurt" subtext="33.8Gbps" />
      <CityNode top="66%" left="17%" label="Singapore" subtext="72.4Gbps" />
      <CityNode top="76%" left="48%" label="Chennai" subtext="85.6Gbps" />
      <CityNode top="74%" left="73%" label="Jakarta" subtext="42.1Gbps" />
      <CityNode top="75%" left="86%" label="Sydney" subtext="21.0Gbps" />

      {/* Floating Metric 1: Network Availability (directly right of Dubai) */}
      <div className="absolute top-[21%] left-[65.5%] z-20 flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#081324]/95 border border-slate-700/60 shadow-2xl text-[11px] sm:text-xs transition-all duration-300 ease-out cursor-pointer hover:scale-110 hover:z-30 hover:border-cyan-400/70 hover:shadow-[0_0_25px_rgba(6,182,212,0.35)]">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4 text-cyan-400 shrink-0"
        >
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
        <span>
          <b className="text-white font-bold text-[13px]">99.94%</b>{" "}
          <span className="text-slate-400 text-[12px]">Network availability</span>
        </span>
      </div>

      {/* Floating Metric 2: Underlays Monitored (bottom-left below Singapore) */}
      <div className="absolute top-[76%] left-[10%] z-20 flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#081324]/95 border border-slate-700/60 shadow-2xl text-[11px] sm:text-xs transition-all duration-300 ease-out cursor-pointer hover:scale-110 hover:z-30 hover:border-blue-400/70 hover:shadow-[0_0_25px_rgba(59,130,246,0.35)]">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4 text-blue-400 shrink-0"
        >
          <rect x="2" y="3" width="20" height="6" rx="1.5" />
          <rect x="2" y="13" width="20" height="6" rx="1.5" />
          <line x1="6" y1="6" x2="6.01" y2="6" strokeWidth="2.5" />
          <line x1="6" y1="16" x2="6.01" y2="16" strokeWidth="2.5" />
        </svg>
        <span className="text-slate-400 font-medium">
          <b className="text-white font-bold text-[13px]">1,242</b>{" "}
          <span className="text-[12px]">Underlays monitored</span>
        </span>
      </div>
    </div>
  );
}
