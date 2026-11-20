"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { useAuth } from "@/hooks/useAuth";
import { dashboardService } from "@/services/dashboardService";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import LogoutConfirmModal from "@/components/LogoutConfirmModal";
import { toast } from "sonner";

interface AppShellProps {
  children: React.ReactNode;
}

const AUTH_PATHS = ["/login", "/signup", "/reset-password", "/forgot-password", "/"];

export default function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();

  const { user, isAdmin } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState("Just now");
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Canonical URL cleanup: replace spaces with hyphens cleanly
  useEffect(() => {
    if (pathname && (pathname.includes("%20") || pathname.includes(" "))) {
      const normalized = decodeURIComponent(pathname).replace(/\s+/g, "-");
      router.replace(normalized);
    }
  }, [pathname, router]);

  // Always reset logout modal state on route navigation or auth transitions
  useEffect(() => {
    setIsLogoutModalOpen(false);
  }, [pathname]);

  // For authentication, reset-password and landing pages, render children directly without Shell
  const isAuthPage =
    !pathname ||
    pathname === "/" ||
    AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/") || pathname.startsWith(p + "?")) ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup");

  if (isAuthPage) {
    return <>{children}</>;
  }

  // Determine active tab from URL path (normalizing spaces and encoded entities)
  const activeTab = (() => {
    if (!pathname || pathname === "/" || pathname === "/dashboard") return "dashboard";
    const rawSegment = pathname.split("/")[1] || "dashboard";
    const segment = decodeURIComponent(rawSegment)
      .trim()
      .replace(/\s+/g, "-")
      .toLowerCase();
    return segment;
  })();

  // Determine Header Title
  const pageTitle = (() => {
    const titles: Record<string, string> = {
      dashboard: isAdmin ? "Administrator Console" : "Operations Dashboard",
      "device-onboarding": "Device Onboarding & Inventory",
      "sites-insights": "Sites Insights & Network Topology",
      "performance-view": "Real-Time Telemetry & Performance",
      "summary-view": "Executive Network Summary",
      "alert-engine": "Alert Engine & Incident Triage",
      settings: "System & Poller Settings",
      users: "User Management & RBAC Directory",
      "audit-logs": "Security Audit & System Event Logs",
    };
    return titles[activeTab] || (isAdmin ? "Administrator Console" : "Operations Dashboard");
  })();

  // Handle Tab Selection in Sidebar (Navigates to the page)
  const handleSelectTab = (tabId: string) => {
    const target = tabId.toLowerCase().trim();
    if (target === "dashboard") {
      router.push("/dashboard");
    } else if (target === "performance-view") {
      router.push("/performance-view/bandwidth-utilization");
    } else {
      router.push(`/${target}`);
    }
  };

  // Handle Global Telemetry Sync
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await dashboardService.syncNow();
      setLastSyncTime(res.timestamp || "Just now");
      toast.success("Synchronized", { description: "Network telemetry refreshed." });
    } catch {
      setLastSyncTime("Just now");
    } finally {
      setTimeout(() => setIsSyncing(false), 600);
    }
  };

  // Handle Logout Confirmation
  const handleConfirmLogout = async () => {
    setIsLogoutModalOpen(false);
    try {
      await authService.logout();
      toast.info("Logged Out", { description: "You have been logged out successfully." });
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  return (
    <div className="h-screen w-screen bg-[#f3f6fb] dark:bg-[#060b13] text-slate-800 dark:text-slate-100 font-sans flex antialiased select-none overflow-hidden transition-colors">
      {/* ─── SINGLE PERSISTENT LEFT SIDEBAR ─── */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        user={user}
        onLogout={() => setIsLogoutModalOpen(true)}
      />

      {/* ─── MAIN VIEWPORT WITH SINGLE PERSISTENT HEADER ─── */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto dashboard-viewport">
        <Header
          title={pageTitle}
          searchPlaceholder="Search sites, devices, IPs..."
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSync={handleSync}
          isSyncing={isSyncing}
          lastSyncTime={lastSyncTime}
          user={user}
          onLogout={() => setIsLogoutModalOpen(true)}
          onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)}
        />

        {/* ─── DYNAMIC PAGE WORKSPACE (CHILD PAGE LOADS HERE) ─── */}
        <div
          key={pathname}
          className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-20 animate-tab-switch"
        >
          {children}
        </div>
      </main>

      {/* Persistent Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
      />
    </div>
  );
}

