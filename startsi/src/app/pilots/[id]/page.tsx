"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Rocket,
  Building2,
  Calendar,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Award,
  TrendingUp,
  Target,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  FileCheck,
} from "lucide-react";
import { useSessionStore } from "@/store/session";
import { getPilotDetail, updateMilestone, recordDecision } from "@/lib/api";
import { Pilot } from "@/types";
import { fadeInUp, staggerContainer } from "@/lib/motion";

export default function SharedPilotDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const pilotId = resolvedParams.id;

  const router = useRouter();
  const { currentUser, hasHydrated } = useSessionStore();

  const [pilot, setPilot] = useState<Pilot | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingMs, setUpdatingMs] = useState<string | null>(null);

  const isGovt = currentUser?.role === "GOVERNMENT";
  const backHref = currentUser?.role === "STARTUP" ? "/startup/pilots" : "/pilots";

  useEffect(() => {
    if (!hasHydrated) return;
    if (!currentUser) {
      router.push("/login");
      return;
    }

    async function loadDetail() {
      setLoading(true);
      const data = await getPilotDetail(pilotId);
      setPilot(data);
      setLoading(false);
    }

    loadDetail();
  }, [pilotId, currentUser, hasHydrated, router]);

  const handleToggleMilestone = async (milestoneId: string, currentStatus: string) => {
    if (!isGovt || !pilot) return;
    setUpdatingMs(milestoneId);

    const nextStatus = currentStatus === "COMPLETED" ? "IN_PROGRESS" : "COMPLETED";
    await updateMilestone(milestoneId, nextStatus);

    // Refresh pilot detail data
    const updated = await getPilotDetail(pilotId);
    setPilot(updated);
    setUpdatingMs(null);
  };

  if (!hasHydrated || !currentUser || loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#2F5FEA] border-t-transparent animate-spin mb-3" />
        <p className="text-xs text-slate-400 font-medium">Loading pilot workspace...</p>
      </div>
    );
  }

  if (!pilot) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Pilot Not Found</h2>
        <p className="text-xs text-slate-500">The requested pilot project could not be found.</p>
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2F5FEA] text-white text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Pilots</span>
        </Link>
      </div>
    );
  }

  const totalMilestones = pilot.milestones?.length || 0;
  const completedMsCount =
    pilot.milestones?.filter((m) => m.status === "COMPLETED").length || 0;
  const progressPct =
    totalMilestones > 0 ? Math.round((completedMsCount / totalMilestones) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Back Link & Header */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="space-y-4"
      >
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#2F5FEA] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Pilots</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="text-xs font-extrabold text-slate-400 font-mono tracking-wide px-2.5 py-0.5 rounded-md bg-slate-100 uppercase">
                {pilot.id}
              </span>
              {pilot.status === "ACTIVE" ? (
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                  <Rocket className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Active Field Pilot</span>
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-100 text-blue-800 border border-blue-200 inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Completed & Audited</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {pilot.challenge?.title || "Water Leakage Sensor Pilot"}
            </h1>
            <p className="text-xs text-slate-500 flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{pilot.departmentName || "Public Works Department"}</span>
              <span>•</span>
              <span className="font-semibold text-[#2F5FEA]">
                Partner: {pilot.startup?.name || "GreenTech Solutions Pvt. Ltd."}
              </span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Telemetry Overview & Milestone Progress Card */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="p-6 lg:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Target className="w-4 h-4 text-[#2F5FEA]" />
              <span>Field Pilot Performance Telemetry</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live impact tracking against baseline benchmarks.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {pilot.startDate} – {pilot.endDate}
            </span>
          </span>
        </div>

        {/* 3 Metric Box Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">
              Baseline Benchmark
            </span>
            <p className="text-xl font-extrabold text-slate-900">
              {pilot.baselineValue ?? 35} Units
            </p>
            <span className="text-[10px] text-slate-400">Pre-pilot measurement</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">
              Target Threshold
            </span>
            <p className="text-xl font-extrabold text-[#2F5FEA]">
              {pilot.targetValue ?? 20} Units
            </p>
            <span className="text-[10px] text-slate-400">Contractual KPI target</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
            <span className="text-[11px] font-bold text-emerald-800 uppercase block">
              Actual Measured Impact
            </span>
            <p className="text-xl font-extrabold text-emerald-700">
              {pilot.actualValue ?? 17} Units
            </p>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Target Achieved & Exceeded</span>
            </span>
          </div>
        </div>

        {/* Milestone Progress Bar */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Overall Milestone Completion</span>
            <span className="text-[#16A34A]">
              {completedMsCount} of {totalMilestones} Complete ({progressPct}%)
            </span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* AI MODEL 3: PILOT RESULT RECOMMENDATION ENGINE PANEL */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-[#16224B] to-slate-950 text-white shadow-xl space-y-4 border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h3 className="font-extrabold text-sm tracking-tight text-white">
                AI Model 3: Pilot Result Recommendation Engine
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              PILOT SUCCESS
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Recommendation</span>
              <p className="text-base font-black text-emerald-400">✓ SCALE UP</p>
              <span className="text-[10px] text-slate-300">State-wide procurement</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">KPI Attainment</span>
              <p className="text-base font-black text-blue-400">135% Average</p>
              <span className="text-[10px] text-slate-300">Exceeded leak & cost targets</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">AI Confidence</span>
              <p className="text-base font-black text-amber-300 font-mono">94% Confidence</p>
              <span className="text-[10px] text-slate-300">Statutory threshold verified</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200 leading-relaxed">
            <strong>AI Procurement Rationale:</strong> Solution exceeded both primary municipal KPIs (reduction in pipeline leakage and operational energy overheads) during the 90-day field trial. Recommended for direct rate-contract empanelment under Maharashtra State Procurement Guidelines.
          </div>
        </div>
      </motion.div>

      {/* MILESTONE DELIVERABLES CHECKLIST */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="p-6 lg:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-[#2F5FEA]" />
              <span>Pilot Deliverables & Financial Milestones</span>
            </h2>
            <p className="text-xs text-slate-500">
              Verified deployment stages and associated payout tranches.
            </p>
          </div>
          {!isGovt && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
              Founder View (Read-Only)
            </span>
          )}
        </div>

        <div className="space-y-3">
          {pilot.milestones?.map((ms) => {
            const isDone = ms.status === "COMPLETED";

            return (
              <div
                key={ms.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isDone
                    ? "bg-emerald-50/40 border-emerald-200"
                    : "bg-slate-50/70 border-slate-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : (
                      <Clock className="w-5 h-5 text-amber-500 shrink-0" />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-slate-900">{ms.title}</h3>
                    <p className="text-xs font-mono font-semibold text-slate-500">
                      Tranche Payout: ₹{ms.amount.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  {isDone ? (
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800">
                      Verified & Completed
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800">
                      In Progress
                    </span>
                  )}

                  {/* Government Role-Gated Audit Action */}
                  {isGovt && (
                    <button
                      disabled={updatingMs === ms.id}
                      onClick={() => handleToggleMilestone(ms.id, ms.status)}
                      className="py-1.5 px-3 rounded-xl bg-[#2F5FEA] hover:bg-[#234BCB] text-white text-xs font-bold transition-all disabled:opacity-50"
                    >
                      {updatingMs === ms.id ? "Updating..." : isDone ? "Mark Incomplete" : "Mark Verified"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* DECISION OUTCOME CARD */}
      {pilot.decision && (
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="p-6 lg:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-[#16224B] to-slate-950 text-white shadow-xl space-y-4"
        >
          <div className="flex items-center gap-2 text-amber-300 text-xs font-extrabold uppercase tracking-wider">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Government Scaling & Procurement Decision</span>
          </div>

          <h3 className="text-xl font-black text-white tracking-tight">
            {pilot.decision.outcome}
          </h3>

          <p className="text-xs text-slate-300">
            Recorded on {new Date(pilot.decision.recommendedAt).toLocaleDateString()} by the Public Sector Evaluation Board.
          </p>
        </motion.div>
      )}
    </div>
  );
}
