"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Target,
  FileText,
  Rocket,
  ClipboardCheck,
  Award,
  PlusCircle,
  ChevronRight,
  ArrowUpRight,
  Users,
  Clock,
  Sparkles,
  Building2,
} from "lucide-react";
import { useSessionStore } from "@/store/session";
import { getDashboardSummary } from "@/lib/api";
import { MOCK_DEPARTMENTS } from "@/lib/mock-data";
import { Challenge } from "@/types";
import { fadeInUp, staggerContainer, useCountUp } from "@/lib/motion";

export default function DashboardPage() {
  const router = useRouter();
  const { currentUser, hasHydrated } = useSessionStore();

  const [summary, setSummary] = useState<{
    totalChallenges: number;
    applications: number;
    activePilots: number;
    pendingEvaluations: number;
    scaleUpCandidates: number;
    recentChallenges: Challenge[];
  } | null>(null);

  const [loading, setLoading] = useState<boolean>(true);

  // Time-based greeting helper
  const [greeting, setGreeting] = useState<string>("Good Morning");

  // Call ALL custom hooks unconditionally at the top level BEFORE any early return
  const totalChalCount = useCountUp(summary?.totalChallenges || 0, 800);
  const appsCount = useCountUp(summary?.applications || 0, 800);
  const pilotsCount = useCountUp(summary?.activePilots || 0, 800);
  const evalsCount = useCountUp(summary?.pendingEvaluations || 0, 800);
  const scaleCount = useCountUp(summary?.scaleUpCandidates || 0, 800);

  useEffect(() => {
    // Wait for localStorage hydration before evaluating session
    if (!hasHydrated) return;

    if (!currentUser) {
      router.push("/login");
      return;
    }

    // Set time-based greeting
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    async function fetchSummary() {
      setLoading(false);
      const data = await getDashboardSummary();
      setSummary(data);
    }
    fetchSummary();
  }, [currentUser, hasHydrated, router]);

  // If waiting for hydration or unauthenticated, render minimal loader
  if (!hasHydrated || !currentUser) {
    return (
      <div className="py-24 flex flex-col items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#2F5FEA] border-t-transparent animate-spin mb-3" />
        <p className="text-xs text-slate-400 font-medium">Restoring session...</p>
      </div>
    );
  }

  const statCardsData = [
    {
      title: "Total Challenges",
      value: totalChalCount,
      delta: "↑ 2 this month",
      icon: Target,
      bgColor: "bg-blue-100",
      textColor: "text-[#2F5FEA]",
      route: "/challenges",
    },
    {
      title: "Applications Received",
      value: appsCount,
      delta: "↑ 12 this month",
      icon: FileText,
      bgColor: "bg-indigo-100",
      textColor: "text-[#2F5FEA]",
      route: "/applications",
    },
    {
      title: "Active Pilots",
      value: pilotsCount,
      delta: "↑ 1 this month",
      icon: Rocket,
      bgColor: "bg-[#DCFCE7]",
      textColor: "text-[#16A34A]",
      route: "/pilots",
    },
    {
      title: "Pending Evaluations",
      value: evalsCount,
      delta: "↑ 3 this month",
      icon: ClipboardCheck,
      bgColor: "bg-[#FEF3C7]",
      textColor: "text-[#D97706]",
      route: "/evaluations",
    },
    {
      title: "Scale-up Candidates",
      value: scaleCount,
      delta: "↑ 1 this month",
      icon: Award,
      bgColor: "bg-[#F3E8FF]",
      textColor: "text-[#7C3AED]",
      route: "/challenges?status=scale_up",
    },
  ];

  const quickActionsData = [
    {
      title: "Create New Challenge",
      subtitle: "Define a real problem statement & set goals",
      icon: PlusCircle,
      route: "/challenges/new",
      accentBg: "bg-blue-50 text-[#2F5FEA]",
    },
    {
      title: "View Applications",
      subtitle: "Review incoming startup proposals",
      icon: FileText,
      route: "/applications",
      accentBg: "bg-indigo-50 text-[#2F5FEA]",
    },
    {
      title: "View Evaluations",
      subtitle: "Check expert scoring & criteria weights",
      icon: ClipboardCheck,
      route: "/evaluations",
      accentBg: "bg-amber-50 text-[#D97706]",
    },
    {
      title: "Manage Pilots",
      subtitle: "Track milestone deliverables & telemetry",
      icon: Rocket,
      route: "/pilots",
      accentBg: "bg-emerald-50 text-[#16A34A]",
    },
  ];

  const getDeptName = (deptId: string) => {
    return (
      MOCK_DEPARTMENTS.find((d) => d.id === deptId)?.name ||
      "Public Works Department"
    );
  };

  const getChallengeDetails = (id: string, status: string) => {
    if (id === "chal-1") {
      return { applicants: 12, dueText: "Due in 15 days" };
    }
    if (id === "chal-2") {
      return { applicants: 8, dueText: "Due in 20 days" };
    }
    if (status === "DRAFT") {
      return { applicants: 0, dueText: "Not published" };
    }
    return { applicants: 5, dueText: "Due in 10 days" };
  };

  return (
    <div className="space-y-8 pb-12">
      {/* 1. GREETING ROW (fades in first) */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{greeting}, {currentUser.name}</span>
            <span className="text-xl">👋</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Here&apos;s what&apos;s happening with your innovation procurement journey today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/challenges/new"
            className="px-4 py-2.5 text-xs font-bold rounded-xl bg-[#2F5FEA] hover:bg-[#234BCB] text-white shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Challenge</span>
          </Link>
        </div>
      </motion.div>

      {/* 2. STAT CARDS GRID (5 across desktop, 2-3 tablet, 1 mobile) */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
      >
        {statCardsData.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              variants={fadeInUp}
              onClick={() => router.push(card.route)}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:-translate-y-0.5 hover:shadow-md hover:border-[#2F5FEA]/40 transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-slate-500 mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    {card.title}
                  </span>
                  <div
                    className={`w-9 h-9 rounded-xl ${card.bgColor} ${card.textColor} flex items-center justify-center shadow-inner`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {card.value}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-600 inline-flex items-center gap-1">
                  {card.delta}
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* 3. RECENT CHALLENGES & QUICK ACTIONS ROW */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* RECENT CHALLENGES PANEL (~60% width on desktop) */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="w-full lg:w-[62%] bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-5"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Recent Challenges</span>
                <Sparkles className="w-4 h-4 text-[#2F5FEA]" />
              </h2>
              <p className="text-xs text-slate-500">
                Active problem statements posted by departments
              </p>
            </div>
            <Link
              href="/challenges"
              className="text-xs font-bold text-[#2F5FEA] hover:underline flex items-center gap-1"
            >
              <span>View all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* List of Challenge Rows */}
          <motion.div variants={staggerContainer} className="space-y-3">
            {summary?.recentChallenges.map((chal) => {
              const details = getChallengeDetails(chal.id, chal.status);

              return (
                <motion.div
                  key={chal.id}
                  variants={fadeInUp}
                  onClick={() => router.push(`/challenges/${chal.id}/recommendations`)}
                  className="p-4 rounded-xl border border-slate-200/70 hover:border-blue-300 hover:bg-slate-50/80 transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-[#2F5FEA] transition-colors">
                        {chal.title}
                      </h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          chal.status === "ACTIVE"
                            ? "bg-[#DCFCE7] text-[#16A34A]"
                            : chal.status === "DRAFT"
                            ? "bg-[#F3F4F6] text-[#4B5563]"
                            : "bg-[#FEE2E2] text-[#DC2626]"
                        }`}
                      >
                        {chal.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{getDeptName(chal.departmentId)}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-700">
                        {details.applicants}
                      </span>
                      <span>applicants</span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{details.dueText}</span>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>

        {/* QUICK ACTIONS PANEL (~40% width on desktop) */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="w-full lg:w-[38%] bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5"
        >
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">
              Quick Actions
            </h2>
            <p className="text-xs text-slate-500">
              Key workflows and management controls
            </p>
          </div>

          {/* Compact Vertical List inside One Card */}
          <div className="space-y-2">
            {quickActionsData.map((action) => {
              const ActionIcon = action.icon;
              return (
                <motion.div
                  key={action.title}
                  whileHover={{ x: 4, backgroundColor: "rgba(248, 250, 252, 0.9)" }}
                  transition={{ duration: 0.18 }}
                  onClick={() => router.push(action.route)}
                  className="p-3.5 rounded-xl border border-slate-200/70 hover:border-blue-300 transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl ${action.accentBg} flex items-center justify-center shrink-0 shadow-xs`}
                    >
                      <ActionIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 group-hover:text-[#2F5FEA] transition-colors">
                        {action.title}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {action.subtitle}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
