"use client";

import React, { useState, useEffect, useCallback } from "react";
import { LogOut, X, Loader2 } from "lucide-react";

export interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

export const LogoutConfirmModal: React.FC<Readonly<LogoutConfirmModalProps>> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(isOpen);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Smooth enter and exit animation lifecycle
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isOpen) {
      timer = setTimeout(() => {
        setIsRendered(true);
        setIsVisible(true);
      }, 0);
    } else {
      timer = setTimeout(() => {
        setIsVisible(false);
        setIsRendered(false);
      }, 240);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isOpen]);

  const handleClose = useCallback(() => {
    if (isLoggingOut) return;
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 240);
  }, [isLoggingOut, onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoggingOut) {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoggingOut, handleClose]);

  const handleConfirm = async () => {
    setIsLoggingOut(true);
    try {
      await onConfirm();
      setIsVisible(false);
      setIsRendered(false);
      onClose();
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!isRendered) return null;

  return (
    <div
      aria-modal="true"
      aria-labelledby="logout-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none"
    >
      {/* Backdrop with smooth blur and fade */}
      <button
        type="button"
        aria-label="Close logout modal backdrop"
        tabIndex={-1}
        onClick={handleClose}
        className={`fixed inset-0 bg-slate-900/50 dark:bg-[#020611]/75 transition-all duration-240 ease-out cursor-pointer border-0 p-0 ${
          isVisible ? "opacity-100 backdrop-blur-xs" : "opacity-0 backdrop-blur-none"
        }`}
      />

      {/* Spacious, Premium Modal Card (White in light theme, dark in dark theme) */}
      <div
        className={`relative w-full max-w-120 rounded-3xl bg-white dark:bg-[#081426] border border-slate-200/90 dark:border-[#1a2e4d] shadow-2xl dark:shadow-[0_25px_70px_-10px_rgba(0,0,0,0.85),0_0_40px_rgba(244,63,94,0.08)] p-6 sm:p-8 text-slate-800 dark:text-slate-200 z-10 transition-all duration-240 ease-out transform ${
          isVisible
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-3"
        }`}
      >
        {/* Top Close "X" Button */}
        <button
          type="button"
          onClick={handleClose}
          disabled={isLoggingOut}
          aria-label="Close dialog"
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Prominent Danger / Logout Icon Badge */}
        <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/25 text-rose-500 dark:text-rose-400 flex items-center justify-center shadow-xs dark:shadow-lg dark:shadow-rose-950/40 mb-5">
          <LogOut className="w-7 h-7 text-rose-500 dark:text-rose-400" />
        </div>

        {/* Heading & Subtitle */}
        <h3
          id="logout-dialog-title"
          className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight"
        >
          Sign out of Garuda NMS?
        </h3>
        <p className="mt-2 text-sm sm:text-[15px] text-slate-500 dark:text-slate-400 leading-relaxed">
          Are you sure you want to end your active session? You will need to
          re-authenticate to access the network operations command center.
        </p>

        {/* Action Buttons: Spacious and High-Touch */}
        <div className="flex items-center gap-3 mt-6">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoggingOut}
            className="flex-1 py-3 px-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0c182e] hover:bg-slate-100 dark:hover:bg-[#12233f] text-slate-700 dark:text-slate-200 text-sm font-semibold transition-all cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoggingOut}
            className="flex-1 py-3 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 dark:hover:bg-rose-500 active:bg-rose-800 text-white text-sm font-semibold shadow-md shadow-rose-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed hover:-translate-y-px active:translate-y-0"
          >
            {isLoggingOut ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Signing out...</span>
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4" />
                <span>Yes, Sign Out</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmModal;
