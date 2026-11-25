import { apiRequest } from "./apiClient";
import { organizationService } from "./organizationService";

export interface NetworkDevice {
  id: string;
  name: string;
  hostname: string;
  ip: string;
  port: number;
  vendor: string;
  model: string;
  type: string;
  site: string;
  status: "online" | "warning" | "offline" | "maintenance";
  protocol: string;
  uptime: string;
  latency: string;
  lastSeen: string;
  serialNumber: string;
}

export interface DeviceDetailProfile {
  id: string;
  organizationId: string;
  name: string;
  hostname: string;
  ip: string;
  oem: string;
  type: string;
  location: string;
  environment: string;
  status: string;
  pollingMethod: string;
  healthPercentage: number;
  lastPolledAt?: string;
  managementIp: string;
  managementPort: number;
  protocol: string;
  username: string;
  authMethod: string;
  snmpVersion: string;
  snmpCommunity: string;
  snmpContext: string;
  pollingFrequencySec: number;
  timeoutSec: number;
  retries: number;
  apiEndpoint?: string | null;
}

export interface FetchDevicesParams {
  search?: string;
  oem?: string;
  type?: string;
  status?: string;
  pollingMethod?: string;
  location?: string;
}

export interface CreateDevicePayload {
  organizationId?: string;
  name: string;
  hostname?: string;
  ip: string;
  oem: string;
  type: string;
  location: string;
  environment?: string;
  mgmtIp?: string;
  port?: number;
  protocol?: string;
  username?: string;
  authMethod?: string;
  credential?: string;
  collectionMethod?: string;
  snmpVersion?: string;
  snmpCommunity?: string;
  snmpContext?: string;
  pollingFrequency?: number;
  timeoutSec?: number;
  retries?: number;
  apiEndpoint?: string;
  apiAuthToken?: string;
  syslogFacility?: string;
  syslogPort?: number;
}

export interface UpdateDevicePayload {
  name: string;
  type?: string;
  location: string;
  environment?: string;
  status?: string;
  pollingMethod?: string;
  snmpCommunity?: string;
  pollingFrequency?: number;
}

export interface TestConnectionPayload {
  ip: string;
  port?: number;
  protocol?: string;
  oem?: string;
}

export interface ConnectionTestResult {
  success: boolean;
  rtt: string;
  oemDetected: string;
  osVersion: string;
  message: string;
}

const VENDOR_LABEL_MAP: Record<string, string> = {
  cisco: "Cisco",
  juniper: "Juniper",
  arista: "Arista",
  fortinet: "Fortinet",
  mikrotik: "MikroTik",
  huawei: "Huawei",
  "palo alto": "Palo Alto",
  meraki: "Meraki",
  other: "Other",
};

const TYPE_LABEL_MAP: Record<string, string> = {
  "core router": "Core Router",
  "edge router": "Edge Router",
  "l3 switch": "L3 Switch",
  firewall: "Firewall",
  "cpe gateway": "CPE Gateway",
  "access switch": "Access Switch",
  router: "Router",
  switch: "Switch",
  "load balancer": "Load Balancer",
};

const STATUS_LABEL_MAP: Record<string, string> = {
  online: "Online",
  warning: "Warning",
  offline: "Offline",
  maintenance: "Maintenance",
};

function mapFilterParam(value: string | undefined, map: Record<string, string>): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed || trimmed.toLowerCase() === "all") return undefined;
  return map[trimmed.toLowerCase()] || trimmed;
}

function normalizeStatus(rawStatus: unknown): NetworkDevice["status"] {
  const lower = String(rawStatus || "online").toLowerCase();
  if (lower === "warning") return "warning";
  if (lower === "offline") return "offline";
  if (lower === "maintenance") return "maintenance";
  return "online";
}

export function normalizeDevice(raw: Record<string, unknown>): NetworkDevice {
  const id = String(raw.id || `dev-${Date.now()}`);
  const name = String(raw.name || raw.deviceName || "Unnamed Device");
  const vendor = String(raw.oem || raw.vendor || "Unknown");
  const type = String(raw.type || raw.deviceType || "Router");
  const ip = String(raw.ip || raw.ipAddress || "0.0.0.0");

  return {
    id,
    name,
    hostname: String(
      raw.hostname || `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.garuda.io`
    ),
    ip,
    port: Number(raw.port || raw.managementPort) || 161,
    vendor,
    model: String(raw.model || type || "Enterprise"),
    type,
    site: String(raw.location || raw.site || "Default Site"),
    status: normalizeStatus(raw.status),
    protocol: String(raw.pollingMethod || raw.protocol || "SNMP"),
    uptime: String(raw.health || raw.uptime || "100%"),
    latency: String(raw.latency || "—"),
    lastSeen: String(raw.lastPoll || raw.lastSeen || "Just now"),
    serialNumber: String(
      raw.serialNumber || `GAR-${id.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toUpperCase()}`
    ),
  };
}

