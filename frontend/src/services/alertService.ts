import { apiRequest } from "./apiClient";

export interface CreateAlertRulePayload {
  ruleName: string;
  metric: string;
  triggerCondition: string;
  escalationThreshold: string;
  actionAutomation: string;
}

export interface AlertKpiMetrics {
  activeAlerts: number;
  criticalAlarms: number;
  openTickets: number;
  suppressedCount: number;
  timestamp?: string;
}

export const extractAlertKpi = (res: unknown): AlertKpiMetrics => {
  if (res && typeof res === "object") {
    const obj = res as Record<string, unknown>;
    const target = (obj.data && typeof obj.data === "object" ? obj.data : obj) as Record<string, unknown>;
    return {
      activeAlerts:
        typeof target.activeAlerts === "number"
          ? target.activeAlerts
          : Number(target.activeAlerts) || 0,
      criticalAlarms:
        typeof target.criticalAlarms === "number"
          ? target.criticalAlarms
          : Number(target.criticalAlarms) || 0,
      openTickets:
        typeof target.openTickets === "number"
          ? target.openTickets
          : Number(target.openTickets) || 0,
      suppressedCount:
        typeof target.suppressedCount === "number"
          ? target.suppressedCount
          : Number(target.suppressedCount) || 0,
      timestamp: typeof obj.timestamp === "string" ? obj.timestamp : undefined,
    };
  }
  return {
    activeAlerts: 0,
    criticalAlarms: 0,
    openTickets: 0,
    suppressedCount: 0,
  };
};

export interface AlertRuleResponse {
  id?: string;
  ruleName?: string;
  metric?: string;
  metricName?: string;
  triggerCondition?: string;
  escalationThreshold?: string;
  actionAutomation?: string;
  status?: string;
  message?: string;
  success?: boolean;
  [key: string]: unknown;
}

export interface ActiveAlertRule {
  id: string;
  ruleName: string;
  metricName: string;
  triggerCondition: string;
  escalationThreshold: string;
  actionAutomation: string;
  status: string;
  createdAt?: string;
  [key: string]: unknown;
}

export const normalizeAlertRule = (raw: Record<string, unknown>): ActiveAlertRule => {
  return {
    ...raw,
    id: String(raw.id || raw.ruleId || raw._id || `rule-${Date.now()}`),
    ruleName: String(raw.ruleName || raw.name || raw.rule || "Unnamed Rule"),
    metricName: String(raw.metricName || raw.metric || raw.monitoredMetric || "cpu_usage"),
    triggerCondition: String(raw.triggerCondition || raw.condition || raw.conditionRule || "—"),
    escalationThreshold: String(raw.escalationThreshold || raw.threshold || raw.escalation || "—"),
    actionAutomation: String(raw.actionAutomation || raw.action || raw.automation || "—"),
    status: String(raw.status || raw.state || "ACTIVE").toUpperCase(),
    createdAt: raw.createdAt ? String(raw.createdAt) : undefined,
  };
};

function extractRulesList(res: unknown): ActiveAlertRule[] {
  if (Array.isArray(res)) {
    return res.map((item) => normalizeAlertRule(item as Record<string, unknown>));
  }
  if (res && typeof res === "object") {
    const obj = res as Record<string, unknown>;
    const candidate = obj.data || obj.rules || obj.content || obj.items;
    if (Array.isArray(candidate)) {
      return candidate.map((item) => normalizeAlertRule(item as Record<string, unknown>));
    }
  }
  return [];
}

export interface AlertEvent {
  id: string;
  eventId: string;
  timestamp: string;
  componentType: string;
  severity: string;
  sourceDevice: string;
  ruleTriggerSource: string;
  lifecycleStatus: string;
  assignedTo?: string;
  [key: string]: unknown;
}

export interface FetchAlertsParams {
  search?: string;
  type?: string;
  severity?: string;
  timeRange?: string;
}

