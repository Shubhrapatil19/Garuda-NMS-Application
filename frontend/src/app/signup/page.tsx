"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
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
import { useSignupForm } from "./useSignupForm";

const getFieldBorderClass = (isError?: boolean, isSuccess?: boolean): string => {
  if (isError) return "border-rose-500/80 ring-2 ring-rose-500/20";
  if (isSuccess) return "border-emerald-500/60 ring-2 ring-emerald-500/20";
  return "border-[#182a47] focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20";
};

const getFieldIconClass = (isError?: boolean, isSuccess?: boolean): string => {
  if (isError) return "text-rose-400";
  if (isSuccess) return "text-emerald-400";
  return "text-slate-400";
};

const renderSendCodeButtonContent = (
  isSending: boolean,
  resendSec: number,
  isSent: boolean
) => {
  if (isSending) {
    return (
      <>
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span>Sending...</span>
      </>
    );
  }
  if (resendSec > 0) {
    return <span>Resend ({resendSec}s)</span>;
  }
  if (isSent) {
    return <span>Resend Code</span>;
  }
  return <span>Send Code</span>;
};

function SignupHero() {
  const cardsContainerRef = useRef<HTMLDivElement>(null);

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
        stagger: 0.22,
        ease: "power3.out",
        delay: 0.35,
      }
    );
  }, []);

  return (
    <div className="hidden lg:flex flex-1 flex-col justify-between p-7 xl:p-10 2xl:p-12 lg:h-full lg:overflow-hidden border-r border-[#12233b]/80 bg-[#081426]">
      <header className="animate-hero-header shrink-0 flex flex-row items-center justify-between gap-4">
        <GarudaLogo href="/login" theme="dark" />
      </header>

      <div className="flex-1 min-h-0 flex flex-col justify-center my-4 xl:my-6 w-full">
        <div className="shrink-0 mb-4 xl:mb-6">
          <div className="animate-hero-tagline flex items-center gap-2.5 text-[11px] font-bold tracking-[0.2em] text-blue-500 uppercase mb-3">
            <span className="animate-hero-line inline-block h-0.5 bg-blue-500" />
            <span>ENTERPRISE NETWORK OBSERVABILITY</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-[40px] xl:text-[46px] 2xl:text-[50px] font-extrabold text-white tracking-tight leading-[1.12]">
            <div className="overflow-hidden">
              <span className="inline-block animate-hero-title-1">Instant Multi-OEM</span>
            </div>
            <div className="overflow-hidden">
              <span className="inline-block animate-hero-title-2">
                Telemetry <span className="text-blue-500">&amp;</span> Control
              </span>
            </div>
          </h1>

          <p className="animate-hero-desc mt-3 text-[14px] sm:text-[15px] xl:text-[16px] leading-relaxed text-slate-400 max-w-120">
            Onboard Cisco, Juniper, Arista, and Fortinet estates into high-performance telemetry pipelines with automatic topology auto-discovery.
          </p>
        </div>

        <div ref={cardsContainerRef} className="grid grid-cols-1 md:grid-cols-3 gap-3.5 my-2">
          <div className="p-4 rounded-2xl bg-[#09172c] border border-[#162a49] shadow-lg flex flex-col justify-between">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mb-3">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">SNMP &amp; gNMI</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                64-bit HC counter ingestion at 1-second telemetry frequencies.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#09172c] border border-[#162a49] shadow-lg flex flex-col justify-between">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-3">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Role Gates</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                SOC 2 Type II compliant RBAC, audit trails, and multi-tenant isolation.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#09172c] border border-[#162a49] shadow-lg flex flex-col justify-between">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center mb-3">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Edge Pollers</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Zero-overhead distributed polling across Bangalore, Delhi, and Mumbai nodes.
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="animate-hero-footer shrink-0 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[10px] sm:text-[11px]">
        <span className="font-semibold tracking-[0.18em] text-slate-500 uppercase">
          TRUSTED FOR MISSION-CRITICAL OPERATIONS
        </span>
        <div className="flex items-center gap-4 sm:gap-6 text-slate-500 font-bold tracking-widest text-[11px]">
          <span>CISCO</span>
          <span>FORTINET</span>
          <span>JUNIPER</span>
          <span>ARISTA</span>
        </div>
      </footer>
    </div>
  );
}

function PasswordStrengthIndicator({
  strength,
}: Readonly<{
  strength: { score: number; label: string; color: string };
}>) {
  return (
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
  );
}

