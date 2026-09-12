"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardCheck,
  CheckCircle2,
  Clock,
  Building2,
  ChevronRight,
  User,
  Sparkles,
  FilterX,
  Target,
  Award,
} from "lucide-react";
import { getEvaluations } from "@/lib/api";
import { Evaluation, EvalStatus } from "@/types";
import { fadeInUp, staggerContainer, useCountUp } from "@/lib/motion";

type FilterTab = "ALL" | EvalStatus;

export default function EvaluationsPage() {
  const router = useRouter();

  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await getEvaluations();
        setEvaluations(data);
      } catch (err) {
        console.error("Failed to load evaluations:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalCount = evaluations.length;
  const draftCount = evaluations.filter((e) => e.status === "DRAFT").length;
  const submittedCount = evaluations.filter((e) => e.status === "SUBMITTED").length;

  const animTotal = useCountUp(totalCount, 800);
  const animDraft = useCountUp(draftCount, 800);
  const animSubmitted = useCountUp(submittedCount, 800);

  const filtered = evaluations.filter((e) => {
    if (activeTab === "ALL") return true;
    return e.status === activeTab;
  });

  const getScoreBadge = (score: number) => {
    const isPassing = score >= 60;
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
          isPassing
            ? "bg-[#DCFCE7] text-[#16A34A] border border-emerald-200"
            : "bg-[#FEF3C7] text-[#D97706] border border-amber-200"
        }`}
      >
        <Award className="w-3.5 h-3.5" />
        <span>Score: {score.toFixed(1)} / 100</span>
      </div>
    );
  };

  const getStatusBadge = (status: EvalStatus) => {
    if (status === "SUBMITTED") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#DCFCE7] text-[#16A34A] border border-emerald-200">
          <CheckCircle2 className="w-3 h-3" />
          <span>Submitted</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#D97706] border border-amber-200">
        <Clock className="w-3 h-3" />
        <span>Draft</span>
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
            <ClipboardCheck className="w-7 h-7 text-[#2F5FEA]" />
            <span>Evaluations</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track scoring progress across all submissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/challenges"
            className="px-4 py-2.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all flex items-center gap-2 min-h-[44px]"
          >
            <Target className="w-4 h-4 text-slate-500" />
            <span>Explore Challenges</span>
          </Link>
        </div>
      </motion.div>

      {/* 2. COMPACT STATS ROW (3 Cards) */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {/* Card 1: Total */}
        <motion.div
          variants={fadeInUp}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between"
        >
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Total Evaluations
            </span>
            <p className="text-2xl font-extrabold text-slate-900">{animTotal}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center shadow-inner">
            <ClipboardCheck className="w-5 h-5" />
          </div>
        </motion.div>

        {/* Card 2: Draft / Pending */}
        <motion.div
          variants={fadeInUp}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between"
        >
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Draft / In Progress
            </span>
            <p className="text-2xl font-extrabold text-slate-900">{animDraft}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shadow-inner">
            <Clock className="w-5 h-5" />
          </div>
        </motion.div>

        {/* Card 3: Submitted */}
        <motion.div
          variants={fadeInUp}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between"
        >
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Submitted
            </span>
            <p className="text-2xl font-extrabold text-slate-900">{animSubmitted}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shadow-inner">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </motion.div>
      </motion.div>

      {/* 3. FILTER TABS */}
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
          <span>All</span>
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
          onClick={() => setActiveTab("DRAFT")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 shrink-0 min-h-[44px] flex items-center gap-2 ${
            activeTab === "DRAFT"
              ? "bg-[#FEF3C7] text-[#D97706] ring-2 ring-amber-400/50 shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700"
          }`}
        >
          <span>Draft</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-200/80 text-amber-900">
            {draftCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("SUBMITTED")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 shrink-0 min-h-[44px] flex items-center gap-2 ${
            activeTab === "SUBMITTED"
              ? "bg-[#DCFCE7] text-[#16A34A] ring-2 ring-emerald-400/50 shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
          }`}
        >
          <span>Submitted</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-200/80 text-emerald-900">
            {submittedCount}
          </span>
        </button>
      </motion.div>

      {/* 4. EVALUATION LIST GRID */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((idx) => (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-4 animate-pulse"
            >
              <div className="flex justify-between items-center">
                <div className="h-5 bg-slate-200 rounded w-1/2" />
                <div className="h-6 bg-slate-200 rounded-full w-20" />
              </div>
              <div className="h-4 bg-slate-100 rounded w-3/4" />
              <div className="h-4 bg-slate-200 rounded w-1/3 pt-2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
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
              No evaluations match this filter
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Switch filter tabs or start evaluating a new startup submission.
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
        /* CARDS LIST */
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((item) => (
              <motion.div
                key={item.id}
                layout
                variants={fadeInUp}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                onClick={() =>
                  router.push(
                    `/challenges/${item.challengeId}/evaluate/${item.startupId}`
                  )
                }
                className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 group"
              >
                <div>
                  {/* Top Bar: Status Pill & Score Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    {getStatusBadge(item.status)}
                    {item.status === "SUBMITTED" ? (
                      getScoreBadge(item.totalScore)
                    ) : (
                      <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                        In Progress
                      </span>
                    )}
                  </div>

                  {/* Startup Name */}
                  <h3 className="font-extrabold text-base text-slate-900 group-hover:text-[#2F5FEA] transition-colors leading-snug">
                    {item.startup?.name}
                  </h3>

                  {/* Challenge Target */}
                  <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 mt-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{item.challenge?.title}</span>
                  </p>

                  {/* Evaluator Comment Snippet */}
                  {item.comment && (
                    <p className="text-xs text-slate-500 mt-2.5 line-clamp-2 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      &quot;{item.comment}&quot;
                    </p>
                  )}
                </div>

                {/* Footer Evaluator & CTA */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.evaluator?.name || "Dr. Priya Sharma"}</span>
                  </div>

                  <div className="flex items-center gap-1 text-[#2F5FEA] font-bold group-hover:translate-x-0.5 transition-transform">
                    <span>View Rubric</span>
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
