"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileText,
  Target,
  Rocket,
  Sparkles,
  ChevronRight,
  ArrowUpRight,
  Building2,
  Clock,
  CheckCircle2,
  PlusCircle,
  ShieldCheck,
  Award,
} from "lucide-react";
import { useSessionStore } from "@/store/session";
import {
  getStartupDashboardStats,
  getChallenges,
  getMyApplications,
} from "@/lib/api";
import { Application, Challenge } from "@/types";
import { fadeInUp, staggerContainer, useCountUp } from "@/lib/motion";

export default function StartupDashboardPage() {
  const router = useRouter();
  const { currentUser, hasHydrated } = useSessionStore();

  const [stats, setStats] = useState<{
    totalApplications: number;
    underReview: number;
    activePilots: number;
    bestMatchScore: number;
  } | null>(null);

  const [myApplications, setMyApplications] = useState<Application[]>([]);
  const [openChallenges, setOpenChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [greeting, setGreeting] = useState<string>("Good Morning");

  // Call custom hooks unconditionally at top level
  const totalAppsCount = useCountUp(stats?.totalApplications || 0, 800);
  const underReviewCount = useCountUp(stats?.underReview || 0, 800);
  const activePilotsCount = useCountUp(stats?.activePilots || 0, 800);
  const bestScoreCount = useCountUp(stats?.bestMatchScore || 0, 800);

  useEffect(() => {
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

    const startupId = currentUser.startupId || "start-1";

    async function fetchData() {
      setLoading(true);
      const [statsData, apps, challenges] = await Promise.all([
        getStartupDashboardStats(startupId),
        getMyApplications(startupId),
        getChallenges(),
      ]);

      setStats(statsData);
      setMyApplications(apps);

      // Filter active challenges that startup hasn't applied to yet
      const appliedChallengeIds = new Set(apps.map((a) => a.challengeId));
      const unappliedActive = challenges.filter(
        (c) => c.status === "ACTIVE" && !appliedChallengeIds.has(c.id)
      );
      setOpenChallenges(unappliedActive.length > 0 ? unappliedActive : challenges.slice(0, 3));

      setLoading(false);
    }

    fetchData();
  }, [currentUser, hasHydrated, router]);

  if (!hasHydrated || !currentUser) {
    return (
      <div className="py-24 flex flex-col items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#2F5FEA] border-t-transparent animate-spin mb-3" />
        <p className="text-xs text-slate-400 font-medium">Restoring founder session...</p>
      </div>
    );
  }

  const statCardsData = [
    {
      title: "My Applications",
      value: totalAppsCount,
      delta: "Total submitted",
      icon: FileText,
      bgColor: "bg-blue-100",
      textColor: "text-[#2F5FEA]",
      route: "/startup/applications",
    },
    {
      title: "Under Review",
      value: underReviewCount,
      delta: "In committee evaluation",
      icon: Clock,
      bgColor: "bg-amber-100",
      textColor: "text-amber-700",
      route: "/startup/applications",
    },
    {
      title: "Active Pilots",
      value: activePilotsCount,
      delta: "Field testing live",
      icon: Rocket,
      bgColor: "bg-emerald-100",
      textColor: "text-emerald-700",
      route: "/startup/pilots",
    },
    {
      title: "Best Match Score",
      value: `${bestScoreCount}%`,
      delta: "Top AI alignment",
      icon: Sparkles,
      bgColor: "bg-purple-100",
      textColor: "text-purple-700",
      route: "/startup/challenges",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SELECTED":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            Selected for Pilot
          </span>
        );
      case "EVALUATED":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
            Evaluated
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            Under Review
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Greeting Banner */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="p-6 lg:p-8 rounded-3xl bg-gradient-to-r from-[#16224B] via-[#1D2D63] to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden"
      >
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold backdrop-blur-xs border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>GreenTech Solutions Pvt. Ltd.</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {greeting}, {currentUser.name || "Founder"}
          </h1>
          <p className="text-sm text-slate-300 max-w-xl">
            Welcome to your founder workspace. Manage applications, track live pilots, and discover new government challenges.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <Link
            href="/startup/challenges"
            className="py-3 px-5 rounded-2xl bg-[#2F5FEA] hover:bg-[#234BCB] text-white font-bold text-xs shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2"
          >
            <Target className="w-4 h-4 text-amber-300" />
            <span>Browse Open Challenges</span>
          </Link>
        </div>
      </motion.div>

      {/* Stat Cards Grid */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
      >
        {statCardsData.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              variants={fadeInUp}
              onClick={() => router.push(stat.route)}
              className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {stat.title}
                  </span>
                  <div className={`p-2.5 rounded-xl ${stat.bgColor} ${stat.textColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {stat.value}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">{stat.delta}</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#2F5FEA] group-hover:translate-x-0.5 transition-all" />
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Main Content Grid: Recent Applications + Open Challenges */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): My Recent Applications */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between space-y-6"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                My Recent Applications
              </h2>
              <p className="text-xs text-slate-500">
                Track status and committee feedback on your active submissions.
              </p>
            </div>
            <Link
              href="/startup/applications"
              className="text-xs font-bold text-[#2F5FEA] hover:underline flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {myApplications.slice(0, 4).map((app) => (
              <div
                key={app.id}
                className="p-4 rounded-2xl border border-slate-100 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 transition-all flex items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold text-slate-400 font-mono">
                      {app.shortId}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {app.challenge?.title || "Urban Distribution Problem"}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Public Works Department</span>
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {getStatusBadge(app.status)}
                  <Link
                    href={`/startup/applications`}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right Column (5 cols): Open Challenges & Quick Actions */}
        <div className="lg:col-span-5 space-y-8">
          {/* Quick Actions Card */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-[#16224B] text-white shadow-xl space-y-4"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-300" />
              <h2 className="text-base font-extrabold tracking-tight">
                Quick Actions
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-2.5">
              <Link
                href="/startup/challenges"
                className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 font-bold text-xs text-slate-100 flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Target className="w-4 h-4 text-blue-400" />
                  <span>Browse Open Challenges</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                href="/startup/applications"
                className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 font-bold text-xs text-slate-100 flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-amber-300" />
                  <span>View My Applications</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                href="/startup/pilots"
                className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 font-bold text-xs text-slate-100 flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Rocket className="w-4 h-4 text-emerald-400" />
                  <span>View My Pilots</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>
          </motion.div>

          {/* Open Challenges You Can Apply To */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Open Challenges
              </h2>
              <Link
                href="/startup/challenges"
                className="text-xs font-bold text-[#2F5FEA] hover:underline"
              >
                Browse all
              </Link>
            </div>

            <div className="space-y-3">
              {openChallenges.slice(0, 3).map((chal) => (
                <div
                  key={chal.id}
                  className="p-3.5 rounded-2xl border border-slate-100 hover:border-blue-300 bg-slate-50/50 hover:bg-blue-50/20 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                      Active Problem
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      Open for Proposals
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 line-clamp-1">
                    {chal.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    {chal.problemStatement}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
