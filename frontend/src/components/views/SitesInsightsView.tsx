"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Search, ChevronDown, X } from "lucide-react";
import SiteInsightCard from "@/components/SiteInsightCard";
import SiteTopologyDetailView from "@/components/SiteTopologyDetailView";
import { CARRIER_SITES, CarrierSite } from "@/data/sitesData";

export default function SitesInsightsView() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("All States");
  const [selectedStatus, setSelectedStatus] = useState<string>("All Statuses");
  const [selectedSite, setSelectedSite] = useState<CarrierSite | null>(null);

  // Sync selected site with URL search params (?site=west-mh03-mumbai)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const siteParam = params.get("site");
      if (siteParam) {
        const match = CARRIER_SITES.find(
          (s) =>
            s.id === siteParam ||
            s.name.toLowerCase() === siteParam.toLowerCase()
        );
        if (match) {
          setSelectedSite(match);
        }
      }
    }

    const onPopState = () => {
      const params = new URLSearchParams(window.location.search);
      const siteParam = params.get("site");
      if (siteParam) {
        const match = CARRIER_SITES.find((s) => s.id === siteParam);
        setSelectedSite(match || null);
      } else {
        setSelectedSite(null);
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const handleSelectSite = (site: CarrierSite) => {
    setSelectedSite(site);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("site", site.id);
      window.history.pushState({}, "", url.toString());
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBackToList = () => {
    setSelectedSite(null);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("site");
      window.history.pushState({}, "", url.toString());
    }
  };

  // Unique states for dropdown
  const statesList = useMemo(() => {
    const states = Array.from(new Set(CARRIER_SITES.map((s) => s.state)));
    return ["All States", ...states];
  }, []);

  // Filtered sites based on search, state, and status
  const filteredSites = useMemo(() => {
    return CARRIER_SITES.filter((site) => {
      // Search filter (matches name, service ID, city, or location)
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        site.name.toLowerCase().includes(q) ||
        site.serviceId.toLowerCase().includes(q) ||
        site.city.toLowerCase().includes(q) ||
        site.location.toLowerCase().includes(q);

      // State filter
      const matchesState =
        selectedState === "All States" || site.state === selectedState;

      // Status filter
      const matchesStatus =
        selectedStatus === "All Statuses" ||
        site.status.toLowerCase() === selectedStatus.toLowerCase();

      return matchesSearch && matchesState && matchesStatus;
    });
  }, [searchQuery, selectedState, selectedStatus]);

  // If a site is clicked, show the 1:1 Site Topology Drilldown View
  if (selectedSite) {
    return (
      <SiteTopologyDetailView
        site={selectedSite}
        onBack={handleBackToList}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── Top Section Header (Exact 1:1 match with user screenshot) ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Title & Subtitle */}
        <div>
          <h1 className="text-2xl sm:text-[26px] font-bold text-slate-900 dark:text-white tracking-tight">
            Sites Insights
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse, search, and drill down into individual carrier network sites
          </p>
        </div>

        {/* Right Controls: Search & Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input with magnifying glass icon */}
          <div className="relative flex-1 sm:flex-none sm:w-64">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter site or service ID..."
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl bg-white dark:bg-[#081220] border border-slate-200/90 dark:border-[#14233a] text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-0.5 rounded-md"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* All States Dropdown */}
          <div className="relative">
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="appearance-none pl-3.5 pr-8 py-2 text-xs sm:text-sm rounded-xl bg-white dark:bg-[#081220] border border-slate-200/90 dark:border-[#14233a] text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs cursor-pointer transition-all"
            >
              {statesList.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>

          {/* All Statuses Dropdown */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="appearance-none pl-3.5 pr-8 py-2 text-xs sm:text-sm rounded-xl bg-white dark:bg-[#081220] border border-slate-200/90 dark:border-[#14233a] text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs cursor-pointer transition-all"
            >
              <option value="All Statuses">All Statuses</option>
              <option value="Online">Online</option>
              <option value="Warning">Warning</option>
              <option value="Offline">Offline</option>
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* ─── 3-Column Sites Grid (Matching screenshot pixel-for-pixel) ─── */}
      <div>
        {filteredSites.length === 0 ? (
          <div className="bg-white dark:bg-[#081220] rounded-2xl border border-slate-200/80 dark:border-[#14233a] p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Search size={22} />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">
              No sites found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              No carrier network sites matched your filter criteria.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedState("All States");
                setSelectedStatus("All Statuses");
              }}
              className="mt-4 px-4 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-400 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSites.map((site, idx) => (
              <SiteInsightCard
                key={site.id}
                site={site}
                onInspectTopology={handleSelectSite}
                onClick={handleSelectSite}
                className="animate-fade-in"
                style={{
                  animationDelay: `${idx * 40}ms`,
                  animationFillMode: "both",
                } as React.CSSProperties}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