function extractDevicesList(res: unknown): NetworkDevice[] {
  if (Array.isArray(res)) {
    return res.map((item) => normalizeDevice(item as Record<string, unknown>));
  }
  if (res && typeof res === "object") {
    const obj = res as Record<string, unknown>;
    const candidate = obj.data || obj.devices || obj.content || obj.items;
    if (Array.isArray(candidate)) {
      return candidate.map((item) => normalizeDevice(item as Record<string, unknown>));
    }
  }
  return [];
}

function extractDataObject<T>(res: unknown): T {
  if (res && typeof res === "object") {
    const obj = res as Record<string, unknown>;
    if (obj.data && typeof obj.data === "object" && !Array.isArray(obj.data)) {
      return obj.data as T;
    }
  }
  return res as T;
}

function getStoredOrganizationName(): string | undefined {
  if (typeof window === "undefined") return undefined;

  try {
    const rawUser = localStorage.getItem("garuda_auth_user");
    if (rawUser) {
      const parsed = JSON.parse(rawUser) as { organization?: string; organizationId?: string };
      if (parsed?.organization) return parsed.organization;
    }
  } catch {
    // ignore storage parse error
  }

  try {
    const token = localStorage.getItem("garuda_auth_token");
    if (token && token.includes(".")) {
      const parts = token.split(".");
      if (parts.length >= 2) {
        const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const claims = JSON.parse(window.atob(base64)) as { organization?: string };
        if (claims?.organization) return claims.organization;
      }
    }
  } catch {
    // ignore JWT decode error
  }

  return undefined;
}

async function resolveOrganizationId(explicitOrgId?: string): Promise<string> {
  if (explicitOrgId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(explicitOrgId)) {
    return explicitOrgId;
  }

  if (typeof window !== "undefined") {
    try {
      const rawUser = localStorage.getItem("garuda_auth_user");
      if (rawUser) {
        const parsed = JSON.parse(rawUser) as { organizationId?: string };
        if (
          parsed?.organizationId &&
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            parsed.organizationId
          )
        ) {
          return parsed.organizationId;
        }
      }
    } catch {
      // ignore
    }
  }

  const orgs = await organizationService.getOrganizations();
  const targetOrgName = getStoredOrganizationName()?.toLowerCase().trim();

  if (targetOrgName && orgs.length > 0) {
    const matched = orgs.find(
      (org) =>
        org.name.toLowerCase().trim() === targetOrgName ||
        (org.orgName && org.orgName.toLowerCase().trim() === targetOrgName)
    );
    if (matched?.id) return matched.id;
  }

  if (orgs[0]?.id) {
    return orgs[0].id;
  }

  throw new Error("Unable to resolve organization ID. Please sign in again.");
}

export function parsePollingFrequencySeconds(value: string | number | undefined): number {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }
  if (typeof value === "string") {
    const secMatch = /(\d+)\s*s\b/i.exec(value);
    if (secMatch) {
      return Number.parseInt(secMatch[1], 10) || 60;
    }
    const numMatch = /(\d+)/.exec(value);
    if (numMatch) {
      return Number.parseInt(numMatch[1], 10) || 60;
    }
  }
  return 60;
}

