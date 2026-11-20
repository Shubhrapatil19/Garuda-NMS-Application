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

export default function LoginPage() {
  const router = useRouter();
  const [authMethod, setAuthMethod] = useState<"password" | "otp">("password");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isOAuthModalOpen, setIsOAuthModalOpen] = useState(false);
  const [activeOAuthProvider, setActiveOAuthProvider] = useState<"GOOGLE" | "GITHUB" | null>(null);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Organization dropdown state
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [orgSearchQuery, setOrgSearchQuery] = useState("");
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);
  const orgDropdownRef = useRef<HTMLDivElement>(null);
  const orgSearchInputRef = useRef<HTMLInputElement>(null);

  // Fetch organizations directly from backend API via organizationService on mount
  useEffect(() => {
    const fetchOrganizations = async () => {
      setIsLoadingOrgs(true);
      try {
        const data = await organizationService.getOrganizations();
        setOrganizations(data);
        if (data.length > 0) {
          if (!selectedOrg || !data.some((d) => d.id === selectedOrg.id)) {
            setSelectedOrg(data[0]);
          }
        } else {
          setSelectedOrg(null);
        }
      } catch (err) {
        console.warn("Failed to load organizations:", err);
        setOrganizations([]);
        setSelectedOrg(null);
      } finally {
        setIsLoadingOrgs(false);
      }
    };
    fetchOrganizations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check for email passed via query params (e.g. from signup redirect)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const emailParam = params.get("email");
      if (emailParam) {
        setUsername(emailParam);
      }
    }
  }, []);

  // Close org dropdown on outside click
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

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOrgDropdownOpen && orgSearchInputRef.current) {
      orgSearchInputRef.current.focus();
    }
  }, [isOrgDropdownOpen]);

  // Filtered organizations based on search
  const filteredOrgs = organizations.filter(
    (org) =>
      (org.name && org.name.toLowerCase().includes(orgSearchQuery.toLowerCase())) ||
      (org.label && org.label.toLowerCase().includes(orgSearchQuery.toLowerCase())) ||
      (org.domain && org.domain.toLowerCase().includes(orgSearchQuery.toLowerCase())) ||
      (org.orgCode && org.orgCode.toLowerCase().includes(orgSearchQuery.toLowerCase()))
  );

  // Build full email: username handle + @domain from selected org
  const getFullEmail = (handle: string): string => {
    const trimmed = handle.trim();
    if (!trimmed) return "";
    // If user already typed a full email with @, use it as-is
    if (trimmed.includes("@")) return trimmed;
    // Otherwise append the org domain
    if (selectedOrg) {
      return `${trimmed}@${selectedOrg.domain}`;
    }
    return trimmed;
  };

  // Send one-time login code via API
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
      const msg = err instanceof Error ? err.message : "Failed to send code.";
      toast.error("Failed to Send Code", { description: msg });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      const msg = "Please enter your corporate email or handle.";
      setErrorMsg(msg);
      toast.error("Validation error", { description: msg });
      return;
    }

    if (!selectedOrg) {
      const msg = "Please select your organization.";
      setErrorMsg(msg);
      toast.error("Validation error", { description: msg });
      return;
    }

    if (authMethod === "password") {
      if (!password) {
        const msg = "Please enter your password.";
        setErrorMsg(msg);
        toast.error("Validation error", { description: msg });
        return;
      }
    } else {
      const trimmedOtp = otpCode.trim();
      if (!trimmedOtp) {
        const msg = "Please enter your 6-digit one-time code.";
        setErrorMsg(msg);
        toast.error("Validation error", { description: msg });
        return;
      }
      if (trimmedOtp.length !== 6) {
        const msg = "One-time code must be exactly 6 digits.";
        setErrorMsg(msg);
        toast.error("Validation error", { description: msg });
        return;
      }
    }

    setIsLoading(true);

    // Build the full email: handle + @org.domain
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

      // Login Confirm (Success Toaster)
      toast.success("Login Confirmed", {
        description: `Welcome back, ${session.name || session.username}! Redirecting to dashboard...`,
      });

      // Smooth transition to Network Operations Dashboard
      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to authenticate. Please check your credentials.";
      setErrorMsg(message);

      // Login Reject (Error Toaster)
      toast.error("Login Rejected", {
        description: message,
      });

      setIsLoading(false);
    }
  };

  // Open Google or GitHub OAuth Account Chooser popup
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

  // Process chosen account from the OAuth dialog
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

      setIsOAuthModalOpen(false);

      toast.success("OAuth Authentication Confirmed", {
        description: `Signed in as ${session.name}! Redirecting to dashboard...`,
      });

      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : `Failed to authenticate with ${activeOAuthProvider}.`;
      setErrorMsg(msg);
      toast.error("OAuth Authentication Failed", { description: msg });
      throw err;
    }
  };

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen w-full bg-[#071120] text-slate-300 font-sans antialiased overflow-x-hidden lg:overflow-hidden select-none">
      {/* Bulletproof dark mode autofill override for Chrome/Edge */}
      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px #091528 inset !important;
          box-shadow: 0 0 0 1000px #091528 inset !important;
          -webkit-text-fill-color: #f1f5f9 !important;
          caret-color: #f1f5f9 !important;
          transition: background-color 50000s ease-in-out 0s !important;
        }
        input:autofill,
        input:autofill:hover,
        input:autofill:focus,
        input:autofill:active {
          -webkit-box-shadow: 0 0 0 1000px #091528 inset !important;
          box-shadow: 0 0 0 1000px #091528 inset !important;
          -webkit-text-fill-color: #f1f5f9 !important;
          caret-color: #f1f5f9 !important;
          transition: background-color 50000s ease-in-out 0s !important;
        }
      `}</style>
      {/* Ambient soft background glows */}
      <div className="fixed top-10 left-[15%] w-125 h-125 rounded-full bg-blue-600/[0.08] blur-[140px] pointer-events-none" />
      <div className="fixed bottom-10 left-[35%] w-112.5 h-112.5 rounded-full bg-cyan-500/[0.05] blur-[150px] pointer-events-none" />

      {/* Main 2-column layout */}
      <div className="relative z-10 flex flex-col lg:flex-row h-full min-h-screen lg:min-h-0">

        {/*LEFT COLUMN: BRAND, HERO & INTEGRATED NETWORK TOPOLOGY*/}
        <div className="hidden lg:flex flex-1 flex-col justify-between p-7 xl:p-10 2xl:p-12 lg:h-full lg:overflow-hidden border-r border-[#12233b]/80 bg-[#081426]">

          {/* Top Bar: Brand Logo & Status */}
          <header className="animate-hero-header flex-shrink-0 flex flex-row items-center justify-between gap-4">
            <GarudaLogo theme="dark" />
          </header>

          {/* Hero Section & Topology Map directly integrated on background */}
          <div className="flex-1 min-h-0 flex flex-col justify-center my-4 xl:my-6 w-full">
            {/* Tagline & Main Heading */}
            <div className="flex-shrink-0 mb-4 xl:mb-6">
              <div className="animate-hero-tagline flex items-center gap-2.5 text-[11px] font-bold tracking-[0.2em] text-blue-500 uppercase mb-3">
                <span className="animate-hero-line inline-block h-[2px] bg-blue-500" />
                GARUDA OPERATIONS CLOUD
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[40px] xl:text-[46px] 2xl:text-[50px] font-extrabold text-white tracking-tight leading-[1.12]">
                <div className="overflow-hidden">
                  <span className="inline-block animate-hero-title-1">
                    Unified Network
                  </span>
                </div>
                <div className="overflow-hidden">
                  <span className="inline-block animate-hero-title-2">
                    Monitoring <span className="text-blue-500">&amp;</span> Operations
                  </span>
                </div>
              </h1>

              <p className="animate-hero-desc mt-3 text-[14px] sm:text-[15px] xl:text-[16px] leading-relaxed text-slate-400 max-w-[520px]">
                One secure command center for visibility, performance, and control
                across your entire network estate.
              </p>
            </div>

            {/* ── Network Topology Map (Standalone Component with Process Draw Animation) ── */}
            <NetworkTopologyMap />
          </div>

          {/* Bottom Bar: Trusted Partners */}
          <footer className="animate-hero-footer flex-shrink-0 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[10px] sm:text-[11px]">
            <span className="font-semibold tracking-[0.18em] text-slate-500 uppercase">
              TRUSTED FOR MISSION-CRITICAL OPERATIONS
            </span>
            <div className="flex items-center gap-4 sm:gap-6 text-slate-500 font-bold tracking-widest text-[11px]">
              <span className="hover:text-slate-300 transition-colors cursor-default">CISCO</span>
              <span className="hover:text-slate-300 transition-colors cursor-default">FORTINET</span>
              <span className="hover:text-slate-300 transition-colors cursor-default">JUNIPER</span>
              <span className="hover:text-slate-300 transition-colors cursor-default">HUAWEI</span>
              <span className="hover:text-slate-300 transition-colors cursor-default">ARISTA</span>
            </div>
          </footer>
        </div>

        {/*RIGHT COLUMN: AUTHENTICATION / LOGIN PANEL*/}
        <div className="w-full lg:w-[440px] xl:w-[480px] 2xl:w-[520px] flex-1 lg:flex-initial flex-shrink-0 bg-[#060d19] flex flex-col justify-between p-4 sm:p-7 md:p-8 lg:p-7 xl:p-9 2xl:p-12 relative shadow-2xl min-h-screen lg:min-h-0 lg:h-full lg:overflow-y-auto">
          {/* Subtle background glow */}
          <div className="absolute top-1/4 right-0 w-[240px] h-[240px] bg-blue-600/[0.04] blur-[100px] pointer-events-none" />

          {/* Centered Form Wrapper */}
          <div className="w-full max-w-[400px] mx-auto my-auto relative z-10 flex flex-col py-4 sm:py-0">
            {/* Mobile Brand Header (< lg only) */}
            <div className="lg:hidden flex items-center justify-between pb-4 mb-3 border-b border-[#12233b]/80">
              <GarudaLogo size="sm" theme="dark" />
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                NOC Operational
              </span>
            </div>

            {/* Secure access badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0a1830] border border-[#1d355d] text-[10px] font-semibold text-blue-400 uppercase tracking-wider self-start mb-2.5 sm:mb-3 xl:mb-4">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              SECURE ACCESS
            </div>

            <h2 className="text-2xl sm:text-[28px] xl:text-[32px] font-bold text-white tracking-tight leading-tight">
              Welcome back
            </h2>
            <p className="mt-1 text-xs sm:text-[14px] text-slate-400">
              Sign in to access your network operations workspace.
            </p>

            {/* Auth Method Tabs */}
            <div className="mt-4 xl:mt-5 p-1 rounded-xl bg-[#091426] border border-[#162744] grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod("password");
                  setErrorMsg("");
                }}
                className={`py-2 text-xs sm:text-[13px] font-semibold rounded-lg transition-all cursor-pointer ${authMethod === "password"
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
                className={`py-2 text-xs sm:text-[13px] font-semibold rounded-lg transition-all cursor-pointer ${authMethod === "otp"
                  ? "bg-[#162744] text-white shadow-sm border border-slate-700/40"
                  : "text-slate-400 hover:text-slate-200 border border-transparent"
                  }`}
              >
                One-time code
              </button>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="mt-4 xl:mt-5 flex flex-col gap-3 xl:gap-3.5">
              {/* Customer / Organization — Searchable Dropdown */}
              <div ref={orgDropdownRef} className="relative">
                <label className="block text-[11px] sm:text-xs font-medium text-slate-300 mb-1.5">
                  Customer / Organization
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsOrgDropdownOpen(!isOrgDropdownOpen);
                    setOrgSearchQuery("");
                  }}
                  className="w-full flex items-center rounded-xl bg-[#091528] border border-[#182a47] min-h-[44px] overflow-hidden transition-all hover:border-[#1e3a5f] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 cursor-pointer outline-none"
                >
                  <Building2 className="ml-3.5 w-4 h-4 text-slate-400 shrink-0" />
                  <span
                    className={`flex-1 text-left py-2.5 sm:py-3 px-3 text-sm truncate font-normal ${selectedOrg ? "text-slate-100" : "text-slate-400"
                      }`}
                  >
                    {isLoadingOrgs
                      ? "Loading organizations..."
                      : selectedOrg
                        ? selectedOrg.label
                        : organizations.length === 0
                          ? "No organizations found"
                          : "Select organization"}
                  </span>
                  <ChevronDown
                    className={`mr-3 w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${isOrgDropdownOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>

                {/* Dropdown Panel */}
                {isOrgDropdownOpen && (
                  <div className="absolute z-50 mt-1.5 w-full rounded-xl bg-[#0b1a30] border border-[#1d355d] shadow-2xl shadow-black/40 overflow-hidden animate-fade-in">
                    {/* Search inside dropdown */}
                    <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[#162744]">
                      <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <input
                        ref={orgSearchInputRef}
                        type="text"
                        value={orgSearchQuery}
                        onChange={(e) => setOrgSearchQuery(e.target.value)}
                        placeholder="Search organizations..."
                        className="flex-1 bg-transparent text-xs text-slate-200 placeholder-slate-500 outline-none min-w-0"
                      />
                    </div>

                    {/* Organization list */}
                    <div className="max-h-[220px] overflow-y-auto">
                      {filteredOrgs.length === 0 ? (
                        <div className="px-4 py-6 text-xs text-slate-400 text-center flex flex-col items-center justify-center gap-1.5">
                          <Building2 className="w-5 h-5 text-slate-500 mb-0.5" />
                          <span className="font-medium text-slate-300">No organizations found</span>
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
                            className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors cursor-pointer ${selectedOrg?.id === org.id
                              ? "bg-blue-600/15 text-blue-400"
                              : "text-slate-300 hover:bg-[#111f38]"
                              }`}
                          >
                            <div className="flex flex-col min-w-0">
                              <span className="text-sm font-medium truncate">
                                {org.name}
                              </span>
                              <span className="text-[10px] text-slate-500 mt-0.5 truncate">
                                {org.label} · @{org.domain}
                              </span>
                            </div>
                            {selectedOrg?.id === org.id && (
                              <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 ml-2" />
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Username or email — with org domain suffix */}
              <div>
                <label className="block text-[11px] sm:text-xs font-medium text-slate-300 mb-1.5">
                  Username or email
                </label>
                <div className="flex items-center rounded-xl bg-[#091528] border border-[#182a47] min-h-[44px] overflow-hidden transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
                  <User className="ml-3.5 w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    required
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={selectedOrg ? `username` : "Username or email"}
                    className="flex-1 bg-transparent py-2.5 sm:py-3 px-3 text-sm text-slate-100 placeholder-slate-500 outline-none min-w-0 font-normal"
                  />
                  {/* Show @domain suffix when org is selected and user hasn't typed @ */}
                  {selectedOrg && !username.includes("@") && (
                    <span className="pr-3.5 text-sm text-slate-500 font-normal shrink-0 select-none">
                      @{selectedOrg.domain}
                    </span>
                  )}
                </div>
              </div>

              {/* Password or OTP */}
              {authMethod === "password" ? (
                <div>
                  <label className="block text-[11px] sm:text-xs font-medium text-slate-300 mb-1.5">
                    Password
                  </label>
                  <div className="flex items-center rounded-xl bg-[#091528] border border-[#182a47] min-h-[44px] overflow-hidden transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
                    <Lock className="ml-3.5 w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      required
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="flex-1 bg-transparent py-2.5 sm:py-3 px-3 text-sm text-slate-100 placeholder-slate-500 outline-none min-w-0 font-normal"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="pr-3.5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] sm:text-xs font-medium text-slate-300">
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
                  <div className="flex items-center rounded-xl bg-[#091528] border border-[#182a47] min-h-[44px] overflow-hidden transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
                    <KeyRound className="ml-3.5 w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      required
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="6-digit code"
                      maxLength={6}
                      className="flex-1 bg-transparent py-2.5 sm:py-3 px-3 text-sm text-slate-100 placeholder-slate-500 outline-none tracking-[0.3em] font-mono min-w-0"
                    />
                  </div>
                </div>
              )}

              {/* Remember me & Forgot Password */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-[#091528] text-blue-600 accent-blue-600 focus:ring-0 cursor-pointer"
                  />
                  <span className="text-[12px] sm:text-[13px] text-slate-300">
                    Remember me
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotPasswordModalOpen(true)}
                  className="text-[12px] sm:text-[13px] text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Sign In Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="mt-1 w-full py-2.5 sm:py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed text-white text-[13px] sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 hover:shadow-blue-500/40 hover:-translate-y-px active:translate-y-0 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4 text-white" />
                    Signing in to NOC...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* OR Divider */}
            <div className="flex items-center gap-3 my-3 xl:my-4">
              <div className="flex-1 h-px bg-[#15243b]" />
              <span className="text-[10px] font-semibold text-slate-500 tracking-widest uppercase">
                OR
              </span>
              <div className="flex-1 h-px bg-[#15243b]" />
            </div>

            {/* Login with Google & GitHub */}
            <div className="w-full flex flex-col gap-2.5">
              {/* Google Button */}
              <button
                type="button"
                onClick={() => handleOpenOAuth("GOOGLE")}
                disabled={isLoading}
                className="group w-full py-2.5 px-3.5 rounded-xl bg-[#091528] hover:bg-[#0e1d35] border border-[#182a47] hover:border-slate-500/50 text-slate-200 text-[12px] sm:text-[13px] font-medium flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* GitHub Button */}
              <button
                type="button"
                onClick={() => handleOpenOAuth("GITHUB")}
                disabled={isLoading}
                className="group w-full py-2.5 px-3.5 rounded-xl bg-[#091528] hover:bg-[#0e1d35] border border-[#182a47] hover:border-slate-500/50 text-slate-200 text-[12px] sm:text-[13px] font-medium flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 text-white shrink-0 fill-current" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
                <span>Continue with GitHub</span>
              </button>
            </div>

            {/* Signup Link */}
            <div className="mt-3.5 text-center text-xs text-slate-400">
              Don&apos;t have an enterprise account?{" "}
              <Link
                href="/signup"
                prefetch={false}
                className="font-semibold text-blue-400 hover:text-blue-300 hover:underline transition-colors"
              >
                Sign up
              </Link>
            </div>

            {/* Security note */}
            <div className="mt-2.5 xl:mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 text-center">
              <Shield className="w-3.5 h-3.5 shrink-0" />
              <span>Supports SAML 2.0 and OpenID Connect</span>
            </div>

            {/* Mobile Trusted Partners Strip (< lg only) */}
            <div className="lg:hidden mt-6 pt-5 border-t border-[#12233b]/70 text-center">
              <span className="text-[10px] font-semibold tracking-[0.16em] text-slate-500 uppercase block mb-2.5">
                TRUSTED FOR MISSION-CRITICAL OPERATIONS
              </span>
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-slate-500 font-bold tracking-widest text-[11px]">
                <span className="hover:text-slate-300 transition-colors">CISCO</span>
                <span className="hover:text-slate-300 transition-colors">FORTINET</span>
                <span className="hover:text-slate-300 transition-colors">JUNIPER</span>
                <span className="hover:text-slate-300 transition-colors">HUAWEI</span>
                <span className="hover:text-slate-300 transition-colors">ARISTA</span>
              </div>
            </div>
          </div>

          {/* Right Column Footer (Clean responsive layout) */}
          <footer className="flex-shrink-0 pt-6 lg:pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2.5 text-center sm:text-left">
            <span>© 2026 Garuda NMS</span>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <a href="#" className="hover:text-slate-300 transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-slate-300 transition-colors">
                Security
              </a>
              <a href="#" className="hover:text-slate-300 transition-colors">
                Help center
              </a>
              <a href="#" className="hover:text-slate-300 transition-colors flex flex-row items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />AP-SOUTH-1
              </a>
            </div>
          </footer>
        </div>
      </div>
      {/* OAuth Sign-In Popup Box (Google & GitHub) */}
      <OAuthSignInModal
        isOpen={isOAuthModalOpen}
        provider={activeOAuthProvider}
        organizationName={selectedOrg?.name || "Garuda Enterprise"}
        onClose={() => setIsOAuthModalOpen(false)}
        onSelectAccount={handleOAuthSelectAccount}
      />

      {/* Forgot Password Reset Email Modal */}
      <ForgotPasswordModal
        isOpen={isForgotPasswordModalOpen}
        initialEmail={username.trim() ? getFullEmail(username.trim()) : ""}
        onClose={() => setIsForgotPasswordModalOpen(false)}
      />
    </div>
  );
}
