"use client";

import React, { useEffect, useState, useRef } from "react";

export interface CountUpProps {
  value: number | string;
  duration?: number;
  delay?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  suffixClassName?: string;
  decimals?: number;
  formatter?: (val: number) => string;
  onComplete?: () => void;
}

export const CountUp: React.FC<CountUpProps> = ({
  value,
  duration = 1200,
  delay = 0,
  className = "",  
  prefix = "",
  suffix = "",
  suffixClassName,
  decimals,
  formatter,
  onComplete,
}) => {
  const numericValue =
    typeof value === "number"
      ? value
      : Number.parseFloat(String(value).replace(/[^0-9.-]/g, ""));

  const isNumeric = !Number.isNaN(numericValue) && Number.isFinite(numericValue);

  // Auto detect decimals if not explicitly specified
  const decimalPlaces =
    typeof decimals === "number"
      ? decimals
      : typeof value === "string" && value.includes(".")
      ? value.split(".")[1]?.replace(/\D/g, "").length || 0
      : 0;

  const [displayValue, setDisplayValue] = useState<number>(0);
  const prevValueRef = useRef<number>(0);
  const isFirstRenderRef = useRef<boolean>(true);

  useEffect(() => {
    if (!isNumeric) return;

    let timeoutId: NodeJS.Timeout;
    let animationFrameId: number;
    const startVal = isFirstRenderRef.current ? 0 : prevValueRef.current;
    const endVal = numericValue;
    let startTime: number | null = null;

    timeoutId = setTimeout(() => {
      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Smooth cubic ease-out curve: 1 - (1 - t)^3
        const ease = 1 - Math.pow(1 - progress, 3);
        const current = startVal + (endVal - startVal) * ease;

        setDisplayValue(current);

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(step);
        } else {
          setDisplayValue(endVal);
          prevValueRef.current = endVal;
          isFirstRenderRef.current = false;
          onComplete?.();
        }
      };

      animationFrameId = requestAnimationFrame(step);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(animationFrameId);
    };
  }, [numericValue, duration, delay, isNumeric]);

  const renderSuffix = () => {
    if (!suffix) return null;
    const trimmed = suffix.trim();
    const isPercent = trimmed.startsWith("%");
    const displaySuffix = suffix.startsWith(" ") ? suffix.slice(1) : suffix;
    const defaultSuffixClass = isPercent
      ? "text-xs sm:text-sm font-semibold ml-0.5 opacity-80"
      : "text-xs sm:text-sm font-semibold ml-1 opacity-80";

    return (
      <span className={suffixClassName || defaultSuffixClass}>
        {displaySuffix}
      </span>
    );
  };

  if (!isNumeric) {
    return (
      <span className={`inline-flex items-baseline whitespace-nowrap ${className}`}>
        {prefix}
        <span>{value}</span>
        {renderSuffix()}
      </span>
    );
  }

  const formatNumber = (val: number): string => {
    if (formatter) return formatter(val);
    if (decimalPlaces > 0) {
      return val.toLocaleString(undefined, {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
      });
    }
    return Math.round(val).toLocaleString();
  };

  return (
    <span
      suppressHydrationWarning
      className={`inline-flex items-baseline tabular-nums tracking-tight transition-all duration-150 whitespace-nowrap ${className}`}
    >
      {prefix && <span>{prefix}</span>}
      <span>{formatNumber(displayValue)}</span>
      {renderSuffix()}
    </span>
  );
};

export default CountUp;
