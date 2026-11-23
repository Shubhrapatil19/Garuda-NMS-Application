"use client";

import { useSyncExternalStore, useCallback } from "react";
import {
  authService,
  UserSession,
  UserRole,
} from "@/services/authService";

let cachedUser: UserSession | null = null;
let cachedRawValue: string | null = null;

function subscribeAuth(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }
  window.addEventListener("garuda-auth-change", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("garuda-auth-change", callback);
    window.removeEventListener("storage", callback);
  };
}

function getAuthSnapshot(): UserSession | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = localStorage.getItem("garuda_auth_user");
    if (raw === cachedRawValue) {
      return cachedUser;
    }
    cachedRawValue = raw;
    cachedUser = raw ? (JSON.parse(raw) as UserSession) : null;
    return cachedUser;
  } catch {
    cachedRawValue = null;
    cachedUser = null;
    return null;
  }
}

function getAuthServerSnapshot(): UserSession | null {
  return null;
}

export function useAuth() {
  const user = useSyncExternalStore(
    subscribeAuth,
    getAuthSnapshot,
    getAuthServerSnapshot
  );

  const permissions = authService.getPermissions(user);

  const switchRole = useCallback((role: UserRole) => {
    return authService.switchRole(role);
  }, []);

  return {
    user,
    isAuthenticated: Boolean(user),
    loading: false,
    permissions,
    isAdmin: permissions.isAdmin,
    switchRole,
    logout: () => authService.logout(),
  };
}

export default useAuth;
