"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { dashboardService, DashboardData } from "@/services/dashboardService";
import OverviewCards from "@/components/OverviewCards";
import DeviceHealthCard from "@/components/DeviceHealthCard";
import DataPollingHealthCard from "@/components/DataPollingHealthCard";
import RecentAlertsCard from "@/components/RecentAlertsCard";
import DataCollectionMethodsCard from "@/components/DataCollectionMethodsCard";

export default function DashboardPage() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  useEffect(() => {
    dashboardService
      .getDashboardData()
      .then((data) => {
        setDashboardData(data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <OverviewCards
        overview={dashboardData?.overview}
        engineStatus={dashboardData?.engineStatus}
        onNavigateToTab={(tab) => {
          if (tab === "device-onboarding") router.push("/device-onboarding");
          else if (tab === "alert-engine") router.push("/alert-engine");
          else router.push(`/${tab}`);
        }}
        onManageInventory={() => router.push("/device-onboarding")}
        onViewTriage={() => router.push("/alert-engine")}
      />

      {/* TELEMETRY & HEALTH CARDS: DEVICE HEALTH & DATA POLLING HEALTH */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        <div className="xl:col-span-5 flex">
          <DeviceHealthCard
            data={dashboardData?.deviceHealth}
            monitoredAssets={dashboardData?.engineStatus?.monitoredNodes ?? 248}
            className="w-full"
          />
        </div>
        <div className="xl:col-span-7 flex">
          <DataPollingHealthCard
            data={dashboardData?.dataPollingHealth}
            className="w-full"
          />
        </div>
      </div>

      {/* RECENT ALERTS & DATA COLLECTION METHODS */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        <div className="xl:col-span-5 flex">
          <RecentAlertsCard
            alerts={dashboardData?.recentAlerts}
            onViewAll={() => router.push("/alert-engine")}
            className="w-full"
          />
        </div>
        <div className="xl:col-span-7 flex">
          <DataCollectionMethodsCard
            data={dashboardData?.dataCollectionMethods}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
