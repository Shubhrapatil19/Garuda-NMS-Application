"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  RotateCw,
  Bell,
  LogOut,
  User as UserIcon,
  Shield,
  ShieldCheck,
  Check,
  Activity,
  ChevronDown,
  Building,
  X,
  Menu,
  Sun,
  Moon,
  Lock,
} from "lucide-react";
import { authService, UserRole } from "@/services/authService";
import { toast } from "sonner";

import dbData from "../../data/db.json";

export interface HeaderUser {
  id?: string;
  name?: string;
  username?: string;
  role?: string;
  initials?: string;
  avatar?: string;
  organization?: string;
  status?: string;
}

export interface EngineStatusConfig {
  name?: string;
  status?: string;
  isOnline?: boolean;
}

export interface HeaderProps {
  title?: string;
  engineStatus?: EngineStatusConfig;
  searchPlaceholder?: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onSync?: () => void;
  isSyncing?: boolean;
  lastSyncTime?: string;
  notificationCount?: number;
  onNotificationClick?: () => void;
  user?: HeaderUser | null;
  onLogout?: () => void;
  className?: string;
  onToggleMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title = "Dashboard",
  engineStatus = {
    name: dbData.dashboard.engineStatus.name,
    status: dbData.dashboard.engineStatus.status,
    isOnline: true,
  },
  searchPlaceholder = "Search sites, devices...",
  searchQuery = "",
  onSearchChange,
  onSync,
  isSyncing = false,
  lastSyncTime,
  notificationCount = 1,
  onNotificationClick,
  user = dbData.users[0],
  onLogout,
  className = "",
  onToggleMobileSidebar,
}) => {
  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Initialize theme from localStorage or document class
  useEffect(() => {
    const saved = localStorage.getItem("garuda-theme") as "light" | "dark" | null;
    if (saved) {
      setTheme(saved);
      if (saved === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("garuda-theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    window.dispatchEvent(
      new CustomEvent("garuda-theme-change", { detail: { theme: nextTheme } })
    );
  };

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuOpen]);

  return (
    <header
      className={`h-[68px] shrink-0 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#081220] border-b border-slate-200/80 dark:border-[#14233a] flex items-center justify-between gap-3 sm:gap-4 sticky top-0 z-20 shadow-xs transition-colors ${className}`}
    >
      {/* ─── Left Section: Mobile Menu Toggle, Title & Engine Status Chip ─── */}
      <div className="flex items-center gap-2.5 sm:gap-4 min-w-0 pl-1 lg:pl-3">
        {onToggleMobileSidebar && (
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 -ml-1 rounded-xl text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title="Open navigation menu"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <h2 className="text-[17px] sm:text-[18px] font-bold text-slate-900 dark:text-white tracking-tight truncate">
          {title}
        </h2>

        {/* Engine Status Chip */}
        {engineStatus && (
          <div className="hidden xl:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold shrink-0 select-none">
            <span
              className={`w-2 h-2 rounded-full ${engineStatus.isOnline !== false
                ? "bg-emerald-500 animate-pulse"
                : "bg-rose-500"
                }`}
            />
            <span>
              {engineStatus.name || "Olio Poller Engine"}:{" "}
              <b className="font-bold">{engineStatus.status || "Online"}</b>
            </span>
          </div>
        )}
      </div>

      {/* ─── Right Section: Search, Sync, Notification, User Profile ─── */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Search Bar */}
        <div className="relative flex items-center">
          <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className={`pl-8 sm:pl-9 py-2 rounded-xl bg-slate-50 dark:bg-[#060b13] border border-slate-200/90 dark:border-[#1a283c] text-xs text-slate-700 dark:text-slate-200 placeholder-slate-400 outline-none w-28 sm:w-36 md:w-44 lg:w-48 xl:w-60 focus:w-40 sm:focus:w-52 md:focus:w-64 focus:bg-white dark:focus:bg-[#070e1a] focus:border-blue-500 transition-all duration-200 ${searchQuery ? "pr-7 sm:pr-8" : "pr-2.5 sm:pr-3.5"
              }`}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange?.("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/70 p-0.5 rounded-full transition-colors cursor-pointer"
              title="Clear search"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Manual Sync Trigger */}
        {onSync && (
          <button
            onClick={onSync}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-[#1a283c] bg-white dark:bg-[#091322] hover:bg-slate-50 dark:hover:bg-[#0e1d33] text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-60"
            title={lastSyncTime ? `Last synced: ${lastSyncTime}` : "Sync data"}
          >
            <RotateCw
              className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-400 ${isSyncing ? "animate-spin text-blue-600" : ""
                }`}
            />
            <span className="hidden sm:inline">Sync</span>
          </button>
        )}

        {/* Notification Bell */}
        <button
          onClick={() => {
            if (onNotificationClick) {
              onNotificationClick();
            } else {
              router.push("/alert-engine");
            }
          }}
          className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          title="Alert Engine & Incident Triage"
          aria-label="Alert Engine & Incident Triage"
        >
          <Bell className="w-4 h-4" />
          {notificationCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#081220]" />
          )}
        </button>

        {/* ─── Dark / Light Theme Toggle Button (Right of notification icon) ─── */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600 hover:-rotate-12 transition-transform" />
          )}
        </button>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 shrink-0 mx-0.5" />

        {/* ─── User Profile Icon & Dropdown (Right of notification icon) ─── */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen((prev) => !prev)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-all duration-150 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            title={user?.name ? `${user.name} (${user.role || "User"})` : "User profile"}
            aria-expanded={userMenuOpen}
            aria-haspopup="true"
          >
            {/* Avatar Circle with Online Status (matches sidebar footer style) */}
            <div className="relative shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#18181b] text-white flex items-center justify-center text-xs sm:text-sm font-bold tracking-tight shadow-xs border border-slate-200/50 dark:border-slate-700 group-hover:scale-105 transition-transform duration-200">
                {user?.initials || (user?.name ? user.name.slice(0, 2).toUpperCase() : "U")}
              </div>
              <span
                className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900"
                title="Online"
              />
            </div>

            {/* Optional User Details for Desktop */}
            <div className="hidden xl:flex flex-col text-left leading-tight pr-1">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                {user?.name}
              </span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
                {user?.role}
              </span>
            </div>

            <ChevronDown
              size={14}
              className={`text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-transform duration-200 hidden sm:block ${userMenuOpen ? "rotate-180 text-blue-600" : ""
                }`}
            />
          </button>

          {/* Interactive User Dropdown Popover */}
          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#0c1626] rounded-2xl shadow-xl border border-slate-200/80 dark:border-[#18263a] p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-slate-200">
              {/* User Identity Card */}
              <div className="p-3 bg-slate-50 dark:bg-[#08101d] rounded-xl border border-slate-100 dark:border-[#162338] mb-2">
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-[#18181b] text-white flex items-center justify-center text-sm font-bold tracking-tight shadow-xs">
                      {user?.initials || (user?.name ? user.name.slice(0, 2).toUpperCase() : "U")}
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900 dark:text-white text-sm truncate">
                      {user?.name}
                    </p>
                    {user?.role && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
                        <Shield className="w-3 h-3 text-blue-500 shrink-0" />
                        {user.role}
                      </p>
                    )}
                  </div>
                </div>

                {user?.organization && (
                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate">
                    <Building className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{user.organization}</span>
                  </div>
                )}
              </div>

              {/* Action: Profile Info */}
              <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Account
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-[#08101d]">
                  <span className="text-slate-500 dark:text-slate-400">Status</span>
                  <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online & Active
                  </span>
                </div>
              </div>

              {/* Action: Logout */}
              {onLogout && (
                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setUserMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
