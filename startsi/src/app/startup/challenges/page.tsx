"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Target,
  Search,
  Building2,
  Users,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Filter,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { useSessionStore } from "@/store/session";
import { getOpenChallengesForStartup } from "@/lib/api";
import { MOCK_DEPARTMENTS } from "@/lib/mock-data";
import { fadeInUp, staggerContainer } from "@/lib/motion";

interface StartupAnnotatedChallenge {
  id: string;
  departmentId: string;
  title: string;
  problemStatement: string;
  expectedOutcome: string;
  status: "DRAFT" | "ACTIVE" | "CLOSED";
  createdById: string;
  createdAt: string;
  hasApplied: boolean;
  departmentName: string;
  applicantCount: number;
}

export default function StartupChallengesPage() {
  const router = useRouter();
  const { currentUser, hasHydrated } = useSessionStore();

  const [challenges, setChallenges] = useState<StartupAnnotatedChallenge[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDept, setSelectedDept] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("OPEN"); // OPEN vs ALL (startups only see active)

  useEffect(() => {
    if (!hasHydrated) return;
    if (!currentUser) {
      router.push("/login");
      return;
    }

    const startupId = currentUser.startupId || "start-1";

    async function loadChallenges() {
      setLoading(true);
      const data = await getOpenChallengesForStartup(startupId);
      setChallenges(data);
      setLoading(false);
    }

    loadChallenges();
  }, [currentUser, hasHydrated, router]);

  if (!hasHydrated || !currentUser) {
    return (
      <div className="py-24 flex flex-col items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#2F5FEA] border-t-transparent animate-spin mb-3" />
        <p className="text-xs text-slate-400 font-medium">Loading challenge portal...</p>
      </div>
    );
  }

  // Filtered challenges logic
  const filteredChallenges = challenges.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.problemStatement.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept =
      selectedDept === "ALL" || item.departmentId === selectedDept;

    const matchesStatus =
      statusFilter === "ALL" || (statusFilter === "OPEN" && !item.hasApplied);

    return matchesSearch && matchesDept && matchesStatus;
  });

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
            <Target className="w-3.5 h-3.5" />
            <span>Government Problem Statements</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Browse Challenges
          </h1>
          <p className="text-sm text-slate-500 max-w-xl">
            Find active public sector problems you can solve with your technology and submit your proposal.
          </p>
        </div>
      </motion.div>

      {/* Filter and Search Bar Controls */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4"
      >
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search challenges by keyword or problem statement..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2F5FEA]/30 focus:border-[#2F5FEA] transition-all"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Department Dropdown Filter */}
          <div className="relative">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="py-2.5 pl-3.5 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2F5FEA]/30 cursor-pointer"
            >
              <option value="ALL">All Departments</option>
              {MOCK_DEPARTMENTS.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Tabs (All vs Open to Apply) */}
          <div className="flex items-center p-1 bg-slate-100/80 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setStatusFilter("OPEN")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === "OPEN"
                  ? "bg-[#2F5FEA] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Open to Apply
            </button>
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === "ALL"
                  ? "bg-[#2F5FEA] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Active ({challenges.length})
            </button>
          </div>
        </div>
      </motion.div>

      {/* Challenges Grid List */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#2F5FEA] border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-medium">Fetching active challenges...</p>
        </div>
      ) : filteredChallenges.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200/80 space-y-3">
          <Target className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Challenges Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search keywords or department filters.
          </p>
        </div>
      ) : (
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {filteredChallenges.map((item) => (
            <motion.div
              key={item.id}
              variants={fadeInUp}
              className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Department Badge & Status */}
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>{item.departmentName}</span>
                  </span>

                  {item.hasApplied ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Applied</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#2F5FEA] border border-blue-100">
                      <Sparkles className="w-3 h-3 text-blue-500" />
                      <span>Open for Proposals</span>
                    </span>
                  )}
                </div>

                {/* Challenge Title */}
                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight leading-snug">
                  {item.title}
                </h3>

                {/* Problem Statement Preview */}
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {item.problemStatement}
                </p>

                {/* Expected Outcome Highlight */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                  <span className="font-bold text-slate-700 block">Expected Outcome:</span>
                  <p className="text-slate-600 line-clamp-2">{item.expectedOutcome}</p>
                </div>
              </div>

              {/* Card Footer Info & CTA */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.applicantCount} applicants</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {item.hasApplied ? (
                  <button
                    disabled
                    className="py-2.5 px-4 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs flex items-center gap-1.5 cursor-not-allowed border border-slate-200"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Applied</span>
                  </button>
                ) : (
                  <Link
                    href={`/startup/challenges/${item.id}/apply`}
                    className="py-2.5 px-4 rounded-xl bg-[#2F5FEA] hover:bg-[#234BCB] text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
                  >
                    <span>Apply Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
