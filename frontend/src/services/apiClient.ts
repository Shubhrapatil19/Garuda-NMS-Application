// Centralized API Client that strictly consumes the external API backend
// Reads the base URL from .env (NEXT_PUBLIC_API_URL)

import { sanitizeApiError } from "../utils/errorHandler";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number = 500) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// Read base URL directly from environment (.env / .env.local)
export const getApiBaseUrl = (): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim() || "";
  return apiUrl.replace(/\/$/, "");
};

export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("garuda_auth_token");
};

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  let cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  // Ensure endpoint path has /api prefix without duplicating
  if (baseUrl.endsWith("/api") && cleanEndpoint.startsWith("/api/")) {
    cleanEndpoint = cleanEndpoint.replace(/^\/api/, "");
  } else if (!baseUrl.endsWith("/api") && !cleanEndpoint.startsWith("/api/")) {
    cleanEndpoint = `/api${cleanEndpoint}`;
  }

  const url = `${baseUrl}${cleanEndpoint}`;

  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "*/*",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const sanitized = sanitizeApiError(
        data?.message,
        `API request to ${cleanEndpoint} returned status ${res.status}`
      );
      throw new ApiError(sanitized, res.status);
    }

    return (data ?? { success: true }) as T;
  } catch (error: unknown) {
    if (error instanceof ApiError) throw error;
    const msg =
      error instanceof Error
        ? error.message
        : `Failed to connect to backend at ${baseUrl}`;
    throw new ApiError(
      sanitizeApiError(
        msg,
        "Unable to connect to the Garuda NMS backend server. Please try again later."
      ),
      500
    );
  }
}
