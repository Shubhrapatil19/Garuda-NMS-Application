import { getApiBaseUrl } from "./apiClient";
import { organizationService, Organization } from "./organizationService";
import dbData from "../../data/db.json";

export type UserRole = "Administrator" | "Network Engineer" | "NOC Lead Engineer";

export interface RolePermissions {
  canAddDevice: boolean;
  canDeleteDevice: boolean;
  canImportDevices: boolean;
  canModifySettings: boolean;
  canAcknowledgeAlerts: boolean;
  canResolveAlerts: boolean;
  canSyncPoller: boolean;
  isAdmin: boolean;
}

export const ROLE_PERMISSIONS: Record<string, RolePermissions> = {
  Administrator: {
    canAddDevice: true,
    canDeleteDevice: true,
    canImportDevices: true,
    canModifySettings: true,
    canAcknowledgeAlerts: true,
    canResolveAlerts: true,
    canSyncPoller: true,
    isAdmin: true,
  },
  "Network Engineer": {
    canAddDevice: false,
    canDeleteDevice: false,
    canImportDevices: false,
    canModifySettings: false,
    canAcknowledgeAlerts: true,
    canResolveAlerts: true,
    canSyncPoller: true,
    isAdmin: false,
  },
  "NOC Lead Engineer": {
    canAddDevice: false,
    canDeleteDevice: false,
    canImportDevices: false,
    canModifySettings: false,
    canAcknowledgeAlerts: true,
    canResolveAlerts: true,
    canSyncPoller: true,
    isAdmin: false,
  },
};

export interface UserSession {
  id: string;
  username: string;
  name: string;
  initials: string;
  role: string;
  organization: string;
  status?: string;
  token?: string;
}

export interface UserRecord {
  id: string;
  username: string;
  password?: string;
  name: string;
  initials?: string;
  role?: string;
  organization?: string;
  region?: string;
  status?: string;
  otpCode?: string;
  verificationCode?: string;
  createdAt?: string;
}

export interface LoginCredentials {
  username: string;
  password?: string;
  otpCode?: string;
  organization?: string;
  organizationId?: string;
  rememberMe?: boolean;
}

export interface SignupPayload {
  fullName: string;
  workEmail: string;
  password: string;
  confirmPassword?: string;
  verificationCode: string;
  agreeToTerms?: boolean;
  organization?: string;
  region?: string;
  role?: string;
}

