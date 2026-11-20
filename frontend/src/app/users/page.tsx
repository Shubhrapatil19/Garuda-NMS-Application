"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  Shield,
  ShieldAlert,
  UserCheck,
  UserPlus,
  Search,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import dbData from "../../../data/db.json";

interface ManagedUser {
  id: string;
  name: string;
  username: string;
  role: string;
  organization: string;
  status: string;
  initials: string; 
}

export default function UserManagementPage() {
  const { user, isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [usersList] = useState<ManagedUser[]>(() => {
    return (dbData.users || []).map((u) => ({
      id: u.id,
      name: u.name,
      username: u.username,
      role: u.role || "Network Engineer",
      organization: u.organization || "Garuda Enterprise",
      status: u.status || "online",
      initials: u.initials || u.name.slice(0, 2).toUpperCase(),
    }));
  });

  // Role Gate: Only Administrator can access User Management
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
          You are currently signed in as <b>{user?.role || "Network Engineer"}</b>. User Management, RBAC assignments, and credential provisioning are restricted to system administrators.
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

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      !searchQuery ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.organization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role.toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const adminCount = usersList.filter((u) => u.role.toLowerCase().includes("admin")).length;
  const engineerCount = usersList.length - adminCount;

  return (
    <div className="space-y-6">
      {/* Top Banner / Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            User Directory &amp; RBAC Access Control
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage authenticated accounts, role assignments, and organizational security privileges
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("Add User modal ready for backend provisioning API.")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4 stroke-[2.5]" />
          <span>Provision New User</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#081220] rounded-2xl border border-slate-200/80 dark:border-[#14233a] p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>TOTAL USERS</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {usersList.length}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              All active
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#081220] rounded-2xl border border-slate-200/80 dark:border-[#14233a] p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>ADMINISTRATORS</span>
            <Shield className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {adminCount}
            </span>
            <span className="text-xs text-slate-400">Full privileges</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#081220] rounded-2xl border border-slate-200/80 dark:border-[#14233a] p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>NETWORK ENGINEERS</span>
            <UserCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {engineerCount}
            </span>
            <span className="text-xs text-slate-400">Operational NOC</span>
          </div>
        </div>
      </div>

      {/* Directory Table Master Card */}
      <div className="bg-white dark:bg-[#081220] rounded-2xl border border-slate-200/80 dark:border-[#14233a] shadow-xs overflow-hidden">
        {/* Filter bar */}
        <div className="p-4 border-b border-slate-100 dark:border-[#14233a] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex items-center max-w-sm w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search user name, email, organization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#060b13] border border-slate-200 dark:border-[#162740] rounded-xl text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#060b13] border border-slate-200 dark:border-[#162740] text-xs text-slate-700 dark:text-slate-300 outline-none"
            >
              <option value="all">All Roles</option>
              <option value="administrator">Administrator</option>
              <option value="network engineer">Network Engineer</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-[#14233a] bg-slate-50/70 dark:bg-[#060b13]/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-5">User</th>
                <th className="py-3 px-5">Email / Handle</th>
                <th className="py-3 px-5">Role (RBAC)</th>
                <th className="py-3 px-5">Organization</th>
                <th className="py-3 px-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#12233b] text-xs">
              {filteredUsers.map((u) => {
                const isUserAdmin = u.role.toLowerCase().includes("admin");
                return (
                  <tr
                    key={u.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-[#0c1e38]/40 transition-colors"
                  >
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs tracking-tight shrink-0 ${
                            isUserAdmin
                              ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300"
                          }`}
                        >
                          {u.initials}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{u.name}</p>
                          <p className="text-[11px] text-slate-400">ID: {u.id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-5 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                      {u.username}
                    </td>

                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          isUserAdmin
                            ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                            : "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                        }`}
                      >
                        {isUserAdmin ? (
                          <Shield className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                        ) : (
                          <UserCheck className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                        )}
                        <span>{u.role}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-slate-600 dark:text-slate-400">
                      {u.organization}
                    </td>

                    <td className="py-3.5 px-5">
                      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Online
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

