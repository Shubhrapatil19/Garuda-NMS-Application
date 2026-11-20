"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle, Loader2 } from "lucide-react";

export interface AlertRuleBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (ruleData: AlertRuleData) => void;
}

export interface AlertRuleData {
  ruleName: string;
  monitoredMetric: string;
  conditionRule: string;
  escalationThreshold: string;
  actionAutomation: string;
}

export const AlertRuleBuilderModal: React.FC<AlertRuleBuilderModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [ruleName, setRuleName] = useState("Core Router High CPU Escalation");
  const [monitoredMetric, setMonitoredMetric] = useState("cpu_usage");
  const [conditionRule, setConditionRule] = useState("Greater than or equal to 80% for 2 consecutive");
  const [escalationThreshold, setEscalationThreshold] = useState(
    "If condition persists for > 5 minutes without acknowledgment → Escalates to Alarm"
  );
  const [actionAutomation, setActionAutomation] = useState(
    "If Alarm severity is CRITICAL and unacknowledged for > 15 minutes → Auto-creates ITSM Ticket (Jira/ServiceNow)"
  );
  const [isSaving, setIsSaving] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSaving) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSaving, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      onSave?.({
        ruleName,
        monitoredMetric,
        conditionRule,
        escalationThreshold,
        actionAutomation,
      });
      onClose();
    }, 400);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="rule-builder-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in duration-200"
    >
      {/* Dark backdrop blur */}
      <div
        onClick={() => !isSaving && onClose()}
        className="fixed inset-0 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs transition-opacity cursor-pointer"
      />

      {/* Modal Dialog Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#081426] border border-slate-200/90 dark:border-[#1a2e4d] shadow-2xl p-5 sm:p-7 text-slate-800 dark:text-slate-200 z-10 animate-in zoom-in-95 duration-200"
      >
        {/* Top Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSaving}
          aria-label="Close dialog"
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="pr-8">
          <h2
            id="rule-builder-title"
            className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight"
          >
            Alert Engine Rule Builder
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Configure multi-stage alert generation, threshold escalations, and automated ticket dispatches
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* ─── RULE NAME ─── */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Rule Name
            </label>
            <input
              type="text"
              required
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              placeholder="e.g. Core Router High CPU Escalation"
              className="w-full rounded-xl bg-slate-50/80 dark:bg-[#060b13] border border-slate-200/90 dark:border-[#1a283c] px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white font-medium outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-[#081220] transition-all"
            />
          </div>

          {/* ─── 1 Trigger Condition (Alert Generation) ─── */}
          <div className="rounded-2xl bg-[#f0f6ff] dark:bg-[#0c1a30] border border-[#d6e4ff] dark:border-[#1c3761] p-4 sm:p-4.5">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-bold shrink-0 shadow-xs">
                1
              </span>
              <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                Trigger Condition (Alert Generation)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Monitored Metric
                </label>
                <input
                  type="text"
                  required
                  value={monitoredMetric}
                  onChange={(e) => setMonitoredMetric(e.target.value)}
                  placeholder="cpu_usage"
                  className="w-full rounded-xl bg-white dark:bg-[#081220] border border-slate-200 dark:border-[#1e3456] px-3.5 py-2 text-xs sm:text-sm font-mono text-slate-900 dark:text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Condition Rule
                </label>
                <input
                  type="text"
                  required
                  value={conditionRule}
                  onChange={(e) => setConditionRule(e.target.value)}
                  placeholder="Greater than or equal to 80% for 2 consecutive"
                  className="w-full rounded-xl bg-white dark:bg-[#081220] border border-slate-200 dark:border-[#1e3456] px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* ─── 2 Escalation Threshold (Alarm Generation) ─── */}
          <div className="rounded-2xl bg-[#fffbeb] dark:bg-[#201808] border border-[#fef08a] dark:border-[#42310a] p-4 sm:p-4.5">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[11px] font-bold shrink-0 shadow-xs">
                2
              </span>
              <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                Escalation Threshold (Alarm Generation)
              </h3>
            </div>

            <textarea
              rows={2}
              value={escalationThreshold}
              onChange={(e) => setEscalationThreshold(e.target.value)}
              className="w-full rounded-xl bg-white dark:bg-[#0a0f1d] border border-slate-200 dark:border-[#2f240e] p-3 text-xs sm:text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-amber-500 resize-y min-h-[58px]"
            />
          </div>

          {/* ─── 3 Action Automation (Ticket Generation) ─── */}
          <div className="rounded-2xl bg-[#f5f3ff] dark:bg-[#19142e] border border-[#ddd6fe] dark:border-[#32235e] p-4 sm:p-4.5">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[11px] font-bold shrink-0 shadow-xs">
                3
              </span>
              <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                Action Automation (Ticket Generation)
              </h3>
            </div>

            <textarea
              rows={2}
              value={actionAutomation}
              onChange={(e) => setActionAutomation(e.target.value)}
              className="w-full rounded-xl bg-white dark:bg-[#0a0f1d] border border-slate-200 dark:border-[#2e2154] p-3 text-xs sm:text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500 resize-y min-h-[58px]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0b1626] hover:bg-slate-50 dark:hover:bg-[#102036] text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-500/25 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-75"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Save &amp; Activate Rule</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AlertRuleBuilderModal;
