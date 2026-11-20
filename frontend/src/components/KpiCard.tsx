"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import CountUp, { CountUpProps } from "./CountUp";

export { CountUp } from "./CountUp";
export type { CountUpProps } from "./CountUp";

export type KpiCardVariant =
  | "blue"
  | "emerald"
  | "rose"
  | "amber"
  | "slate"
  | "cyan"
  | "indigo";

export interface KpiCardBadge {
  text?: string;
  icon?: React.ReactNode;
  variant?:
    | "emerald"
    | "rose"
    | "amber"
    | "blue"
    | "slate"
    | "cyan"
    | "indigo";
}

export interface KpiCardFooterLink {
  type?: "link";
  text?: string;
  onClick?: () => void;
  showArrow?: boolean;
}

export interface KpiCardFooterStatus {
  type: "status";
  leftText?: string;
  rightText?: string;
  rightTextColor?: string;
}

export type KpiCardFooter =
  | KpiCardFooterLink
  | KpiCardFooterStatus
  | React.ReactNode;

export interface KpiCardProps {
  id?: string;
  title: string;
  value?: string | number | React.ReactNode;
  valueColor?: string;
  valueClassName?: string;
  suffixClassName?: string;
  icon: React.ReactNode;
  variant?: KpiCardVariant;
  badge?: KpiCardBadge;
  footer?: KpiCardFooter;
  onClick?: () => void;
  className?: string;
  enableCountUp?: boolean;
  countUpDuration?: number;
  countUpDelay?: number;
  countUpPrefix?: string;
  countUpSuffix?: string;
  decimals?: number;
  style?: React.CSSProperties;
}

const variantStyles: Record<
  KpiCardVariant,
  {
    iconBg: string;
    iconHoverBg: string;
    borderHover: string;
    titleHover: string;
    footerText: string;
    topBar: string;
  }
> = {
  blue: {
    iconBg:
      "bg-blue-50 text-blue-600 border border-blue-100/90 dark:bg-blue-950/60 dark:border-blue-900/50 dark:text-blue-400",
    iconHoverBg:
      "group-hover:bg-blue-600 group-hover:text-white group-hover:scale-105",
    borderHover: "hover:border-blue-400/80",
    titleHover: "group-hover:text-blue-600",
    footerText: "text-blue-600",
    topBar: "bg-blue-500",
  },
  emerald: {
    iconBg:
      "bg-emerald-50 text-emerald-600 border border-emerald-100/90 dark:bg-emerald-950/60 dark:border-emerald-900/50 dark:text-emerald-400",
    iconHoverBg:
      "group-hover:bg-emerald-600 group-hover:text-white group-hover:scale-105",
    borderHover: "hover:border-emerald-400/80",
    titleHover: "group-hover:text-emerald-700",
    footerText: "text-emerald-700",
    topBar: "bg-emerald-500",
  },
  cyan: {
    iconBg:
      "bg-cyan-50 text-cyan-600 border border-cyan-100/90 dark:bg-cyan-950/60 dark:border-cyan-900/50 dark:text-cyan-400",
    iconHoverBg:
      "group-hover:bg-cyan-600 group-hover:text-white group-hover:scale-105",
    borderHover: "hover:border-cyan-400/80",
    titleHover: "group-hover:text-cyan-700",
    footerText: "text-cyan-600",
    topBar: "bg-cyan-500",
  },
  indigo: {
    iconBg:
      "bg-indigo-50 text-indigo-600 border border-indigo-100/90 dark:bg-indigo-950/60 dark:border-indigo-900/50 dark:text-indigo-400",
    iconHoverBg:
      "group-hover:bg-indigo-600 group-hover:text-white group-hover:scale-105",
    borderHover: "hover:border-indigo-400/80",
    titleHover: "group-hover:text-indigo-700",
    footerText: "text-indigo-600",
    topBar: "bg-indigo-500",
  },
  rose: {
    iconBg:
      "bg-rose-50 text-rose-600 border border-rose-100/90 dark:bg-rose-950/60 dark:border-rose-900/50 dark:text-rose-400",
    iconHoverBg:
      "group-hover:bg-rose-600 group-hover:text-white group-hover:scale-105",
    borderHover: "hover:border-rose-400/80",
    titleHover: "group-hover:text-rose-700",
    footerText: "text-rose-600",
    topBar: "bg-rose-500",
  },
  amber: {
    iconBg:
      "bg-amber-50 text-amber-600 border border-amber-100/90 dark:bg-amber-950/60 dark:border-amber-900/50 dark:text-amber-400",
    iconHoverBg:
      "group-hover:bg-amber-500 group-hover:text-white group-hover:scale-105",
    borderHover: "hover:border-amber-400/80",
    titleHover: "group-hover:text-amber-700",
    footerText: "text-amber-700",
    topBar: "bg-amber-500",
  },
  slate: {
    iconBg:
      "bg-slate-100 text-slate-600 border border-slate-200/80 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300",
    iconHoverBg:
      "group-hover:bg-slate-700 group-hover:text-white group-hover:scale-105",
    borderHover: "hover:border-slate-400/80",
    titleHover: "group-hover:text-slate-900",
    footerText: "text-slate-600",
    topBar: "bg-slate-500",
  },
};

