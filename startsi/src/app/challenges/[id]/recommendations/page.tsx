"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Sparkles,
  RefreshCw,
  Building2,
  Users,
  MapPin,
  Calendar,
  CheckCircle2,
  CheckSquare,
  Square,
  X,
  ArrowRight,
  SlidersHorizontal,
  Info,
  Loader2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { useSessionStore } from "@/store/session";
import { getRecommendations } from "@/lib/api";
import { MOCK_CHALLENGES } from "@/lib/mock-data";
import { Recommendation } from "@/types";
import { fadeInUp, staggerContainer, scaleIn } from "@/lib/motion";

export default function StartupRecommendationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const challengeId = resolvedParams.id;

  const router = useRouter();
  const { currentUser, hasHydrated } = useSessionStore();

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isReRunning, setIsReRunning] = useState<boolean>(false);
  const [showCompareModal, setShowCompareModal] = useState<boolean>(false);
  const [limitWarning, setLimitWarning] = useState<string | null>(null);
  const [shakingId, setShakingId] = useState<string | null>(null);

  // Lookup challenge title from mock challenges
  const challenge = MOCK_CHALLENGES.find((c) => c.id === challengeId) || {
    id: challengeId,
    title: "Water Leakage Detection System",
  };

  useEffect(() => {
    if (!hasHydrated) return;
    if (!currentUser) {
      router.push("/login");
      return;
    }

    async function loadData() {
      setLoading(true);
      const data = await getRecommendations(challengeId);
      setRecommendations(data);
      setLoading(false);
    }
    loadData();
  }, [currentUser, hasHydrated, challengeId, router]);

  // Re-run matching with simulated 600ms skeleton state
  const handleRefreshMatches = async () => {
    setIsReRunning(true);
    setSelectedIds([]);
    await new Promise((resolve) => setTimeout(resolve, 600));
    const data = await getRecommendations(challengeId);
    setRecommendations(data);
    setIsReRunning(false);
  };

  // Toggle startup selection for compare mode (max 4)
  const toggleSelectStartup = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
      setLimitWarning(null);
    } else {
      if (selectedIds.length >= 4) {
        // Trigger shake animation and limit warning
        setShakingId(id);
        setLimitWarning("Compare up to 4 at a time");
        setTimeout(() => setShakingId(null), 500);
        setTimeout(() => setLimitWarning(null), 3000);
      } else {
        setSelectedIds((prev) => [...prev, id]);
        setLimitWarning(null);
      }
    }
  };

  // Select startup and route to evaluation
  const handleSelectAndEvaluate = (startupId: string) => {
    router.push(`/challenges/${challengeId}/evaluate/${startupId}`);
  };

  // Score color helper: green ≥85, blue 65-84, amber <65
  const getScoreBadgeClass = (score: number) => {
    if (score >= 85) return "bg-[#DCFCE7] text-[#16A34A] border-emerald-200";
    if (score >= 65) return "bg-[#EEF3FF] text-[#2F5FEA] border-blue-200";
    return "bg-[#FEF3C7] text-[#D97706] border-amber-200";
  };

  if (!hasHydrated || !currentUser) {
    return (
      <div className="py-24 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#2F5FEA] animate-spin mb-3" />
        <p className="text-xs text-slate-400 font-medium">Verifying session...</p>
      </div>
    );
  }

  const selectedRecommendations = recommendations.filter((r) =>
    selectedIds.includes(r.id)
  );

  // Highest score among selected recommendations for compare highlight
  const maxScore = Math.max(
    ...selectedRecommendations.map((r) => r.matchScore),
    0
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-28 relative">
      {/* HEADER SECTION */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="space-y-4 border-b border-slate-200/80 pb-6"
      >
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2F5FEA] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[#2F5FEA] bg-blue-50 px-2.5 py-1 rounded-md uppercase tracking-wider block w-fit mb-1.5">
              {challenge.title}
            </span>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>AI-Recommended Startups</span>
              <Sparkles className="w-6 h-6 text-[#7C3AED]" />
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {recommendations.length} matches found based on your problem statement
            </p>
          </div>

          <button
            onClick={handleRefreshMatches}
            disabled={isReRunning || loading}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all shadow-xs flex items-center gap-2 disabled:opacity-60 shrink-0"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-[#2F5FEA] ${
                isReRunning ? "animate-spin" : ""
              }`}
            />
            <span>Refresh Matches</span>
          </button>
        </div>
      </motion.div>

      {/* LIMIT WARNING TOAST */}
      <AnimatePresence>
        {limitWarning && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-bold flex items-center gap-2 w-fit mx-auto shadow-xs"
          >
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{limitWarning}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3 SKELETON CARDS LOADING SHIMMER STATE (no spinner overlay) */}
      {loading || isReRunning ? (
        <div className="space-y-4">
          {[1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4 animate-pulse relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 w-2/3">
                  <div className="w-5 h-5 bg-slate-200 rounded" />
                  <div className="h-5 bg-slate-200 rounded w-1/2" />
                </div>
                <div className="h-7 bg-slate-200 rounded-full w-24" />
              </div>
              <div className="flex gap-2">
                <div className="h-5 bg-slate-100 rounded w-16" />
                <div className="h-5 bg-slate-100 rounded w-20" />
              </div>
              <div className="h-4 bg-slate-200 rounded w-5/6" />
              <div className="h-12 bg-slate-100 rounded-xl w-full" />
              <div className="h-4 bg-slate-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : recommendations.length === 0 ? (
        /* EMPTY STATE */
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="p-12 bg-white rounded-2xl border border-slate-200/80 text-center space-y-3"
        >
          <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">
            No Startups Matched Yet
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click &quot;Refresh Matches&quot; to compute semantic alignment with the startup directory.
          </p>
        </motion.div>
      ) : (
        /* RECOMMENDATION CARDS LIST */
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="space-y-4"
        >
          {recommendations.map((rec) => {
            const startup = rec.startup;
            const isChecked = selectedIds.includes(rec.id);
            const isShaking = shakingId === rec.id;

            return (
              <motion.div
                key={rec.id}
                variants={fadeInUp}
                animate={
                  isShaking
                    ? { x: [-4, 4, -4, 4, 0] }
                    : { x: 0 }
                }
                transition={{ duration: 0.3 }}
                className={`p-6 bg-white rounded-2xl border transition-all duration-200 relative group shadow-xs hover:-translate-y-0.5 hover:shadow-md ${
                  isChecked
                    ? "ring-2 ring-[#2F5FEA] border-[#2F5FEA] bg-blue-50/20"
                    : "border-slate-200/80 hover:border-slate-300"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    {/* Top Row: Checkbox + Name + Match Badge */}
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => toggleSelectStartup(rec.id)}
                          className="p-0.5 text-slate-400 hover:text-slate-700 transition-colors focus:outline-none"
                          title={isChecked ? "Deselect" : "Select to compare"}
                        >
                          {isChecked ? (
                            <CheckSquare className="w-5 h-5 text-[#2F5FEA]" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-300 group-hover:text-slate-500" />
                          )}
                        </button>

                        <h3 className="font-extrabold text-lg text-slate-900">
                          {startup?.name}
                        </h3>
                      </div>

                      {/* Color-Coded Match Badge */}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-extrabold border shadow-2xs ${getScoreBadgeClass(
                          rec.matchScore
                        )}`}
                      >
                        {rec.matchScore}% Match
                      </span>
                    </div>

                    {/* Sector Tags */}
                    <div className="flex items-center gap-1.5 flex-wrap pl-8">
                      {startup?.sectorTags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200/60"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Capability Summary */}
                    <p className="text-sm text-slate-700 leading-relaxed font-normal pl-8 line-clamp-2">
                      {startup?.capabilitySummary}
                    </p>

                    {/* AI Match Reason (Visually Distinct Sparkle Box) */}
                    <div className="ml-8 p-3 rounded-xl bg-purple-50/60 border border-purple-100 text-xs italic text-purple-950 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-[#7C3AED] shrink-0 mt-0.5" />
                      <span>{rec.matchReason}</span>
                    </div>

                    {/* Metadata Row */}
                    <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap pl-8 pt-1">
                      {startup?.foundedYear && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          Founded {startup.foundedYear}
                        </span>
                      )}
                      {startup?.teamSize && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          {startup.teamSize} team members
                        </span>
                      )}
                      {startup?.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {startup.location}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Right Side */}
                  <div className="flex items-end justify-end md:self-center shrink-0 pt-2 md:pt-0">
                    <button
                      onClick={() =>
                        handleSelectAndEvaluate(startup?.id || "start-1")
                      }
                      className="px-4 py-2.5 rounded-xl bg-[#2F5FEA] hover:bg-[#234BCB] text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
                    >
                      <span>Select Startup</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* FLOATING ACTION BAR FOR COMPARE MODE (Slides up when >= 2 selected) */}
      <AnimatePresence>
        {selectedIds.length >= 2 && (
          <motion.div
            initial={{ y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 90, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#16224B] text-white px-6 py-3.5 rounded-2xl shadow-2xl z-40 flex items-center gap-6 border border-slate-700/80"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <SlidersHorizontal className="w-4 h-4 text-[#2F5FEA]" />
              <span>{selectedIds.length} selected</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedIds([])}
                className="text-xs text-slate-400 hover:text-white underline font-semibold transition-colors"
              >
                Clear
              </button>

              <button
                onClick={() => setShowCompareModal(true)}
                className="px-4 py-2 rounded-xl bg-[#2F5FEA] hover:bg-[#234BCB] text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <span>Compare Startups</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SIDE-BY-SIDE COMPARISON MODAL (scaleIn variant) */}
      <AnimatePresence>
        {showCompareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial="initial"
              animate="animate"
              exit="exit"
              variants={scaleIn}
              className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5 text-[#2F5FEA]" />
                    <span>Startup Side-by-Side Comparison</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Comparing {selectedRecommendations.length} selected startups for {challenge.title}
                  </p>
                </div>

                <button
                  onClick={() => setShowCompareModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Table Content */}
              <div className="p-6 overflow-x-auto overflow-y-auto flex-1">
                <table className="w-full text-left border-collapse text-xs min-w-[650px]">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="p-3 text-slate-400 font-semibold uppercase text-[10px] w-40">
                        Criteria
                      </th>
                      {selectedRecommendations.map((rec) => (
                        <th
                          key={rec.id}
                          className="p-3 font-extrabold text-slate-900 text-sm"
                        >
                          {rec.startup?.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {/* Row 1: Match Score */}
                    <tr>
                      <td className="p-3 font-bold text-slate-700 bg-slate-50/50">
                        Match Score
                      </td>
                      {selectedRecommendations.map((rec) => {
                        const isBest = rec.matchScore === maxScore;
                        return (
                          <td
                            key={rec.id}
                            className={`p-3 font-extrabold ${
                              isBest
                                ? "bg-[#DCFCE7] text-[#16A34A] rounded-lg"
                                : "text-slate-800"
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm">
                                {rec.matchScore}% Match
                              </span>
                              {isBest && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-600 text-white font-bold">
                                  Top Fit
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>

                    {/* Row 2: Sector Fit */}
                    <tr>
                      <td className="p-3 font-bold text-slate-700 bg-slate-50/50">
                        Sector Fit
                      </td>
                      {selectedRecommendations.map((rec) => (
                        <td key={rec.id} className="p-3">
                          <div className="flex items-center gap-1 flex-wrap">
                            {rec.startup?.sectorTags.map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 text-[10px] rounded bg-slate-100 text-slate-600 font-semibold"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Row 3: Team Size */}
                    <tr>
                      <td className="p-3 font-bold text-slate-700 bg-slate-50/50">
                        Team Size
                      </td>
                      {selectedRecommendations.map((rec) => (
                        <td key={rec.id} className="p-3 text-slate-800 font-medium">
                          {rec.startup?.teamSize} members
                        </td>
                      ))}
                    </tr>

                    {/* Row 4: Founded */}
                    <tr>
                      <td className="p-3 font-bold text-slate-700 bg-slate-50/50">
                        Founded
                      </td>
                      {selectedRecommendations.map((rec) => (
                        <td key={rec.id} className="p-3 text-slate-800 font-medium">
                          {rec.startup?.foundedYear || "N/A"}
                        </td>
                      ))}
                    </tr>

                    {/* Row 5: Location */}
                    <tr>
                      <td className="p-3 font-bold text-slate-700 bg-slate-50/50">
                        Location
                      </td>
                      {selectedRecommendations.map((rec) => (
                        <td key={rec.id} className="p-3 text-slate-800 font-medium">
                          {rec.startup?.location || "India"}
                        </td>
                      ))}
                    </tr>

                    {/* Row 6: Capability Summary */}
                    <tr>
                      <td className="p-3 font-bold text-slate-700 bg-slate-50/50">
                        Capability Summary
                      </td>
                      {selectedRecommendations.map((rec) => (
                        <td
                          key={rec.id}
                          className="p-3 text-slate-600 text-xs leading-relaxed"
                        >
                          {rec.startup?.capabilitySummary}
                        </td>
                      ))}
                    </tr>

                    {/* Action Row */}
                    <tr>
                      <td className="p-3 bg-slate-50/50" />
                      {selectedRecommendations.map((rec) => (
                        <td key={rec.id} className="p-3">
                          <button
                            onClick={() =>
                              handleSelectAndEvaluate(
                                rec.startup?.id || "start-1"
                              )
                            }
                            className="w-full py-2 px-3 bg-[#2F5FEA] hover:bg-[#234BCB] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1"
                          >
                            <span>Select Startup</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
                <button
                  onClick={() => setShowCompareModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/60 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
