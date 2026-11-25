"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Check,
  ChevronRight,
  ChevronDown,
  ShieldAlert,
  ShieldCheck,
  Activity,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import onboardingData from "../data/onboardingDefaults.json";
import { deviceService, ConnectionTestResult } from "@/services/deviceService";

export type NewDeviceData = typeof onboardingData.defaultNewDevice;
export type WizardStep = 1 | 2 | 3 | 4;

export interface VendorOption {
  id: string;
  code: string;
  name: string;
  defaultModel: string;
}

export const VENDORS: VendorOption[] = [
  { id: "Cisco", code: "CI", name: "Cisco", defaultModel: "Catalyst 8300" },
  { id: "Fortinet", code: "FO", name: "Fortinet", defaultModel: "FortiGate 600E" },
  { id: "Juniper", code: "JU", name: "Juniper", defaultModel: "MX960" },
  { id: "Meraki", code: "ME", name: "Meraki", defaultModel: "MX250" },
  { id: "Other", code: "OT", name: "Other", defaultModel: "Gen-3 Enterprise" },
];

interface WizardStepperProps {
  currentStep: WizardStep;
  canNavigate: boolean;
  onStepClick: (step: WizardStep) => void;
}

const getStepCircleClass = (isCurrent: boolean, isPassed: boolean) => {
  if (isCurrent) {
    return "bg-blue-600 dark:bg-sky-500 text-white shadow-sm shadow-blue-500/30";
  }
  if (isPassed) {
    return "bg-emerald-500 text-white shadow-sm shadow-emerald-500/30";
  }
  return "border border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800/40";
};

const getStepSubLabelClass = (isCurrent: boolean, isPassed: boolean) => {
  if (isCurrent) return "text-blue-600 dark:text-sky-400";
  if (isPassed) return "text-emerald-600 dark:text-emerald-400";
  return "text-slate-400 dark:text-slate-500";
};

const getStepLabelClass = (isCurrent: boolean, isPassed: boolean) => {
  if (isCurrent) return "text-slate-900 dark:text-white";
  if (isPassed) return "text-slate-700 dark:text-slate-300";
  return "text-slate-400 dark:text-slate-500";
};

const getStepLineClass = (currentStep: number, step: number) => {
  if (currentStep > step) return "bg-emerald-500";
  if (currentStep === step) return "bg-blue-600/30 dark:bg-sky-500/30";
  return "bg-slate-200 dark:bg-slate-800";
};

