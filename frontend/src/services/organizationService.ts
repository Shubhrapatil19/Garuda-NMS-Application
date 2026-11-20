import { getApiBaseUrl } from "./apiClient";

export interface Organization {
  id: string;
  name: string;
  label: string;
  domain: string;
  orgName?: string;
  orgCode?: string;
  domainName?: string;
  region?: string;
  status?: string;
}

interface ApiOrgResponse {
  success?: boolean;
  message?: string;
  data?: Array<{
    id: string;
    orgName: string;
    orgCode: string;
    domainName: string;
  }>;
}

let inFlightOrgPromise: Promise<Organization[]> | null = null;
let cachedOrgs: Organization[] | null = null;

export const organizationService = {
  // Fetch customer / organization list directly from external backend API (with deduplication)
  async getOrganizations(forceRefresh = false): Promise<Organization[]> {
    if (!forceRefresh && cachedOrgs && cachedOrgs.length > 0) {
      return cachedOrgs;
    }

    if (inFlightOrgPromise) {
      return inFlightOrgPromise;
    }

    inFlightOrgPromise = (async () => {
      const baseUrl = getApiBaseUrl();
      const endpoint = `${baseUrl}/api/v1/auth/organizations`;

      try {
        const res = await fetch(endpoint, {
          method: "GET",
          headers: {
            Accept: "*/*",
          },
        });

        if (res.ok) {
          const json: ApiOrgResponse = await res.json();
          const rawList = Array.isArray(json?.data)
            ? json.data
            : Array.isArray(json)
            ? (json as unknown as Array<{
                id: string;
                orgName: string;
                orgCode: string;
                domainName: string;
              }>)
            : [];

          if (rawList.length > 0) {
            const mapped = rawList.map((item) => ({
              id: item.id,
              name: item.orgName,
              label: item.orgName,
              domain: item.domainName,
              orgName: item.orgName,
              orgCode: item.orgCode,
              domainName: item.domainName,
              region: item.orgCode,
              status: "active",
            }));
            cachedOrgs = mapped;
            return mapped;
          }
        }
      } catch (error) {
        console.warn("Direct backend /api/v1/auth/organizations fetch warning:", error);
      } finally {
        inFlightOrgPromise = null;
      }

      // Do NOT fallback to dummy data; return empty list so UI shows "No organizations found"
      return [];
    })();

    return inFlightOrgPromise;
  },
};

export default organizationService;
