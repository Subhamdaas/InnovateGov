"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  PlusCircle,
  Search,
  Filter,
  Building2,
  Users,
  Clock,
  ArrowRight,
  Sparkles,
  Loader2,
  Tag,
  IndianRupee,
} from "lucide-react";
import { useSessionStore } from "@/store/session";
import { getChallenges } from "@/lib/api";
import { MOCK_DEPARTMENTS } from "@/lib/mock-data";
import { Challenge, ChallengeStatus } from "@/types";
import { fadeInUp, staggerContainer } from "@/lib/motion";

type FilterStatus = "ALL" | ChallengeStatus;

export default function ChallengesDirectoryPage() {
  const router = useRouter();
  const { currentUser, hasHydrated } = useSessionStore();

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters state
  const [activeTab, setActiveTab] = useState<FilterStatus>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDept, setSelectedDept] = useState<string>("ALL");
  const [showDeptFilter, setShowDeptFilter] = useState<boolean>(false);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!currentUser) {
      router.push("/login");
      return;
    }

    async function loadData() {
      setLoading(true);
      const data = await getChallenges();
      setChallenges(data);
      setLoading(false);
    }
    loadData();
  }, [currentUser, hasHydrated, router]);

  // Client-side filtered list
  const filteredChallenges = useMemo(() => {
    return challenges.filter((chal) => {
      // Status Filter
      if (activeTab !== "ALL" && chal.status !== activeTab) {
        return false;
      }
      // Department Filter
      if (selectedDept !== "ALL" && chal.departmentId !== selectedDept) {
        return false;
      }
      // Search Query Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = chal.title.toLowerCase().includes(query);
        const problemMatch = chal.problemStatement.toLowerCase().includes(query);
        if (!titleMatch && !problemMatch) return false;
      }
      return true;
    });
  }, [challenges, activeTab, selectedDept, searchQuery]);

  const getDeptName = (deptId: string) => {
    return (
      MOCK_DEPARTMENTS.find((d) => d.id === deptId)?.name ||
      "Public Works Department"
    );
  };

  const getMetadata = (id: string, status: ChallengeStatus) => {
    if (id === "chal-1") {
      return {
        budget: "₹50 Lakhs",
        applicants: 12,
        daysLeft: "15 days left",
        tags: ["IoT", "AI", "Smart City"],
      };
    }
    if (id === "chal-2") {
      return {
        budget: "₹30 Lakhs",
        applicants: 8,
        daysLeft: "20 days left",
        tags: ["Waste Management", "CleanTech"],
      };
    }
    if (id === "chal-3" || status === "DRAFT") {
      return {
        budget: "₹25 Lakhs",
        applicants: 0,
        daysLeft: "Not published",
        tags: ["AI", "Agri-Tech"],
      };
    }
    return {
      budget: "₹35 Lakhs",
      applicants: 5,
      daysLeft: "25 days left",
      tags: ["GovTech", "Innovation"],
    };
  };

  if (!hasHydrated || !currentUser) {
    return (
      <div className="py-24 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#2F5FEA] animate-spin mb-3" />
        <p className="text-xs text-slate-400 font-medium">Verifying session...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24">
      {/* HEADER SECTION */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-[#2F5FEA] flex items-center gap-1">
              <Target className="w-3.5 h-3.5" />
              Procurement Challenges Directory
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            Challenges
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage and track all posted problem statements across municipal departments.
          </p>
        </div>

        <Link
          href="/challenges/new"
          className="px-5 py-3 rounded-xl bg-[#2F5FEA] hover:bg-[#234BCB] text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 min-h-[44px] shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Challenge</span>
        </Link>
      </motion.div>

      {/* FILTERS & SEARCH ROW */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="space-y-4"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {(["ALL", "ACTIVE", "DRAFT", "CLOSED"] as FilterStatus[]).map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setActiveTab(status)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all min-h-[38px] ${
                    activeTab === status
                      ? "bg-[#2F5FEA] text-white shadow-sm"
                      : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/70"
                  }`}
                >
                  {status === "ALL" ? "All Statuses" : status}
                </button>
              )
            )}
          </div>

          {/* Search Input & Filter Dropdown Toggle */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by keyword..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2F5FEA]/30 transition-all min-h-[38px]"
              />
            </div>

            <button
              onClick={() => setShowDeptFilter(!showDeptFilter)}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-colors min-h-[38px] flex items-center gap-1.5 ${
                selectedDept !== "ALL"
                  ? "bg-blue-50 text-[#2F5FEA] border-blue-200"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filter</span>
            </button>
          </div>
        </div>

        {/* Department Filter Toggle Dropdown */}
        <AnimatePresence>
          {showDeptFilter && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-2"
            >
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Filter by Department
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedDept("ALL")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    selectedDept === "ALL"
                      ? "bg-[#2F5FEA] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  All Departments
                </button>
                {MOCK_DEPARTMENTS.map((dept) => (
                  <button
                    key={dept.id}
                    onClick={() => setSelectedDept(dept.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      selectedDept === dept.id
                        ? "bg-[#2F5FEA] text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {dept.name}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* CHALLENGES CARDS LIST */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4 animate-pulse"
            >
              <div className="h-5 bg-slate-200 rounded w-1/3" />
              <div className="h-4 bg-slate-100 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : filteredChallenges.length === 0 ? (
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="p-12 bg-white rounded-2xl border border-slate-200/80 text-center space-y-3"
        >
          <Target className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">
            No challenges match this filter
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search keyword or selecting a different status filter tab.
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="space-y-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredChallenges.map((chal) => {
              const meta = getMetadata(chal.id, chal.status);

              return (
                <motion.div
                  key={chal.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  onClick={() =>
                    router.push(`/challenges/${chal.id}/recommendations`)
                  }
                  className="p-6 bg-white rounded-2xl border border-slate-200/80 hover:border-blue-300 shadow-xs hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer space-y-4 group"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      {/* Top Row: Title + Status Pill */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-[#2F5FEA] transition-colors">
                          {chal.title}
                        </h3>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            chal.status === "ACTIVE"
                              ? "bg-[#DCFCE7] text-[#16A34A] border border-emerald-200"
                              : chal.status === "DRAFT"
                              ? "bg-[#F3F4F6] text-[#4B5563] border border-slate-200"
                              : "bg-[#FEE2E2] text-[#DC2626] border border-red-200"
                          }`}
                        >
                          {chal.status}
                        </span>
                      </div>

                      {/* Department */}
                      <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{getDeptName(chal.departmentId)}</span>
                      </p>

                      {/* Problem Statement Snippet */}
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                        {chal.problemStatement}
                      </p>

                      {/* Tags */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        {meta.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Metadata & View Action Right Side */}
                    <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 shrink-0">
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="font-extrabold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                          {meta.budget}
                        </span>

                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          {meta.applicants} applicants
                        </span>

                        <span className="flex items-center gap-1 text-slate-500">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {meta.daysLeft}
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/challenges/${chal.id}/recommendations`);
                        }}
                        className="px-4 py-2.5 rounded-xl bg-[#2F5FEA] hover:bg-[#234BCB] text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 min-h-[44px]"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