function SignupSocialButtons() {
  return (
    <>
      <div className="relative my-3.5 flex items-center">
        <div className="grow border-t border-[#132238]" />
        <span className="shrink mx-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          OR SIGN UP WITH
        </span>
        <div className="grow border-t border-[#132238]" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          className="min-h-10.5 w-full py-2 px-3 rounded-xl bg-[#091528] hover:bg-[#0e1d35] border border-[#182a47] hover:border-slate-500/50 text-slate-200 text-[11px] sm:text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
        >
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" role="img" aria-hidden="true">
            <title>Google icon</title>
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Google</span>
        </button>

        <button
          type="button"
          className="min-h-10.5 w-full py-2 px-3 rounded-xl bg-[#091528] hover:bg-[#0e1d35] border border-[#182a47] hover:border-slate-500/50 text-slate-200 text-[11px] sm:text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
        >
          <svg className="w-3.5 h-3.5 fill-current text-white shrink-0" viewBox="0 0 24 24" role="img" aria-hidden="true">
            <title>GitHub icon</title>
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
          <span>GitHub</span>
        </button>
      </div>
    </>
  );
}

function SignupNameAndEmailFields({
  form,
}: Readonly<{
  form: ReturnType<typeof useSignupForm>;
}>) {
  const { formData, touched, fieldErrors, handleFieldChange, handleFieldBlur } = form;

  return (
    <>
      <div>
        <label htmlFor="signup-fullname" className="block text-[11px] sm:text-xs font-medium text-slate-300 mb-1">
          Full Name
        </label>
        <div
          className={`min-h-11 flex items-center rounded-xl bg-[#091528] border overflow-hidden transition-all ${getFieldBorderClass(
            Boolean(touched.fullName && fieldErrors.fullName)
          )}`}
        >
          <User
            className={`ml-3.5 w-4 h-4 shrink-0 transition-colors ${getFieldIconClass(
              Boolean(touched.fullName && fieldErrors.fullName)
            )}`}
          />
          <input
            id="signup-fullname"
            type="text"
            placeholder="Aditi Sharma"
            value={formData.fullName}
            onChange={(e) => handleFieldChange("fullName", e.target.value)}
            onBlur={() => handleFieldBlur("fullName")}
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

      <div>
        <label htmlFor="signup-email" className="block text-[11px] sm:text-xs font-medium text-slate-300 mb-1">
          Work Email
        </label>
        <div
          className={`min-h-11 flex items-center rounded-xl bg-[#091528] border overflow-hidden transition-all ${getFieldBorderClass(
            Boolean(touched.workEmail && fieldErrors.workEmail)
          )}`}
        >
          <Mail
            className={`ml-3.5 w-4 h-4 shrink-0 transition-colors ${getFieldIconClass(
              Boolean(touched.workEmail && fieldErrors.workEmail)
            )}`}
          />
          <input
            id="signup-email"
            type="email"
            placeholder="name@company.com"
            value={formData.workEmail}
            onChange={(e) => handleFieldChange("workEmail", e.target.value)}
            onBlur={() => handleFieldBlur("workEmail")}
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
    </>
  );
}

function SignupPasswordFields({
  form,
}: Readonly<{
  form: ReturnType<typeof useSignupForm>;
}>) {
  const {
    formData,
    touched,
    fieldErrors,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    strength,
    handleFieldChange,
    handleFieldBlur,
  } = form;

  const isConfirmPasswordMatch = Boolean(
    touched.confirmPassword &&
      !fieldErrors.confirmPassword &&
      formData.confirmPassword
  );

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="signup-password" className="block text-[11px] sm:text-xs font-medium text-slate-300">
            Password
          </label>
          <span className="text-[10px] text-slate-500 font-mono">Min. 8 characters</span>
        </div>
        <div
          className={`min-h-11 flex items-center rounded-xl bg-[#091528] border overflow-hidden transition-all ${getFieldBorderClass(
            Boolean(touched.password && fieldErrors.password)
          )}`}
        >
          <Lock
            className={`ml-3.5 w-4 h-4 shrink-0 transition-colors ${getFieldIconClass(
              Boolean(touched.password && fieldErrors.password)
            )}`}
          />
          <input
            id="signup-password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a strong password"
            value={formData.password}
            onChange={(e) => handleFieldChange("password", e.target.value)}
            onBlur={() => handleFieldBlur("password")}
            className="w-full bg-transparent px-3 py-2.5 text-xs sm:text-[13px] text-white placeholder-slate-500 focus:outline-none font-mono tracking-wider"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="mr-3 text-slate-400 hover:text-slate-200 transition-colors p-1"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {formData.password && (
          <PasswordStrengthIndicator strength={strength} />
        )}

        {touched.password && fieldErrors.password && (
          <p className="mt-1 text-[11px] text-rose-400 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 shrink-0" />
            <span>{fieldErrors.password}</span>
          </p>
        )}
      </div>

      <div>
        <label htmlFor="signup-confirm-password" className="block text-[11px] sm:text-xs font-medium text-slate-300 mb-1">
          Confirm Password
        </label>
        <div
          className={`min-h-11 flex items-center rounded-xl bg-[#091528] border overflow-hidden transition-all ${getFieldBorderClass(
            Boolean(touched.confirmPassword && fieldErrors.confirmPassword),
            isConfirmPasswordMatch
          )}`}
        >
          <ShieldCheck
            className={`ml-3.5 w-4 h-4 shrink-0 transition-colors ${getFieldIconClass(
              Boolean(touched.confirmPassword && fieldErrors.confirmPassword),
              isConfirmPasswordMatch
            )}`}
          />
          <input
            id="signup-confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Re-enter your password"
            value={formData.confirmPassword}
            onChange={(e) => handleFieldChange("confirmPassword", e.target.value)}
            onBlur={() => handleFieldBlur("confirmPassword")}
            className="w-full bg-transparent px-3 py-2.5 text-xs sm:text-[13px] text-white placeholder-slate-500 focus:outline-none font-mono tracking-wider"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="mr-3 text-slate-400 hover:text-slate-200 transition-colors p-1"
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {touched.confirmPassword && fieldErrors.confirmPassword && (
          <p className="mt-1 text-[11px] text-rose-400 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 shrink-0" />
            <span>{fieldErrors.confirmPassword}</span>
          </p>
        )}

        {isConfirmPasswordMatch && (
          <p className="mt-1 text-[11px] text-emerald-400 flex items-center gap-1">
            <Check className="w-3 h-3 shrink-0" />
            <span>Passwords match</span>
          </p>
        )}
      </div>
    </>
  );
}

