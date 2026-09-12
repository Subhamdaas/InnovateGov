"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
} from "lucide-react";
import { useSessionStore } from "@/store/session";
import { getMyPilots } from "@/lib/api";
import { Pilot, PilotStatus } from "@/types";
import { fadeInUp, staggerContainer } from "@/lib/motion";

type FilterTab = "ALL" | PilotStatus;

export default function StartupPilotsListPage() {
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

    const startupId = currentUser.startupId || "start-1";

    async function loadPilots() {
      setLoading(true);
      const data = await getMyPilots(startupId);
      setPilots(data);
      setLoading(false);
    }

    loadPilots();
  }, [currentUser, hasHydrated, router]);

  if (!hasHydrated || !currentUser) {
    return (
      <div className="py-24 flex flex-col items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#2F5FEA] border-t-transparent animate-spin mb-3" />
        <p className="text-xs text-slate-400 font-medium">Loading pilot programs...</p>
      </div>
    );
  }

  const totalCount = pilots.length;
  const activeCount = pilots.filter((p) => p.status === "ACTIVE").length;
  const completedCount = pilots.filter((p) => p.status === "COMPLETED").length;

  const filteredPilots = pilots.filter((p) => {
    if (activeTab === "ALL") return true;
    return p.status === activeTab;
  });

  const getStatusBadge = (status: PilotStatus) => {
    if (status === "ACTIVE") {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1.5">
          <Rocket className="w-3.5 h-3.5 text-emerald-600" />
          <span>Active Pilot</span>
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 inline-flex items-center gap-1.5">
        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
        <span>Completed</span>
      </span>
    );
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
            <Rocket className="w-3.5 h-3.5 text-emerald-600" />
            <span>Field Deployment Workspaces</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Pilots
          </h1>
          <p className="text-sm text-slate-500 max-w-xl">
            Track your active and completed government pilot deployment programs, milestone deliverables, and scale-up decisions.
          </p>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="flex items-center gap-2 overflow-x-auto pb-1"
      >
        <button
          onClick={() => setActiveTab("ALL")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 min-h-[44px] flex items-center gap-2 ${
            activeTab === "ALL"
              ? "bg-[#16224B] text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <span>All Pilots</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white">
            {totalCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("ACTIVE")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 min-h-[44px] flex items-center gap-2 ${
            activeTab === "ACTIVE"
              ? "bg-emerald-100 text-emerald-800 ring-2 ring-emerald-400/50 shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
          }`}
        >
          <span>Active</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-200 text-emerald-900">
            {activeCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("COMPLETED")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 min-h-[44px] flex items-center gap-2 ${
            activeTab === "COMPLETED"
              ? "bg-blue-100 text-blue-800 ring-2 ring-blue-400/50 shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700"
          }`}
        >
          <span>Completed</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-200 text-blue-900">
            {completedCount}
          </span>
        </button>
      </motion.div>

      {/* Pilots Grid List */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#2F5FEA] border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-medium">Fetching pilots...</p>
        </div>
      ) : filteredPilots.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200/80 space-y-3">
          <FilterX className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Pilots Match This Filter</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Switch tabs to view your active or completed pilot deployments.
          </p>
        </div>
      ) : (
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          {filteredPilots.map((pilot) => {
            const totalMilestones = pilot.milestones?.length || 0;
            const completedMsCount =
              pilot.milestones?.filter((m) => m.status === "COMPLETED").length || 0;
            const progressPct =
              totalMilestones > 0 ? Math.round((completedMsCount / totalMilestones) * 100) : 0;

            return (
              <motion.div
                key={pilot.id}
                variants={fadeInUp}
                onClick={() => router.push(`/pilots/${pilot.id}`)}
                className="bg-white p-6 rounded-3xl border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 truncate">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        {pilot.departmentName || "Public Works Department"}
                      </span>
                    </span>
                    {getStatusBadge(pilot.status)}
                  </div>

                  <h3 className="font-extrabold text-base text-slate-900 group-hover:text-[#2F5FEA] transition-colors leading-snug">
                    {pilot.challenge?.title || "Urban Sensor Pilot"}
                  </h3>

                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {pilot.startDate} – {pilot.endDate}
                    </span>
                  </div>

                  {pilot.status === "ACTIVE" ? (
                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                        <span className="text-[11px] text-slate-500">Milestone Progress</span>
                        <span className="text-emerald-700 font-bold">
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
                    <div className="pt-2">
                      {pilot.decision ? (
                        <div className="p-3 rounded-2xl bg-purple-50 border border-purple-100 flex items-center gap-2 text-xs font-bold text-purple-800">
                          <Award className="w-4 h-4 text-purple-600 shrink-0" />
                          <span className="line-clamp-1">{pilot.decision.outcome}</span>
                        </div>
                      ) : (
                        <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100 flex items-center gap-2 text-xs font-bold text-[#2F5FEA]">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>Completed & Audited</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#2F5FEA] font-bold group-hover:translate-x-0.5 transition-transform">
                  <span>View Pilot Workspace</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
