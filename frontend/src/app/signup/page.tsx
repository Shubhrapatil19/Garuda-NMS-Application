"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import GarudaLogo from "@/components/GarudaLogo";
import {
  Globe,
  Activity,
  Shield,
  UserPlus,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  KeyRound,
} from "lucide-react";
import gsap from "gsap";
import { authService } from "@/services/authService";
import { toast } from "sonner";

export default function SignupPage() {
  const router = useRouter();
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  // GSAP Staggered Cascade Entrance: cards appear one by one
  useEffect(() => {
    if (!cardsContainerRef.current) return;
    const cards = cardsContainerRef.current.children;

    gsap.fromTo(
      cards,
      {
        opacity: 0,
        y: 35,
        scale: 0.94,
        filter: "blur(6px)",
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        duration: 0.75,
        stagger: 0.22, // Ek-ek karke cards visible hote hain
        ease: "power3.out",
        delay: 0.35,
      }
    );
  }, []);

  const [formData, setFormData] = useState({
    fullName: "",
    workEmail: "",
    password: "",
    confirmPassword: "",
    verificationCode: "",
    region: "ap-south-1",
    agreedToTerms: false,
  });

  const [touched, setTouched] = useState<{
    fullName?: boolean;
    workEmail?: boolean;
    password?: boolean;
    confirmPassword?: boolean;
    verificationCode?: boolean;
    agreedToTerms?: boolean;
  }>({});

  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    workEmail?: string;
    password?: string;
    confirmPassword?: string;
    verificationCode?: string;
    agreedToTerms?: string;
  }>({});

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Verification code sending states
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [generatedCode, setGeneratedCode] = useState("");

  // Cooldown countdown timer for resending code
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Simple password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "", color: "bg-transparent" };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score: 1, label: "Weak", color: "bg-rose-500" };
    if (score === 2) return { score: 2, label: "Fair", color: "bg-amber-500" };
    if (score === 3) return { score: 3, label: "Good", color: "bg-blue-400" };
    return { score: 4, label: "Strong", color: "bg-emerald-400" };
  };

  const strength = getPasswordStrength(formData.password);

  const validateField = (
    field:
      | "fullName"
      | "workEmail"
      | "password"
      | "confirmPassword"
      | "verificationCode"
      | "agreedToTerms",
    val: any,
    currentFormData = formData
  ): string => {
    switch (field) {
      case "fullName": {
        const trimmed = (val || "").trim();
        if (!trimmed) return "Full name is required";
        if (trimmed.length < 2) return "Name must be at least 2 characters";
        return "";
      }
      case "workEmail": {
        const trimmed = (val || "").trim();
        if (!trimmed) return "Work email is required";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!emailRegex.test(trimmed)) return "Enter a valid email address (e.g. name@company.com)";
        return "";
      }
      case "password": {
        if (!val) return "Password is required";
        if (val.length < 8) return "Password must be at least 8 characters";
        return "";
      }
      case "confirmPassword": {
        if (!val) return "Please confirm your password";
        if (val !== currentFormData.password) return "Passwords do not match";
        return "";
      }
      case "verificationCode": {
        const trimmed = (val || "").trim();
        if (!trimmed) {
          return codeSent
            ? "Verification code is required"
            : "Please request a verification code sent to your email";
        }
        if (!/^\d{6}$/.test(trimmed)) {
          return "Verification code must be 6 digits";
        }
        return "";
      }
      case "agreedToTerms": {
        if (!val) return "You must agree to continue";
        return "";
      }
      default:
        return "";
    }
  };

  const handleSendCode = async () => {
    const emailErr = validateField("workEmail", formData.workEmail);
    setTouched((prev) => ({ ...prev, workEmail: true }));
    setFieldErrors((prev) => ({ ...prev, workEmail: emailErr }));

    if (emailErr || !formData.workEmail.trim()) {
      toast.error("Valid work email required", {
        description: "Please enter your work email first to receive a verification code.",
      });
      return;
    }

    setIsSendingCode(true);

    try {
      // Call backend API /api/v1/auth/send-signup-otp directly
      const res = await authService.sendSignupOtp(formData.workEmail.trim());

      setCodeSent(true);
      setResendTimer(60);

      // Auto-clear field error if any
      setFieldErrors((prev) => ({ ...prev, verificationCode: "" }));

      toast.success("Verification Code Sent", {
        description: res.message || `A 6-digit verification code was dispatched to ${formData.workEmail}.`,
        duration: 8000,
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Could not send verification email. Please try again.";
      toast.error("Failed to send code", {
        description: msg,
      });
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleChange = (
    field:
      | "fullName"
      | "workEmail"
      | "password"
      | "confirmPassword"
      | "verificationCode",
    value: string
  ) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);

    if (touched[field]) {
      setFieldErrors((prev) => ({
        ...prev,
        [field]: validateField(field, value, updated),
      }));
    }

    // Re-check confirmPassword when password updates
    if (field === "password" && touched.confirmPassword) {
      setFieldErrors((prev) => ({
        ...prev,
        confirmPassword: validateField("confirmPassword", updated.confirmPassword, updated),
      }));
    }

    if (errorMsg) setErrorMsg("");
  };

  const handleBlur = (
    field:
      | "fullName"
      | "workEmail"
      | "password"
      | "confirmPassword"
      | "verificationCode"
  ) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setFieldErrors((prev) => ({
      ...prev,
      [field]: validateField(field, formData[field], formData),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const nameErr = validateField("fullName", formData.fullName);
    const emailErr = validateField("workEmail", formData.workEmail);
    const passErr = validateField("password", formData.password);
    const confirmErr = validateField("confirmPassword", formData.confirmPassword);
    const codeErr = validateField("verificationCode", formData.verificationCode);
    const termsErr = validateField("agreedToTerms", formData.agreedToTerms);

    setTouched({
      fullName: true,
      workEmail: true,
      password: true,
      confirmPassword: true,
      verificationCode: true,
      agreedToTerms: true,
    });

    setFieldErrors({
      fullName: nameErr,
      workEmail: emailErr,
      password: passErr,
      confirmPassword: confirmErr,
      verificationCode: codeErr,
      agreedToTerms: termsErr,
    });

    if (nameErr || emailErr || passErr || confirmErr || codeErr || termsErr) {
      let msg = "Please complete all required fields correctly.";
      if (confirmErr === "Passwords do not match") {
        msg = "Passwords do not match. Please verify your confirm password.";
      } else if (codeErr) {
        msg = codeErr;
      } else if (termsErr) {
        msg = "Please agree to the Master Services Agreement to continue.";
      }
      setErrorMsg(msg);
      toast.error("Validation error", { description: msg });
      return;
    }

    setIsSubmitting(true);

    try {
      const session = await authService.signup({
        fullName: formData.fullName,
        workEmail: formData.workEmail,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        verificationCode: formData.verificationCode,
        agreeToTerms: formData.agreedToTerms,
        region: formData.region,
      });

      toast.success("Account created successfully", {
        description: `Account created for ${session.name || formData.fullName}! Please sign in to access your NOC workspace.`,
      });

      // Redirect to login page so user authenticates with their new account
      setTimeout(() => {
        router.push(`/login?email=${encodeURIComponent(formData.workEmail)}`);
      }, 700);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to create account. Please try again.";
      setErrorMsg(message);
      toast.error("Registration rejected", { description: message });
      setIsSubmitting(false);
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
      {/* Ambient background glows */}
      <div className="fixed top-12 left-[12%] w-[520px] h-[520px] rounded-full bg-blue-600/[0.07] blur-[150px] pointer-events-none" />
      <div className="fixed bottom-10 left-[38%] w-[480px] h-[480px] rounded-full bg-cyan-500/[0.05] blur-[160px] pointer-events-none" />

      {/* Main 2-column layout */}
      <div className="relative z-10 flex flex-col lg:flex-row h-full min-h-screen lg:min-h-0">
        {/* LEFT COLUMN: BRAND, VALUE PROPOSITION & CAPABILITIES*/}
        <div className="hidden lg:flex flex-1 flex-col justify-between p-7 xl:p-10 2xl:p-12 lg:h-full lg:overflow-hidden border-r border-[#12233b]/80 bg-[#081426]">
          {/* Top Bar: Reusable Brand Logo & Status */}
          <header className="animate-hero-header flex-shrink-0 flex flex-row items-center justify-between gap-4">
            <GarudaLogo href="/login" theme="dark" />
          </header>

          {/* Hero Content for Onboarding */}
          <div className="flex-1 min-h-0 flex flex-col justify-center my-6 xl:my-8 w-full max-w-[620px]">
            {/* Animated Enterprise Badge (Replaced 14-day trial text) */}
            <div className="animate-hero-tagline inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-[10.5px] font-semibold text-blue-400 tracking-[0.16em] uppercase mb-3.5 self-start backdrop-blur-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
              </span>
              <span>NEXT-GEN ENTERPRISE OBSERVABILITY</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-[40px] xl:text-[44px] font-extrabold text-white tracking-tight leading-[1.14]">
              <div className="overflow-hidden">
                <span className="inline-block animate-hero-title-1">
                  Deploy Your Network
                </span>
              </div>
              <div className="overflow-hidden">
                <span className="inline-block animate-hero-title-2">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-300">
                    Command Center
                  </span>{" "}
                  in Minutes
                </span>
              </div>
            </h1>

            <p className="animate-hero-desc mt-3.5 text-[14px] sm:text-[15px] xl:text-[16px] leading-relaxed text-slate-400 max-w-[540px]">
              Gain complete real-time visibility, automated telemetry diagnostics,
              and root-cause intelligence across your distributed multi-cloud underlays.
            </p>

            {/* Feature Highlights Grid with GSAP Staggered Cascade Entrance */}
            <div ref={cardsContainerRef} className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Feature 1: Global Topology */}
              <div className="group p-4 rounded-2xl bg-[#09172c]/80 border border-[#162a4a] hover:border-blue-500/40 hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(59,130,246,0.15)] transition-all duration-300">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform mb-2.5">
                  <Globe className="w-4 h-4" />
                </div>
                <h4 className="text-white font-bold text-[13px]">Global Topology</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                  Live mesh telemetry across 14+ APAC &amp; global nodes.
                </p>
                <span className="inline-block mt-2 text-[10.5px] font-mono text-blue-400/90 font-medium">
                  14 Active Mesh Nodes
                </span>
              </div>

              {/* Feature 2: Sub-Second SLA */}
              <div className="group p-4 rounded-2xl bg-[#09172c]/80 border border-[#162a4a] hover:border-cyan-500/40 hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(6,182,212,0.15)] transition-all duration-300">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                    <Activity className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                    99.94%
                  </span>
                </div>
                <h4 className="text-white font-bold text-[13px]">Sub-Second SLA</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                  Real-time anomaly diagnostics &amp; automated path failover.
                </p>
                <span className="inline-block mt-2 text-[10.5px] font-mono text-cyan-400/90 font-medium">
                  Sub-Second Path Failover
                </span>
              </div>

              {/* Feature 3: Zero-Trust Security */}
              <div className="group p-4 rounded-2xl bg-[#09172c]/80 border border-[#162a4a] hover:border-emerald-500/40 hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(16,185,129,0.15)] transition-all duration-300">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform mb-2.5">
                  <Shield className="w-4 h-4" />
                </div>
                <h4 className="text-white font-bold text-[13px]">Zero-Trust Security</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                  SOC 2 Type II certified with fine-grained telemetry ACLs.
                </p>
                <span className="inline-block mt-2 text-[10.5px] font-mono text-emerald-400/90 font-medium">
                  mTLS &amp; RBAC Enforced
                </span>
              </div>
            </div>
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

        {/* ════════════════════════════════════════════════════
            RIGHT COLUMN: SIGNUP FORM PANEL
            ════════════════════════════════════════════════════ */}
        <div className="w-full lg:w-[460px] xl:w-[500px] 2xl:w-[540px] flex-1 lg:flex-initial flex-shrink-0 bg-[#060d19] flex flex-col justify-between p-4 sm:p-7 md:p-8 lg:p-7 xl:p-9 2xl:p-12 relative shadow-2xl min-h-screen lg:min-h-0 lg:h-full lg:overflow-y-auto">
          {/* Subtle background glow */}
          <div className="absolute top-1/4 right-0 w-[240px] h-[240px] bg-blue-600/[0.04] blur-[100px] pointer-events-none" />

          {/* Centered Form Wrapper */}
          <div className="w-full max-w-[420px] mx-auto my-auto relative z-10 flex flex-col py-4 sm:py-0">
            {/* Mobile Brand Header (< lg only) */}
            <div className="lg:hidden flex items-center justify-between pb-4 mb-3 border-b border-[#12233b]/80">
              <GarudaLogo size="sm" href="/login" theme="dark" />
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                Enterprise Access
              </span>
            </div>

            {/* Header Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0a1830] border border-[#1d355d] text-[10px] font-semibold text-blue-400 uppercase tracking-wider self-start mb-2.5 sm:mb-3">
              <UserPlus className="w-3.5 h-3.5" />
              ENTERPRISE ONBOARDING
            </div>

            <h2 className="text-2xl sm:text-[28px] font-bold text-white tracking-tight leading-tight">
              Create your account
            </h2>
            <p className="mt-1 text-xs sm:text-[13px] text-slate-400">
              Start monitoring your network infrastructure in under 2 minutes.
            </p>

            {/* Signup Form */}
            <form onSubmit={handleSubmit} noValidate className="mt-5 flex flex-col gap-2.5">
              {/* Full Name */}
              <div>
                <label className="block text-[11px] sm:text-xs font-medium text-slate-300 mb-1">
                  Full Name
                </label>
                <div
                  className={`min-h-[44px] flex items-center rounded-xl bg-[#091528] border overflow-hidden transition-all ${touched.fullName && fieldErrors.fullName
                    ? "border-rose-500/80 ring-2 ring-rose-500/20"
                    : "border-[#182a47] focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20"
                    }`}
                >
                  <User
                    className={`ml-3.5 w-4 h-4 shrink-0 transition-colors ${touched.fullName && fieldErrors.fullName ? "text-rose-400" : "text-slate-400"
                      }`}
                  />
                  <input
                    type="text"
                    placeholder="Aditi Sharma"
                    value={formData.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    onBlur={() => handleBlur("fullName")}
                    className="w-full bg-transparent px-3 py-2.5 text-xs sm:text-[13px] text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
                {touched.fullName && fieldErrors.fullName && (
                  <p className="mt-1 text-[11px] text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{fieldErrors.fullName}</span>
                  </p>
                )}
              </div>

              {/* Work Email */}
              <div>
                <label className="block text-[11px] sm:text-xs font-medium text-slate-300 mb-1">
                  Work Email
                </label>
                <div
                  className={`min-h-[44px] flex items-center rounded-xl bg-[#091528] border overflow-hidden transition-all ${touched.workEmail && fieldErrors.workEmail
                    ? "border-rose-500/80 ring-2 ring-rose-500/20"
                    : "border-[#182a47] focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20"
                    }`}
                >
                  <Mail
                    className={`ml-3.5 w-4 h-4 shrink-0 transition-colors ${touched.workEmail && fieldErrors.workEmail ? "text-rose-400" : "text-slate-400"
                      }`}
                  />
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={formData.workEmail}
                    onChange={(e) => handleChange("workEmail", e.target.value)}
                    onBlur={() => handleBlur("workEmail")}
                    className="w-full bg-transparent px-3 py-2.5 text-xs sm:text-[13px] text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
                {touched.workEmail && fieldErrors.workEmail && (
                  <p className="mt-1 text-[11px] text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{fieldErrors.workEmail}</span>
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] sm:text-xs font-medium text-slate-300">
                    Password
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">Min. 8 characters</span>
                </div>
                <div
                  className={`min-h-[44px] flex items-center rounded-xl bg-[#091528] border overflow-hidden transition-all ${touched.password && fieldErrors.password
                    ? "border-rose-500/80 ring-2 ring-rose-500/20"
                    : "border-[#182a47] focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20"
                    }`}
                >
                  <Lock
                    className={`ml-3.5 w-4 h-4 shrink-0 transition-colors ${touched.password && fieldErrors.password ? "text-rose-400" : "text-slate-400"
                      }`}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    onBlur={() => handleBlur("password")}
                    className="w-full bg-transparent px-3 py-2.5 text-xs sm:text-[13px] text-white placeholder-slate-500 focus:outline-none font-mono tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="mr-3 text-slate-400 hover:text-slate-200 transition-colors p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Password strength bar */}
                {formData.password && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="flex-1 h-1 bg-[#15233b] rounded-full overflow-hidden flex gap-1">
                      <div className={`h-full flex-1 ${strength.score >= 1 ? strength.color : "bg-transparent"}`} />
                      <div className={`h-full flex-1 ${strength.score >= 2 ? strength.color : "bg-transparent"}`} />
                      <div className={`h-full flex-1 ${strength.score >= 3 ? strength.color : "bg-transparent"}`} />
                      <div className={`h-full flex-1 ${strength.score >= 4 ? strength.color : "bg-transparent"}`} />
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {strength.label}
                    </span>
                  </div>
                )}

                {touched.password && fieldErrors.password && (
                  <p className="mt-1 text-[11px] text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{fieldErrors.password}</span>
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-[11px] sm:text-xs font-medium text-slate-300 mb-1">
                  Confirm Password
                </label>
                <div
                  className={`min-h-[44px] flex items-center rounded-xl bg-[#091528] border overflow-hidden transition-all ${touched.confirmPassword && fieldErrors.confirmPassword
                    ? "border-rose-500/80 ring-2 ring-rose-500/20"
                    : touched.confirmPassword && !fieldErrors.confirmPassword && formData.confirmPassword
                      ? "border-emerald-500/60 ring-2 ring-emerald-500/20"
                      : "border-[#182a47] focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20"
                    }`}
                >
                  <ShieldCheck
                    className={`ml-3.5 w-4 h-4 shrink-0 transition-colors ${touched.confirmPassword && fieldErrors.confirmPassword
                      ? "text-rose-400"
                      : touched.confirmPassword && !fieldErrors.confirmPassword && formData.confirmPassword
                        ? "text-emerald-400"
                        : "text-slate-400"
                      }`}
                  />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    onBlur={() => handleBlur("confirmPassword")}
                    className="w-full bg-transparent px-3 py-2.5 text-xs sm:text-[13px] text-white placeholder-slate-500 focus:outline-none font-mono tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="mr-3 text-slate-400 hover:text-slate-200 transition-colors p-1"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {touched.confirmPassword && fieldErrors.confirmPassword && (
                  <p className="mt-1 text-[11px] text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{fieldErrors.confirmPassword}</span>
                  </p>
                )}

                {touched.confirmPassword && !fieldErrors.confirmPassword && formData.confirmPassword && (
                  <p className="mt-1 text-[11px] text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3 shrink-0" />
                    <span>Passwords match</span>
                  </p>
                )}
              </div>

              {/* Verification Code */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] sm:text-xs font-medium text-slate-300">
                    Verification Code
                  </label>
                  {codeSent ? (
                    <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                      <Check className="w-3 h-3" /> Code sent to email
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 font-mono">Sent to your email</span>
                  )}
                </div>
                <div
                  className={`min-h-[44px] flex items-center rounded-xl bg-[#091528] border overflow-hidden transition-all ${touched.verificationCode && fieldErrors.verificationCode
                    ? "border-rose-500/80 ring-2 ring-rose-500/20"
                    : touched.verificationCode && !fieldErrors.verificationCode && formData.verificationCode
                      ? "border-emerald-500/60 ring-2 ring-emerald-500/20"
                      : "border-[#182a47] focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20"
                    }`}
                >
                  <KeyRound
                    className={`ml-3.5 w-4 h-4 shrink-0 transition-colors ${touched.verificationCode && fieldErrors.verificationCode
                      ? "text-rose-400"
                      : touched.verificationCode && !fieldErrors.verificationCode && formData.verificationCode
                        ? "text-emerald-400"
                        : "text-slate-400"
                      }`}
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    value={formData.verificationCode}
                    onChange={(e) =>
                      handleChange("verificationCode", e.target.value.replace(/\D/g, ""))
                    }
                    onBlur={() => handleBlur("verificationCode")}
                    className="w-full bg-transparent px-3 py-2.5 text-xs sm:text-[13px] text-white placeholder-slate-500 focus:outline-none font-mono tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={isSendingCode || resendTimer > 0}
                    className={`mr-2 px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${resendTimer > 0
                      ? "bg-[#101f38] text-slate-400 border border-[#1b3154] cursor-not-allowed"
                      : "bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 hover:text-blue-300 active:scale-[0.98]"
                      }`}
                  >
                    {isSendingCode ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : resendTimer > 0 ? (
                      <span>Resend ({resendTimer}s)</span>
                    ) : codeSent ? (
                      <span>Resend Code</span>
                    ) : (
                      <span>Send Code</span>
                    )}
                  </button>
                </div>

                {touched.verificationCode && fieldErrors.verificationCode && (
                  <p className="mt-1 text-[11px] text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{fieldErrors.verificationCode}</span>
                  </p>
                )}

                {touched.verificationCode && !fieldErrors.verificationCode && formData.verificationCode && (
                  <p className="mt-1 text-[11px] text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3 shrink-0" />
                    <span>Verification code verified</span>
                  </p>
                )}
              </div>

              {/* Terms Checkbox */}
              <div>
                <div className="flex items-start gap-2 mt-0.5">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={formData.agreedToTerms}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setFormData((prev) => ({ ...prev, agreedToTerms: checked }));
                      setTouched((prev) => ({ ...prev, agreedToTerms: true }));
                      setFieldErrors((prev) => ({
                        ...prev,
                        agreedToTerms: checked ? "" : "You must agree to continue",
                      }));
                    }}
                    className="mt-0.5 w-3.5 h-3.5 rounded bg-[#091528] border-[#182a47] text-blue-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <label htmlFor="terms" className="text-[11px] text-slate-400 leading-tight cursor-pointer">
                    I agree to the{" "}
                    <a href="#" className="text-blue-400 hover:underline">
                      Master Services Agreement
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-blue-400 hover:underline">
                      Privacy Policy
                    </a>.
                  </label>
                </div>
                {touched.agreedToTerms && fieldErrors.agreedToTerms && (
                  <p className="mt-1 text-[11px] text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{fieldErrors.agreedToTerms}</span>
                  </p>
                )}
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="min-h-[44px] mt-2 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-[13px] font-semibold tracking-wide shadow-lg shadow-blue-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    <span>Provisioning Workspace...</span>
                  </>
                ) : (
                  <>
                    <span>Create Enterprise Account</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-3.5 flex items-center">
              <div className="flex-grow border-t border-[#132238]" />
              <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                OR SIGN UP WITH
              </span>
              <div className="flex-grow border-t border-[#132238]" />
            </div>

            {/* Social SSO Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className="min-h-[42px] w-full py-2 px-3 rounded-xl bg-[#091528] hover:bg-[#0e1d35] border border-[#182a47] hover:border-slate-500/50 text-slate-200 text-[11px] sm:text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                className="min-h-[42px] w-full py-2 px-3 rounded-xl bg-[#091528] hover:bg-[#0e1d35] border border-[#182a47] hover:border-slate-500/50 text-slate-200 text-[11px] sm:text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <svg className="w-3.5 h-3.5 fill-current text-white shrink-0" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span>GitHub</span>
              </button>
            </div>

            {/* Back to Login link */}
            <div className="mt-4 text-center text-xs text-slate-400">
              Already have an enterprise account?{" "}
              <Link
                href="/login"
                className="font-semibold text-blue-400 hover:text-blue-300 hover:underline transition-colors"
              >
                Sign In
              </Link>
            </div>

            {/* Security note */}
            <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 text-center">
              <Shield className="w-3.5 h-3.5 shrink-0" />
              <span>Enterprise SSO and Multi-Factor Authentication ready</span>
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
              <a
                href="#"
                className="hover:text-slate-300 transition-colors flex items-center gap-1.5"
              >
                <Globe className="w-3.5 h-3.5" />
                AP-SOUTH-1
              </a>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