export interface OAuthPayload {
  organizationId: string;
  provider: "GOOGLE" | "GITHUB";
  idToken: string;
  email?: string;
  fullName?: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

const STORAGE_KEY = "garuda_auth_user";

export const authService = {
  // Return the default user directly from data/db.json (defaults to Jayesh Nikumbh, NOC Lead Engineer)
  getDefaultUser(): UserSession {
    const defaultRecord =
      dbData.users.find((u) => u.username === "jnikumbh69@gmail.com") ||
      dbData.users[0];
    return {
      id: defaultRecord.id,
      username: defaultRecord.username,
      name: defaultRecord.name,
      initials: defaultRecord.initials,
      role: defaultRecord.role,
      organization: defaultRecord.organization,
      status: defaultRecord.status,
    };
  },

  // Calculate RBAC permissions based on active role
  getPermissions(user?: UserSession | null): RolePermissions {
    const role = (user?.role || this.getCurrentUser()?.role || "Network Engineer").toLowerCase();
    if (role.includes("admin")) {
      return ROLE_PERMISSIONS.Administrator;
    }
    return ROLE_PERMISSIONS["Network Engineer"];
  },

  // Helper check if user has Administrator privileges
  isAdmin(user?: UserSession | null): boolean {
    const role = (user?.role || this.getCurrentUser()?.role || "").toLowerCase();
    return role.includes("admin");
  },

  // Quick live role switch between Administrator and Network Engineer for testing RBAC
  switchRole(targetRole: UserRole): UserSession {
    let targetRecord;
    if (targetRole === "Administrator") {
      targetRecord = dbData.users.find((u) => u.role === "Administrator") || {
        id: "usr-admin",
        username: "admin@garuda.io",
        name: "System Administrator",
        initials: "SA",
        role: "Administrator",
        organization: "Garuda Enterprise HQ",
        status: "online",
      };
    } else {
      targetRecord = dbData.users.find((u) => u.username === "jnikumbh69@gmail.com") || {
        id: "usr-2",
        username: "jnikumbh69@gmail.com",
        name: "Jayesh Nikumbh",
        initials: "JN",
        role: "Network Engineer",
        organization: "Acme Networks — APAC Operations",
        status: "online",
      };
    }

    const session: UserSession = {
      id: targetRecord.id,
      username: targetRecord.username,
      name: targetRecord.name,
      initials: targetRecord.initials,
      role: targetRecord.role,
      organization: targetRecord.organization,
      status: targetRecord.status,
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      window.dispatchEvent(
        new CustomEvent("garuda-auth-change", { detail: session })
      );
    }

    return session;
  },

  // Handle login by calling backend API endpoints directly (/api/v1/auth/signin/password or /api/v1/auth/signin/otp)
  async login(credentials: LoginCredentials): Promise<UserSession> {
    const targetUsername = credentials.username.trim();
    const baseUrl = getApiBaseUrl();

    // 1. Password-based authentication (/api/v1/auth/signin/password)
    if (credentials.password !== undefined) {
      const endpoint = `${baseUrl}/api/v1/auth/signin/password`;
      const body = {
        organizationId: credentials.organizationId,
        usernameOrEmail: targetUsername,
        password: credentials.password,
        rememberMe: credentials.rememberMe !== undefined ? credentials.rememberMe : true,
      };

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json, */*",
          },
          body: JSON.stringify(body),
        });

        const data = await res.json().catch(() => null);

        if (!res.ok || (data && data.success === false)) {
          const errorMsg =
            data?.message ||
            (data?.data && typeof data.data === "object" ? Object.values(data.data).join(", ") : null) ||
            "Invalid organization, username/email, or password.";
          throw new Error(errorMsg);
        }

        const token =
          data?.token ||
          data?.data?.token ||
          data?.data?.accessToken ||
          data?.accessToken;

        const apiUser =
          data?.data?.user ||
          (data?.data && typeof data.data === "object" && !Array.isArray(data.data) && "username" in data.data
            ? data.data
            : data?.user || {});

        const session: UserSession = {
          id: apiUser.id || `usr-${Date.now()}`,
          username: apiUser.username || apiUser.email || targetUsername,
          name: apiUser.name || apiUser.fullName || targetUsername.split("@")[0],
          initials:
            apiUser.initials ||
            (apiUser.fullName || apiUser.name
              ? (apiUser.fullName || apiUser.name)
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)
              : targetUsername.slice(0, 2).toUpperCase()),
          role: apiUser.role || "NOC Lead Engineer",
          organization:
            apiUser.organization ||
            apiUser.orgName ||
            credentials.organization ||
            "Garuda Enterprise",
          status: "online",
          token,
        };

        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
          if (token) {
            localStorage.setItem("garuda_auth_token", token);
          }
          window.dispatchEvent(
            new CustomEvent("garuda-auth-change", { detail: session })
          );
        }

        return session;
      } catch (err: unknown) {
        if (err instanceof Error) throw err;
        throw new Error("Authentication failed. Please check your network and credentials.");
      }
    }

    // 2. OTP-based authentication (/api/v1/auth/signin/otp)
    if (credentials.otpCode !== undefined) {
      const endpoint = `${baseUrl}/api/v1/auth/signin/otp`;
      const body = {
        organizationId: credentials.organizationId,
        usernameOrEmail: targetUsername,
        oneTimeCode: credentials.otpCode.trim(),
        rememberMe: credentials.rememberMe !== undefined ? credentials.rememberMe : false,
      };

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json, */*",
          },
          body: JSON.stringify(body),
        });

        const data = await res.json().catch(() => null);

        if (!res.ok || (data && data.success === false)) {
          const errorMsg =
            data?.message ||
            (data?.data && typeof data.data === "object" ? Object.values(data.data).join(", ") : null) ||
            "Invalid one-time verification code.";
          throw new Error(errorMsg);
        }

        const token =
          data?.token ||
          data?.data?.token ||
          data?.data?.accessToken ||
          data?.accessToken;

        const apiUser =
          data?.data?.user ||
          (data?.data && typeof data.data === "object" && !Array.isArray(data.data) && "username" in data.data
            ? data.data
            : data?.user || {});

