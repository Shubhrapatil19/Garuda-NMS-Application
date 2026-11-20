import dbData from "../../data/db.json";

export interface DashboardData {
  engineStatus: {
    name: string;
    status: string;
    lastPoll: string;
    monitoredNodes: number;
  };
  overview: {
    totalDevices: {
      count: number;
      change: string;
      linkText: string;
    };
    onlineDevices: {
      count: number;
      healthyRate: string;
      icmpReachable: boolean;
      coreStatus: string;
    };
    offlineDevices: {
      count: number;
      recovered: string;
      circuitStatus: string;
      triageStatus: string;
    };
    activeAlerts: {
      count: number;
      changeVsLastHr: string;
      linkText: string;
    };
  };
  deviceHealth: {
    total: number;
    breakdown: Array<{
      label: string;
      count: number;
      percentage: number;
      color: string;
    }>;
  };
  dataPollingHealth: {
    pollingRequests: string;
    successful: string;
    failed: string;
    averageLatency: string;
    trend: Array<{
      time: string;
      latency: number;
    }>;
  };
  recentAlerts?: Array<{
    id: string;
    severity: "critical" | "warning" | "info";
    device: string;
    message: string;
    timestamp: string;
  }>;
  dataCollectionMethods?: {
    activePipelines: number;
    totalMonitored: number;
    footerNote: string;
    methods: Array<{
      id: string;
      name: string;
      devices: string;
      successRate: string;
    }>;
  };
}

export const dashboardService = {
  // Return telemetry from data/db.json (dashboard API not yet available on backend)
  async getDashboardData(): Promise<DashboardData> {
    return dbData.dashboard as DashboardData;
  },

  // Trigger manual sync across monitored nodes
  async syncNow(): Promise<{ success: boolean; timestamp: string }> {
    return { success: true, timestamp: "Just now" };
  },
};
