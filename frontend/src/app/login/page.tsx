"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NetworkTopologyMap from "@/components/NetworkTopologyMap";
import GarudaLogo from "@/components/GarudaLogo";
import {
  ShieldCheck,
  Shield,
  Building2,
  ChevronDown,
  User,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  ArrowRight,
  Loader2,
  Globe,
  Search,
  Check,
} from "lucide-react";
import { authService } from "@/services/authService";
import { organizationService, Organization } from "@/services/organizationService";
import OAuthSignInModal from "@/components/OAuthSignInModal";
import ForgotPasswordModal from "@/components/ForgotPasswordModal";
import { toast } from "sonner";
import { sanitizeApiError } from "@/utils/errorHandler";

// Custom hook to manage Organization loading, searching, and selection
function useOrganizationSelector() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [orgSearchQuery, setOrgSearchQuery] = useState("");
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);
  const orgDropdownRef = useRef<HTMLDivElement>(null);
  const orgSearchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchOrganizations = async () => {
      setIsLoadingOrgs(true);
      try {
        const data = await organizationService.getOrganizations();
        if (!isMounted) return;
        setOrganizations(data);
        if (data.length > 0) {
          setSelectedOrg((prev) => (!prev || !data.some((d) => d.id === prev.id) ? data[0] : prev));
        } else {
          setSelectedOrg(null);
        }
      } catch (err) {
        console.warn("Failed to load organizations:", err);
        if (isMounted) {
          setOrganizations([]);
          setSelectedOrg(null);
        }
      } finally {
        if (isMounted) setIsLoadingOrgs(false);
      }
    };

    fetchOrganizations().catch((err) => {
      console.warn("Failed to load organizations:", err);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        orgDropdownRef.current &&
        !orgDropdownRef.current.contains(event.target as Node)
      ) {
        setIsOrgDropdownOpen(false);
        setOrgSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOrgDropdownOpen && orgSearchInputRef.current) {
      orgSearchInputRef.current.focus();
    }
  }, [isOrgDropdownOpen]);

  const q = orgSearchQuery.toLowerCase();
  const filteredOrgs = organizations.filter(
    (org) =>
      org.name?.toLowerCase().includes(q) ||
      org.label?.toLowerCase().includes(q) ||
      org.domain?.toLowerCase().includes(q) ||
      org.orgCode?.toLowerCase().includes(q)
  );

  const getOrgDisplayLabel = (): string => {
    if (isLoadingOrgs) return "Loading organizations...";
    if (selectedOrg) return selectedOrg.label;
    if (organizations.length === 0) return "No organizations found";
    return "Select organization";
  };

  return {
    organizations,
    selectedOrg,
    setSelectedOrg,
    isOrgDropdownOpen,
    setIsOrgDropdownOpen,
    orgSearchQuery,
    setOrgSearchQuery,
    filteredOrgs,
    orgDropdownRef,
    orgSearchInputRef,
    getOrgDisplayLabel,
  };
}

const validateLoginForm = (
  trimmedUsername: string,
  selectedOrg: Organization | null,
  authMethod: "password" | "otp",
  password: string,
  otpCode: string
): string => {
  if (!trimmedUsername) {
    return "Please enter your corporate email or handle.";
  }
  if (!selectedOrg) {
    return "Please select your organization.";
  }
  if (authMethod === "password") {
    if (!password) {
      return "Please enter your password.";
    }
  } else {
    const trimmedOtp = otpCode.trim();
    if (!trimmedOtp) {
      return "Please enter your 6-digit one-time code.";
    }
    if (trimmedOtp.length !== 6) {
      return "One-time code must be exactly 6 digits.";
    }
  }
  return "";
};

