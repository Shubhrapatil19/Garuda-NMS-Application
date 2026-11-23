import React from "react";
import Link from "next/link";
import Image from "next/image";

export interface GarudaLogoProps {
  size?: "sm" | "md" | "lg";
  showSubtitle?: boolean;
  showText?: boolean;
  theme?: "dark" | "light" | "auto";
  href?: string;
  className?: string;
}

function getTitleThemeClass(theme: "dark" | "light" | "auto"): string {
  if (theme === "light") {
    return "text-slate-900 group-hover:text-slate-800";
  }
  if (theme === "dark") {
    return "text-white group-hover:text-slate-100";
  }
  return "text-slate-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100";
}

function getSubtitleThemeClass(theme: "dark" | "light" | "auto"): string {
  if (theme === "light") {
    return "text-slate-500";
  }
  if (theme === "dark") {
    return "text-slate-400";
  }
  return "text-slate-500 dark:text-slate-400";
}

export default function GarudaLogo({
  size = "md",
  showSubtitle = true,
  showText = true,
  theme = "auto",
  href,
  className = "",
}: Readonly<GarudaLogoProps>) {
  const sizeStyles = {
    sm: {
      box: "w-8 h-8 rounded-lg",
      icon: "w-4 h-4",
      title: "text-[14px]",
      sub: "text-[8px] tracking-[0.2em] mt-0.5",
      gap: "gap-2.5",
    },
    md: {
      box: "w-10 h-10 rounded-xl",
      icon: "w-5 h-5",
      title: "text-[17px]",
      sub: "text-[9px] tracking-[0.22em] mt-1",
      gap: "gap-3",
    },
    lg: {
      box: "w-12 h-12 rounded-2xl",
      icon: "w-6 h-6",
      title: "text-[20px]",
      sub: "text-[10px] tracking-[0.24em] mt-1",
      gap: "gap-3.5",
    },
  }[size];

  const titleThemeClass = getTitleThemeClass(theme);
  const subtitleThemeClass = getSubtitleThemeClass(theme);

  const content = (
    <div
      className={`inline-flex items-center ${sizeStyles.gap} select-none group ${className}`}
    >
      {/* Icon Emblem with subtle hover glow */}
      <div
        className={`${sizeStyles.box} bg-[#061428] border border-blue-500/30 flex items-center justify-center shadow-lg shadow-blue-500/10 shrink-0 transition-all duration-300 group-hover:border-blue-400/60 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] group-hover:scale-105 overflow-hidden`}
      >
        <Image
          src="/Logo.png"
          alt="Garuda Logo"
          width={64}
          height={64}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          priority
        />
      </div>

      {/* Brand Typography */}
      <div
        className={`flex flex-col transition-all duration-300 overflow-hidden ${
          showText
            ? "max-w-55 opacity-100"
            : "max-w-0 opacity-0 pointer-events-none"
        }`}
      >
        <span
          className={`${sizeStyles.title} font-extrabold tracking-wider whitespace-nowrap ${titleThemeClass} uppercase leading-none transition-colors duration-200`}
        >
          GARUDA <span className="text-blue-500">NMS</span>
        </span>
        {showSubtitle && (
          <span
            className={`${sizeStyles.sub} whitespace-nowrap ${subtitleThemeClass} font-medium uppercase mt-0.5`}
          >
            NETWORK MANAGEMENT SYSTEM
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}
