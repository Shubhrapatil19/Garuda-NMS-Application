"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard,
  Network,
  Activity,
  Layers,
  BellRing,
  Server,
  Settings,
  ChevronLeft,
  LogOut,
  X,
  Users,
  ShieldCheck,
} from "lucide-react";
import GarudaLogo from "@/components/GarudaLogo";

import dbData from "../../data/db.json";

export interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  badge?: string | number | null;
}

// Dedicated Navigation for Network Engineer Role
export const networkEngineerNavigationItems: NavigationItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "sites-insights", label: "Sites insights", icon: Network },
  { id: "performance-view", label: "Performance view", icon: Activity },
  { id: "summary-view", label: "Summary view", icon: Layers },
  { id: "alert-engine", label: "Alert engine", icon: BellRing, badge: "23" },
  { id: "device-onboarding", label: "Device onboarding", icon: Server },
  { id: "settings", label: "Settings", icon: Settings },
];

// Dedicated Navigation for Administrator Role
export const adminNavigationItems: NavigationItem[] = [
  { id: "dashboard", label: "Admin Console", icon: LayoutDashboard },
  { id: "users", label: "User Management", icon: Users },
  { id: "device-onboarding", label: "Device Inventory", icon: Server },
  { id: "alert-engine", label: "Alert Engine", icon: BellRing, badge: "23" },
  { id: "audit-logs", label: "Audit Logs", icon: ShieldCheck },
  { id: "settings", label: "System Settings", icon: Settings },
];

export const defaultNavigationItems = networkEngineerNavigationItems;

export interface SidebarUser {
  name?: string;
  role?: string;
  initials?: string;
  avatar?: string;
}

