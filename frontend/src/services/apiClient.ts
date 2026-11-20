// Centralized API Client that strictly consumes the external API backend
// Reads the base URL from .env (NEXT_PUBLIC_API_URL)

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
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://tinsmith-clamp-oversight.ngrok-free.dev";
  return apiUrl.replace(/\/$/, "");
};

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${cleanEndpoint}`;

  const headers = {
    "Content-Type": "application/json",
    Accept: "*/*",
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      throw new ApiError(
        data?.message || `API request to ${cleanEndpoint} returned status ${res.status}`,
        res.status
      );
    }

    return data as T;
  } catch (error: unknown) {
    if (error instanceof ApiError) throw error;
    const msg =
      error instanceof Error
        ? error.message
        : `Failed to connect to backend at ${baseUrl}`;
    throw new ApiError(msg, 500);
  }
}
