"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileText,
  Search,
  Building2,
  Calendar,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Rocket,
  ArrowUpRight,
} from "lucide-react";
import { useSessionStore } from "@/store/session";
import { getMyApplications } from "@/lib/api";
import { Application } from "@/types";
import { fadeInUp, staggerContainer } from "@/lib/motion";

export default function StartupApplicationsListPage() {
  const router = useRouter();
  const { currentUser, hasHydrated } = useSessionStore();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusTab, setStatusTab] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    if (!hasHydrated) return;
    if (!currentUser) {
      router.push("/login");
      return;
    }

    const startupId = currentUser.startupId || "start-1";

    async function loadApplications() {
      setLoading(true);
      const apps = await getMyApplications(startupId);
      setApplications(apps);
      setLoading(false);
    }

    loadApplications();
  }, [currentUser, hasHydrated, router]);

  if (!hasHydrated || !currentUser) {
    return (
      <div className="py-24 flex flex-col items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#2F5FEA] border-t-transparent animate-spin mb-3" />
        <p className="text-xs text-slate-400 font-medium">Loading applications...</p>
      </div>
    );
  }

  // Filter applications by search and status tab
  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.shortId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.challenge?.title || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusTab === "ALL" || app.status === statusTab;

    return matchesSearch && matchesStatus;
  });

  const getStatusPill = (status: string) => {
    switch (status) {
      case "SELECTED":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Selected for Pilot</span>
          </span>
        );
      case "EVALUATED":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-purple-100 text-purple-800 border border-purple-200 inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Evaluated</span>
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Under Review</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5"
      >
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#2F5FEA] text-xs font-bold border border-blue-100">
            <FileText className="w-3.5 h-3.5" />
            <span>Founder Submissions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Applications
          </h1>
          <p className="text-sm text-slate-500 max-w-xl">
            Track the status of your submitted proposal packages, view evaluation feedback, and access pilot projects.
          </p>
        </div>

        <Link
          href="/startup/challenges"
          className="py-2.5 px-4 rounded-xl bg-[#2F5FEA] hover:bg-[#234BCB] text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 shrink-0 self-start md:self-auto"
        >
          <span>New Proposal</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </motion.div>

      {/* Filter Tabs & Search Controls */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4"
      >
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search applications by ID or challenge title..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2F5FEA]/30 focus:border-[#2F5FEA] transition-all"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center p-1 bg-slate-100/80 rounded-xl border border-slate-200/80 overflow-x-auto">
          {[
            { id: "ALL", label: "All Submissions" },
            { id: "UNDER_REVIEW", label: "Under Review" },
            { id: "EVALUATED", label: "Evaluated" },
            { id: "SELECTED", label: "Selected for Pilot" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                statusTab === tab.id
                  ? "bg-[#2F5FEA] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Applications List */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#2F5FEA] border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-medium">Fetching applications...</p>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200/80 space-y-3">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Applications Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven&apos;t submitted any proposals matching the selected filters.
          </p>
        </div>
      ) : (
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="space-y-4"
        >
          {filteredApps.map((app) => (
            <motion.div
              key={app.id}
              variants={fadeInUp}
              className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-extrabold text-slate-400 font-mono tracking-wide px-2.5 py-0.5 rounded-md bg-slate-100">
                    {app.shortId}
                  </span>
                  {getStatusPill(app.status)}
                </div>

                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight truncate">
                  {app.challenge?.title || "Urban Problem Statement"}
                </h3>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Public Works Department</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Submitted {new Date(app.submittedAt).toLocaleDateString()}</span>
                  </span>
                </div>
              </div>

              {/* View Action Button */}
              <div className="shrink-0 flex items-center gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                <Link
                  href={`/startup/applications/${app.id}`}
                  className="py-2.5 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200/70 text-slate-800 font-bold text-xs transition-all flex items-center gap-1.5"
                >
                  <span>View Details</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