export default function LoginPage() {
  const router = useRouter();
  const [authMethod, setAuthMethod] = useState<"password" | "otp">("password");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [username, setUsername] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("email") || "";
    }
    return "";
  });
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isOAuthModalOpen, setIsOAuthModalOpen] = useState(false);
  const [activeOAuthProvider, setActiveOAuthProvider] = useState<"GOOGLE" | "GITHUB" | null>(null);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const {
    selectedOrg,
    setSelectedOrg,
    isOrgDropdownOpen,
    setIsOrgDropdownOpen,
    orgSearchQuery,
    setOrgSearchQuery,
    filteredOrgs,
    orgDropdownRef,
    orgSearchInputRef,
    getOrgDisplayLabel,
  } = useOrganizationSelector();

  const getFullEmail = (handle: string): string => {
    const trimmed = handle.trim();
    if (!trimmed) return "";
    if (trimmed.includes("@")) return trimmed;
    if (selectedOrg) {
      return `${trimmed}@${selectedOrg.domain}`;
    }
    return trimmed;
  };

  const handleSendLoginCode = async () => {
    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      toast.error("Validation error", {
        description: "Please enter your username or email first.",
      });
      return;
    }
    const fullEmail = getFullEmail(trimmedUsername);
    setIsSendingOtp(true);
    try {
      const res = await authService.sendLoginOtp(fullEmail);
      toast.success("Code Sent", {
        description: res.message || `Verification code sent to ${fullEmail}.`,
      });
    } catch (err: unknown) {
      const msg = sanitizeApiError(err, "Failed to send verification code.");
      toast.error("Failed to Send Code", { description: msg });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");

    const trimmedUsername = username.trim();
    const validationError = validateLoginForm(
      trimmedUsername,
      selectedOrg,
      authMethod,
      password,
      otpCode
    );

    if (validationError) {
      setErrorMsg(validationError);
      toast.error("Validation error", { description: validationError });
      return;
    }

    if (!selectedOrg) return;

    setIsLoading(true);
    const fullEmail = getFullEmail(trimmedUsername);

    try {
      const session = await authService.login({
        username: fullEmail,
        ...(authMethod === "password"
          ? { password }
          : { otpCode: otpCode.trim() }),
        organization: selectedOrg.label,
        organizationId: selectedOrg.id,
        rememberMe,
      });

      const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const callback = params?.get("callbackUrl");
      const last = typeof window !== "undefined" ? localStorage.getItem("garuda_last_route") : null;
      const target =
        callback && !callback.startsWith("/login") && !callback.startsWith("/signup")
          ? callback
          : last && !last.startsWith("/login") && !last.startsWith("/signup") && last !== "/"
          ? last
          : "/dashboard";

      toast.success("Login Confirmed", {
        description: `Welcome back, ${session.name || session.username}! Redirecting...`,
      });

      setTimeout(() => {
        router.push(target);
      }, 500);
    } catch (err: unknown) {
      const message = sanitizeApiError(
        err,
        "Failed to authenticate. Please check your credentials."
      );
      setErrorMsg(message);
      toast.error("Login Rejected", { description: message });
      setIsLoading(false);
    }
  };

  const handleOpenOAuth = (provider: "GOOGLE" | "GITHUB") => {
    setErrorMsg("");
    if (!selectedOrg) {
      const msg = "Please select your organization first.";
      setErrorMsg(msg);
      toast.error("Organization Required", { description: msg });
      return;
    }
    setActiveOAuthProvider(provider);
    setIsOAuthModalOpen(true);
  };

  const handleOAuthSelectAccount = async (account: { name: string; email: string }) => {
    if (!selectedOrg || !activeOAuthProvider) return;

    try {
      const session = await authService.loginWithOAuth({
        organizationId: selectedOrg.id,
        provider: activeOAuthProvider,
        idToken: `oauth_${activeOAuthProvider.toLowerCase()}_token_${Date.now()}`,
        email: account.email,
        fullName: account.name,
      });

      const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const callback = params?.get("callbackUrl");
      const last = typeof window !== "undefined" ? localStorage.getItem("garuda_last_route") : null;
      const target =
        callback && !callback.startsWith("/login") && !callback.startsWith("/signup")
          ? callback
          : last && !last.startsWith("/login") && !last.startsWith("/signup") && last !== "/"
          ? last
          : "/dashboard";

      setIsOAuthModalOpen(false);
      toast.success("Single Sign-On Verified", {
        description: `Signed in as ${session.name || account.email}. Redirecting...`,
      });

      setTimeout(() => {
        router.push(target);
      }, 500);
    } catch (err: unknown) {
      const msg = sanitizeApiError(err, "OAuth authentication failed.");
      setErrorMsg(msg);
      toast.error("OAuth Error", { description: msg });
    }
  };

  return (
    <div className="relative w-full h-screen max-h-screen overflow-hidden bg-[#040811] text-slate-100 flex flex-col justify-between select-none font-sans">
      <div className="fixed top-10 left-[15%] w-125 h-125 rounded-full bg-blue-600/8 blur-[140px] pointer-events-none" />
      <div className="fixed bottom-10 left-[35%] w-112.5 h-112.5 rounded-full bg-cyan-500/5 blur-[150px] pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row flex-1 w-full h-full min-h-0 overflow-hidden">
        <div className="hidden lg:flex flex-1 flex-col justify-between p-6 xl:p-8 2xl:p-10 h-full overflow-hidden border-r border-[#12233b]/80 bg-[#081426]">
          <header className="animate-hero-header shrink-0 flex flex-row items-center justify-between gap-4">
            <GarudaLogo theme="dark" />
          </header>

          <div className="flex-1 min-h-0 flex flex-col justify-center my-3 xl:my-4 w-full">
            <div className="shrink-0 mb-3 xl:mb-4">
              <div className="animate-hero-tagline flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] text-blue-500 uppercase mb-2">
                <span className="animate-hero-line inline-block h-0.5 bg-blue-500" />
                <span>GARUDA OPERATIONS CLOUD</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[38px] xl:text-[44px] 2xl:text-[48px] font-extrabold text-white tracking-tight leading-[1.12]">
                <div className="overflow-hidden">
                  <span className="inline-block animate-hero-title-1">Unified Network</span>
                </div>
                <div className="overflow-hidden">
                  <span className="inline-block animate-hero-title-2">
                    Monitoring <span className="text-blue-500">&amp;</span> Operations
                  </span>
                </div>
              </h1>

              <p className="animate-hero-desc mt-2.5 text-[13px] sm:text-[14px] xl:text-[15px] leading-relaxed text-slate-400 max-w-120">
                One secure command center for visibility, performance, and control across your entire network estate.
              </p>
            </div>

            <NetworkTopologyMap />
          </div>

          <footer className="animate-hero-footer shrink-0 pt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[10px] sm:text-[11px]">
            <span className="font-semibold tracking-[0.18em] text-slate-500 uppercase">
              TRUSTED FOR MISSION-CRITICAL OPERATIONS
            </span>
            <div className="flex items-center gap-4 sm:gap-6 text-slate-500 font-bold tracking-widest text-[11px]">
              <span>CISCO</span>
              <span>FORTINET</span>
              <span>JUNIPER</span>
              <span>HUAWEI</span>
              <span>ARISTA</span>
            </div>
          </footer>
        </div>

        <div className="w-full lg:w-105 xl:w-115 2xl:w-122.5 flex-1 lg:flex-initial shrink-0 bg-[#060d19] flex flex-col justify-between p-4 sm:p-5 xl:p-6 2xl:p-7 relative shadow-2xl h-full overflow-y-auto">
          <div className="absolute top-1/4 right-0 w-60 h-60 bg-blue-600/4 blur-[100px] pointer-events-none" />

          <div className="w-full max-w-90 xl:max-w-95 mx-auto my-auto relative z-10 flex flex-col py-1">
            <div className="lg:hidden flex items-center justify-between pb-3 mb-2.5 border-b border-[#12233b]/80">
              <GarudaLogo size="sm" theme="dark" />
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>NOC Operational</span>
              </span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0a1830] border border-[#1d355d] text-[10px] font-semibold text-blue-400 uppercase tracking-wider self-start mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>SECURE ACCESS</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight">
              Welcome back
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Sign in to access your network operations workspace.
            </p>

            <div className="mt-2.5 xl:mt-3 p-1 rounded-xl bg-[#091426] border border-[#162744] grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod("password");
                  setErrorMsg("");
                }}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  authMethod === "password"
                    ? "bg-[#162744] text-white shadow-sm border border-slate-700/40"
                    : "text-slate-400 hover:text-slate-200 border border-transparent"
                }`}
              >
                Password
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMethod("otp");
                  setErrorMsg("");
                }}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  authMethod === "otp"
                    ? "bg-[#162744] text-white shadow-sm border border-slate-700/40"
                    : "text-slate-400 hover:text-slate-200 border border-transparent"
                }`}
              >
                One-time code
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-2.5 xl:mt-3 flex flex-col gap-2 xl:gap-2.5">
              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              <div ref={orgDropdownRef} className="relative">
                <label htmlFor="org-select-button" className="block text-[11px] font-medium text-slate-300 mb-1">
                  Customer / Organization
                </label>
                <button
                  id="org-select-button"
                  type="button"
                  onClick={() => {
                    setIsOrgDropdownOpen(!isOrgDropdownOpen);
                    setOrgSearchQuery("");
                  }}
                  className="w-full flex items-center rounded-xl bg-[#091528] border border-[#182a47] min-h-9.5 overflow-hidden transition-all hover:border-[#1e3a5f] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 cursor-pointer outline-none"
                >
                  <Building2 className="ml-3 w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span
                    className={`flex-1 text-left py-2 px-2.5 text-xs sm:text-[13px] truncate font-normal ${
                      selectedOrg ? "text-slate-100" : "text-slate-400"
                    }`}
                  >
                    {getOrgDisplayLabel()}
                  </span>
                  <ChevronDown
                    className={`mr-3 w-3.5 h-3.5 text-slate-500 shrink-0 transition-transform duration-200 ${
                      isOrgDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOrgDropdownOpen && (
                  <div className="absolute z-50 mt-1.5 w-full rounded-xl bg-[#0b1a30] border border-[#1d355d] shadow-2xl shadow-black/40 overflow-hidden animate-fade-in">
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-[#162744]">
                      <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <input
                        ref={orgSearchInputRef}
                        type="text"
                        value={orgSearchQuery}
                        onChange={(e) => setOrgSearchQuery(e.target.value)}
                        placeholder="Search organization by name, code or domain..."
                        className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-500 outline-none"
                      />
                    </div>

                    <div className="max-h-48 overflow-y-auto py-1">
                      {filteredOrgs.length === 0 ? (
                        <div className="py-5 px-4 text-center text-xs text-slate-500">
                          No matching organizations found
                        </div>
                      ) : (
                        filteredOrgs.map((org) => (
                          <button
                            key={org.id}
                            type="button"
                            onClick={() => {
                              setSelectedOrg(org);
                              setIsOrgDropdownOpen(false);
                              setOrgSearchQuery("");
                            }}
                            className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left text-xs transition-colors cursor-pointer ${
                              selectedOrg?.id === org.id
                                ? "bg-blue-600/15 text-blue-400"
                                : "text-slate-300 hover:bg-[#12233b]"
                            }`}
                          >
                            <div className="flex flex-col min-w-0 pr-2">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-100 truncate text-[13px]">
                                  {org.name}
                                </span>
                                {org.orgCode && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#162744] text-blue-400 border border-blue-500/20 shrink-0">
                                    {org.orgCode}
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400 truncate mt-0.5">
                                {org.label ? `${org.label} · ` : ""}@{org.domain}
                              </span>
                            </div>
                            {selectedOrg?.id === org.id && (
                              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="login-username" className="block text-[11px] font-medium text-slate-300 mb-1">
                  Username or email
                </label>
                <div className="flex items-center rounded-xl bg-[#091528] border border-[#182a47] min-h-9.5 overflow-hidden transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
                  <User className="ml-3 w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    id="login-username"
                    required
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={selectedOrg ? "username" : "Username or email"}
                    className="flex-1 bg-transparent py-2 px-2.5 text-xs sm:text-[13px] text-slate-100 placeholder-slate-500 outline-none min-w-0 font-normal"
                  />
                  {selectedOrg && !username.includes("@") && (
                    <span className="pr-3 text-xs text-slate-500 font-normal shrink-0 select-none">
                      @{selectedOrg.domain}
                    </span>
                  )}
                </div>
              </div>

              {authMethod === "password" ? (
                <div>
                  <label htmlFor="login-password" className="block text-[11px] font-medium text-slate-300 mb-1">
                    Password
                  </label>
                  <div className="flex items-center rounded-xl bg-[#091528] border border-[#182a47] min-h-9.5 overflow-hidden transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
                    <Lock className="ml-3 w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <input
                      id="login-password"
                      required
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="flex-1 bg-transparent py-2 px-2.5 text-xs sm:text-[13px] text-slate-100 placeholder-slate-500 outline-none min-w-0 font-normal"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="pr-3 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="login-otp" className="block text-[11px] font-medium text-slate-300">
                      One-time code
                    </label>
                    <button
                      type="button"
                      onClick={handleSendLoginCode}
                      disabled={isSendingOtp}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {isSendingOtp ? "Sending..." : "Send code"}
                    </button>
                  </div>
                  <div className="flex items-center rounded-xl bg-[#091528] border border-[#182a47] min-h-9.5 overflow-hidden transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
                    <KeyRound className="ml-3 w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <input
                      id="login-otp"
                      required
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="Enter 6-digit code"
                      className="flex-1 bg-transparent py-2 px-2.5 text-xs sm:text-[13px] text-slate-100 placeholder-slate-500 outline-none min-w-0 font-normal tracking-widest font-mono"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded bg-[#091528] border-[#182a47] text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="text-xs text-slate-400">Remember this device</span>
                </label>

                {authMethod === "password" && (
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordModalOpen(true)}
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium hover:underline transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-1.5 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-[13px] font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in to console</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            <div className="relative my-2 xl:my-2.5 flex items-center justify-center">
              <div className="border-t border-[#12233b] w-full" />
              <span className="bg-[#060d19] px-2.5 text-[10px] font-semibold tracking-wider text-slate-500 uppercase shrink-0">
                Or 
              </span>
              <div className="border-t border-[#12233b] w-full" />
            </div>

            <div className="w-full flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleOpenOAuth("GOOGLE")}
                disabled={isLoading}
                className="group w-full py-2 px-3 rounded-xl bg-[#091528] hover:bg-[#0e1d35] border border-[#182a47] hover:border-slate-500/50 text-slate-200 text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" role="img" aria-hidden="true">
                  <title>Google icon</title>
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenOAuth("GITHUB")}
                disabled={isLoading}
                className="group w-full py-2 px-3 rounded-xl bg-[#091528] hover:bg-[#0e1d35] border border-[#182a47] hover:border-slate-500/50 text-slate-200 text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <svg className="w-3.5 h-3.5 text-white shrink-0 fill-current" viewBox="0 0 24 24" role="img" aria-hidden="true">
                  <title>GitHub icon</title>
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
                <span>Continue with GitHub</span>
              </button>
            </div>

            <div className="mt-2 text-center text-xs text-slate-400">
              Don&apos;t have an enterprise account?{" "}
              <Link
                href="/signup"
                prefetch={false}
                className="font-semibold text-blue-400 hover:text-blue-300 hover:underline transition-colors"
              >
                Sign up
              </Link>
            </div>

            <div className="mt-1.5 flex items-center justify-center gap-1.5 text-[10px] text-slate-500 text-center">
              <Shield className="w-3.5 h-3.5 shrink-0" />
              <span>Supports SAML 2.0 and OpenID Connect</span>
            </div>

            <div className="lg:hidden mt-4 pt-3 border-t border-[#12233b]/70 text-center">
              <span className="text-[10px] font-semibold tracking-[0.16em] text-slate-500 uppercase block mb-1.5">
                TRUSTED FOR MISSION-CRITICAL OPERATIONS
              </span>
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-slate-500 font-bold tracking-widest text-[10px]">
                <span>CISCO</span>
                <span>FORTINET</span>
                <span>JUNIPER</span>
                <span>HUAWEI</span>
                <span>ARISTA</span>
              </div>
            </div>
          </div>

          <footer className="shrink-0 pt-2 lg:pt-2 flex flex-col sm:flex-row items-center justify-between text-[10px] xl:text-[11px] text-slate-500 gap-2 text-center sm:text-left">
            <span>© 2026 Garuda NMS</span>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <Link href="/privacy" className="hover:text-slate-300 transition-colors">
                Privacy
              </Link>
              <Link href="/security" className="hover:text-slate-300 transition-colors">
                Security
              </Link>
              <Link href="/help" className="hover:text-slate-300 transition-colors">
                Help center
              </Link>
              <span className="hover:text-slate-300 transition-colors flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                <span>AP-SOUTH-1</span>
              </span>
            </div>
          </footer>
        </div>
      </div>

      <OAuthSignInModal
        isOpen={isOAuthModalOpen}
        provider={activeOAuthProvider}
        organizationName={selectedOrg?.name || "Garuda Enterprise"}
        onClose={() => setIsOAuthModalOpen(false)}
        onSelectAccount={handleOAuthSelectAccount}
      />

      <ForgotPasswordModal
        isOpen={isForgotPasswordModalOpen}
        initialEmail={username.trim() ? getFullEmail(username.trim()) : ""}
        onClose={() => setIsForgotPasswordModalOpen(false)}
      />
    </div>
  );
}
