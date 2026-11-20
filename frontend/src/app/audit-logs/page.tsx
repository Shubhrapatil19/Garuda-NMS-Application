"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  Filter,
  ArrowLeft,
  Clock,
  Terminal,
  Activity,
  UserCheck,
  Lock,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  target: string;
  severity: "info" | "warning" | "critical";
  ip: string;
}

const SAMPLE_LOGS: AuditEvent[] = [
  {
    id: "aud-001",
    timestamp: "2 mins ago",
    actor: "Jayesh Nikumbh",
    role: "Network Engineer",
    action: "ICMP Diagnostic Ping",
    target: "Core-Router-01 (10.24.1.1)",
    severity: "info",
    ip: "10.200.4.15",
  },
  {
    id: "aud-002",
    timestamp: "14 mins ago",
    actor: "System Administrator",
    role: "Administrator",
    action: "Update SNMP Timeout",
    target: "Olio Poller Global Engine",
    severity: "warning",
    ip: "10.200.1.2",
  },
  {
    id: "aud-003",
    timestamp: "45 mins ago",
    actor: "Jayesh Nikumbh",
    role: "Network Engineer",
    action: "Acknowledge Incident",
    target: "Incident ALT-104 (BOM-Switch-44)",
    severity: "info",
    ip: "10.200.4.15",
  },
  {
    id: "aud-004",
    timestamp: "1 hour ago",
    actor: "System Administrator",
    role: "Administrator",
    action: "Onboard Network Device",
    target: "DEL-EDGE-NEW-001 (10.20.4.61)",
    severity: "info",
    ip: "10.200.1.2",
  },
  {
    id: "aud-005",
    timestamp: "2 hours ago",
    actor: "System Administrator",
    role: "Administrator",
    action: "Slack Webhook Reconfiguration",
    target: "#tah-noc-triage Channel",
    severity: "warning",
    ip: "10.200.1.2",
  },
  {
    id: "aud-006",
    timestamp: "3 hours ago",
    actor: "Jayesh Nikumbh",
    role: "Network Engineer",
    action: "User Authentication",
    target: "Web Console Session",
    severity: "info",
    ip: "10.200.4.15",
  },
];

export default function AuditLogsPage() {
  const { user, isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");

  // Role Gate: Only Administrator can access Audit Logs
  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/30 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Administrator Access Required
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
          You are currently signed in as <b>{user?.role || "Network Engineer"}</b>. System security audit logs, actor forensics, and configuration change trails are restricted to system administrators.
        </p>
        <div className="mt-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Operations Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  const filteredLogs = SAMPLE_LOGS.filter((l) => {
    const matchesSearch =
      !searchQuery ||
      l.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.ip.includes(searchQuery);
    const matchesSeverity = severityFilter === "all" || l.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Heading */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Security Audit &amp; Event Logs
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Immutable audit trail of administrative configurations, user logins, and telemetry adjustments
        </p>
      </div>

      {/* Audit Master Card */}
      <div className="bg-white dark:bg-[#081220] rounded-2xl border border-slate-200/80 dark:border-[#14233a] shadow-xs overflow-hidden">
        {/* Filter bar */}
        <div className="p-4 border-b border-slate-100 dark:border-[#14233a] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex items-center max-w-sm w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search action, actor, target or IP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#060b13] border border-slate-200 dark:border-[#162740] rounded-xl text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#060b13] border border-slate-200 dark:border-[#162740] text-xs text-slate-700 dark:text-slate-300 outline-none"
            >
              <option value="all">All Severities</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        {/* Audit Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-[#14233a] bg-slate-50/70 dark:bg-[#060b13]/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-5">Timestamp</th>
                <th className="py-3 px-5">Actor &amp; Role</th>
                <th className="py-3 px-5">Action Event</th>
                <th className="py-3 px-5">Target Resource</th>
                <th className="py-3 px-5">Source IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#12233b] text-xs">
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-[#0c1e38]/40 transition-colors"
                >
                  <td className="py-3.5 px-5 text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                    {log.timestamp}
                  </td>

                  <td className="py-3.5 px-5">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{log.actor}</p>
                      <p className="text-[11px] text-slate-400">{log.role}</p>
                    </div>
                  </td>

                  <td className="py-3.5 px-5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        log.severity === "warning"
                          ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                          : log.severity === "critical"
                          ? "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                          : "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>

                  <td className="py-3.5 px-5 text-slate-700 dark:text-slate-300 font-medium">
                    {log.target}
                  </td>

                  <td className="py-3.5 px-5 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                    {log.ip}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

