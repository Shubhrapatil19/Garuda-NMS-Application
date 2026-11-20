"use client";

import React, { useState } from "react";
import { X, UserPlus, Check, ArrowRight, Loader2 } from "lucide-react";

export interface OAuthAccount {
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface OAuthSignInModalProps {
  isOpen: boolean;
  provider: "GOOGLE" | "GITHUB" | null;
  organizationName: string;
  onClose: () => void;
  onSelectAccount: (account: { name: string; email: string }) => Promise<void>;
}

export const OAuthSignInModal: React.FC<OAuthSignInModalProps> = ({
  isOpen,
  provider,
  organizationName,
  onClose,
  onSelectAccount,
}) => {
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

  if (!isOpen || !provider) return null;

  const isGoogle = provider === "GOOGLE";

  // Pre-configured detected enterprise accounts (Jayesh Nikumbh as default)
  const defaultAccounts: OAuthAccount[] = isGoogle
    ? [
        {
          name: "Jayesh Nikumbh",
          email: "jnikumbh69@gmail.com",
        },
      ]
    : [
        {
          name: "Jayesh Nikumbh",
          email: "jnikumbh69@gmail.com",
        },
      ];

  const handleAccountClick = async (account: OAuthAccount) => {
    setSelectedEmail(account.email);
    setIsSubmitting(true);
    try {
      await onSelectAccount({
        name: account.name,
        email: account.email,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) return;

    const name = customName.trim() || customEmail.split("@")[0];
    setSelectedEmail(customEmail.trim());
    setIsSubmitting(true);
    try {
      await onSelectAccount({
        name,
        email: customEmail.trim(),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-[440px] rounded-2xl bg-[#0b1728] border border-[#1d3558] shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-[#162744]">
          <div className="flex items-center gap-3">
            {isGoogle ? (
              <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-md p-1.5 shrink-0">
                <svg className="w-full h-full" viewBox="0 0 24 24">
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
              </div>
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#161b22] border border-slate-700 flex items-center justify-center shadow-md p-2 shrink-0">
                <svg className="w-full h-full fill-white" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
              </div>
            )}
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {isGoogle ? "Sign in with Google" : "Sign in with GitHub"}
              </h3>
              <p className="text-xs text-slate-400">
                to continue to <span className="text-slate-200 font-medium">{organizationName}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <div className="mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Choose an account
            </span>
          </div>

          {/* Account List */}
          <div className="space-y-2">
            {defaultAccounts.map((acc) => {
              const initials = acc.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();
              const isChosen = selectedEmail === acc.email;

              return (
                <button
                  key={acc.email}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleAccountClick(acc)}
                  className={`w-full p-3.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                    isChosen
                      ? "bg-blue-600/15 border-blue-500 ring-2 ring-blue-500/20"
                      : "bg-[#0f1f35] hover:bg-[#142844] border-[#1c3355] text-slate-200"
                  } disabled:opacity-70 disabled:cursor-not-allowed`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-md">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white truncate">
                        {acc.name}
                      </div>
                      <div className="text-xs text-slate-400 truncate">
                        {acc.email}
                      </div>
                    </div>
                  </div>

                  {isSubmitting && isChosen ? (
                    <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  )}
                </button>
              );
            })}

            {/* "Use another account" toggle */}
            {!showCustomForm ? (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowCustomForm(true)}
                className="w-full p-3 rounded-xl border border-dashed border-[#1e3455] hover:border-slate-500 text-slate-300 hover:text-white hover:bg-[#0f1f35]/50 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-cyan-400" />
                <span>Use another {isGoogle ? "Google" : "GitHub"} account</span>
              </button>
            ) : (
              <form onSubmit={handleCustomSubmit} className="pt-2 space-y-3">
                <div className="p-3.5 rounded-xl bg-[#091528] border border-[#1c3355] space-y-2.5">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="e.g. Jayesh Nikumbh"
                      className="w-full bg-[#0b1728] border border-[#1a2f4d] rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">
                      {isGoogle ? "Google Email" : "GitHub Email / Username"}
                    </label>
                    <input
                      type="email"
                      required
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      placeholder="e.g. user@gmail.com"
                      className="w-full bg-[#0b1728] border border-[#1a2f4d] rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={isSubmitting || !customEmail.trim()}
                      className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Signing in...</span>
                        </>
                      ) : (
                        <span>Continue with this account</span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCustomForm(false)}
                      className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Privacy & Permissions notice */}
          <p className="mt-5 text-[11px] text-slate-400 leading-relaxed text-center">
            To continue, {isGoogle ? "Google" : "GitHub"} will share your name, email address, language preference, and profile picture with Garuda NMS.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OAuthSignInModal;
