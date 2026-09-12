"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rocket,
  Building2,
  Calendar,
  ChevronRight,
  Award,
  CheckCircle2,
  Clock,
  FilterX,
  PlusCircle,
  BarChart2,
} from "lucide-react";
import { getAllPilots } from "@/lib/api";
import { Pilot, PilotStatus } from "@/types";
import { fadeInUp, staggerContainer } from "@/lib/motion";
import { useSessionStore } from "@/store/session";

type FilterTab = "ALL" | PilotStatus;

export default function PilotsPage() {
  const router = useRouter();
  const { currentUser, hasHydrated } = useSessionStore();

  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");

  useEffect(() => {
    if (!hasHydrated) return;
    if (!currentUser) {
      router.push("/login");
      return;
    }
  }, [currentUser, hasHydrated, router]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await getAllPilots();
        setPilots(data);
      } catch (err) {
        console.error("Failed to load pilots:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalCount = pilots.length;
  const activeCount = pilots.filter((p) => p.status === "ACTIVE").length;
  const completedCount = pilots.filter((p) => p.status === "COMPLETED").length;

  const filteredPilots = pilots.filter((p) => {
    if (activeTab === "ALL") return true;
    return p.status === activeTab;
  });

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: PilotStatus) => {
    if (status === "ACTIVE") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#DCFCE7] text-[#16A34A] border border-emerald-200">
          <Rocket className="w-3.5 h-3.5" />
          <span>Active</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-[#2F5FEA] border border-blue-200">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Completed</span>
      </span>
    );
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
            <Rocket className="w-7 h-7 text-[#2F5FEA]" />
            <span>Pilots</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor active and completed pilot programs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/challenges"
            className="px-4 py-2.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all flex items-center gap-2 min-h-[44px]"
          >
            <span>View Challenges</span>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </Link>
        </div>
      </motion.div>

      {/* 2. FILTER TABS */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-2 overflow-x-auto scrollbar-none"
      >
        <button
          onClick={() => setActiveTab("ALL")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 shrink-0 min-h-[44px] flex items-center gap-2 ${
            activeTab === "ALL"
              ? "bg-[#16224B] text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <span>All Pilots</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] ${
              activeTab === "ALL"
                ? "bg-white/20 text-white"
                : "bg-slate-200 text-slate-700"
            }`}
          >
            {totalCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("ACTIVE")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 shrink-0 min-h-[44px] flex items-center gap-2 ${
            activeTab === "ACTIVE"
              ? "bg-[#DCFCE7] text-[#16A34A] ring-2 ring-emerald-400/50 shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
          }`}
        >
          <span>Active</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-200/80 text-emerald-900">
            {activeCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("COMPLETED")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 shrink-0 min-h-[44px] flex items-center gap-2 ${
            activeTab === "COMPLETED"
              ? "bg-blue-100 text-[#2F5FEA] ring-2 ring-blue-400/50 shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700"
          }`}
        >
          <span>Completed</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-200/80 text-blue-900">
            {completedCount}
          </span>
        </button>
      </motion.div>

      {/* 3. PILOTS LIST GRID */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-4 animate-pulse"
            >
              <div className="flex justify-between items-center">
                <div className="h-5 bg-slate-200 rounded w-1/2" />
                <div className="h-6 bg-slate-200 rounded-full w-20" />
              </div>
              <div className="h-4 bg-slate-100 rounded w-2/3" />
              <div className="h-3 bg-slate-200 rounded w-full pt-2" />
            </div>
          ))}
        </div>
      ) : filteredPilots.length === 0 ? (
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
              No pilots match this filter
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Switch filter tabs to view active or completed pilot projects.
            </p>
          </div>
          <button
            onClick={() => setActiveTab("ALL")}
            className="px-4 py-2 text-xs font-bold text-[#2F5FEA] hover:bg-blue-50 rounded-xl transition-colors inline-flex items-center gap-1.5"
          >
            <span>Reset Filter</span>
          </button>
        </motion.div>
      ) : (
        /* CARDS GRID */
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredPilots.map((pilot) => {
              const totalMilestones = pilot.milestones?.length || 0;
              const completedMsCount =
                pilot.milestones?.filter((m) => m.status === "COMPLETED").length ||
                0;
              const progressPct =
                totalMilestones > 0
                  ? Math.round((completedMsCount / totalMilestones) * 100)
                  : 0;

              return (
                <motion.div
                  key={pilot.id}
                  layout
                  variants={fadeInUp}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => router.push(`/pilots/${pilot.id}`)}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    {/* Top Row: Department & Status Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 truncate">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">
                          {pilot.departmentName || "Public Works Department"}
                        </span>
                      </span>
                      {getStatusBadge(pilot.status)}
                    </div>

                    {/* Challenge Title */}
                    <h3 className="font-extrabold text-base text-slate-900 group-hover:text-[#2F5FEA] transition-colors leading-snug">
                      {pilot.challenge?.title}
                    </h3>

                    {/* Startup Name */}
                    <p className="text-xs font-semibold text-[#2F5FEA] flex items-center gap-1">
                      <span>Partner: {pilot.startup?.name}</span>
                    </p>

                    {/* Date Range */}
                    <div className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {formatDate(pilot.startDate)} – {formatDate(pilot.endDate)}
                      </span>
                    </div>

                    {/* Progress or Outcome Section */}
                    {pilot.status === "ACTIVE" ? (
                      <div className="space-y-1.5 pt-2">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                          <span className="text-[11px] text-slate-500">
                            Milestone Progress
                          </span>
                          <span className="text-[#16A34A]">
                            {completedMsCount} of {totalMilestones} complete ({progressPct}%)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      /* COMPLETED PILOT OUTCOME BADGE */
                      <div className="pt-2">
                        {pilot.decision ? (
                          <div className="p-3 rounded-xl bg-purple-50 border border-purple-100 flex items-center gap-2.5 text-xs font-bold text-[#7C3AED]">
                            <Award className="w-4 h-4 shrink-0" />
                            <span className="line-clamp-1">
                              {pilot.decision.outcome}
                            </span>
                          </div>
                        ) : (
                          <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 flex items-center gap-2 text-xs font-bold text-[#2F5FEA]">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <span>Completed & Audited</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer CTA */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#2F5FEA] font-bold group-hover:translate-x-0.5 transition-transform">
                    <span>View Pilot Workspace</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