const badgeStyles: Record<string, string> = {
  emerald:
    "bg-emerald-50 text-emerald-700 border border-emerald-200/70 dark:bg-emerald-950/50 dark:border-emerald-800/60 dark:text-emerald-400",
  rose: "bg-rose-50 text-rose-700 border border-rose-200/70 dark:bg-rose-950/50 dark:border-rose-800/60 dark:text-rose-400",
  amber:
    "bg-amber-50 text-amber-800 border border-amber-200/70 dark:bg-amber-950/50 dark:border-amber-800/60 dark:text-amber-400",
  blue: "bg-blue-50 text-blue-700 border border-blue-200/70 dark:bg-blue-950/50 dark:border-blue-800/60 dark:text-blue-400",
  cyan: "bg-cyan-50 text-cyan-700 border border-cyan-200/70 dark:bg-cyan-950/50 dark:border-cyan-800/60 dark:text-cyan-400",
  indigo:
    "bg-indigo-50 text-indigo-700 border border-indigo-200/70 dark:bg-indigo-950/50 dark:border-indigo-800/60 dark:text-indigo-400",
  slate:
    "bg-slate-100 text-slate-700 border border-slate-200/70 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300",
};

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  valueColor = "text-slate-900 dark:text-white",
  valueClassName = "",
  suffixClassName,
  icon,
  variant = "blue",
  badge,
  footer,
  onClick,
  className = "",
  enableCountUp = false,
  countUpDuration = 1200,
  countUpDelay = 0,
  countUpPrefix = "",
  countUpSuffix = "",
  decimals,
  style,
}) => {
  const isClickable = Boolean(onClick);
  const styles = variantStyles[variant] || variantStyles.blue;

  const renderFooter = () => {
    if (!footer) return null;

    if (React.isValidElement(footer)) {
      return footer;
    }

    if (
      typeof footer === "object" &&
      "type" in footer &&
      footer.type === "status"
    ) {
      const statusFooter = footer as KpiCardFooterStatus;
      return (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-[#14233a] text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>{statusFooter.leftText}</span>
          <span
            className={statusFooter.rightTextColor || "font-semibold text-slate-700 dark:text-slate-200"}
          >
            {statusFooter.rightText}
          </span>
        </div>
      );
    }

    if (typeof footer === "object" && "text" in footer) {
      const linkFooter = footer as KpiCardFooterLink;
      return (
        <div
          onClick={(e) => {
            if (linkFooter.onClick) {
              e.stopPropagation();
              linkFooter.onClick();
            }
          }}
          className={`mt-3 pt-3 border-t border-slate-100 dark:border-[#14233a] flex items-center justify-between text-xs font-medium ${
            styles.footerText
          } ${
            isClickable || linkFooter.onClick
              ? "group-hover:translate-x-0.5 transition-transform cursor-pointer"
              : ""
          }`}
        >
          <span>{linkFooter.text}</span>
          {linkFooter.showArrow !== false && (
            <ArrowRight
              size={14}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          )}
        </div>
      );
    }

    return null;
  };

  const isCountable =
    enableCountUp &&
    (typeof value === "number" || typeof value === "string") &&
    value !== undefined &&
    value !== null;

  return (
    <div
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      style={style}
      className={`group relative overflow-hidden bg-white dark:bg-[#081220] rounded-2xl border border-slate-200/80 dark:border-[#14233a] p-4 sm:p-5 
        shadow-[0_2px_12px_rgba(0,0,0,0.04)]
        hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]
        ${styles.borderHover}
        hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between 
        ${isClickable ? "cursor-pointer" : "cursor-pointer"} 
        ${className}`}
    >
      {/* Subtle top accent highlight bar on hover */}
      <div
        className={`absolute top-0 left-0 right-0 h-[2.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${styles.topBar}`}
      />

      <div>
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span
            className={`text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 transition-colors duration-200 ${styles.titleHover}`}
          >
            {title}
          </span>
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 shrink-0 ${styles.iconBg} ${styles.iconHoverBg}`}
          >
            {icon}
          </div>
        </div>

        <div className="mt-2.5 sm:mt-3 flex flex-wrap items-baseline justify-between gap-1.5 sm:gap-2 min-w-0">
          <span
            className={`text-2xl sm:text-[26px] font-bold tracking-tight transition-transform duration-200 group-hover:translate-x-0.5 whitespace-nowrap min-w-0 shrink ${valueColor} ${valueClassName}`}
          >
            {isCountable ? (
              <CountUp
                value={value as string | number}
                duration={countUpDuration}
                delay={countUpDelay}
                prefix={countUpPrefix}
                suffix={countUpSuffix}
                suffixClassName={suffixClassName}
                decimals={decimals}
              />
            ) : (
              <span className="inline-flex items-baseline whitespace-nowrap">
                {countUpPrefix && <span>{countUpPrefix}</span>}
                <span>
                  {typeof value === "number" && typeof decimals === "number"
                    ? value.toLocaleString(undefined, {
                        minimumFractionDigits: decimals,
                        maximumFractionDigits: decimals,
                      })
                    : value}
                </span>
                {countUpSuffix && (
                  <span
                    className={
                      suffixClassName ||
                      (countUpSuffix.trim().startsWith("%")
                        ? "text-xs sm:text-sm font-semibold ml-0.5 opacity-80"
                        : "text-xs sm:text-sm font-semibold ml-1 opacity-80")
                    }
                  >
                    {countUpSuffix.startsWith(" ") ? countUpSuffix.slice(1) : countUpSuffix}
                  </span>
                )}
              </span>
            )}
          </span>
          {badge && (
            <span
              className={`inline-flex items-center text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full transition-transform duration-200 group-hover:scale-105 shrink-0 whitespace-nowrap ${
                badgeStyles[badge.variant || "emerald"] || badgeStyles.emerald
              }`}
            >
              {badge.icon}
              {badge.text}
            </span>
          )}
        </div>
      </div>

      {renderFooter()}
    </div>
  );
};

export default KpiCard;
