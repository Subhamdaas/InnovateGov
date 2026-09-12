"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Rocket,
  ShieldCheck,
  FileText,
  Users,
  MapPin,
  Tag,
  Award,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { useSessionStore } from "@/store/session";
import { getMyApplicationDetail } from "@/lib/api";
import { Application } from "@/types";
import { fadeInUp, staggerContainer } from "@/lib/motion";

export default function StartupApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const applicationId = resolvedParams.id;

  const router = useRouter();
  const { currentUser, hasHydrated } = useSessionStore();

  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!currentUser) {
      router.push("/login");
      return;
    }

    const startupId = currentUser.startupId || "start-1";

    async function loadDetail() {
      setLoading(true);
      const app = await getMyApplicationDetail(startupId, applicationId);
      setApplication(app);
      setLoading(false);
    }

    loadDetail();
  }, [applicationId, currentUser, hasHydrated, router]);

  if (!hasHydrated || !currentUser || loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#2F5FEA] border-t-transparent animate-spin mb-3" />
        <p className="text-xs text-slate-400 font-medium">Loading application details...</p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Application Not Found</h2>
        <p className="text-xs text-slate-500">The requested application could not be found or does not belong to your account.</p>
        <Link
          href="/startup/applications"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2F5FEA] text-white text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Applications</span>
        </Link>
      </div>
    );
  }

  const isSelected = application.status === "SELECTED";
  const isEvaluated = application.status === "EVALUATED" || isSelected;
  const isUnderReview = application.status === "UNDER_REVIEW";

  // Founder Stepper Timeline Definition
  const steps = [
    {
      title: "Proposal Submitted",
      desc: new Date(application.submittedAt).toLocaleDateString(),
      status: "completed",
    },
    {
      title: "Under Committee Review",
      desc: isUnderReview ? "In Progress" : "Completed",
      status: isUnderReview ? "current" : "completed",
    },
    {
      title: "Technical Evaluation",
      desc: isEvaluated ? "Scored" : "Pending Score Release",
      status: isEvaluated ? "completed" : isUnderReview ? "pending" : "completed",
    },
    {
      title: "Pilot Selection",
      desc: isSelected ? "Selected for Pilot" : "Awaiting Final Decision",
      status: isSelected ? "completed" : "pending",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Back Link & Header */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="space-y-4"
      >
        <Link
          href="/startup/applications"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#2F5FEA] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to My Applications</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="text-xs font-extrabold text-slate-400 font-mono tracking-wide px-2.5 py-0.5 rounded-md bg-slate-100">
                {application.shortId}
              </span>
              {isSelected ? (
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Selected for Pilot</span>
                </span>
              ) : isEvaluated ? (
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-purple-100 text-purple-800 border border-purple-200 inline-flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Evaluated</span>
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Under Review</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {application.challenge?.title || "Urban Distribution Problem"}
            </h1>
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Public Works Department</span>
            </p>
          </div>

          {/* Action CTA: View Pilot if Selected */}
          {isSelected && (
            <Link
              href={`/startup/pilots/${application.pilot?.id || "pilot-1"}`}
              className="py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 shrink-0"
            >
              <Rocket className="w-4 h-4 text-emerald-200" />
              <span>View Pilot Project</span>
              <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
            </Link>
          )}
        </div>
      </motion.div>

      {/* FOUNDER STATUS TIMELINE STEPPER */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="p-6 lg:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6"
      >
        <h2 className="text-base font-extrabold text-slate-900 tracking-tight border-b border-slate-100 pb-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#2F5FEA]" />
          <span>Application Progress Timeline</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
          {steps.map((step, idx) => {
            const isDone = step.status === "completed";
            const isCurrent = step.status === "current";

            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isDone
                    ? "bg-emerald-50/50 border-emerald-200 text-slate-900"
                    : isCurrent
                    ? "bg-amber-50/60 border-amber-300 text-slate-900 shadow-sm"
                    : "bg-slate-50 border-slate-200 text-slate-400"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Step 0{idx + 1}
                  </span>
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : isCurrent ? (
                    <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="text-xs font-bold leading-snug">{step.title}</h3>
                  <p className="text-[11px] text-slate-500 font-medium">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* EVALUATION RESULT CARD (Shown if Evaluation exists & submitted) */}
      {application.evaluation && (
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="p-6 lg:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-[#16224B] to-slate-950 text-white shadow-xl space-y-6"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-500/30">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold tracking-tight">
                  Independent Committee Evaluation Score
                </h2>
                <p className="text-[11px] text-slate-400">
                  Official evaluation score assigned by government committee reviewers.
                </p>
              </div>
            </div>

            {/* Score Pill Badge */}
            <div className="px-4 py-2 rounded-2xl bg-white/10 border border-white/10 text-right">
              <span className="text-xs text-slate-400 font-medium block">Total Score</span>
              <span
                className={`text-2xl font-black ${
                  application.evaluation.totalScore >= 80
                    ? "text-emerald-400"
                    : "text-amber-400"
                }`}
              >
                {application.evaluation.totalScore.toFixed(1)} / 100
              </span>
            </div>
          </div>

          {/* Feedback Comment */}
          {application.evaluation.comment && (
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300 block">
                Reviewer Feedback Notes:
              </span>
              <p className="text-xs text-slate-300 italic leading-relaxed">
                &quot;{application.evaluation.comment}&quot;
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* YOUR SUBMISSION SUMMARY CARD */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="p-6 lg:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#2F5FEA]" />
            <span>Your Submitted Proposal Details</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">Read-Only Archive</span>
        </div>

        {/* Capability / Proposal Details */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Capability & Proposal Summary
          </span>
          <p className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed font-normal">
            {application.startup?.capabilitySummary ||
              "Acoustic sensor & AI/ML powered real-time water leakage detection network for urban distribution infrastructure."}
          </p>
        </div>

        {/* Metadata Grid: Team, Location, Sector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>Team Size</span>
            </span>
            <p className="text-sm font-bold text-slate-900">
              {application.startup?.teamSize || 18} Members
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Location</span>
            </span>
            <p className="text-sm font-bold text-slate-900">
              {application.startup?.location || "Pune, Maharashtra"}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <span>Sector Tags</span>
            </span>
            <div className="flex flex-wrap gap-1 pt-0.5">
              {(application.startup?.sectorTags || ["Water Tech", "IoT"]).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
