"use client";

import Link from "next/link";
import { ArrowLeft, Home, ShieldAlert } from "lucide-react";
import GarudaLogo from "@/components/GarudaLogo";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#f3f6fb] dark:bg-[#060b13] px-4 select-none">
      <div className="max-w-md w-full bg-white dark:bg-[#091528] rounded-2xl border border-slate-200 dark:border-[#182a47] p-8 shadow-xl text-center">
        <div className="flex justify-center mb-6">
          <GarudaLogo />
        </div>

        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
          404 — Route Not Found
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          The page or endpoint you requested does not exist, has been restricted, or is no longer available on this cluster.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-all shadow-md shadow-blue-600/20"
          >
            <Home className="w-4 h-4" />
            <span>Go to Dashboard</span>
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-slate-100 dark:bg-[#0d1e38] hover:bg-slate-200 dark:hover:bg-[#132c52] text-slate-700 dark:text-slate-200 font-medium text-sm transition-all border border-slate-200 dark:border-[#182a47]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