function SignupVerificationCodeField({
  form,
}: Readonly<{
  form: ReturnType<typeof useSignupForm>;
}>) {
  const {
    formData,
    touched,
    fieldErrors,
    isSendingCode,
    codeSent,
    resendTimer,
    handleFieldChange,
    handleFieldBlur,
    handleSendCode,
  } = form;

  const isVerificationCodeValid = Boolean(
    touched.verificationCode &&
      !fieldErrors.verificationCode &&
      formData.verificationCode
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label htmlFor="signup-verification-code" className="block text-[11px] sm:text-xs font-medium text-slate-300">
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
        className={`min-h-11 flex items-center rounded-xl bg-[#091528] border overflow-hidden transition-all ${getFieldBorderClass(
          Boolean(touched.verificationCode && fieldErrors.verificationCode),
          isVerificationCodeValid
        )}`}
      >
        <KeyRound
          className={`ml-3.5 w-4 h-4 shrink-0 transition-colors ${getFieldIconClass(
            Boolean(touched.verificationCode && fieldErrors.verificationCode),
            isVerificationCodeValid
          )}`}
        />
        <input
          id="signup-verification-code"
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="Enter 6-digit code"
          value={formData.verificationCode}
          onChange={(e) =>
            handleFieldChange("verificationCode", e.target.value.replace(/\D/g, ""))
          }
          onBlur={() => handleFieldBlur("verificationCode")}
          className="w-full bg-transparent px-3 py-2.5 text-xs sm:text-[13px] text-white placeholder-slate-500 focus:outline-none font-mono tracking-widest"
        />
        <button
          type="button"
          onClick={handleSendCode}
          disabled={isSendingCode || resendTimer > 0}
          className={`mr-2 px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
            resendTimer > 0
              ? "bg-[#101f38] text-slate-400 border border-[#1b3154] cursor-not-allowed"
              : "bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 hover:text-blue-300 active:scale-[0.98]"
          }`}
        >
          {renderSendCodeButtonContent(isSendingCode, resendTimer, codeSent)}
        </button>
      </div>

      {touched.verificationCode && fieldErrors.verificationCode && (
        <p className="mt-1 text-[11px] text-rose-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{fieldErrors.verificationCode}</span>
        </p>
      )}

      {isVerificationCodeValid && (
        <p className="mt-1 text-[11px] text-emerald-400 flex items-center gap-1">
          <Check className="w-3 h-3 shrink-0" />
          <span>Verification code verified</span>
        </p>
      )}
    </div>
  );
}

