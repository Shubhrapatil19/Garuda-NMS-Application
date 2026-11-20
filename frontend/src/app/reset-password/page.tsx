"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import GarudaLogo from "@/components/GarudaLogo";
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Check,
  AlertCircle,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import { authService } from "@/services/authService";
import { toast } from "sonner";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

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

  const strength = getPasswordStrength(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!token.trim()) {
      const msg = "Reset token is missing or invalid. Please check your reset link.";
      setErrorMsg(msg);
      toast.error("Invalid Link", { description: msg });
      return;
    }

    if (!newPassword) {
      const msg = "Please enter your new password.";
      setErrorMsg(msg);
      toast.error("Validation Error", { description: msg });
      return;
    }

    if (newPassword.length < 8) {
      const msg = "Password must be at least 8 characters.";
      setErrorMsg(msg);
      toast.error("Validation Error", { description: msg });
      return;
    }

    if (newPassword !== confirmPassword) {
      const msg = "Passwords do not match.";
      setErrorMsg(msg);
      toast.error("Validation Error", { description: msg });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await authService.resetPassword({
        token: token.trim(),
        newPassword,
        confirmPassword,
      });

      setIsSuccess(true);
      toast.success("Password Reset Successfully", {
        description: res.message || "Your new password is now active. Redirecting to login...",
      });

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to reset password. The link may have expired.";
      setErrorMsg(msg);
      toast.error("Reset Failed", { description: msg });
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="w-full max-w-md mx-auto p-6 rounded-2xl bg-[#091528] border border-[#1b3152] shadow-2xl text-center">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Invalid Reset Link</h2>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          No security token was found in your URL. Please click the reset link directly from your email or request a new one.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
        >
          Return to Sign In
        </Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="w-full max-w-md mx-auto p-6 rounded-2xl bg-[#091528] border border-emerald-500/30 shadow-2xl text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Password Reset Successful</h2>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          Your new password has been confirmed and activated. Redirecting you to sign in...
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
        >
          Go to Sign In
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 rounded-2xl bg-[#091528] border border-[#1b3152] shadow-2xl relative">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0a1830] border border-[#1d355d] text-[10px] font-semibold text-blue-400 uppercase tracking-wider self-start mb-4">
        <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
        SECURITY CREDENTIALS
      </div>

      <h2 className="text-2xl font-bold text-white tracking-tight leading-tight">
        Reset your password
      </h2>
      <p className="mt-1 text-xs text-slate-400">
        Enter your new password below to regain access to Garuda NMS.
      </p>

      {errorMsg && (
        <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        {/* New Password */}
        <div>
          <label className="block text-[11px] font-medium text-slate-300 mb-1.5">
            New Password
          </label>
          <div className="flex items-center rounded-xl bg-[#071120] border border-[#182a47] min-h-[44px] overflow-hidden transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
            <Lock className="ml-3.5 w-4 h-4 text-slate-400 shrink-0" />
            <input
              required
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="flex-1 bg-transparent py-2.5 px-3 text-sm text-slate-100 placeholder-slate-500 outline-none min-w-0"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="pr-3.5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Password strength meter */}
          {newPassword && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden flex gap-1">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-full flex-1 rounded-full transition-all ${
                      step <= strength.score ? strength.color : "bg-transparent"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                {strength.label}
              </span>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-[11px] font-medium text-slate-300 mb-1.5">
            Confirm New Password
          </label>
          <div
            className={`flex items-center rounded-xl bg-[#071120] border min-h-[44px] overflow-hidden transition-all ${
              confirmPassword
                ? confirmPassword === newPassword
                  ? "border-emerald-500/50 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20"
                  : "border-rose-500/50 focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20"
                : "border-[#182a47] focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20"
            }`}
          >
            <KeyRound className="ml-3.5 w-4 h-4 text-slate-400 shrink-0" />
            <input
              required
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="flex-1 bg-transparent py-2.5 px-3 text-sm text-slate-100 placeholder-slate-500 outline-none min-w-0"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="pr-3.5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Confirm Password Match Indicator */}
          {confirmPassword && (
            <div className="mt-1.5">
              {confirmPassword === newPassword ? (
                <p className="text-[11px] text-emerald-400 flex items-center gap-1.5 font-medium">
                  <Check className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                  <span>Passwords match</span>
                </p>
              ) : (
                <p className="text-[11px] text-rose-400 flex items-center gap-1.5 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                  <span>Passwords do not match</span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin w-4 h-4 text-white" />
              <span>Updating password...</span>
            </>
          ) : (
            <>
              <span>Save New Password</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-5 text-center">
        <Link
          href="/login"
          className="text-xs text-slate-400 hover:text-cyan-400 transition-colors"
        >
          Remember your password? Sign in
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen w-full bg-[#071120] text-slate-300 font-sans antialiased flex flex-col justify-between p-6 relative overflow-hidden">
      {/* Ambient background glows matching login */}
      <div className="fixed top-10 left-[15%] w-96 h-96 rounded-full bg-blue-600/[0.08] blur-[140px] pointer-events-none" />
      <div className="fixed bottom-10 right-[20%] w-96 h-96 rounded-full bg-cyan-500/[0.05] blur-[150px] pointer-events-none" />

      <header className="relative z-10 flex items-center justify-between max-w-5xl w-full mx-auto">
        <GarudaLogo theme="dark" />
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#0a1830] hover:bg-[#0f2244] border border-[#1b3152] hover:border-blue-500/40 text-slate-300 hover:text-white text-xs font-medium transition-all shadow-sm group"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400 group-hover:-translate-x-0.5 transition-all" />
          <span>Back to Sign In</span>
        </Link>
      </header>

      <main className="relative z-10 my-auto py-8">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </main>

      <footer className="relative z-10 text-center text-[11px] text-slate-500">
        © 2026 Garuda NMS. Carrier-grade network operations.
      </footer>
    </div>
  );
}