export const normalizeAlertEvent = (raw: Record<string, unknown>): AlertEvent => {
  const eventId = String(
    raw.eventCode ||
      raw.eventId ||
      raw.event_code ||
      raw.code ||
      raw.id ||
      "EVT-UNKNOWN"
  );
  const componentType = String(
    raw.type ||
      raw.componentType ||
      raw.component_type ||
      (eventId.startsWith("ALM") ? "Alarm" : eventId.startsWith("TCK") ? "Ticket" : "Alert")
  );
  const severity = String(raw.severity || "Info");
  const sourceDevice = String(
    raw.sourceDevice || raw.device || raw.deviceName || raw.source_device || "Unknown Device"
  );
  const ruleTriggerSource = String(
    raw.ruleSource ||
      raw.ruleTriggerSource ||
      raw.rule ||
      raw.ruleName ||
      raw.triggerSource ||
      raw.message ||
      raw.description ||
      "System trigger"
  );
  const lifecycleStatus = String(
    raw.status || raw.lifecycleStatus || raw.state || "OPEN"
  ).toUpperCase();
  const timestamp = String(
    raw.timestampDisplay ||
      raw.timestamp ||
      raw.createdAt ||
      raw.created_at ||
      raw.time ||
      "Just now"
  );

  return {
    ...raw,
    id: String(raw.id || eventId),
    eventId,
    timestamp,
    componentType,
    severity,
    sourceDevice,
    ruleTriggerSource,
    lifecycleStatus,
    assignedTo: raw.acknowledgedBy
      ? String(raw.acknowledgedBy)
      : raw.assignedTo
      ? String(raw.assignedTo)
      : undefined,
  };
};

function extractAlertsList(res: unknown): AlertEvent[] {
  if (Array.isArray(res)) {
    return res.map((item) => normalizeAlertEvent(item as Record<string, unknown>));
  }
  if (res && typeof res === "object") {
    const obj = res as Record<string, unknown>;
    const candidate = obj.data || obj.alerts || obj.content || obj.events || obj.items;
    if (Array.isArray(candidate)) {
      return candidate.map((item) => normalizeAlertEvent(item as Record<string, unknown>));
    }
  }
  return [];
}

export const alertService = {
  /**
   * Create and activate a new alert escalation rule
   * POST /api/v1/alerts/rules
   */
  async createRule(payload: CreateAlertRulePayload): Promise<AlertRuleResponse> {
    return apiRequest<AlertRuleResponse>("/api/v1/alerts/rules", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Fetch summary KPI metrics for the Alert Engine top cards
   * GET /api/v1/alerts/kpi
   */
  async getKpiMetrics(): Promise<AlertKpiMetrics> {
    const res = await apiRequest<unknown>("/api/v1/alerts/kpi", {
      method: "GET",
    });
    return extractAlertKpi(res);
  },

  /**
   * Fetch all configured alert escalation rules from external backend
   * GET /api/v1/alerts/rules
   */
  async getRules(): Promise<ActiveAlertRule[]> {
    const res = await apiRequest<unknown>("/api/v1/alerts/rules", {
      method: "GET",
    });
    return extractRulesList(res);
  },

  /**
   * Fetch filtered alert events from external backend
   * GET /api/v1/alerts
   */
  async getAlerts(params: FetchAlertsParams = {}): Promise<AlertEvent[]> {
    const query = new URLSearchParams();
    if (params.search?.trim()) query.set("search", params.search.trim());
    if (params.type && params.type !== "All") query.set("type", params.type);
    if (params.severity && params.severity !== "All") query.set("severity", params.severity);
    if (params.timeRange && params.timeRange !== "All") query.set("timeRange", params.timeRange);

    const queryString = query.toString();
    const endpoint = `/api/v1/alerts${queryString ? `?${queryString}` : ""}`;

    const res = await apiRequest<unknown>(endpoint, {
      method: "GET",
    });

    return extractAlertsList(res);
  },
};

export default alertService;