function SignupTermsAndSubmit({
  form,
}: Readonly<{
  form: ReturnType<typeof useSignupForm>;
}>) {
  const { formData, touched, fieldErrors, isSubmitting, errorMsg, handleFieldChange, handleFieldBlur } = form;

  return (
    <>
      <div>
        <div className="flex items-start gap-2 mt-0.5">
          <input
            type="checkbox"
            id="terms"
            checked={formData.agreedToTerms}
            onChange={(e) => {
              const checked = e.target.checked;
              handleFieldChange("agreedToTerms", checked);
              handleFieldBlur("agreedToTerms");
            }}
            className="mt-0.5 w-3.5 h-3.5 rounded bg-[#091528] border-[#182a47] text-blue-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
          />
          <label htmlFor="terms" className="text-[11px] text-slate-400 leading-tight cursor-pointer">
            I agree to the{" "}
            <Link href="/terms" className="text-blue-400 hover:underline">
              Master Services Agreement
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-blue-400 hover:underline">
              Privacy Policy
            </Link>.
          </label>
        </div>
        {touched.agreedToTerms && fieldErrors.agreedToTerms && (
          <p className="mt-1 text-[11px] text-rose-400 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 shrink-0" />
            <span>{fieldErrors.agreedToTerms}</span>
          </p>
        )}
      </div>

      {errorMsg && (
        <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="min-h-11 mt-2 w-full py-2.5 px-4 rounded-xl bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-[13px] font-semibold tracking-wide shadow-lg shadow-blue-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70"
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
    </>
  );
}

function SignupForm({
  form,
}: Readonly<{
  form: ReturnType<typeof useSignupForm>;
}>) {
  return (
    <form onSubmit={form.handleSubmit} noValidate className="mt-5 flex flex-col gap-2.5">
      <SignupNameAndEmailFields form={form} />
      <SignupPasswordFields form={form} />
      <SignupVerificationCodeField form={form} />
      <SignupTermsAndSubmit form={form} />
    </form>
  );
}

export default function SignupPage() {
  const form = useSignupForm();

  return (
    <div className="relative w-full min-h-screen bg-[#040811] text-slate-100 flex flex-col justify-between overflow-x-hidden select-none font-sans">
      <div className="fixed top-10 left-[15%] w-125 h-125 rounded-full bg-blue-600/8 blur-[140px] pointer-events-none" />
      <div className="fixed bottom-10 left-[35%] w-112.5 h-112.5 rounded-full bg-cyan-500/5 blur-[150px] pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row h-full min-h-screen lg:min-h-0">
        <SignupHero />

        <div className="w-full lg:w-115 xl:w-125 2xl:w-135 flex-1 lg:flex-initial shrink-0 bg-[#060d19] flex flex-col justify-between p-4 sm:p-7 md:p-8 lg:p-7 xl:p-9 2xl:p-12 relative shadow-2xl min-h-screen lg:min-h-0 lg:h-full lg:overflow-y-auto">
          <div className="absolute top-1/4 right-0 w-60 h-60 bg-blue-600/4 blur-[100px] pointer-events-none" />

          <div className="w-full max-w-105 mx-auto my-auto relative z-10 flex flex-col py-4 sm:py-0">
            <div className="lg:hidden flex items-center justify-between pb-4 mb-3 border-b border-[#12233b]/80">
              <GarudaLogo size="sm" href="/login" theme="dark" />
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                <span>Enterprise Access</span>
              </span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0a1830] border border-[#1d355d] text-[10px] font-semibold text-blue-400 uppercase tracking-wider self-start mb-2.5 sm:mb-3">
              <UserPlus className="w-3.5 h-3.5" />
              <span>ENTERPRISE ONBOARDING</span>
            </div>

            <h2 className="text-2xl sm:text-[28px] font-bold text-white tracking-tight leading-tight">
              Create your account
            </h2>
            <p className="mt-1 text-xs sm:text-[13px] text-slate-400">
              Start monitoring your network infrastructure in under 2 minutes.
            </p>

            <SignupForm form={form} />

            <SignupSocialButtons />

            <div className="mt-4 text-center text-xs text-slate-400">
              Already have an enterprise account?{" "}
              <Link
                href="/login"
                className="font-semibold text-blue-400 hover:text-blue-300 hover:underline transition-colors"
              >
                Sign In
              </Link>
            </div>

            <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 text-center">
              <Shield className="w-3.5 h-3.5 shrink-0" />
              <span>Enterprise SSO and Multi-Factor Authentication ready</span>
            </div>

            <div className="lg:hidden mt-6 pt-5 border-t border-[#12233b]/70 text-center">
              <span className="text-[10px] font-semibold tracking-[0.16em] text-slate-500 uppercase block mb-2.5">
                TRUSTED FOR MISSION-CRITICAL OPERATIONS
              </span>
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-slate-500 font-bold tracking-widest text-[11px]">
                <span>CISCO</span>
                <span>FORTINET</span>
                <span>JUNIPER</span>
                <span>ARISTA</span>
              </div>
            </div>
          </div>

          <footer className="shrink-0 pt-6 lg:pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2.5 text-center sm:text-left">
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
    </div>
  );
}