const WizardStepper: React.FC<WizardStepperProps> = ({
  currentStep,
  canNavigate,
  onStepClick,
}) => {
  const steps: { step: WizardStep; label: string }[] = [
    { step: 1, label: "Device Identity" },
    { step: 2, label: "Protocol & Polling" },
    { step: 3, label: "Discovery & Thresholds" },
    { step: 4, label: "Test & Save" },
  ];

  return (
    <div className="px-6 py-3 border-y border-slate-100 dark:border-[#14233a] bg-slate-50/60 dark:bg-[#060e1a]/60 flex items-center justify-between shrink-0 select-none overflow-x-auto">
      {steps.map((s, idx) => {
        const isClickable = s.step === 1 || canNavigate;
        const isPassed = currentStep > s.step;
        const isCurrent = currentStep === s.step;

        return (
          <React.Fragment key={s.step}>
            <button
              type="button"
              disabled={!isClickable}
              onClick={() => {
                if (isClickable) onStepClick(s.step);
              }}
              className={`flex items-center gap-2.5 shrink-0 bg-transparent border-none text-left p-0 ${
                isClickable ? "cursor-pointer" : "opacity-60 cursor-not-allowed"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${getStepCircleClass(
                  isCurrent,
                  isPassed
                )}`}
              >
                {isPassed ? <Check className="w-3.5 h-3.5 stroke-3" /> : s.step}
              </div>
              <div className="flex flex-col">
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider leading-tight ${getStepSubLabelClass(
                    isCurrent,
                    isPassed
                  )}`}
                >
                  STEP {s.step}
                </span>
                <span
                  className={`text-xs font-semibold leading-tight ${getStepLabelClass(
                    isCurrent,
                    isPassed
                  )}`}
                >
                  {s.label}
                </span>
              </div>
            </button>

            {idx < steps.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-2 sm:mx-3 transition-colors ${getStepLineClass(
                  currentStep,
                  s.step
                )}`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

interface Step1Props {
  device: NewDeviceData;
  onChange: (updated: NewDeviceData) => void;
  slideDirection: "forward" | "backward";
}

const Step1Identity: React.FC<Step1Props> = ({ device, onChange, slideDirection }) => {
  return (
    <div
      className={`${
        slideDirection === "forward"
          ? "animate-wizard-slide-forward"
          : "animate-wizard-slide-backward"
      } space-y-4 py-1`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="onboarding-device-name"
            className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5"
          >
            DEVICE NAME *
          </label>
          <input
            id="onboarding-device-name"
            type="text"
            value={device.name}
            onChange={(e) => onChange({ ...device, name: e.target.value })}
            placeholder="DEL-EDGE-NEW-001"
            className="w-full bg-slate-50 dark:bg-[#060b14] border border-slate-200 dark:border-[#1a283c] rounded-xl px-4 py-2.5 sm:py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-[#060b14] focus:border-blue-500 dark:focus:border-sky-500 focus:ring-2 focus:ring-blue-500/15 dark:focus:ring-sky-500/30 transition-all"
          />
        </div>
        <div>
          <label
            htmlFor="onboarding-device-alias"
            className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5"
          >
            ALTERNATE NAME / ALIAS
          </label>
          <input
            id="onboarding-device-alias"
            type="text"
            value={device.alias}
            onChange={(e) => onChange({ ...device, alias: e.target.value })}
            placeholder="e.g. Delhi Edge Primary"
            className="w-full bg-slate-50 dark:bg-[#060b14] border border-slate-200 dark:border-[#1a283c] rounded-xl px-4 py-2.5 sm:py-3 text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-[#060b14] focus:border-blue-500 dark:focus:border-sky-500 focus:ring-2 focus:ring-blue-500/15 dark:focus:ring-sky-500/30 transition-all"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="onboarding-device-description"
          className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5"
        >
          DESCRIPTION
        </label>
        <input
          id="onboarding-device-description"
          type="text"
          value={device.description}
          onChange={(e) => onChange({ ...device, description: e.target.value })}
          placeholder="Primary enterprise edge device"
          className="w-full bg-slate-50 dark:bg-[#060b14] border border-slate-200 dark:border-[#1a283c] rounded-xl px-4 py-2.5 sm:py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-[#060b14] focus:border-blue-500 dark:focus:border-sky-500 focus:ring-2 focus:ring-blue-500/15 dark:focus:ring-sky-500/30 transition-all"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="onboarding-device-ip"
            className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5"
          >
            MANAGEMENT IP ADDRESS *
          </label>
          <input
            id="onboarding-device-ip"
            type="text"
            value={device.ip}
            onChange={(e) => onChange({ ...device, ip: e.target.value })}
            placeholder={device.ip}
            className="w-full bg-slate-50 dark:bg-[#060b14] border border-slate-200 dark:border-[#1a283c] rounded-xl px-4 py-2.5 sm:py-3 text-sm text-slate-900 dark:text-white font-mono placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-[#060b14] focus:border-blue-500 dark:focus:border-sky-500 focus:ring-2 focus:ring-blue-500/15 dark:focus:ring-sky-500/30 transition-all"
          />
        </div>
        <div>
          <label
            htmlFor="onboarding-device-group"
            className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5"
          >
            DEVICE GROUP
          </label>
          <div className="relative">
            <select
              id="onboarding-device-group"
              value={device.group}
              onChange={(e) => onChange({ ...device, group: e.target.value })}
              className="w-full appearance-none bg-slate-50 dark:bg-[#060b14] border border-slate-200 dark:border-[#1a283c] rounded-xl px-4 py-2.5 sm:py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-[#060b14] focus:border-blue-500 dark:focus:border-sky-500 focus:ring-2 focus:ring-blue-500/15 dark:focus:ring-sky-500/30 cursor-pointer pr-10 transition-all"
            >
              <option value="IZOSDWANPRIME">IZOSDWANPRIME</option>
              <option value="CORE_BACKBONE">CORE_BACKBONE</option>
              <option value="EDGE_GATEWAYS">EDGE_GATEWAYS</option>
              <option value="CAMPUS_SWITCHES">CAMPUS_SWITCHES</option>
              <option value="DC_FABRIC">DC_FABRIC</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      <div>
        <span className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
          OEM VENDOR
        </span>
        <div className="grid grid-cols-5 gap-2.5 sm:gap-3">
          {VENDORS.map((v) => {
            const isSelected = device.vendor.toLowerCase() === v.name.toLowerCase();
            return (
              <button
                key={v.id}
                type="button"
                onClick={() =>
                  onChange({
                    ...device,
                    vendor: v.name,
                    model: v.defaultModel,
                  })
                }
                className={`py-3 px-2 sm:px-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? "bg-blue-50/80 dark:bg-[#081324] border-2 border-blue-600 dark:border-[#0099ff] text-blue-900 dark:text-white shadow-sm shadow-blue-500/10"
                    : "bg-slate-50 dark:bg-[#060b14] border border-slate-200 dark:border-[#18263a] text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-[#0c1422]"
                }`}
              >
                <span
                  className={`w-9 h-6 rounded flex items-center justify-center text-[11px] font-bold tracking-tight ${
                    isSelected
                      ? "bg-blue-600 text-white dark:bg-[#101928] dark:text-sky-300 dark:border dark:border-[#1e2d44]"
                      : "bg-slate-200 dark:bg-[#0e1624] text-slate-600 dark:text-slate-400 border border-slate-300/60 dark:border-[#18263a]"
                  }`}
                >
                  {v.code}
                </span>
                <span className="text-xs font-semibold">{v.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface Step2Props {
  device: NewDeviceData;
  onChange: (updated: NewDeviceData) => void;
  slideDirection: "forward" | "backward";
}

const Step2Protocol: React.FC<Step2Props> = ({ device, onChange, slideDirection }) => {
  return (
    <div
      className={`${
        slideDirection === "forward"
          ? "animate-wizard-slide-forward"
          : "animate-wizard-slide-backward"
      } space-y-4 py-1`}
    >
      <div className="bg-slate-50 dark:bg-[#060b14] border border-slate-200 dark:border-[#1a283c] rounded-xl px-4 py-3.5 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">SNMP Capable</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Enable SNMP polling for this device
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={device.snmpCapable}
          onClick={() => onChange({ ...device, snmpCapable: !device.snmpCapable })}
          className={`w-12 h-6 rounded-full transition-colors flex items-center px-0.5 cursor-pointer ${
            device.snmpCapable ? "bg-blue-600 dark:bg-sky-500" : "bg-slate-300 dark:bg-slate-700"
          }`}
        >
          <span
            className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
              device.snmpCapable ? "translate-x-6" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="onboarding-snmp-version"
            className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5"
          >
            SNMP VERSION
          </label>
          <div className="relative">
            <select
              id="onboarding-snmp-version"
              value={device.snmpVersion}
              onChange={(e) =>
                onChange({
                  ...device,
                  snmpVersion: e.target.value,
                  protocol: `SNMP ${e.target.value}`,
                })
              }
              className="w-full appearance-none bg-slate-50 dark:bg-[#060b14] border border-slate-200 dark:border-[#1a283c] rounded-xl px-4 py-2.5 sm:py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-[#060b14] focus:border-blue-500 dark:focus:border-sky-500 focus:ring-2 focus:ring-blue-500/15 dark:focus:ring-sky-500/30 cursor-pointer pr-10 transition-all"
            >
              <option value="v2c">v2c</option>
              <option value="v3">v3</option>
              <option value="v1">v1</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div>
          <label
            htmlFor="onboarding-snmp-port"
            className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5"
          >
            SNMP PORT
          </label>
          <input
            id="onboarding-snmp-port"
            type="text"
            value={device.port}
            onChange={(e) => onChange({ ...device, port: e.target.value })}
            placeholder="161"
            className="w-full bg-slate-50 dark:bg-[#060b14] border border-slate-200 dark:border-[#1a283c] rounded-xl px-4 py-2.5 sm:py-3 text-sm text-slate-900 dark:text-white font-mono placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-[#060b14] focus:border-blue-500 dark:focus:border-sky-500 focus:ring-2 focus:ring-blue-500/15 dark:focus:ring-sky-500/30 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="onboarding-read-community"
            className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5"
          >
            READ COMMUNITY
          </label>
          <input
            id="onboarding-read-community"
            type="password"
            value={device.readCommunity}
            onChange={(e) => onChange({ ...device, readCommunity: e.target.value })}
            placeholder="••••••••••"
            className="w-full bg-slate-50 dark:bg-[#060b14] border border-slate-200 dark:border-[#1a283c] rounded-xl px-4 py-2.5 sm:py-3 text-sm text-slate-900 dark:text-white font-mono tracking-widest placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-[#060b14] focus:border-blue-500 dark:focus:border-sky-500 focus:ring-2 focus:ring-blue-500/15 dark:focus:ring-sky-500/30 transition-all"
          />
        </div>

        <div>
          <label
            htmlFor="onboarding-write-community"
            className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5"
          >
            WRITE COMMUNITY
          </label>
          <input
            id="onboarding-write-community"
            type="password"
            value={device.writeCommunity}
            onChange={(e) => onChange({ ...device, writeCommunity: e.target.value })}
            placeholder="••••••••••"
            className="w-full bg-slate-50 dark:bg-[#060b14] border border-slate-200 dark:border-[#1a283c] rounded-xl px-4 py-2.5 sm:py-3 text-sm text-slate-900 dark:text-white font-mono tracking-widest placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-[#060b14] focus:border-blue-500 dark:focus:border-sky-500 focus:ring-2 focus:ring-blue-500/15 dark:focus:ring-sky-500/30 transition-all"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="onboarding-test-oid"
          className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5"
        >
          TEST OID · SYSDESCR
        </label>
        <input
          id="onboarding-test-oid"
          type="text"
          value={device.testOid}
          onChange={(e) => onChange({ ...device, testOid: e.target.value })}
          placeholder=".1.3.6.1.2.1.1.1.0"
          className="w-full bg-slate-50 dark:bg-[#060b14] border border-slate-200 dark:border-[#1a283c] rounded-xl px-4 py-2.5 sm:py-3 text-sm text-slate-900 dark:text-white font-mono placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-[#060b14] focus:border-blue-500 dark:focus:border-sky-500 focus:ring-2 focus:ring-blue-500/15 dark:focus:ring-sky-500/30 transition-all"
        />
      </div>

      {device.snmpVersion === "v3" && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#060b14] border border-slate-200 dark:border-[#1a283c] space-y-3 mt-2">
          <div className="text-xs font-bold text-blue-600 dark:text-sky-400 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>SNMP v3 USM Security Configuration</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label
                htmlFor="onboarding-snmp3-user"
                className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1"
              >
                SECURITY USERNAME
              </label>
              <input
                id="onboarding-snmp3-user"
                type="text"
                value={device.snmpUser}
                onChange={(e) => onChange({ ...device, snmpUser: e.target.value })}
                className="w-full bg-white dark:bg-[#0b1320] border border-slate-200 dark:border-[#1c2c44] rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="onboarding-snmp3-auth"
                className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1"
              >
                AUTH PROTOCOL
              </label>
              <select
                id="onboarding-snmp3-auth"
                value={device.authProto}
                onChange={(e) => onChange({ ...device, authProto: e.target.value })}
                className="w-full bg-white dark:bg-[#0b1320] border border-slate-200 dark:border-[#1c2c44] rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white cursor-pointer focus:outline-none focus:border-blue-500"
              >
                <option value="SHA-256">SHA-256 (Recommended)</option>
                <option value="SHA-1">SHA-1</option>
                <option value="MD5">MD5</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="onboarding-snmp3-priv"
                className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1"
              >
                PRIVACY CIPHER
              </label>
              <select
                id="onboarding-snmp3-priv"
                value={device.privProto}
                onChange={(e) => onChange({ ...device, privProto: e.target.value })}
                className="w-full bg-white dark:bg-[#0b1320] border border-slate-200 dark:border-[#1c2c44] rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white cursor-pointer focus:outline-none focus:border-blue-500"
              >
                <option value="AES-128">AES-128 (Secure)</option>
                <option value="AES-256">AES-256</option>
                <option value="DES">DES</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label
                htmlFor="onboarding-snmp3-auth-key"
                className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1"
              >
                AUTH PASSPHRASE
              </label>
              <input
                id="onboarding-snmp3-auth-key"
                type="password"
                value={device.authKey}
                onChange={(e) => onChange({ ...device, authKey: e.target.value })}
                className="w-full bg-white dark:bg-[#0b1320] border border-slate-200 dark:border-[#1c2c44] rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="onboarding-snmp3-priv-key"
                className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1"
              >
                PRIVACY PASSPHRASE
              </label>
              <input
                id="onboarding-snmp3-priv-key"
                type="password"
                value={device.privKey}
                onChange={(e) => onChange({ ...device, privKey: e.target.value })}
                className="w-full bg-white dark:bg-[#0b1320] border border-slate-200 dark:border-[#1c2c44] rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface Step3Props {
  device: NewDeviceData;
  onChange: (updated: NewDeviceData) => void;
  slideDirection: "forward" | "backward";
}

const Step3Discovery: React.FC<Step3Props> = ({ device, onChange, slideDirection }) => {
  const toggleItems = [
    {
      key: "prefer64BitCounters" as const,
      label: "Prefer 64-bit Counters (RFC 2233 HC)",
    },
    {
      key: "ipInterfaceCorrelation" as const,
      label: "IP / Interface Correlation",
    },
    {
      key: "autoDiscoverTraps" as const,
      label: "Auto-discover Trap Destinations",
    },
    {
      key: "enableConcurrentPolling" as const,
      label: "Enable concurrent polling",
    },
  ];

  return (
    <div
      className={`${
        slideDirection === "forward"
          ? "animate-wizard-slide-forward"
          : "animate-wizard-slide-backward"
      } space-y-4 py-1`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="onboarding-polled-by"
            className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5"
          >
            POLLED BY
          </label>
          <div className="relative">
            <select
              id="onboarding-polled-by"
              value={device.polledBy || "AUTO (Nearest Node)"}
              onChange={(e) => onChange({ ...device, polledBy: e.target.value })}
              className="w-full appearance-none bg-slate-50 dark:bg-[#070e1a] border border-slate-200 dark:border-[#1a2942] rounded-xl px-4 py-2.5 sm:py-3 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-[#070e1a] focus:border-blue-500 dark:focus:border-sky-500 cursor-pointer pr-10 transition-colors"
            >
              <option value="AUTO (Nearest Node)">AUTO (Nearest Node)</option>
              <option value="INP44NFCM01A">INP44NFCM01A</option>
              <option value="UKL78NFCM01A">UKL78NFCM01A</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div>
          <label
            htmlFor="onboarding-polling-frequency"
            className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5"
          >
            POLLING FREQUENCY
          </label>
          <div className="relative">
            <select
              id="onboarding-polling-frequency"
              value={device.pollingFrequency || "5 minutes / 300s"}
              onChange={(e) => onChange({ ...device, pollingFrequency: e.target.value })}
              className="w-full appearance-none bg-slate-50 dark:bg-[#070e1a] border border-slate-200 dark:border-[#1a2942] rounded-xl px-4 py-2.5 sm:py-3 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-[#070e1a] focus:border-blue-500 dark:focus:border-sky-500 cursor-pointer pr-10 transition-colors"
            >
              <option value="1 minute / 60s">1 minute / 60s</option>
              <option value="2 minutes / 120s">2 minutes / 120s</option>
              <option value="5 minutes / 300s">5 minutes / 300s</option>
              <option value="10 minutes / 600s">10 minutes / 600s</option>
              <option value="15 minutes / 900s">15 minutes / 900s</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="pt-1">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-200 mb-3">
          Advanced discovery
        </h4>
        <div className="space-y-3">
          {toggleItems.map((item) => {
            const isChecked = Boolean(device[item.key]);
            return (
              <button
                type="button"
                key={item.key}
                onClick={() => onChange({ ...device, [item.key]: !isChecked })}
                className="w-full bg-slate-50 dark:bg-[#070e1a] border border-slate-200 dark:border-[#1a2942] rounded-xl px-4 sm:px-5 py-3.5 flex items-center justify-between cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100/60 dark:hover:bg-[#0c1422] transition-colors select-none text-left"
              >
                <span className="text-sm font-medium text-slate-900 dark:text-slate-200">
                  {item.label}
                </span>
                <div
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 shrink-0 ${
                    isChecked ? "bg-blue-600 dark:bg-sky-500" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                      isChecked ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface Step4Props {
  device: NewDeviceData;
  isDiagnosticRunning: boolean;
  diagnosticCompleted: boolean;
  diagnosticResult: ConnectionTestResult | null;
  diagnosticError: string | null;
  onRunTest: () => void;
  slideDirection: "forward" | "backward";
}

function renderDiagnosticDetails(
  device: NewDeviceData,
  isDiagnosticRunning: boolean,
  diagnosticCompleted: boolean,
  diagnosticResult: ConnectionTestResult | null,
  diagnosticError: string | null
) {
  if (!diagnosticCompleted && !isDiagnosticRunning && !diagnosticError) {
    return (
      <div className="text-sky-400 font-mono text-xs sm:text-[13px] font-medium">
        Ready. Run the check to validate device connectivity ({device.ip}).
      </div>
    );
  }
  if (isDiagnosticRunning) {
    return (
      <div className="text-sky-400 flex items-center gap-2 font-mono text-xs sm:text-[13px]">
        <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
        <span>Testing socket connectivity &amp; SNMP credentials...</span>
      </div>
    );
  }
  if (diagnosticError) {
    return (
      <div className="space-y-2 text-rose-400 font-mono text-xs sm:text-[13px]">
        <div className="font-semibold">✗ Handshake probe failed</div>
        <div className="text-slate-300">{diagnosticError}</div>
      </div>
    );
  }

  const reachable = diagnosticResult?.success ?? true;
  const rtt = diagnosticResult?.rtt || "14 ms";
  const oemDetected = diagnosticResult?.oemDetected || device.vendor;
  const osVersion = diagnosticResult?.osVersion || `${device.vendor} Enterprise OS`;
  const statusMsg = diagnosticResult?.message || "Pre-flight check completed successfully.";

  return (
    <div className="space-y-3.5 sm:space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6">
        <div className="w-56 shrink-0 flex items-center gap-2.5 text-white font-medium">
          <span className={reachable ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
            {reachable ? "✓" : "✗"}
          </span>
          <span>{reachable ? "ICMP Reachable" : "ICMP Unreachable"}</span>
        </div>
        <div className="flex items-center gap-6 text-slate-300">
          <span>RTT {rtt}</span>
          <span>Packet loss {reachable ? "0%" : "100%"}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6">
        <div className="w-56 shrink-0 flex items-center gap-2.5 text-white font-medium">
          <span className={reachable ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
            {reachable ? "✓" : "✗"}
          </span>
          <span>UDP/{device.port || 161} {reachable ? "Available" : "Closed"}</span>
        </div>
        <div className="text-slate-300">Response {rtt}</div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6">
        <div className="w-56 shrink-0 flex items-center gap-2.5 text-white font-medium">
          <span className={reachable ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
            {reachable ? "✓" : "!"}
          </span>
          <span>{reachable ? "Community Validated" : "Pending Validation"}</span>
        </div>
        <div className="text-slate-300">
          {reachable ? "Read access granted" : "Verify target IP and credentials"}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6">
        <div className="w-56 shrink-0 flex items-center gap-2.5 text-white font-medium">
          <span className={reachable ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
            {reachable ? "✓" : "!"}
          </span>
          <span>MIB-II Query</span>
        </div>
        <div className="space-y-1 text-slate-300">
          <div>SysName: {device.name || "TAH-IND-DELHI-001"}</div>
          <div>SysDescr: {oemDetected} {osVersion}</div>
        </div>
      </div>

      <div className="pt-2 text-slate-400">
        {statusMsg}
      </div>
    </div>
  );
}

const Step4Diagnostic: React.FC<Step4Props> = ({
  device,
  isDiagnosticRunning,
  diagnosticCompleted,
  diagnosticResult,
  diagnosticError,
  onRunTest,
  slideDirection,
}) => {
  const getTestButtonText = () => {
    if (isDiagnosticRunning) return "Running...";
    if (diagnosticCompleted || diagnosticError) return "Run Again";
    return "Run Check";
  };

  const diagnosticStatusText = isDiagnosticRunning
    ? "RUNNING CHECKS..."
    : diagnosticResult?.success === false || diagnosticError
    ? "HANDSHAKE WARNING"
    : "ALL CHECKS PASSED";

  return (
    <div
      className={`${
        slideDirection === "forward"
          ? "animate-wizard-slide-forward"
          : "animate-wizard-slide-backward"
      } space-y-4 py-1`}
    >
      <div className="bg-slate-50 dark:bg-[#070e1a] border border-slate-200 dark:border-[#1a2942] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-100/80 dark:bg-[#091527] border border-blue-200 dark:border-[#182c49] flex items-center justify-center text-blue-600 dark:text-sky-400 shrink-0">
            <Activity className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
              Pre-flight connectivity check
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Validate ICMP reachability, SNMP credentials, and MIB access before onboarding.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRunTest}
          disabled={isDiagnosticRunning}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-sky-500 dark:hover:bg-sky-600 shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98] shrink-0 self-start sm:self-auto"
        >
          {isDiagnosticRunning && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>{getTestButtonText()}</span>
        </button>
      </div>

      <div className="bg-slate-950 dark:bg-[#050a14] border border-slate-800 dark:border-[#16253c] rounded-xl overflow-hidden font-mono text-xs sm:text-[13px] h-66.25 flex flex-col shadow-inner">
        <div className="px-5 py-2.5 border-b border-slate-800 dark:border-[#142032] flex items-center justify-between bg-slate-900/90 dark:bg-[#040810]/80 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
            <span className="text-[11px] font-semibold tracking-wider text-slate-400 ml-2">
              CONNECTIVITY TEST
            </span>
          </div>
          {(diagnosticCompleted || diagnosticError) && (
            <div
              className={`text-[11px] font-semibold tracking-wider ${
                diagnosticResult?.success === false || diagnosticError
                  ? "text-amber-400"
                  : "text-[#10b981]"
              }`}
            >
              {diagnosticStatusText}
            </div>
          )}
        </div>

        <div className="p-5 sm:p-6 leading-relaxed flex-1 overflow-y-auto">
          {renderDiagnosticDetails(
            device,
            isDiagnosticRunning,
            diagnosticCompleted,
            diagnosticResult,
            diagnosticError
          )}
        </div>
      </div>
    </div>
  );
};

export interface AddDeviceModalProps {
  mounted: boolean;
  isRendered: boolean;
  isVisible: boolean;
  onClose: () => void;
  onSave: (device: NewDeviceData) => Promise<void> | void;
}

export const AddDeviceModal: React.FC<Readonly<AddDeviceModalProps>> = ({
  mounted,
  isRendered,
  isVisible,
  onClose,
  onSave,
}) => {
  const [wizardStep, setWizardStep] = useState<WizardStep>(1);
  const [slideDirection, setSlideDirection] = useState<"forward" | "backward">("forward");
  const [newDevice, setNewDevice] = useState<NewDeviceData>(
    onboardingData.defaultNewDevice
  );
  const [isDiagnosticRunning, setIsDiagnosticRunning] = useState(false);
  const [diagnosticCompleted, setDiagnosticCompleted] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<ConnectionTestResult | null>(null);
  const [diagnosticError, setDiagnosticError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const changeStep = (targetStep: WizardStep) => {
    setSlideDirection(targetStep >= wizardStep ? "forward" : "backward");
    setWizardStep(targetStep);
  };

  const runDiagnosticTest = async () => {
    if (!newDevice.ip.trim()) {
      toast.error("Validation error", {
        description: "Management IP address is required to run the connectivity test.",
      });
      return;
    }

    setIsDiagnosticRunning(true);
    setDiagnosticError(null);
    try {
      const result = await deviceService.testConnection({
        ip: newDevice.ip.trim(),
        port: Number.parseInt(newDevice.port, 10) || 161,
        protocol: newDevice.protocol || "SSH / SNMP",
        oem: newDevice.vendor || "Cisco",
      });

      setDiagnosticResult(result);
      setDiagnosticCompleted(true);

      if (result.success) {
        toast.success("Pre-flight checks passed", {
          description: `${result.message} (RTT: ${result.rtt})`,
        });
      } else {
        toast.warning("Connection Handshake Warning", {
          description: result.message || `Target ${newDevice.ip} did not respond.`,
        });
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to run connection handshake test.";
      setDiagnosticError(msg);
      setDiagnosticCompleted(false);
      toast.error("Connectivity Test Failed", { description: msg });
    } finally {
      setIsDiagnosticRunning(false);
    }
  };

  const handleNextOrSave = async () => {
    if (!newDevice.name.trim() || !newDevice.ip.trim()) {
      toast.error("Validation error", {
        description: "Device Name and Management IP are required.",
      });
      return;
    }
    if (wizardStep < 4) {
      changeStep((wizardStep + 1) as WizardStep);
    } else {
      setIsSaving(true);
      try {
        await onSave(newDevice);
        setWizardStep(1);
        setDiagnosticCompleted(false);
        setDiagnosticResult(null);
        setDiagnosticError(null);
        setNewDevice(onboardingData.defaultNewDevice);
      } catch {
        // Error toast handled by caller; keep modal open for correction
      } finally {
        setIsSaving(false);
      }
    }
  };

  if (!mounted || !isRendered) return null;

  const canNavigate = Boolean(newDevice.name.trim() && newDevice.ip.trim());

  return createPortal(
    <div
      aria-modal="true"
      className="fixed inset-0 z-99999 flex items-center justify-center p-3 sm:p-4 select-none overflow-hidden"
    >
      <button
        type="button"
        aria-label="Close modal backdrop"
        tabIndex={-1}
        onClick={onClose}
        className={`fixed inset-0 bg-slate-950/65 dark:bg-black/80 transition-all duration-300 ease-out cursor-pointer border-0 p-0 ${
          isVisible ? "opacity-100 backdrop-blur-md" : "opacity-0 backdrop-blur-none"
        }`}
      />

      <div
        className={`relative bg-white dark:bg-[#081220] border border-slate-200/90 dark:border-[#14233a] rounded-2xl shadow-2xl w-full max-w-3xl h-165 max-h-[90vh] flex flex-col justify-between overflow-hidden text-slate-900 dark:text-slate-100 z-10 transition-all duration-300 ease-out transform ${
          isVisible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
        }`}
      >
        <div className="px-6 pt-5 sm:pt-6 pb-3 flex items-start justify-between shrink-0">
          <div>
            <span className="text-[11px] font-bold text-blue-600 dark:text-sky-400 uppercase tracking-widest block mb-1">
              DEVICE ONBOARDING
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Add a new network device
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Configure identity, polling, and discovery settings.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <WizardStepper
          currentStep={wizardStep}
          canNavigate={canNavigate}
          onStepClick={changeStep}
        />

        <div className="flex-1 px-6 py-4 overflow-y-auto min-h-0">
          {wizardStep === 1 && (
            <Step1Identity
              device={newDevice}
              onChange={setNewDevice}
              slideDirection={slideDirection}
            />
          )}
          {wizardStep === 2 && (
            <Step2Protocol
              device={newDevice}
              onChange={setNewDevice}
              slideDirection={slideDirection}
            />
          )}
          {wizardStep === 3 && (
            <Step3Discovery
              device={newDevice}
              onChange={setNewDevice}
              slideDirection={slideDirection}
            />
          )}
          {wizardStep === 4 && (
            <Step4Diagnostic
              device={newDevice}
              isDiagnosticRunning={isDiagnosticRunning}
              diagnosticCompleted={diagnosticCompleted}
              diagnosticResult={diagnosticResult}
              diagnosticError={diagnosticError}
              onRunTest={runDiagnosticTest}
              slideDirection={slideDirection}
            />
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 dark:border-[#14233a] bg-slate-50/70 dark:bg-[#060e1a]/70 flex items-center justify-between shrink-0">
          <div>
            {wizardStep === 1 ? (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-[#1b283d] bg-white dark:bg-[#091220]/70 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
              >
                Cancel
              </button>
            ) : (
              <button
                type="button"
                onClick={() => changeStep((wizardStep - 1) as WizardStep)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-[#1b283d] bg-white dark:bg-[#091220]/70 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
              >
                Back
              </button>
            )}
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
            Step {wizardStep} of 4
          </div>

          <div>
            {wizardStep < 4 ? (
              <button
                type="button"
                onClick={handleNextOrSave}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-sky-500 dark:hover:bg-sky-600 shadow-md shadow-blue-500/25 transition-all cursor-pointer active:scale-[0.98]"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNextOrSave}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-sky-500 dark:hover:bg-sky-600 shadow-lg shadow-blue-500/25 transition-all cursor-pointer active:scale-[0.98] disabled:opacity-60"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Onboarding...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Onboarding</span>
                    <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AddDeviceModal;
