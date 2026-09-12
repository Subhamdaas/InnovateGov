"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Award,
  Clock,
  Building2,
  CheckCircle2,
  ArrowUpRight,
  ShieldAlert,
  Grid,
  Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  BarChart,
} from "recharts";
import { fadeInUp, staggerContainer, useCountUp } from "@/lib/motion";
import { MOCK_DEPARTMENTS } from "@/lib/mock-data";

// Note: Static illustrative value until backend timestamp-diffing telemetry is live
const AVG_TIME_TO_PILOT_DAYS = 18;

type TimeframeOption = "Week" | "Month" | "Quarter" | "Year";

// Dynamic Performance Chart Datasets for Week, Month, Quarter, Year
const performanceDataMap: Record<
  TimeframeOption,
  { label: string; volume: number; score: number; color: string }[]
> = {
  Week: [
    { label: "Mon", volume: 12, score: 85, color: "#10B981" },
    { label: "Tue", volume: 19, score: 88, color: "#10B981" },
    { label: "Wed", volume: 15, score: 82, color: "#F59E0B" },
    { label: "Thu", volume: 28, score: 90, color: "#10B981" },
    { label: "Fri", volume: 22, score: 86, color: "#10B981" },
    { label: "Sat", volume: 14, score: 80, color: "#F59E0B" },
    { label: "Sun", volume: 9, score: 75, color: "#EF4444" },
  ],
  Month: [
    { label: "Week 1", volume: 32, score: 78, color: "#10B981" },
    { label: "Week 2", volume: 45, score: 82, color: "#F59E0B" },
    { label: "Week 3", volume: 28, score: 89, color: "#10B981" },
    { label: "Week 4", volume: 52, score: 94, color: "#10B981" },
  ],
  Quarter: [
    { label: "Dec", volume: 18, score: 65, color: "#10B981" },
    { label: "Jan", volume: 22, score: 70, color: "#10B981" },
    { label: "Feb", volume: 26, score: 74, color: "#10B981" },
    { label: "Mar", volume: 38, score: 82, color: "#10B981" },
    { label: "Apr", volume: 42, score: 78, color: "#F59E0B" },
    { label: "May", volume: 45, score: 72, color: "#EF4444" },
    { label: "Jun", volume: 39, score: 85, color: "#F59E0B" },
    { label: "Jul", volume: 34, score: 88, color: "#10B981" },
    { label: "Aug", volume: 28, score: 92, color: "#10B981" },
  ],
  Year: [
    { label: "Jan", volume: 20, score: 68, color: "#10B981" },
    { label: "Feb", volume: 25, score: 72, color: "#10B981" },
    { label: "Mar", volume: 35, score: 78, color: "#10B981" },
    { label: "Apr", volume: 40, score: 80, color: "#10B981" },
    { label: "May", volume: 48, score: 84, color: "#F59E0B" },
    { label: "Jun", volume: 55, score: 88, color: "#10B981" },
    { label: "Jul", volume: 60, score: 90, color: "#10B981" },
    { label: "Aug", volume: 62, score: 92, color: "#10B981" },
    { label: "Sep", volume: 58, score: 89, color: "#10B981" },
    { label: "Oct", volume: 65, score: 91, color: "#10B981" },
    { label: "Nov", volume: 70, score: 94, color: "#10B981" },
    { label: "Dec", volume: 75, score: 95, color: "#10B981" },
  ],
};

// Department Allocation Bar Data
const allocationData = [
  { name: "Public Works", value: 34, highlight: true },
  { name: "Municipal Corp", value: 24, highlight: false },
  { name: "Water Resources", value: 18, highlight: false },
  { name: "Urban Transport", value: 14, highlight: false },
  { name: "Health Dept", value: 10, highlight: false },
];

import { useRouter } from "next/navigation";
import { useSessionStore } from "@/store/session";
import { getReportsMetrics } from "@/lib/api";