export const deviceService = {
  /**
   * Fetch filtered device inventory
   * GET /api/v1/devices
   */
  async getDevices(params: FetchDevicesParams = {}): Promise<NetworkDevice[]> {
    const query = new URLSearchParams();
    if (params.search?.trim()) query.set("search", params.search.trim());

    const oem = mapFilterParam(params.oem, VENDOR_LABEL_MAP);
    if (oem) query.set("oem", oem);

    const type = mapFilterParam(params.type, TYPE_LABEL_MAP);
    if (type) query.set("type", type);

    const status = mapFilterParam(params.status, STATUS_LABEL_MAP);
    if (status) query.set("status", status);

    if (params.pollingMethod && params.pollingMethod !== "all" && params.pollingMethod !== "All") {
      query.set("pollingMethod", params.pollingMethod);
    }
    if (params.location && params.location !== "all" && params.location !== "All") {
      query.set("location", params.location);
    }

    const queryString = query.toString();
    const endpoint = `/api/v1/devices${queryString ? `?${queryString}` : ""}`;

    const res = await apiRequest<unknown>(endpoint, {
      method: "GET",
    });

    return extractDevicesList(res);
  },

  /**
   * Get device profile by ID
   * GET /api/v1/devices/{id}
   */
  async getDeviceById(id: string): Promise<DeviceDetailProfile> {
    const res = await apiRequest<unknown>(`/api/v1/devices/${encodeURIComponent(id)}`, {
      method: "GET",
    });
    return extractDataObject<DeviceDetailProfile>(res);
  },

  /**
   * Onboard a new network device (5-Step Wizard)
   * POST /api/v1/devices
   */
  async createDevice(payload: CreateDevicePayload): Promise<NetworkDevice> {
    const organizationId = await resolveOrganizationId(payload.organizationId);

    const sanitizedHostname =
      payload.hostname?.trim() ||
      `${payload.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")}.garuda.io`;

    const requestBody = {
      organizationId,
      name: payload.name.trim(),
      hostname: sanitizedHostname,
      ip: payload.ip.trim(),
      oem: payload.oem.trim(),
      type: payload.type.trim(),
      location: payload.location.trim(),
      environment: payload.environment || "Production",
      mgmtIp: payload.mgmtIp?.trim() || payload.ip.trim(),
      port: payload.port || 161,
      protocol: payload.protocol || "SSH / SNMP",
      username: payload.username || "admin",
      authMethod: payload.authMethod || "SHA-256 + AES-256",
      credential: payload.credential || "encrypted_secret",
      collectionMethod: payload.collectionMethod || "SNMP",
      snmpVersion: payload.snmpVersion || "v3",
      snmpCommunity: payload.snmpCommunity || "public_garuda_ro",
      snmpContext: payload.snmpContext || "Carrier-VRF-01",
      pollingFrequency: payload.pollingFrequency || 60,
      timeoutSec: payload.timeoutSec || 5,
      retries: payload.retries || 3,
      ...(payload.apiEndpoint ? { apiEndpoint: payload.apiEndpoint } : {}),
      ...(payload.apiAuthToken ? { apiAuthToken: payload.apiAuthToken } : {}),
      syslogFacility: payload.syslogFacility || "local7",
      syslogPort: payload.syslogPort || 514,
    };

    const res = await apiRequest<unknown>("/api/v1/devices", {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    const dataObj = extractDataObject<Record<string, unknown>>(res);
    return normalizeDevice({
      ...dataObj,
      hostname: sanitizedHostname,
      port: requestBody.port,
    });
  },

  /**
   * Update existing device parameters
   * PUT /api/v1/devices/{id}
   */
  async updateDevice(id: string, payload: UpdateDevicePayload): Promise<NetworkDevice> {
    const res = await apiRequest<unknown>(`/api/v1/devices/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    const dataObj = extractDataObject<Record<string, unknown>>(res);
    return normalizeDevice(dataObj);
  },

  /**
   * Delete / Decommission device
   * DELETE /api/v1/devices/{id}
   */
  async deleteDevice(id: string): Promise<void> {
    await apiRequest<unknown>(`/api/v1/devices/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },

  /**
   * Test connection handshake (Wizard / Ping)
   * POST /api/v1/devices/test-connection
   */
  async testConnection(payload: TestConnectionPayload): Promise<ConnectionTestResult> {
    const res = await apiRequest<unknown>("/api/v1/devices/test-connection", {
      method: "POST",
      body: JSON.stringify({
        ip: payload.ip.trim(),
        port: payload.port || 161,
        protocol: payload.protocol || "SSH / SNMP",
        oem: payload.oem || "Cisco",
      }),
    });

    const dataObj = extractDataObject<Record<string, unknown>>(res);
    return {
      success: Boolean(dataObj?.success),
      rtt: String(dataObj?.rtt || "—"),
      oemDetected: String(dataObj?.oemDetected || payload.oem || "Unknown"),
      osVersion: String(dataObj?.osVersion || "—"),
      message: String(dataObj?.message || "Handshake test completed."),
    };
  },
};

export default deviceService;

