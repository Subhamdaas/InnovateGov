"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Search,
  Building2,
  Calendar,
  ChevronRight,
  ArrowUpDown,
  FilterX,
  Sparkles,
  CheckCircle2,
  Clock,
  Award,
} from "lucide-react";
import { getApplications } from "@/lib/api";
import { Application, ApplicationStatus } from "@/types";
import { fadeInUp, staggerContainer } from "@/lib/motion";

type StatusTab = "ALL" | ApplicationStatus;

export default function ApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [activeTab, setActiveTab] = useState<StatusTab>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  const [, startTransition] = useTransition();

  // Debounce search query (~200ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      startTransition(() => {
        setDebouncedSearch(searchQuery);
      });
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await getApplications();
        setApplications(data);
      } catch (err) {
        console.error("Failed to load applications:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter applications based on tab and search
  const filteredApps = applications.filter((app) => {
    // Status tab filter
    if (activeTab !== "ALL" && app.status !== activeTab) {
      return false;
    }

    // Keyword search filter
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase().trim();
      const startupName = app.startup?.name?.toLowerCase() || "";
      const challengeTitle = app.challenge?.title?.toLowerCase() || "";
      const shortId = app.shortId.toLowerCase();
      const capability = app.startup?.capabilitySummary?.toLowerCase() || "";

      return (
        startupName.includes(q) ||
        challengeTitle.includes(q) ||
        shortId.includes(q) ||
        capability.includes(q)
      );
    }

    return true;
  });

  // Calculate tab counts
  const counts = {
    ALL: applications.length,
    UNDER_REVIEW: applications.filter((a) => a.status === "UNDER_REVIEW").length,
    EVALUATED: applications.filter((a) => a.status === "EVALUATED").length,
    SELECTED: applications.filter((a) => a.status === "SELECTED").length,
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case "SELECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#DCFCE7] text-[#16A34A] border border-emerald-200">
            <Award className="w-3.5 h-3.5" />
            <span>Selected</span>
          </span>
        );
      case "EVALUATED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-[#2F5FEA] border border-blue-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Evaluated</span>
          </span>
        );
      case "UNDER_REVIEW":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#D97706] border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            <span>Under Review</span>
          </span>
        );
    }
  };

  const formatDate = (isoStr: string) => {
    if (!isoStr) return "N/A";
    const date = new Date(isoStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. HEADER SECTION */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs"
      >
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-[#2F5FEA]" />
            <span>Applications</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review and track startup applications across all challenges.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/challenges"
            className="px-4 py-2.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all flex items-center gap-2 min-h-[44px]"
          >
            <span>View All Challenges</span>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </Link>
        </div>
      </motion.div>

      {/* 2. FILTERS & SEARCH ROW */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-4"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveTab("ALL")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 shrink-0 min-h-[44px] flex items-center gap-2 ${
                activeTab === "ALL"
                  ? "bg-[#16224B] text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span>All</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] ${
                  activeTab === "ALL"
                    ? "bg-white/20 text-white"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {counts.ALL}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("UNDER_REVIEW")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 shrink-0 min-h-[44px] flex items-center gap-2 ${
                activeTab === "UNDER_REVIEW"
                  ? "bg-[#FEF3C7] text-[#D97706] ring-2 ring-amber-400/50 shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700"
              }`}
            >
              <span>Under Review</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-200/80 text-amber-900">
                {counts.UNDER_REVIEW}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("EVALUATED")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 shrink-0 min-h-[44px] flex items-center gap-2 ${
                activeTab === "EVALUATED"
                  ? "bg-blue-100 text-[#2F5FEA] ring-2 ring-blue-400/50 shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700"
              }`}
            >
              <span>Evaluated</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-200/80 text-blue-900">
                {counts.EVALUATED}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("SELECTED")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 shrink-0 min-h-[44px] flex items-center gap-2 ${
                activeTab === "SELECTED"
                  ? "bg-[#DCFCE7] text-[#16A34A] ring-2 ring-emerald-400/50 shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
              }`}
            >
              <span>Selected</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-200/80 text-emerald-900">
                {counts.SELECTED}
              </span>
            </button>
          </div>

          {/* Keyword Search Input */}
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by startup or challenge..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2F5FEA]/30 focus:border-[#2F5FEA] transition-all bg-slate-50/50 min-h-[44px]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* 3. APPLICATION LIST / SKELETON */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-4 animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-6 bg-slate-200 rounded-full w-24" />
              </div>
              <div className="h-5 bg-slate-200 rounded w-2/3" />
              <div className="h-3 bg-slate-100 rounded w-full" />
              <div className="flex justify-between items-center pt-2">
                <div className="h-4 bg-slate-200 rounded w-20" />
                <div className="h-8 bg-slate-200 rounded-xl w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredApps.length === 0 ? (
        /* EMPTY STATE */
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="bg-white p-12 rounded-2xl border border-slate-200/80 text-center space-y-4 max-w-md mx-auto shadow-xs my-8"
        >
          <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <FilterX className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              No applications match this filter
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search criteria or switching status tabs.
            </p>
          </div>
          <button
            onClick={() => {
              setActiveTab("ALL");
              setSearchQuery("");
            }}
            className="px-4 py-2 text-xs font-bold text-[#2F5FEA] hover:bg-blue-50 rounded-xl transition-colors inline-flex items-center gap-1.5"
          >
            <span>Reset Filters</span>
          </button>
        </motion.div>
      ) : (
        /* LIST OF CARDS */
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredApps.map((app) => (
              <motion.div
                key={app.id}
                layout
                variants={fadeInUp}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                onClick={() => router.push(`/applications/${app.id}`)}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 group"
              >
                <div>
                  {/* Top Bar: Short ID & Status Pill */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                      {app.shortId}
                    </span>
                    {getStatusBadge(app.status)}
                  </div>

                  {/* Startup Name */}
                  <h3 className="font-extrabold text-base text-slate-900 group-hover:text-[#2F5FEA] transition-colors leading-snug">
                    {app.startup?.name}
                  </h3>

                  {/* Challenge Target */}
                  <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 mt-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{app.challenge?.title}</span>
                  </p>

                  {/* Capability Summary snippet */}
                  <p className="text-xs text-slate-500 mt-2.5 line-clamp-2 leading-relaxed">
                    {app.startup?.capabilitySummary}
                  </p>
                </div>

                {/* Footer Metadata & CTA */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1 text-slate-400 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Applied {formatDate(app.submittedAt)}</span>
                  </div>

                  <div className="flex items-center gap-1 text-[#2F5FEA] font-bold group-hover:translate-x-0.5 transition-transform">
                    <span>View Application</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