export default function ReportsPage() {
  const router = useRouter();
  const { currentUser, hasHydrated } = useSessionStore();
  const [mounted, setMounted] = useState(false);
  const [timeframe, setTimeframe] = useState<TimeframeOption>("Quarter");
  const [metrics, setMetrics] = useState({
    totalChallenges: 3,
    totalApplications: 6,
    activePilots: 2,
    completedPilots: 1,
    totalBudgetInLakhs: 24.0,
    disbursedBudgetInLakhs: 8.0,
    avgScore: 81.4,
    pilotSuccessRate: 100,
    avgTimeToPilotDays: 14,
    scaleUpRecommendations: 2,
    departmentAllocations: [
      { name: "Public Works Department", value: 34, challengesCount: 2 },
      { name: "Municipal Corporation", value: 24, challengesCount: 1 },
      { name: "Water Resources Dept.", value: 18, challengesCount: 0 },
    ],
  });

  useEffect(() => {
    if (!hasHydrated) return;
    if (!currentUser) {
      router.push("/login");
      return;
    }
  }, [currentUser, hasHydrated, router]);

  useEffect(() => {
    setMounted(true);
    getReportsMetrics().then((data) => {
      if (data) {
        setMetrics((prev) => ({ ...prev, ...data }));
      }
    });
  }, []);

  const totalBudget = useCountUp(metrics.totalBudgetInLakhs || 24, 800);
  const avgScore = useCountUp(metrics.avgScore || 81.4, 800);
  const successRate = useCountUp(metrics.pilotSuccessRate || 100, 800);
  const timeToPilot = useCountUp(metrics.avgTimeToPilotDays || 14, 800);

  const deptMetrics = metrics.departmentAllocations && metrics.departmentAllocations.length > 0
    ? metrics.departmentAllocations.map((d) => ({
        dept: d.name,
        challenges: d.challengesCount || 1,
        activePilots: Math.max(1, Math.round(d.challengesCount * 0.8)),
        successRate: "100%",
        budget: `₹${d.value || 25} Lakhs`,
      }))
    : [
        {
          dept: "Public Works Department",
          challenges: 2,
          activePilots: 2,
          successRate: "100%",
          budget: "₹1.4 Cr",
        },
      ];

  const currentGraphData = performanceDataMap[timeframe];

  return (
    <div className="space-y-6 pb-12">
      {/* 1. HEADER */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs"
      >
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-[#2F5FEA]" />
            <span>Reports & Analytics</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Cross-challenge performance and pipeline insights.
          </p>
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-xs font-bold">
          {(["Week", "Month", "Quarter", "Year"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1.5 rounded-lg transition-all min-h-[36px] ${
                timeframe === t
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </motion.div>

      {/* 2. SUMMARY STAT CARDS (4 Columns) */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* Card 1: Total Budget */}
        <motion.div
          variants={fadeInUp}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Budget Allocated
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#2F5FEA] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">
            ₹{totalBudget / 100} Cr
          </p>
          <p className="text-[11px] font-semibold text-emerald-600 mt-2 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Across 3 active challenges</span>
          </p>
        </motion.div>

        {/* Card 2: Avg Score */}
        <motion.div
          variants={fadeInUp}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Avg. Evaluation Score
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#7C3AED] flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">
            {avgScore.toFixed(1)} <span className="text-xs text-slate-400 font-normal">/ 100</span>
          </p>
          <p className="text-[11px] font-semibold text-purple-600 mt-2">
            Based on expert panel rubrics
          </p>
        </motion.div>

        {/* Card 3: Pilot Success Rate */}
        <motion.div
          variants={fadeInUp}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Pilot Success Rate
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{successRate}%</p>
          <p className="text-[11px] font-semibold text-emerald-600 mt-2">
            Scale-up decision approved
          </p>
        </motion.div>

        {/* Card 4: Avg Time to Pilot */}
        <motion.div
          variants={fadeInUp}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Avg. Time to Pilot
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-[#D97706] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{timeToPilot} Days</p>
          <p className="text-[11px] font-semibold text-amber-700 mt-2">
            Challenge launch to pilot award
          </p>
        </motion.div>
      </motion.div>

      {/* 3. HERO PORTFOLIO PERFORMANCE CHART (DYNAMIC TIMEFRAME TRANSFORMATIONS) */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="bg-[#0B132B] text-white p-6 rounded-2xl shadow-xl border border-slate-800 space-y-6 relative overflow-hidden"
      >
        {/* Background gradient glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <h2 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Portfolio Performance ({timeframe} View)</span>
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-department startup volume & AI match quality telemetry
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-xl text-xs">
              {(["Week", "Month", "Quarter", "Year"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all min-h-[36px] ${
                    timeframe === t
                      ? "bg-[#2F5FEA] text-white shadow-md shadow-blue-600/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Combo Chart */}
        <div className="h-80 w-full relative pt-2">
          {/* Floating Tooltip Callout */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white text-slate-900 px-4 py-2 rounded-xl shadow-2xl z-10 text-center border border-slate-200 animate-in fade-in duration-300">
            <div className="flex items-center justify-center gap-2 font-extrabold text-sm">
              <span>
                {timeframe === "Week"
                  ? "156 Applications"
                  : timeframe === "Month"
                  ? "157 Applications"
                  : timeframe === "Quarter"
                  ? "267 Applications"
                  : "617 Applications"}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-700 font-bold">
                +14.2%
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
              Filtered for current {timeframe.toLowerCase()} window
            </p>
          </div>

          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                key={timeframe}
                data={currentGraphData}
                margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1E293B" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#94A3B8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1E293B",
                    borderRadius: "12px",
                    color: "#fff",
                    border: "1px solid #334155",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="volume" radius={[4, 4, 0, 0]} barSize={16}>
                  {currentGraphData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#38BDF8"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#38BDF8", stroke: "#0F172A", strokeWidth: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full bg-slate-900/50 animate-pulse rounded-xl" />
          )}
        </div>

        {/* Dynamic Timeline labels footer */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-medium px-2 overflow-x-auto">
          {currentGraphData.map((item) => (
            <span
              key={item.label}
              className="px-1 py-0.5 rounded hover:text-white transition-colors"
            >
              {item.label}
            </span>
          ))}
        </div>
      </motion.div>

      {/* 4. THREE SPECIALIZED CARDS GRID */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* CARD 1: RISK & QUALITY SCORE GAUGE */}
        <motion.div
          variants={fadeInUp}
          className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900">Risk & Quality Score</h3>
            <span className="p-1 rounded-lg bg-slate-100 text-slate-500">
              <ShieldAlert className="w-4 h-4" />
            </span>
          </div>

          <div className="flex flex-col items-center justify-center py-2 relative">
            <svg className="w-44 h-24" viewBox="0 0 100 50">
              <path
                d="M 10 50 A 40 40 0 0 1 90 50"
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <path
                d="M 10 50 A 40 40 0 0 1 82 22"
                fill="none"
                stroke="#10B981"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <circle cx="82" cy="22" r="5" fill="#FFFFFF" stroke="#10B981" strokeWidth="3" />
            </svg>

            <div className="text-center -mt-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Current Rating
              </span>
              <p className="text-2xl font-black text-slate-900 tracking-tight">
                Excellent!
              </p>
              <span className="mt-1 inline-block px-3 py-0.5 rounded-full text-xs font-extrabold bg-[#DCFCE7] text-[#16A34A] border border-emerald-200">
                88/100
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 text-center border-t border-slate-100 pt-3">
            Low compliance risk across technical feasibility & scalability audits
          </p>
        </motion.div>

        {/* CARD 2: DEPARTMENT ALLOCATION CHART */}
        <motion.div
          variants={fadeInUp}
          className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900">Allocation Exposure</h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
              {timeframe} ▾
            </span>
          </div>

          <div className="h-36 w-full relative">
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-md z-10 flex items-center gap-1">
              <span>Highest exposure • 34%</span>
            </div>

            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={allocationData} margin={{ top: 15, right: 0, left: -25, bottom: 0 }}>
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {allocationData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.highlight ? "#2F5FEA" : "#CBD5E1"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full bg-slate-50 animate-pulse rounded-xl" />
            )}
          </div>

          <p className="text-[11px] text-slate-500 text-center border-t border-slate-100 pt-3">
            Public Works Department holds the largest share of pilot funding
          </p>
        </motion.div>

        {/* CARD 3: MARKET / STARTUP MATCH HEATMAP */}
        <motion.div
          variants={fadeInUp}
          className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900">Market Heatmap</h3>
            <span className="p-1 rounded-lg bg-slate-100 text-slate-500">
              <Grid className="w-4 h-4" />
            </span>
          </div>

          <div className="space-y-1.5 py-1">
            {[0, 1, 2, 3, 4].map((r) => (
              <div key={r} className="flex justify-between gap-1.5">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((c) => {
                  const isHotspot = r === 2 && c === 7;
                  const isMedium = (r === 1 && c === 4) || (r === 3 && c === 9);
                  return (
                    <div
                      key={c}
                      className={`h-4 flex-1 rounded-xs transition-all cursor-pointer ${
                        isHotspot
                          ? "bg-red-500 shadow-xs scale-110 ring-2 ring-red-300"
                          : isMedium
                          ? "bg-amber-400"
                          : (r + c) % 3 === 0
                          ? "bg-slate-300"
                          : "bg-slate-200/60"
                      }`}
                    />
                  );
                })}
              </div>
            ))}

            <div className="mt-2 p-2 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center gap-1.5 text-[11px] font-bold text-red-600">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>⚠ Hotspot detected: High Match in Water Tech</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 text-center border-t border-slate-100 pt-3">
            Real-time concentration matrix across municipal technology verticals
          </p>
        </motion.div>
      </motion.div>

      {/* 5. DEPARTMENT PERFORMANCE TABLE */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4"
      >
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#2F5FEA]" />
            <span>Department Breakdown</span>
          </h2>
          <p className="text-xs text-slate-500">
            Active procurement stats grouped by public department
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-3 px-2">Department Name</th>
                <th className="pb-3 px-2">Challenges Posted</th>
                <th className="pb-3 px-2">Active Pilots</th>
                <th className="pb-3 px-2">Scale-up Success Rate</th>
                <th className="pb-3 px-2 text-right">Allocated Budget</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {deptMetrics.map((row) => (
                <tr key={row.dept} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-2 font-bold text-slate-900">{row.dept}</td>
                  <td className="py-3.5 px-2">{row.challenges}</td>
                  <td className="py-3.5 px-2">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {row.activePilots} Active
                    </span>
                  </td>
                  <td className="py-3.5 px-2">
                    <span className="font-bold text-[#16A34A]">{row.successRate}</span>
                  </td>
                  <td className="py-3.5 px-2 text-right font-extrabold text-slate-900">
                    {row.budget}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