        const session: UserSession = {
          id: apiUser.id || `usr-${Date.now()}`,
          username: apiUser.username || apiUser.email || targetUsername,
          name: apiUser.name || apiUser.fullName || targetUsername.split("@")[0],
          initials:
            apiUser.initials ||
            (apiUser.fullName || apiUser.name
              ? (apiUser.fullName || apiUser.name)
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)
              : targetUsername.slice(0, 2).toUpperCase()),
          role: apiUser.role || "NOC Lead Engineer",
          organization:
            apiUser.organization ||
            apiUser.orgName ||
            credentials.organization ||
            "Garuda Enterprise",
          status: "online",
          token,
        };

        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
          if (token) {
            localStorage.setItem("garuda_auth_token", token);
          }
          window.dispatchEvent(
            new CustomEvent("garuda-auth-change", { detail: session })
          );
        }

        return session;
      } catch (err: unknown) {
        if (err instanceof Error) throw err;
        throw new Error("OTP verification failed. Please check your network and code.");
      }
    }

    throw new Error("Please provide either password or one-time code to sign in.");
  },

  // Continue with Google / GitHub OAuth (/api/v1/auth/oauth)
  async loginWithOAuth(payload: OAuthPayload): Promise<UserSession> {
    const baseUrl = getApiBaseUrl();
    const endpoint = `${baseUrl}/api/v1/auth/oauth`;

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, */*",
        },
        body: JSON.stringify({
          organizationId: payload.organizationId,
          provider: payload.provider,
          idToken: payload.idToken,
          email: payload.email,
          fullName: payload.fullName,
        }),
      });

      const responseData = await res.json().catch(() => null);

      if (!res.ok || (responseData && responseData.success === false)) {
        const errorMsg =
          responseData?.message ||
          `OAuth sign-in failed with ${payload.provider}. Please verify your account.`;
        throw new Error(errorMsg);
      }

      const token =
        responseData?.accessToken ||
        responseData?.data?.accessToken ||
        responseData?.token ||
        responseData?.data?.token;

      // Decode JWT token claims if available
      let tokenClaims: {
        sub?: string;
        email?: string;
        organization?: string;
        roles?: string[];
      } | null = null;

      if (token && typeof window !== "undefined") {
        try {
          const parts = token.split(".");
          if (parts.length >= 2) {
            const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
            const decodedStr = window.atob(base64);
            tokenClaims = JSON.parse(decodedStr);
          }
        } catch {
          // ignore token decode errors
        }
      }

      const apiUser = responseData?.data?.user || responseData?.user || responseData?.data || {};
      const userEmail = payload.email || tokenClaims?.email || apiUser?.email || "user@garuda.io";
      const userName = payload.fullName || apiUser?.fullName || apiUser?.name || userEmail.split("@")[0];

      const names = userName.trim().split(/\s+/);
      const initials =
        names.length > 1
          ? (names[0][0] + names[names.length - 1][0]).toUpperCase()
          : names[0].slice(0, 2).toUpperCase();

      const userRole = (tokenClaims?.roles?.[0] || apiUser?.role || "Network Engineer")
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c: string) => c.toUpperCase());

      const session: UserSession = {
        id: apiUser?.id || apiUser?.userId || tokenClaims?.sub || `usr-${Date.now()}`,
        username: userEmail,
        name: userName,
        initials,
        role: userRole,
        organization: tokenClaims?.organization || apiUser?.organization || "Garuda Enterprise",
        status: "online",
        token,
      };

      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
        if (token) {
          localStorage.setItem("garuda_auth_token", token);
        }
        window.dispatchEvent(
          new CustomEvent("garuda-auth-change", { detail: session })
        );
      }

      return session;
    } catch (err: unknown) {
      if (err instanceof Error) throw err;
      throw new Error(`Failed to sign in with ${payload.provider}.`);
    }
  },

  // Send login 6-digit OTP code to work email
  async sendLoginOtp(email: string): Promise<{ success: boolean; message: string }> {
    const baseUrl = getApiBaseUrl();
    const endpoint = `${baseUrl}/api/v1/auth/send-login-otp`;

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || (data && data.success === false)) {
        throw new Error(data?.message || "Failed to dispatch login verification code.");
      }

      return {
        success: true,
        message: data?.message || `Login verification code has been dispatched to ${email}.`,
      };
    } catch (err: unknown) {
      if (err instanceof Error) throw err;
      throw new Error("Failed to send login code. Please check your network connection.");
    }
  },

  // Send 6-digit verification code to work email for registration
  async sendSignupOtp(email: string): Promise<{ success: boolean; message: string }> {
    const baseUrl = getApiBaseUrl();
    const endpoint = `${baseUrl}/api/v1/auth/send-signup-otp`;

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || (data && data.success === false)) {
        throw new Error(data?.message || "Failed to dispatch verification code.");
      }

      return {
        success: true,
        message: data?.message || `Verification code has been dispatched to ${email}.`,
      };
    } catch (err: unknown) {
      if (err instanceof Error) throw err;
      throw new Error("Failed to send verification code. Please check your network connection.");
    }
  },

  // Handle user registration / signup directly with backend API (/api/v1/auth/signup)
  async signup(data: SignupPayload): Promise<UserSession> {
    const baseUrl = getApiBaseUrl();
    const endpoint = `${baseUrl}/api/v1/auth/signup`;

    const normalizedEmail = data.workEmail.trim().toLowerCase();
    const names = data.fullName.trim().split(/\s+/);
    const initials =
      names.length > 1
        ? (names[0][0] + names[names.length - 1][0]).toUpperCase()
        : names[0].slice(0, 2).toUpperCase();

    const requestPayload = {
      fullName: data.fullName.trim(),
      workEmail: normalizedEmail,
      password: data.password,
      confirmPassword: data.confirmPassword || data.password,
      verificationCode: (data.verificationCode || "").trim(),
      agreeToTerms: data.agreeToTerms !== undefined ? data.agreeToTerms : true,
    };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
        },
        body: JSON.stringify(requestPayload),
      });

      const responseData = await res.json().catch(() => null);

      if (!res.ok || (responseData && responseData.success === false)) {
        const errorMsg =
          responseData?.message ||
          `Registration failed with status ${res.status}. Please check your verification code.`;
        throw new Error(errorMsg);
      }

      const token = responseData?.token || responseData?.data?.token;
      const apiUser = responseData?.user || responseData?.data?.user;

      const session: UserSession = {
        id: apiUser?.id || `usr-${Date.now()}`,
        username: normalizedEmail,
        name: apiUser?.name || apiUser?.fullName || data.fullName.trim(),
        initials: apiUser?.initials || initials,
        role: apiUser?.role || data.role?.trim() || "NOC Lead Engineer",
        organization:
          apiUser?.organization ||
          apiUser?.orgName ||
          data.organization ||
          "Garuda Enterprise",
        status: "online",
        token,
      };

      // Note: Do not automatically log in upon signup so user authenticates explicitly on the login screen
      return session;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Registration failed. Please check your credentials and verification code.");
    }
  },

  // Get currently logged-in user from localStorage
  getCurrentUser(): UserSession | null {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      return JSON.parse(stored) as UserSession;
    } catch {
      return null;
    }
  },

  // Terminate user session locally (no backend logout API call)
  async logout(): Promise<void> {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem("garuda_auth_token");
      window.dispatchEvent(
        new CustomEvent("garuda-auth-change", { detail: null })
      );
    }
  },

  // Delegate organization retrieval to organizationService
  async getOrganizations(): Promise<Organization[]> {
    return organizationService.getOrganizations();
  },

  // Send password reset email (/api/v1/auth/forgot-password)
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    const baseUrl = getApiBaseUrl();
    const endpoint = `${baseUrl}/api/v1/auth/forgot-password`;

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, */*",
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || (data && data.success === false)) {
        throw new Error(data?.message || "Failed to send password reset email.");
      }

      return {
        success: true,
        message: data?.message || `Password reset link has been dispatched to ${email}.`,
      };
    } catch (err: unknown) {
      if (err instanceof Error) throw err;
      throw new Error("Failed to send reset email. Please check your connection.");
    }
  },

  // Reset password using token from email (/api/v1/auth/reset-password)
  async resetPassword(payload: ResetPasswordPayload): Promise<{ success: boolean; message: string }> {
    const baseUrl = getApiBaseUrl();
    const endpoint = `${baseUrl}/api/v1/auth/reset-password`;

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, */*",
        },
        body: JSON.stringify({
          token: payload.token.trim(),
          newPassword: payload.newPassword,
          confirmPassword: payload.confirmPassword,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || (data && data.success === false)) {
        throw new Error(data?.message || "Failed to reset password. The link may be expired.");
      }

      return {
        success: true,
        message: data?.message || "Your password has been successfully reset.",
      };
    } catch (err: unknown) {
      if (err instanceof Error) throw err;
      throw new Error("Password reset failed. Please check your link or try again.");
    }
  },

  // Check if session is active
  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  },
};