export interface SidebarProps {
  activeTab?: string;
  onSelectTab?: (tabId: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  items?: NavigationItem[];
  user?: SidebarUser | null;
  onLogout?: () => void;
  className?: string;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<Readonly<SidebarProps>> = ({
  activeTab = "dashboard",
  onSelectTab,
  isCollapsed = false,
  onToggleCollapse,
  items,
  user = dbData.users[0],
  onLogout,
  className = "",
  mobileOpen = false,
  onCloseMobile,
}) => {
  const isAdmin = (user?.role || "").toLowerCase().includes("admin");
  const navItems = items || (isAdmin ? adminNavigationItems : networkEngineerNavigationItems);

  // On mobile (< lg / 1024px) or when mobile drawer is open, sidebar must NEVER be collapsed.
  // Collapse mode is exclusively a desktop feature.
  const [isMobileScreen, setIsMobileScreen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobileScreen(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const collapsed = (isMobileScreen || mobileOpen) ? false : isCollapsed;

  const [indicatorStyle, setIndicatorStyle] = useState<{
    top: number;
    height: number;
    opacity: number;
    isReady: boolean;
  }>({
    top: 0,
    height: 44,
    opacity: 0,
    isReady: false,
  });

  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const navRef = useRef<HTMLElement | null>(null);

  // Helper to determine if an item is active
  const isItemActive = (item: NavigationItem) => {
    const current = (activeTab || "").toLowerCase().trim();
    const itemId = item.id.toLowerCase().trim();
    const itemLabel = item.label.toLowerCase().trim();

    if (current === itemId || current === itemLabel) return true;
    if (itemId === "dashboard" && (current === "dashboard" || current === "")) return true;
    if (
      itemId === "device-onboarding" &&
      (current.includes("device") || current.includes("onboarding"))
    ) {
      return true;
    }
    if (
      itemId === "alert-engine" &&
      (current.includes("alert") || current.includes("triage"))
    ) {
      return true;
    }
    if (itemId === "users" && current.includes("user")) return true;
    if (itemId === "audit-logs" && (current.includes("audit") || current.includes("log"))) return true;
    return false;
  };

  const activeIndex = navItems.findIndex(isItemActive);

  // Dynamically calculate and animate the sliding pill position
  useEffect(() => {
    const updateIndicator = () => {
      if (activeIndex >= 0 && itemRefs.current[activeIndex] && navRef.current) {
        const el = itemRefs.current[activeIndex];
        if (el) {
          setIndicatorStyle((prev) => ({
            top: el.offsetTop,
            height: el.offsetHeight,
            opacity: 1,
            isReady: prev.isReady,
          }));
        }
      } else {
        setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
      }
    };

    updateIndicator();

    // Enable smooth animations after initial mount placement
    const readyTimer = setTimeout(() => {
      setIndicatorStyle((prev) => ({ ...prev, isReady: true }));
    }, 80);

    // After sidebar collapse/expand transition (300ms), recalculate
    const transitionTimer = setTimeout(() => {
      updateIndicator();
    }, 320);

    const handleResize = () => updateIndicator();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(readyTimer);
      clearTimeout(transitionTimer);
    };
  }, [activeTab, activeIndex, collapsed]);

  const handleItemClick = (item: NavigationItem) => {
    if (onSelectTab) {
      onSelectTab(item.id);
    }
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay (< lg only) */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close mobile navigation sidebar"
          tabIndex={-1}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300 border-0 p-0"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 lg:static lg:h-screen lg:top-0 bg-white dark:bg-[#081426] border-r border-slate-200 dark:border-[#12233b] transition-all duration-300 ease-in-out flex flex-col justify-between select-none shrink-0 shadow-2xl lg:shadow-xl ${
          mobileOpen
            ? "translate-x-0 w-72 max-w-[85vw]"
            : "-translate-x-full lg:translate-x-0"
        } ${
          collapsed ? "lg:w-20" : "lg:w-64"
        } ${className}`}
        aria-label="Main Sidebar Navigation"
      >
        {/* Border Floating Collapse / Expand Toggle Button (Desktop only) */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex absolute -right-3 top-5.5 w-6 h-6 rounded-full bg-white dark:bg-[#0a1830] border border-slate-200 dark:border-[#1b3256] shadow-md items-center justify-center text-slate-500 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-400 hover:shadow-[0_0_10px_rgba(59,130,246,0.3)] transition-all duration-200 z-50 cursor-pointer focus:outline-none group"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft
              size={13}
              className={`transition-transform duration-300 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 ${
                collapsed ? "rotate-180" : ""
              }`}
            />
          </button>
        )}

        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Top Header: GarudaLogo & Mobile Close Button */}
          <div
            className={`h-17 shrink-0 flex items-center justify-between border-b border-slate-200/80 dark:border-[#14233a] transition-all duration-300 ${
              collapsed ? "lg:justify-center px-4 lg:px-0" : "px-4"
            }`}
          >
            {/* Logo Brand Area */}
            <button
              type="button"
              className={`flex items-center overflow-hidden bg-transparent border-0 p-0 text-left cursor-pointer ${
                collapsed ? "lg:justify-center" : ""
              }`}
              onClick={() => {
                if (collapsed && onToggleCollapse) {
                  onToggleCollapse();
                } else if (onSelectTab) {
                  onSelectTab("dashboard");
                  onCloseMobile?.();
                }
              }}
              title={collapsed ? "Expand sidebar" : undefined}
            >
              <GarudaLogo
                size="md"
                theme="auto"
                showText={!collapsed}
                showSubtitle={!collapsed}
              />
            </button>

            {/* Mobile Close Button (< lg only) */}
            {onCloseMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#0f2444] transition-colors cursor-pointer"
                title="Close sidebar"
                aria-label="Close sidebar"
              >
                <X size={18} />
              </button>
            )}
          </div>

        {/* Navigation Items List */}
        <nav
          ref={navRef}
          className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto overflow-x-hidden relative"
        >
          {/* Animated Sliding Active Background Pill */}
          <div
            className={`absolute rounded-xl pointer-events-none bg-blue-50/90 border border-blue-200/90 shadow-xs dark:bg-[#0d223f] dark:border-[#1e3c66] dark:shadow-[0_0_15px_rgba(0,153,255,0.14)] ${
              collapsed
                ? "w-11 h-11 left-1/2 -translate-x-1/2"
                : "left-3 right-3"
            } ${
              indicatorStyle.isReady
                ? "transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
                : "transition-none"
            }`}
            style={{
              top: `${indicatorStyle.top}px`,
              height: collapsed ? "44px" : `${indicatorStyle.height}px`,
              opacity: indicatorStyle.opacity,
            }}
          >
            {/* Left Blue Glowing Accent Bar (Only shown in expanded mode for clean alignment) */}
            {!collapsed && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#0099ff] rounded-r-full shadow-[0_0_8px_rgba(0,153,255,0.8)]" />
            )}
          </div>

          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = isItemActive(item);

            return (
              <button
                key={item.id}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                type="button"
                onClick={() => handleItemClick(item)}
                title={collapsed ? item.label : undefined}
                className={`h-11 flex items-center transition-colors duration-200 rounded-xl cursor-pointer relative z-10 group outline-none focus:outline-none focus-visible:outline-none focus:ring-0 active:scale-[0.98] ${
                  collapsed
                    ? "w-11 mx-auto justify-center px-0"
                    : "w-full px-3.5 justify-between"
                } ${
                  isActive
                    ? "text-blue-700 font-semibold dark:text-white"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 dark:text-slate-300 dark:hover:text-white dark:hover:bg-[#0c1e38]/60 font-medium"
                }`}
              >
                <div
                  className={`flex items-center min-w-0 ${
                    collapsed ? "justify-center" : "gap-3.5"
                  }`}
                >
                  <span className="w-5 h-5 flex items-center justify-center shrink-0">
                    <Icon
                      size={20}
                      strokeWidth={isActive ? 2.2 : 1.9}
                      className={`transition-all duration-300 ${
                        isActive
                          ? "text-blue-600 dark:text-[#38bdf8] scale-105 drop-shadow-[0_0_6px_rgba(56,189,248,0.35)]"
                          : "text-slate-400 group-hover:text-blue-600 dark:text-slate-400 dark:group-hover:text-[#38bdf8] scale-100"
                      }`}
                    />
                  </span>
                  <span
                    className={`text-[15px] tracking-tight truncate whitespace-nowrap transition-all duration-300 ${
                      collapsed
                        ? "max-w-0 opacity-0 -translate-x-2 pointer-events-none"
                        : "max-w-40 opacity-100 translate-x-0"
                    } ${
                      isActive
                        ? "text-blue-700 dark:text-white font-semibold"
                        : "text-slate-600 dark:text-slate-300 font-medium group-hover:text-slate-900 dark:group-hover:text-white"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>

                {/* Badge: Full pill in expanded, tiny indicator dot in collapsed */}
                {item.badge && (
                  collapsed ? (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#081426]" />
                  ) : (
                    <span
                      className="px-2 py-0.5 rounded-full text-[12px] font-semibold bg-rose-500/15 text-rose-600 border border-rose-200 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/35 shadow-xs shrink-0 ml-auto transition-all duration-300"
                    >
                      {item.badge}
                    </span>
                  )
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer: Avatar & User Profile */}
      <div className="p-3 border-t border-slate-200 dark:border-[#12233b] bg-slate-50 dark:bg-[#071120]">
        <div
          className={`flex items-center rounded-xl p-2 transition-colors hover:bg-slate-100 dark:hover:bg-[#0c1e38]/70 group ${
            collapsed ? "justify-center px-0" : "justify-between"
          }`}
          title={
            collapsed
              ? user?.name
                ? `${user.name} (${user.role || "Engineer"})`
                : "User Profile"
              : undefined
          }
        >
          <div className="flex items-center gap-3 min-w-0 overflow-hidden">
            {/* Avatar Circle with Online Status */}
            <div className="relative shrink-0">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold tracking-tight shadow-xs border transition-colors ${
                  isAdmin
                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border-indigo-300 dark:border-indigo-600/40"
                    : "bg-blue-100 text-blue-700 dark:bg-[#0c1f3c] dark:text-white border-blue-200 dark:border-blue-500/30"
                }`}
              >
                {user?.initials || (user?.name ? user.name.slice(0, 2).toUpperCase() : "U")}
              </div>
              <span
                className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#071120]"
                title="Online"
              />
            </div>

            {/* Name and Role with smooth collapse transition */}
            <div
              className={`flex flex-col leading-tight min-w-0 transition-all duration-300 overflow-hidden ${
                collapsed
                  ? "max-w-0 opacity-0 -translate-x-2 pointer-events-none"
                  : "max-w-35 opacity-100 translate-x-0"
              }`}
            >
              <span className="font-bold text-[14px] text-slate-800 dark:text-white truncate">
                {user?.name}
              </span>
              <div className="flex items-center gap-1 mt-0.5 min-w-0">
                {isAdmin ? (
                  <span className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 truncate">
                    Administrator
                  </span>
                ) : (
                  <span className="text-[12px] font-medium text-slate-500 dark:text-slate-400 truncate">
                    {user?.role || "Network Engineer"}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Logout button with smooth collapse transition */}
          {onLogout && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onLogout();
              }}
              className={`p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 transition-all duration-300 cursor-pointer shrink-0 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 ${
                collapsed
                  ? "max-w-0 opacity-0 p-0 pointer-events-none overflow-hidden"
                  : "max-w-8 opacity-100"
              }`}
              title="Sign out"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
