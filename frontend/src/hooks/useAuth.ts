"use client";

import { useState, useEffect, useCallback } from "react";
import {
  authService,
  UserSession,
  RolePermissions,
  UserRole,
} from "@/services/authService";

export function useAuth() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [permissions, setPermissions] = useState<RolePermissions>(() =>
    authService.getPermissions(null)
  );

  const refreshAuth = useCallback(() => {
    const current = authService.getCurrentUser() ?? authService.getDefaultUser();
    setUser(current);
    setPermissions(authService.getPermissions(current));
  }, []);

  useEffect(() => {
    refreshAuth();

    const handleAuthChange = (e: Event) => {
      const customEvent = e as CustomEvent<UserSession>;
      if (customEvent.detail) {
        setUser(customEvent.detail);
        setPermissions(authService.getPermissions(customEvent.detail));
      } else {
        refreshAuth();
      }
    };

    window.addEventListener("garuda-auth-change", handleAuthChange);
    window.addEventListener("storage", refreshAuth);
    return () => {
      window.removeEventListener("garuda-auth-change", handleAuthChange);
      window.removeEventListener("storage", refreshAuth);
    };
  }, [refreshAuth]);

  const switchRole = useCallback((role: UserRole) => {
    const updated = authService.switchRole(role);
    setUser(updated);
    setPermissions(authService.getPermissions(updated));
    return updated;
  }, []);

  return {
    user,
    permissions,
    isAdmin: permissions.isAdmin,
    switchRole,
    logout: () => authService.logout(),
  };
}

export default useAuth;
