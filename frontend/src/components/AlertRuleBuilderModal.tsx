"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, CheckCircle, Loader2, BellRing } from "lucide-react";
import { toast } from "sonner";
import { alertService, CreateAlertRulePayload } from "@/services/alertService";

export interface AlertRuleBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (ruleData: AlertRuleData) => void;
}

export interface AlertRuleData {
  ruleName: string;
  metric: string;
  monitoredMetric?: string;
  triggerCondition: string;
  conditionRule?: string;
  escalationThreshold: string;
  actionAutomation: string;
}

export const AlertRuleBuilderModal: React.FC<Readonly<AlertRuleBuilderModalProps>> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(isOpen);

  // Inputs initialize empty with helpful placeholders so the user never needs to erase them
  const [ruleName, setRuleName] = useState("");
  const [monitoredMetric, setMonitoredMetric] = useState("");
  const [conditionRule, setConditionRule] = useState("");
  const [escalationThreshold, setEscalationThreshold] = useState("");
  const [actionAutomation, setActionAutomation] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Staged enter & exit animation lifecycle
  useEffect(() => {
    let renderTimer: NodeJS.Timeout;
    let visibleTimer: NodeJS.Timeout;

    if (isOpen) {
      renderTimer = setTimeout(() => {
        setIsRendered(true);
        visibleTimer = setTimeout(() => {
          setIsVisible(true);
        }, 30);
      }, 0);
    } else {
      visibleTimer = setTimeout(() => {
        setIsVisible(false);
      }, 0);
      renderTimer = setTimeout(() => {
        setIsRendered(false);
      }, 280);
    }

    return () => {
      clearTimeout(renderTimer);
      clearTimeout(visibleTimer);
    };
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 280);
  }, [onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSaving) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSaving, handleClose]);

  if (typeof document === "undefined" || !isRendered) return null;

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    const finalRuleName = ruleName.trim();
    const finalMetric = monitoredMetric.trim();
    const finalTriggerCondition = conditionRule.trim();
    const finalEscalationThreshold = escalationThreshold.trim();
    const finalActionAutomation = actionAutomation.trim();

    if (!finalRuleName) {
      toast.error("Validation Error", { description: "Please enter a Rule Name." });
      return;
    }
    if (!finalMetric) {
      toast.error("Validation Error", { description: "Please enter a Monitored Metric." });
      return;
    }
    if (!finalTriggerCondition) {
      toast.error("Validation Error", { description: "Please enter a Condition Rule." });
      return;
    }
    if (!finalEscalationThreshold) {
      toast.error("Validation Error", { description: "Please enter an Escalation Threshold." });
      return;
    }
    if (!finalActionAutomation) {
      toast.error("Validation Error", { description: "Please enter an Action Automation." });
      return;
    }

    const payload: CreateAlertRulePayload = {
      ruleName: finalRuleName,
      metric: finalMetric,
      triggerCondition: finalTriggerCondition,
      escalationThreshold: finalEscalationThreshold,
      actionAutomation: finalActionAutomation,
    };

    setIsSaving(true);
    try {
      const response = await alertService.createRule(payload);

      toast.success("Rule Created & Activated", {
        description:
          response?.message ||
          `${payload.ruleName} has been configured and activated successfully.`,
      });

      onSave?.({
        ruleName: payload.ruleName,
        metric: payload.metric,
        monitoredMetric: payload.metric,
        triggerCondition: payload.triggerCondition,
        conditionRule: payload.triggerCondition,
        escalationThreshold: payload.escalationThreshold,
        actionAutomation: payload.actionAutomation,
      });

      // Clear form inputs for subsequent opens
      setRuleName("");
      setMonitoredMetric("");
      setConditionRule("");
      setEscalationThreshold("");
      setActionAutomation("");

      handleClose();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Failed to create rule. Please verify connection and try again.";
      toast.error("Failed to Create Rule", {
        description: errorMsg,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return createPortal(
    <div
      aria-modal="true"
      className="fixed inset-0 z-99999 flex items-center justify-center p-4 sm:p-6 select-none overflow-hidden"
    >
      {/* Dark backdrop blur */}
      <button
        type="button"
        aria-label="Close dialog backdrop"
        tabIndex={-1}
        onClick={() => !isSaving && handleClose()}
        className={`fixed inset-0 bg-slate-950/65 dark:bg-black/80 transition-all duration-300 ease-out cursor-pointer border-0 p-0 ${
          isVisible ? "opacity-100 backdrop-blur-md" : "opacity-0 backdrop-blur-none pointer-events-none"
        }`}
      />

      {/* Modal Dialog Card (Optimized compact height to fit without vertical scrollbars) */}
      <div
        className={`relative bg-white dark:bg-[#081220] border border-slate-200/90 dark:border-[#14233a] rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col justify-between overflow-hidden text-slate-900 dark:text-slate-100 z-10 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] transform ${
          isVisible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4 pointer-events-none"
        }`}
      >
        {/* Modal Sticky Header Bar - Enhanced height & breathing room */}
        <div className="px-6 py-5 sm:py-5.5 border-b border-slate-100 dark:border-[#14233a] flex items-center justify-between shrink-0 bg-white dark:bg-[#081220]">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-50 dark:bg-sky-950/70 border border-blue-100/80 dark:border-sky-800/40 text-blue-600 dark:text-sky-400 flex items-center justify-center shrink-0 shadow-xs">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Alert Engine Rule Builder
              </h3>
              <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
                Configure threshold escalations and automated ticket dispatches
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSaving}
            aria-label="Close dialog"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - Clean, spacious and comfortable without visible scrollbar */}
        <form
          id="alert-rule-form"
          onSubmit={handleSubmit}
          className="p-5 sm:p-6 space-y-3 sm:space-y-3.5 overflow-y-auto scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {/* ─── RULE NAME ─── */}
          <div>
            <label htmlFor="alert-rule-name-input" className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Rule Name
            </label>
            <input
              id="alert-rule-name-input"
              type="text"
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              placeholder="e.g. Core Router High CPU Escalation"
              className="w-full rounded-xl bg-slate-50/80 dark:bg-[#060b13] border border-slate-200/90 dark:border-[#1a283c] px-3.5 py-2.5 text-xs sm:text-[13px] text-slate-900 dark:text-white font-medium outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-[#081220] transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          {/* ─── 1 Trigger Condition (Alert Generation) ─── */}
          <div className="rounded-xl bg-blue-50/60 dark:bg-[#0c1a30] border border-blue-100 dark:border-[#1c3761] p-3 sm:p-3.5">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 shadow-xs">
                1
              </span>
              <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                Trigger Condition (Alert Generation)
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label htmlFor="alert-rule-metric-input" className="block text-[10px] sm:text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Monitored Metric
                </label>
                <input
                  id="alert-rule-metric-input"
                  type="text"
                  value={monitoredMetric}
                  onChange={(e) => setMonitoredMetric(e.target.value)}
                  placeholder="e.g. cpu_usage"
                  className="w-full rounded-lg bg-white dark:bg-[#081220] border border-slate-200 dark:border-[#1e3456] px-3 py-1.5 text-xs font-mono text-slate-900 dark:text-white outline-none focus:border-blue-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <div>
                <label htmlFor="alert-rule-condition-input" className="block text-[10px] sm:text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Condition Rule
                </label>
                <input
                  id="alert-rule-condition-input"
                  type="text"
                  value={conditionRule}
                  onChange={(e) => setConditionRule(e.target.value)}
                  placeholder="e.g. Greater than or equal to 80% for 2 consecutive"
                  className="w-full rounded-lg bg-white dark:bg-[#081220] border border-slate-200 dark:border-[#1e3456] px-3 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
            </div>
          </div>

          {/* ─── 2 Escalation Threshold (Alarm Generation) ─── */}
          <div className="rounded-xl bg-amber-50/60 dark:bg-[#201808] border border-amber-100 dark:border-[#42310a] p-3 sm:p-3.5">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0 shadow-xs">
                2
              </span>
              <label htmlFor="alert-rule-threshold-input" className="font-bold text-slate-900 dark:text-white text-xs cursor-pointer">
                Escalation Threshold (Alarm Generation)
              </label>
            </div>

            <textarea
              id="alert-rule-threshold-input"
              aria-label="Escalation Threshold (Alarm Generation)"
              rows={1}
              value={escalationThreshold}
              onChange={(e) => setEscalationThreshold(e.target.value)}
              placeholder="e.g. If condition persists for > 5 minutes without acknowledgment → Escalates to Alarm"
              className="w-full rounded-lg bg-white dark:bg-[#0a0f1d] border border-slate-200 dark:border-[#2f240e] px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-amber-500 resize-none min-h-10 h-10 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          {/* ─── 3 Action Automation (Ticket Generation) ─── */}
          <div className="rounded-xl bg-purple-50/60 dark:bg-[#19142e] border border-purple-100 dark:border-[#32235e] p-3 sm:p-3.5">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 shadow-xs">
                3
              </span>
              <label htmlFor="alert-rule-action-input" className="font-bold text-slate-900 dark:text-white text-xs cursor-pointer">
                Action Automation (Ticket Generation)
              </label>
            </div>

            <textarea
              id="alert-rule-action-input"
              aria-label="Action Automation (Ticket Generation)"
              rows={1}
              value={actionAutomation}
              onChange={(e) => setActionAutomation(e.target.value)}
              placeholder="e.g. If Alarm severity is CRITICAL and unacknowledged for > 15 minutes → Auto-creates ITSM Ticket"
              className="w-full rounded-lg bg-white dark:bg-[#0a0f1d] border border-slate-200 dark:border-[#2e2154] px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500 resize-none min-h-10 h-10 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>
        </form>

        {/* Modal Sticky Action Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-[#14233a] bg-slate-50/70 dark:bg-[#060e1a]/70 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSaving}
            className="px-4.5 py-2.5 rounded-xl border border-slate-300 dark:border-[#1b283d] bg-white dark:bg-[#091220]/70 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="alert-rule-form"
            disabled={isSaving}
            className="px-4.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-75"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Save &amp; Activate Rule</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AlertRuleBuilderModal;
